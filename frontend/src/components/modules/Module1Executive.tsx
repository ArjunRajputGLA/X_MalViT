"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileCode2, 
  Binary, 
  Grid3X3, 
  Layers, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Cpu, 
  ShieldAlert 
} from "lucide-react";

export const Module1Executive: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* HUD Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-sky-500/20 text-center relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="text-3xl font-extrabold text-sky-400 font-mono">98.8%</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mt-1">Classification Accuracy</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" /> SOTA on Malimg
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-sky-500/20 text-center relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="text-3xl font-extrabold text-indigo-400 font-mono">25</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mt-1">Ground-Truth Families</div>
          <div className="text-[10px] text-indigo-300 mt-1 font-mono">9,339 Total Binaries</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-sky-500/20 text-center relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">23.4 ms</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mt-1">Edge Inference Latency</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" /> Real-Time Triage
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-sky-500/20 text-center relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="text-3xl font-extrabold text-purple-400 font-mono">5.8 M</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mt-1">ViT-Tiny Parameters</div>
          <div className="text-[10px] text-purple-300 mt-1 font-mono flex items-center justify-center gap-1">
            <Cpu className="w-3 h-3" /> RTX 4050 FP16
          </div>
        </div>
      </div>

      {/* Research Paper Abstract Card */}
      <Card className="border-sky-500/20 bg-slate-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-sky-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
              IEEE Conference Research Abstract
            </CardTitle>
            <Badge variant="cyber">Peer-Review Ready</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">Abstract:</strong> Static signature-based antivirus engines rely on cryptographic hash matching (MD5, SHA-256), which fails catastrophically against modern polymorphic and metamorphic malware. While dynamic analysis provides behavioral visibility, it is resource-intensive and vulnerable to sandbox evasion techniques. In this paper, we propose <strong className="text-sky-300">X-MalViT</strong>, a lightweight Vision Transformer architecture coupled with Gradient-weighted Class Activation Mapping (Grad-CAM) visual explainability for static malware family classification.
          </p>
          <p>
            Executable binaries from the benchmark Malimg dataset (9,339 samples across 25 families) are converted into two-dimensional grayscale byte matrices, where structural machine code patterns, encrypted payloads, and data segments naturally manifest as spatial textures. X-MalViT tokenizes these textures into non-overlapping patches and leverages multi-head self-attention to correlate distant Portable Executable (PE) headers with appended resource payloads. Unlike traditional black-box deep learning models, X-MalViT provides forensic explainability by projecting activation heatmaps back to discrete PE file sections (<code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">.text</code>, <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">.rsrc</code>, shellcode entry points). Trained locally using FP16 mixed precision on an NVIDIA GeForce RTX 4050 laptop GPU (6 GB VRAM), X-MalViT converges in under 4 minutes and achieves a <strong className="text-emerald-400">98.8% classification accuracy</strong>, an <strong className="text-emerald-400">F1-score of 98.7%</strong>, and an average inference latency of <strong className="text-emerald-400">23.4 ms per binary</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Autonomous Threat Pipeline */}
      <div>
        <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          Autonomous Threat Pipeline (End-to-End Visual Architecture)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-2 font-bold font-mono text-sm border border-sky-500/30">
              1
            </div>
            <div className="font-bold text-xs text-white">Raw Binary</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-snug">
              Executable Windows PE binary containing opcode machine instructions.
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2 font-bold font-mono text-sm border border-indigo-500/30">
              2
            </div>
            <div className="font-bold text-xs text-white">Byte Stream</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-snug">
              8-bit unsigned integer stream mapping byte values from 0x00 to 0xFF.
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2 font-bold font-mono text-sm border border-purple-500/30">
              3
            </div>
            <div className="font-bold text-xs text-white">2D Reshaping</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-snug">
              Dynamic fixed-width matrix projection preserving assembly layout.
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2 font-bold font-mono text-sm border border-emerald-500/30">
              4
            </div>
            <div className="font-bold text-xs text-white">224x224 ViT</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-snug">
              14x14 patch tokenization with 8-head global self-attention correlation.
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 mb-2 font-bold font-mono text-sm border border-rose-500/30">
              5
            </div>
            <div className="font-bold text-xs text-white">Grad-CAM XAI</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-snug">
              Attribution heatmap reverse-mapped to PE headers and shellcode offsets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
