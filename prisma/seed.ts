import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/asl_alwujud?schema=public",
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const adminEmail = "admin@asl-alwujud.local";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "المشرف",
      email: adminEmail,
      role: "ADMIN",
      passwordHash: hashPassword("admin123"),
    },
  });
  console.log(`✔ Seeded admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
