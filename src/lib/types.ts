export type QuestionType = "single" | "multiple" | "text" | "rating";

export type SurveyStatus = "draft" | "published";

export interface QuestionInput {
  id?: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options: string[];
  order: number;
}

export type AnswerValue = string | string[] | number;

export type AnswersMap = Record<string, AnswerValue>;
