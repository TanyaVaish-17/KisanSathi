import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MousePointer2, RotateCw } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function BrandHero({
  pill,
  top,
  highlight,
  bottom,
  badge,
  cursors,
  hindi = false,
}) {
  const [replayKey, setReplayKey] = useState(0);
  const reduce = useReducedMotion();

  const defaultPill = hindi ? "मंडी की वर्चुअल कतार" : "Virtual queue for mandis";
  const defaultTop = hindi ? ["अपनी बारी", "खेत से ही"] : ["BOOK YOUR", "TURN FROM"];
  const defaultHighlight = hindi ? "बुक करें" : "THE FIELD,";
  const defaultBottom = hindi ? ["कतार में", "खड़े हुए बिना।"] : ["NOT THE", "QUEUE."];
  const defaultBadge = hindi ? "खोजें। बुक करें। पहुँचें।" : "FIND. BOOK. ARRIVE.";
  const defaultCursors = hindi
    ? [
        { name: "रमेश (ऑपरेटर)", action: "अगला टोकन" },
        { name: "आशा (किसान)", action: "टोकन कन्फर्म" },
      ]
    : [
        { name: "Ramesh", action: "Calling next" },
        { name: "Asha", action: "Token booked" },
      ];

  const effectivePill = pill || defaultPill;
  const effectiveTop = top || defaultTop;
  const effectiveHighlight = highlight || defaultHighlight;
  const effectiveBottom = bottom || defaultBottom;
  const effectiveBadge = badge || defaultBadge;
  const effectiveCursors = cursors || defaultCursors;

  // Entrance animation; returns empty object when the visitor prefers reduced motion
  const enter = (from, delay = 0, duration = 0.7) =>
    reduce
      ? {}
      : {
          initial: from,
          animate: { x: 0, y: 0, opacity: 1, scale: 1, scaleX: 1 },
          transition: { duration, delay, ease: EASE },
        };

  const line = "block";
  const headingType = hindi
    ? "leading-[1.35] tracking-normal"
    : "leading-[0.9] tracking-tighter";

  return (
    <div
      key={replayKey}
      className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-panel border border-line-strong bg-surface px-6 py-12 sm:px-12 bg-[linear-gradient(to_right,#e3e7e2_1px,transparent_1px),linear-gradient(to_bottom,#e3e7e2_1px,transparent_1px)] bg-[size:24px_24px]"
    >
      {/* Soft background glow */}
      <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-lime-brand/20 blur-3xl" />

      {/* Top pill */}
      <motion.div
        {...enter({ y: -20, opacity: 0 }, 0, 0.8)}
        className="z-10 mb-4 flex items-center gap-2 rounded-full border border-line-soft bg-white px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[.2em] text-forest-950"
      >
        <span className="h-2 w-2 rounded-full bg-forest-500 motion-safe:animate-pulse" />
        {effectivePill}
      </motion.div>

      {/* Headline stack */}
      <h1
        className={`z-10 flex select-none flex-col items-center text-center text-3xl font-bold text-forest-950 sm:text-5xl md:text-6xl ${headingType}`}
      >
        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.15)}>
          {effectiveTop[0]}
        </motion.span>
        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.25)}>
          {effectiveTop[1]}
        </motion.span>

        {/* Highlighted row with selection-box handles */}
        <span className="relative my-1.5 block px-3 py-1">
          <motion.span
            aria-hidden="true"
            {...enter({ scaleX: 0 }, 0.35, 1.0)}
            className="absolute inset-0 origin-left border border-forest-950 bg-lime-brand"
          />
          {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map(
            (pos, i) => (
              <motion.span
                key={pos}
                aria-hidden="true"
                {...enter({ scale: 0 }, 0.7 + i * 0.08, 0.4)}
                className={`absolute ${pos} z-20 h-2 w-2 border border-forest-950 bg-white`}
              />
            )
          )}
          <span className="relative z-10 text-forest-950">{effectiveHighlight}</span>
        </span>

        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.45)}>
          {effectiveBottom[0]}
        </motion.span>
        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.55)}>
          {effectiveBottom[1]}
        </motion.span>
      </h1>

      {/* Floating cursor 1 (top right): operator */}
      <motion.div
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, scale: 0.8, x: 20 }}
        animate={
          reduce
            ? undefined
            : { opacity: 1, scale: 1, x: [0, 8, -4, 0], y: [0, -6, 3, 0] }
        }
        transition={{
          opacity: { duration: 0.8, delay: 0.6, ease: EASE },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute right-4 top-10 z-30 flex scale-90 items-center sm:right-8 sm:top-12 sm:scale-100"
      >
        <MousePointer2 className="h-4 w-4 -rotate-12 fill-current text-forest-800" />
        <div className="ml-1 flex items-center gap-1 whitespace-nowrap rounded-md rounded-tl-none bg-forest-800 px-2.5 py-0.5 text-[10px] font-bold text-white">
          <span>{effectiveCursors[0].name}</span>
          <span className="text-[8px] font-normal opacity-80">{effectiveCursors[0].action}</span>
        </div>
      </motion.div>

      {/* Floating cursor 2 (bottom left): farmer */}
      <motion.div
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, scale: 0.8, x: -20 }}
        animate={
          reduce
            ? undefined
            : { opacity: 1, scale: 1, x: [0, -8, 6, 0], y: [0, 8, -4, 0] }
        }
        transition={{
          opacity: { duration: 0.8, delay: 0.7, ease: EASE },
          x: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
        }}
        className="pointer-events-none absolute bottom-10 left-4 z-30 flex scale-90 items-center sm:bottom-14 sm:left-8 sm:scale-100"
      >
        <MousePointer2 className="h-4 w-4 -rotate-12 fill-current text-warn" />
        <div className="ml-1 flex items-center gap-1 whitespace-nowrap rounded-md rounded-tl-none bg-warn px-2.5 py-0.5 text-[10px] font-bold text-forest-950">
          <span>{effectiveCursors[1].name}</span>
          <span className="text-[8px] font-normal opacity-80">{effectiveCursors[1].action}</span>
        </div>
      </motion.div>

      {/* Replay badge */}
      <motion.div {...enter({ y: 20, opacity: 0 }, 0.65)} className="z-10 mt-6">
        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          aria-label="Replay animation"
          className="flex items-center gap-2 rounded-full bg-lime-brand px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-forest-950 transition-colors hover:bg-mint-200 cursor-pointer"
        >
          {effectiveBadge}
          <RotateCw className="h-3 w-3" aria-hidden="true" />
        </button>
      </motion.div>
    </div>
  );
}
