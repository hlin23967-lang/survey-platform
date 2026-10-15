import type { Question, Survey } from "@prisma/client";
import type { AnswersMap, QuestionType } from "./types";

export function parseOptions(options: string): string[] {
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function parseAnswers(answers: string): AnswersMap {
  try {
    return JSON.parse(answers) as AnswersMap;
  } catch {
    return {};
  }
}

export type SurveyWithQuestions = Survey & { questions: Question[] };

export function validateAnswers(
  questions: Question[],
  answers: AnswersMap
): string | null {
  for (const q of questions) {
    const value = answers[q.id];
    if (q.required) {
      if (value === undefined || value === null || value === "") {
        return `请完成必填题：${q.title}`;
      }
      if (Array.isArray(value) && value.length === 0) {
        return `请完成必填题：${q.title}`;
      }
    }
    if (value === undefined || value === null || value === "") continue;

    const type = q.type as QuestionType;
    const options = parseOptions(q.options);

    if (type === "single" && typeof value === "string") {
      if (options.length && !options.includes(value)) {
        return `选项无效：${q.title}`;
      }
    }
    if (type === "multiple" && Array.isArray(value)) {
      if (value.some((v) => !options.includes(v))) {
        return `选项无效：${q.title}`;
      }
    }
    if (type === "rating") {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        return `评分须为 1–5：${q.title}`;
      }
    }
    if (type === "text" && typeof value !== "string") {
      return `答案格式错误：${q.title}`;
    }
  }
  return null;
}

export function formatAnswerDisplay(
  type: string,
  value: unknown,
  _options: string[] = [],
  forCsv = false
): string {
  if (value === undefined || value === null || value === "") return "—";
  if (type === "multiple" && Array.isArray(value)) return value.join("、");
  // Avoid "5 / 5" in CSV — Excel/WPS treats it as a date (5月5日)
  if (type === "rating") {
    const n = Number(value);
    return forCsv ? `${n}分` : `${n} / 5`;
  }
  if (typeof value === "string") return value;
  return String(value);
}
