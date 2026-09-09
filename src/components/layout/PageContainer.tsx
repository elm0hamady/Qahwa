import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full px-6 py-10 md:px-10 lg:px-16", className)} {...props} />;
}
