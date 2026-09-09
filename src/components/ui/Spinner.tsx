import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className, label = "جاري التحميل" }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-ink-mute py-10", className)} role="status">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
