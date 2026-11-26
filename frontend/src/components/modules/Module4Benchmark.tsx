"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid, ShieldCheck, Trophy } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* SOTA Comparative Benchmark Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-high" />
            SOTA Benchmark &amp; Ablation Performance (Section V Paper Comparison)
          </CardTitle>
          <Badge variant="cyber" className="tabular-nums">Malimg Benchmark (9,339 Samples)</Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left text-ink tabular-nums">
              <thead className="text-[13px] bg-surface-2 text-muted border-b border-line font-medium">
                <tr>
                  <th className="py-3 px-3 font-medium">Model architecture</th>
                  <th className="py-3 px-3 font-medium">Input format</th>
                  <th className="py-3 px-3 font-medium">Parameters</th>
                  <th className="py-3 px-3 font-medium">Accuracy</th>
                  <th className="py-3 px-3 font-medium">Precision</th>
                  <th className="py-3 px-3 font-medium">F1-score</th>
                  <th className="py-3 px-3 font-medium">Inference latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {benchmarkModels.map((row) => {
                  const isOurs = row.model.includes("X-MalViT");
                  return (
                    <tr
                      key={row.model}
                      className={
                        isOurs
                          ? "bg-accent-soft/60 border-l-4 border-accent font-semibold"
                          : "hover:bg-surface-2 transition-colors"
                      }
                    >
                      <td className="py-3 px-3 font-semibold flex items-center gap-1.5">
                        {isOurs && <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />}
                        <span className="text-ink">{row.model}</span>
                      </td>
                      <td className="py-3 px-3 text-muted">{row.input_format}</td>
                      <td className="py-3 px-3 text-ink tabular-nums">{row.parameters}</td>
                      <td className="py-3 px-3 text-ok font-semibold tabular-nums">{row.accuracy}%</td>
                      <td className="py-3 px-3 text-ink tabular-nums">{row.precision}%</td>
                      <td className="py-3 px-3 text-accent font-semibold tabular-nums">{row.f1_score}%</td>
                      <td className="py-3 px-3 text-ink font-medium tabular-nums">{row.latency}</td>
                    </tr>
                  );
                })}
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
            <div className="overflow-x-auto flex justify-center py-2">
              <div className="inline-block">
                {/* Header Row */}
                <div className="flex items-center pl-28 mb-1.5">
                  {confusionMatrix.families.map((fam) => (
                    <div
                      key={fam}
                      className="w-14 text-center text-[12px] font-mono text-muted font-medium truncate px-0.5"
                      title={fam}
                    >
                      {fam.split(".")[0]}
                    </div>
                  ))}
                </div>

                {/* Matrix Rows */}
                {confusionMatrix.matrix.map((row, rIdx) => {
                  const famName = confusionMatrix.families[rIdx];
                  return (
                    <div key={famName} className="flex items-center mb-1">
                      <div
                        className="w-28 text-right pr-3 text-[12px] font-mono font-medium text-muted truncate"
                        title={famName}
                      >
                        {famName}
                      </div>
                      <div className="flex gap-1">
                        {row.map((val, cIdx) => {
                          const isHigh = val >= 90;
                          const isZero = val === 0;
                          return (
                            <div
                              key={cIdx}
                              title={`True: ${famName} | Predicted: ${confusionMatrix.families[cIdx]} | Value: ${val}%`}
                              className={`w-14 h-9 rounded-chip flex items-center justify-center text-[12px] font-semibold tabular-nums transition-transform hover:scale-105 cursor-pointer ${
                                isHigh
                                  ? "bg-accent text-white"
                                  : isZero
                                  ? "bg-surface-2 text-muted border border-line"
                                  : "bg-accent-soft text-accent border border-accent/20"
                              }`}
                            >
                              {val}%
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
