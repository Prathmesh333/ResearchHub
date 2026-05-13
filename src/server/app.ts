import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import userRoutes from "./routes/users.js";

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientPath = path.resolve(dirname, "../client");
  const indexPath = path.join(clientPath, "index.html");

  if (fs.existsSync(indexPath)) {
    app.use(express.static(clientPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }

      return res.sendFile(indexPath);
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
