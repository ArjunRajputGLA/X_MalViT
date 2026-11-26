"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-shimmer rounded-tile border border-line/60", className)}
      {...props}
    />
  );
};
