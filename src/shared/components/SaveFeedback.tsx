import { AlertCircle, CheckCircle2 } from "lucide-react";

type SaveFeedbackProps = {
  type: "success" | "error";
  message: string;
};

export default function SaveFeedback({ type, message }: SaveFeedbackProps) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={[
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium",
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      ].join(" ")}
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
