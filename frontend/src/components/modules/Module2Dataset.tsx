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
        <Card className="lg:col-span-1 border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Threat Family Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Malware Threat Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
              >
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categories[cat].length} Families)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Target Malware Family
              </label>
              <select
                value={selectedFamily}
                onChange={(e) => handleFamilyChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-mono"
              >
                {(categories[selectedCategory] || []).map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Classification:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                  {selectedCategory}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Family Variant:</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/50">
                  {selectedFamily}
                </span>
              </div>
              <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/60 leading-snug">
                <span className="font-semibold text-slate-700">Typical Anatomy:</span> Repetitive unpacking loops, polymorphic shellcode, and high-entropy encrypted payloads.
              </div>
            </div>

            <Button
              onClick={handleSynthesizeNew}
              disabled={loadingSample}
              className="w-full shadow-xs"
              variant="cyber"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingSample ? "animate-spin" : ""}`} />
              Load Next Benchmark Binary Sample
            </Button>
          </CardContent>
        </Card>

        {/* Right Preview & Histogram Panel */}
        <Card className="lg:col-span-2 border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Visual Texture Matrix & Byte Frequency Histogram
            </CardTitle>
            <Badge variant="cyber">{selectedFamily}</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Visual Texture Image */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-slate-600 font-semibold mb-2">
                  224x224 Grayscale Byte Matrix
                </div>
                <div className="relative w-56 h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner flex items-center justify-center p-1">
                  {sampleData?.image_data_url ? (
                    <img
                      src={sampleData.image_data_url}
                      alt={selectedFamily}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-xs text-slate-400 font-mono">Loading texture...</div>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  Opcode layout preserved in 2D grid
                </div>
              </div>

              {/* Byte Frequency Histogram (SVG) */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                  <span>Byte Distribution (0-255)</span>
                  {sampleData?.histogram?.mean_entropy && (
                    <span className="text-[11px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                      Entropy: {sampleData.histogram.mean_entropy.toFixed(2)} bits
                    </span>
                  )}
                </div>
                <div className="h-56 w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-end justify-between gap-[2px]">
                  {sampleData?.histogram?.counts ? (
                    sampleData.histogram.counts.map((count, idx) => {
                      const heightPercent = Math.max(4, (count / maxHistCount) * 100);
                      return (
                        <div
                          key={idx}
                          title={`Bin ${idx * 4}-${(idx + 1) * 4}: ${count} bytes`}
                          style={{ height: `${heightPercent}%` }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 transition-all rounded-t-sm"
                        />
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Computing histogram...
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-1 font-semibold">
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
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
            <Shield className="w-4 h-4 text-blue-600" />
            Complete Malimg Ground-Truth Distribution (9,339 Binaries across 25 Families)
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search family or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Family Name</th>
                  <th className="py-2.5 px-3">Threat Type</th>
                  <th className="py-2.5 px-3">Benchmark Samples</th>
                  <th className="py-2.5 px-3">Risk Rating</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDist.map((item) => (
                  <tr key={item.family} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-blue-700 font-bold">{item.family}</td>
                    <td className="py-2 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{item.samples.toLocaleString()}</td>
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
                        className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
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
