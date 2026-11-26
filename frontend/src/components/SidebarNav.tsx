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
      animate={{ width: isCollapsed ? 72 : 280 }}
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
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "X-MalViT Threat Intelligence"}
              className="w-10 h-10 rounded-tile bg-accent flex items-center justify-center text-white flex-shrink-0 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="truncate"
                >
                  <div className="font-semibold text-[16px] leading-[1.2] text-ink truncate">
                    X-MalViT
                  </div>
                  <div className="text-[12px] font-medium text-muted truncate mt-0.5">
                    Threat intelligence
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Section 1: Command center */}
        <div className="mb-6">
          {!isCollapsed ? (
            <div className="text-[12px] font-medium text-muted px-3 mb-2">
              Command center
            </div>
          ) : (
            <div className="h-px bg-line my-2 mx-1" />
          )}
          <nav className="space-y-1">
            {COMMAND_CENTER_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectModule(item.key)}
                  title={isCollapsed ? `${item.label}${item.tag ? ` (${item.tag})` : ""}` : undefined}
                  aria-label={item.label}
                  className={cn(
                    "relative w-full flex items-center rounded-tile text-[13px] font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 overflow-hidden",
                    isCollapsed 
                      ? "justify-center p-2.5" 
                      : "justify-between px-3 py-2.5 text-left gap-2",
                    isActive
                      ? "text-ink font-semibold"
                      : "text-muted hover:text-ink hover:bg-surface/60"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-item"
                      transition={{ type: "spring", stiffness: 460, damping: 34, duration: 0.25 }}
                      className="absolute inset-0 bg-accent-soft rounded-tile z-0"
                    >
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent" />
                    </motion.div>
                  )}
                  <div className={cn("relative z-10 flex items-center gap-2.5 min-w-0", isCollapsed && "justify-center")}>
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-accent" : "text-muted")} />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.tag && (
                    <span className={cn(
                      "relative z-10 font-mono text-[11px] font-medium px-1.5 py-0.5 rounded-chip border flex-shrink-0 tabular-nums transition-colors",
                      isActive
                        ? "bg-accent-soft text-accent border-accent/20"
                        : "bg-surface-2 text-muted border-line"
                    )}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Analytics & explainability */}
        <div className="mb-6">
          {!isCollapsed ? (
            <div className="text-[12px] font-medium text-muted px-3 mb-2">
              Analytics &amp; XAI
            </div>
          ) : (
            <div className="h-px bg-line my-2 mx-1" />
          )}
          <nav className="space-y-1">
            {ANALYTICS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectModule(item.key)}
                  title={isCollapsed ? `${item.label}${item.tag ? ` (${item.tag})` : ""}` : undefined}
                  aria-label={item.label}
                  className={cn(
                    "relative w-full flex items-center rounded-tile text-[13px] font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 overflow-hidden",
                    isCollapsed 
                      ? "justify-center p-2.5" 
                      : "justify-between px-3 py-2.5 text-left gap-2",
                    isActive
                      ? "text-ink font-semibold"
                      : "text-muted hover:text-ink hover:bg-surface/60"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-item"
                      transition={{ type: "spring", stiffness: 460, damping: 34, duration: 0.25 }}
                      className="absolute inset-0 bg-accent-soft rounded-tile z-0"
                    >
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent" />
                    </motion.div>
                  )}
                  <div className={cn("relative z-10 flex items-center gap-2.5 min-w-0", isCollapsed && "justify-center")}>
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-accent" : "text-muted")} />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.tag && (
                    <span className={cn(
                      "relative z-10 font-mono text-[11px] font-medium px-1.5 py-0.5 rounded-chip border flex-shrink-0 tabular-nums transition-colors",
                      isActive
                        ? "bg-accent-soft text-accent border-accent/20"
                        : "bg-surface-2 text-muted border-line"
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

      {/* Bottom: Official IEEE Research Paper Reference Card (hidden when collapsed) */}
      {!isCollapsed && (
        <div className="pt-2">
          <div className="bg-surface border border-line rounded-panel p-4 shadow-none">
            {/* Paper Title & Authors from X-MalViT_IEEE_Conference.pdf */}
            <div className="mb-3">
              <div className="text-[13px] font-semibold text-ink leading-[1.2] line-clamp-1" title="X-MalViT: Explainable Vision Transformer">
                X-MalViT Framework
              </div>
              <div className="text-[12px] text-ink font-medium truncate mt-1">
                Keshav Agrawal &amp; Arjun S. Rajput
              </div>
              <div className="text-[12px] text-muted truncate mt-0.5" title="B.Tech Hons CS final year, GLA University">
                B.Tech Hons CS final year, GLA University
              </div>
            </div>

            {/* Direct Action to view X-MalViT_IEEE_Conference.pdf */}
            <a
              href="/api/documents/X-MalViT_IEEE_Conference.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-chip text-[13px] font-medium bg-surface-2 hover:bg-line/50 text-ink border border-line transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
            >
              <FileText className="w-3.5 h-3.5 text-muted group-hover:text-ink transition-colors" />
              <span>Read IEEE Paper (PDF)</span>
              <ExternalLink className="w-3 h-3 text-muted group-hover:text-ink transition-colors ml-auto" />
            </a>
          </div>
        </div>
      )}
    </motion.aside>
  );
};
