import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "cyber";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-chip border px-2.5 py-0.5 text-[12px] leading-[1.2] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        {
          "bg-accent-soft text-accent border-accent/20": variant === "default" || variant === "cyber",
          "bg-surface-2 text-muted border-line": variant === "secondary",
          "bg-critical-soft text-critical-ink border-critical/20": variant === "destructive",
          "bg-ok-soft text-ok-ink border-ok/20": variant === "success",
          "bg-high-soft text-high-ink border-high/20": variant === "warning",
          "border-line text-muted bg-surface": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
