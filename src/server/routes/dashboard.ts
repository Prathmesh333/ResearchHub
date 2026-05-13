import { Router } from "express";
import { Prisma, Role, TaskStatus } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/stats", authenticate, async (req, res, next) => {
  try {
    const user = req.user!;
    const projectWhere: Prisma.ProjectWhereInput =
      user.role === Role.Admin
        ? {}
        : {
            members: {
              some: { userId: user.id }
            }
          };

    const taskWhere: Prisma.TaskWhereInput =
      user.role === Role.Admin ? {} : { assignedUserId: user.id };

    const [
      totalProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    ] = await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.TODO } }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.COMPLETED } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.COMPLETED }
        }
      })
    ]);

    const projectProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return res.json({
      stats: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        projectProgress
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
