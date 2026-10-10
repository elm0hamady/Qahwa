import { type ComponentPropsWithRef, useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends ComponentPropsWithRef<"input"> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ ref, label, error, hint, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-dim">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          "min-h-11 w-full rounded-2xl border-2 border-border bg-surface px-4 py-2.5 text-ink placeholder:text-ink-mute outline-none transition-colors focus:border-purple",
          error && "border-danger focus:border-danger",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
