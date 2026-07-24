"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "motion/react";
import { useEffect, useState } from "react";

interface AnimatedHeroProps {
  commandNames: string[];
}

export function AnimatedHero({ commandNames }: AnimatedHeroProps) {
  const [index, setIndex] = useState(0);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        prefersReducedMotion !== true &&
        document.visibilityState === "visible"
      ) {
        setIndex((prev) => (prev + 1) % commandNames.length);
      }
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [commandNames.length, prefersReducedMotion]);

  return (
    <h1 className="font-mono font-normal text-4xl text-neutral-800 tracking-tight md:text-5xl">
      <span>/arc</span>
      <span className="text-[var(--color-accent)]">:</span>
      <span className="relative inline-block min-w-[180px] md:min-w-[240px]">
        <LazyMotion features={domAnimation} strict>
          <AnimatePresence mode="wait">
            <m.span
              animate={{ opacity: 1, y: 0 }}
              className="inline-block text-[var(--color-accent)]"
              exit={
                prefersReducedMotion === true
                  ? { opacity: 0 }
                  : { opacity: 0, y: -10 }
              }
              initial={
                prefersReducedMotion === true
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10 }
              }
              key={commandNames[index]}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {commandNames[index]}
            </m.span>
          </AnimatePresence>
        </LazyMotion>
      </span>
    </h1>
  );
}
