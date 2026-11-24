"use client";

import React from "react";
import { 
  TrendingUp, 
  Zap, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  FileCheck,
  Sparkles,
  ArrowRight,
  Database,
  BarChart2,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { ModuleKey } from "@/components/SidebarNav";

interface Module1ExecutiveProps {
  onNavigate?: (module: ModuleKey) => void;
}

export const Module1Executive: React.FC<Module1ExecutiveProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* 4 KPI Metric Cards (Matching Reference Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Overall Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">98.8%</div>
            <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <span className="font-semibold">+2.4%</span> over ResNet-18 baseline
            </div>
          </div>
        </div>

        {/* Card 2: Threat Families */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Threat Families</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">25</div>
            <div className="text-xs font-medium text-blue-600 mt-1">
              9,339 Malimg benchmark samples
            </div>
          </div>
        </div>

        {/* Card 3: Inference Latency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Inference Latency</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">23.4 ms</div>
            <div className="text-xs font-medium text-amber-600 mt-1">
              Real-time triage on RTX 4050
            </div>
          </div>
        </div>

        {/* Card 4: Parameters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Model Footprint</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">5.8 M</div>
            <div className="text-xs font-medium text-purple-600 mt-1">
              ViT-Tiny (14x14 Patch Tokens)
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Matching Dasher Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols / ~68%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Autonomous Threat Pipeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Autonomous Threat Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  End-to-end static visual architecture without sandbox dynamic execution
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
                5 Stages
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition-all">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono mb-2">
                  1
                </div>
                <div className="font-bold text-xs text-slate-900">Raw Binary</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Executable PE byte stream
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition-all">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono mb-2">
                  2
                </div>
                <div className="font-bold text-xs text-slate-900">Byte Stream</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  0x00-0xFF 8-bit unsigned mapping
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition-all">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono mb-2">
                  3
                </div>
                <div className="font-bold text-xs text-slate-900">2D Reshape</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Fixed-width assembly grid
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition-all">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono mb-2">
                  4
                </div>
                <div className="font-bold text-xs text-slate-900">224x224 ViT</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Multi-head self-attention
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition-all">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono mb-2">
                  5
                </div>
                <div className="font-bold text-xs text-slate-900">Grad-CAM XAI</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Reverse-mapped PE offsets
                </div>
              </div>
            </div>
          </div>

          {/* Active Threat Signatures & Benchmark Samples Table (Matching Dasher Active Projects) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Active Threat Signatures (Malimg Benchmark)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top evaluated malware families and empirical detection confidence
                </p>
              </div>
              <button 
                onClick={() => onNavigate && onNavigate("dataset")}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                View All 25 Families &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Family Variant</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Validation Accuracy</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">Allaple.A</td>
                    <td className="py-3 px-3">Worm (Polymorphic)</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "99.4%" }} />
                        </div>
                        <span className="font-mono text-xs font-semibold">99.4%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Verified SOTA
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">Yuner.A</td>
                    <td className="py-3 px-3">Worm (Encrypted Payload)</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "98.9%" }} />
                        </div>
                        <span className="font-mono text-xs font-semibold">98.9%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Verified SOTA
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">Dialplatform.B</td>
                    <td className="py-3 px-3">Dialer (API Hooking)</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "98.2%" }} />
                        </div>
                        <span className="font-mono text-xs font-semibold">98.2%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Verified SOTA
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">Fakerean</td>
                    <td className="py-3 px-3">Rogue (High Entropy)</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "97.8%" }} />
                        </div>
                        <span className="font-mono text-xs font-semibold">97.8%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Verified SOTA
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Research Abstract Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  IEEE Conference Research Abstract
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Peer-Review Ready
              </span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2.5 font-sans">
              <p>
                <strong className="text-slate-900">Abstract:</strong> Static signature-based antivirus engines rely on cryptographic hash matching (MD5, SHA-256), which fails against modern polymorphic and metamorphic malware. We propose <strong className="text-emerald-700">X-MalViT</strong>, a lightweight Vision Transformer architecture coupled with Gradient-weighted Class Activation Mapping (Grad-CAM) visual explainability for static malware family classification.
              </p>
              <p>
                Executable binaries from the benchmark Malimg dataset (9,339 samples across 25 families) are converted into two-dimensional grayscale byte matrices, tokenized into non-overlapping patches, and analyzed with multi-head self-attention. Unlike black-box models, X-MalViT projects activation heatmaps back to discrete PE file sections (<code className="text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200 font-mono text-[11px]">.text</code>, <code className="text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200 font-mono text-[11px]">.rsrc</code>, shellcode jump offsets). Trained locally using FP16 mixed precision on an NVIDIA RTX 4050 GPU, X-MalViT converges in under 4 minutes with <strong className="text-emerald-700">98.8% accuracy</strong> and an inference latency of <strong className="text-emerald-700">23.4 ms per binary</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col / ~32% - Matching Dasher Right Column) */}
        <div className="space-y-6">
          {/* Classification Performance Widget (Like Task Progress 64% in Dasher) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-700 mb-1">
              Model Diagnostic Performance
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              98.8%
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 mb-4 overflow-hidden flex">
              <div className="bg-emerald-500 h-2" style={{ width: "98.8%" }} />
              <div className="bg-slate-200 h-2" style={{ width: "1.2%" }} />
            </div>

            {/* 3 mini telemetry status pills (Matching Dasher Completed / In-Progress / Up Coming) */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="text-emerald-600 font-extrabold text-base">98.7%</div>
                <div className="text-[10px] text-emerald-800 font-medium mt-0.5">F1-Score</div>
              </div>
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="text-blue-600 font-extrabold text-base">25</div>
                <div className="text-[10px] text-blue-800 font-medium mt-0.5">Families</div>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-100">
                <div className="text-purple-600 font-extrabold text-base">5.8M</div>
                <div className="text-[10px] text-purple-800 font-medium mt-0.5">Weights</div>
              </div>
            </div>
          </div>

          {/* AI Threat Assistant Banner (Direct Match to Dasher's AI Assistant Card) */}
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl p-6 relative overflow-hidden shadow-md shadow-emerald-500/20">
            {/* Subtle glow / decoration */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-3">
                <Sparkles className="w-5 h-5 text-emerald-100" />
              </div>
              <h4 className="text-lg font-bold leading-snug">
                How X-MalViT Explains Malware Threats
              </h4>
              <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
                Run immediate Grad-CAM activation heatmap attribution to pinpoint unpacked PE shellcode jumps and high-entropy trojan payloads.
              </p>

              <button
                onClick={() => onNavigate && onNavigate("classifier")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
              >
                Launch XAI Classifier &rarr;
              </button>
            </div>
          </div>

          {/* Local Hardware Telemetry */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Edge Runtime Architecture
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                <span className="text-slate-500 font-sans">Precision:</span>
                <span className="text-emerald-700 font-bold">FP16 Mixed Precision</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                <span className="text-slate-500 font-sans">Attention Heads:</span>
                <span className="text-blue-700 font-bold">8 Heads (dim=192)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                <span className="text-slate-500 font-sans">Patch Geometry:</span>
                <span className="text-purple-700 font-bold">14 × 14 Grid (196 Tokens)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
