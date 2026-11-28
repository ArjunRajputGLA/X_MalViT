"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SearchCode, 
  Flame, 
  Terminal, 
  Layers, 
  Zap,
  Loader2,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AnimatedBar } from "@/components/ui/AnimatedBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BinaryDropzone } from "@/components/ui/BinaryDropzone";

function getCategoryChipClass(category?: string): string {
  switch (category) {
    case "Worm":
      return "bg-critical-soft text-critical-ink";
    case "Backdoor":
    case "Trojan":
      return "bg-high-soft text-high-ink";
    case "Trojan Downloader":
    case "Downloader":
    case "Dialer":
      return "bg-accent-soft text-accent";
    case "PWS":
    case "Rogue":
      return "bg-ok-soft text-ok-ink";
    default:
      return "bg-surface-2 text-muted";
  }
}

function getColormapGradient(colormap: string): string {
  switch (colormap) {
    case "plasma":
      return "linear-gradient(to right, #0D0887, #6A00A8, #B12A90, #E16462, #FCA636, #F0F921)";
    case "inferno":
      return "linear-gradient(to right, #000004, #420A68, #932667, #DD513A, #FCA50A, #FCFFA4)";
    case "viridis":
      return "linear-gradient(to right, #440154, #3B528B, #21918C, #5EC962, #FDE725)";
    case "jet":
    default:
      return "linear-gradient(to right, #000080, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000, #800000)";
  }
}

function parseHexDumpLines(hexDump?: string) {
  if (!hexDump) return [];
  return hexDump
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const match = line.match(/^([0-9A-Fa-f]+)\s{2,}(.+?)\s{2,}(\|.*\|)$/);
      if (match) {
        return { offset: match[1], bytes: match[2], ascii: match[3], raw: null };
      }
      return { offset: "", bytes: "", ascii: "", raw: line };
    });
}

