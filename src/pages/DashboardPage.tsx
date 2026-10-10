import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Swords, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { InlineBanner } from "@/components/common/InlineBanner";
import { Seo } from "@/components/common/Seo";
import { Modal } from "@/components/ui/Modal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useAuthStore } from "@/features/auth/store";
import { useAbandonSession, useCurrentSession } from "@/features/sessions/hooks";
import { normalizeError } from "@/lib/errors";

export function DashboardPage() {
  const username = useAuthStore((s) => s.username);
  const navigate = useNavigate();
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const { data: session, isLoading, isError, error, refetch } = useCurrentSession();
  const abandonMutation = useAbandonSession();

  return (
    <PageContainer>
      <Seo title="لوحة التحكم" path="/dashboard" noIndex />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-sm text-ink-mute">أهلاً بيك تاني{username ? `، ${username}` : ""}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink text-balance">
          هنستضيف إيه النهاردة؟
        </h1>
      </motion.div>

      <div className="mt-8">
        {isLoading && <Spinner label="بندور على سيشن شغالة…" />}

        {isError && (
          <ErrorState message={normalizeError(error).message} onRetry={() => refetch()} />
        )}

        {!isLoading && !isError && session && (
          <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-token border-2 border-purple text-purple">
                <Swords size={18} aria-hidden="true" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-ink">سيشن شغالة</h2>
                  <Badge tone="purple">مباشر</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-mute">
                  {session.players.map((p) => p.name).join(" ضد ")} · {session.topics.length} مواضيع ·{" "}
                  بدأت {new Date(session.created_at).toLocaleString("ar-EG-u-nu-latn")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAbandonConfirm(true)}>
                <Trash2 size={14} aria-hidden="true" />
                إلغاء
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate(`/games/${session.id}`)}>
                <Play size={14} className="rtl:-scale-x-100" aria-hidden="true" />
                استكمال
              </Button>
            </div>
          </Card>
        )}

        {abandonMutation.isError && (
          <div className="mt-4">
            <InlineBanner message={normalizeError(abandonMutation.error).message} />
          </div>
        )}

        {!isLoading && !isError && !session && (
          <Card className="flex flex-col items-center gap-4 px-8 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-token border-2 border-orange text-orange">
              <Swords size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">مفيش لعبة شغالة دلوقتي</h2>
              <p className="mt-1 max-w-sm text-sm text-ink-mute">
                اختار أربعة مواضيع، سمّي اللاعبين الاتنين، واللوحة هتتظبط لوحدها.
              </p>
            </div>
            <ButtonLink to="/games/new">ابدأ لعبة جديدة</ButtonLink>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Link to="/topics" className="text-sm font-medium text-ink-mute transition-colors hover:text-purple">
            تصفح بنك المواضيع
          </Link>
        </div>
      </div>

      <Modal
        open={showAbandonConfirm}
        onClose={() => setShowAbandonConfirm(false)}
        title="إلغاء اللعبة؟"
      >
        <div className="flex flex-col gap-4">
          <p className="leading-relaxed text-ink-dim">
            هتتقفل الجولة الحالية ومش هتقدر ترجع للوحة دي. متأكد إنك عايز تلغيها؟
          </p>
          {abandonMutation.isError && (
            <div>
              <InlineBanner message={normalizeError(abandonMutation.error).message} />
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost"             disabled={abandonMutation.isPending}
            onClick={() => setShowAbandonConfirm(false)}>
              كمّل اللعبة
            </Button>
            <Button
              variant="danger"
              loading={abandonMutation.isPending}
              onClick={() =>
                abandonMutation.mutate(undefined, {
                  onSuccess: () => navigate("/dashboard"),
                })
              }
            >
              ألغِ اللعبة
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
