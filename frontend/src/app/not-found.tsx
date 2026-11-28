import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full bg-canvas text-ink flex flex-col justify-between overflow-hidden px-4 sm:px-6 py-6">
      {/* Subtle architectural 16px patch-grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,1) 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,1) 20%, transparent 100%)",
        }}
      />

      {/* Minimal top bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group outline-none rounded-tile"
        >
          <span className="w-9 h-9 rounded-tile bg-accent flex items-center justify-center text-on-accent transition-transform duration-150 group-hover:scale-[1.03]">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold text-ink">
              X-MalViT
            </span>
            <span className="block text-[11px] font-medium text-muted">
              Threat intelligence
            </span>
          </span>
        </Link>

        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-chip bg-surface border border-line text-[12px] font-mono font-medium text-muted tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-high" />
          HTTP 404
        </span>
      </header>

      {/* Center minimal card */}
      <section className="relative z-10 w-full max-w-[460px] mx-auto my-auto py-10">
        <div className="relative overflow-hidden rounded-panel bg-surface border border-line shadow-[var(--shadow-panel)] p-8 sm:p-9">
          {/* Faint Malimg byte-texture motif along top-right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 w-44 h-44 overflow-hidden"
          >
            <img
              src="/malimg-motif.png"
              alt=""
              style={{
                imageRendering: "pixelated",
                maskImage:
                  "radial-gradient(circle at top right, rgba(0,0,0,1) 0%, transparent 72%)",
                WebkitMaskImage:
                  "radial-gradient(circle at top right, rgba(0,0,0,1) 0%, transparent 72%)",
              }}
              className="w-full h-full object-cover opacity-[0.12] dark:opacity-[0.18] select-none"
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[44px] leading-none font-semibold tracking-tight text-accent tabular-nums">
                404
              </span>
              <span className="px-2 py-0.5 rounded-chip bg-accent-soft text-accent border border-accent/20 font-mono text-[11px] font-medium uppercase tracking-wider">
                Unmapped offset
              </span>
            </div>

            <h1 className="text-[22px] leading-[1.25] font-semibold text-ink mt-5">
              Page not found
            </h1>

            <p className="text-[14px] text-muted leading-[1.6] mt-2">
              The route you requested doesn&apos;t exist in the X-MalViT workspace or may have been moved.
            </p>

            <div className="mt-7 pt-6 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-chip bg-accent hover:bg-accent/90 hover:shadow-[0_2px_12px_color-mix(in_srgb,var(--accent)_35%,transparent)] text-on-accent text-[13px] font-medium transition-all duration-150 active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>

              <a
                href="/api/documents/X-MalViT_Research_Paper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-chip bg-surface-2 hover:bg-line/50 border border-line text-ink text-[13px] font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-muted" />
                <span>Read Paper (PDF)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle footer */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto text-center text-[12px] text-muted">
        X-MalViT &bull; Explainable Vision Transformer Malware Classification
      </footer>
    </main>
  );
}
