"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  SearchCode, 
  UploadCloud, 
  Flame, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Cpu 
} from "lucide-react";

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
    <div className="space-y-6">
      {/* Control Configuration Panel */}
      <Card className="border-sky-500/20 bg-slate-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-sky-400 flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-sky-400" />
            Threat Input & Grad-CAM Heatmap Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Source Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setInputMode("bank")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                inputMode === "bank"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Malimg Sample Bank
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                inputMode === "upload"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Upload Custom Executable Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {inputMode === "bank" ? (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Target Malware Sample:
                </label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
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
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Upload Binary Grayscale File (.png, .jpg):
                </label>
                <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/40 rounded-lg p-3 text-center bg-slate-950/60 cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-sky-500/20 file:text-sky-300"
                  />
                  {uploadedFile && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                      Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Grad-CAM Color Gradient Map:
              </label>
              <select
                value={colormap}
                onChange={(e) => setColormap(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
      {predictionResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top-1 Identified Card & Likelihood Table */}
            <Card className="border-sky-500/30 bg-slate-900/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="destructive" className="font-mono uppercase text-xs">
                    THREAT DETECTED
                  </Badge>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    {predictionResult.latency_ms.toFixed(1)} ms (RTX 4050)
                  </span>
                </div>
                <CardTitle className="text-2xl font-black text-sky-400 mt-2 font-mono">
                  {predictionResult.top_family}
                </CardTitle>
                <div className="text-xs text-slate-300 font-semibold">
                  Category: <span className="text-indigo-400">{predictionResult.category}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Confidence Score:</span>
                    <span className="text-sky-400 font-bold">
                      {(predictionResult.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={predictionResult.confidence * 100} />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2">
                    Top-5 Family Likelihood Ranking
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Family Variant</th>
                          <th className="py-2 px-3">Likelihood</th>
                          <th className="py-2 px-3">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                        {predictionResult.top_5.map((item: any, idx: number) => (
                          <tr key={idx} className={idx === 0 ? "bg-sky-500/10 text-sky-300 font-bold" : ""}>
                            <td className="py-1.5 px-3">{item.family}</td>
                            <td className="py-1.5 px-3">{(item.confidence * 100).toFixed(2)}%</td>
                            <td className="py-1.5 px-3 text-slate-400 font-sans">{item.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Attribution 3-Panel Card */}
            <Card className="border-sky-500/30 bg-slate-900/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-sky-400 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  Grad-CAM Visual Attribution (XAI)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-400 mb-1">1. Raw Binary</div>
                    <div className="aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={predictionResult.raw_image_url}
                        alt="Raw Binary"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-400 mb-1">2. Activation Map</div>
                    <div className="aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={predictionResult.heatmap_url}
                        alt="Activation Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-400 mb-1">3. Forensic Overlay</div>
                    <div className="aspect-square rounded-lg overflow-hidden border border-sky-400/50 bg-slate-950 shadow-md">
                      <img
                        src={predictionResult.overlay_url}
                        alt="Forensic Overlay"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-3 text-center">
                  Red pixels highlight the exact PE hotspot activating the classification decision.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reverse-Engineered PE Section Disassembly */}
          <Card className="border-sky-500/20 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-sky-400 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                Reverse-Engineered PE Section Disassembly
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">PE Section Pinpointed</div>
                  <div className="text-sm font-bold text-sky-400 mt-1">
                    {predictionResult.pe_analysis?.section}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Virtual Address Offset</div>
                  <div className="text-sm font-bold text-indigo-400 mt-1">
                    {predictionResult.pe_analysis?.virtual_address}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Attention Peak Weight</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {predictionResult.pe_analysis?.attention_weight.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-sky-950/30 border-l-4 border-sky-400 text-xs text-sky-200">
                <strong className="text-white">Forensic Attribution:</strong> {predictionResult.pe_analysis?.forensic_meaning}. The model isolated this bytecode cluster without requiring dynamic sandbox execution.
              </div>

              {/* Hex Dump Inspector */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 font-mono">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Disassembly Hex-Dump Inspector (Around Hotspot Offset)
                </div>
                <div className="hex-terminal rounded-lg p-3 text-[11px] font-mono overflow-x-auto text-sky-300">
                  <pre>{predictionResult.hex_dump}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
