"use client";

import { FormEvent, useState } from "react";
import type { AnswersMap, QuestionType } from "@/lib/types";

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options: string[];
}

interface SurveyFormProps {
  slug: string;
  title: string;
  description: string;
  questions: PublicQuestion[];
}

export function SurveyForm({
  slug,
  title,
  description,
  questions,
}: SurveyFormProps) {
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setAnswer(id: string, value: AnswersMap[string]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: string, option: string) {
    const current = (answers[id] as string[] | undefined) || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswer(id, next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      for (const q of questions) {
        if (!q.required) continue;
        const v = answers[q.id];
        if (v === undefined || v === null || v === "") {
          setError(`请完成必填题：${q.title}`);
          return;
        }
        if (Array.isArray(v) && v.length === 0) {
          setError(`请完成必填题：${q.title}`);
          return;
        }
      }

      const res = await fetch(`/api/s/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "提交失败");
        return;
      }
      window.location.href = `/s/${slug}/thanks`;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        )}
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 sm:p-5"
          >
            <h2 className="text-base font-semibold">
              {index + 1}. {q.title}
              {q.required ? (
                <span className="ml-1 text-[var(--danger)]">*</span>
              ) : null}
            </h2>

            <div className="mt-3 space-y-2">
              {q.type === "text" && (
                <textarea
                  rows={3}
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--accent)]"
                />
              )}

              {q.type === "single" &&
                q.options.map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-base ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent)]"
                            : "border-[var(--muted)]"
                        }`}
                      >
                        {selected ? (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        ) : null}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}

              {q.type === "multiple" &&
                q.options.map((opt) => {
                  const selected = (
                    (answers[q.id] as string[]) || []
                  ).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMulti(q.id, opt)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-base ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                            : "border-[var(--muted)]"
                        }`}
                      >
                        {selected ? "✓" : null}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}

              {(q.type === "rating" ||
                !["text", "single", "multiple"].includes(q.type)) && (
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const selected = Number(answers[q.id]) === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAnswer(q.id, n)}
                        onPointerUp={() => setAnswer(q.id, n)}
                        className={`flex h-14 items-center justify-center rounded-lg border text-lg font-semibold touch-manipulation ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                            : "border-[var(--line)] bg-white"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {submitting ? "提交中…" : "提交"}
        </button>
      </form>
    </main>
  );
}
