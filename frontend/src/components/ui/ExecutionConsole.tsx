"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, FolderCheck, Trash2, Square } from "lucide-react";

export interface ConsoleLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type?: "system" | "dataset" | "model" | "epoch" | "checkpoint" | "error" | "info";
}

interface ExecutionConsoleProps {
  logs: ConsoleLogEntry[];
  isTraining: boolean;
  isStopping: boolean;
  completionMessage: string | null;
  onStopTraining: () => void;
  onClearLogs: () => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  logs,
  isTraining,
  isStopping,
  completionMessage,
  onStopTraining,
  onClearLogs,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<boolean>(true);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    autoScrollRef.current = distanceFromBottom <= 36;
  };

  useEffect(() => {
    if (logs.length === 0) {
      autoScrollRef.current = true;
      return;
    }
    if (autoScrollRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const hasErrorStatus =
    !isTraining &&
    Boolean(
      completionMessage &&
        (completionMessage.toLowerCase().includes("error") ||
          completionMessage.toLowerCase().includes("failed"))
    );

  const statusConfig = isTraining
    ? {
        label: "Running",
        chipClass: "bg-accent-soft text-accent border border-accent/30",
        dotClass: "bg-accent animate-pulse",
      }
    : hasErrorStatus
    ? {
        label: "Error",
        chipClass: "bg-critical-soft text-critical border border-critical/30",
        dotClass: "bg-critical",
      }
    : completionMessage
    ? {
        label: "Done",
        chipClass: "bg-ok-soft text-ok border border-ok/30",
        dotClass: "bg-ok",
      }
    : {
        label: "Idle",
        chipClass: "bg-surface-2 text-muted border border-line",
        dotClass: "bg-muted",
      };

  return (
    <Card className="dark border-line bg-canvas text-ink overflow-hidden">
      <CardHeader className="py-3 px-6 bg-surface border-b border-line flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Terminal className="w-4 h-4 text-accent flex-shrink-0" />
          <CardTitle className="text-[13px] font-medium text-muted">
            PyTorch execution stream &amp; training telemetry
          </CardTitle>

          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-[12px] font-medium ${statusConfig.chipClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </span>

          {isTraining && (
            <button
              type="button"
              onClick={onStopTraining}
              disabled={isStopping}
              title="Halt active training execution"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-chip text-[12px] bg-critical-soft text-critical border border-critical/30 hover:bg-critical/20 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-2.5 h-2.5 fill-current text-critical" />
              <span>{isStopping ? "Halting..." : "Stop"}</span>
            </button>
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
            onClick={onClearLogs}
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
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-[420px] overflow-y-auto space-y-1 font-mono text-[13px] leading-[1.6] pr-2 select-text tabular-nums"
        >
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted py-10 font-sans">
              <Terminal className="w-8 h-8 mb-2 opacity-40 text-muted" />
              <p className="text-[13px] text-ink font-medium">Console Idle &bull; Ready for Execution</p>
              <p className="text-[12px] text-muted mt-1 max-w-md">
                Click <span className="text-ink font-medium">Launch Real PyTorch Training</span> above to stream live dataset ingestion from{" "}
                <code className="font-mono text-accent">X_MalVit\data\sample</code>, tensor preloading, and Vision Transformer forward/backward passes.
              </p>
            </div>
          ) : (
            logs.map((log, idx) => {
              const isLast = idx === logs.length - 1;
              const isDivider = log.message.startsWith("=");
              if (isDivider) {
                return (
                  <div key={log.id} className="flex items-center gap-3 text-line select-none py-0.5 overflow-hidden">
                    <span className="w-7 text-right text-[12px] text-muted/60 flex-shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{log.message}</span>
                  </div>
                );
              }

              let prefixClass = "text-muted bg-surface-2 border-line";
              let prefixLabel = "";
              let bodyText = log.message;

              const matchTag = log.message.match(
                /^(\[[A-Z0-9_\-/\s!.:]+\]|INFO:?|WARN(?:ING)?:?|ERROR:?)(.*)/
              );
              if (matchTag) {
                prefixLabel = matchTag[1];
                bodyText = matchTag[2];
                const upper = prefixLabel.toUpperCase();

                if (upper.includes("ERROR") || upper.includes("HALT")) {
                  prefixClass = "text-critical bg-critical-soft border-critical/30";
                } else if (upper.includes("WARN") || upper.includes("FALLBACK")) {
                  prefixClass = "text-high bg-high-soft border-high/30";
                } else if (
                  upper.includes("EPOCH") ||
                  upper.includes("BATCH") ||
                  upper.includes("EVAL")
                ) {
                  prefixClass = "text-accent bg-accent-soft border-accent/30";
                } else if (
                  upper.includes("DATASET") ||
                  upper.includes("PRELOAD") ||
                  upper.includes("CHECKPOINT") ||
                  upper.includes("COMPLETE")
                ) {
                  prefixClass = "text-ok bg-ok-soft border-ok/30";
                } else {
                  prefixClass = "text-muted bg-surface-2 border-line";
                }
              }

              const upperPrefix = prefixLabel.toUpperCase();
              const isEpochLine =
                log.type === "epoch" ||
                upperPrefix.includes("EPOCH") ||
                upperPrefix.includes("BATCH") ||
                upperPrefix.includes("EVAL");
              const bodyClass =
                log.type === "error" ||
                upperPrefix.includes("ERROR") ||
                upperPrefix.includes("HALT")
                  ? "text-critical font-medium"
                  : upperPrefix.includes("WARN") || upperPrefix.includes("FALLBACK")
                  ? "text-high font-medium"
                  : upperPrefix.includes("CHECKPOINT") || upperPrefix.includes("COMPLETE")
                  ? "text-ok font-medium"
                  : isEpochLine
                  ? "text-accent"
                  : "text-ink";

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 hover:bg-surface px-2 py-0.5 rounded-chip transition-colors"
                >
                  <span className="w-7 text-right text-[12px] text-muted/60 select-none flex-shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[12px] text-muted select-none flex-shrink-0">
                    {log.timestamp}
                  </span>
                  {prefixLabel ? (
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0 rounded-chip border flex-shrink-0 leading-[1.5] mt-[1px] ${prefixClass}`}
                    >
                      {prefixLabel}
                    </span>
                  ) : null}
                  <span className={`flex-1 break-all ${bodyClass}`}>
                    {bodyText}
                    {isTraining && isLast && (
                      <span
                        aria-hidden="true"
                        className="caret-blink inline-block w-[7px] h-[14px] bg-accent align-middle ml-1.5 -mt-0.5 rounded-[1px]"
                      />
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
