import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { QuestionInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { responses: true } },
    },
  });
  if (!survey) {
    return NextResponse.json({ error: "问卷不存在" }, { status: 404 });
  }
  return NextResponse.json(survey);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.survey.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "问卷不存在" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const title = body.title.trim();
  const description =
    typeof body.description === "string" ? body.description : "";
  const status =
    body.status === "published" || body.status === "draft"
      ? body.status
      : existing.status;
  const questions: QuestionInput[] = Array.isArray(body.questions)
    ? body.questions
    : [];

  const survey = await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany({ where: { surveyId: id } });
    return tx.survey.update({
      where: { id },
      data: {
        title,
        description,
        status,
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
  });

  return NextResponse.json(survey);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.survey.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "问卷不存在" }, { status: 404 });
  }
  await prisma.survey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
