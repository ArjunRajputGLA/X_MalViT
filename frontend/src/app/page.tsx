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
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Persistent Full-Height Left Sidebar */}
      <SidebarNav
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        systemStatus={systemStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <TopHeader
          activeModule={activeModule}
          systemStatus={systemStatus}
          onNavigate={setActiveModule}
        />

        {/* Dynamic Viewport Canvas */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
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
