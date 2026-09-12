import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return <img src="/logo.png" alt="قهوة" className={cn("object-contain", className)} />;
}
