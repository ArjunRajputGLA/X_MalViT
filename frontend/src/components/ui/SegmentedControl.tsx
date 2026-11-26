"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  indicator?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  layoutId,
  disabled = false,
  className,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      className={cn(
        "grid gap-1 p-1 bg-surface-2 border border-line rounded-tile w-full",
        disabled && "opacity-60",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const isDisabled = disabled || Boolean(opt.disabled);

        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-chip text-[13px] transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2",
              isDisabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer",
              isSelected
                ? "text-ink font-semibold"
                : "text-muted font-medium hover:text-ink"
            )}
          >
            {isSelected && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-chip bg-surface border border-line shadow-[0_1px_2px_rgba(18,26,43,0.06)]"
                aria-hidden="true"
              />
            )}
            <span className="relative z-10 inline-flex items-center justify-center gap-1.5 min-w-0">
              {opt.icon}
              <span className="truncate">{opt.label}</span>
              {opt.indicator}
            </span>
          </button>
        );
      })}
    </div>
  );
}
