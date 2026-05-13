import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { prisma } from "../prisma.js";

const router = Router();

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional()
);

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: optionalText
});

const memberSchema = z.object({
  userId: z.string().uuid("A valid user id is required")
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true
} as const;

const projectDetailInclude = {
  creator: { select: userSelect },
  members: {
    include: {
      user: { select: userSelect }
    },
    orderBy: { createdAt: "asc" as const }
  },
  tasks: {
    include: {
      assignedUser: { select: userSelect }
    },
    orderBy: { createdAt: "desc" as const }
  }
};

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const user = req.user!;
    const projects = await prisma.project.findMany({
      where:
        user.role === Role.Admin
          ? {}
          : {
              members: {
                some: { userId: user.id }
              }
            },
      include: {
        creator: { select: userSelect },
        members: {
          include: {
            user: { select: userSelect }
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return res.json({ projects });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAdmin, validateBody(projectSchema), async (req, res, next) => {
  try {
    const { name, description } = req.body as z.infer<typeof projectSchema>;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        creatorId: req.user!.id
      },
      include: projectDetailInclude
    });

    return res.status(201).json({ project });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = req.user!;
    const project = await prisma.project.findFirst({
      where:
        user.role === Role.Admin
          ? { id: req.params.id }
          : {
              id: req.params.id,
              members: {
                some: { userId: user.id }
              }
            },
      include: projectDetailInclude
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or access denied" });
    }

    return res.json({ project });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAdmin, validateBody(projectSchema), async (req, res, next) => {
  try {
    const existingProject = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { name, description } = req.body as z.infer<typeof projectSchema>;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name,
        description
      },
      include: projectDetailInclude
    });

    return res.json({ project });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const existingProject = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    return res.json({ message: "Project deleted" });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/members", requireAdmin, validateBody(memberSchema), async (req, res, next) => {
  try {
    const { userId } = req.body as z.infer<typeof memberSchema>;
    const [project, user] = await Promise.all([
      prisma.project.findUnique({ where: { id: req.params.id } }),
      prisma.user.findUnique({ where: { id: userId } })
    ]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId
        }
      },
      update: {},
      create: {
        projectId: project.id,
        userId
      },
      include: {
        user: { select: userSelect }
      }
    });

    return res.status(201).json({ member });
  } catch (error) {
    return next(error);
  }
});

export default router;
