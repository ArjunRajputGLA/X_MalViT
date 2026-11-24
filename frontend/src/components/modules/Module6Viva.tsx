"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FileText, Download, ShieldCheck, HelpCircle } from "lucide-react";

export const Module6Viva: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [manuscripts, setManuscripts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/viva")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setManuscripts(data.manuscripts || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Viva Defense Examination Panel */}
      <Card className="border-sky-500/20 bg-slate-900/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-sky-400 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            Conference Defense & Viva Examination Panel (Top 6 Authoritative Q&A)
          </CardTitle>
          <Badge variant="cyber">Examiner Cheat-Sheet</Badge>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q, idx) => (
              <AccordionItem key={q.id || idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-200">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>{q.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-b-lg border-t border-slate-800/80">
                  {q.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Project Artifacts & Manuscripts */}
      <Card className="border-sky-500/20 bg-slate-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-sky-400 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Official Project Artifacts & Manuscripts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {manuscripts.map((doc, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-2 border border-sky-500/30">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-white leading-snug">{doc.title}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">{doc.filename}</div>
                </div>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full mt-4 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-sky-500/20 hover:border-sky-400 border border-slate-700 text-sky-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download / View PDF
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
