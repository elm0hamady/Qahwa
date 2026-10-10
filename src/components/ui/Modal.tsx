import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** Overrides the default max-width (max-w-lg) — pass e.g. "max-w-3xl" for content-heavy modals like question media. */
  maxWidthClassName?: string;
  /**
   * When false, the modal can't be dismissed via the X button, the
   * backdrop, or Escape — only by calling onClose() programmatically.
   * Used to force a decision (e.g. judging a question) before the host
   * can walk away from it. Defaults to true.
   */
  dismissible?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  maxWidthClassName = "max-w-lg",
  dismissible = true,
}: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onCloseRef.current();
      if (e.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]'
      );
      if (!focusable?.length) {
        e.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const focusFrame = window.requestAnimationFrame(() => {
      if (dismissible) closeRef.current?.focus();
      else dialogRef.current?.focus();
    });
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && !previousFocus.matches(":disabled")) {
        previousFocus.focus();
      } else {
        document.querySelector<HTMLElement>("#main-content")?.focus();
      }
    };
  }, [open, dismissible]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-scrim/80 backdrop-blur-sm"
            aria-hidden="true"
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : "نافذة حوار"}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className={cn(
              "relative z-10 max-h-[calc(100dvh-2rem)] w-full overscroll-contain overflow-y-auto rounded-card border-2 border-border bg-surface p-5 shadow-card sm:max-h-[90vh] sm:p-6",
              maxWidthClassName,
              className
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              {title && <h2 id={titleId} className="font-display text-xl font-bold text-ink">{title}</h2>}
              {dismissible && (
                <button
                  type="button"
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="ms-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-surface-hi hover:text-ink"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
