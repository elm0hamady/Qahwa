type ClassValue = string | number | null | undefined | false | Record<string, boolean>;

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else {
      for (const [key, enabled] of Object.entries(v)) {
        if (enabled) out.push(key);
      }
    }
  }
  return out.join(" ");
}
