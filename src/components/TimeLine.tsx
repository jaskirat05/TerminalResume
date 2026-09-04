import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { TimelineEvent } from "../app/data/event.model";

interface TimelineItemProps {
  event: TimelineEvent;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event }) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative pl-10 pb-10"
    >
      <span className="absolute left-2 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-claudeOrange shadow-[0_0_0_4px_#1b1b1b]" />
      <div className="rounded-lg border border-[#3d3a36] bg-[#262626] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-base font-semibold text-claudeText sm:text-lg">
            {event.title}
          </h3>
          <time className="font-mono text-sm text-claudeOrange">
            {event.dateFrom} — {event.dateTo}
          </time>
        </div>
        {event.location ? (
          <div className="mt-1 font-mono text-xs uppercase tracking-wide text-[#6e6a63]">
            {event.location}
          </div>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-claudeText/80">
          {event.content}
        </p>
      </div>
    </motion.div>
  );
};

interface TimelineProps {
  events: TimelineEvent[];
  closeVisuals: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ events, closeVisuals }) => {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={closeVisuals}
          className="rounded-md border border-[#3d3a36] bg-[#262626] px-3 py-1 font-mono text-sm text-claudeText/70 transition-colors hover:border-claudeOrange hover:text-claudeOrange"
        >
          ✕ close
        </button>
      </div>

      <div className="relative pb-40">
        <div className="absolute left-2 top-1.5 bottom-0 w-px bg-gradient-to-b from-claudeOrange/70 via-claudeOrange/40 to-transparent" />
        {events.map((event, index) => (
          <TimelineItem key={index} event={event} />
        ))}
      </div>

      <RunningDino />
    </div>
  );
};

const RunningDino: React.FC = () => (
  <div className="dino-runner" aria-hidden="true">
    <span>🦖</span>
  </div>
);

export default Timeline;
