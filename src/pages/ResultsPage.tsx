import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
    <PageContainer className="flex max-w-2xl flex-col items-center py-16 text-center">
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-16 w-16 items-center justify-center rounded-token border-2 border-purple text-purple shadow-glow-purple"
      >
        <Trophy size={26} />
      </motion.div>

      <h1 className="mt-6 font-display text-3xl font-semibold text-ink text-balance">
        {isTie ? "تعادل" : `${winner.player_name} كسب الجولة`}
      </h1>
      <p className="mt-2 text-ink-mute">المبارزة خلصت. دي النتيجة النهائية.</p>

      <div className="mt-8 flex w-full flex-col gap-3">
        {sorted.map((entry, i) => (
          <Card
            key={entry.player_id}
            className={cn(
              "flex items-center justify-between px-5 py-4",
              i === 0 && !isTie ? "border-purple/40" : ""
            )}
          >
            <span className="text-lg font-medium text-ink">{entry.player_name}</span>
            <span className="font-display text-2xl font-semibold text-purple">{entry.score}</span>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="purple" size="lg" onClick={() => navigate("/games/new")}>
          ابدأ مبارزة جديدة
        </Button>
        <Link to="/dashboard">
          <Button variant="outline" size="lg">
            رجوع للوحة التحكم
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}
