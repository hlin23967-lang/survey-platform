import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { parseOptions } from "@/lib/survey";
import { AdminHeader } from "@/components/AdminHeader";
import { SurveyEditor } from "@/components/SurveyEditor";
import type { QuestionType } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export default async function EditSurveyPage({ params }: Params) {
  const { id } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!survey) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  return (
    <>
      <AdminHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <SurveyEditor
          mode="edit"
          surveyId={survey.id}
          publicOrigin={origin}
          initial={{
            title: survey.title,
            description: survey.description,
            status: survey.status,
            slug: survey.slug,
            questions: survey.questions.map((q) => ({
              id: q.id,
              type: q.type as QuestionType,
              title: q.title,
              required: q.required,
              options: parseOptions(q.options),
              order: q.order,
            })),
          }}
        />
      </div>
    </>
  );
}
