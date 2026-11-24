"use client";

import React, { useState, useEffect } from "react";
import { CommandHeader } from "@/components/CommandHeader";
import { SidebarNav, ModuleKey } from "@/components/SidebarNav";
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
    <main className="min-h-screen p-3 sm:p-5 lg:p-6 max-w-[1700px] mx-auto bg-slate-50/60">
      {/* Top Cyber Command Header */}
      <CommandHeader systemStatus={systemStatus} />

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Interactive Sidebar */}
        <SidebarNav
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          systemStatus={systemStatus}
        />

        {/* Right Active Module Viewport with Animated Transitions */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {activeModule === "briefing" && <Module1Executive />}
              {activeModule === "dataset" && <Module2Dataset />}
              {activeModule === "training" && <Module3Training />}
              {activeModule === "benchmark" && <Module4Benchmark />}
              {activeModule === "classifier" && <Module5Classifier />}
              {activeModule === "viva" && <Module6Viva />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
