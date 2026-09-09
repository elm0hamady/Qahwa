import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { Minus, Plus, Trash2, Music } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { Seo } from "@/components/common/Seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Modal } from "@/components/ui/Modal";
import { TokenChip } from "@/components/ui/TokenChip";
import { TopicCard } from "@/features/game/TopicCard";
import { DEFAULT_TIMER_SECONDS, TIMER_SECONDS_BY_DIFFICULTY } from "@/features/game/timerConfig";
import { resolveMediaUrl } from "@/lib/apiClient";
import { useAbandonSession, useCurrentSession } from "@/features/sessions/hooks";
import {
  useAdjustScore,
  useJudgeQuestion,
  useOpenQuestion,
  useRevealAnswer,
  useScoreboard,
  useSessionQuestions,
} from "@/features/game/hooks";
import type { RevealedAnswer, SessionQuestion } from "@/types/api";
import { normalizeError } from "@/lib/errors";
import { cn } from "@/lib/cn";
import { InlineBanner } from "@/components/common/InlineBanner";

const DIFFICULTIES = [100, 300, 500] as const;

export function GamePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState<SessionQuestion | null>(null);
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<number | null>(null);

  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(() => setCelebration(null), 1200);
    return () => clearTimeout(timeout);
  }, [celebration]);

  const { data: session, isLoading: sessionLoading, isError: sessionErrored, error: sessionError } =
    useCurrentSession();
  const {
    data: questions,
    isLoading: questionsLoading,
    isError: questionsErrored,
    error: questionsError,
    refetch: refetchQuestions,
  } = useSessionQuestions(sessionId);
  const { data: scoreboard } = useScoreboard(sessionId);

  const openMutation = useOpenQuestion(sessionId);
  const judgeMutation = useJudgeQuestion(sessionId);
  const adjustMutation = useAdjustScore(sessionId);
  const abandonMutation = useAbandonSession();

  // If the URL doesn't match the host's actual active session, send them
  // to the session that IS active (or the dashboard if there isn't one).
  useEffect(() => {
    if (sessionLoading || sessionErrored) return;
    if (!session) {
      navigate("/dashboard", { replace: true });
    } else if (session.id !== sessionId) {
      navigate(`/games/${session.id}`, { replace: true });
    }
  }, [sessionLoading, sessionErrored, session, sessionId, navigate]);

  const player1 = session?.players[0];
  const player2 = session?.players[1];

  const cellMap = useMemo(() => {
    const map = new Map<string, SessionQuestion>();
    for (const q of questions ?? []) {
      map.set(`${q.topic}::${q.difficulity}::${q.player_id}`, q);
    }
    return map;
  }, [questions]);

  // If a question was left opened-but-not-judged — whether the host
  // navigated away mid-decision or just refreshed the page — its modal
  // comes back up automatically instead of being stranded on the board
  // with no way to reach it (opened tokens are intentionally unclickable;
  // see handleChipClick). Derived at render time rather than synced via
  // an effect: once judging updates the question's state away from
  // "opened", this simply stops matching on its own.
  const displayedQuestion = activeQuestion ?? questions?.find((q) => q.state === "opened") ?? null;

  function scoreFor(playerId: number | undefined) {
    return scoreboard?.find((s) => s.player_id === playerId)?.score ?? 0;
  }

  async function handleChipClick(question: SessionQuestion | undefined) {
    if (!question) return;
    // Only a never-opened question is clickable. "opened" is mid-judging
    // and only reachable via the forced modal (or auto-restore above);
    // "judged" is finished and has nothing left to do — neither should
    // reopen anything on click.
    if (question.state !== "locked") return;

    setActiveTopicName(null); // close the topic's token list, the question modal takes over
    // Open the modal immediately in a loading state — we don't have the
    // real question text yet (the server withholds it until now on
    // purpose), but the user should see *something* happen instantly
    // rather than waiting on the request with no feedback at all.
    setActiveQuestion(question);
    try {
      const opened = await openMutation.mutateAsync(question.id);
      setActiveQuestion(opened);
    } catch {
      setActiveQuestion(null);
    }
  }

  function handleJudge(winnerId: number | null) {
    if (!displayedQuestion) return;
    // Close the modal right away — the score/board already updated
    // optimistically inside useJudgeQuestion, so there's nothing left to
    // wait for on screen. The request still finishes in the background.
    const finishingQuestion = displayedQuestion;
    setActiveQuestion(null);
    if (winnerId !== null) setCelebration(Date.now());
    judgeMutation.mutate(
      { questionId: finishingQuestion.id, payload: { winner_player_id: winnerId } },
      {
        onSuccess: (result) => {
          if (result.session_finished && sessionId) {
            navigate(`/games/${sessionId}/results`);
          }
        },
      }
    );
  }

  if (sessionLoading || questionsLoading) {
    return (
      <PageContainer>
        <Spinner label="بنجهّز اللوحة…" />
      </PageContainer>
    );
  }

  if (sessionErrored || questionsErrored) {
    return (
      <PageContainer>
        <ErrorState
          message={normalizeError(sessionError ?? questionsError).message}
          onRetry={() => refetchQuestions()}
        />
      </PageContainer>
    );
  }

  if (!session || !player1 || !player2 || session.id !== sessionId) return null;

  return (
    <PageContainer>
      <Seo
        title={`${player1.name} ضد ${player2.name}`}
        description={`لوحة مباشرة بين ${player1.name} و${player2.name} على قهوة.`}
        path={`/games/${session.id}`}
        noIndex
      />
      <Breadcrumbs
        items={[
          { label: "لوحة التحكم", path: "/dashboard" },
          { label: `${player1.name} ضد ${player2.name}` },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            {player1.name} <span className="text-ink-mute">ضد</span> {player2.name}
          </h1>
          <p className="mt-1 text-sm text-ink-mute">{session.topics.length} مواضيع على اللوحة</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          loading={abandonMutation.isPending}
          onClick={() => {
            if (confirm("تسيب السيشن دي؟ الخطوة دي مفيهاش رجوع.")) {
              abandonMutation.mutate(undefined, { onSuccess: () => navigate("/dashboard") });
            }
          }}
        >
          <Trash2 size={14} />
          إلغاء اللعبة
        </Button>
      </div>

      {abandonMutation.isError && (
        <div className="mt-4">
          <InlineBanner message={normalizeError(abandonMutation.error).message} />
        </div>
      )}

      {/* Scoreboard strip */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <ScoreCard
          name={player1.name}
          score={scoreFor(player1.id)}
          tone="purple"
          onAdjust={(amount) => adjustMutation.mutate({ playerId: player1.id, amount })}
          adjusting={adjustMutation.isPending}
        />
        <ScoreCard
          name={player2.name}
          score={scoreFor(player2.id)}
          tone="orange"
          onAdjust={(amount) => adjustMutation.mutate({ playerId: player2.id, amount })}
          adjusting={adjustMutation.isPending}
        />
      </div>

      {/* Board — a gallery of topics; open one to see its tokens */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {session.topics.map((topic, i) => {
          const topicQuestions = DIFFICULTIES.flatMap((difficulty) => [
            cellMap.get(`${topic.name}::${difficulty}::${player1.id}`),
            cellMap.get(`${topic.name}::${difficulty}::${player2.id}`),
          ]);
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.06 }}
            >
              <TopicCard
                topicName={topic.name}
                questions={topicQuestions}
                playerIds={[player1.id, player2.id]}
                onClick={() => setActiveTopicName(topic.name)}
              />
            </motion.div>
          );
        })}
      </div>

      <TopicTokensModal
        topicName={displayedQuestion ? null : activeTopicName}
        onClose={() => setActiveTopicName(null)}
        cellMap={cellMap}
        players={[player1, player2]}
        onSelectQuestion={handleChipClick}
        openPending={openMutation.isPending}
      />

      <QuestionModal
        question={displayedQuestion}
        onClose={() => setActiveQuestion(null)}
        onJudge={handleJudge}
        judging={judgeMutation.isPending}
        players={[player1, player2]}
      />

      {celebration && <ConfettiBurst key={celebration} />}
    </PageContainer>
  );
}

