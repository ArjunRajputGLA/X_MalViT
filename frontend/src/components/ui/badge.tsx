import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "cyber";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-sky-500/20 text-sky-400 border-sky-500/40": variant === "default",
          "border-transparent bg-slate-800 text-slate-300": variant === "secondary",
          "border-transparent bg-rose-500/20 text-rose-400 border-rose-500/40": variant === "destructive",
          "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/40": variant === "success",
          "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/40": variant === "warning",
          "border-transparent bg-gradient-to-r from-sky-500/30 to-indigo-500/30 text-sky-300 border-sky-400/50": variant === "cyber",
          "border-slate-700 text-slate-300": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
