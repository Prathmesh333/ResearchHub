import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role, type User } from "@prisma/client";
import { prisma } from "../prisma.js";
import type { AuthUser } from "../types.js";

type TokenPayload = {
  userId: string;
  name: string;
  email: string;
  role: Role;
};

export function jwtSecret() {
  return process.env.JWT_SECRET || "development-secret-change-me";
}

export function publicUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export function signToken(user: User) {
  const payload: TokenPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, jwtSecret(), { expiresIn: "7d" });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, jwtSecret()) as TokenPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = publicUser(user);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== Role.Admin) {
    return res.status(403).json({ message: "Admin access is required" });
  }

  return next();
}
