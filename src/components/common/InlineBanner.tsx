import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function InlineBanner({ message, tone = "danger" }: { message: string; tone?: "danger" | "purple" }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        tone === "danger" ? "border-danger/30 bg-danger/10 text-danger" : "border-purple/30 bg-purple/10 text-purple"
      )}
      role="alert"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