function AnimatedScore({ value, className }: { value: number; className?: string }) {
  const prevValue = useRef(value);
  const [delta, setDelta] = useState<{ id: number; amount: number } | null>(null);
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 130, damping: 18 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsubscribe;
  }, [spring]);

  useEffect(() => {
    if (value !== prevValue.current) {
      setDelta({ id: Date.now(), amount: value - prevValue.current });
      prevValue.current = value;
    }
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <span className={cn("relative inline-block", className)}>
      {display}
      <AnimatePresence>
        {delta && (
          <motion.span
            key={delta.id}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -34, scale: 1.15 }}
            exit={{ opacity: 0, y: -46 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setDelta((d) => (d?.id === delta.id ? null : d))}
            className={cn(
              "pointer-events-none absolute -top-1 start-1/2 -translate-x-1/2 whitespace-nowrap text-base font-extrabold",
              delta.amount > 0 ? "text-success" : "text-danger"
            )}
          >
            {delta.amount > 0 ? `+${delta.amount}` : delta.amount}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

const CONFETTI_COLORS = ["bg-purple", "bg-orange", "bg-success"];

function ConfettiBurst() {
  const pieces = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const distance = 100 + ((i * 37) % 90);
        const rotate = (i * 53) % 360;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 50,
              scale: 0.5,
              rotate,
            }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className={cn("absolute h-3 w-3 rounded-sm", CONFETTI_COLORS[i % CONFETTI_COLORS.length])}
          />
        );
      })}
    </div>
  );
}

