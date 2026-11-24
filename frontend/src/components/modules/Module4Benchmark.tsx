"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Grid, Layers, ShieldCheck, Trophy } from "lucide-react";

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
    <div className="space-y-6">
      {/* SOTA Comparative Benchmark Table */}
      <Card className="border-sky-500/20 bg-slate-900/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-sky-400 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            SOTA Benchmark & Ablation Performance (Section V Paper Comparison)
          </CardTitle>
          <Badge variant="cyber">Malimg Benchmark (9,339 Samples)</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Model Architecture</th>
                  <th className="py-3 px-3">Input Format</th>
                  <th className="py-3 px-3">Parameters</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Precision</th>
                  <th className="py-3 px-3">F1-Score</th>
                  <th className="py-3 px-3">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {benchmarkModels.map((row) => {
                  const isOurs = row.model.includes("X-MalViT");
                  return (
                    <tr
                      key={row.model}
                      className={
                        isOurs
                          ? "bg-sky-500/10 border-l-4 border-sky-400 font-semibold"
                          : "hover:bg-slate-800/40"
                      }
                    >
                      <td className="py-2.5 px-3 font-sans font-bold flex items-center gap-1.5">
                        {isOurs && <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                        <span className={isOurs ? "text-sky-300" : "text-slate-200"}>{row.model}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">{row.input_format}</td>
                      <td className="py-2.5 px-3 text-slate-300">{row.parameters}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{row.accuracy}%</td>
                      <td className="py-2.5 px-3 text-slate-300">{row.precision}%</td>
                      <td className="py-2.5 px-3 text-indigo-400 font-bold">{row.f1_score}%</td>
                      <td className="py-2.5 px-3 text-amber-300">{row.latency}</td>
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
        <Card className="border-sky-500/20 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-sky-400 flex items-center gap-2">
              <Grid className="w-5 h-5 text-sky-400" />
              Normalized Confusion Matrix (%) across Major Threat Families
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto flex justify-center py-2">
              <div className="inline-block">
                {/* Header Row */}
                <div className="flex items-center pl-28 mb-1">
                  {confusionMatrix.families.map((fam) => (
                    <div
                      key={fam}
                      className="w-14 text-center text-[10px] font-mono text-slate-400 truncate px-0.5"
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
                        className="w-28 text-right pr-3 text-xs font-mono font-medium text-slate-300 truncate"
                        title={famName}
                      >
                        {famName}
                      </div>
                      <div className="flex gap-1">
                        {row.map((val, cIdx) => {
                          // Blue gradient intensity
                          const isHigh = val >= 90;
                          const isZero = val === 0;
                          return (
                            <div
                              key={cIdx}
                              title={`True: ${famName} | Predicted: ${confusionMatrix.families[cIdx]} | Value: ${val}%`}
                              className={`w-14 h-9 rounded flex items-center justify-center text-[11px] font-mono font-bold transition-transform hover:scale-110 cursor-pointer ${
                                isHigh
                                  ? "bg-sky-500 text-slate-950 shadow-sm"
                                  : isZero
                                  ? "bg-slate-950/80 text-slate-600 border border-slate-900"
                                  : "bg-sky-950 text-sky-400 border border-sky-800"
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
            <div className="text-center text-[11px] text-slate-500 font-mono mt-3">
              Values denote classification accuracy on unseen test partitions. Values on the diagonal represent true positive matches.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
