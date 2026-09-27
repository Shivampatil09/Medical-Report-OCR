"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface ConfidenceIndicatorProps {
  confidenceScore: number;
  confidenceLevel: "Excellent" | "Good" | "Needs Review";
  uncertainWords?: string[];
}

export function OCRConfidenceIndicator({
  confidenceScore,
  confidenceLevel,
  uncertainWords = [],
}: ConfidenceIndicatorProps) {
  const getBadgeVariant = () => {
    switch (confidenceLevel) {
      case "Excellent":
        return "success";
      case "Good":
        return "default";
      case "Needs Review":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getIcon = () => {
    switch (confidenceLevel) {
      case "Excellent":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "Good":
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case "Needs Review":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <div>
            <span className="text-xs font-semibold text-slate-800">OCR Recognition Confidence:</span>
            <span className="ml-2 text-xs font-bold text-slate-900">{confidenceScore}%</span>
          </div>
        </div>

        <Badge variant={getBadgeVariant()} className="text-[11px] px-2.5 py-0.5 font-bold">
          {confidenceLevel}
        </Badge>
      </div>

      {uncertainWords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium mb-1.5">
            <AlertCircle className="h-3 w-3 text-amber-600" />
            <span>Uncertain words detected during OCR (please verify in review):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {uncertainWords.map((word, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 text-amber-900 border border-amber-200"
              >
                "{word}"
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
