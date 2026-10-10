import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LibraryBig, LogOut, Swords } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const username = useAuthStore((s) => s.username);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/90 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-[clamp(1rem,3vw,3rem)] py-2.5">
        <Link to="/" className="group flex shrink-0 items-center transition-opacity hover:opacity-85">
          <Logo className="h-10 w-10 text-orange" wordmark="قهوة" />
        </Link>

        <nav aria-label="التنقل الرئيسي" className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          <>
            <Link
              to="/dashboard"
              aria-label="لوحة التحكم"
              className="inline-flex min-h-10 items-center gap-2 rounded-full px-2.5 text-xs font-bold text-ink-dim transition-[background-color,color] hover:bg-surface hover:text-ink sm:px-3 sm:text-sm"
            >
              <LayoutDashboard size={16} aria-hidden="true" />
              <span className="hidden sm:inline">لوحة التحكم</span>
            </Link>
            <Link
              to="/topics"
              aria-label="المواضيع"
              className="inline-flex min-h-10 items-center gap-2 rounded-full px-2.5 text-xs font-bold text-ink-dim transition-[background-color,color] hover:bg-surface hover:text-ink sm:px-3 sm:text-sm"
            >
              <LibraryBig size={16} aria-hidden="true" />
              <span className="hidden sm:inline">المواضيع</span>
            </Link>
            {isAuthenticated ? (
              <>
                <span className="max-w-32 truncate border-s border-border-soft ps-2 text-[10px] text-ink-mute sm:max-w-48 sm:ps-3 sm:text-xs">
                  بتلعب بحساب <span className="font-bold text-ink-dim">{username}</span>
                </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                aria-label="تسجيل خروج"
                className="px-2.5 sm:px-4"
              >
                <LogOut size={14} className="rtl:-scale-x-100" aria-hidden="true" />
                <span className="hidden sm:inline">تسجيل خروج</span>
              </Button>
              </>
            ) : (
              <ButtonLink to="/login" size="sm" className="ms-1">
                <Swords size={15} aria-hidden="true" />
                استضف لعبة
              </ButtonLink>
            )}
          </>
        </nav>
      </div>
    </header>
  );
}
