"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Play, 
  Settings2, 
  CheckCircle2, 
  Activity 
} from "lucide-react";
import { motion } from "framer-motion";

interface EpochData {
  epoch: number;
  total_epochs: number;
  train_loss: number;
  train_acc: number;
  val_loss: number;
  val_acc: number;
  vram_mb: number;
}

export const Module3Training: React.FC = () => {
  const [architecture, setArchitecture] = useState<string>("X-MalViT Tiny (Proposed - 5.8M Params)");
  const [epochs, setEpochs] = useState<number>(4);
  const [batchSize, setBatchSize] = useState<number>(32);
  const [samplesPerFam, setSamplesPerFam] = useState<number>(20);
  const [learningRate, setLearningRate] = useState<number>(0.0003);

  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [epochHistory, setEpochHistory] = useState<EpochData[]>([]);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.error("Error fetching status:", e);
    }
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    setCompletionMessage(null);
    setEpochHistory([]);
    setProgressVal(0);
    setCurrentEpoch(0);

    try {
      const res = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          epochs: epochs,
          batch_size: batchSize,
          lr: learningRate,
          samples_per_family: samplesPerFam,
          architecture: architecture,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Training request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);
              if (event.type === "epoch_update") {
                setCurrentEpoch(event.epoch);
                setProgressVal((event.epoch / event.total_epochs) * 100);
                setEpochHistory((prev) => [...prev, event]);
              } else if (event.type === "complete") {
                setCompletionMessage(
                  `Real PyTorch Training Converged! Weights compiled & saved to ${event.checkpoint_path} (Peak Accuracy: ${event.best_accuracy.toFixed(2)}%)`
                );
                setIsTraining(false);
                fetchStatus();
              } else if (event.type === "error") {
                setCompletionMessage(`Training error: ${event.message}`);
                setIsTraining(false);
              }
            } catch (err) {
              console.error("Error parsing SSE:", err);
            }
          }
        }
      }
    } catch (e: any) {
      setCompletionMessage(`Connection error: ${e.message}`);
      setIsTraining(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Hyperparameter Control Panel */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
              <Settings2 className="w-5 h-5 text-blue-600" />
              Architecture & Hyperparameter Tuning
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Target Neural Architecture
              </label>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                disabled={isTraining}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
              >
                <option value="X-MalViT Tiny (Proposed - 5.8M Params)">
                  X-MalViT Tiny (Proposed - 5.8M Params)
                </option>
                <option value="ResNet-18 (CNN Baseline - 11.2M Params)">
                  ResNet-18 (CNN Baseline - 11.2M Params)
                </option>
                <option value="MobileNetV2 (Edge Baseline - 3.4M Params)">
                  MobileNetV2 (Edge Baseline - 3.4M Params)
                </option>
              </select>
            </div>

            {/* Epoch Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Training Epochs:</span>
                <span className="font-mono text-blue-700 font-bold">{epochs}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={epochs}
                disabled={isTraining}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 font-semibold">
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10</span>
              </div>
            </div>

            {/* Batch Size Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Batch Size (Tensor Cores)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[16, 32, 64].map((bs) => (
                  <button
                    key={bs}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setBatchSize(bs)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                      batchSize === bs
                        ? "bg-blue-50 border-blue-400 text-blue-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {bs}
                  </button>
                ))}
              </div>
            </div>

            {/* Samples per family */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Samples per Malware Family
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 50].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setSamplesPerFam(s)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      samplesPerFam === s
                        ? "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning rate */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                AdamW Learning Rate
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.0001, 0.0003, 0.0005, 0.001].map((lr) => (
                  <button
                    key={lr}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setLearningRate(lr)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-mono font-bold border transition-all ${
                      learningRate === lr
                        ? "bg-purple-50 border-purple-400 text-purple-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {lr}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStartTraining}
              disabled={isTraining}
              className="w-full mt-2 shadow-sm"
              variant="cyber"
              size="lg"
            >
              <Play className={`w-4 h-4 mr-2 ${isTraining ? "animate-spin" : ""}`} />
              {isTraining ? `Training Epoch ${currentEpoch}/${epochs}...` : "Launch Real PyTorch Training on GPU"}
            </Button>
          </CardContent>
        </Card>

        {/* Right Hardware Telemetry & Real-Time Curves */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
                <Cpu className="w-5 h-5 text-blue-600" />
                Local Hardware Profile & Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="text-slate-500 font-sans font-medium">Active Accelerator:</span>
                <span className="text-blue-700 font-bold">{systemStatus?.device_name || "NVIDIA RTX 4050"} ({systemStatus?.total_vram || "6.00 GB"} VRAM)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="text-slate-500 font-sans font-medium">Precision Standard:</span>
                <span className="text-indigo-700 font-bold">FP16 Mixed Precision (AMP)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="text-slate-500 font-sans font-medium">Checkpoint Target:</span>
                <span className="text-emerald-700 font-bold">{systemStatus?.checkpoint_path || "checkpoints/x_malvit_weights.pt"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="text-slate-500 font-sans font-medium">Loss Regularization:</span>
                <span className="text-purple-700 font-bold">Label Smoothing (ε = 0.1)</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress & Live Telemetry Curve */}
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live Training Convergence
              </CardTitle>
              {isTraining && (
                <Badge variant="cyber" className="animate-pulse">
                  GPU Active
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-700 mb-1.5 font-medium">
                  <span>Epoch Progress: {currentEpoch}/{epochs}</span>
                  <span className="text-blue-700 font-bold">{progressVal.toFixed(0)}%</span>
                </div>
                <Progress value={progressVal} />
              </div>

              {epochHistory.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80">
                    <div className="text-rose-600 font-sans font-medium">Current Loss:</div>
                    <div className="text-lg font-bold text-rose-700 mt-0.5">
                      {epochHistory[epochHistory.length - 1].train_loss.toFixed(4)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                    <div className="text-emerald-600 font-sans font-medium">Val Accuracy:</div>
                    <div className="text-lg font-bold text-emerald-700 mt-0.5">
                      {epochHistory[epochHistory.length - 1].val_acc.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}

              {completionMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{completionMessage}</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
