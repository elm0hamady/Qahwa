import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Player = 1 | 2;
type State = "locked" | "opened" | "judged";

const PLAYER_RING: Record<Player, string> = {
  1: "border-purple text-purple",
  2: "border-orange text-orange",
};

export function TokenChip({
  value,
  player,
  state = "locked",
  size = "md",
  interactive = false,
  className,
}: {
  value: 100 | 300 | 500;
  player: Player;
  state?: State;
  size?: "sm" | "md" | "lg";
  /** Whether this chip currently responds to hover/tap (i.e. it's clickable). */
  interactive?: boolean;
  className?: string;
}) {
  const sizeClasses = size === "lg" ? "h-20 w-20 text-xl" : size === "sm" ? "h-11 w-11 text-xs" : "h-16 w-16 text-sm";

  return (
    <motion.div
      layout
      initial={{ scale: 0, rotate: -12 }}
      animate={{
        scale: 1,
        rotate: 0,
        // A little celebratory wobble the moment a question gets judged.
        ...(state === "judged" ? { y: [0, -6, 0] } : {}),
      }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
      whileHover={interactive ? { scale: 1.12, rotate: -4 } : undefined}
      whileTap={interactive ? { scale: 0.9, rotate: 4 } : undefined}
      className={cn(
        "flex items-center justify-center rounded-token border-[3px] font-display font-bold",
        sizeClasses,
        // "opened" is deliberately neutral gray regardless of player — it
        // signals "pending, needs judging" rather than ownership. Locked and
        // judged keep the player's color so ownership stays readable.
        state === "opened"
          ? "border-ink-mute/50 bg-surface-hi text-ink-mute"
          : cn(
              PLAYER_RING[player],
              state === "locked" ? "bg-surface shadow-card" : "bg-transparent opacity-40"
            ),
        className
      )}
    >
      {value}
    </motion.div>
  );
}
