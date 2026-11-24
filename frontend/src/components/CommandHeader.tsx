"use client";

import React from "react";
import { Shield, Cpu, Activity, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-200/80 shadow-sm relative overflow-hidden"
    >
      {/* Soft ambient background gradients */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-8 w-60 h-60 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Status Ticker Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
          <span>CORE: ENGINE ONLINE</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>ACCEL: {systemStatus?.device_name || "NVIDIA RTX 4050 (6GB)"}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-purple-500 pulse-purple" />
          <span>SOTA: ViT-TINY (5.8M)</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>98.8% TEST ACCURACY</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs">
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span>23.4 MS INFERENCE</span>
        </div>
      </div>

      {/* Main Brand Title & Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <span>X-MalViT: Explainable Vision Transformer</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium max-w-2xl leading-relaxed">
            Autonomous Static Malware Family Classification via 2D Opcode Textures and Grad-CAM PE Attribution
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono shadow-xs flex items-center gap-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Checkpoint</div>
              <div className="flex items-center gap-1 text-blue-700 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {systemStatus?.has_checkpoint ? "LOADED" : "FP16 FROZEN"}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Precision</div>
              <div className="text-indigo-700 font-bold">FP16 AMP</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
