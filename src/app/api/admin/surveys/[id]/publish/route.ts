import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const publish = body.publish !== false;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: true },
  });
  if (!survey) {
    return NextResponse.json({ error: "问卷不存在" }, { status: 404 });
  }
  if (publish && survey.questions.length === 0) {
    return NextResponse.json({ error: "请至少添加一道题再发布" }, { status: 400 });
  }

  const updated = await prisma.survey.update({
    where: { id },
    data: { status: publish ? "published" : "draft" },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(updated);
}
