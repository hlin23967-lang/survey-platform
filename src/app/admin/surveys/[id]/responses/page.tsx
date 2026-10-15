import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatAnswerDisplay,
  parseAnswers,
  parseOptions,
} from "@/lib/survey";
import { AdminHeader } from "@/components/AdminHeader";

type Params = { params: Promise<{ id: string }> };

export default async function ResponsesPage({ params }: Params) {
  const { id } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!survey) notFound();

  return (
    <>
      <AdminHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link href="/admin" className="hover:text-[var(--ink)]">
                问卷列表
              </Link>
              {" / "}
              <Link
                href={`/admin/surveys/${survey.id}`}
                className="hover:text-[var(--ink)]"
              >
                {survey.title}
              </Link>
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">答卷</h1>
            <p className="mt-1 text-[var(--muted)]">
              共 {survey.responses.length} 份
            </p>
          </div>
          <a
            href={`/api/admin/surveys/${survey.id}/responses?format=csv`}
            className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            导出 CSV
          </a>
        </div>

        {survey.responses.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-elevated)] px-6 py-16 text-center text-[var(--muted)]">
            还没有人填写
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {survey.responses.map((r, idx) => {
              const answers = parseAnswers(r.answers);
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                    <span className="font-medium">
                      第 {survey.responses.length - idx} 份
                    </span>
                    <time className="text-sm text-[var(--muted)]">
                      {new Date(r.createdAt).toLocaleString("zh-CN")}
                    </time>
                  </div>
                  <dl className="mt-3 space-y-3">
                    {survey.questions.map((q) => (
                      <div key={q.id}>
                        <dt className="text-sm text-[var(--muted)]">{q.title}</dt>
                        <dd className="mt-0.5 font-medium">
                          {formatAnswerDisplay(
                            q.type,
                            answers[q.id],
                            parseOptions(q.options)
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
