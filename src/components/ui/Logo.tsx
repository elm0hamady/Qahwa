import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return <img src="/logo.png" alt="" width="128" height="128" className={cn("object-contain", className)} />;
}
