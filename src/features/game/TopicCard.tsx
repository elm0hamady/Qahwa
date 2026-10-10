import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import type { SessionQuestion } from "@/types/api";
import { cn } from "@/lib/cn";

const DIFFICULTIES = [100, 300, 500] as const;
interface TopicCardProps {
  topicName: string;
  players: [{ id: number; name: string }, { id: number; name: string }];
  cellMap: Map<string, SessionQuestion>;
  onSelectQuestion: (question: SessionQuestion | undefined) => void;
  openPending: boolean;
}

export function TopicCard({ topicName, players, cellMap, onSelectQuestion, openPending }: TopicCardProps) {
  const reduceMotion = useReducedMotion();

  const rows = DIFFICULTIES.map((difficulty) => ({
    difficulty,
    q1: cellMap.get(`${topicName}::${difficulty}::${players[0].id}`),
    q2: cellMap.get(`${topicName}::${difficulty}::${players[1].id}`),
  }));

  return (
    <Card className="h-full overflow-hidden border-y border-x-0 border-border-soft bg-surface p-0">
      <div className="border-b border-border-soft bg-bg-soft px-3 py-3.5 sm:px-4">
        <h3 className="break-words font-display text-base font-extrabold leading-tight text-ink">{topicName}</h3>
      </div>

      <div className="px-2.5 pb-3 pt-2 sm:px-3">
        <div className="overflow-hidden border border-border-soft">
          {rows.map(({ difficulty, q1, q2 }, index) => (
            <div
              key={difficulty}
              className={cn(
                "grid grid-cols-2 items-center gap-2 px-2 py-2 sm:px-2.5",
                index % 2 === 0 ? "bg-surface" : "bg-bg-soft/70",
                index > 0 && "border-t border-border-soft"
              )}
            >
              <QuestionCell
                question={q1}
                difficulty={difficulty}
                player={players[0]}
                playerIndex={1}
                topicName={topicName}
                openPending={openPending}
                reduceMotion={reduceMotion}
                onSelect={onSelectQuestion}
              />
              <QuestionCell
                question={q2}
                difficulty={difficulty}
                player={players[1]}
                playerIndex={2}
                topicName={topicName}
                openPending={openPending}
                reduceMotion={reduceMotion}
                onSelect={onSelectQuestion}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function QuestionCell({
  question,
  difficulty,
  player,
  playerIndex,
  topicName,
  openPending,
  reduceMotion,
  onSelect,
}: {
  question: SessionQuestion | undefined;
  difficulty: (typeof DIFFICULTIES)[number];
  player: { id: number; name: string };
  playerIndex: 1 | 2;
  topicName: string;
  openPending: boolean;
  reduceMotion: boolean | null;
  onSelect: (question: SessionQuestion | undefined) => void;
}) {
  const state = question?.state ?? "locked";
  const selectable = state === "locked";
  const label = `${topicName}، ${difficulty} نقطة، ${player.name}${state === "opened" ? "، مفتوح" : state === "judged" ? "، تم الحكم عليه" : "، متاح"}`;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(question)}
      aria-label={label}
      aria-busy={openPending}
      disabled={openPending || !selectable}
      whileHover={selectable && !openPending && !reduceMotion ? { scale: 1.06, y: -2 } : undefined}
      whileTap={selectable && !openPending && !reduceMotion ? { scale: 0.94 } : undefined}
      transition={{ type: "spring", stiffness: 430, damping: 24 }}
      className={cn(
        "group flex min-h-12 min-w-0 items-center justify-center border px-1 text-xs font-bold transition-[background-color,border-color,box-shadow,color,opacity] duration-150 disabled:cursor-not-allowed sm:min-h-14",
        selectable
          ? playerIndex === 1
            ? "border-purple/45 bg-purple-dim/45 text-purple hover:border-purple hover:bg-purple-dim hover:shadow-glow-purple"
            : "border-orange/45 bg-orange-dim/45 text-orange hover:border-orange hover:bg-orange-dim hover:shadow-glow-orange"
          : state === "opened"
            ? "border-border bg-surface-hi text-ink-dim opacity-75"
            : "border-border-soft bg-bg text-ink-mute opacity-45"
      )}
    >
      <span className="font-display text-base font-extrabold tabular-nums leading-none sm:text-lg">
        {difficulty}
      </span>
    </motion.button>
  );
}
