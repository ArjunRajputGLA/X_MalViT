"use client";

import React from "react";
import { 
  Bell, 
  Sparkles,
  PanelLeft
} from "lucide-react";
import { ModuleKey } from "@/components/SidebarNav";

interface TopHeaderProps {
  activeModule: ModuleKey;
  systemStatus: any;
  onNavigate: (module: ModuleKey) => void;
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
  viva: {
    title: "IEEE Manuscript & Viva Defense",
    subtitle: "Authoritative Defense Answers, Model Formulas & Artifact Downloads"
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeModule,
  systemStatus,
  onNavigate
}) => {
  const currentMeta = MODULE_TITLES[activeModule] || MODULE_TITLES.briefing;

  return (
    <header className="h-16 flex-shrink-0 bg-transparent px-6 lg:px-8 flex items-center justify-between z-20">
      {/* Left: Collapse Icon Toggle + Dynamic Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          title="Toggle Navigation"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden md:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Notification Bell + Quick Action CTA */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge */}
        <button 
          title="Security Notifications"
          className="relative w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* Quick Triage CTA */}
        <button
          onClick={() => onNavigate("classifier")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Run Threat Triage</span>
          <span className="sm:hidden">Scan</span>
        </button>
      </div>
    </header>
  );
};
