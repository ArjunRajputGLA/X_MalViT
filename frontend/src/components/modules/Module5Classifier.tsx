"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  SearchCode, 
  Flame, 
  Terminal, 
  Layers, 
  Zap,
  CheckCircle2,
  FileUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Control Configuration Panel */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2">
          <CardTitle className="flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-accent" />
            Threat Input &amp; Grad-CAM Heatmap Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Source Tabs */}
          <div className="flex bg-surface-2 border border-line p-1 rounded-tile w-fit gap-1">
            <button
              type="button"
              onClick={() => setInputMode("bank")}
              className={`px-4 py-2 rounded-chip text-[13px] font-medium transition-colors cursor-pointer ${
                inputMode === "bank"
                  ? "bg-surface text-accent font-semibold border border-line"
                  : "text-muted hover:text-ink border border-transparent"
              }`}
            >
              Malimg Sample Bank
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`px-4 py-2 rounded-chip text-[13px] font-medium transition-colors cursor-pointer ${
                inputMode === "upload"
                  ? "bg-surface text-accent font-semibold border border-line"
                  : "text-muted hover:text-ink border border-transparent"
              }`}
            >
              Upload Custom Executable Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {inputMode === "bank" ? (
              <div>
                <label className="text-[13px] font-medium text-ink block mb-1.5">
                  Select Target Malware Sample:
                </label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="w-full bg-surface-2 border border-line rounded-chip px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono transition-colors"
                >
                  {families.map((fam) => (
                    <option key={fam} value={fam}>
                      {fam}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[13px] font-medium text-ink block mb-1.5">
                  Upload Binary Grayscale File (.png, .jpg):
                </label>
                <div className="border-2 border-dashed border-line hover:border-accent rounded-tile p-3 text-center bg-surface-2 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="block w-full text-[13px] text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-chip file:border-0 file:text-[12px] file:font-medium file:bg-accent-soft file:text-accent hover:file:bg-accent-soft/80 cursor-pointer"
                  />
                  {uploadedFile && (
                    <div className="text-[12px] text-ok mt-1.5 font-medium tabular-nums">
                      Selected: <span className="font-mono">{uploadedFile.name}</span> ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Grad-CAM Color Gradient Map:
              </label>
              <select
                value={colormap}
                onChange={(e) => setColormap(e.target.value)}
                className="w-full bg-surface-2 border border-line rounded-chip px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium transition-colors"
              >
                <option value="jet">Jet (Classic Cyber Rainbow)</option>
                <option value="plasma">Plasma (High-Contrast Purple-Yellow)</option>
                <option value="inferno">Inferno (Thermal Infrared)</option>
                <option value="viridis">Viridis (Perceptually Uniform)</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleRunInference}
            disabled={isInferring}
            className="w-full"
            variant="cyber"
            size="lg"
          >
            <Zap className={`w-4 h-4 mr-2 ${isInferring ? "animate-spin" : ""}`} />
            {isInferring ? "Computing Gradient Activation Attribution..." : "Run X-MalViT Diagnostic Inference"}
          </Button>
        </CardContent>
      </Card>

      {/* Inference Diagnostic Results */}
      <AnimatePresence>
        {predictionResult && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top-1 Identified Card & Likelihood Table */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-4 border-b border-line bg-surface-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="destructive" className="text-[12px] font-medium">
                      Threat detected
                    </Badge>
                    <span className="text-[12px] text-ok bg-ok-soft px-2 py-0.5 rounded-chip border border-ok/20 font-medium flex items-center gap-1 tabular-nums">
                      <Zap className="w-3.5 h-3.5 text-ok" />
                      {predictionResult.latency_ms.toFixed(1)} ms ({predictionResult.device_name || (predictionResult.device?.includes("cuda") ? "CUDA GPU" : "CPU Host")})
                    </span>
                  </div>
                  <CardTitle className="text-[28px] leading-[1.2] font-semibold text-ink mt-2 font-mono">
                    {predictionResult.top_family}
                  </CardTitle>
                  <div className="text-[13px] text-muted font-medium">
                    Category: <span className="text-accent font-semibold">{predictionResult.category}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-[13px] text-ink mb-1.5 font-medium tabular-nums">
                      <span>Confidence Score:</span>
                      <span className="text-accent font-semibold">
                        {(predictionResult.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={predictionResult.confidence * 100} />
                  </div>

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
                          {predictionResult.top_5.map((item: any, idx: number) => (
                            <tr key={idx} className={idx === 0 ? "bg-accent-soft/60 text-ink font-semibold" : "hover:bg-surface-2"}>
                              <td className="py-2 px-3 font-mono">{item.family}</td>
                              <td className="py-2 px-3 tabular-nums">{(item.confidence * 100).toFixed(2)}%</td>
                              <td className="py-2 px-3 text-muted">{item.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Attribution 3-Panel Card */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-4 border-b border-line bg-surface-2">
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-critical" />
                    Grad-CAM Visual Attribution (XAI)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-[12px] font-medium text-muted mb-1.5">1. Raw Binary</div>
                      <div className="aspect-square rounded-tile overflow-hidden border border-line bg-surface-2 p-1">
                        <img
                          src={predictionResult.raw_image_url}
                          alt="Raw Binary"
                          className="w-full h-full object-cover rounded-chip"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[12px] font-medium text-muted mb-1.5">2. Activation Map</div>
                      <div className="aspect-square rounded-tile overflow-hidden border border-line bg-surface-2 p-1">
                        <img
                          src={predictionResult.heatmap_url}
                          alt="Activation Map"
                          className="w-full h-full object-cover rounded-chip"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[12px] font-medium text-muted mb-1.5">3. Forensic Overlay</div>
                      <div className="aspect-square rounded-tile overflow-hidden border-2 border-accent bg-surface-2 p-1">
                        <img
                          src={predictionResult.overlay_url}
                          alt="Forensic Overlay"
                          className="w-full h-full object-cover rounded-chip"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[12px] text-muted mt-3 text-center font-medium">
                    Red pixels highlight the exact PE hotspot activating the classification decision.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reverse-Engineered PE Section Disassembly */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-4 border-b border-line bg-surface-2">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent" />
                  Reverse-Engineered PE Section Disassembly
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-tile bg-surface-2 border border-line">
                    <div className="text-[12px] text-muted font-medium">PE section pinpointed</div>
                    <div className="text-[14px] font-medium text-ink mt-1 font-mono">
                      {predictionResult.pe_analysis?.section}
                    </div>
                  </div>

                  <div className="p-4 rounded-tile bg-surface-2 border border-line">
                    <div className="text-[12px] text-muted font-medium">Virtual address offset</div>
                    <div className="text-[14px] font-medium text-accent mt-1 font-mono tabular-nums">
                      {predictionResult.pe_analysis?.virtual_address}
                    </div>
                  </div>

                  <div className="p-4 rounded-tile bg-surface-2 border border-line">
                    <div className="text-[12px] text-muted font-medium">Attention peak weight</div>
                    <div className="text-[16px] leading-[1.2] font-semibold text-ok mt-1 tabular-nums">
                      {predictionResult.pe_analysis?.attention_weight.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-tile bg-accent-soft/60 border-l-4 border-accent text-[13px] text-ink leading-[1.5]">
                  <strong className="text-ink font-semibold">Forensic Attribution:</strong> {predictionResult.pe_analysis?.forensic_meaning}. The model isolated this bytecode cluster without requiring dynamic sandbox execution.
                </div>

                {/* Hex Dump Inspector - Dark token scope */}
                <div>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink mb-2">
                    <Terminal className="w-4 h-4 text-high" />
                    Disassembly Hex-Dump Inspector (Around Hotspot Offset)
                  </div>
                  <div className="dark hex-terminal p-4 text-[12px] leading-[1.5] font-mono overflow-x-auto text-ink tabular-nums">
                    <pre>{predictionResult.hex_dump}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
