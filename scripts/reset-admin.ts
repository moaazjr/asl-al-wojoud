import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";

const [emailArg, password] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();

if (!email || !password) {
  console.error("Usage: npm run admin:reset -- <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: process.env.DATABASE_DRIVER === "neon-ws"
  ? new PrismaNeon({ connectionString: url })
  : new PrismaPg({ connectionString: url }) });

function hashPassword(value: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(value, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const passwordHash = hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { name: "المشرف", email, role: "ADMIN", passwordHash },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  const host = new URL(url as string).host;
  console.log(`✔ Admin ready: ${user.email} (role ADMIN) on ${host}. Existing sessions revoked.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
