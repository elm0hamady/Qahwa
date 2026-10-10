import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { Crown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ArenaPlayer {
  id: number;
  name: string;
  score: number | null;
}

interface ArenaScoreboardProps {
  players: readonly [ArenaPlayer, ArenaPlayer];
  onAdjust: (playerId: number, amount: 100 | -100) => void;
  adjusting: boolean;
}

export function ArenaScoreboard({ players, onAdjust, adjusting }: ArenaScoreboardProps) {
  const [first, second] = players;
  const tied = first.score !== null && first.score === second.score;
  const firstLeading = first.score !== null && second.score !== null && first.score > second.score;
  const secondLeading = first.score !== null && second.score !== null && second.score > first.score;

  return (
    <section
      aria-label="نتيجة المبارزة"
      className="relative overflow-hidden border border-border-soft bg-surface shadow-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-soft bg-bg-soft px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-30 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <p className="text-sm font-extrabold text-ink">الاسكور</p>
        </div>
        <p aria-live="polite" className="text-[11px] text-ink-mute">
          {tied ? "المبارزة متعادلة" : firstLeading ? `${first.name} متقدم` : secondLeading ? `${second.name} متقدم` : "لسه بنحسب النتيجة"}
        </p>
      </div>

      <div className="grid grid-cols-2 items-stretch gap-3 px-3 py-4 sm:gap-4 sm:px-4">
        <PlayerScorePanel
          player={first}
          position={1}
          tone="purple"
          leading={firstLeading}
          tied={tied}
          onAdjust={onAdjust}
          adjusting={adjusting}
        />
        <PlayerScorePanel
          player={second}
          position={2}
          tone="orange"
          leading={secondLeading}
          tied={tied}
          onAdjust={onAdjust}
          adjusting={adjusting}
        />
      </div>
    </section>
  );
}

function PlayerScorePanel({
  player,
  position,
  tone,
  leading,
  tied,
  onAdjust,
  adjusting,
}: {
  player: ArenaPlayer;
  position: 1 | 2;
  tone: "purple" | "orange";
  leading: boolean;
  tied: boolean;
  onAdjust: (playerId: number, amount: 100 | -100) => void;
  adjusting: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[8.5rem] min-w-0 flex-col justify-between gap-2 overflow-hidden border px-3 py-3.5 transition-colors sm:min-h-28 sm:flex-row sm:items-center sm:gap-3 sm:px-4",
        tone === "purple"
          ? leading ? "border-purple/75 bg-purple-dim/45" : "border-purple/35 bg-bg-soft"
          : leading ? "border-orange/75 bg-orange-dim/45" : "border-orange/35 bg-bg-soft"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 start-0 w-1",
          tone === "purple" ? "bg-purple" : "bg-orange"
        )}
      />

      <div className="min-w-0 ps-1 sm:flex-1">
        <div className="flex min-w-0 items-center justify-between gap-1.5">
          <p className={cn("text-[10px] font-bold sm:text-xs", tone === "purple" ? "text-purple" : "text-orange")}>
            الفريق {position === 1 ? "الأول" : "الثاني"}
          </p>
          {leading ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange/15 px-2 py-1 text-[10px] font-bold text-orange sm:text-xs">
              <Crown size={12} aria-hidden="true" />
              متقدم
            </span>
          ) : tied ? (
            <span className="text-[10px] font-medium text-ink-mute sm:text-xs">تعادل</span>
          ) : null}
        </div>
        <p className="mt-1 break-words text-xs font-bold leading-snug text-ink sm:text-base">{player.name}</p>
      </div>

      <div className="flex min-w-0 shrink-0 items-center justify-between gap-1 sm:gap-2">
        <p
          className={cn(
            "font-display text-2xl font-extrabold tabular-nums leading-none sm:text-4xl",
            tone === "purple" ? "text-purple" : "text-orange"
          )}
          aria-label={`${player.score ?? "غير معروف"} نقطة`}
        >
          {player.score === null ? "—" : <AnimatedScore value={player.score} />}
        </p>
        <div className="flex shrink-0 gap-1">
          <motion.button
            type="button"
            disabled={adjusting}
            onClick={() => onAdjust(player.id, -100)}
            aria-label={`نقص 100 من ${player.name}`}
            whileHover={adjusting ? undefined : { y: -2 }}
            whileTap={adjusting ? undefined : { scale: 0.92 }}
            className="flex h-11 w-11 items-center justify-center border border-border bg-surface text-ink-mute transition-colors hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Minus size={15} aria-hidden="true" />
          </motion.button>
          <motion.button
            type="button"
            disabled={adjusting}
            onClick={() => onAdjust(player.id, 100)}
            aria-label={`زود 100 لـ ${player.name}`}
            whileHover={adjusting ? undefined : { y: -2 }}
            whileTap={adjusting ? undefined : { scale: 0.92 }}
            className="flex h-11 w-11 items-center justify-center border border-border bg-surface text-ink-mute transition-colors hover:border-success hover:text-success disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={15} aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function AnimatedScore({ value }: { value: number }) {
  const previous = useRef(value);
  const [delta, setDelta] = useState<{ id: number; amount: number } | null>(null);
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 130, damping: 18 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const unsubscribe = spring.on("change", (nextValue) => setDisplay(Math.round(nextValue)));
    return unsubscribe;
  }, [spring]);

  useEffect(() => {
    if (value !== previous.current) {
      setDelta({ id: Date.now(), amount: value - previous.current });
      previous.current = value;
    }
    motionValue.set(value);
  }, [motionValue, value]);

  return (
    <span className="relative inline-block">
      {reduceMotion ? value : display}
      <AnimatePresence>
        {delta && !reduceMotion && (
          <motion.span
            key={delta.id}
            initial={{ opacity: 0, y: 4, scale: 0.8 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            onAnimationComplete={() => setDelta((current) => current?.id === delta.id ? null : current)}
            className={cn(
              "pointer-events-none absolute start-1/2 top-full z-10 mt-0.5 -translate-x-1/2 whitespace-nowrap text-[11px] font-extrabold",
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
