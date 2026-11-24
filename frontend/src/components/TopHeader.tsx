"use client";

import React from "react";
import { 
  Sparkles,
  PanelLeft,
  PanelLeftClose
} from "lucide-react";
import { ModuleKey } from "@/components/SidebarNav";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  activeModule: ModuleKey;
  systemStatus: any;
  onNavigate: (module: ModuleKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MODULE_TITLES: Record<ModuleKey, { title: string; subtitle: string }> = {
  briefing: {
    title: "Executive Threat Briefing",
    subtitle: "2D Opcode Texture Analysis & Multi-Head Self-Attention"
  },
  dataset: {
    title: "Malimg Benchmark Dataset",
    subtitle: "9,339 Disassembled Executable Binaries Across 25 Threat Families"
  },
  training: {
    title: "RTX 4050 PyTorch Training Lab",
    subtitle: "Hardware-Accelerated FP16 Mixed Precision & Real-Time Convergence"
  },
  benchmark: {
    title: "SOTA Comparative Benchmarks",
    subtitle: "Empirical Performance vs CNNs, MalConv & Tree Baselines"
  },
  classifier: {
    title: "Real-Time Classifier & Explainability (XAI)",
    subtitle: "Grad-CAM Activation Attribution & PE Header Disassembly Mapping"
  },
  manuscript: {
    title: "IEEE Research Manuscript & Documentation",
    subtitle: "Official Camera-Ready Conference Paper, Architectural Specifications & Published Artifacts"
  },
  viva: {
    title: "IEEE Research Manuscript & Documentation",
    subtitle: "Official Camera-Ready Conference Paper, Architectural Specifications & Published Artifacts"
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeModule,
  systemStatus,
  onNavigate,
  isCollapsed,
  onToggleCollapse
}) => {
  const currentMeta = MODULE_TITLES[activeModule] || MODULE_TITLES.briefing;

  return (
    <header className="h-16 flex-shrink-0 bg-transparent px-6 lg:px-8 flex items-center justify-between z-20">
      {/* Left: Collapse Icon Toggle + Dynamic Title */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 shadow-2xs hover:shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4 text-emerald-600 transition-transform group-hover:scale-110" />
          ) : (
            <PanelLeftClose className="w-4 h-4 transition-transform group-hover:scale-110" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200/80" />

        <div>
          <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Live Hardware Status + Quick Action CTA */}
      <div className="flex items-center gap-2.5">
        {systemStatus && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-[11px] font-mono">
            <span className={cn(
              "w-2 h-2 rounded-full",
              systemStatus.cuda_available ? "bg-emerald-500" : "bg-blue-500"
            )} />
            <span className="font-semibold text-slate-700">{systemStatus.cuda_available ? "CUDA GPU" : "CPU Host"}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{systemStatus.has_checkpoint ? "Checkpoint Ready" : "Awaiting Weights"}</span>
          </div>
        )}

        {/* Quick Triage CTA */}
        <button
          onClick={() => onNavigate("classifier")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Run Threat Triage</span>
          <span className="sm:hidden">Scan</span>
        </button>
      </div>
    </header>
  );
};
