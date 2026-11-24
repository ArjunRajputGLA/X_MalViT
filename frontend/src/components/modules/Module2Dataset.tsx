"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, Database, BarChart2, Shield, AlertTriangle } from "lucide-react";

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <Card className="lg:col-span-1 border-sky-500/20 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Threat Family Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Malware Threat Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              >
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categories[cat].length} Families)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Malware Family
              </label>
              <select
                value={selectedFamily}
                onChange={(e) => handleFamilyChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              >
                {(categories[selectedCategory] || []).map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div>
                <span className="text-slate-400">Classification:</span>{" "}
                <code className="text-sky-400 font-mono">{selectedCategory}</code>
              </div>
              <div>
                <span className="text-slate-400">Family Variant:</span>{" "}
                <code className="text-indigo-400 font-mono">{selectedFamily}</code>
              </div>
              <div>
                <span className="text-slate-400">Typical Anatomy:</span> Repetitive unpacking loops, polymorphic shellcode, and high-entropy encrypted payloads.
              </div>
            </div>

            <Button
              onClick={handleSynthesizeNew}
              disabled={loadingSample}
              className="w-full"
              variant="cyber"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingSample ? "animate-spin" : ""}`} />
              Synthesize Variant Texture
            </Button>
          </CardContent>
        </Card>

        {/* Right Preview & Histogram Panel */}
        <Card className="lg:col-span-2 border-sky-500/20 bg-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              Visual Texture Matrix & Byte Frequency Histogram
            </CardTitle>
            <Badge variant="cyber">{selectedFamily}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Visual Texture Image */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-slate-400 font-semibold mb-2">
                  224x224 Grayscale Byte Matrix
                </div>
                <div className="relative w-56 h-56 rounded-lg overflow-hidden border border-sky-500/30 bg-slate-950 shadow-inner flex items-center justify-center">
                  {sampleData?.image_data_url ? (
                    <img
                      src={sampleData.image_data_url}
                      alt={selectedFamily}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">Loading texture...</div>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">
                  Opcode layout preserved in 2D grid
                </div>
              </div>

              {/* Byte Frequency Histogram (SVG) */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>Byte Distribution (0-255)</span>
                  {sampleData?.histogram?.mean_entropy && (
                    <span className="text-[11px] text-sky-400 font-mono">
                      Entropy: {sampleData.histogram.mean_entropy.toFixed(2)} bits
                    </span>
                  )}
                </div>
                <div className="h-56 w-full rounded-lg bg-slate-950 border border-slate-800 p-2 flex items-end justify-between gap-[2px]">
                  {sampleData?.histogram?.counts ? (
                    sampleData.histogram.counts.map((count, idx) => {
                      const heightPercent = Math.max(4, (count / maxHistCount) * 100);
                      return (
                        <div
                          key={idx}
                          title={`Bin ${idx * 4}-${(idx + 1) * 4}: ${count} bytes`}
                          style={{ height: `${heightPercent}%` }}
                          className="flex-1 bg-sky-500/80 hover:bg-sky-400 transition-all rounded-t-sm"
                        />
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      Computing histogram...
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
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
      <Card className="border-sky-500/20 bg-slate-900/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-sky-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            Complete Malimg Ground-Truth Distribution (9,339 Binaries across 25 Families)
          </CardTitle>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search family or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-950/80 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Family Name</th>
                  <th className="py-2.5 px-3">Threat Type</th>
                  <th className="py-2.5 px-3">Benchmark Samples</th>
                  <th className="py-2.5 px-3">Risk Rating</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDist.map((item) => (
                  <tr key={item.family} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-sky-400 font-semibold">{item.family}</td>
                    <td className="py-2 px-3">{item.category}</td>
                    <td className="py-2 px-3 font-mono">{item.samples.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <Badge variant={item.risk === "CRITICAL" ? "destructive" : "warning"}>
                        {item.risk}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => {
                          setSelectedCategory(item.category);
                          setSelectedFamily(item.family);
                          loadFamilySample(item.family);
                        }}
                        className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline"
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
    </div>
  );
};
