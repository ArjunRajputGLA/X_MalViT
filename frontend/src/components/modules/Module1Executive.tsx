"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Cpu, 
  Layers, 
  ArrowRight,
  Shield,
  FileCheck
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

export const Module1Executive: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* HUD Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="text-3xl font-extrabold text-blue-600 font-mono tracking-tight">98.8%</div>
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mt-1.5">Classification Accuracy</div>
          <div className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center justify-center gap-1 bg-emerald-50 py-0.5 px-2 rounded-full inline-flex border border-emerald-200/50">
            <TrendingUp className="w-3.5 h-3.5" /> SOTA on Malimg
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="text-3xl font-extrabold text-indigo-600 font-mono tracking-tight">25</div>
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mt-1.5">Ground-Truth Families</div>
          <div className="text-[11px] text-indigo-600 mt-2 font-medium bg-indigo-50 py-0.5 px-2 rounded-full inline-flex border border-indigo-200/50">
            9,339 Total Binaries
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">23.4 ms</div>
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mt-1.5">Edge Inference Latency</div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium flex items-center justify-center gap-1 bg-emerald-50 py-0.5 px-2 rounded-full inline-flex border border-emerald-200/50">
            <Zap className="w-3.5 h-3.5 text-emerald-600" /> Real-Time Triage
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="text-3xl font-extrabold text-purple-600 font-mono tracking-tight">5.8 M</div>
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mt-1.5">ViT-Tiny Parameters</div>
          <div className="text-[11px] text-purple-700 mt-2 font-medium flex items-center justify-center gap-1 bg-purple-50 py-0.5 px-2 rounded-full inline-flex border border-purple-200/50">
            <Cpu className="w-3.5 h-3.5 text-purple-600" /> RTX 4050 FP16
          </div>
        </motion.div>
      </div>

      {/* Research Paper Abstract Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/80 shadow-xs hover:shadow-sm transition-all overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
                <FileCheck className="w-5 h-5 text-blue-600" />
                IEEE Conference Research Abstract
              </CardTitle>
              <Badge variant="cyber">Peer-Review Ready</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-sm text-slate-600 leading-relaxed font-sans">
            <p>
              <strong className="text-slate-900 font-semibold">Abstract:</strong> Static signature-based antivirus engines rely on cryptographic hash matching (MD5, SHA-256), which fails catastrophically against modern polymorphic and metamorphic malware. While dynamic analysis provides behavioral visibility, it is resource-intensive and vulnerable to sandbox evasion techniques. In this paper, we propose <strong className="text-blue-700 font-semibold">X-MalViT</strong>, a lightweight Vision Transformer architecture coupled with Gradient-weighted Class Activation Mapping (Grad-CAM) visual explainability for static malware family classification.
            </p>
            <p>
              Executable binaries from the benchmark Malimg dataset (9,339 samples across 25 families) are converted into two-dimensional grayscale byte matrices, where structural machine code patterns, encrypted payloads, and data segments naturally manifest as spatial textures. X-MalViT tokenizes these textures into non-overlapping patches and leverages multi-head self-attention to correlate distant Portable Executable (PE) headers with appended resource payloads. Unlike traditional black-box deep learning models, X-MalViT provides forensic explainability by projecting activation heatmaps back to discrete PE file sections (<code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 font-mono text-xs">.text</code>, <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 font-mono text-xs">.rsrc</code>, shellcode entry points). Trained locally using FP16 mixed precision on an NVIDIA GeForce RTX 4050 laptop GPU (6 GB VRAM), X-MalViT converges in under 4 minutes and achieves a <strong className="text-emerald-700 font-semibold">98.8% classification accuracy</strong>, an <strong className="text-emerald-700 font-semibold">F1-score of 98.7%</strong>, and an average inference latency of <strong className="text-emerald-700 font-semibold">23.4 ms per binary</strong>.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Autonomous Threat Pipeline */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Autonomous Threat Pipeline (End-to-End Visual Architecture)
          </h3>
          <span className="text-xs text-slate-400 font-mono font-medium">5 Staged Phases</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 mb-2.5 font-bold font-mono text-sm border border-blue-200">
              1
            </div>
            <div className="font-bold text-xs text-slate-900">Raw Binary</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Executable Windows PE binary containing opcode machine instructions.
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-indigo-400 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 mb-2.5 font-bold font-mono text-sm border border-indigo-200">
              2
            </div>
            <div className="font-bold text-xs text-slate-900">Byte Stream</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              8-bit unsigned integer stream mapping byte values from 0x00 to 0xFF.
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-purple-400 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700 mb-2.5 font-bold font-mono text-sm border border-purple-200">
              3
            </div>
            <div className="font-bold text-xs text-slate-900">2D Reshaping</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Dynamic fixed-width matrix projection preserving assembly layout.
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-emerald-400 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 mb-2.5 font-bold font-mono text-sm border border-emerald-200">
              4
            </div>
            <div className="font-bold text-xs text-slate-900">224x224 ViT</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              14x14 patch tokenization with 8-head global self-attention correlation.
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-rose-400 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700 mb-2.5 font-bold font-mono text-sm border border-rose-200">
              5
            </div>
            <div className="font-bold text-xs text-slate-900">Grad-CAM XAI</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
              Attribution heatmap reverse-mapped to PE headers and shellcode offsets.
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
