import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseOptions, validateAnswers } from "@/lib/survey";
import type { AnswersMap } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey || survey.status !== "published") {
    return NextResponse.json({ error: "问卷不存在或未发布" }, { status: 404 });
  }

  return NextResponse.json({
    id: survey.id,
    title: survey.title,
    description: survey.description,
    slug: survey.slug,
    questions: survey.questions.map((q) => ({
      id: q.id,
      type: q.type,
      title: q.title,
      required: q.required,
      options: parseOptions(q.options),
      order: q.order,
    })),
  });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey || survey.status !== "published") {
    return NextResponse.json({ error: "问卷不存在或未发布" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const answers = (body?.answers || {}) as AnswersMap;
  const error = validateAnswers(survey.questions, answers);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") || undefined;

  await prisma.response.create({
    data: {
      surveyId: survey.id,
      answers: JSON.stringify(answers),
      userAgent,
    },
  });

  return NextResponse.json({ ok: true });
}
