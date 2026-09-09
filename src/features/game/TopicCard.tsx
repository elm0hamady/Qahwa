import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { getTopicIcon } from "./topicIcons";
import type { SessionQuestion } from "@/types/api";

interface TopicCardProps {
  topicName: string;
  questions: (SessionQuestion | undefined)[]; // ordered: [d1-p1, d1-p2, d2-p1, d2-p2, d3-p1, d3-p2]
  playerIds: [number, number];
  onClick: () => void;
}

export function TopicCard({ topicName, questions, playerIds, onClick }: TopicCardProps) {
  const Icon = getTopicIcon(topicName);
  const judgedCount = questions.filter((q) => q?.state === "judged").length;
  const total = questions.length;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group block w-full text-start"
      whileHover={{ scale: 1.05, rotate: -1, y: -4 }}
      whileTap={{ scale: 0.96, rotate: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
    >
      <Card className="flex flex-col items-center gap-3 p-6 transition-colors duration-200 group-hover:border-purple">
        {/* Icon is one of several pre-existing lucide icons picked by name, not created each render. */}
        <motion.span
          whileHover={{ rotate: [0, -10, 10, -6, 0] }}
          transition={{ duration: 0.5 }}
          className="flex h-14 w-14 items-center justify-center rounded-token border-[3px] border-purple bg-purple-dim text-purple"
        >
          {/* oxlint-disable-next-line react-hooks/static-components */}
          <Icon size={24} />
        </motion.span>

        <div className="text-center">
          <h3 className="font-display text-base font-bold text-ink">{topicName}</h3>
          <p className="mt-0.5 text-xs text-ink-mute">
            {judgedCount} / {total} متجادج
          </p>
        </div>

        <div className="flex gap-1.5" aria-hidden>
          {questions.map((q, i) => {
            const isPlayer1 = q?.player_id === playerIds[0];
            const state = q?.state ?? "locked";
            return (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full border",
                  // "opened" is neutral gray everywhere (matches TokenChip) —
                  // it means "pending", not "owned by this player".
                  state === "opened" && "border-ink-mute/60 bg-ink-mute",
                  state === "judged" && (isPlayer1 ? "bg-purple/40 border-purple/40" : "bg-orange/40 border-orange/40"),
                  state === "locked" && (isPlayer1 ? "border-purple bg-transparent" : "border-orange bg-transparent")
                )}
              />
            );
          })}
        </div>
      </Card>
    </motion.button>
  );
}
