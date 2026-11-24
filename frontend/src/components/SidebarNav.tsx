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
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      {/* Branding Header */}
      <div className="text-center pb-4 border-b border-slate-100 mb-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 mb-2.5 text-white"
        >
          <ShieldCheck className="w-6 h-6" />
        </motion.div>
        <div className="font-extrabold text-base tracking-tight text-slate-900">X-MalViT CONTROL</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Autonomous Threat Intelligence</div>
      </div>

      {/* Mini Telemetry Widget */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-4 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            STATUS:
          </span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            ONLINE
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            DEVICE:
          </span>
          <span className="text-blue-700 font-bold text-[11px] truncate max-w-[120px]">
            {systemStatus?.device || "CUDA/CPU"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            MODEL:
          </span>
          <span className="text-purple-700 font-bold text-[11px]">ViT-Tiny (5.8M)</span>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 font-mono">
        Command Modules
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {MODULE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.key;
          return (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectModule(item.key)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left relative",
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400")} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-md font-mono flex-shrink-0 font-medium",
                isActive ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
              )}>
                {item.tag}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer & Metadata */}
      <div className="pt-3 border-t border-slate-100 mt-auto text-xs text-slate-500 space-y-1">
        <div className="font-semibold text-slate-800">Researchers:</div>
        <div className="text-[11px] text-slate-600">Keshav Agrawal & Arjun S. Rajput</div>
        <div className="text-[10px] text-slate-400">GLA University, Mathura</div>
        <div className="pt-2">
          <a
            href="/api/documents/IEEE_Research_Paper_X_MalViT.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            Open IEEE Paper PDF
          </a>
        </div>
      </div>
    </aside>
  );
};
