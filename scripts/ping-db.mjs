import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  const c = await p.survey.count();
  console.log("db ok surveys=", c);
} catch (e) {
  console.log("db err", e.message);
} finally {
  await p.$disconnect();
}
