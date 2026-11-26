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
  FolderCheck,
  Square
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
  const [isStopping, setIsStopping] = useState<boolean>(false);
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

  const handleStopTraining = async () => {
    setIsStopping(true);
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-stop-req`,
        timestamp: new Date().toLocaleTimeString(),
        message: "[HALT] Stop signal issued by user. Halting active PyTorch training loop...",
        type: "error"
      }
    ]);

    try {
      await fetch("http://127.0.0.1:8000/api/train/stop", { method: "POST" }).catch(() =>
        fetch("/api/train/stop", { method: "POST" })
      );
    } catch (err) {
      console.error("Error stopping training:", err);
    }
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
    setIsStopping(false);
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
              } else if (event.type === "stopped") {
                const usedDev = event.device_used ? event.device_used.toUpperCase() : deviceMode.toUpperCase();
                setCompletionMessage(
                  `Training halted gracefully by user. Model checkpoint preserved at ${event.checkpoint_path}`
                );
                setLogs((prev) => [
                  ...prev,
                  {
                    id: `log-${Date.now()}-stopped`,
                    timestamp: event.timestamp || new Date().toLocaleTimeString(),
                    message: `[HALT] ${event.message || "Training pipeline halted by user request."}`,
                    type: "error"
                  }
                ]);
                setIsTraining(false);
                setIsStopping(false);
                fetchStatus();
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
                setIsStopping(false);
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
                setIsStopping(false);
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
      setIsStopping(false);
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
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-accent" />
              Architecture &amp; Hyperparameter Tuning
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Target Neural Architecture */}
            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Target Neural Architecture
              </label>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                disabled={isTraining}
                className="w-full bg-surface-2 border border-line rounded-chip px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors font-medium"
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
                <label className="text-[13px] font-medium text-ink flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-accent" />
                  Compute Accelerator (Hardware Device)
                </label>
                <span className="text-[12px] font-medium text-muted">
                  {deviceMode === "cuda" 
                    ? (systemStatus?.cuda_available ? "Hardware acceleration" : "GPU selected (CPU fallback)")
                    : "Host CPU execution"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-2 border border-line rounded-tile">
                <button
                  type="button"
                  disabled={isTraining}
                  onClick={() => setDeviceMode("cuda")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-chip text-[13px] font-medium transition-colors relative cursor-pointer ${
                    deviceMode === "cuda"
                      ? "bg-surface text-accent border border-line font-semibold"
                      : "text-muted hover:text-ink border border-transparent"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${deviceMode === "cuda" ? "text-accent" : "text-muted"}`} />
                  <span>NVIDIA GPU (CUDA)</span>
                  {deviceMode === "cuda" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${systemStatus?.cuda_available ? "bg-ok animate-pulse" : "bg-high"}`} />
                  )}
                </button>

                <button
                  type="button"
                  disabled={isTraining}
                  onClick={() => setDeviceMode("cpu")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-chip text-[13px] font-medium transition-colors relative cursor-pointer ${
                    deviceMode === "cpu"
                      ? "bg-surface text-accent border border-line font-semibold"
                      : "text-muted hover:text-ink border border-transparent"
                  }`}
                >
                  <Cpu className={`w-3.5 h-3.5 ${deviceMode === "cpu" ? "text-accent" : "text-muted"}`} />
                  <span>CPU Host Cores</span>
                  {deviceMode === "cpu" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </button>
              </div>

              {/* Hardware Availability Alert when CUDA selected without hardware */}
              {deviceMode === "cuda" && !systemStatus?.cuda_available && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 p-3 rounded-tile bg-high-soft border border-high/20 text-ink flex items-start gap-2.5 text-[13px]"
                >
                  <AlertTriangle className="w-4 h-4 text-high flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[13px] block text-high">Notice: No NVIDIA CUDA GPU Detected on Host</span>
                    <p className="text-[12px] text-muted leading-[1.5] mt-0.5">
                      You have selected GPU mode on a CPU-only host. The PyTorch training engine will catch this, route execution to CPU Host Cores, and stream clear diagnostic warnings in the terminal console.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="mt-1.5 px-1 flex items-center justify-between text-[12px] text-muted">
                <span>
                  {deviceMode === "cuda" 
                    ? (systemStatus?.cuda_available ? "Tensor Cores active • FP16 Mixed Precision (AMP)" : "CUDA unavailable • Automatic FP32 CPU Host fallback")
                    : "Standard multi-threaded host cores • FP32 Precision"}
                </span>
                {deviceMode === "cuda" && systemStatus?.cuda_available && systemStatus?.total_vram && (
                  <span className="text-accent font-semibold tabular-nums">{systemStatus.total_vram} VRAM</span>
                )}
              </div>
            </div>

            {/* Epoch Slider */}
            <div>
              <div className="flex justify-between text-[13px] font-medium text-ink mb-1.5">
                <span>Training Epochs:</span>
                <span className="text-accent font-semibold tabular-nums">{epochs}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={epochs}
                disabled={isTraining}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer h-2 bg-surface-2 rounded-chip appearance-none border border-line"
              />
              <div className="flex justify-between text-[12px] text-muted mt-1 font-medium tabular-nums">
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10</span>
              </div>
            </div>

            {/* Batch Size Selection */}
            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Batch Size ({deviceMode === "cuda" ? "Tensor Cores" : "CPU Threads"})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[16, 32, 64].map((bs) => (
                  <button
                    key={bs}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setBatchSize(bs)}
                    className={`py-2 px-3 rounded-chip text-[13px] font-semibold border transition-colors tabular-nums cursor-pointer ${
                      batchSize === bs
                        ? "bg-accent-soft border-accent text-accent"
                        : "bg-surface-2 border-line text-muted hover:text-ink hover:bg-surface"
                    }`}
                  >
                    {bs}
                  </button>
                ))}
              </div>
            </div>

            {/* Samples per family */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-ink">
                  Samples per Malware Family
                </label>
                <span className="text-[12px] font-medium text-muted tabular-nums">
                  {samplesPerFam === 0 ? "All 9,339 Binaries" : `${samplesPerFam * 25} Total Images (${samplesPerFam}/fam)`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 30, label: "30" },
                  { value: 50, label: "50" },
                  { value: 0, label: "All (9.3k)" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setSamplesPerFam(item.value)}
                    className={`py-2 px-1 rounded-chip text-[13px] font-semibold border transition-colors text-center tabular-nums cursor-pointer ${
                      samplesPerFam === item.value
                        ? "bg-accent-soft border-accent text-accent"
                        : "bg-surface-2 border-line text-muted hover:text-ink hover:bg-surface"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {samplesPerFam === 0 && (
                <p className="text-[12px] text-high mt-1.5 font-medium leading-[1.5]">
                  ⚡ Full 9,339 Malimg benchmark selected. Streamed directly from disk. (On CPU, full passes require more time per epoch).
                </p>
              )}
            </div>

            {/* Learning rate */}
            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                AdamW Learning Rate
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.0001, 0.0003, 0.0005, 0.001].map((lr) => (
                  <button
                    key={lr}
                    type="button"
                    disabled={isTraining}
                    onClick={() => setLearningRate(lr)}
                    className={`py-2 px-1 rounded-chip text-[13px] font-semibold border transition-colors tabular-nums cursor-pointer ${
                      learningRate === lr
                        ? "bg-accent-soft border-accent text-accent"
                        : "bg-surface-2 border-line text-muted hover:text-ink hover:bg-surface"
                    }`}
                  >
                    {lr}
                  </button>
                ))}
              </div>
            </div>

            {isTraining ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <div className="sm:col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-chip text-[13px] font-medium bg-surface-2 border border-line text-ink select-none tabular-nums">
                  <Play className="w-4 h-4 animate-spin text-accent flex-shrink-0" />
                  <span className="truncate">
                    {currentEpoch > 0 ? `Epoch ${currentEpoch}/${epochs} on ${deviceMode.toUpperCase()}...` : `Preloading ViT Dataset...`}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={handleStopTraining}
                  disabled={isStopping}
                  variant="destructive"
                  className="w-full font-semibold"
                  size="lg"
                >
                  <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  {isStopping ? "Halting..." : "Stop"}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleStartTraining}
                disabled={isTraining}
                className="w-full mt-2"
                variant={deviceMode === "cuda" && !systemStatus?.cuda_available ? "outline" : "cyber"}
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {deviceMode === "cuda" && !systemStatus?.cuda_available
                  ? "Launch PyTorch Training (GPU Selected • CPU Fallback)"
                  : `Launch Real PyTorch Training on ${deviceMode === "cuda" ? "GPU (CUDA)" : "CPU"}`}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Right Hardware Telemetry & Real-Time Curves */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4 border-b border-line bg-surface-2">
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-accent" />
                Local Hardware Profile &amp; Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2.5 text-[13px]">
              <div className="p-3 rounded-tile bg-surface-2 border border-line flex justify-between items-center gap-2">
                <span className="text-muted font-medium">Selected Device:</span>
                <span className={`font-semibold tabular-nums text-right ${deviceMode === "cuda" && !systemStatus?.cuda_available ? "text-high" : "text-ink"}`}>
                  {deviceMode === "cuda"
                    ? systemStatus?.cuda_available
                      ? `${systemStatus?.device_name || "NVIDIA GPU"} (${systemStatus?.total_vram || "6.00 GB"} VRAM)`
                      : "CUDA Requested (Host: CPU Fallback)"
                    : "CPU Host (x86_64 Multi-Core)"}
                </span>
              </div>
              <div className="p-3 rounded-tile bg-surface-2 border border-line flex justify-between items-center gap-2">
                <span className="text-muted font-medium">Precision Standard:</span>
                <span className="text-ink font-semibold text-right">
                  {deviceMode === "cuda" && systemStatus?.cuda_available
                    ? "FP16 Mixed Precision (AMP)"
                    : "FP32 Single Precision"}
                </span>
              </div>
              <div className="p-3 rounded-tile bg-surface-2 border border-line flex justify-between items-center gap-2">
                <span className="text-muted font-medium">Checkpoint Target:</span>
                <span className="font-mono text-accent font-medium text-right truncate">{systemStatus?.checkpoint_path || "checkpoints/x_malvit_weights.pt"}</span>
              </div>
              <div className="p-3 rounded-tile bg-surface-2 border border-line flex justify-between items-center gap-2">
                <span className="text-muted font-medium">Loss Regularization:</span>
                <span className="text-ink font-semibold tabular-nums text-right">Label Smoothing (ε = 0.1)</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress & Live Telemetry Curve */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                Live Training Convergence
              </CardTitle>
              {isTraining && (
                <Badge variant="cyber" className="animate-pulse">
                  {deviceMode === "cuda" ? "GPU Active" : "CPU Active"}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="flex justify-between text-[13px] text-ink mb-1.5 font-medium tabular-nums">
                  <span>Epoch Progress: {currentEpoch}/{epochs}</span>
                  <span className="text-accent font-semibold">{progressVal.toFixed(0)}%</span>
                </div>
                <Progress value={progressVal} />
              </div>

              {epochHistory.length > 0 && (
                <div className="grid grid-cols-2 gap-3 tabular-nums">
                  <div className="p-3.5 rounded-tile bg-surface-2 border border-line">
                    <div className="text-muted text-[13px] font-medium">Current Loss:</div>
                    <div className="text-[20px] leading-[1.2] font-semibold text-critical mt-1">
                      {epochHistory[epochHistory.length - 1].train_loss.toFixed(4)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-tile bg-surface-2 border border-line">
                    <div className="text-muted text-[13px] font-medium">Val Accuracy:</div>
                    <div className="text-[20px] leading-[1.2] font-semibold text-ok mt-1">
                      {epochHistory[epochHistory.length - 1].val_acc.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}

              {completionMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3.5 rounded-tile border text-[13px] leading-[1.5] flex items-center gap-2.5 font-medium ${
                    completionMessage.toLowerCase().includes("error") || completionMessage.toLowerCase().includes("failed")
                      ? "bg-critical-soft border-critical/20 text-critical"
                      : "bg-ok-soft border-ok/20 text-ok"
                  }`}
                >
                  {completionMessage.toLowerCase().includes("error") || completionMessage.toLowerCase().includes("failed") ? (
                    <AlertTriangle className="w-5 h-5 text-critical flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-ok flex-shrink-0" />
                  )}
                  <span>{completionMessage}</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live PyTorch Console Stream (Uses Dark Token Scope) */}
      <Card className="dark border-line bg-canvas text-ink overflow-hidden">
        <CardHeader className="py-3 px-6 bg-surface border-b border-line flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-accent" />
            <CardTitle className="text-[13px] font-medium text-muted">
              PyTorch execution stream &amp; training telemetry
            </CardTitle>
            {isTraining ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-[12px] bg-ok-soft text-ok border border-ok/20 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-ok animate-ping" />
                  Live stream
                </span>
                <button
                  type="button"
                  onClick={handleStopTraining}
                  disabled={isStopping}
                  title="Halt active training execution"
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-chip text-[12px] bg-critical-soft text-critical border border-critical/30 hover:bg-critical/20 transition-colors cursor-pointer font-medium"
                >
                  <Square className="w-2.5 h-2.5 fill-current text-critical" />
                  <span>{isStopping ? "Halting..." : "Stop"}</span>
                </button>
              </div>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-[12px] bg-surface-2 text-muted border border-line font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                Idle
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted hidden sm:flex items-center gap-1.5 tabular-nums">
              <FolderCheck className="w-3.5 h-3.5 text-ok" />
              <span>Dataset:</span>
              <span className="font-mono text-accent font-medium">X_MalVit\data\sample</span>
              <span>(9,339 binaries &bull; 25 classes)</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              title="Clear terminal log"
              className="h-7 px-2 text-[12px] text-muted hover:text-ink hover:bg-surface-2"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 bg-canvas">
          <div 
            ref={terminalEndRef}
            className="h-64 overflow-y-auto space-y-1.5 font-mono text-[12px] leading-[1.5] pr-2 select-text tabular-nums"
          >
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted py-10 font-sans">
                <Terminal className="w-8 h-8 mb-2 opacity-40 text-muted" />
                <p className="text-[13px] text-ink font-medium">Console Idle &bull; Ready for Execution</p>
                <p className="text-[12px] text-muted mt-1 max-w-md">
                  Click <span className="text-ink font-medium">Launch Real PyTorch Training</span> above to stream live dataset ingestion from <code className="font-mono text-accent">X_MalVit\data\sample</code>, tensor preloading, and Vision Transformer forward/backward passes.
                </p>
              </div>
            ) : (
              logs.map((log) => {
                const isDivider = log.message.startsWith("=");
                if (isDivider) {
                  return (
                    <div key={log.id} className="text-line select-none py-0.5 overflow-hidden">
                      {log.message}
                    </div>
                  );
                }

                let badgeClass = "text-accent bg-accent-soft border-accent/30";
                let badgeLabel = "";
                let bodyText = log.message;

                const matchTag = log.message.match(/^(\[[A-Z0-9_\-/\s!.]+\])(.*)/);
                if (matchTag) {
                  badgeLabel = matchTag[1];
                  bodyText = matchTag[2];

                  if (badgeLabel.includes("WARNING")) {
                    badgeClass = "text-high bg-high-soft border-high/30";
                  } else if (badgeLabel.includes("FALLBACK")) {
                    badgeClass = "text-high bg-high-soft border-high/30";
                  } else if (badgeLabel.includes("HALT")) {
                    badgeClass = "text-critical bg-critical-soft border-critical/30";
                  } else if (badgeLabel.includes("DATASET") || badgeLabel.includes("PRELOAD") || badgeLabel.includes("CHECKPOINT") || badgeLabel.includes("COMPLETE")) {
                    badgeClass = "text-ok bg-ok-soft border-ok/30";
                  } else if (badgeLabel.includes("ERROR")) {
                    badgeClass = "text-critical bg-critical-soft border-critical/30";
                  } else if (badgeLabel.includes("EPOCH")) {
                    badgeClass = "text-high bg-high-soft border-high/30";
                  } else {
                    badgeClass = "text-accent bg-accent-soft border-accent/30";
                  }
                }

                return (
                  <div key={log.id} className="flex items-start gap-2 hover:bg-surface px-1.5 py-0.5 rounded-chip transition-colors">
                    <span className="text-[12px] text-muted select-none flex-shrink-0">
                      {log.timestamp}
                    </span>
                    {badgeLabel ? (
                      <span className={`text-[11px] font-medium px-1.5 py-0 rounded-chip border flex-shrink-0 ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    ) : null}
                    <span className={`flex-1 break-all ${
                      log.type === "error" || badgeLabel.includes("ERROR") || badgeLabel.includes("HALT")
                        ? "text-critical font-medium" 
                        : badgeLabel.includes("WARNING") || badgeLabel.includes("FALLBACK")
                        ? "text-high font-medium"
                        : badgeLabel.includes("CHECKPOINT") || badgeLabel.includes("COMPLETE")
                        ? "text-ok font-medium"
                        : badgeLabel.includes("BATCH") || badgeLabel.includes("EVAL") || badgeLabel.includes("ENGINE")
                        ? "text-accent"
                        : "text-ink"
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
