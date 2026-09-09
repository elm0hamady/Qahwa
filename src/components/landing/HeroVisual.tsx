import { motion } from "framer-motion";

const RING_ITEMS = [
  { value: 100, angle: 0, tone: "purple" },
  { value: 300, angle: 60, tone: "orange" },
  { value: 500, angle: 120, tone: "purple" },
  { value: 100, angle: 180, tone: "orange" },
  { value: 300, angle: 240, tone: "purple" },
  { value: 500, angle: 300, tone: "orange" },
] as const;

export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[360px] w-[360px] items-center justify-center sm:h-[440px] sm:w-[440px]">
      {/* Atmosphere */}
      <div className="absolute h-[340px] w-[340px] rounded-full bg-purple/10 blur-[90px]" />
      <div className="absolute h-[220px] w-[220px] rounded-full bg-orange/15 blur-[70px]" />

      {/* Faint concentric guide rings */}
      <div className="absolute h-[300px] w-[300px] rounded-full border border-border-soft sm:h-[380px] sm:w-[380px]" />
      <div className="absolute h-[190px] w-[190px] rounded-full border border-border-soft sm:h-[240px] sm:w-[240px]" />

      {/* Rotating token ring */}
      <motion.div
        className="absolute h-[300px] w-[300px] sm:h-[380px] sm:w-[380px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {RING_ITEMS.map((item, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{ transform: `rotate(${item.angle}deg)` }}
          >
            <motion.div
              className={
                "flex h-14 w-14 -translate-x-1/2 -translate-y-[150px] items-center justify-center rounded-token border-2 font-display text-sm font-semibold shadow-card sm:h-16 sm:w-16 sm:-translate-y-[190px]" +
                (item.tone === "purple"
                  ? " border-purple bg-bg-soft text-purple shadow-glow-purple"
                  : " border-orange bg-bg-soft text-orange shadow-glow-orange")
              }
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              {item.value}
            </motion.div>
          </div>
        ))}
      </motion.div>

      {/* Center piece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-purple/60 bg-surface/80 backdrop-blur-sm shadow-card sm:h-40 sm:w-40"
      >
        <span className="font-display text-4xl font-semibold text-purple sm:text-5xl">Q</span>
      </motion.div>
    </div>
  );
}
