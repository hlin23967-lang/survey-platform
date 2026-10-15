import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnswers, parseOptions, formatAnswerDisplay } from "@/lib/survey";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "问卷不存在" }, { status: 404 });
  }

  if (format === "csv") {
    const header = [
      "提交时间",
      ...survey.questions.map((q) => q.title),
      "User-Agent",
    ];
    const rows = survey.responses.map((r) => {
      const answers = parseAnswers(r.answers);
      return [
        new Date(r.createdAt).toISOString(),
        ...survey.questions.map((q) =>
          escapeCsv(
            formatAnswerDisplay(
              q.type,
              answers[q.id],
              parseOptions(q.options),
              true
            )
          )
        ),
        escapeCsv(r.userAgent || ""),
      ];
    });
    const csv = [header.map(escapeCsv).join(","), ...rows.map((r) => r.join(","))].join(
      "\r\n"
    );
    const bom = "\uFEFF";
    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="survey-${survey.slug}-responses.csv"`,
      },
    });
  }

  return NextResponse.json({
    survey: {
      id: survey.id,
      title: survey.title,
      slug: survey.slug,
      questions: survey.questions.map((q) => ({
        ...q,
        options: parseOptions(q.options),
      })),
    },
    responses: survey.responses.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      userAgent: r.userAgent,
      answers: parseAnswers(r.answers),
    })),
  });
}

function escapeCsv(value: string): string {
  // Always quote so Excel/WPS keeps values as text (avoids 5/5 → date)
  return `"${String(value).replace(/"/g, '""')}"`;
}
