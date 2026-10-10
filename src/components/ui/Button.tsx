import type { ComponentPropsWithRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { buttonClassNames, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";

interface ButtonProps
  extends Omit<
    ComponentPropsWithRef<"button">,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
  > {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  ref,
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      whileHover={disabled || loading ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled || loading ? undefined : { scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={buttonClassNames(variant, size, className)}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} aria-hidden="true" />}
      {children}
    </motion.button>
  );
}
