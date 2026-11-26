"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  FileCode,
  LayoutGrid,
  Network,
  Flame,
  Cpu
} from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

function renderHighlightedBibtex(code: string) {
  return code.split("\n").map((line, idx) => {
    // Entry header: @article{agrawal2026xmalvit,
    const entryMatch = line.match(/^(@[a-zA-Z]+)(\{)([^,]+)(,?)$/);
    if (entryMatch) {
      return (
        <div key={idx}>
          <span className="text-accent font-medium">{entryMatch[1]}</span>
          <span className="text-muted">{entryMatch[2]}</span>
          <span className="text-ink font-medium">{entryMatch[3]}</span>
          <span className="text-muted">{entryMatch[4]}</span>
        </div>
      );
    }

    // Field line:   title={...},
    const fieldMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+)(=)(\{)(.*)(\})(,?)$/);
    if (fieldMatch) {
      return (
        <div key={idx}>
          <span>{fieldMatch[1]}</span>
          <span className="text-muted">{fieldMatch[2]}</span>
          <span className="text-muted">{fieldMatch[3]}</span>
          <span className="text-muted">{fieldMatch[4]}</span>
          <span className="text-ink">{fieldMatch[5]}</span>
          <span className="text-muted">{fieldMatch[6]}</span>
          <span className="text-muted">{fieldMatch[7]}</span>
        </div>
      );
    }

    return (
      <div key={idx} className="text-muted">
        {line}
      </div>
    );
  });
}

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
    <div className="space-y-6">
      {/* 1. Research Paper Identity & Publication Hero */}
      <Card className="overflow-hidden relative">
        {/* Faint byte-texture motif on right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-72 sm:w-96 overflow-hidden"
        >
          <img
            src="/malimg-motif.png"
            alt=""
            style={{
              imageRendering: "pixelated",
              maskImage:
                "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)",
            }}
            className="w-full h-full object-cover opacity-[0.12] dark:opacity-[0.16] select-none"
          />
        </div>

        <div className="relative z-10 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-chip text-[12px] font-medium bg-surface-2 text-muted border border-line">
              IEEE Conference Publication
            </span>
            <span className="px-2.5 py-0.5 rounded-chip text-[12px] font-medium bg-surface-2 text-muted border border-line">
              Camera-Ready Manuscript
            </span>
          </div>

          <h2 className="text-[32px] leading-[1.2] font-semibold text-ink max-w-4xl">
            X-MalViT: Explainable Vision Transformer for Static Malware Family Classification via 2D Opcode Textures and Grad-CAM PE Attribution
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-ink font-semibold">Authors:</span>
              <span>Keshav Agrawal &amp; Arjun S. Rajput</span>
            </div>
            <div className="hidden sm:block text-line">&bull;</div>
            <div className="flex items-center gap-1.5">
              <span className="text-ink font-semibold">Affiliation:</span>
              <span>GLA University, Mathura</span>
            </div>
            <div className="hidden sm:block text-line">&bull;</div>
            <div className="flex items-center gap-1.5">
              <span className="text-ink font-semibold">Benchmark:</span>
              <span className="tabular-nums">Malimg (9,339 Binaries, 25 Families)</span>
            </div>
          </div>

          {/* Key Metrics Strip: Plain figures separated by hairlines */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line mt-6 pt-6 border-t border-line">
            <div className="py-2 sm:py-0 sm:pr-6">
              <div className="text-[12px] text-muted font-medium">Classification acc</div>
              <div className="text-[24px] leading-[1.2] font-semibold text-ink mt-1 tabular-nums">
                <AnimatedNumber value="98.8%" />
              </div>
            </div>
            <div className="py-2 sm:py-0 px-0 sm:px-6">
              <div className="text-[12px] text-muted font-medium">Model footprint</div>
              <div className="text-[24px] leading-[1.2] font-semibold text-ink mt-1 tabular-nums">
                <AnimatedNumber value="5.8 M" />
              </div>
            </div>
            <div className="py-2 sm:py-0 px-0 sm:px-6">
              <div className="text-[12px] text-muted font-medium">Edge inference</div>
              <div className="text-[24px] leading-[1.2] font-semibold text-ink mt-1 tabular-nums">
                <AnimatedNumber value="23.4 ms" />
              </div>
            </div>
            <div className="py-2 sm:py-0 sm:pl-6">
              <div className="text-[12px] text-muted font-medium">Hardware target</div>
              <div className="text-[24px] leading-[1.2] font-semibold text-ink mt-1">
                RTX 4050
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Official Downloadable Manuscripts & Artifacts */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-[20px] leading-[1.2] font-semibold text-ink flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Published Manuscripts &amp; Technical Artifacts
            </h3>
            <p className="text-[13px] leading-[1.5] text-muted mt-1">
              Official camera-ready PDF publications, architectural specifications, and author preprints
            </p>
          </div>
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-chip bg-surface-2 border border-line text-muted tabular-nums flex-shrink-0">
            3 PDF Documents
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {manuscripts.map((doc: any, idx: number) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={idx}
                className="bg-surface p-6 rounded-panel border border-line shadow-panel flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-tile bg-surface-2 flex items-center justify-center text-accent border border-line">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[12px] px-2 py-0.5 rounded-chip bg-surface-2 border border-line text-muted font-mono font-medium tabular-nums">
                      {doc.size || "PDF"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-[16px] leading-[1.2] text-ink">
                    {doc.title}
                  </h4>
                  <p className="text-[13px] text-muted mt-2 leading-[1.5]">
                    {doc.description || "Official project technical artifact and research publication."}
                  </p>
                  <div className="text-[12px] font-mono text-muted mt-3 flex items-center gap-1.5 truncate">
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{doc.filename}</span>
                  </div>
                </div>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 w-full mt-5 h-10 px-4 rounded-chip text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                    isPrimary
                      ? "bg-accent hover:bg-accent/90 text-white"
                      : "bg-surface border border-line text-ink hover:bg-surface-2 hover:border-accent/40"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download / View PDF
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Core Contributions & Architectural Innovations */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Empirical Research Contributions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-tile bg-surface-2 border border-line">
              <div className="w-8 h-8 rounded-chip bg-accent-soft text-accent flex items-center justify-center mb-2.5">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[14px] text-ink">2D Visual Tokenization</div>
              <p className="text-[12px] text-muted mt-1.5 leading-[1.5]">
                Projects raw byte streams into fixed-width assembly grids, preserving opcode layouts without requiring sandbox dynamic execution.
              </p>
            </div>

            <div className="p-4 rounded-tile bg-surface-2 border border-line">
              <div className="w-8 h-8 rounded-chip bg-accent-soft text-accent flex items-center justify-center mb-2.5">
                <Network className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[14px] text-ink">Multi-Head Self-Attention</div>
              <p className="text-[12px] text-muted mt-1.5 leading-[1.5]">
                Correlates non-local byte patches across 8 attention heads, linking initial PE headers with distant resource payloads.
              </p>
            </div>

            <div className="p-4 rounded-tile bg-surface-2 border border-line">
              <div className="w-8 h-8 rounded-chip bg-accent-soft text-accent flex items-center justify-center mb-2.5">
                <Flame className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[14px] text-ink">Grad-CAM Attribution</div>
              <p className="text-[12px] text-muted mt-1.5 leading-[1.5]">
                Reverse-maps activation gradients back to discrete PE sections (<span className="font-mono">.text</span>, <span className="font-mono">.rsrc</span>, shellcode jump offsets) for white-box forensic explainability.
              </p>
            </div>

            <div className="p-4 rounded-tile bg-surface-2 border border-line">
              <div className="w-8 h-8 rounded-chip bg-accent-soft text-accent flex items-center justify-center mb-2.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[14px] text-ink">Edge Hardware Feasibility</div>
              <p className="text-[12px] text-muted mt-1.5 leading-[1.5] tabular-nums">
                Requires only 5.8M parameters with 23.4 ms latency and FP16 AMP support on an NVIDIA RTX 4050 GPU, enabling edge deployment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. BibTeX Citation Block */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Cite This Work (BibTeX)
          </CardTitle>
          <button
            onClick={handleCopyBibtex}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-[13px] font-medium bg-surface border border-line hover:border-accent/40 hover:text-accent text-ink transition-colors cursor-pointer"
          >
            {copiedBibtex ? (
              <>
                <Check className="w-3.5 h-3.5 text-ok" />
                <span className="text-ok">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span>Copy BibTeX</span>
              </>
            )}
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          <pre className="p-4 rounded-tile bg-surface-2 text-ink font-mono text-[13px] leading-[1.6] overflow-x-auto border border-line">
            {renderHighlightedBibtex(bibtexCode)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default Module6Manuscript;
