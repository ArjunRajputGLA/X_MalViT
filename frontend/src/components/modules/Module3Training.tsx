"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Play, 
  Settings2, 
  CheckCircle2, 
  Activity,
  Zap,
  Terminal,
  AlertTriangle,
  Trash2,
  FolderCheck
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
  device?: string;
}

interface TrainingLog {
  id: string;
  timestamp: string;
  message: string;
  type?: "system" | "dataset" | "model" | "epoch" | "checkpoint" | "error" | "info";
}

export const Module3Training: React.FC = () => {
  const [architecture, setArchitecture] = useState<string>("X-MalViT Tiny (Proposed - 5.8M Params)");
  const [deviceMode, setDeviceMode] = useState<"cuda" | "cpu">("cuda");
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
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
        if (!data.cuda_available) {
          setDeviceMode("cpu");
        }
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
    const initialLogs: TrainingLog[] = [
      {
        id: `log-${Date.now()}-init`,
        timestamp: new Date().toLocaleTimeString(),
        message: `[SYSTEM] Initializing connection to X-MalViT PyTorch training daemon (${deviceMode.toUpperCase()})...`,
        type: "system"
      }
    ];

    if (deviceMode === "cuda" && !systemStatus?.cuda_available) {
      initialLogs.push({
        id: `log-${Date.now()}-warn`,
        timestamp: new Date().toLocaleTimeString(),
        message: "[HARDWARE WARNING] NVIDIA GPU (CUDA) requested, but no local CUDA device is detected (torch.cuda.is_available() = False).",
        type: "error"
      });
      initialLogs.push({
        id: `log-${Date.now()}-fb`,
        timestamp: new Date().toLocaleTimeString(),
        message: "[FALLBACK] Automatic hardware fallback: PyTorch training pipeline routed to CPU Host Cores.",
        type: "model"
      });
    }

    setLogs(initialLogs);

    const payload = JSON.stringify({
      epochs: epochs,
      batch_size: batchSize,
      lr: learningRate,
      samples_per_family: samplesPerFam,
      architecture: architecture,
      device: deviceMode,
    });

    try {
      let res: Response;
      // Connect directly to backend port 8000 to eliminate any Next.js proxy buffering, falling back to /api/train
      try {
        res = await fetch("http://127.0.0.1:8000/api/train", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      } catch (directErr) {
        console.warn("Direct port 8000 connection failed, falling back to /api/train...", directErr);
        res = await fetch("/api/train", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      }

      if (!res.ok || !res.body) {
        throw new Error(`Training request failed with HTTP ${res.status}`);
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
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue; // ignore comments / buffer flushes

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.replace("data: ", "").trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);
              if (event.type === "log") {
                const msg = event.message || "";
                let logType: TrainingLog["type"] = "info";
                if (msg.includes("[SYSTEM]") || msg.includes("[INIT]") || msg.includes("[HARDWARE]") || msg.includes("[DEVICE]")) {
                  logType = "system";
                } else if (msg.includes("[DATASET]") || msg.includes("[PRELOAD]")) {
                  logType = "dataset";
                } else if (msg.includes("[MODEL]") || msg.includes("[OPTIMIZER]") || msg.includes("[HYPERPARAMS]") || msg.includes("[ENGINE]")) {
                  logType = "model";
                } else if (msg.includes("[BATCH") || msg.includes("[EPOCH") || msg.includes("[EVAL]")) {
                  logType = "epoch";
                } else if (msg.includes("[CHECKPOINT]") || msg.includes("[COMPLETE]")) {
                  logType = "checkpoint";
                } else if (msg.includes("[ERROR]")) {
                  logType = "error";
                }

                setLogs((prev) => [
                  ...prev,
                  {
                    id: `log-${Date.now()}-${Math.random()}`,
                    timestamp: event.timestamp || new Date().toLocaleTimeString(),
                    message: msg,
                    type: logType
                  }
                ]);
              } else if (event.type === "epoch_update") {
                setCurrentEpoch(event.epoch);
                setProgressVal((event.epoch / event.total_epochs) * 100);
                setEpochHistory((prev) => [...prev, event]);
              } else if (event.type === "complete") {
                const usedDev = event.device_used ? event.device_used.toUpperCase() : deviceMode.toUpperCase();
                const wasFallback = event.fallback_applied || (deviceMode === "cuda" && usedDev === "CPU");
                const msg = wasFallback
                  ? `Real PyTorch Training Converged on CPU (NVIDIA GPU was requested, but automatically fell back to CPU due to missing CUDA hardware)! Checkpoint saved to ${event.checkpoint_path} (Peak Accuracy: ${event.best_accuracy.toFixed(2)}%)`
                  : `Real PyTorch Training Converged on ${usedDev}! Weights compiled & saved to ${event.checkpoint_path} (Peak Accuracy: ${event.best_accuracy.toFixed(2)}%)`;
                setCompletionMessage(msg);
                setLogs((prev) => [
                  ...prev,
                  {
                    id: `log-${Date.now()}-complete`,
                    timestamp: event.timestamp || new Date().toLocaleTimeString(),
                    message: `[CHECKPOINT] PyTorch training finished successfully on ${usedDev}. Checkpoint saved to ${event.checkpoint_path}`,
                    type: "checkpoint"
                  }
                ]);
                setIsTraining(false);
                fetchStatus();
              } else if (event.type === "error") {
                setCompletionMessage(`Training error: ${event.message}`);
                setLogs((prev) => [
                  ...prev,
                  {
                    id: `log-${Date.now()}-err`,
                    timestamp: event.timestamp || new Date().toLocaleTimeString(),
                    message: `[ERROR] ${event.message}`,
                    type: "error"
                  }
                ]);
                setIsTraining(false);
              }
            } catch (err) {
              console.error("Error parsing SSE:", err);
            }
          }
        }
      }
    } catch (e: any) {
      const errorMsg = `Connection error: ${e.message}`;
      setCompletionMessage(errorMsg);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-conn-err`,
          timestamp: new Date().toLocaleTimeString(),
          message: `[ERROR] ${errorMsg}`,
          type: "error"
        }
      ]);
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
            {/* Target Neural Architecture */}
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

            {/* Compute Accelerator Toggle (GPU vs CPU) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  Compute Accelerator (Hardware Device)
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {deviceMode === "cuda" 
                    ? (systemStatus?.cuda_available ? "Hardware Acceleration" : "GPU Selected (CPU Fallback)")
                    : "Host CPU Execution"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  disabled={isTraining}
                  onClick={() => setDeviceMode("cuda")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative ${
                    deviceMode === "cuda"
                      ? "bg-white text-blue-700 shadow-xs border border-blue-200/60"
                      : "text-slate-600 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${deviceMode === "cuda" ? "text-blue-600" : "text-slate-400"}`} />
                  <span>NVIDIA GPU (CUDA)</span>
                  {deviceMode === "cuda" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${systemStatus?.cuda_available ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  )}
                </button>

                <button
                  type="button"
                  disabled={isTraining}
                  onClick={() => setDeviceMode("cpu")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative ${
                    deviceMode === "cpu"
                      ? "bg-white text-indigo-700 shadow-xs border border-indigo-200/60"
                      : "text-slate-600 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <Cpu className={`w-3.5 h-3.5 ${deviceMode === "cpu" ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>CPU Host Cores</span>
                  {deviceMode === "cpu" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Hardware Availability Alert when CUDA selected without hardware */}
              {deviceMode === "cuda" && !systemStatus?.cuda_available && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 flex items-start gap-2.5 text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[11px] block text-amber-900">Notice: No NVIDIA CUDA GPU Detected on Host</span>
                    <p className="text-[10.5px] text-amber-800/90 leading-snug mt-0.5">
                      You have selected GPU mode on a CPU-only host. The PyTorch training engine will catch this, route execution to CPU Host Cores, and stream clear diagnostic warnings in the terminal console.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {deviceMode === "cuda" 
                    ? (systemStatus?.cuda_available ? "Tensor Cores active • FP16 Mixed Precision (AMP)" : "CUDA unavailable • Automatic FP32 CPU Host fallback")
                    : "Standard multi-threaded host cores • FP32 Precision"}
                </span>
                {deviceMode === "cuda" && systemStatus?.cuda_available && systemStatus?.total_vram && (
                  <span className="font-mono text-blue-700 font-semibold">{systemStatus.total_vram} VRAM</span>
                )}
              </div>
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
                Batch Size ({deviceMode === "cuda" ? "Tensor Cores" : "CPU Threads"})
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
              variant={deviceMode === "cuda" && !systemStatus?.cuda_available ? "outline" : "cyber"}
              size="lg"
            >
              <Play className={`w-4 h-4 mr-2 ${isTraining ? "animate-spin" : ""}`} />
              {isTraining 
                ? (currentEpoch > 0 ? `Training Epoch ${currentEpoch}/${epochs} on ${deviceMode.toUpperCase()}...` : `Preloading Dataset & Initializing ViT...`)
                : deviceMode === "cuda" && !systemStatus?.cuda_available
                ? "Launch PyTorch Training (GPU Selected • CPU Fallback)"
                : `Launch Real PyTorch Training on ${deviceMode === "cuda" ? "GPU (CUDA)" : "CPU"}`}
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
                <span className="text-slate-500 font-sans font-medium">Selected Device:</span>
                <span className={`font-bold ${deviceMode === "cuda" && !systemStatus?.cuda_available ? "text-amber-700" : "text-blue-700"}`}>
                  {deviceMode === "cuda"
                    ? systemStatus?.cuda_available
                      ? `${systemStatus?.device_name || "NVIDIA GPU"} (${systemStatus?.total_vram || "6.00 GB"} VRAM)`
                      : "CUDA Requested (Host: CPU Fallback)"
                    : "CPU Host (x86_64 Multi-Core)"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="text-slate-500 font-sans font-medium">Precision Standard:</span>
                <span className="text-indigo-700 font-bold">
                  {deviceMode === "cuda" && systemStatus?.cuda_available
                    ? "FP16 Mixed Precision (AMP)"
                    : "FP32 Single Precision"}
                </span>
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
                  {deviceMode === "cuda" ? "GPU Active" : "CPU Active"}
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
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 font-medium ${
                    completionMessage.toLowerCase().includes("error") || completionMessage.toLowerCase().includes("failed")
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
                >
                  {completionMessage.toLowerCase().includes("error") || completionMessage.toLowerCase().includes("failed") ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  <span>{completionMessage}</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live PyTorch Console Stream */}
      <Card className="border-slate-800 bg-slate-950 text-slate-100 shadow-md overflow-hidden">
        <CardHeader className="py-3 px-4 bg-slate-900/90 border-b border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <CardTitle className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              PyTorch Execution Stream &amp; Training Telemetry
            </CardTitle>
            {isTraining ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAM
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                IDLE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
              <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dataset:</span>
              <span className="text-emerald-400 font-semibold">X_MalVit\data\sample</span>
              <span className="text-slate-500">(9,339 binaries &bull; 25 classes)</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              title="Clear terminal log"
              className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 bg-slate-950">
          <div 
            ref={terminalEndRef}
            className="h-64 overflow-y-auto space-y-1.5 font-mono text-xs leading-relaxed pr-2 select-text"
          >
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
                <Terminal className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-sans text-slate-400 font-medium">Console Idle &bull; Ready for Execution</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                  Click <span className="text-slate-300 font-semibold">Launch Real PyTorch Training</span> above to stream live dataset ingestion from <code className="text-emerald-400">X_MalVit\data\sample</code>, tensor preloading, and Vision Transformer forward/backward passes.
                </p>
              </div>
            ) : (
              logs.map((log) => {
                const isDivider = log.message.startsWith("=");
                if (isDivider) {
                  return (
                    <div key={log.id} className="text-slate-700 select-none py-0.5 overflow-hidden">
                      {log.message}
                    </div>
                  );
                }

                let badgeClass = "text-sky-400 bg-sky-950/60 border-sky-800/60";
                let badgeLabel = "";
                let bodyText = log.message;

                const matchTag = log.message.match(/^(\[[A-Z0-9_\-/\s!.]+\])(.*)/);
                if (matchTag) {
                  badgeLabel = matchTag[1];
                  bodyText = matchTag[2];

                  if (badgeLabel.includes("WARNING")) {
                    badgeClass = "text-amber-400 bg-amber-950/80 border-amber-600/80";
                  } else if (badgeLabel.includes("FALLBACK")) {
                    badgeClass = "text-yellow-300 bg-yellow-950/80 border-yellow-600/80";
                  } else if (badgeLabel.includes("DATASET")) {
                    badgeClass = "text-emerald-400 bg-emerald-950/60 border-emerald-800/60";
                  } else if (badgeLabel.includes("PRELOAD")) {
                    badgeClass = "text-teal-300 bg-teal-950/60 border-teal-800/60";
                  } else if (badgeLabel.includes("BATCH")) {
                    badgeClass = "text-indigo-300 bg-indigo-950/60 border-indigo-800/60";
                  } else if (badgeLabel.includes("EVAL")) {
                    badgeClass = "text-purple-300 bg-purple-950/60 border-purple-800/60";
                  } else if (badgeLabel.includes("MODEL") || badgeLabel.includes("OPTIMIZER")) {
                    badgeClass = "text-purple-400 bg-purple-950/60 border-purple-800/60";
                  } else if (badgeLabel.includes("EPOCH")) {
                    badgeClass = "text-amber-300 bg-amber-950/60 border-amber-800/60";
                  } else if (badgeLabel.includes("CHECKPOINT") || badgeLabel.includes("COMPLETE")) {
                    badgeClass = "text-emerald-300 bg-emerald-950/60 border-emerald-800/60";
                  } else if (badgeLabel.includes("ERROR")) {
                    badgeClass = "text-rose-400 bg-rose-950/60 border-rose-800/60";
                  } else if (badgeLabel.includes("ENGINE") || badgeLabel.includes("HYPERPARAMS")) {
                    badgeClass = "text-cyan-400 bg-cyan-950/60 border-cyan-800/60";
                  } else if (badgeLabel.includes("HARDWARE") || badgeLabel.includes("DEVICE")) {
                    badgeClass = "text-sky-300 bg-sky-950/60 border-sky-800/60";
                  } else {
                    badgeClass = "text-sky-400 bg-sky-950/60 border-sky-800/60";
                  }
                }

                return (
                  <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 px-1.5 py-0.5 rounded transition-colors">
                    <span className="text-[10px] text-slate-500 select-none flex-shrink-0 pt-0.5">
                      {log.timestamp}
                    </span>
                    {badgeLabel ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    ) : null}
                    <span className={`flex-1 break-all ${
                      log.type === "error" || badgeLabel.includes("ERROR")
                        ? "text-rose-400 font-semibold" 
                        : badgeLabel.includes("WARNING")
                        ? "text-amber-300 font-semibold"
                        : badgeLabel.includes("FALLBACK")
                        ? "text-yellow-200 font-medium"
                        : badgeLabel.includes("CHECKPOINT") || badgeLabel.includes("COMPLETE")
                        ? "text-emerald-300 font-semibold"
                        : badgeLabel.includes("EPOCH") && badgeLabel.includes("DONE")
                        ? "text-amber-200 font-medium"
                        : badgeLabel.includes("BATCH")
                        ? "text-indigo-200"
                        : badgeLabel.includes("EVAL")
                        ? "text-purple-200"
                        : badgeLabel.includes("PRELOAD")
                        ? "text-teal-200"
                        : "text-slate-300"
                    }`}>
                      {bodyText}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
