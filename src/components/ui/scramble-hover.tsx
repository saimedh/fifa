// Adapted from React Bits — ScrambleHover
// Original: "use client" removed (Vite/React, not Next.js)

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ScrambleHoverRevealDirection =
  | "start"
  | "end"
  | "center"
  | "random";

export type ScrambleHoverProps = {
  children: string;
  className?: string;
  scrambleSpeed?: number;
  maxIterations?: number;
  revealDirection?: ScrambleHoverRevealDirection;
  useOriginalCharsOnly?: boolean;
  characterSet?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
};

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function scrambleChar(
  char: string,
  charset: string,
  useOriginalOnly: boolean,
  originalChars: string[],
): string {
  if (char === " ") return " ";
  if (useOriginalOnly) {
    return (
      originalChars[Math.floor(Math.random() * originalChars.length)] ?? char
    );
  }
  return charset[Math.floor(Math.random() * charset.length)] ?? char;
}

export function ScrambleHover({
  children,
  className,
  scrambleSpeed = 50,
  maxIterations = 10,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characterSet = DEFAULT_CHARS,
  onHoverStart,
  onHoverEnd,
}: ScrambleHoverProps) {
  const [displayText, setDisplayText] = useState(children);
  const iterationRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const originalChars = children.split("").filter((c) => c !== " ");

  const startScramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    iterationRef.current = 0;
    onHoverStart?.();

    intervalRef.current = setInterval(() => {
      const iter = iterationRef.current;
      const progress = iter / maxIterations;
      const revealUpTo = Math.floor(progress * children.length);

      setDisplayText(
        children
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (revealDirection === "start" && i < revealUpTo) return char;
            if (
              revealDirection === "end" &&
              i >= children.length - revealUpTo
            )
              return char;
            return scrambleChar(
              char,
              characterSet,
              useOriginalCharsOnly,
              originalChars,
            );
          })
          .join(""),
      );

      iterationRef.current++;

      if (iter >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(children);
      }
    }, scrambleSpeed);
  }, [
    children,
    maxIterations,
    scrambleSpeed,
    revealDirection,
    characterSet,
    useOriginalCharsOnly,
    originalChars,
    onHoverStart,
  ]);

  const stopScramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(children);
    onHoverEnd?.();
  }, [children, onHoverEnd]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  return (
    <motion.span
      aria-label={children}
      className={cn("inline-block cursor-default font-mono", className)}
      onHoverEnd={stopScramble}
      onHoverStart={startScramble}
    >
      <span aria-hidden="true">{displayText}</span>
    </motion.span>
  );
}

export default ScrambleHover;
