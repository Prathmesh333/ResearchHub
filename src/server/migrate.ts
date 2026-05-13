import "dotenv/config";
import { execFileSync } from "node:child_process";

console.log("Running database migrations...");

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("DATABASE_URL is configured");
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";

  execFileSync(npx, ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env
  });

  console.log("Migrations completed successfully");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
