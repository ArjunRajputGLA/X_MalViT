import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLatency(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}

export function formatPercent(val: number): string {
  return `${(val * 100).toFixed(2)}%`;
}
