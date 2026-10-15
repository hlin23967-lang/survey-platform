import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseOptions } from "@/lib/survey";
import { SurveyForm } from "@/components/SurveyForm";
import type { QuestionType } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export default async function PublicSurveyPage({ params }: Params) {
  const { slug } = await params;
  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey || survey.status !== "published") notFound();

  return (
    <SurveyForm
      slug={survey.slug}
      title={survey.title}
      description={survey.description}
      questions={survey.questions.map((q) => ({
        id: q.id,
        type: q.type as QuestionType,
        title: q.title,
        required: q.required,
        options: parseOptions(q.options),
      }))}
    />
  );
}
