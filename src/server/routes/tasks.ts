import { Router } from "express";
import { Prisma, Role, TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { prisma } from "../prisma.js";

const router = Router();

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(5000).optional()
);

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().uuid("A valid id is required").optional()
);

const nullableUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().uuid("A valid id is required").nullable().optional()
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Due date must be a valid date")
    .optional()
);

const nullableDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Due date must be a valid date")
    .nullable()
    .optional()
);

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: optionalText,
  projectId: z.string().uuid("A valid project id is required"),
  assignedUserId: optionalUuid,
  dueDate: optionalDate,
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM)
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").optional(),
  description: optionalText,
  assignedUserId: nullableUuid,
  dueDate: nullableDate,
  priority: z.nativeEnum(TaskPriority).optional()
});

const statusSchema = z.object({
  status: z.nativeEnum(TaskStatus)
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true
} as const;

const taskInclude = {
  project: {
    select: {
      id: true,
      name: true
    }
  },
  assignedUser: {
    select: userSelect
  }
};

async function ensureProjectMember(projectId: string, userId: string) {
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    },
    update: {},
    create: {
      projectId,
      userId
    }
  });
}

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const user = req.user!;
    const tasks = await prisma.task.findMany({
      where: user.role === Role.Admin ? {} : { assignedUserId: user.id },
      include: taskInclude,
      orderBy: { updatedAt: "desc" }
    });

    return res.json({ tasks });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAdmin, validateBody(createTaskSchema), async (req, res, next) => {
  try {
    const { title, description, projectId, assignedUserId, dueDate, priority } =
      req.body as z.infer<typeof createTaskSchema>;

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (assignedUserId) {
      const user = await prisma.user.findUnique({ where: { id: assignedUserId } });

      if (!user) {
        return res.status(404).json({ message: "Assigned user not found" });
      }

      await ensureProjectMember(projectId, assignedUserId);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedUserId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined
      },
      include: taskInclude
    });

    return res.status(201).json({ task });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = req.user!;
    const task = await prisma.task.findFirst({
      where:
        user.role === Role.Admin
          ? { id: req.params.id }
          : {
              id: req.params.id,
              assignedUserId: user.id
            },
      include: taskInclude
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    return res.json({ task });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAdmin, validateBody(updateTaskSchema), async (req, res, next) => {
  try {
    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, assignedUserId, dueDate, priority } =
      req.body as z.infer<typeof updateTaskSchema>;
    const data: Prisma.TaskUncheckedUpdateInput = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate === null ? null : new Date(dueDate);

    if (assignedUserId !== undefined) {
      if (assignedUserId === null) {
        data.assignedUserId = null;
      } else {
        const user = await prisma.user.findUnique({ where: { id: assignedUserId } });

        if (!user) {
          return res.status(404).json({ message: "Assigned user not found" });
        }

        await ensureProjectMember(existingTask.projectId, assignedUserId);
        data.assignedUserId = assignedUserId;
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: taskInclude
    });

    return res.json({ task });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/status", validateBody(statusSchema), async (req, res, next) => {
  try {
    const { status } = req.body as z.infer<typeof statusSchema>;
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user!.role === Role.Member && task.assignedUserId !== req.user!.id) {
      return res.status(403).json({ message: "You can only update assigned tasks" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status },
      include: taskInclude
    });

    return res.json({ task: updatedTask });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    return res.json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
});

export default router;
