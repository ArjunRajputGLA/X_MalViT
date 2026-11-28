"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav, ModuleKey } from "@/components/SidebarNav";
import { TopHeader } from "@/components/TopHeader";
import { Module1Executive } from "@/components/modules/Module1Executive";
import { Module2Dataset } from "@/components/modules/Module2Dataset";
import { Module3Training } from "@/components/modules/Module3Training";
import { Module4Benchmark } from "@/components/modules/Module4Benchmark";
import { Module5Classifier } from "@/components/modules/Module5Classifier";
import { Module6Manuscript } from "@/components/modules/Module6Manuscript";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("briefing");
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error("Error loading system status:", err));

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-screen w-screen overflow-hidden flex bg-canvas text-ink">
        {/* Base Layer: Desktop Sidebar + Mobile Slide-in Drawer (<1024px) */}
        <SidebarNav
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          systemStatus={systemStatus}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Right Shell: Fixed Header + Container-Confined Scrollable Main Dashboard */}
        <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-transparent relative">
          {/* Top Header (sits cleanly on canvas above the main container) */}
          <TopHeader
            activeModule={activeModule}
            systemStatus={systemStatus}
            onNavigate={setActiveModule}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isMobileMenuOpen={isMobileDrawerOpen}
            onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          />

          {/* Elevated Top Layer: Content scrolls strictly inside this rounded container */}
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-surface lg:rounded-l-panel p-4 sm:p-6 border-t lg:border-y lg:border-l border-line shadow-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                {activeModule === "briefing" && <Module1Executive onNavigate={setActiveModule} />}
                {activeModule === "dataset" && <Module2Dataset />}
                {activeModule === "training" && <Module3Training />}
                {activeModule === "benchmark" && <Module4Benchmark />}
                {activeModule === "classifier" && <Module5Classifier />}
                {(activeModule === "manuscript" || activeModule === "viva") && <Module6Manuscript />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
