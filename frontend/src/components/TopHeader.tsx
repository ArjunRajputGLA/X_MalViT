"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Sparkles,
  PanelLeft,
  PanelLeftClose,
  Menu
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ModuleKey } from "@/components/SidebarNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  activeModule: ModuleKey;
  systemStatus: any;
  onNavigate: (module: ModuleKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen?: boolean;
  onOpenMobileMenu?: () => void;
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
    title: "PyTorch Training Lab",
    subtitle: "Stratified 80/20 Malimg Training, Overlay Augmentation & Live Convergence"
  },
  benchmark: {
    title: "Paper Benchmarks & Ablations",
    subtitle: "Empirical Comparison, Ablations, Overlay Robustness & Confusion Matrix"
  },
  classifier: {
    title: "Real-Time Classifier & Explainability (XAI)",
    subtitle: "Penultimate-Token Grad-CAM Attribution & Matrix Byte-Offset Inspection"
  },
  manuscript: {
    title: "Research Manuscript & Documentation",
    subtitle: "6-Page IEEE Conference Paper, Model Specifications & Published Artifacts"
  },
  viva: {
    title: "Research Manuscript & Documentation",
    subtitle: "6-Page IEEE Conference Paper, Model Specifications & Published Artifacts"
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeModule,
  systemStatus,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileMenuOpen = false,
  onOpenMobileMenu
}) => {
  const currentMeta = MODULE_TITLES[activeModule] || MODULE_TITLES.briefing;
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const scrollParent = headerRef.current?.parentElement;
    if (!scrollParent) return;

    const handleScroll = () => {
      setIsScrolled(scrollParent.scrollTop > 4);
    };

    handleScroll();
    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollParent.removeEventListener("scroll", handleScroll);
  }, []);

  const statusDotClass = !systemStatus?.engine_online
    ? "bg-critical"
    : systemStatus.has_checkpoint
      ? "bg-ok"
      : "bg-high";

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 min-h-16 py-3 flex-shrink-0 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 z-30 transition-all duration-200 border-b",
        isScrolled
          ? "bg-surface/85 backdrop-blur-md border-line"
          : "bg-transparent border-transparent"
      )}
    >
      {/* Left: Mobile Menu Button (<1024px) / Collapse Toggle (>=1024px) + Dynamic Title */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden w-8 h-8 rounded-chip bg-surface border border-line hover:bg-accent-soft text-muted hover:text-accent flex items-center justify-center transition-colors cursor-pointer active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          className="hidden lg:flex w-8 h-8 rounded-chip bg-surface border border-line hover:bg-accent-soft text-muted hover:text-accent items-center justify-center transition-colors cursor-pointer active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface group flex-shrink-0"
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4 text-accent transition-transform group-hover:scale-110" />
          ) : (
            <PanelLeftClose className="w-4 h-4 transition-transform group-hover:scale-110" />
          )}
        </button>

        <div className="h-5 w-px bg-line flex-shrink-0" />

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-w-0"
            >
              <h1 className="text-[20px] sm:text-[28px] leading-[1.2] font-semibold text-ink truncate">
                {currentMeta.title}
              </h1>
              <p className="text-[13px] leading-[1.5] text-muted hidden md:block truncate">
                {currentMeta.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Controls: Live Hardware Status + Theme Toggle + Quick Action CTA */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {systemStatus && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-chip bg-surface border border-line text-[13px] font-medium tabular-nums">
            <span className={cn("w-2 h-2 rounded-full", statusDotClass)} />
            <span className="font-medium text-ink">{systemStatus.cuda_available ? "CUDA GPU" : "CPU Host"}</span>
            <span className="text-line">&bull;</span>
            <span className="text-muted">{systemStatus.has_checkpoint ? "Checkpoint Ready" : "Awaiting Weights"}</span>
          </div>
        )}

        <ThemeToggle />

        {/* Quick Triage CTA */}
        <button
          type="button"
          onClick={() => onNavigate("classifier")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-chip text-[13px] font-medium bg-accent hover:bg-accent/90 hover:shadow-[0_2px_12px_color-mix(in_srgb,var(--accent)_35%,transparent)] text-on-accent transition-all cursor-pointer active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface group"
        >
          <Sparkles className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-12" />
          <span className="hidden sm:inline">Run Threat Triage</span>
          <span className="sm:hidden">Scan</span>
        </button>
      </div>
    </header>
  );
};
