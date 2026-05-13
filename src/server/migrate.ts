import "dotenv/config";
import { execFileSync } from "node:child_process";

console.log("Running database migrations...");
console.log("Environment check:");
console.log("- NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("- RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT || "not set");
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "✓ SET" : "✗ NOT SET");

// List all environment variables that start with DATABASE or POSTGRES (for debugging)
const dbVars = Object.keys(process.env).filter(key => 
  key.includes("DATABASE") || key.includes("POSTGRES")
);
if (dbVars.length > 0) {
  console.log("- Found database-related variables:", dbVars.join(", "));
} else {
  console.log("- No database-related variables found in environment");
}

try {
  if (!process.env.DATABASE_URL) {
    console.error("\n❌ DATABASE_URL environment variable is not set");
    console.error("\nPlease set DATABASE_URL in Railway:");
    console.error("1. Go to your app service in Railway dashboard");
    console.error("2. Click 'Variables' tab");
    console.error("3. Add: DATABASE_URL = ${{Postgres.DATABASE_URL}}");
    console.error("4. Redeploy the service\n");
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("✓ DATABASE_URL is configured");
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";

  console.log("Running Prisma migrations...");
  execFileSync(npx, ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env
  });

  console.log("✓ Migrations completed successfully");
} catch (error) {
  console.error("\n❌ Migration failed:", error);
  process.exit(1);
}
