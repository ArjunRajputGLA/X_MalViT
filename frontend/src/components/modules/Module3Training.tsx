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
  Activity,
  Zap,
  AlertTriangle,
  Square,
  Loader2,
  ChevronDown,
  LineChart
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ExecutionConsole, ConsoleLogEntry } from "@/components/ui/ExecutionConsole";

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

type TrainingLog = ConsoleLogEntry;

function ConvergenceMiniChart({
  epochHistory,
  totalEpochs,
}: {
  epochHistory: EpochData[];
  totalEpochs: number;
}) {
  const maxX = Math.max(totalEpochs, epochHistory.length, 2);
  const points = epochHistory.map((d) => {
    const x = ((d.epoch - 1) / (maxX - 1)) * 376 + 12;
    const y = 96 - (Math.min(100, Math.max(0, d.val_acc)) / 100) * 80;
    return { x, y, epoch: d.epoch, val_acc: d.val_acc };
  });

  return (
    <div className="rounded-tile border border-line bg-surface-2 p-3">
      <div className="flex items-center justify-between text-[12px] text-muted mb-2 tabular-nums">
        <span>Validation Accuracy Curve</span>
        <span className="font-mono text-ok font-medium">
          Peak: {Math.max(...epochHistory.map((d) => d.val_acc)).toFixed(2)}%
        </span>
      </div>
      <svg
        viewBox="0 0 400 108"
        className="w-full h-28 overflow-visible"
        role="img"
        aria-label={`Validation accuracy across ${epochHistory.length} epochs, latest ${epochHistory[epochHistory.length - 1]?.val_acc.toFixed(2)}%`}
      >
        {[20, 48, 76].map((gridY) => (
          <line
            key={gridY}
            x1="8"
            x2="392"
            y1={gridY}
            y2={gridY}
            stroke="var(--line)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        ))}
        {points.slice(1).map((pt, idx) => {
          const prev = points[idx];
          return (
            <motion.line
              key={`seg-${prev.epoch}-${pt.epoch}`}
              x1={prev.x}
              y1={prev.y}
              x2={pt.x}
              y2={pt.y}
              stroke="var(--ok)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          );
        })}
        {points.map((pt, idx) => {
          const isLatest = idx === points.length - 1;
          return (
            <g key={`pt-${pt.epoch}`}>
              {isLatest && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill="var(--ok)"
                  opacity="0.2"
                />
              )}
              <motion.circle
                cx={pt.x}
                cy={pt.y}
                r={isLatest ? "4" : "3.5"}
                fill="var(--surface)"
                stroke="var(--ok)"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
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

  useEffect(() => {
    fetchStatus();
  }, []);

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

  const epochPct = ((epochs - 2) / (10 - 2)) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Hyperparameter Control Panel */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-accent" />
              Architecture &amp; Hyperparameter Tuning
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {/* Target Neural Architecture */}
            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Target Neural Architecture
              </label>
              <div className="relative">
                <select
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  disabled={isTraining}
                  className="appearance-none h-10 w-full bg-surface-2 border border-line rounded-chip pl-3 pr-9 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <ChevronDown className="w-4 h-4 text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
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
                    ? systemStatus?.cuda_available
                      ? "Hardware acceleration"
                      : "GPU selected (CPU fallback)"
                    : "Host CPU execution"}
                </span>
              </div>

              <SegmentedControl
                ariaLabel="Compute Accelerator"
                layoutId="seg-accelerator"
                value={deviceMode}
                onChange={setDeviceMode}
                disabled={isTraining}
                options={[
                  {
                    value: "cuda" as const,
                    label: "NVIDIA GPU (CUDA)",
                    icon: (
                      <Zap
                        className={`w-3.5 h-3.5 ${
                          deviceMode === "cuda" ? "text-accent" : "text-muted"
                        }`}
                      />
                    ),
                    indicator:
                      deviceMode === "cuda" ? (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            systemStatus?.cuda_available ? "bg-ok animate-pulse" : "bg-high"
                          }`}
                        />
                      ) : undefined,
                  },
                  {
                    value: "cpu" as const,
                    label: "CPU Host Cores",
                    icon: (
                      <Cpu
                        className={`w-3.5 h-3.5 ${
                          deviceMode === "cpu" ? "text-accent" : "text-muted"
                        }`}
                      />
                    ),
                    indicator:
                      deviceMode === "cpu" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      ) : undefined,
                  },
                ]}
              />

              {/* Hardware Availability Alert when CUDA selected without hardware */}
              {deviceMode === "cuda" && !systemStatus?.cuda_available && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 p-3 rounded-tile bg-high-soft border border-high/20 text-ink flex items-start gap-2.5 text-[13px]"
                >
                  <AlertTriangle className="w-4 h-4 text-high flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[13px] block text-high">
                      Notice: No NVIDIA CUDA GPU Detected on Host
                    </span>
                    <p className="text-[12px] text-muted leading-[1.5] mt-0.5">
                      You have selected GPU mode on a CPU-only host. The PyTorch training engine will catch this, route execution to CPU Host Cores, and stream clear diagnostic warnings in the terminal console.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="mt-1.5 px-1 flex items-center justify-between text-[12px] text-muted">
                <span>
                  {deviceMode === "cuda"
                    ? systemStatus?.cuda_available
                      ? "Tensor Cores active • FP16 Mixed Precision (AMP)"
                      : "CUDA unavailable • Automatic FP32 CPU Host fallback"
                    : "Standard multi-threaded host cores • FP32 Precision"}
                </span>
                {deviceMode === "cuda" &&
                  systemStatus?.cuda_available &&
                  systemStatus?.total_vram && (
                    <span className="text-accent font-semibold tabular-nums">
                      {systemStatus.total_vram} VRAM
                    </span>
                  )}
              </div>
            </div>

            {/* Epoch Slider */}
            <div>
              <div className="flex justify-between text-[13px] font-medium text-ink mb-2">
                <span>Training Epochs:</span>
                <span className="text-accent font-semibold tabular-nums">{epochs}</span>
              </div>
              <div className="relative pt-1">
                <div className="relative flex items-center h-6">
                  <div className="pointer-events-none absolute inset-x-[9px] h-2 rounded-full bg-surface-2 border border-line overflow-hidden">
                    <div
                      className="h-full bg-accent transition-[width] duration-75"
                      style={{ width: `${epochPct}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={epochs}
                    disabled={isTraining}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="peer epoch-range relative z-10 w-full cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div
                    aria-hidden="true"
                    style={{ left: `calc(${epochPct}% + ${9 - epochPct * 0.18}px)` }}
                    className="pointer-events-none opacity-0 peer-active:opacity-100 peer-focus-visible:opacity-100 transition-opacity duration-100 -translate-x-1/2 absolute -top-7 z-20 px-2 py-0.5 rounded-chip bg-ink text-surface text-[11px] font-mono font-medium shadow-panel tabular-nums"
                  >
                    {epochs}
                  </div>
                </div>
                <div className="relative h-5 mx-[9px] mt-0.5 text-[12px] text-muted font-medium tabular-nums select-none">
                  {[2, 4, 6, 8, 10].map((tick) => {
                    const tickPct = ((tick - 2) / 8) * 100;
                    return (
                      <span
                        key={tick}
                        style={{ left: `${tickPct}%` }}
                        className="absolute -translate-x-1/2 flex flex-col items-center"
                      >
                        <span className="w-px h-1 bg-line mb-0.5" aria-hidden="true" />
                        <span>{tick}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Batch Size Selection */}
            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Batch Size ({deviceMode === "cuda" ? "Tensor Cores" : "CPU Threads"})
              </label>
              <SegmentedControl
                ariaLabel="Batch Size"
                layoutId="seg-batch-size"
                value={batchSize}
                onChange={setBatchSize}
                disabled={isTraining}
                className="tabular-nums"
                options={[16, 32, 64].map((bs) => ({
                  value: bs,
                  label: bs,
                }))}
              />
            </div>

            {/* Samples per family */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-ink">
                  Samples per Malware Family
                </label>
                <span className="text-[12px] font-medium text-muted tabular-nums">
                  {samplesPerFam === 0
                    ? "All 9,339 Binaries"
                    : `${samplesPerFam * 25} Total Images (${samplesPerFam}/fam)`}
                </span>
              </div>
              <SegmentedControl
                ariaLabel="Samples per Malware Family"
                layoutId="seg-samples"
                value={samplesPerFam}
                onChange={setSamplesPerFam}
                disabled={isTraining}
                className="tabular-nums"
                options={[
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 30, label: "30" },
                  { value: 50, label: "50" },
                  { value: 0, label: "All (9.3k)" },
                ]}
              />
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
              <SegmentedControl
                ariaLabel="AdamW Learning Rate"
                layoutId="seg-lr"
                value={learningRate}
                onChange={setLearningRate}
                disabled={isTraining}
                className="tabular-nums"
                options={[0.0001, 0.0003, 0.0005, 0.001].map((lr) => ({
                  value: lr,
                  label: lr,
                }))}
              />
            </div>

            <div className="space-y-2 pt-1">
              <Button
                onClick={handleStartTraining}
                disabled={isTraining}
                className="w-full"
                variant="cyber"
                size="lg"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {currentEpoch > 0
                      ? `Epoch ${currentEpoch}/${epochs} on ${deviceMode.toUpperCase()}...`
                      : "Preloading ViT Dataset..."}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {deviceMode === "cuda" && !systemStatus?.cuda_available
                      ? "Launch PyTorch Training (GPU Selected • CPU Fallback)"
                      : `Launch Real PyTorch Training on ${
                          deviceMode === "cuda" ? "GPU (CUDA)" : "CPU"
                        }`}
                  </>
                )}
              </Button>

              {isTraining && (
                <Button
                  type="button"
                  onClick={handleStopTraining}
                  disabled={isStopping}
                  variant="destructive"
                  className="w-full font-semibold"
                  size="default"
                >
                  {isStopping ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  )}
                  {isStopping ? "Halting..." : "Stop"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Hardware Telemetry & Real-Time Curves */}
        <div className="min-w-0 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4 border-b border-line bg-surface-2">
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-accent" />
                Local Hardware Profile &amp; Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <dl className="divide-y divide-line text-[13px]">
                <div className="py-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <dt className="text-muted">Selected Device</dt>
                  <dd
                    className={`font-mono font-medium tabular-nums text-right ${
                      deviceMode === "cuda" && !systemStatus?.cuda_available
                        ? "text-high"
                        : "text-ink"
                    }`}
                  >
                    {deviceMode === "cuda"
                      ? systemStatus?.cuda_available
                        ? `${systemStatus?.device_name || "NVIDIA GPU"} (${
                            systemStatus?.total_vram || "6.00 GB"
                          } VRAM)`
                        : "CUDA Requested (Host: CPU Fallback)"
                      : "CPU Host (x86_64 Multi-Core)"}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <dt className="text-muted">Precision Standard</dt>
                  <dd className="font-mono text-ink font-medium text-right">
                    {deviceMode === "cuda" && systemStatus?.cuda_available
                      ? "FP16 Mixed Precision (AMP)"
                      : "FP32 Single Precision"}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <dt className="text-muted">Checkpoint Target</dt>
                  <dd className="font-mono text-accent font-medium text-right truncate">
                    {systemStatus?.checkpoint_path || "checkpoints/x_malvit_weights.pt"}
                  </dd>
                </div>
                <div className="py-2.5 last:pb-0 flex items-center justify-between gap-3">
                  <dt className="text-muted">Loss Regularization</dt>
                  <dd className="font-mono text-ink font-medium tabular-nums text-right">
                    Label Smoothing (ε = 0.1)
                  </dd>
                </div>
              </dl>
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
                  <span>
                    Epoch Progress: {currentEpoch}/{epochs}
                  </span>
                  <span className="text-accent font-semibold">
                    {progressVal.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progressVal} />
              </div>

              {isTraining && epochHistory.length === 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-tile bg-surface-2 border border-line space-y-2">
                      <Skeleton className="h-3.5 w-20 rounded-chip" />
                      <Skeleton className="h-6 w-24 rounded-chip" />
                    </div>
                    <div className="p-3.5 rounded-tile bg-surface-2 border border-line space-y-2">
                      <Skeleton className="h-3.5 w-20 rounded-chip" />
                      <Skeleton className="h-6 w-24 rounded-chip" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full rounded-tile" />
                </div>
              ) : epochHistory.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 tabular-nums">
                    <div className="p-3.5 rounded-tile bg-surface-2 border border-line">
                      <div className="text-muted text-[13px] font-medium">
                        Current Loss:
                      </div>
                      <div className="text-[20px] leading-[1.2] font-semibold text-critical-ink mt-1">
                        {epochHistory[epochHistory.length - 1].train_loss.toFixed(4)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-tile bg-surface-2 border border-line">
                      <div className="text-muted text-[13px] font-medium">
                        Val Accuracy:
                      </div>
                      <div className="text-[20px] leading-[1.2] font-semibold text-ok-ink mt-1">
                        {epochHistory[epochHistory.length - 1].val_acc.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <ConvergenceMiniChart
                    epochHistory={epochHistory}
                    totalEpochs={epochs}
                  />
                </div>
              ) : (
                !completionMessage && (
                  <div className="min-h-[168px] flex flex-col items-center justify-center text-center rounded-tile border border-dashed border-line bg-surface-2/60 px-6 py-8">
                    <LineChart className="w-6 h-6 text-muted mb-2" />
                    <p className="text-[13px] text-muted">
                      Start a training run to see progress for each epoch
                    </p>
                  </div>
                )
              )}

              {completionMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3.5 rounded-tile border text-[13px] leading-[1.5] flex items-center gap-2.5 font-medium ${
                    completionMessage.toLowerCase().includes("error") ||
                    completionMessage.toLowerCase().includes("failed")
                      ? "bg-critical-soft border-critical/20 text-critical"
                      : "bg-ok-soft border-ok/20 text-ok"
                  }`}
                >
                  {completionMessage.toLowerCase().includes("error") ||
                  completionMessage.toLowerCase().includes("failed") ? (
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
      <ExecutionConsole
        logs={logs}
        isTraining={isTraining}
        isStopping={isStopping}
        completionMessage={completionMessage}
        onStopTraining={handleStopTraining}
        onClearLogs={clearLogs}
      />
    </div>
  );
};
