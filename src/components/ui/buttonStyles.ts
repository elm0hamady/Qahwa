import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "purple" | "orange" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-orange text-on-orange hover:bg-orange-soft shadow-glow-orange",
  purple: "bg-purple text-on-purple hover:bg-purple-soft shadow-glow-purple",
  orange: "bg-orange text-on-orange hover:bg-orange-soft shadow-glow-orange",
  ghost: "bg-transparent text-ink-dim hover:bg-surface-hi hover:text-ink",
  outline: "bg-surface border-2 border-border text-ink hover:border-purple hover:text-purple",
  danger: "bg-transparent border-2 border-danger/40 text-danger hover:bg-danger/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 text-sm px-4 py-2 gap-1.5",
  md: "min-h-11 text-sm px-5 py-2.5 gap-2",
  lg: "min-h-12 text-base px-7 py-3 gap-2.5",
};

export function buttonClassNames(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-bold transition-[background-color,border-color,color,box-shadow,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}
