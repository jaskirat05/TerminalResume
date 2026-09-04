"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DOTS = ["", ".", "..", "..."];

/**
 * Claude Code-style "thinking" indicator: a spinning/pulsing ✻ burst in Claude
 * orange next to a dim "Thinking" label with animated ellipsis. No card, no
 * border — just the spinner, matching how Claude Code shows in-flight work.
 */
export default function ClaudeThinkingIndicator() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d + 1) % DOTS.length);
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 font-mono select-none">
      <motion.span
        className="text-claudeOrange text-2xl leading-none"
        animate={{
          opacity: [1, 0.35, 1],
          rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
        }}
        transition={{
          opacity: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 1.6, repeat: Infinity, ease: "linear" },
        }}
        style={{ display: "inline-block" }}
      >
        ✻
      </motion.span>
      <span className="text-claudeText/60 text-base">
        Thinking{DOTS[dots]}
      </span>
    </div>
  );
}