export const Module5Classifier: React.FC = () => {
  const [families, setFamilies] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<"bank" | "upload">("bank");
  const [selectedFamily, setSelectedFamily] = useState<string>("Allaple.A");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [colormap, setColormap] = useState<string>("jet");
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/dataset/overview")
      .then((res) => res.json())
      .then((data) => {
        if (data.families && data.families.length > 0) {
          setFamilies(data.families);
          setSelectedFamily(data.families[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRunInference = async () => {
    setIsInferring(true);
    setPredictionResult(null);

    try {
      if (inputMode === "bank") {
        const res = await fetch("/api/predict/sample", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            family: selectedFamily,
            colormap: colormap,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPredictionResult(data);
        } else {
          alert("Inference failed: " + res.statusText);
        }
      } else {
        if (!uploadedFile) {
          alert("Please upload a file first!");
          setIsInferring(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("colormap", colormap);

        const res = await fetch("/api/predict/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setPredictionResult(data);
        } else {
          alert("Inference failed: " + res.statusText);
        }
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsInferring(false);
    }
  };

  const prefersReducedMotion = useReducedMotion();

  const isOod = Boolean(predictionResult?.is_out_of_distribution);
  const confidencePct = predictionResult && !isOod ? predictionResult.confidence * 100 : 0;
  const confidenceTierClass =
    confidencePct >= 80
      ? "bg-critical"
      : confidencePct >= 50
      ? "bg-high"
      : "bg-muted";
  const hexRows = parseHexDumpLines(predictionResult?.hex_dump);
  const resultAnimKey = predictionResult
    ? `${predictionResult.top_family}-${predictionResult.latency_ms}-${predictionResult.raw_image_url?.slice(-24) || ""}`
    : "empty";

  return (
    <div className="space-y-6">
      {/* Control Configuration Panel */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2">
          <CardTitle className="flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-accent" />
            Threat Input &amp; Grad-CAM Heatmap Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {/* Source SegmentedControl */}
          <div className="w-full md:max-w-lg">
            <SegmentedControl
              ariaLabel="Threat Input Source"
              layoutId="seg-classifier-input"
              value={inputMode}
              onChange={setInputMode}
              options={[
                { value: "bank" as const, label: "Malimg Sample Bank" },
                { value: "upload" as const, label: "Upload Custom Executable Image" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {inputMode === "bank" ? (
              <div>
                <label className="text-[13px] font-medium text-ink block mb-1.5">
                  Select Target Malware Sample:
                </label>
                <div className="relative">
                  <select
                    value={selectedFamily}
                    onChange={(e) => setSelectedFamily(e.target.value)}
                    className="appearance-none h-10 w-full bg-surface-2 border border-line rounded-chip pl-3 pr-9 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-mono transition-colors cursor-pointer"
                  >
                    {families.map((fam) => (
                      <option key={fam} value={fam}>
                        {fam}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[13px] font-medium text-ink block mb-1.5">
                  Upload Binary Grayscale File (.png, .jpg):
                </label>
                <BinaryDropzone
                  uploadedFile={uploadedFile}
                  onFileChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Grad-CAM Color Gradient Map:
              </label>
              <div className="relative">
                <select
                  value={colormap}
                  onChange={(e) => setColormap(e.target.value)}
                  className="appearance-none h-10 w-full bg-surface-2 border border-line rounded-chip pl-3 pr-9 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-medium transition-colors cursor-pointer"
                >
                  <option value="jet">Jet (Classic Cyber Rainbow)</option>
                  <option value="plasma">Plasma (High-Contrast Purple-Yellow)</option>
                  <option value="inferno">Inferno (Thermal Infrared)</option>
                  <option value="viridis">Viridis (Perceptually Uniform)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleRunInference}
              disabled={isInferring}
              className="w-full"
              variant="cyber"
              size="lg"
            >
              {isInferring ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isInferring
                ? "Computing Gradient Activation Attribution..."
                : "Run X-MalViT Diagnostic Inference"}
            </Button>

            {isInferring && (
              <div
                aria-hidden="true"
                className="h-1 w-full rounded-full bg-surface-2 overflow-hidden"
              >
                <div className="indeterminate-bar h-full w-1/3 bg-accent rounded-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeletons while Inference Runs */}
      {isInferring && !predictionResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-28 rounded-chip" />
                <Skeleton className="h-5 w-32 rounded-chip" />
              </div>
              <Skeleton className="h-8 w-44 rounded-chip" />
              <Skeleton className="h-2.5 w-full rounded-chip" />
              <div className="space-y-2 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-chip" />
                ))}
              </div>
            </Card>
            <Card className="p-6 space-y-4">
              <Skeleton className="h-5 w-48 rounded-chip" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="aspect-square w-full rounded-tile" />
                <Skeleton className="aspect-square w-full rounded-tile" />
                <Skeleton className="aspect-square w-full rounded-tile" />
              </div>
            </Card>
          </div>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-5 w-60 rounded-chip" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full rounded-tile" />
              <Skeleton className="h-20 w-full rounded-tile" />
              <Skeleton className="h-20 w-full rounded-tile" />
            </div>
            <Skeleton className="h-32 w-full rounded-tile" />
          </Card>
        </div>
      )}

      {/* Inference Diagnostic Results */}
      <AnimatePresence mode="wait">
        {predictionResult && (
          <div key={resultAnimKey} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
              {/* Step 1: Verdict Card fades in + Confidence AnimatedBar fills */}
              <motion.div
                initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
                className="h-full min-w-0"
              >
                <Card className="overflow-hidden flex flex-col h-full">
                  <CardHeader className="pb-4 border-b border-line bg-surface-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge
                        variant={isOod ? "warning" : "destructive"}
                        className="border-0 text-[12px] font-medium"
                      >
                        {isOod ? "Non-PE / Out-of-Distribution" : "Threat detected"}
                      </Badge>
                      <span className="text-[12px] text-ok-ink bg-ok-soft px-2.5 py-0.5 rounded-chip font-mono font-medium inline-flex items-center gap-1 tabular-nums whitespace-nowrap shrink-0" title={predictionResult.device_name || predictionResult.device}>
                        <Zap className="w-3.5 h-3.5 text-ok shrink-0" />
                        {predictionResult.latency_ms.toFixed(2)} ms (
                        {predictionResult.device_name?.includes("RTX")
                          ? predictionResult.device_name
                              .replace("NVIDIA GeForce ", "")
                              .replace(" Laptop GPU", "")
                          : predictionResult.device?.toLowerCase().includes("cuda")
                          ? "CUDA GPU"
                          : "CPU"}
                        )
                      </span>
                    </div>
                    <CardTitle className="text-[28px] leading-[1.2] font-semibold text-ink mt-2.5 font-mono">
                      {predictionResult.top_family}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-[13px] text-muted font-medium mt-1">
                      <span>Category:</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-chip text-[12px] font-medium ${
                          isOod
                            ? "bg-surface-2 text-muted"
                            : getCategoryChipClass(predictionResult.category)
                        }`}
                      >
                        {predictionResult.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5 flex-1">
                    <div>
                      <div className="flex justify-between text-[13px] text-ink mb-1.5 font-medium tabular-nums">
                        <span>Confidence Score:</span>
                        <span className="text-ink font-semibold font-mono">
                          {confidencePct.toFixed(2)}%
                        </span>
                      </div>
                      <AnimatedBar
                        percentage={confidencePct}
                        className="h-2.5"
                        barClassName={confidenceTierClass}
                      />
                    </div>

                    {isOod ? (
                      <div className="p-4 rounded-tile bg-high-soft border border-high/20 text-[13px] text-ink leading-[1.55] space-y-1.5">
                        <div className="font-semibold text-high-ink">
                          Not recognized as a compiled PE binary texture
                        </div>
                        <p className="text-muted text-[12px]">
                          {predictionResult.ood_reason}
                        </p>
                        <p className="text-muted text-[12px]">
                          Upload an 8-bit grayscale executable byte matrix or choose a sample from the Malimg Sample Bank to run 25-family classification.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[13px] font-semibold text-ink mb-2">
                          Top-5 Family Likelihood Ranking
                        </div>
                        <div className="overflow-x-auto rounded-tile border border-line">
                          <table className="w-full text-[13px] text-left tabular-nums">
                            <thead className="bg-surface-2 text-muted text-[13px] font-medium border-b border-line">
                              <tr>
                                <th className="py-2 px-3 font-medium">Family variant</th>
                                <th className="py-2 px-3 font-medium">Likelihood</th>
                                <th className="py-2 px-3 font-medium">Category</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line text-ink font-normal">
                              {(predictionResult.top_5 || []).map((item: any, idx: number) => {
                                const itemPct = item.confidence * 100;
                                return (
                                  <tr
                                    key={idx}
                                    className={
                                      idx === 0
                                        ? "bg-accent-soft/60 text-ink font-semibold"
                                        : "hover:bg-surface-2 transition-colors"
                                    }
                                  >
                                    <td className="py-2 px-3 font-mono">{item.family}</td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-16 h-1.5 rounded-full bg-surface-2 overflow-hidden flex-shrink-0">
                                          <div
                                            className={`h-full rounded-full ${
                                              idx === 0 ? "bg-accent" : "bg-muted/50"
                                            }`}
                                            style={{
                                              width: `${Math.min(100, Math.max(3, itemPct))}%`,
                                            }}
                                          />
                                        </div>
                                        <span className="font-mono text-[12px] tabular-nums">
                                          {itemPct.toFixed(2)}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-muted">{item.category}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Visual Attribution 3-Panel Card (Matches height to Verdict card) */}
              <Card
                role="region"
                aria-label={`Grad-CAM visual attribution for ${predictionResult.top_family} using ${colormap} colormap`}
                className="overflow-hidden flex flex-col h-full min-w-0"
              >
                <p className="sr-only">
                  Three side-by-side matrices: raw binary image, Grad-CAM activation map using the {colormap} scale, and forensic overlay highlighting the {predictionResult.pe_analysis?.section || "PE"} hotspot.
                </p>
                <CardHeader className="pb-4 border-b border-line bg-surface-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-critical" />
                      Grad-CAM Visual Attribution (XAI)
                    </CardTitle>
                    {predictionResult.gradcam_ms != null && (
                      <span className="text-[12px] font-mono text-critical-ink bg-critical-soft px-2 py-0.5 rounded-chip font-medium whitespace-nowrap shrink-0 tabular-nums">
                        XAI Backprop: {predictionResult.gradcam_ms.toFixed(1)} ms
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex-1 flex items-center">
                    <div className="grid grid-cols-3 gap-3 w-full items-start">
                      {/* Step 2: Raw Binary image appears */}
                      <motion.div
                        initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.2,
                          delay: prefersReducedMotion ? 0 : 0.22,
                          ease: "easeOut",
                        }}
                        className="text-center"
                      >
                        <div className="text-[12px] font-medium text-muted mb-1.5">
                          1. Raw Binary
                        </div>
                        <div className="aspect-square rounded-tile overflow-hidden border border-line hover:border-accent/60 bg-surface-2 p-1 transition-all duration-200 hover:-translate-y-0.5 group">
                          <img
                            src={predictionResult.raw_image_url}
                            alt="Raw Binary"
                            style={{ imageRendering: "pixelated" }}
                            className="w-full h-full object-cover rounded-chip transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                          />
                        </div>
                      </motion.div>

                      {/* Step 3: Activation Map swept top-to-bottom + colour legend */}
                      <div className="text-center">
                        <div className="text-[12px] font-medium text-muted mb-1.5">
                          2. Activation Map
                        </div>
                        {isOod || !predictionResult.heatmap_url ? (
                          <div className="aspect-square rounded-tile border border-dashed border-line bg-surface-2 flex items-center justify-center p-3 text-[11px] text-muted">
                            Skipped (Non-PE)
                          </div>
                        ) : (
                          <>
                            <div className="relative aspect-square rounded-tile overflow-hidden border border-line hover:border-accent/60 bg-surface-2 p-1 transition-all duration-200 hover:-translate-y-0.5 group">
                              <div className="relative w-full h-full rounded-chip overflow-hidden">
                                <motion.img
                                  src={predictionResult.heatmap_url}
                                  alt="Activation Map"
                                  initial={{
                                    clipPath: prefersReducedMotion
                                      ? "inset(0% 0% 0% 0%)"
                                      : "inset(0% 0% 100% 0%)",
                                  }}
                                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                                  transition={{
                                    duration: prefersReducedMotion ? 0 : 0.7,
                                    delay: prefersReducedMotion ? 0 : 0.38,
                                    ease: "linear",
                                  }}
                                  style={{ imageRendering: "pixelated" }}
                                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                                />
                                {!prefersReducedMotion && (
                                  <motion.div
                                    aria-hidden="true"
                                    initial={{ top: "0%", opacity: 0 }}
                                    animate={{
                                      top: ["0%", "100%"],
                                      opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{
                                      duration: 0.7,
                                      delay: 0.38,
                                      ease: "linear",
                                      times: [0, 0.08, 0.9, 1],
                                    }}
                                    className="pointer-events-none absolute inset-x-0 h-[2px] bg-accent shadow-[0_0_12px_2px_var(--accent)] z-20"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Low -> High colour-scale legend matching colormap */}
                            <div className="mt-2 px-0.5">
                              <div
                                className="h-1.5 w-full rounded-full border border-line/60"
                                style={{ background: getColormapGradient(colormap) }}
                                aria-hidden="true"
                              />
                              <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
                                <span>Low</span>
                                <span>High</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Step 4: Forensic Overlay crossfades in last, selected accent ring */}
                      <motion.div
                        initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.3,
                          delay: prefersReducedMotion ? 0 : 1.08,
                          ease: "easeOut",
                        }}
                        className="text-center"
                      >
                        <div className="text-[12px] font-medium text-ink mb-1.5">
                          3. Forensic Overlay
                        </div>
                        {isOod || !predictionResult.overlay_url ? (
                          <div className="aspect-square rounded-tile border border-dashed border-line bg-surface-2 flex items-center justify-center p-3 text-[11px] text-muted">
                            Skipped (Non-PE)
                          </div>
                        ) : (
                          <div className="aspect-square rounded-tile overflow-hidden border border-accent ring-2 ring-accent/30 bg-surface-2 p-1 transition-all duration-200 hover:-translate-y-0.5 group">
                            <img
                              src={predictionResult.overlay_url}
                              alt="Forensic Overlay"
                              style={{ imageRendering: "pixelated" }}
                              className="w-full h-full object-cover rounded-chip transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                            />
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  <div className="text-[12px] text-muted pt-3 border-t border-line text-center font-medium">
                    {isOod
                      ? "Grad-CAM attribution was skipped because the upload failed binary texture validation."
                      : "Red pixels highlight the 16×16 spatial patch tokens driving the penultimate-layer Grad-CAM decision."}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Authentic Patch & Byte-Offset Forensic Attribution */}
            {!isOod && predictionResult.pe_analysis && (
            <motion.div
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.25,
                delay: prefersReducedMotion ? 0 : 0.12,
                ease: "easeOut",
              }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-4 border-b border-line bg-surface-2">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-accent" />
                    Patch-Level &amp; Byte-Offset Forensic Attribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-tile bg-surface-2 border border-line hover:border-accent/40 hover:bg-surface hover:-translate-y-0.5 transition-all duration-200">
                      <div className="text-[12px] text-muted font-medium">
                        Spatial region band
                      </div>
                      <div className="text-[18px] leading-[1.25] font-semibold text-ink mt-1.5 font-mono">
                        {predictionResult.pe_analysis?.section}
                      </div>
                    </div>

                    <div className="p-4 rounded-tile bg-surface-2 border border-line hover:border-accent/40 hover:bg-surface hover:-translate-y-0.5 transition-all duration-200">
                      <div className="text-[12px] text-muted font-medium">
                        224×224 matrix byte offset
                      </div>
                      <div className="text-[20px] leading-[1.2] font-semibold text-accent mt-1.5 font-mono tabular-nums">
                        {predictionResult.pe_analysis?.virtual_address}
                      </div>
                    </div>

                    <div className="p-4 rounded-tile bg-surface-2 border border-line hover:border-accent/40 hover:bg-surface hover:-translate-y-0.5 transition-all duration-200">
                      <div className="text-[12px] text-muted font-medium">
                        Grad-CAM peak weight
                      </div>
                      <div className="text-[20px] leading-[1.2] font-semibold text-ok-ink mt-1.5 font-mono tabular-nums">
                        {predictionResult.pe_analysis?.attention_weight.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-r-tile rounded-l-chip bg-accent-soft/45 border border-line border-l-4 border-l-accent text-[13px] text-ink leading-[1.5]">
                    <strong className="text-ink font-semibold">Patch Telemetry:</strong>{" "}
                    {predictionResult.pe_analysis?.forensic_meaning}
                  </div>

                  {/* Hex Dump Inspector - Dark token scope */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink mb-2">
                      <Terminal className="w-4 h-4 text-high" />
                      Grayscale Matrix Byte Inspector (Around Peak Patch Offset)
                    </div>
                    <div className="dark hex-terminal p-3 text-[13px] leading-[1.6] font-mono overflow-x-auto text-ink tabular-nums">
                      <div className="min-w-[600px]">
                        <div className="grid grid-cols-[88px_minmax(320px,1fr)_160px] gap-4 px-2.5 pb-1.5 mb-1 border-b border-line text-[12px] text-muted font-medium select-none">
                          <span>Offset</span>
                          <span>Bytes</span>
                          <span className="text-right">ASCII</span>
                        </div>
                        <div className="space-y-0.5">
                          {hexRows.map((row, idx) =>
                            row.raw !== null ? (
                              <div
                                key={idx}
                                className="px-2.5 py-0.5 rounded-chip hover:bg-surface transition-colors whitespace-pre"
                              >
                                {row.raw}
                              </div>
                            ) : (
                              <div
                                key={idx}
                                className="group grid grid-cols-[88px_minmax(320px,1fr)_160px] gap-4 items-center px-2.5 py-0.5 rounded-chip hover:bg-surface transition-colors"
                              >
                                <span className="text-muted group-hover:text-accent transition-colors select-none">{row.offset}</span>
                                <span className="text-ink whitespace-pre">{row.bytes}</span>
                                <span className="text-accent text-right whitespace-pre">
                                  {row.ascii}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
