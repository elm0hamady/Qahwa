import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const username = useAuthStore((s) => s.username);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="font-display text-lg font-semibold text-ink">قهوة</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/topics"
                className="hidden text-sm font-medium text-ink-dim transition-colors hover:text-purple sm:inline"
              >
                المواضيع
              </Link>
              <span className="hidden text-sm text-ink-mute lg:inline">
                بتستضيف باسم <span className="text-ink-dim">{username}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut size={14} className="rtl:-scale-x-100" />
                تسجيل خروج
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="purple" size="sm">
                استضف لعبة
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
