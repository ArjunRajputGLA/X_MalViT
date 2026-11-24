"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Cpu, 
  Play, 
  Settings2, 
  CheckCircle2, 
  TrendingUp, 
  HardDrive, 
  Zap, 
  Layers, 
  Activity 
} from "lucide-react";

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Hyperparameter Control Panel */}
        <Card className="border-sky-500/20 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-sky-400 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-sky-400" />
              Architecture & Hyperparameter Tuning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Neural Architecture
              </label>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                disabled={isTraining}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
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
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Training Epochs:</span>
                <span className="font-mono text-sky-400">{epochs}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={epochs}
                disabled={isTraining}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10</span>
              </div>
            </div>

            {/* Batch Size Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Batch Size (Tensor Cores)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[16, 32, 64].map((bs) => (
                  <button
                    key={bs}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setBatchSize(bs)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      batchSize === bs
                        ? "bg-sky-500/20 border-sky-400 text-sky-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {bs}
                  </button>
                ))}
              </div>
            </div>

            {/* Samples per family */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Samples per Malware Family
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 50].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setSamplesPerFam(s)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      samplesPerFam === s
                        ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning rate */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                AdamW Learning Rate
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.0001, 0.0003, 0.0005, 0.001].map((lr) => (
                  <button
                    key={lr}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setLearningRate(lr)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                      learningRate === lr
                        ? "bg-purple-500/20 border-purple-400 text-purple-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
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
              className="w-full mt-2"
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
          <Card className="border-sky-500/20 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-sky-400 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-400" />
                Local Hardware Profile & Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-sans">Active Accelerator:</span>
                <span className="text-sky-400 font-semibold">{systemStatus?.device_name || "NVIDIA RTX 4050"} ({systemStatus?.total_vram || "6.00 GB"} VRAM)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-sans">Precision Standard:</span>
                <span className="text-indigo-400 font-semibold">FP16 Mixed Precision (AMP)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-sans">Checkpoint Target:</span>
                <span className="text-emerald-400 font-semibold">{systemStatus?.checkpoint_path || "checkpoints/x_malvit_weights.pt"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-sans">Loss Regularization:</span>
                <span className="text-purple-400 font-semibold">Label Smoothing (ε = 0.1)</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress & Live Telemetry Curve */}
          <Card className="border-sky-500/20 bg-slate-900/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Live Training Convergence
              </CardTitle>
              {isTraining && (
                <Badge variant="cyber" className="animate-pulse">
                  GPU Active
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span>Epoch Progress: {currentEpoch}/{epochs}</span>
                  <span className="text-sky-400 font-bold">{progressVal.toFixed(0)}%</span>
                </div>
                <Progress value={progressVal} />
              </div>

              {epochHistory.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Current Loss:</div>
                    <div className="text-base font-bold text-rose-400">
                      {epochHistory[epochHistory.length - 1].train_loss.toFixed(4)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">Val Accuracy:</div>
                    <div className="text-base font-bold text-emerald-400">
                      {epochHistory[epochHistory.length - 1].val_acc.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}

              {completionMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{completionMessage}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
