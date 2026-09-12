import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Seo } from "@/components/common/Seo";
import { useVerifyEmail } from "@/features/auth/hooks";
import { normalizeError } from "@/lib/errors";

const AUTO_REDIRECT_SECONDS = 4;

export function VerifyEmailPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { data, isLoading, isError, error } = useVerifyEmail(uid, token);
  const navigate = useNavigate();
  const [redirectIn, setRedirectIn] = useState(AUTO_REDIRECT_SECONDS);

  const verified = !isLoading && !isError && Boolean(data);

  // Once verified, ease the host back to the homepage on their own — with a
  // visible countdown, and a manual button for anyone who doesn't want to wait.
  useEffect(() => {
    if (!verified) return;
    if (redirectIn <= 0) {
      navigate("/");
      return;
    }
    const timeout = setTimeout(() => setRedirectIn((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [verified, redirectIn, navigate]);

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-16">
      <Seo title="تفعيل الحساب" path={`/verify-email/${uid ?? ""}/${token ?? ""}`} noIndex />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="relative w-full max-w-sm"
      >
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          {isLoading && (
            <>
              <Logo className="h-14 w-14" />
              <Spinner label="بنفعّل حسابك…" />
            </>
          )}

          {!isLoading && isError && (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-token border-2 border-danger/50 bg-danger/10 text-danger">
                <XCircle size={26} />
              </span>
              <h1 className="font-display text-xl font-bold text-ink">رابط التفعيل مش شغال</h1>
              <p className="text-sm text-ink-mute">{normalizeError(error).message}</p>
              <p className="text-xs text-ink-mute">
                ممكن الرابط يكون انتهى أو اتفتح قبل كده. جرّب تسجّل حساب جديد أو كلّم الدعم.
              </p>
              <Link to="/register" className="mt-2">
                <Button variant="outline">ارجع لصفحة التسجيل</Button>
              </Link>
            </>
          )}

          {verified && (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-token border-2 border-success/50 bg-success/10 text-success">
                <CheckCircle2 size={26} />
              </span>
              <h1 className="font-display text-xl font-bold text-ink">اتفعّل حسابك!</h1>
              <p className="text-sm text-ink-mute">
                هترجع للصفحة الرئيسية تلقائي خلال {redirectIn}… تقدر كمان تسجّل دخول وتبدأ تستضيف على طول.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Link to="/">
                  <Button variant="outline">روح دلوقتي</Button>
                </Link>
                <Link to="/login">
                  <Button variant="purple">تسجيل الدخول</Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