function ScoreCard({
  name,
  score,
  tone,
  onAdjust,
  adjusting,
}: {
  name: string;
  score: number;
  tone: "purple" | "orange";
  onAdjust: (amount: 100 | -100) => void;
  adjusting: boolean;
}) {
  return (
    <Card
      className={cn(
        "flex items-center justify-between p-4",
        tone === "purple" ? "border-purple/30" : "border-orange/30"
      )}
    >
      <div>
        <p className="text-sm text-ink-mute">{name}</p>
        <p className={cn("font-display text-3xl font-bold", tone === "purple" ? "text-purple" : "text-orange")}>
          <AnimatedScore value={score} />
        </p>
      </div>
      <div className="flex gap-1.5">
        <motion.button
          type="button"
          disabled={adjusting}
          onClick={() => onAdjust(-100)}
          aria-label={`نقص 100 من ${name}`}
          whileHover={adjusting ? undefined : { scale: 1.15 }}
          whileTap={adjusting ? undefined : { scale: 0.85 }}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border text-ink-mute transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
        >
          <Minus size={14} />
        </motion.button>
        <motion.button
          type="button"
          disabled={adjusting}
          onClick={() => onAdjust(100)}
          aria-label={`زود 100 لـ ${name}`}
          whileHover={adjusting ? undefined : { scale: 1.15 }}
          whileTap={adjusting ? undefined : { scale: 0.85 }}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border text-ink-mute transition-colors hover:border-success hover:text-success disabled:opacity-50"
        >
          <Plus size={14} />
        </motion.button>
      </div>
    </Card>
  );
}

