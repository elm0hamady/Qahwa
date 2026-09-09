import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { absoluteUrl } from "@/lib/seo";

export interface Crumb {
  label: string;
  path?: string; // omit on the current (last) page
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <nav aria-label="مسار التنقل" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-mute">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={13} className="text-ink-mute/60 rtl:-scale-x-100" aria-hidden />}
              {item.path ? (
                <Link to={item.path} className="transition-colors hover:text-purple">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink-dim">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
