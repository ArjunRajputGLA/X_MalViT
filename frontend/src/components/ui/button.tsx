import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "cyber";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-md shadow-sky-500/20": variant === "default",
            "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20": variant === "destructive",
            "border border-sky-500/30 bg-slate-900/60 text-sky-400 hover:bg-sky-950/40 hover:border-sky-400": variant === "outline",
            "bg-slate-800 text-slate-200 hover:bg-slate-700": variant === "secondary",
            "hover:bg-slate-800/60 text-slate-300 hover:text-white": variant === "ghost",
            "bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500 hover:shadow-sky-500/40 border border-sky-400/40": variant === "cyber",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-12 rounded-lg px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
