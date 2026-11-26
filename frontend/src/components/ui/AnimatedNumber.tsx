"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number | string;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  useGrouping?: boolean;
  className?: string;
}

function parseDisplayValue(
  raw: number | string,
  overrideDecimals?: number,
  overrideSuffix?: string,
  overridePrefix?: string,
  overrideGrouping?: boolean
) {
  if (typeof raw === "number") {
    return {
      prefix: overridePrefix ?? "",
      target: raw,
      decimals: overrideDecimals ?? 0,
      useGrouping: overrideGrouping ?? false,
      suffix: overrideSuffix ?? "",
    };
  }

  const match = raw.match(/^([^\d.-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return null;
  }

  const [, pre, numPart, post] = match;
  const hasCommas = numPart.includes(",");
  const dotIdx = numPart.indexOf(".");
  const parsedDecimals = dotIdx >= 0 ? numPart.length - dotIdx - 1 : 0;
  const target = parseFloat(numPart.replace(/,/g, ""));

  if (Number.isNaN(target)) {
    return null;
  }

  return {
    prefix: overridePrefix ?? pre,
    target,
    decimals: overrideDecimals ?? parsedDecimals,
    useGrouping: overrideGrouping ?? hasCommas,
    suffix: overrideSuffix ?? post,
  };
}

function formatNumber(
  val: number,
  decimals: number,
  useGrouping: boolean,
  prefix: string,
  suffix: string
) {
  const fixed = val.toFixed(decimals);
  let formatted = fixed;
  if (useGrouping) {
    const [intPart, decPart] = fixed.split(".");
    const grouped = Number(intPart).toLocaleString("en-US");
    formatted = decPart !== undefined ? `${grouped}.${decPart}` : grouped;
  }
  return `${prefix}${formatted}${suffix}`;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals,
  suffix,
  prefix,
  useGrouping,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const parsed = parseDisplayValue(value, decimals, suffix, prefix, useGrouping);
  const hasMountedOnce = useRef(false);
  const [displayVal, setDisplayVal] = useState<number>(0);

  useEffect(() => {
    if (!parsed) return;

    if (shouldReduceMotion || hasMountedOnce.current) {
      setDisplayVal(parsed.target);
      return;
    }

    hasMountedOnce.current = true;
    const controls = animate(0, parsed.target, {
      duration: 0.7,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayVal(latest),
      onComplete: () => setDisplayVal(parsed.target),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.target, shouldReduceMotion]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {formatNumber(
        displayVal,
        parsed.decimals,
        parsed.useGrouping,
        parsed.prefix,
        parsed.suffix
      )}
    </span>
  );
};
