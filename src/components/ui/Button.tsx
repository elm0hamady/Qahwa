import { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "purple" | "orange" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
  > {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  purple: "bg-purple text-white hover:bg-purple-soft shadow-glow-purple",
  orange: "bg-orange text-white hover:bg-orange-soft shadow-glow-orange",
  ghost: "bg-transparent text-ink-dim hover:bg-surface-hi hover:text-ink",
  outline: "bg-white border-2 border-border text-ink hover:border-purple hover:text-purple",
  danger: "bg-transparent border-2 border-danger/40 text-danger hover:bg-danger/10",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3.5 py-1.5 gap-1.5",
  md: "text-sm px-5 py-2.5 gap-2",
  lg: "text-base px-7 py-3.5 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "purple", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        whileHover={disabled || loading ? undefined : { scale: 1.04, y: -1 }}
        whileTap={disabled || loading ? undefined : { scale: 0.95, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
