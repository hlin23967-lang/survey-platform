import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugifyTitle } from "@/lib/slug";
import type { QuestionInput } from "@/lib/types";

export async function GET() {
  const surveys = await prisma.survey.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { responses: true, questions: true } },
    },
  });
  return NextResponse.json(surveys);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const title = body.title.trim();
  const description =
    typeof body.description === "string" ? body.description : "";
  const questions: QuestionInput[] = Array.isArray(body.questions)
    ? body.questions
    : [];

  const survey = await prisma.survey.create({
    data: {
      title,
      description,
      slug: slugifyTitle(title),
      status: "draft",
      questions: {
        create: questions.map((q, index) => ({
          type: q.type || "text",
          title: q.title || `问题 ${index + 1}`,
          required: q.required !== false,
          options: JSON.stringify(q.options || []),
          order: q.order ?? index,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(survey, { status: 201 });
}
