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
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
            <Trophy className="w-5 h-5 text-amber-500" />
            SOTA Benchmark & Ablation Performance (Section V Paper Comparison)
          </CardTitle>
          <Badge variant="cyber">Malimg Benchmark (9,339 Samples)</Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
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
              <tbody className="divide-y divide-slate-100 font-mono">
                {benchmarkModels.map((row) => {
                  const isOurs = row.model.includes("X-MalViT");
                  return (
                    <tr
                      key={row.model}
                      className={
                        isOurs
                          ? "bg-blue-50/70 border-l-4 border-blue-600 font-semibold"
                          : "hover:bg-slate-50/60 transition-colors"
                      }
                    >
                      <td className="py-2.5 px-3 font-sans font-bold flex items-center gap-1.5">
                        {isOurs && <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                        <span className={isOurs ? "text-blue-900" : "text-slate-800"}>{row.model}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{row.input_format}</td>
                      <td className="py-2.5 px-3 text-slate-700">{row.parameters}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{row.accuracy}%</td>
                      <td className="py-2.5 px-3 text-slate-700">{row.precision}%</td>
                      <td className="py-2.5 px-3 text-indigo-700 font-bold">{row.f1_score}%</td>
                      <td className="py-2.5 px-3 text-amber-700 font-semibold">{row.latency}</td>
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
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
              <Grid className="w-5 h-5 text-blue-600" />
              Normalized Confusion Matrix (%) across Major Threat Families
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto flex justify-center py-2">
              <div className="inline-block">
                {/* Header Row */}
                <div className="flex items-center pl-28 mb-1.5">
                  {confusionMatrix.families.map((fam) => (
                    <div
                      key={fam}
                      className="w-14 text-center text-[10px] font-mono text-slate-500 font-semibold truncate px-0.5"
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
                        className="w-28 text-right pr-3 text-xs font-mono font-medium text-slate-600 truncate"
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
                              className={`w-14 h-9 rounded-md flex items-center justify-center text-[11px] font-mono font-bold transition-transform hover:scale-110 cursor-pointer ${
                                isHigh
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : isZero
                                  ? "bg-slate-50 text-slate-400 border border-slate-200/60"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
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
