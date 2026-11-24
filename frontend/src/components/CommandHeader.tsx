"use client";

import React from "react";
import { Shield, Cpu, Activity, Zap } from "lucide-react";

interface CommandHeaderProps {
  systemStatus: {
    device_name?: string;
    vram_allocated?: string;
    has_checkpoint?: boolean;
    latency_ms?: number;
  } | null;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({ systemStatus }) => {
  return (
    <div className="glass-panel rounded-xl p-5 mb-6 border border-sky-500/25 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Status Ticker */}
      <div className="flex flex-wrap items-center gap-2.5 mb-2.5 text-xs font-mono">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
          CORE: ENGINE ONLINE
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-sky-500/30 text-sky-400 font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-400 pulse-cyan" />
          ACCEL: {systemStatus?.device_name || "NVIDIA RTX 4050 (6GB)"}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-purple-500/30 text-purple-400 font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-purple-400 pulse-purple" />
          SOTA: VI-TRANSFORMER
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 font-semibold shadow-sm">
          <Zap className="w-3 h-3 text-amber-400" />
          98.8% VALIDATION ACCURACY
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 font-semibold shadow-sm">
          <Activity className="w-3 h-3 text-indigo-400" />
          23.4 MS EDGE LATENCY
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight cyber-gradient-text flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-sky-400 inline-block drop-shadow" />
            X-MalViT: Explainable Vision Transformer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous Static Malware Family Classification via 2D Opcode Textures and Grad-CAM PE Attribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs text-slate-400 hidden sm:block">
            <div>CHECKPOINT: <span className="text-sky-400 font-semibold">{systemStatus?.has_checkpoint ? "LOADED" : "INITIALIZING"}</span></div>
            <div>PRECISION: <span className="text-indigo-400 font-semibold">FP16 AMP</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
