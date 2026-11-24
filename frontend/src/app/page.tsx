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

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error("Error loading system status:", err));
  }, []);

  return (
    <div className="min-h-screen flex bg-[#edf2ef] text-slate-900">
      {/* Base Layer: Left Persistent Sidebar */}
      <SidebarNav
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        systemStatus={systemStatus}
      />

      {/* Base Layer + Elevated Top Layer Layout */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Base Layer: Top Header (Seamlessly continuous with Sidebar) */}
        <TopHeader
          activeModule={activeModule}
          systemStatus={systemStatus}
          onNavigate={setActiveModule}
        />

        {/* Elevated Top Layer: Main Dashboard with Rounded Top-Left Corner */}
        <main className="flex-1 min-w-0 bg-white rounded-tl-[36px] p-6 lg:p-8 border-t border-l border-slate-200/70 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] min-h-[calc(100vh-4rem)]">
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
