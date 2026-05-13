import "dotenv/config";
import { createApp } from "./app.js";
import { prisma } from "./prisma.js";

const port = Number(process.env.PORT || 5000);
const app = createApp();

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
