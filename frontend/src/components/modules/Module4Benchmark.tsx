"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid, ShieldCheck, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

function parseMetricNumber(val: string | number | undefined): number {
  if (typeof val === "number") return val;
  if (!val) return NaN;
  const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function renderModelWithCitations(modelName: string) {
  const parts = modelName.split(/(\[\d+\])/g);
  return parts.map((part, idx) =>
    /^\[\d+\]$/.test(part) ? (
      <sup key={idx} className="text-[10px] text-muted font-normal ml-0.5">
        {part}
      </sup>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

function ConfusionMatrixHeatmap({
  families,
  matrix,
}: {
  families: string[];
  matrix: number[][];
}) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(
    null
  );
  const prefersReducedMotion = useReducedMotion();
  const maxDiag = Math.max(1, (families.length - 1) * 2);

  const diagMin =
    matrix.length > 0
      ? Math.min(...matrix.map((row, idx) => row[idx] ?? 0))
      : 0;
  const diagMax =
    matrix.length > 0
      ? Math.max(...matrix.map((row, idx) => row[idx] ?? 0))
      : 0;

  return (
    <div
      role="region"
      aria-label={`Normalized confusion matrix across ${families.length} malware families`}
      className="overflow-x-auto py-3"
    >
      <p className="sr-only">
        Confusion matrix across {families.join(", ")}. Diagonal accuracy ranges from {diagMin}% to {diagMax}%.
      </p>
      <div className="min-w-fit mx-auto flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 px-4">
        <div className="inline-flex flex-col items-center">
          {/* Predicted column axis title */}
          <div className="pl-32 text-[12px] font-medium text-muted mb-2 tracking-normal">
            Predicted
          </div>

          {/* Rotated -45 deg column headers */}
          <div className="flex items-end pl-32 h-24 mb-2">
            {families.map((fam, cIdx) => {
              const isColHighlighted = hoveredCell?.col === cIdx;
              return (
                <div
                  key={fam}
                  className="w-14 flex-shrink-0 flex items-end justify-center relative"
                >
                  <span
                    title={fam}
                    className={`inline-block origin-bottom-left -rotate-45 translate-x-3 -translate-y-1 whitespace-nowrap text-[12px] font-mono transition-colors ${
                      isColHighlighted
                        ? "text-ink font-semibold"
                        : "text-muted font-medium"
                    }`}
                  >
                    {fam}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rows with Actual axis label */}
          <div className="flex items-center">
            <div className="w-6 flex items-center justify-center flex-shrink-0 mr-1">
              <span className="-rotate-90 whitespace-nowrap text-[12px] font-medium text-muted">
                Actual
              </span>
            </div>

            <div className="space-y-1">
              {matrix.map((row, rIdx) => {
                const famName = families[rIdx];
                const isRowHighlighted = hoveredCell?.row === rIdx;

                return (
                  <div key={famName} className="flex items-center">
                    <div
                      className={`w-28 pr-3 text-right text-[12px] font-mono whitespace-nowrap flex-shrink-0 transition-colors ${
                        isRowHighlighted
                          ? "text-ink font-semibold"
                          : "text-muted font-medium"
                      }`}
                      title={famName}
                    >
                      {famName}
                    </div>

                    <div className="flex gap-1">
                      {row.map((val, cIdx) => {
                        const isHovered =
                          hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;
                        const isCrosshair =
                          !isHovered &&
                          (hoveredCell?.row === rIdx || hoveredCell?.col === cIdx);

                        const mixPct =
                          val === 0 ? 4 : Math.round(10 + (val / 100) * 90);
                        const delay = prefersReducedMotion
                          ? 0
                          : ((rIdx + cIdx) / maxDiag) * 0.4;

                        const tooltipAlign =
                          cIdx < 2
                            ? "left-0"
                            : cIdx >= families.length - 2
                            ? "right-0"
                            : "left-1/2 -translate-x-1/2";

                        return (
                          <motion.div
                            key={cIdx}
                            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: prefersReducedMotion ? 0 : 0.22,
                              delay,
                              ease: "easeOut",
                            }}
                            onMouseEnter={() =>
                              setHoveredCell({ row: rIdx, col: cIdx })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              backgroundColor: `color-mix(in srgb, var(--accent) ${mixPct}%, transparent)`,
                            }}
                            className={`relative w-14 h-9 rounded-chip flex items-center justify-center text-[12px] tabular-nums transition-all duration-150 cursor-default select-none hover:scale-105 ${
                              val === 0
                                ? "border border-line/70 text-muted font-normal"
                                : val > 50
                                ? "text-on-accent font-semibold"
                                : "text-ink font-medium border border-accent/15"
                            } ${
                              isHovered
                                ? "ring-2 ring-ink dark:ring-white z-30"
                                : isCrosshair
                                ? "ring-1 ring-accent/50 z-10"
                                : ""
                            }`}
                          >
                            <span>{val}%</span>
                            {isHovered && (
                              <div
                                role="tooltip"
                                className={`pointer-events-none absolute bottom-full mb-2 ${tooltipAlign} z-40 whitespace-nowrap rounded-chip bg-ink text-surface px-2.5 py-1 text-[11px] font-mono font-medium shadow-panel tabular-nums`}
                              >
                                Actual {famName} &rarr; Predicted {families[cIdx]}: {val}%
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 0-100% Single-hue Scale Legend */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 pb-1">
          <span className="text-[12px] font-medium text-muted">Scale</span>
          <div className="flex flex-row items-center gap-2">
            <div
              className="w-3 h-48 rounded-full border border-line"
              style={{
                background:
                  "linear-gradient(to bottom, var(--accent) 0%, color-mix(in srgb, var(--accent) 4%, transparent) 100%)",
              }}
              aria-hidden="true"
            />
            <div className="flex flex-col justify-between h-48 text-[11px] font-mono text-muted tabular-nums">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Module4Benchmark: React.FC = () => {
  const [benchmarkModels, setBenchmarkModels] = useState<any[]>([]);
  const [confusionMatrix, setConfusionMatrix] = useState<{ families: string[]; matrix: number[][] } | null>(null);

  useEffect(() => {
    fetch("/api/benchmarks")
      .then((res) => res.json())
      .then((data) => {
        setBenchmarkModels(data.benchmark_models || []);
        setConfusionMatrix(data.confusion_matrix || null);
      })
      .catch((err) => console.error("Error loading benchmarks:", err));
  }, []);

  const bestParameters =
    benchmarkModels.length > 0
      ? Math.min(
          ...benchmarkModels
            .map((r) => parseMetricNumber(r.parameters))
            .filter((n) => !Number.isNaN(n))
        )
      : NaN;
  const bestAccuracy =
    benchmarkModels.length > 0
      ? Math.max(
          ...benchmarkModels
            .map((r) => parseMetricNumber(r.accuracy))
            .filter((n) => !Number.isNaN(n))
        )
      : NaN;
  const bestPrecision =
    benchmarkModels.length > 0
      ? Math.max(
          ...benchmarkModels
            .map((r) => parseMetricNumber(r.precision))
            .filter((n) => !Number.isNaN(n))
        )
      : NaN;
  const bestF1 =
    benchmarkModels.length > 0
      ? Math.max(
          ...benchmarkModels
            .map((r) => parseMetricNumber(r.f1_score))
            .filter((n) => !Number.isNaN(n))
        )
      : NaN;
  const bestLatency =
    benchmarkModels.length > 0
      ? Math.min(
          ...benchmarkModels
            .map((r) => parseMetricNumber(r.latency))
            .filter((n) => !Number.isNaN(n))
        )
      : NaN;

  return (
    <div className="space-y-6">
      {/* SOTA Comparative Benchmark Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            SOTA Benchmark &amp; Ablation Performance (Section V Paper Comparison)
          </CardTitle>
          <Badge variant="cyber" className="tabular-nums">
            Malimg Benchmark (9,339 Samples)
          </Badge>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto rounded-tile border border-line">
            <table className="w-full text-[13px] text-left text-ink tabular-nums">
              <thead className="text-[13px] bg-surface-2 text-muted border-b border-line font-medium">
                <tr>
                  <th className="py-3 px-3 font-medium sticky left-0 z-10 bg-surface-2 border-r border-line/60 whitespace-nowrap">
                    Model architecture
                  </th>
                  <th className="py-3 px-3 font-medium whitespace-nowrap">
                    Input format
                  </th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">
                    Parameters
                  </th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">
                    Accuracy
                  </th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">
                    Precision
                  </th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">
                    F1-score
                  </th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">
                    Inference latency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {benchmarkModels.length === 0 ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 sticky left-0 z-10 bg-surface border-r border-line/60">
                        <Skeleton className="h-4 w-40 rounded-chip" />
                      </td>
                      <td className="py-3 px-3">
                        <Skeleton className="h-4 w-28 rounded-chip" />
                      </td>
                      <td className="py-3 px-3">
                        <Skeleton className="h-4 w-16 ml-auto rounded-chip" />
                      </td>
                      <td className="py-3 px-3">
                        <Skeleton className="h-4 w-14 ml-auto rounded-chip" />
                      </td>
                      <td className="py-3 px-3">
                        <Skeleton className="h-4 w-14 ml-auto rounded-chip" />
                      </td>
                      <td className="py-3 px-3">
                        <Skeleton className="h-4 w-14 ml-auto rounded-chip" />
                      </td>
                      <td className="py-3 px-3">
                        <Skeleton className="h-4 w-16 ml-auto rounded-chip" />
                      </td>
                    </tr>
                  ))
                ) : (
                  benchmarkModels.map((row) => {
                    const isOurs = row.model.includes("X-MalViT");
                    const isBestParams = parseMetricNumber(row.parameters) === bestParameters;
                    const isBestAcc = parseMetricNumber(row.accuracy) === bestAccuracy;
                    const isBestPrec = parseMetricNumber(row.precision) === bestPrecision;
                    const isBestF1 = parseMetricNumber(row.f1_score) === bestF1;
                    const isBestLat = parseMetricNumber(row.latency) === bestLatency;

                    return (
                      <tr
                        key={row.model}
                        className={
                          isOurs
                            ? "bg-accent-soft"
                            : "hover:bg-accent-soft/35 transition-colors"
                        }
                      >
                        <td
                          className={`py-3 px-3 sticky left-0 z-10 border-r border-line/60 whitespace-nowrap ${
                            isOurs
                              ? "bg-accent-soft shadow-[inset_3px_0_0_var(--accent)] font-semibold"
                              : "bg-surface font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-ink">
                            {isOurs && (
                              <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
                            )}
                            <span>{renderModelWithCitations(row.model)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted whitespace-nowrap">
                          {row.input_format}
                        </td>
                        <td
                          className={`py-3 px-3 text-right text-ink tabular-nums whitespace-nowrap ${
                            isBestParams ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {row.parameters}
                        </td>
                        <td
                          className={`py-3 px-3 text-right text-ink tabular-nums whitespace-nowrap ${
                            isBestAcc ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {row.accuracy}%
                        </td>
                        <td
                          className={`py-3 px-3 text-right text-ink tabular-nums whitespace-nowrap ${
                            isBestPrec ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {row.precision}%
                        </td>
                        <td
                          className={`py-3 px-3 text-right text-ink tabular-nums whitespace-nowrap ${
                            isBestF1 ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {row.f1_score}%
                        </td>
                        <td
                          className={`py-3 px-3 text-right text-ink tabular-nums whitespace-nowrap ${
                            isBestLat ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {row.latency}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Normalized Confusion Matrix */}
      {confusionMatrix && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2">
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-accent" />
              Normalized Confusion Matrix (%) across Major Threat Families
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ConfusionMatrixHeatmap
              families={confusionMatrix.families}
              matrix={confusionMatrix.matrix}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
