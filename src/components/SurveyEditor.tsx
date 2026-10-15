"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionInput, QuestionType } from "@/lib/types";
import { CopyLinkButton } from "./CopyLinkButton";

const TYPE_LABELS: Record<QuestionType, string> = {
  single: "单选",
  multiple: "多选",
  text: "填空",
  rating: "评分 1–5",
};

interface SurveyEditorProps {
  mode: "create" | "edit";
  surveyId?: string;
  initial?: {
    title: string;
    description: string;
    status: string;
    slug: string;
    questions: QuestionInput[];
  };
  publicOrigin?: string;
}

function emptyQuestion(order: number): QuestionInput {
  return {
    type: "single",
    title: "",
    required: true,
    options: ["选项 A", "选项 B"],
    order,
  };
}

export function SurveyEditor({
  mode,
  surveyId,
  initial,
  publicOrigin = "",
}: SurveyEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [slug] = useState(initial?.slug || "");
  const [questions, setQuestions] = useState<QuestionInput[]>(
    initial?.questions?.length ? initial.questions : [emptyQuestion(0)]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const publicUrl = useMemo(
    () => (slug && publicOrigin ? `${publicOrigin}/s/${slug}` : ""),
    [slug, publicOrigin]
  );

  function updateQuestion(index: number, patch: Partial<QuestionInput>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  }

  function moveQuestion(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= questions.length) return;
    setQuestions((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy.map((q, i) => ({ ...q, order: i }));
    });
  }

  async function save(nextStatus?: string) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!title.trim()) {
        setError("请填写问卷标题");
        return;
      }
      if (questions.some((q) => !q.title.trim())) {
        setError("每道题都需要填写题干");
        return;
      }

      const payload = {
        title: title.trim(),
        description,
        status: nextStatus || status,
        questions: questions.map((q, i) => ({
          ...q,
          title: q.title.trim(),
          order: i,
          options:
            q.type === "text" || q.type === "rating"
              ? []
              : q.options.filter((o) => o.trim()),
        })),
      };

      let id = surveyId;
      if (mode === "create") {
        const res = await fetch("/api/admin/surveys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "创建失败");
          return;
        }
        id = data.id;
        if (nextStatus === "published") {
          await fetch(`/api/admin/surveys/${id}/publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publish: true }),
          });
        }
        router.push(`/admin/surveys/${id}`);
        router.refresh();
        return;
      }

      const res = await fetch(`/api/admin/surveys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }
      setStatus(data.status);
      setMessage(nextStatus === "published" ? "已发布" : "已保存");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    const next = status === "published" ? "draft" : "published";
    if (!surveyId) {
      await save(next);
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!title.trim()) {
        setError("请填写问卷标题");
        return;
      }
      if (questions.some((q) => !q.title.trim())) {
        setError("每道题都需要填写题干");
        return;
      }

      const payload = {
        title: title.trim(),
        description,
        status: next,
        questions: questions.map((q, i) => ({
          ...q,
          title: q.title.trim(),
          order: i,
          options:
            q.type === "text" || q.type === "rating"
              ? []
              : q.options.filter((o) => o.trim()),
        })),
      };

      const saveRes = await fetch(`/api/admin/surveys/${surveyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) {
        setError(saved.error || "保存失败");
        return;
      }

      if (next === "published" && saved.questions?.length === 0) {
        setError("请至少添加一道题再发布");
        return;
      }

      setStatus(saved.status);
      setMessage(next === "published" ? "已发布，可复制链接分享" : "已取消发布");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeSurvey() {
    if (!surveyId || !confirm("确定删除这份问卷及全部答卷？")) return;
    const res = await fetch(`/api/admin/surveys/${surveyId}`, { method: "DELETE" });
    if (res.ok) router.push("/admin");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "新建问卷" : "编辑问卷"}
          </h1>
          {status === "published" && publicUrl && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="max-w-full truncate rounded bg-[var(--line)]/50 px-2 py-1 text-xs">
                {publicUrl}
              </code>
              <CopyLinkButton url={publicUrl} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={removeSurvey}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              删除
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => save()}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            保存草稿
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={togglePublish}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {status === "published" ? "取消发布" : "发布"}
          </button>
        </div>
      </div>

      {(error || message) && (
        <p className={`text-sm ${error ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>
          {error || message}
        </p>
      )}

      <section className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 sm:p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">标题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            placeholder="例如：员工满意度调研"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">说明</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            placeholder="填写说明、预计用时等"
          />
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">题目</h2>
          <button
            type="button"
            onClick={() =>
              setQuestions((prev) => [...prev, emptyQuestion(prev.length)])
            }
            className="text-sm font-semibold text-[var(--accent)]"
          >
            + 添加题目
          </button>
        </div>

        {questions.map((q, index) => (
          <div
            key={index}
            className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-[var(--muted)]">
                第 {index + 1} 题
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveQuestion(index, -1)}
                  className="text-xs text-[var(--muted)]"
                >
                  上移
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 1)}
                  className="text-xs text-[var(--muted)]"
                >
                  下移
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((prev) =>
                      prev.length <= 1
                        ? prev
                        : prev.filter((_, i) => i !== index).map((item, i) => ({
                            ...item,
                            order: i,
                          }))
                    )
                  }
                  className="text-xs text-[var(--danger)]"
                >
                  删除
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={q.title}
                onChange={(e) => updateQuestion(index, { title: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
                placeholder="题干"
              />
              <select
                value={q.type}
                onChange={(e) => {
                  const type = e.target.value as QuestionType;
                  updateQuestion(index, {
                    type,
                    options:
                      type === "single" || type === "multiple"
                        ? q.options.length
                          ? q.options
                          : ["选项 A", "选项 B"]
                        : [],
                  });
                }}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              >
                {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) =>
                  updateQuestion(index, { required: e.target.checked })
                }
              />
              必填
            </label>

            {(q.type === "single" || q.type === "multiple") && (
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex gap-2">
                    <input
                      value={opt}
                      onChange={(e) => {
                        const options = [...q.options];
                        options[oi] = e.target.value;
                        updateQuestion(index, { options });
                      }}
                      className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(index, {
                          options: q.options.filter((_, i) => i !== oi),
                        })
                      }
                      className="text-sm text-[var(--muted)]"
                    >
                      删
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateQuestion(index, {
                      options: [...q.options, `选项 ${q.options.length + 1}`],
                    })
                  }
                  className="text-sm font-medium text-[var(--accent)]"
                >
                  + 选项
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
