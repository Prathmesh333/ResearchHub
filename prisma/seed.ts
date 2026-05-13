import bcrypt from "bcryptjs";
import { PrismaClient, Role, TaskPriority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const memberPassword = await bcrypt.hash("member123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ethara.dev" },
    update: {},
    create: {
      name: "Admin Lead",
      email: "admin@ethara.dev",
      password: adminPassword,
      role: Role.Admin
    }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@ethara.dev" },
    update: {},
    create: {
      name: "Research Member",
      email: "member@ethara.dev",
      password: memberPassword,
      role: Role.Member
    }
  });

  const project = await prisma.project.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Climate Impact Study",
      description: "Sample research project for local setup and demos.",
      creatorId: admin.id
    }
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: member.id
      }
    },
    update: {},
    create: {
      projectId: project.id,
      userId: member.id
    }
  });

  const existingTask = await prisma.task.findFirst({
    where: { projectId: project.id, title: "Prepare literature review" }
  });

  if (!existingTask) {
    await prisma.task.create({
      data: {
        title: "Prepare literature review",
        description: "Collect and summarize the latest related publications.",
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assignedUserId: member.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
