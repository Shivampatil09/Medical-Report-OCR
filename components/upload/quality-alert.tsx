"use client";

import { OCRQualityReport } from "@/types";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QualityAlertProps {
  report: OCRQualityReport;
  onRetakeOrChange?: () => void;
  onProceedAnyway?: () => void;
}

export function QualityAlert({
  report,
  onRetakeOrChange,
  onProceedAnyway,
}: QualityAlertProps) {
  const hasWarnings = report.warnings.length > 0;

  if (!hasWarnings) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3 text-xs md:text-sm text-emerald-900">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-emerald-900">Optimal Image Quality</p>
          <p className="text-emerald-700 text-xs mt-0.5">
            Prescription image is sharp and well-lit. Tesseract OCR can proceed with high confidence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs md:text-sm text-amber-950 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-900">Image Quality Check Notice</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-800">
              Score: {report.confidenceScore}/100
            </span>
          </div>

          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-amber-800">
            {report.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>

          <p className="mt-2 text-[11px] text-amber-700 italic">
            {report.recommendation}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/80">
        {onRetakeOrChange && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetakeOrChange}
            className="text-xs bg-white hover:bg-amber-100 text-amber-900 border-amber-300"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Upload Clearer Photo
          </Button>
        )}
        {onProceedAnyway && (
          <Button
            type="button"
            size="sm"
            onClick={onProceedAnyway}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            Proceed with OCR Anyway
          </Button>
        )}
      </div>
    </div>
  );
}
