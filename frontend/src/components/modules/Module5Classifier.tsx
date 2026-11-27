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
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
            <SearchCode className="w-5 h-5 text-blue-600" />
            Threat Input & Grad-CAM Heatmap Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Source Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1">
            <button
              type="button"
              onClick={() => setInputMode("bank")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                inputMode === "bank"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Malimg Sample Bank
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                inputMode === "upload"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Upload Custom Executable Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {inputMode === "bank" ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select Target Malware Sample:
                </label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono transition-all"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Upload Binary Grayscale File (.png, .jpg):
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50/50 cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadedFile && (
                    <div className="text-[11px] text-emerald-600 mt-1 font-mono font-medium">
                      Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Grad-CAM Color Gradient Map:
              </label>
              <select
                value={colormap}
                onChange={(e) => setColormap(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium transition-all"
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
            className="w-full shadow-sm"
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
              <Card className="border-slate-200/80 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="destructive" className="font-mono uppercase text-xs whitespace-nowrap shrink-0">
                      THREAT DETECTED
                    </Badge>
                    <span
                      title={predictionResult.device_name || predictionResult.device}
                      className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/60 font-semibold flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {predictionResult.latency_ms.toFixed(2)} ms (
                      {predictionResult.device_name?.includes("RTX")
                        ? predictionResult.device_name.replace("NVIDIA GeForce ", "").replace(" Laptop GPU", "")
                        : predictionResult.device?.toLowerCase().includes("cuda")
                        ? "CUDA GPU"
                        : "CPU"}
                      )
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 mt-2 font-mono tracking-tight">
                    {predictionResult.top_family}
                  </CardTitle>
                  <div className="text-xs text-slate-600 font-medium">
                    Category: <span className="text-blue-700 font-bold">{predictionResult.category}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-700 mb-1.5 font-medium">
                      <span>Confidence Score:</span>
                      <span className="text-blue-700 font-bold">
                        {(predictionResult.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={predictionResult.confidence * 100} />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Top-5 Family Likelihood Ranking
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Family Variant</th>
                            <th className="py-2 px-3">Likelihood</th>
                            <th className="py-2 px-3">Category</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-700 font-medium">
                          {predictionResult.top_5.map((item: any, idx: number) => (
                            <tr key={idx} className={idx === 0 ? "bg-blue-50/70 text-blue-900 font-bold" : ""}>
                              <td className="py-1.5 px-3">{item.family}</td>
                              <td className="py-1.5 px-3">{(item.confidence * 100).toFixed(2)}%</td>
                              <td className="py-1.5 px-3 text-slate-500 font-sans">{item.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Attribution 3-Panel Card */}
              <Card className="border-slate-200/80 bg-white shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
                      <Flame className="w-5 h-5 text-rose-500" />
                      Grad-CAM Visual Attribution (XAI)
                    </CardTitle>
                    {predictionResult.gradcam_ms != null && (
                      <span className="text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 font-semibold whitespace-nowrap shrink-0">
                        XAI Backprop: {predictionResult.gradcam_ms.toFixed(1)} ms
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-[11px] font-bold text-slate-500 mb-1.5">1. Raw Binary</div>
                      <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 shadow-inner">
                        <img
                          src={predictionResult.raw_image_url}
                          alt="Raw Binary"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[11px] font-bold text-slate-500 mb-1.5">2. Activation Map</div>
                      <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 shadow-inner">
                        <img
                          src={predictionResult.heatmap_url}
                          alt="Activation Map"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[11px] font-bold text-slate-500 mb-1.5">3. Forensic Overlay</div>
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-blue-500 bg-slate-50 p-1 shadow-md shadow-blue-500/10">
                        <img
                          src={predictionResult.overlay_url}
                          alt="Forensic Overlay"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-3 text-center font-medium">
                    Red pixels highlight the exact PE hotspot activating the classification decision.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reverse-Engineered PE Section Disassembly */}
            <Card className="border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Reverse-Engineered PE Section Disassembly
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold font-sans">PE Section Pinpointed</div>
                    <div className="text-base font-bold text-blue-700 mt-1 font-mono">
                      {predictionResult.pe_analysis?.section}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold font-sans">Virtual Address Offset</div>
                    <div className="text-base font-bold text-indigo-700 mt-1 font-mono">
                      {predictionResult.pe_analysis?.virtual_address}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold font-sans">Attention Peak Weight</div>
                    <div className="text-base font-bold text-emerald-700 mt-1 font-mono">
                      {predictionResult.pe_analysis?.attention_weight.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border-l-4 border-blue-600 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-blue-950 font-bold">Forensic Attribution:</strong> {predictionResult.pe_analysis?.forensic_meaning}. The model isolated this bytecode cluster without requiring dynamic sandbox execution.
                </div>

                {/* Hex Dump Inspector - Kept high contrast dark terminal for true binary disassembly viewing */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2 font-mono">
                    <Terminal className="w-4 h-4 text-amber-500" />
                    Disassembly Hex-Dump Inspector (Around Hotspot Offset)
                  </div>
                  <div className="hex-terminal rounded-xl p-4 text-[11px] font-mono overflow-x-auto text-sky-300">
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
