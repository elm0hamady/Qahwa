import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  wordmark?: string;
}

export function Logo({ className, wordmark }: LogoProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        fill="none"
        className={cn("shrink-0", className)}
      >
        <path
          d="M38.4 34.3A18 18 0 1 1 41.9 24"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="m37.3 36 7 6.8"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M14.5 20.5h15v4.1c0 5-3.1 8.4-7.5 8.4s-7.5-3.4-7.5-8.4v-4.1Z"
          stroke="var(--color-ink)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M29.5 22h2.2a3.2 3.2 0 0 1 0 6.4h-2.5M18.5 17.2c1.2-1 1.3-2.1.2-3.2m5.2 3.2c1.3-1.1 1.3-2.1.2-3.2"
          stroke="var(--color-ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M17 36h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      {wordmark && (
        <span className="font-display text-base font-extrabold leading-none text-ink sm:text-lg">
          {wordmark}
        </span>
      )}
    </span>
  );
}
