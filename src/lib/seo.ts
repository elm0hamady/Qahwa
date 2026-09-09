// Central site config used to build titles, meta tags, canonical URLs and JSON-LD.
// SITE_URL is a placeholder production domain — update it (and VITE_SITE_URL) once
// this app has a real deployed domain; it's only used to build absolute URLs for
// canonical links, Open Graph tags, and structured data.
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://qahwa.app").replace(/\/$/, "");
export const SITE_NAME = "قهوة";
export const DEFAULT_DESCRIPTION =
  "قهوة تطبيق مبارزات أسئلة يديره المضيف. اختر أربعة مواضيع، شغّل لوحة مباشرة بين لاعبين، واحسم النتيجة لحظة بلحظة.";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
