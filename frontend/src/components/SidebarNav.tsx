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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  { key: "viva", label: "IEEE Manuscript & Viva", icon: GraduationCap, tag: "Q&A" },
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
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "X-MalViT Control"}
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

          {/* Quick Collapse Button inside Sidebar */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
              className="w-6 h-6 rounded-lg bg-white/80 hover:bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
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

      {/* Bottom Profile / Researcher Card */}
      <div className="pt-3">
        {isCollapsed ? (
          <div 
            onClick={onToggleCollapse}
            title="Researchers: Keshav & Arjun (GLA University)"
            className="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            KA
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-3 flex items-center justify-between shadow-xs">
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
              className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:text-emerald-600 text-slate-500 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
