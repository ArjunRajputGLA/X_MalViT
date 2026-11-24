"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FileText, Download, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Viva Defense Examination Panel */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Conference Defense & Viva Examination Panel (Top 6 Authoritative Q&A)
          </CardTitle>
          <Badge variant="cyber">Examiner Cheat-Sheet</Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q, idx) => (
              <AccordionItem key={q.id || idx} value={`item-${idx}`} className="border-b border-slate-100 last:border-0 py-1">
                <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 hover:no-underline text-left">
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{q.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 mt-1 mb-2">
                  {q.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Project Artifacts & Manuscripts */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base text-slate-800 flex items-center gap-2 font-bold">
            <FileText className="w-5 h-5 text-blue-600" />
            Official Project Artifacts & Manuscripts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {manuscripts.map((doc, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-slate-50/60 hover:bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 border border-blue-200/60">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-slate-900 leading-snug">{doc.title}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 font-medium">{doc.filename}</div>
                </div>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full mt-4 py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-300 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download / View PDF
                </a>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
