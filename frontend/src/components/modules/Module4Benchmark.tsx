"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid, ShieldAlert, ShieldCheck, SlidersHorizontal, Trophy } from "lucide-react";
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
      className="overflow-x-auto py-2"
    >
      <p className="sr-only">
        Confusion matrix across {families.join(", ")}. Diagonal recall ranges from {diagMin}% to {diagMax}%.
      </p>
      <div className="min-w-fit mx-auto flex flex-col xl:flex-row items-center xl:items-end justify-center gap-6 px-2">
        <div className="inline-flex flex-col items-center">
          <div className="pl-28 text-[12px] font-medium text-muted mb-1">
            Predicted Family
          </div>

          {/* Rotated column headers */}
          <div className="flex items-end pl-28 h-24 mb-1.5">
            {families.map((fam, cIdx) => {
              const isColHighlighted = hoveredCell?.col === cIdx;
              return (
                <div
                  key={fam}
                  className="w-8 flex-shrink-0 flex items-end justify-center relative"
                >
                  <span
                    title={fam}
                    className={`inline-block origin-bottom-left -rotate-45 translate-x-2.5 -translate-y-0.5 whitespace-nowrap text-[10px] font-mono transition-colors ${
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

          <div className="flex items-center">
            <div className="w-5 flex items-center justify-center flex-shrink-0 mr-1">
              <span className="-rotate-90 whitespace-nowrap text-[12px] font-medium text-muted">
                Actual
              </span>
            </div>

            <div className="space-y-[2px]">
              {matrix.map((row, rIdx) => {
                const famName = families[rIdx];
                const isRowHighlighted = hoveredCell?.row === rIdx;

                return (
                  <div key={famName} className="flex items-center">
                    <div
                      className={`w-24 pr-2 text-right text-[10px] font-mono whitespace-nowrap flex-shrink-0 truncate transition-colors ${
                        isRowHighlighted
                          ? "text-ink font-semibold"
                          : "text-muted font-medium"
                      }`}
                      title={famName}
                    >
                      {famName}
                    </div>

                    <div className="flex gap-[2px]">
                      {row.map((val, cIdx) => {
                        const isHovered =
                          hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;
                        const isCrosshair =
                          !isHovered &&
                          (hoveredCell?.row === rIdx || hoveredCell?.col === cIdx);

                        const mixPct =
                          val === 0 ? 4 : Math.round(12 + (val / 100) * 88);

                        const tooltipAlign =
                          cIdx < 4
                            ? "left-0"
                            : cIdx >= families.length - 4
                            ? "right-0"
                            : "left-1/2 -translate-x-1/2";

                        return (
                          <div
                            key={cIdx}
                            onMouseEnter={() =>
                              setHoveredCell({ row: rIdx, col: cIdx })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              backgroundColor: `color-mix(in srgb, var(--accent) ${mixPct}%, transparent)`,
                            }}
                            className={`relative w-8 h-6 rounded-[3px] flex items-center justify-center text-[10px] tabular-nums transition-colors cursor-default select-none ${
                              val === 0
                                ? "border border-line/50 text-transparent"
                                : val > 50
                                ? "text-on-accent font-semibold"
                                : "text-ink font-medium border border-accent/20"
                            } ${
                              isHovered
                                ? "ring-2 ring-ink dark:ring-white z-30"
                                : isCrosshair
                                ? "ring-1 ring-accent/40 z-10"
                                : ""
                            }`}
                          >
                            <span>{val > 0 ? val : ""}</span>
                            {isHovered && (
                              <div
                                role="tooltip"
                                className={`pointer-events-none absolute bottom-full mb-1.5 ${tooltipAlign} z-40 whitespace-nowrap rounded-chip bg-ink text-surface px-2.5 py-1 text-[11px] font-mono font-medium shadow-panel tabular-nums`}
                              >
                                Actual {famName} &rarr; Predicted {families[cIdx]}: {val}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 0-100% Scale Legend */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 pb-1">
          <span className="text-[12px] font-medium text-muted">Recall</span>
          <div className="flex flex-row items-center gap-2">
            <div
              className="w-3 h-44 rounded-full border border-line"
              style={{
                background:
                  "linear-gradient(to bottom, var(--accent) 0%, color-mix(in srgb, var(--accent) 4%, transparent) 100%)",
              }}
              aria-hidden="true"
            />
            <div className="flex flex-col justify-between h-44 text-[11px] font-mono text-muted tabular-nums">
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
  const [ablations, setAblations] = useState<any[]>([]);
  const [overlayRobustness, setOverlayRobustness] = useState<any[]>([]);
  const [confusionMatrix, setConfusionMatrix] = useState<{
    families: string[];
    matrix: number[][];
    metadata?: any;
  } | null>(null);

  useEffect(() => {
    fetch("/api/benchmarks")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        setBenchmarkModels(data.benchmark_models || []);
        setAblations(data.ablations || []);
        setOverlayRobustness(data.overlay_robustness || []);
        setConfusionMatrix(data.confusion_matrix || null);
      })
      .catch((err) => console.error("Error loading benchmarks:", err));
  }, []);

  const bestAccuracy =
    benchmarkModels.length > 0
      ? Math.max(...benchmarkModels.map((r) => parseMetricNumber(r.accuracy)).filter((n) => !Number.isNaN(n)))
      : NaN;
  const bestWeightedF1 =
    benchmarkModels.length > 0
      ? Math.max(...benchmarkModels.map((r) => parseMetricNumber(r.weighted_f1)).filter((n) => !Number.isNaN(n)))
      : NaN;
  const bestMacroF1 =
    benchmarkModels.length > 0
      ? Math.max(...benchmarkModels.map((r) => parseMetricNumber(r.macro_f1)).filter((n) => !Number.isNaN(n)))
      : NaN;
  const bestErrors =
    benchmarkModels.length > 0
      ? Math.min(...benchmarkModels.map((r) => parseMetricNumber(r.errors)).filter((n) => !Number.isNaN(n)))
      : NaN;

  return (
    <div className="space-y-6">
      {/* Table II: Clean Classification Performance */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Table II — Stratified Malimg Test Split (N = 1,868 Images)
          </CardTitle>
          <Badge variant="cyber" className="tabular-nums">
            Paper Results (95% Wilson CI)
          </Badge>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto rounded-tile border border-line">
            <table className="w-full text-[13px] text-left text-ink tabular-nums">
              <thead className="text-[13px] bg-surface-2 text-muted border-b border-line font-medium">
                <tr>
                  <th className="py-3 px-3 font-medium sticky left-0 z-10 bg-surface-2 border-r border-line/60 whitespace-nowrap">
                    Model
                  </th>
                  <th className="py-3 px-3 font-medium whitespace-nowrap">Input</th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">Params</th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">Accuracy</th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">95% CI</th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">Errors</th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">Weighted F1</th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">Macro-F1</th>
                  <th className="py-3 px-3 font-medium text-right whitespace-nowrap">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {benchmarkModels.length === 0 ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      {Array.from({ length: 9 }).map((__, cIdx) => (
                        <td key={cIdx} className="py-3 px-3">
                          <Skeleton className="h-4 w-20 rounded-chip" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  benchmarkModels.map((row) => {
                    const isOurs = row.model.includes("X-MalViT");
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
                        <td className="py-3 px-3 text-muted whitespace-nowrap">{row.input_format}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">{row.parameters}</td>
                        <td className={`py-3 px-3 text-right whitespace-nowrap ${row.accuracy === bestAccuracy ? "font-semibold" : ""}`}>
                          {row.accuracy.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right text-muted font-mono text-[12px] whitespace-nowrap">
                          {row.ci_95}
                        </td>
                        <td className={`py-3 px-3 text-right whitespace-nowrap ${row.errors === bestErrors ? "font-semibold" : ""}`}>
                          {row.errors}
                        </td>
                        <td className={`py-3 px-3 text-right whitespace-nowrap ${row.weighted_f1 === bestWeightedF1 ? "font-semibold" : ""}`}>
                          {row.weighted_f1.toFixed(2)}%
                        </td>
                        <td className={`py-3 px-3 text-right whitespace-nowrap ${row.macro_f1 === bestMacroF1 ? "font-semibold" : ""}`}>
                          {row.macro_f1.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">{row.latency}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-muted mt-3 leading-[1.5]">
            Single-image batch-1 forward latency measured on an NVIDIA RTX 4050 Laptop GPU unless marked CPU. Random forest and MobileNetV2 score 5–7 fewer errors on clean data with overlapping 95% Wilson intervals; robustness and patch-level explainability differentiate X-MalViT.
          </p>
        </CardContent>
      </Card>

      {/* Table III & Table IV side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table III: Ablation */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2">
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-accent" />
              Table III — Architectural &amp; Loss Ablations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto rounded-tile border border-line">
              <table className="w-full text-[13px] text-left text-ink tabular-nums">
                <thead className="bg-surface-2 text-muted border-b border-line font-medium">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Configuration</th>
                    <th className="py-2.5 px-3 font-medium text-right">Params</th>
                    <th className="py-2.5 px-3 font-medium text-right">Accuracy</th>
                    <th className="py-2.5 px-3 font-medium text-right">Macro-F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ablations.map((row, idx) => (
                    <tr key={row.config} className={idx === 0 ? "bg-accent-soft font-semibold" : "hover:bg-surface-2"}>
                      <td className="py-2.5 px-3 font-mono text-[12px]">{row.config}</td>
                      <td className="py-2.5 px-3 text-right">{row.parameters}</td>
                      <td className="py-2.5 px-3 text-right">{row.accuracy.toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-right">{row.macro_f1.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Table IV: Overlay Injection Robustness */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2">
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent" />
              Table IV — End-of-File Overlay Robustness (% Acc)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto rounded-tile border border-line">
              <table className="w-full text-[13px] text-left text-ink tabular-nums">
                <thead className="bg-surface-2 text-muted border-b border-line font-medium">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Overlay</th>
                    <th className="py-2.5 px-3 font-medium">Model</th>
                    <th className="py-2.5 px-3 font-medium text-right">0%</th>
                    <th className="py-2.5 px-3 font-medium text-right">10%</th>
                    <th className="py-2.5 px-3 font-medium text-right">20%</th>
                    <th className="py-2.5 px-3 font-medium text-right">30%</th>
                    <th className="py-2.5 px-3 font-medium text-right">40%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {overlayRobustness.map((row, idx) => {
                    const isOA = row.model.includes("OA");
                    return (
                      <tr key={idx} className={isOA ? "bg-accent-soft font-semibold" : "hover:bg-surface-2"}>
                        <td className="py-2.5 px-3 text-muted whitespace-nowrap">{row.overlay}</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{row.model}</td>
                        <td className="py-2.5 px-3 text-right">{row.r0.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right">{row.r10.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right">{row.r20.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right">{row.r30.toFixed(2)}</td>
                        <td className={`py-2.5 px-3 text-right ${isOA ? "text-ok-ink font-semibold" : row.r40 < 20 ? "text-critical-ink font-semibold" : ""}`}>
                          {row.r40.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-muted mt-3 leading-[1.5]">
              Note: ResNet-18 was trained without overlay augmentation; OA restores ViT 40%-zero-overlay retention from 9.10% to 93.68%.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real 25x25 Normalized Confusion Matrix */}
      {confusionMatrix && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-accent" />
              25-Family Normalized Confusion Matrix (%)
            </CardTitle>
            {confusionMatrix.metadata && (
              <Badge variant="cyber" className="tabular-nums">
                {confusionMatrix.metadata.source} &bull; {confusionMatrix.metadata.accuracy}% Acc ({confusionMatrix.metadata.errors}/{confusionMatrix.metadata.n_test} errors)
              </Badge>
            )}
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
