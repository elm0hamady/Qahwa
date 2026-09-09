import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "purple" | "orange" | "neutral" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  purple: "bg-purple/15 text-purple border-purple/30",
  orange: "bg-orange/15 text-orange border-orange/30",
  neutral: "bg-surface-hi text-ink-dim border-border",
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-danger/15 text-danger border-danger/30",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
