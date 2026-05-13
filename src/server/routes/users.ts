import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/", authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

export default router;