function MediaPreview({ media }: { media: NonNullable<SessionQuestion["media"]> }) {
  const url = resolveMediaUrl(media.url);
  if (media.type === "image") {
    return <img src={url} alt="وسائط السؤال" className="mt-3 max-h-64 w-full rounded-xl object-cover" />;
  }
  if (media.type === "video") {
    return (
      <video controls className="mt-3 max-h-64 w-full rounded-xl">
        <source src={url} />
      </video>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-border p-3 text-ink-dim">
      <Music size={16} />
      <audio controls src={url} className="w-full" />
    </div>
  );
}

function TopicTokensModal({
  topicName,
  onClose,
  cellMap,
  players,
  onSelectQuestion,
  openPending,
}: {
  topicName: string | null;
  onClose: () => void;
  cellMap: Map<string, SessionQuestion>;
  players: [{ id: number; name: string }, { id: number; name: string }];
  onSelectQuestion: (question: SessionQuestion | undefined) => void;
  openPending: boolean;
}) {
  return (
    <Modal open={Boolean(topicName)} onClose={onClose} title={topicName ?? undefined}>
      {topicName && (
        <div className="flex flex-col gap-4">
          {DIFFICULTIES.map((difficulty) => {
            const q1 = cellMap.get(`${topicName}::${difficulty}::${players[0].id}`);
            const q2 = cellMap.get(`${topicName}::${difficulty}::${players[1].id}`);
            return (
              <div key={difficulty} className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-ink-mute">
                  {difficulty === 100 ? "سهل" : difficulty === 300 ? "متوسط" : "صعب"} · {difficulty} نقطة
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectQuestion(q1)}
                    aria-label={`${topicName} ${difficulty} لـ ${players[0].name}`}
                    disabled={openPending || (q1?.state ?? "locked") !== "locked"}
                    className="disabled:cursor-not-allowed"
                  >
                    <TokenChip
                      value={difficulty}
                      player={1}
                      state={q1?.state ?? "locked"}
                      interactive={!openPending && (q1?.state ?? "locked") === "locked"}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectQuestion(q2)}
                    aria-label={`${topicName} ${difficulty} لـ ${players[1].name}`}
                    disabled={openPending || (q2?.state ?? "locked") !== "locked"}
                    className="disabled:cursor-not-allowed"
                  >
                    <TokenChip
                      value={difficulty}
                      player={2}
                      state={q2?.state ?? "locked"}
                      interactive={!openPending && (q2?.state ?? "locked") === "locked"}
                    />
                  </button>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-ink-mute">
            <span className="me-1 inline-block h-2 w-2 rounded-full border border-purple align-middle" /> {players[0].name}
            <span className="mx-2 inline-block h-2 w-2 rounded-full border border-orange align-middle" /> {players[1].name}
          </p>
        </div>
      )}
    </Modal>
  );
}

function QuestionModal({
  question,
  onClose,
  onJudge,
  judging,
  players,
}: {
  question: SessionQuestion | null;
  onClose: () => void;
  onJudge: (winnerId: number | null) => void;
  judging: boolean;
  players: [{ id: number; name: string }, { id: number; name: string }];
}) {
  if (!question) return <Modal open={false} onClose={onClose}><div /></Modal>;

  return (
    <Modal
      open={Boolean(question)}
      onClose={onClose}
      title={`${question.topic} · ${question.difficulity} نقطة`}
      // Once a question is on screen it has to be judged before the modal
      // can close — no X, no backdrop click, no Escape. Otherwise a host
      // could open it, back out, let someone look the answer up, and come
      // back to "judge" unfairly.
      dismissible={false}
    >
      {/* Keyed by question id so the reveal state resets for a genuinely
          different question, but survives the locked -> opened update of
          the same question (same id) while it's loading. */}
      <QuestionModalContent
        key={question.id}
        question={question}
        onJudge={onJudge}
        judging={judging}
        players={players}
      />
    </Modal>
  );
}

function CountdownRing({ secondsLeft, totalSeconds }: { secondsLeft: number; totalSeconds: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(secondsLeft, 0) / totalSeconds;
  const timeUp = secondsLeft <= 0;
  const isLow = !timeUp && secondsLeft <= Math.ceil(totalSeconds * 0.3);
  const colorClass = timeUp ? "text-danger" : isLow ? "text-orange" : "text-purple";

  return (
    <motion.div
      animate={timeUp ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={timeUp ? { duration: 0.7, repeat: Infinity } : undefined}
      className="relative flex h-14 w-14 shrink-0 items-center justify-center"
    >
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={radius} strokeWidth="4" fill="none" className="stroke-border" />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          stroke="currentColor"
          className={colorClass}
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <span className={cn("absolute font-display text-base font-bold", colorClass)}>
        {Math.max(secondsLeft, 0)}
      </span>
    </motion.div>
  );
}

function QuestionModalContent({
  question,
  onJudge,
  judging,
  players,
}: {
  question: SessionQuestion;
  onJudge: (winnerId: number | null) => void;
  judging: boolean;
  players: [{ id: number; name: string }, { id: number; name: string }];
}) {
  const [answer, setAnswer] = useState<RevealedAnswer | null>(null);
  const revealMutation = useRevealAnswer();

  const canRevealAnswer = question.state === "opened" && Boolean(question.text);
  const canJudge = question.state === "opened" && answer !== null;

  // Starts counting the moment the real question text is on screen (not
  // during the "opening…" placeholder), and stops once the host reveals
  // the answer and moves on to judging.
  const totalSeconds = TIMER_SECONDS_BY_DIFFICULTY[question.difficulity] ?? DEFAULT_TIMER_SECONDS;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const showTimer = canRevealAnswer && !answer;

  useEffect(() => {
    if (!showTimer) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showTimer]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs tracking-wide text-ink-mute">مخصص لـ {question.player}</p>
        {showTimer && <CountdownRing secondsLeft={secondsLeft} totalSeconds={totalSeconds} />}
      </div>

      {question.text ? (
        <p className="text-lg leading-relaxed text-ink">{question.text}</p>
      ) : (
        <p className="text-ink-mute">بيفتح السؤال…</p>
      )}

      {question.media && <MediaPreview media={question.media} />}

      {/* Step 1: show the question only, and let the host reveal the answer
          once players have had their say. */}
      {canRevealAnswer && !answer && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={revealMutation.isPending}
            onClick={() => revealMutation.mutate(question.id, { onSuccess: setAnswer })}
            className="self-start"
          >
            إظهار الإجابة
          </Button>
          {revealMutation.isError && (
            <InlineBanner message={normalizeError(revealMutation.error).message} />
          )}
        </div>
      )}

      {/* Step 2: the answer, revealed only after the host explicitly asks
          for it. */}
      {answer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="rounded-xl border-2 border-purple/40 bg-purple-dim px-4 py-3"
        >
          <p className="text-xs font-bold tracking-wide text-purple">الإجابة</p>
          {answer.text ? (
            <p className="mt-1 text-ink">{answer.text}</p>
          ) : (
            <p className="mt-1 text-sm text-ink-mute">مفيش نص إجابة متسجل للسؤال ده.</p>
          )}
          {answer.media && <MediaPreview media={answer.media} />}
        </motion.div>
      )}

      {/* Step 3: judging only unlocks once the answer has actually been shown. */}
      {canJudge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mt-1 flex flex-wrap gap-2"
        >
          <Button variant="purple" size="sm" loading={judging} onClick={() => onJudge(players[0].id)}>
            {players[0].name} كسب
          </Button>
          <Button variant="orange" size="sm" loading={judging} onClick={() => onJudge(players[1].id)}>
            {players[1].name} كسب
          </Button>
          <Button variant="outline" size="sm" loading={judging} onClick={() => onJudge(null)}>
            محدش جاوب
          </Button>
        </motion.div>
      )}
    </div>
  );
}
