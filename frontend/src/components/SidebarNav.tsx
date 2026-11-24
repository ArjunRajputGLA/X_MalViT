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
  ExternalLink
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

interface NavItem {
  key: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const COMMAND_CENTER_ITEMS: NavItem[] = [
  { key: "briefing", label: "Executive Briefing", icon: Rocket, tag: "SOTA" },
  { key: "dataset", label: "Malimg Signatures", icon: FolderSearch, tag: "9.3k" },
  { key: "training", label: "RTX 4050 Training Lab", icon: Cpu, tag: "PyTorch" },
];

const ANALYTICS_ITEMS: NavItem[] = [
  { key: "classifier", label: "Grad-CAM Classifier", icon: SearchCode, tag: "XAI" },
  { key: "benchmark", label: "SOTA Benchmarks", icon: BarChart3, tag: "98.8%" },
  { key: "viva", label: "IEEE Manuscript & Viva", icon: GraduationCap, tag: "Q&A" },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeModule,
  onSelectModule,
  systemStatus
}) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/80 min-h-screen sticky top-0 flex flex-col justify-between py-5 px-4 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
              X-MalViT
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Threat Intelligence
            </div>
          </div>
        </div>

        {/* Section 1: Command Center */}
        <div className="mb-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
            Command Center
          </div>
          <nav className="space-y-1">
            {COMMAND_CENTER_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectModule(item.key)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left cursor-pointer",
                    isActive
                      ? "bg-[#e8f7f0] text-[#047857] font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#059669]" : "text-slate-400")} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold",
                      isActive ? "bg-emerald-100/70 text-emerald-800" : "bg-slate-100 text-slate-500"
                    )}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Analytics & Explainability */}
        <div className="mb-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
            Analytics & XAI
          </div>
          <nav className="space-y-1">
            {ANALYTICS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectModule(item.key)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left cursor-pointer",
                    isActive
                      ? "bg-[#e8f7f0] text-[#047857] font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#059669]" : "text-slate-400")} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold",
                      isActive ? "bg-emerald-100/70 text-emerald-800" : "bg-slate-100 text-slate-500"
                    )}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile / Researcher Card (Matching Dasher style) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">
              KA
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 truncate">Keshav & Arjun</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">GLA University</div>
            </div>
          </div>
          <a
            href="/api/documents/IEEE_Research_Paper_X_MalViT.pdf"
            target="_blank"
            rel="noopener noreferrer"
            title="Download IEEE Manuscript PDF"
            className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 hover:border-emerald-400 hover:text-emerald-600 text-slate-500 flex items-center justify-center transition-colors flex-shrink-0 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};
