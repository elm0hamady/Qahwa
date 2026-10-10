import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, FacebookIcon } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/ui/Logo";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/elm0hamady/", icon: GithubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/elm0hamady/", icon: LinkedinIcon },
  { label: "Instagram", href: "https://www.instagram.com/elm0hamady", icon: InstagramIcon },
  { label: "Facebook", href: "https://www.facebook.com/elm0hamady", icon: FacebookIcon },
  { label: "Email", href: "mailto:melmohamady95@gmail.com", icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t border-border-soft">
      <div className="flex flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-16">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start gap-2">
            <Link to="/" className="flex items-center gap-2 text-ink-dim">
              <Logo className="h-5 w-5" />
              <span className="font-display text-base">قهوة</span>
            </Link>
            <p className="text-sm text-ink-mute">أقوى تحدى معلومات</p>
            <nav aria-label="روابط الفوتر" className="mt-1 flex gap-4 text-sm text-ink-mute">
              <Link to="/" className="transition-colors hover:text-purple">
                الرئيسية
              </Link>
              <Link to="/login" className="transition-colors hover:text-purple">
                تسجيل الدخول
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <ul className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink-mute transition-[border-color,color,box-shadow] duration-200 hover:border-purple hover:text-purple hover:shadow-glow-purple"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-mute">
            © {new Date().getFullYear()} قهوة. اتعمل لليالي أسئلة في القهاوي.
          </p>
        </div>
      </div>
    </footer>
  );
}
