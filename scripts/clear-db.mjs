import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
await prisma.response.deleteMany();
await prisma.question.deleteMany();
await prisma.survey.deleteMany();
console.log("cleared");
await prisma.$disconnect();
