"use client";

import React from "react";
import { 
  Rocket, 
  FolderSearch, 
  Cpu, 
  BarChart3, 
  SearchCode, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  Activity,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ModuleKey = 
  | "briefing"
  | "dataset"
  | "training"
  | "benchmark"
  | "classifier"
  | "viva";

interface SidebarNavProps {
  activeModule: ModuleKey;
  onSelectModule: (key: ModuleKey) => void;
  systemStatus: any;
}

const MODULE_ITEMS: { key: ModuleKey; label: string; icon: React.ComponentType<{ className?: string }>; tag: string }[] = [
  { key: "briefing", label: "Executive Briefing & Architecture", icon: Rocket, tag: "SOTA" },
  { key: "dataset", label: "Malimg Dataset & Signatures", icon: FolderSearch, tag: "9,339 Files" },
  { key: "training", label: "RTX 4050 Training Lab", icon: Cpu, tag: "PyTorch" },
  { key: "benchmark", label: "SOTA Benchmark & Ablation", icon: BarChart3, tag: "98.8% Acc" },
  { key: "classifier", label: "Real-Time Classifier (XAI)", icon: SearchCode, tag: "Grad-CAM" },
  { key: "viva", label: "IEEE Manuscript & Viva Defense", icon: GraduationCap, tag: "Examiner Q&A" },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeModule,
  onSelectModule,
  systemStatus
}) => {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col glass-panel rounded-xl p-4 border border-sky-500/20 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      {/* Branding Header */}
      <div className="text-center pb-4 border-b border-slate-800/80 mb-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 mb-2 border border-sky-400/40">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <div className="font-extrabold text-base tracking-wide text-sky-400">X-MalViT CONTROL</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Autonomous Threat Intelligence</div>
      </div>

      {/* Mini Telemetry Widget */}
      <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 mb-4 text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            STATUS:
          </span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-sky-400" />
            DEVICE:
          </span>
          <span className="text-sky-400 font-semibold text-[11px] truncate max-w-[120px]">
            {systemStatus?.device || "CUDA/CPU"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-purple-400" />
            MODEL:
          </span>
          <span className="text-purple-300 font-semibold text-[11px]">ViT-Tiny (5.8M)</span>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 font-mono">
        Command Modules
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {MODULE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectModule(item.key)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 text-left group",
                isActive
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-sky-400" : "text-slate-400 group-hover:text-sky-400")} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 font-semibold",
                isActive ? "bg-sky-400/20 text-sky-300" : "bg-slate-800 text-slate-400"
              )}>
                {item.tag}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer & Metadata */}
      <div className="pt-4 border-t border-slate-800/80 mt-auto text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300">👨‍💻 Researchers:</div>
        <div className="text-[11px] text-slate-400">Keshav Agrawal & Arjun S. Rajput</div>
        <div className="text-[10px] text-slate-500">GLA University, Mathura</div>
        <div className="pt-2">
          <a
            href="/api/documents/IEEE_Research_Paper_X_MalViT.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            Open IEEE Paper PDF
          </a>
        </div>
      </div>
    </aside>
  );
};
