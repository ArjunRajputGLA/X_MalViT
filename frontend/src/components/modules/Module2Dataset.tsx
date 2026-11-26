"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, Database, BarChart2, Shield, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

function getCategoryChipClass(category: string): string {
  switch (category) {
    case "Worm":
      return "bg-critical-soft text-critical-ink";
    case "Backdoor":
      return "bg-high-soft text-high-ink";
    case "Trojan":
      return "bg-high-soft text-high-ink";
    case "Downloader":
      return "bg-accent-soft text-accent";
    case "Rogue":
      return "bg-ok-soft text-ok-ink";
    default:
      return "bg-surface-2 text-muted";
  }
}

export const Module2Dataset: React.FC = () => {
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Worm");
  const [selectedFamily, setSelectedFamily] = useState<string>("Allaple.A");
  const [sampleData, setSampleData] = useState<{
    image_data_url: string;
    histogram: { counts: number[]; bin_centers: number[]; mean_entropy: number };
  } | null>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/dataset/overview");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || {});
        setDistribution(data.distribution || []);
        if (data.categories?.Worm?.length > 0) {
          loadFamilySample(data.categories.Worm[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching overview:", e);
    }
  };

  const loadFamilySample = async (family: string, seed?: number) => {
    setLoadingSample(true);
    try {
      const url = seed !== undefined
        ? `/api/dataset/sample?family=${encodeURIComponent(family)}&seed=${seed}`
        : `/api/dataset/sample?family=${encodeURIComponent(family)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSampleData(data);
      }
    } catch (e) {
      console.error("Error loading sample:", e);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const fams = categories[cat] || [];
    if (fams.length > 0) {
      setSelectedFamily(fams[0]);
      loadFamilySample(fams[0]);
    }
  };

  const handleFamilyChange = (fam: string) => {
    setSelectedFamily(fam);
    loadFamilySample(fam);
  };

  const handleSynthesizeNew = () => {
    loadFamilySample(selectedFamily, Date.now());
  };

  const filteredDist = distribution.filter(d =>
    d.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Maximum histogram count for SVG scaling
  const maxHistCount = sampleData?.histogram?.counts
    ? Math.max(...sampleData.histogram.counts, 1)
    : 1;

  const categoryChipClass = getCategoryChipClass(selectedCategory);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <Card className="xl:col-span-1 min-w-0 overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              Threat Family Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Malware Threat Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="appearance-none h-10 w-full bg-surface-2 border border-line rounded-chip pl-3 pr-9 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors font-medium cursor-pointer"
                >
                  {Object.keys(categories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({categories[cat].length} Families)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Target Malware Family
              </label>
              <div className="relative">
                <select
                  value={selectedFamily}
                  onChange={(e) => handleFamilyChange(e.target.value)}
                  className="appearance-none h-10 w-full bg-surface-2 border border-line rounded-chip pl-3 pr-9 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors font-mono cursor-pointer"
                >
                  {(categories[selectedCategory] || []).map((fam) => (
                    <option key={fam} value={fam}>
                      {fam}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <dl className="divide-y divide-line border-t border-b border-line text-[13px]">
              <div className="py-3 flex items-center justify-between gap-3">
                <dt className="text-muted">Classification</dt>
                <dd>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-chip text-[12px] font-medium ${categoryChipClass}`}>
                    {selectedCategory}
                  </span>
                </dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-3">
                <dt className="text-muted">Family Variant</dt>
                <dd>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-chip font-mono font-medium text-[12px] ${categoryChipClass}`}>
                    {selectedFamily}
                  </span>
                </dd>
              </div>
              <div className="py-3 space-y-1">
                <dt className="text-muted">Typical Anatomy</dt>
                <dd className="text-[12px] text-ink leading-[1.5]">
                  Repetitive unpacking loops, polymorphic shellcode, and high-entropy encrypted payloads.
                </dd>
              </div>
            </dl>

            <Button
              onClick={handleSynthesizeNew}
              disabled={loadingSample}
              className="w-full"
              variant="cyber"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingSample ? "animate-spin" : ""}`} />
              Load Next Benchmark Binary Sample
            </Button>
          </CardContent>
        </Card>

        {/* Right Preview & Histogram Panel */}
        <Card className="xl:col-span-2 min-w-0 overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" />
              Visual Texture Matrix &amp; Byte Frequency Histogram
            </CardTitle>
            <Badge variant="cyber" className="font-mono">{selectedFamily}</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Visual Texture Image */}
              <div className="flex flex-col items-center">
                <div className="text-[13px] text-ink font-medium mb-2 tabular-nums">
                  224x224 Grayscale Byte Matrix
                </div>
                <div className="relative w-56 h-56 rounded-tile overflow-hidden border border-line bg-surface-2 flex items-center justify-center p-1">
                  {loadingSample || !sampleData?.image_data_url ? (
                    <Skeleton className="w-full h-full rounded-chip" />
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={sampleData.image_data_url}
                        src={sampleData.image_data_url}
                        alt={selectedFamily}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ imageRendering: "pixelated" }}
                        className="w-full h-full object-cover rounded-chip"
                      />
                    </AnimatePresence>
                  )}
                </div>
                <div className="text-[12px] text-muted mt-2">
                  Opcode layout preserved in 2D grid
                </div>
              </div>

              {/* Byte Frequency Histogram */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-[13px] text-ink font-medium mb-2 gap-2">
                  <span>Byte Distribution (0-255)</span>
                  {sampleData?.histogram?.mean_entropy && !loadingSample && (
                    <span className="text-[12px] font-mono font-medium text-muted bg-surface-2 px-2 py-0.5 rounded-chip border border-line tabular-nums">
                      Entropy: {sampleData.histogram.mean_entropy.toFixed(2)} bits
                    </span>
                  )}
                </div>
                <div
                  role="img"
                  aria-label={`Byte frequency histogram for ${selectedFamily}${
                    sampleData?.histogram?.mean_entropy
                      ? `, entropy ${sampleData.histogram.mean_entropy.toFixed(2)} bits`
                      : ""
                  }`}
                  className="relative h-56 w-full rounded-tile bg-surface-2 border border-line p-3"
                >
                  <span className="sr-only">
                    Histogram of 8-bit byte frequencies from 0x00 to 0xFF for {selectedFamily}.
                  </span>
                  {/* Faint horizontal gridlines */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-[25%] border-t border-line/60"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-[50%] border-t border-line/60"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-[75%] border-t border-line/60"
                  />

                  <div className="relative z-10 h-full w-full flex items-end justify-between gap-[2px]">
                    {loadingSample || !sampleData?.histogram?.counts ? (
                      Array.from({ length: 24 }).map((_, idx) => (
                        <div key={idx} className="h-full flex-1 flex items-end">
                          <Skeleton
                            style={{ height: `${25 + ((idx * 19) % 65)}%` }}
                            className="w-full rounded-t-[2px] rounded-b-none border-0"
                          />
                        </div>
                      ))
                    ) : (
                      sampleData.histogram.counts.map((count, idx) => {
                        const totalBins = sampleData.histogram.counts.length;
                        const heightPercent = Math.max(4, (count / maxHistCount) * 100);
                        const startByte = Math.floor((idx * 256) / totalBins);
                        const endByte = Math.floor(((idx + 1) * 256) / totalBins) - 1;
                        const startHex = `0x${startByte.toString(16).toUpperCase().padStart(2, "0")}`;
                        const endHex = `0x${endByte.toString(16).toUpperCase().padStart(2, "0")}`;
                        const hexLabel = startByte === endByte ? startHex : `${startHex}–${endHex}`;
                        const tooltipAlign =
                          idx < 6
                            ? "left-0"
                            : idx > totalBins - 7
                              ? "right-0"
                              : "left-1/2 -translate-x-1/2";

                        return (
                          <div
                            key={idx}
                            className="relative h-full flex-1 flex items-end group rounded-t-[2px] hover:bg-accent-soft/40 transition-colors"
                          >
                            <div
                              role="tooltip"
                              className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100 absolute bottom-full mb-1.5 ${tooltipAlign} z-30 whitespace-nowrap rounded-chip bg-ink text-surface px-2 py-1 text-[11px] font-mono shadow-panel tabular-nums`}
                            >
                              {hexLabel}: {count.toLocaleString()}
                            </div>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ duration: 0.3, delay: idx * 0.002, ease: "easeOut" }}
                              className="w-full bg-accent group-hover:bg-accent/80 transition-colors rounded-t-[2px]"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-[12px] text-muted font-mono mt-1.5 px-1">
                  <span>0x00 (Null)</span>
                  <span>0x7F (Mid)</span>
                  <span>0xFF (High)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Malimg Ground-Truth Distribution Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-line bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 tabular-nums">
            <Shield className="w-4 h-4 text-accent" />
            Complete Malimg Ground-Truth Distribution (9,339 Binaries across 25 Families)
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search family or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full bg-surface border border-line rounded-chip pl-9 pr-3 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-72 overflow-auto rounded-tile border border-line">
            <table className="w-full text-[13px] text-left text-ink tabular-nums">
              <thead className="text-[13px] bg-surface-2 text-muted sticky top-0 z-10 border-b border-line font-medium">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Family name</th>
                  <th className="py-2.5 px-3 font-medium">Threat type</th>
                  <th className="py-2.5 px-3 font-medium text-right">Benchmark samples</th>
                  <th className="py-2.5 px-3 font-medium">Risk rating</th>
                  <th className="py-2.5 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-normal">
                {distribution.length === 0 ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3"><Skeleton className="h-4 w-24 rounded-chip" /></td>
                      <td className="py-2.5 px-3"><Skeleton className="h-4 w-16 rounded-chip" /></td>
                      <td className="py-2.5 px-3"><Skeleton className="h-4 w-14 ml-auto rounded-chip" /></td>
                      <td className="py-2.5 px-3"><Skeleton className="h-5 w-16 rounded-chip" /></td>
                      <td className="py-2.5 px-3"><Skeleton className="h-4 w-24 rounded-chip" /></td>
                    </tr>
                  ))
                ) : (
                  filteredDist.map((item) => (
                    <tr key={item.family} className="hover:bg-surface-2 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-accent font-medium">{item.family}</td>
                      <td className="py-2.5 px-3 text-muted">{item.category}</td>
                      <td className="py-2.5 px-3 text-right text-ink font-medium tabular-nums">{item.samples.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block lowercase first-letter:uppercase px-2.5 py-0.5 rounded-chip text-[12px] font-medium ${item.risk === "CRITICAL"
                            ? "bg-critical-soft text-critical-ink"
                            : "bg-high-soft text-high-ink"
                            }`}
                        >
                          {item.risk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(item.category);
                            setSelectedFamily(item.family);
                            loadFamilySample(item.family);
                          }}
                          className="group text-accent hover:text-accent hover:bg-accent-soft/60 -ml-2"
                        >
                          <span>Inspect Texture</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform duration-150 group-hover:translate-x-[2px]" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
