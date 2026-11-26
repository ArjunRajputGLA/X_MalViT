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
          "inline-flex items-center justify-center whitespace-nowrap rounded-chip text-[14px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
          {
            "bg-accent text-on-accent hover:bg-accent/90 hover:shadow-[0_2px_12px_color-mix(in_srgb,var(--accent)_35%,transparent)]": variant === "default" || variant === "cyber",
            "bg-critical text-white hover:bg-critical/90 hover:shadow-[0_2px_10px_color-mix(in_srgb,var(--critical)_30%,transparent)]": variant === "destructive",
            "border border-line bg-surface text-ink hover:bg-surface-2 hover:border-accent/40": variant === "outline",
            "bg-surface-2 text-ink border border-line hover:bg-line/50": variant === "secondary",
            "hover:bg-surface-2 text-muted hover:text-ink": variant === "ghost",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-[13px]": size === "sm",
            "h-11 px-6 text-[14px] font-semibold": size === "lg",
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
