"use client";

import React, { useEffect } from "react";
import { 
  Rocket, 
  FolderSearch, 
  Cpu, 
  BarChart3, 
  SearchCode, 
  FileText, 
  ShieldCheck,
  ExternalLink,
  X
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
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

function SidebarContent({
  activeModule,
  onSelectModule,
  isCollapsed,
  onBrandClick,
  brandAriaLabel,
  brandTitle,
  layoutIdSuffix,
  showCloseButton,
  onCloseMobile,
}: {
  activeModule: ModuleKey;
  onSelectModule: (key: ModuleKey) => void;
  isCollapsed: boolean;
  onBrandClick: () => void;
  brandAriaLabel: string;
  brandTitle: string;
  layoutIdSuffix: string;
  showCloseButton?: boolean;
  onCloseMobile?: () => void;
}) {
  const renderNavGroup = (label: string, items: NavItem[]) => (
    <div className="mb-6">
      {!isCollapsed ? (
        <div className="text-[12px] font-medium text-muted px-3 mb-2">
          {label}
        </div>
      ) : (
        <div className="h-px bg-line my-2 mx-1" />
      )}
      <nav aria-label={label} className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectModule(item.key)}
              title={isCollapsed ? `${item.label}${item.tag ? ` (${item.tag})` : ""}` : undefined}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative w-full flex items-center rounded-tile text-[13px] font-medium transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas overflow-hidden",
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2.5 text-left gap-2",
                isActive
                  ? "text-ink font-semibold"
                  : "text-muted hover:text-ink hover:bg-surface/80 hover:translate-x-[2px]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={`sidebar-active-item-${layoutIdSuffix}`}
                  transition={{ type: "spring", stiffness: 460, damping: 34, duration: 0.25 }}
                  className="absolute inset-0 bg-accent-soft rounded-tile z-0"
                >
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent" />
                </motion.div>
              )}
              <div className={cn("relative z-10 flex items-center gap-2.5 min-w-0", isCollapsed && "justify-center")}>
                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110", isActive ? "text-accent" : "text-muted group-hover:text-ink")} />
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
  );

  return (
    <>
      <div>
        {/* Brand Header */}
        <div className={cn(
          "flex items-center gap-3 px-1 mb-6 transition-all duration-200",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBrandClick}
              aria-label={brandAriaLabel}
              title={brandTitle}
              className="w-10 h-10 rounded-tile bg-accent flex items-center justify-center text-on-accent flex-shrink-0 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
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

          {showCloseButton && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="w-8 h-8 rounded-chip bg-surface border border-line hover:bg-surface-2 text-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {renderNavGroup("Command center", COMMAND_CENTER_ITEMS)}
        {renderNavGroup("Analytics & XAI", ANALYTICS_ITEMS)}
      </div>

      {/* Bottom: Official IEEE Research Paper Reference Card (hidden when collapsed) */}
      {!isCollapsed && (
        <div className="pt-2">
          <div className="bg-surface border border-line rounded-panel p-4 shadow-none">
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

            <a
              href="/api/documents/X-MalViT_IEEE_Research_Paper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-chip text-[13px] font-medium bg-surface-2 hover:bg-line/50 text-ink border border-line transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <FileText className="w-3.5 h-3.5 text-muted group-hover:text-ink transition-colors" />
              <span>Read IEEE Paper (PDF)</span>
              <ExternalLink className="w-3 h-3 text-muted group-hover:text-ink transition-colors ml-auto" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  useEffect(() => {
    if (!isMobileOpen || !onCloseMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* Desktop Collapsible Sidebar (>=1024px) */}
      <motion.aside
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="hidden lg:flex flex-shrink-0 bg-transparent h-screen flex-col justify-between py-5 px-3 z-20 select-none overflow-hidden relative"
      >
        <SidebarContent
          activeModule={activeModule}
          onSelectModule={onSelectModule}
          isCollapsed={isCollapsed}
          onBrandClick={onToggleCollapse}
          brandAriaLabel={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          brandTitle={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "X-MalViT Threat Intelligence"}
          layoutIdSuffix="desktop"
        />
      </motion.aside>

      {/* Mobile Slide-In Drawer (<1024px) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
            />
            <motion.aside
              aria-label="Primary navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="relative z-50 w-[280px] max-w-[85vw] h-full bg-canvas border-r border-line shadow-panel flex flex-col justify-between py-5 px-3 overflow-y-auto"
            >
              <SidebarContent
                activeModule={activeModule}
                onSelectModule={(key) => {
                  onSelectModule(key);
                  onCloseMobile?.();
                }}
                isCollapsed={false}
                onBrandClick={() => onCloseMobile?.()}
                brandAriaLabel="Close navigation menu"
                brandTitle="X-MalViT Threat Intelligence"
                layoutIdSuffix="mobile"
                showCloseButton
                onCloseMobile={onCloseMobile}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
