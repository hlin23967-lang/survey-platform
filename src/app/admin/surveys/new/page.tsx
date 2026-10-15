import { AdminHeader } from "@/components/AdminHeader";
import { SurveyEditor } from "@/components/SurveyEditor";

export default function NewSurveyPage() {
  return (
    <>
      <AdminHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <SurveyEditor mode="create" />
      </div>
    </>
  );
}
