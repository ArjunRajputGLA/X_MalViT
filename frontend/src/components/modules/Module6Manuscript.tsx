"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  Layers, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  TrendingUp,
  FileCode
} from "lucide-react";
import { motion } from "framer-motion";

export const Module6Manuscript: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/manuscripts")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error loading manuscripts:", err));
  }, []);

  const manuscripts = data?.manuscripts || [
    {
      title: "IEEE Conference Full Research Paper (4-Page Official Manuscript)",
      filename: "IEEE_Research_Paper_X_MalViT.pdf",
      size: "943 KB",
      description: "Complete camera-ready double-column IEEE format manuscript with mathematical formulations and comparative ablation tables.",
      url: "/api/documents/IEEE_Research_Paper_X_MalViT.pdf"
    },
    {
      title: "Malware Research Project Guide (Executive Blueprint)",
      filename: "Malware_Research_Project_Guide.pdf",
      size: "382 KB",
      description: "Executive research roadmap detailing visual tokenization methodology and threat intelligence pipeline.",
      url: "/api/documents/Malware_Research_Project_Guide.pdf"
    },
    {
      title: "X-MalViT IEEE Conference Preprint",
      filename: "X-MalViT_IEEE_Conference.pdf",
      size: "295 KB",
      description: "Author preprint showcasing experimental comparisons against CNNs, MalConv, and random forest baselines.",
      url: "/api/documents/X-MalViT_IEEE_Conference.pdf"
    }
  ];

  const bibtexCode = `@article{agrawal2026xmalvit,
  title={X-MalViT: Explainable Vision Transformer for Static Malware Family Classification via 2D Opcode Textures and Grad-CAM PE Attribution},
  author={Agrawal, Keshav and Rajput, Arjun S.},
  institution={GLA University, Mathura},
  journal={IEEE Conference on Cyber Threat Intelligence & Machine Learning},
  year={2026},
  pages={1--4},
  keywords={Vision Transformer, Static Malware Analysis, Explainable AI, Grad-CAM, Malimg Benchmark}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCode);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. Research Paper Identity & Publication Banner */}
      <Card className="border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 lg:p-8 text-white relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/20">
              IEEE Conference Publication
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
              Camera-Ready Manuscript
            </span>
          </div>

          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight leading-snug max-w-4xl">
            X-MalViT: Explainable Vision Transformer for Static Malware Family Classification via 2D Opcode Textures and Grad-CAM PE Attribution
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-emerald-100 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">Authors:</span>
              <span>Keshav Agrawal & Arjun S. Rajput</span>
            </div>
            <div className="hidden sm:block text-emerald-300">•</div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">Affiliation:</span>
              <span>GLA University, Mathura</span>
            </div>
            <div className="hidden sm:block text-emerald-300">•</div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">Benchmark:</span>
              <span>Malimg (9,339 Binaries, 25 Families)</span>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Classification Acc</div>
              <div className="text-2xl font-black text-white mt-0.5">98.8%</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Model Footprint</div>
              <div className="text-2xl font-black text-white mt-0.5">5.8 M</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Edge Inference</div>
              <div className="text-2xl font-black text-white mt-0.5">23.4 ms</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Hardware Target</div>
              <div className="text-2xl font-black text-white mt-0.5">RTX 4050</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Official Downloadable Manuscripts & Artifacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Published Manuscripts & Technical Artifacts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official camera-ready PDF publications, architectural specifications, and author preprints
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
            3 PDF Documents
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {manuscripts.map((doc: any, idx: number) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/60">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                    {doc.size || "PDF"}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {doc.description || "Official project technical artifact and research publication."}
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-3 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{doc.filename}</span>
                </div>
              </div>

              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full mt-5 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download / View PDF
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Core Contributions & Architectural Innovations */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Empirical Research Contributions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2.5">
                01
              </div>
              <div className="font-bold text-xs text-slate-900">2D Visual Tokenization</div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Projects raw byte streams into fixed-width assembly grids, preserving opcode layouts without requiring sandbox dynamic execution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2.5">
                02
              </div>
              <div className="font-bold text-xs text-slate-900">Multi-Head Self-Attention</div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Correlates non-local byte patches across 8 attention heads, linking initial PE headers with distant resource payloads.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-2.5">
                03
              </div>
              <div className="font-bold text-xs text-slate-900">Grad-CAM Attribution</div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Reverse-maps activation gradients back to discrete PE sections (.text, .rsrc, shellcode jump offsets) for white-box forensic explainability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-2.5">
                04
              </div>
              <div className="font-bold text-xs text-slate-900">Edge Hardware Feasibility</div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Requires only 5.8M parameters with 23.4 ms latency and FP16 AMP support on an NVIDIA RTX 4050 GPU, enabling edge deployment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. BibTeX Citation Block */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Cite This Work (BibTeX)
          </CardTitle>
          <button
            onClick={handleCopyBibtex}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            {copiedBibtex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy BibTeX</span>
              </>
            )}
          </button>
        </CardHeader>
        <CardContent className="pt-4">
          <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
            {bibtexCode}
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Module6Manuscript;
