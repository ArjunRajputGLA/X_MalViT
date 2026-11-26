"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBarProps {
  percentage: number | string;
  className?: string;
  barClassName?: string;
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  percentage,
  className,
  barClassName,
}) => {
  const numeric =
    typeof percentage === "number"
      ? percentage
      : parseFloat(String(percentage).replace(/[^0-9.-]/g, "")) || 0;
  const clamped = Math.min(100, Math.max(0, numeric));

  return (
    <div
      className={cn(
        "w-full bg-surface-2 border border-line rounded-chip h-2 overflow-hidden",
        className
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn("h-full bg-accent rounded-chip", barClassName)}
      />
    </div>
  );
};
