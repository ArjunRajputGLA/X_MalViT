"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav, ModuleKey } from "@/components/SidebarNav";
import { TopHeader } from "@/components/TopHeader";
import { Module1Executive } from "@/components/modules/Module1Executive";
import { Module2Dataset } from "@/components/modules/Module2Dataset";
import { Module3Training } from "@/components/modules/Module3Training";
import { Module4Benchmark } from "@/components/modules/Module4Benchmark";
import { Module5Classifier } from "@/components/modules/Module5Classifier";
import { Module6Viva } from "@/components/modules/Module6Viva";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("briefing");
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
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
    <div className="h-screen w-screen overflow-hidden flex bg-[#edf2ef] text-slate-900">
      {/* Base Layer: Left Collapsible Sidebar with Animated Spring Width */}
      <SidebarNav
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        systemStatus={systemStatus}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Right Shell: Fixed Header + Fluidly Stretching Main Dashboard */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-transparent">
        {/* Base Layer: Top Header with Animated Collapse Toggle */}
        <TopHeader
          activeModule={activeModule}
          systemStatus={systemStatus}
          onNavigate={setActiveModule}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Elevated Top Layer: Stretches automatically to fill all available width */}
        <main className="flex-1 min-w-0 bg-white rounded-tl-[36px] p-6 lg:p-8 border-t border-l border-slate-200/70 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeModule === "briefing" && <Module1Executive onNavigate={setActiveModule} />}
              {activeModule === "dataset" && <Module2Dataset />}
              {activeModule === "training" && <Module3Training />}
              {activeModule === "benchmark" && <Module4Benchmark />}
              {activeModule === "classifier" && <Module5Classifier />}
              {activeModule === "viva" && <Module6Viva />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
