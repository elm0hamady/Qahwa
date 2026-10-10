import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("w-full min-w-0 px-[clamp(1rem,3vw,3rem)] py-6 sm:py-8 lg:py-10", className)}
      {...props}
    />
  );
}
