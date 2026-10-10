import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Check, CircleHelp, Music, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { Seo } from "@/components/common/Seo";
import { Modal } from "@/components/ui/Modal";
import { TopicCard } from "@/features/game/TopicCard";
import { ArenaScoreboard } from "@/features/game/ArenaScoreboard";
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

export function GamePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [activeQuestion, setActiveQuestion] = useState<SessionQuestion | null>(null);
  const [celebration, setCelebration] = useState<number | null>(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // Prevent the defensive session redirect from racing with the
  // navigation to the results page after the final question is judged.
  const finishingRef = useRef(false);

  useEffect(() => {
    if (!celebration) return;

    const timeout = setTimeout(() => setCelebration(null), 1200);

    return () => clearTimeout(timeout);
  }, [celebration]);

  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionErrored,
    error: sessionError,
  } = useCurrentSession();

  const {
    data: questions,
    isLoading: questionsLoading,
    isError: questionsErrored,
    error: questionsError,
    refetch: refetchQuestions,
  } = useSessionQuestions(sessionId);

  const {
    data: scoreboard,
    isError: scoreboardErrored,
    error: scoreboardError,
    refetch: refetchScoreboard,
  } = useScoreboard(sessionId);

  const openMutation = useOpenQuestion(sessionId);
  const judgeMutation = useJudgeQuestion(sessionId);
  const adjustMutation = useAdjustScore(sessionId);
  const abandonMutation = useAbandonSession();

  // If the URL doesn't match the host's actual active session, send them
  // to the session that IS active (or the dashboard if there isn't one).
  useEffect(() => {
    if (sessionLoading || sessionErrored || finishingRef.current) return;

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

  const displayedQuestion =
    activeQuestion ??
    questions?.find((q) => q.state === "opened") ??
    null;

  function scoreFor(playerId: number | undefined) {
    return scoreboard?.find((s) => s.player_id === playerId)?.score ?? null;
  }

  const player1Score = scoreFor(player1?.id);
  const player2Score = scoreFor(player2?.id);
  const scoresReady = player1Score !== null && player2Score !== null;
  async function handleChipClick(question: SessionQuestion | undefined) {
    if (!question) return;

    if (question.state !== "locked") return;

    openMutation.reset();

    try {
      const opened = await openMutation.mutateAsync(question.id);
      setActiveQuestion(opened);
    } catch {
      setActiveQuestion(null);
    }
  }

  function handleJudge(winnerId: number | null) {
    if (!displayedQuestion) return;

    const finishingQuestion = displayedQuestion;
    judgeMutation.reset();

    judgeMutation.mutate(
      {
        questionId: finishingQuestion.id,
        payload: {
          winner_player_id: winnerId,
        },
      },
      {
        onSuccess: (result) => {
          setActiveQuestion(null);
          if (winnerId !== null) setCelebration(Date.now());
          if (result.session_finished && sessionId) {
            finishingRef.current = true;
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

  if (!session || !player1 || !player2 || session.id !== sessionId) {
    return null;
  }

  return (
    <PageContainer className="!px-0 !py-0">
      <Seo
        title={`${player1.name} ضد ${player2.name}`}
        description={`لوحة مباشرة بين ${player1.name} و${player2.name} على قهوة.`}
        path={`/games/${session.id}`}
        noIndex
      />

      <div className="mx-auto w-full max-w-[88rem] px-[clamp(1rem,3vw,3rem)] pt-4 sm:pt-6">
        <ArenaScoreboard
          players={[
            { id: player1.id, name: player1.name, score: player1Score },
            { id: player2.id, name: player2.name, score: player2Score },
          ]}
          onAdjust={(playerId, amount) => adjustMutation.mutate({ playerId, amount })}
          adjusting={adjustMutation.isPending || !scoresReady}
        />
        {adjustMutation.isError && (
          <div className="mt-3">
            <InlineBanner message={normalizeError(adjustMutation.error).message} />
          </div>
        )}
        {adjustMutation.isPending && (
          <p className="mt-2 text-sm text-ink-mute" role="status">
            بنسجل تعديل النقاط…
          </p>
        )}
        {scoreboardErrored && (
          <div className="mt-3" role="alert">
            <ErrorState
              message={normalizeError(scoreboardError).message}
              onRetry={() => refetchScoreboard()}
            />
          </div>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-[88rem] justify-end px-[clamp(1rem,3vw,3rem)] pt-3">
        <Button
          variant="danger"
          size="sm"
          loading={abandonMutation.isPending}
          onClick={() => setShowAbandonConfirm(true)}
          className="min-h-11 min-w-40"
        >
          <Trash2 size={14} aria-hidden="true" />
          إلغاء اللعبة
        </Button>
      </div>

      {abandonMutation.isError && (
        <div className="mx-[clamp(1rem,3vw,3rem)] mt-3">
          <InlineBanner message={normalizeError(abandonMutation.error).message} />
        </div>
      )}

      {openMutation.isPending && (
        <p className="mx-[clamp(1rem,3vw,3rem)] mt-3 border-s-2 border-orange bg-orange-dim px-4 py-3 text-sm text-ink" role="status">
          بنفتح السؤال من اللوحة…
        </p>
      )}

      {openMutation.isError && (
        <div className="mx-[clamp(1rem,3vw,3rem)] mt-3">
          <InlineBanner message={normalizeError(openMutation.error).message} />
        </div>
      )}

      <section aria-label="اختيار الأسئلة حسب الموضوع" className="mx-auto min-w-0 w-full max-w-[88rem] px-[clamp(1rem,3vw,3rem)] py-4 sm:py-5">
        <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4">
          {session.topics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.3,
                delay: reduceMotion ? 0 : i * 0.045,
              }}
            >
              <TopicCard
                topicName={topic.name}
                players={[player1, player2]}
                cellMap={cellMap}
                onSelectQuestion={handleChipClick}
                openPending={openMutation.isPending}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <QuestionModal
        question={displayedQuestion}
        onClose={() => setActiveQuestion(null)}
        onJudge={handleJudge}
        judging={judgeMutation.isPending}
        judgeError={judgeMutation.isError ? normalizeError(judgeMutation.error).message : null}
        players={[player1, player2]}
      />

      <Modal
        open={showAbandonConfirm}
        onClose={() => setShowAbandonConfirm(false)}
        title="إلغاء اللعبة؟"
        className="rounded-none border border-border-soft"
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

      {celebration && !reduceMotion && <ConfettiBurst key={celebration} />}
    </PageContainer>
  );
}

const CONFETTI_COLORS = [
  "bg-purple",
  "bg-orange",
  "bg-success",
];

function ConfettiBurst() {
  const pieces = useMemo(
    () => Array.from({ length: 18 }, (_, i) => i),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const distance = 100 + ((i * 37) % 90);
        const rotate = (i * 53) % 360;

        return (
          <motion.span
            key={i}
            initial={{
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
            }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 50,
              scale: 0.5,
              rotate,
            }}
            transition={{
              duration: 1.1,
              ease: "easeOut",
            }}
            className={cn(
              "absolute h-3 w-3 rounded-sm",
              CONFETTI_COLORS[i % CONFETTI_COLORS.length]
            )}
          />
        );
      })}
    </div>
  );
}

function MediaPreview({
  media,
}: {
  media: NonNullable<SessionQuestion["media"]>;
}) {
  const url = resolveMediaUrl(media.url);

  if (media.type === "image") {
    return (
      <img
        src={url}
        alt="وسائط السؤال"
        className="mt-3 max-h-[70vh] w-full rounded-xl object-contain"
      />
    );
  }

  if (media.type === "video") {
    return (
      <video
        controls
        className="mt-3 max-h-[70vh] w-full rounded-xl"
      >
        <source src={url} />
      </video>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-border p-3 text-ink-dim">
      <Music size={16} aria-hidden="true" />
      <audio
        controls
        src={url}
        className="w-full"
      />
    </div>
  );
}

function QuestionModal({
  question,
  onClose,
  onJudge,
  judging,
  judgeError,
  players,
}: {
  question: SessionQuestion | null;
  onClose: () => void;
  onJudge: (winnerId: number | null) => void;
  judging: boolean;
  judgeError: string | null;
  players: [
    { id: number; name: string },
    { id: number; name: string }
  ];
}) {
  if (!question) {
    return (
      <Modal open={false} onClose={onClose}>
        <div />
      </Modal>
    );
  }

  return (
    <Modal
      open={Boolean(question)}
      onClose={onClose}
      title={`${question.topic} · ${question.difficulity} نقطة`}
      maxWidthClassName="max-w-3xl"
      className="rounded-none border border-border-soft"
      dismissible={false}
    >
      <QuestionModalContent
        key={question.id}
        question={question}
        onJudge={onJudge}
        judging={judging}
        judgeError={judgeError}
        players={players}
      />
    </Modal>
  );
}

function CountdownRing({
  secondsLeft,
  totalSeconds,
}: {
  secondsLeft: number;
  totalSeconds: number;
}) {
  const reduceMotion = useReducedMotion();
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress =
    Math.max(secondsLeft, 0) / totalSeconds;

  const timeUp = secondsLeft <= 0;
  const isLow =
    !timeUp &&
    secondsLeft <= Math.ceil(totalSeconds * 0.3);

  const colorClass = timeUp
    ? "text-danger"
    : isLow
      ? "text-orange"
      : "text-purple";

  return (
    <motion.div
      animate={
        timeUp
          ? reduceMotion ? undefined : { scale: [1, 1.08, 1] }
          : { scale: 1 }
      }
      transition={
        timeUp
          ? {
              duration: reduceMotion ? 0 : 0.45,
            }
          : undefined
      }
      className="relative flex h-14 w-14 shrink-0 items-center justify-center"
    >
      <svg
        viewBox="0 0 56 56"
        className="h-14 w-14 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="28"
          cy="28"
          r={radius}
          strokeWidth="4"
          fill="none"
          className="stroke-border"
        />

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
          animate={{
            strokeDashoffset:
              circumference * (1 - progress),
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.9,
            ease: "linear",
          }}
        />
      </svg>

      <span
        role="timer"
        aria-label={`${Math.max(secondsLeft, 0)} ثانية متبقية`}
        className={cn(
          "absolute font-display text-base font-bold",
          colorClass
        )}
      >
        {Math.max(secondsLeft, 0)}
      </span>
    </motion.div>
  );
}

function QuestionModalContent({
  question,
  onJudge,
  judging,
  judgeError,
  players,
}: {
  question: SessionQuestion;
  onJudge: (winnerId: number | null) => void;
  judging: boolean;
  judgeError: string | null;
  players: [
    { id: number; name: string },
    { id: number; name: string }
  ];
}) {
  const [answer, setAnswer] =
    useState<RevealedAnswer | null>(null);
  const reduceMotion = useReducedMotion();

  const revealMutation = useRevealAnswer();

  const canRevealAnswer =
    question.state === "opened" &&
    Boolean(question.text);

  const canJudge =
    question.state === "opened" &&
    answer !== null;

  const totalSeconds =
    TIMER_SECONDS_BY_DIFFICULTY[
      question.difficulity
    ] ?? DEFAULT_TIMER_SECONDS;

  const [secondsLeft, setSecondsLeft] =
    useState(totalSeconds);

  const showTimer =
    canRevealAnswer && !answer;

  useEffect(() => {
    if (!showTimer) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) =>
        s > 0 ? s - 1 : 0
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border-soft bg-bg-soft px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-purple/35 bg-purple-dim text-purple">
            <CircleHelp size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-ink-mute">دور اللاعب</p>
            <p className="truncate text-sm font-bold text-ink">{question.player}</p>
          </div>
        </div>
        {showTimer && (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-ink-mute sm:inline">وقت الإجابة</span>
            <CountdownRing
              secondsLeft={secondsLeft}
              totalSeconds={totalSeconds}
            />
          </div>
        )}
      </div>

      <section
        aria-label="نص السؤال"
        className="relative overflow-hidden border border-border-soft bg-bg px-5 py-6 sm:px-8 sm:py-9"
      >
        <span aria-hidden="true" className="absolute start-0 top-0 h-full w-1 bg-gradient-to-b from-purple via-orange to-transparent" />
        <p className="mb-3 text-[11px] font-bold text-orange">السؤال</p>
        {question.text ? (
          <p className="max-w-3xl text-xl font-semibold leading-[1.8] text-ink sm:text-2xl">
            {question.text}
          </p>
        ) : (
          <p className="text-ink-mute" role="status">
            بنحمّل السؤال…
          </p>
        )}
      </section>

      {question.media && (
        <MediaPreview media={question.media} />
      )}

      {canRevealAnswer && !answer && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-ink-mute">
            سيب اللاعبين يجاوبوا، وبعدها اكشف الإجابة عشان تختار مين كسب.
          </p>
          <Button
            variant="outline"
            size="sm"
            loading={revealMutation.isPending}
            onClick={() =>
              revealMutation.mutate(
                question.id,
                {
                  onSuccess: setAnswer,
                }
              )
            }
            className="self-start"
          >
            إظهار الإجابة
          </Button>

          {revealMutation.isError && (
            <InlineBanner
              message={normalizeError(
                revealMutation.error
              ).message}
            />
          )}
        </div>
      )}

      {answer && (
        <motion.div
          role="status"
          initial={{
            opacity: 0,
            scale: 0.9,
            y: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 22,
          }}
          className="border border-orange/45 bg-orange-dim/60 px-4 py-4 sm:px-5"
        >
          <p className="flex items-center gap-2 text-xs font-bold text-orange">
            <Check size={14} aria-hidden="true" />
            الإجابة الصحيحة
          </p>

          {answer.text ? (
            <p className="mt-2 text-lg font-bold leading-relaxed text-ink sm:text-xl">
              {answer.text}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-mute">
              مفيش نص إجابة متسجل للسؤال ده.
            </p>
          )}

          {answer.media && (
            <MediaPreview media={answer.media} />
          )}
        </motion.div>
      )}

      {canJudge && (
        <section aria-labelledby="judge-question-title" className="border border-border-soft bg-surface p-4 sm:p-5">
          <div className="mb-4">
            <p className="text-xs font-bold text-success">الإجابة اتكشفت</p>
            <h3 id="judge-question-title" className="mt-1 font-display text-lg font-bold text-ink">
              مين يستحق النقاط؟
            </h3>
          </div>
          {judgeError && (
            <div>
              <InlineBanner message={judgeError} />
            </div>
          )}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            <Button
              variant="purple"
              size="md"
              loading={judging}
              onClick={() => onJudge(players[0].id)}
              className="w-full"
            >
              <Check size={15} aria-hidden="true" />
              {players[0].name} كسب
            </Button>

            <Button
              variant="orange"
              size="md"
              loading={judging}
              onClick={() => onJudge(players[1].id)}
              className="w-full"
            >
              <Check size={15} aria-hidden="true" />
              {players[1].name} كسب
            </Button>

            <Button
              variant="outline"
              size="md"
              loading={judging}
              onClick={() => onJudge(null)}
              className="w-full"
            >
              من غير نقاط
            </Button>
          </motion.div>
          {judging && <p className="text-sm text-ink-mute" role="status">بنسجل الحكم والنتيجة…</p>}
        </section>
      )}
    </div>
  );
}