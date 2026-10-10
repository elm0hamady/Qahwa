import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Handshake, Trophy } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { Seo } from "@/components/common/Seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useScoreboard } from "@/features/game/hooks";
import { normalizeError } from "@/lib/errors";
import { cn } from "@/lib/cn";

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: scoreboard, isLoading, isError, error, refetch } = useScoreboard(sessionId);

  if (isLoading) {
    return (
      <PageContainer>
        <Spinner label="بنحسب النتيجة النهائية…" />
      </PageContainer>
    );
  }

  if (isError || !scoreboard) {
    return (
      <PageContainer>
        <ErrorState message={normalizeError(error).message} onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score;

  return (
    <PageContainer className="flex w-full flex-col items-center text-center">
      <Seo
        title={isTie ? "تعادل" : `${winner.player_name} كسب`}
        description="النتيجة النهائية لمبارزة الأسئلة دي على قهوة."
        path={`/games/${sessionId}/results`}
        noIndex
      />
      <div className="w-full text-start">
        <Breadcrumbs
          items={[
            { label: "لوحة التحكم", path: "/dashboard" },
            { label: "النتيجة" },
          ]}
        />
      </div>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        className="relative mt-5 w-full overflow-hidden rounded-[2rem] border border-border bg-surface p-5 shadow-card sm:p-9"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 start-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange/10 blur-3xl" />
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.75, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 17, delay: 0.12 }}
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-[1.65rem] border shadow-card sm:h-24 sm:w-24",
              isTie ? "border-purple/40 bg-purple-dim text-purple" : "border-orange/55 bg-orange-dim text-orange shadow-glow-orange"
            )}
          >
            {isTie ? <Handshake size={34} aria-hidden="true" /> : <Trophy size={36} aria-hidden="true" />}
          </motion.div>

          <p className="mt-6 text-sm font-bold text-orange">
            {isTie ? "مبارزة متكافئة" : "بطل الليلة"}
          </p>
          <h1 className="mt-2 break-words font-display text-3xl font-bold leading-tight text-ink text-balance sm:text-5xl">
            {isTie ? "تعادل مستحق" : `${winner.player_name} كسب الجولة`}
          </h1>
          <p className="mt-2 text-sm text-ink-mute sm:text-base">
            انتهت كل الأسئلة — ودي النتيجة النهائية.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:gap-5">
            {sorted.map((entry, i) => (
              <motion.div
                key={entry.player_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.2 + i * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative flex h-full min-h-36 flex-col items-center justify-center gap-2 overflow-hidden px-3 py-5 sm:min-h-48 sm:px-6",
                    i === 0 && !isTie
                      ? "border-orange/60 bg-orange-dim/35"
                      : "border-border-soft bg-bg-soft"
                  )}
                >
                  {i === 0 && !isTie && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange/30 bg-orange/10 px-2.5 py-1 text-[11px] font-bold text-orange">
                      <Crown size={13} aria-hidden="true" />
                      الفائز
                    </span>
                  )}
                  <p className="max-w-full break-words text-sm font-bold text-ink-dim sm:text-base">
                    {entry.player_name}
                  </p>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 + i * 0.1 }}
                    className={cn(
                      "font-display text-4xl font-extrabold tabular-nums sm:text-6xl",
                      i === 0 ? "text-orange" : "text-purple"
                    )}
                  >
                    {entry.score}
                  </motion.p>
                  <p className="text-xs text-ink-mute">نقطة</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" onClick={() => navigate("/games/new")}>
          ابدأ مبارزة جديدة
        </Button>
        <ButtonLink to="/dashboard" variant="outline" size="lg">
          رجوع للوحة التحكم
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
