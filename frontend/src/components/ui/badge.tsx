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
          "bg-blue-50 text-blue-700 border-blue-200": variant === "default",
          "bg-slate-100 text-slate-700 border-slate-200": variant === "secondary",
          "bg-rose-50 text-rose-700 border-rose-200": variant === "destructive",
          "bg-emerald-50 text-emerald-700 border-emerald-200": variant === "success",
          "bg-amber-50 text-amber-700 border-amber-200": variant === "warning",
          "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold": variant === "cyber",
          "border-slate-200 text-slate-600 bg-white": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
