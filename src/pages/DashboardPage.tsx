import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BookOpen, Play, Swords, Trash2 } from "lucide-react";
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
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/features/auth/store";
import { useAbandonSession, useCurrentSession } from "@/features/sessions/hooks";
import { normalizeError } from "@/lib/errors";

export function DashboardPage() {
  const username = useAuthStore((s) => s.username);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const { data: session, isLoading, isError, error, refetch } = useCurrentSession();
  const abandonMutation = useAbandonSession();

  return (
    <PageContainer>
      <Seo title="لوحة التحكم" path="/dashboard" noIndex />
      <div className="mx-auto w-full max-w-[112rem]">
        <motion.section
          aria-labelledby="dashboard-title"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.38 }}
          className="dashboard-stage relative isolate overflow-hidden border border-border-soft"
        >
          <div aria-hidden="true" className="dashboard-stage-grid absolute inset-0" />
          <div className="relative grid min-h-[25rem] items-center gap-8 px-6 py-9 sm:px-10 sm:py-12 lg:min-h-[27rem] lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.58fr)] lg:px-14 2xl:min-h-[32rem] 2xl:px-20">
            <div className="max-w-3xl">
              <p className="text-sm font-bold text-orange">
                أهلاً بيك تاني{username ? `، ${username}` : ""}
              </p>
              <h1
                id="dashboard-title"
                className="mt-3 max-w-2xl text-balance font-display text-4xl font-extrabold leading-[1.12] text-ink sm:text-5xl lg:text-6xl"
              >
                السؤال الأول
                <br />
                <span className="text-orange">عليك.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-ink-dim sm:text-lg">
                {session
                  ? "المواجهة لسه مستنية حكمك. ارجعوا للوحة وكملوا اللعب."
                  : "اختاروا المواضيع، سمّوا الفريقين، وخلي الأسئلة تحسم المنافسة."}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ButtonLink
                  to={session ? `/games/${session.id}` : "/games/new"}
                  size="lg"
                  className="min-h-14 px-7 text-base"
                >
                  <Play size={17} className="rtl:-scale-x-100" aria-hidden="true" />
                  {session ? "استكمال المواجهة" : "ابدأ لعبة جديدة"}
                </ButtonLink>
                <Link
                  to="/topics"
                  className="inline-flex min-h-12 items-center gap-2 px-3 text-sm font-bold text-ink-dim transition-colors hover:text-orange"
                >
                  المواضيع
                  <ArrowLeft size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="hidden justify-self-center lg:block">
              <div
                aria-hidden="true"
                className="flex h-64 w-64 items-center justify-center border border-orange/20 bg-bg/60 shadow-[0_0_90px_-34px_rgba(230,169,79,0.42)] 2xl:h-80 2xl:w-80"
              >
                <Logo className="h-40 w-40 text-orange 2xl:h-48 2xl:w-48" />
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-orange/50" />
        </motion.section>

        <section aria-label="اللعبة الحالية" className="mt-7">
          {isLoading && <Spinner label="بندور على سيشن شغالة…" />}

          {isError && (
            <ErrorState message={normalizeError(error).message} onRetry={() => refetch()} />
          )}

          {!isLoading && !isError && session && (
            <Card className="relative overflow-hidden p-5 sm:p-7">
              <div className="absolute inset-y-0 start-0 w-1 bg-purple" aria-hidden="true" />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-purple/40 bg-purple-dim text-purple">
                    <Swords size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-extrabold text-ink">مواجهة قائمة</h2>
                      <Badge tone="purple">مباشر</Badge>
                    </div>
                    <p className="mt-1 break-words text-sm font-bold text-ink-dim">
                      {session.players.map((p) => p.name).join(" ضد ")}
                    </p>
                    <p className="mt-1 text-xs text-ink-mute">
                      {session.topics.length} مواضيع · بدأت{" "}
                      {new Date(session.created_at).toLocaleString("ar-EG-u-nu-latn")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAbandonConfirm(true)}>
                    <Trash2 size={14} aria-hidden="true" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {abandonMutation.isError && (
            <div className="mt-4">
              <InlineBanner message={normalizeError(abandonMutation.error).message} />
            </div>
          )}
        </section>

        {!isLoading && !isError && !session && (
          <section
            aria-label="استكشف المواضيع"
            className="mt-7 grid gap-4 sm:grid-cols-2"
          >
            <Link
              to="/topics"
              className="group flex min-h-32 items-center justify-between gap-5 border border-border-soft bg-surface p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-orange/50 hover:bg-surface-hi focus-visible:outline-offset-4 sm:p-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-orange/25 bg-orange/10 text-orange">
                  <BookOpen size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-extrabold text-ink">بنك المواضيع</span>
                  <span className="mt-1 block text-sm text-ink-mute">اختاروا مجالات الجولة الجاية</span>
                </span>
              </div>
              <ArrowLeft
                size={18}
                className="shrink-0 text-ink-mute transition-transform group-hover:-translate-x-1 group-hover:text-orange"
                aria-hidden="true"
              />
            </Link>
            <div className="flex min-h-32 items-center border border-border-soft bg-bg-soft px-6 py-5 sm:p-6">
              <div>
                <p className="font-display text-lg font-extrabold text-ink">جولة بين فريقين</p>
                <p className="mt-1 max-w-md text-sm leading-6 text-ink-mute">
                  أربعة مواضيع، أسئلة بمستويات مختلفة، والحكم يحدد النتيجة.
                </p>
              </div>
            </div>
          </section>
        )}
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
            <Button
              variant="ghost"
              disabled={abandonMutation.isPending}
              onClick={() => setShowAbandonConfirm(false)}
            >
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
