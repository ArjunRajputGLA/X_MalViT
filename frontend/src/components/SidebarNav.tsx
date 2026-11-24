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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type ModuleKey = 
  | "briefing"
  | "dataset"
  | "training"
  | "benchmark"
  | "classifier"
  | "manuscript"
  | "viva";

interface SidebarNavProps {
  activeModule: ModuleKey;
  onSelectModule: (key: ModuleKey) => void;
  systemStatus: any;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
  { key: "manuscript", label: "Research Manuscript", icon: FileText, tag: "IEEE" },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeModule,
  onSelectModule,
  systemStatus,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 256 }}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
      className="flex-shrink-0 bg-transparent h-screen flex flex-col justify-between py-5 px-3 z-20 select-none overflow-hidden relative"
    >
      <div>
        {/* Brand Header */}
        <div className={cn(
          "flex items-center gap-3 px-1 mb-6 transition-all duration-200",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "X-MalViT Threat Intelligence"}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <ShieldCheck className="w-5 h-5" />
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="truncate"
                >
                  <div className="font-extrabold text-base tracking-tight text-slate-900 leading-tight truncate">
                    X-MalViT
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                    Threat Intelligence
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Section 1: Command Center */}
        <div className="mb-5">
          {!isCollapsed ? (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
              Command Center
            </div>
          ) : (
            <div className="h-px bg-slate-200/60 my-2 mx-1" />
          )}
          <nav className="space-y-1.5">
            {COMMAND_CENTER_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectModule(item.key)}
                  title={isCollapsed ? `${item.label} (${item.tag || ""})` : undefined}
                  className={cn(
                    "w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer",
                    isCollapsed 
                      ? "justify-center p-2.5" 
                      : "justify-between px-3.5 py-2.5 text-left",
                    isActive
                      ? "bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.tag && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold",
                      isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50" : "bg-slate-200/60 text-slate-600"
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
        <div className="mb-5">
          {!isCollapsed ? (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
              Analytics & XAI
            </div>
          ) : (
            <div className="h-px bg-slate-200/60 my-2 mx-1" />
          )}
          <nav className="space-y-1.5">
            {ANALYTICS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectModule(item.key)}
                  title={isCollapsed ? `${item.label} (${item.tag || ""})` : undefined}
                  className={cn(
                    "w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer",
                    isCollapsed 
                      ? "justify-center p-2.5" 
                      : "justify-between px-3.5 py-2.5 text-left",
                    isActive
                      ? "bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.tag && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold",
                      isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50" : "bg-slate-200/60 text-slate-600"
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

      {/* Bottom: Official IEEE Research Paper Reference Card */}
      <div className="pt-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center">
            <a
              href="/api/documents/X-MalViT_IEEE_Conference.pdf"
              target="_blank"
              rel="noopener noreferrer"
              title="X-MalViT: IEEE Conference Paper (Keshav Agrawal & Arjun S. Rajput - GLA University)"
              className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-200/80 hover:border-emerald-600 flex flex-col items-center justify-center transition-all shadow-2xs group cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
              <span className="text-[7.5px] font-black uppercase tracking-tight text-slate-500 group-hover:text-white font-mono mt-0.5">
                IEEE
              </span>
            </a>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs hover:border-emerald-300 transition-all">
            {/* Paper Title & Authors from X-MalViT_IEEE_Conference.pdf */}
            <div className="mb-2.5">
              <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1" title="X-MalViT: Explainable Vision Transformer">
                X-MalViT Framework
              </div>
              <div className="text-[11px] text-slate-700 font-semibold truncate mt-0.5">
                Keshav Agrawal & Arjun S. Rajput
              </div>
              <div className="text-[10px] text-slate-500 font-sans truncate mt-0.5" title="B.Tech Hons CS final year, GLA University">
                B.Tech Hons CS final year, GLA University
              </div>
            </div>

            {/* Direct Action to view X-MalViT_IEEE_Conference.pdf */}
            <a
              href="/api/documents/X-MalViT_IEEE_Conference.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-200/80 hover:border-emerald-600 transition-all cursor-pointer group shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white transition-colors" />
              <span>Read IEEE Paper (PDF)</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors ml-auto" />
            </a>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
