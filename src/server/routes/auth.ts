import { Router } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authenticate, publicUser, signToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role).optional().default(Role.Member)
});

const loginSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

router.post("/signup", validateBody(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body as z.infer<typeof signupSchema>;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    return res.status(201).json({
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const matches = await bcrypt.compare(password, user.password);

    if (!matches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
