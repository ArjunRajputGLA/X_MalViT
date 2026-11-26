"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, Database, BarChart2, Shield } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-4 border-b border-line bg-surface-2">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              Threat Family Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Malware Threat Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-surface-2 border border-line rounded-chip px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors font-medium"
              >
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categories[cat].length} Families)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-ink block mb-1.5">
                Target Malware Family
              </label>
              <select
                value={selectedFamily}
                onChange={(e) => handleFamilyChange(e.target.value)}
                className="w-full bg-surface-2 border border-line rounded-chip px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors font-mono"
              >
                {(categories[selectedCategory] || []).map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-tile bg-surface-2 border border-line text-[13px] space-y-2.5 text-muted">
              <div className="flex items-center justify-between">
                <span className="font-medium">Classification:</span>
                <span className="font-semibold text-ink bg-surface px-2 py-0.5 rounded-chip border border-line text-[12px]">
                  {selectedCategory}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Family Variant:</span>
                <span className="font-mono font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-chip border border-accent/20 text-[12px]">
                  {selectedFamily}
                </span>
              </div>
              <div className="pt-2 text-[12px] text-muted border-t border-line leading-[1.5]">
                <span className="font-semibold text-ink">Typical Anatomy:</span> Repetitive unpacking loops, polymorphic shellcode, and high-entropy encrypted payloads.
              </div>
            </div>

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
        <Card className="lg:col-span-2 overflow-hidden">
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
                  {sampleData?.image_data_url ? (
                    <img
                      src={sampleData.image_data_url}
                      alt={selectedFamily}
                      className="w-full h-full object-cover rounded-chip"
                    />
                  ) : (
                    <div className="text-[13px] text-muted">Loading texture...</div>
                  )}
                </div>
                <div className="text-[12px] text-muted mt-2">
                  Opcode layout preserved in 2D grid
                </div>
              </div>

              {/* Byte Frequency Histogram (SVG) */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-[13px] text-ink font-medium mb-2">
                  <span>Byte Distribution (0-255)</span>
                  {sampleData?.histogram?.mean_entropy && (
                    <span className="text-[12px] text-accent font-semibold bg-accent-soft px-2 py-0.5 rounded-chip border border-accent/20 tabular-nums">
                      Entropy: {sampleData.histogram.mean_entropy.toFixed(2)} bits
                    </span>
                  )}
                </div>
                <div className="h-56 w-full rounded-tile bg-surface-2 border border-line p-3 flex items-end justify-between gap-[2px]">
                  {sampleData?.histogram?.counts ? (
                    sampleData.histogram.counts.map((count, idx) => {
                      const heightPercent = Math.max(4, (count / maxHistCount) * 100);
                      return (
                        <div
                          key={idx}
                          title={`Bin ${idx * 4}-${(idx + 1) * 4}: ${count} bytes`}
                          style={{ height: `${heightPercent}%` }}
                          className="flex-1 bg-accent hover:bg-accent/80 transition-colors rounded-t-[2px]"
                        />
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[13px] text-muted">
                      Computing histogram...
                    </div>
                  )}
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
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              placeholder="Search family or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-line rounded-chip pl-8 pr-3 py-1.5 text-[13px] text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-[13px] text-left text-ink tabular-nums">
              <thead className="text-[13px] bg-surface-2 text-muted sticky top-0 border-b border-line font-medium">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Family name</th>
                  <th className="py-2.5 px-3 font-medium">Threat type</th>
                  <th className="py-2.5 px-3 font-medium">Benchmark samples</th>
                  <th className="py-2.5 px-3 font-medium">Risk rating</th>
                  <th className="py-2.5 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-normal">
                {filteredDist.map((item) => (
                  <tr key={item.family} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-accent font-medium">{item.family}</td>
                    <td className="py-2.5 px-3 text-muted">{item.category}</td>
                    <td className="py-2.5 px-3 text-ink font-medium tabular-nums">{item.samples.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={item.risk === "CRITICAL" ? "destructive" : "warning"} className="lowercase first-letter:uppercase">
                        {item.risk}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          setSelectedCategory(item.category);
                          setSelectedFamily(item.family);
                          loadFamilySample(item.family);
                        }}
                        className="text-[13px] text-accent hover:underline font-medium cursor-pointer"
                      >
                        Inspect Texture &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
