import { Link, useNavigate } from "react-router-dom";
import { LogOut, Coffee } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const username = useAuthStore((s) => s.username);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-token border-2 border-purple text-purple">
            <Coffee size={16} />
          </span>
          <span className="font-display text-lg font-semibold text-ink">قهوة</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-ink-mute sm:inline">
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
