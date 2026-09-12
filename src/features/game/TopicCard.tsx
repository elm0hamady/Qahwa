import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { TokenChip } from "@/components/ui/TokenChip";
import { getTopicIcon } from "./topicIcons";
import type { SessionQuestion } from "@/types/api";

const DIFFICULTIES = [100, 300, 500] as const;
const DIFFICULTY_LABEL: Record<(typeof DIFFICULTIES)[number], string> = {
  100: "سهل",
  300: "متوسط",
  500: "صعب",
};

interface TopicCardProps {
  topicName: string;
  players: [{ id: number; name: string }, { id: number; name: string }];
  cellMap: Map<string, SessionQuestion>;
  onSelectQuestion: (question: SessionQuestion | undefined) => void;
  openPending: boolean;
}

export function TopicCard({ topicName, players, cellMap, onSelectQuestion, openPending }: TopicCardProps) {
  const Icon = getTopicIcon(topicName);

  const rows = DIFFICULTIES.map((difficulty) => ({
    difficulty,
    q1: cellMap.get(`${topicName}::${difficulty}::${players[0].id}`),
    q2: cellMap.get(`${topicName}::${difficulty}::${players[1].id}`),
  }));

  const judgedCount = rows.reduce(
    (acc, r) => acc + [r.q1, r.q2].filter((q) => q?.state === "judged").length,
    0
  );
  const total = rows.length * 2;

  return (
    <Card className="flex flex-col items-center gap-4 p-6">
      {/* Icon is one of several pre-existing lucide icons picked by name, not created each render. */}
      <motion.span
        whileHover={{ rotate: [0, -10, 10, -6, 0] }}
        transition={{ duration: 0.5 }}
        className="flex h-20 w-20 items-center justify-center rounded-token border-[3px] border-purple bg-purple-dim text-purple"
      >
        {/* oxlint-disable-next-line react-hooks/static-components */}
        <Icon size={34} />
      </motion.span>

      <div className="text-center">
        <h3 className="font-display text-lg font-bold text-ink">{topicName}</h3>
        <p className="mt-0.5 text-xs text-ink-mute">
          {judgedCount} / {total} متجادج
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        {rows.map(({ difficulty, q1, q2 }) => (
          <div key={difficulty} className="flex items-center justify-between gap-2">
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
                size="sm"
                interactive={!openPending && (q1?.state ?? "locked") === "locked"}
              />
            </button>

            <span className="shrink-0 text-[11px] font-medium text-ink-mute">
              {DIFFICULTY_LABEL[difficulty]}
            </span>

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
                size="sm"
                interactive={!openPending && (q2?.state ?? "locked") === "locked"}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
