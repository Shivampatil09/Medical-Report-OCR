"use client";

import { Badge } from "@/components/ui/badge";
import { Pill, HelpCircle } from "lucide-react";

interface MedicineBadgeProps {
  name: string;
  dosage?: string;
  frequency?: string;
  isUncertain?: boolean;
}

export function MedicineBadge({
  name,
  dosage,
  frequency,
  isUncertain,
}: MedicineBadgeProps) {
  const uncertain = isUncertain || name.toLowerCase().startsWith("possibly");

  return (
    <div className="inline-flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-xs">
      <div
        className={`h-7 w-7 rounded-md flex items-center justify-center ${
          uncertain ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
        }`}
      >
        {uncertain ? <HelpCircle className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
      </div>

      <div className="text-left pr-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${uncertain ? "text-amber-900 italic" : "text-slate-900"}`}>
            {name}
          </span>
          {uncertain && (
            <Badge variant="uncertain" className="text-[10px] py-0 px-1.5">
              Review
            </Badge>
          )}
        </div>
        {(dosage || frequency) && (
          <p className="text-[11px] text-slate-500 font-medium">
            {[dosage, frequency].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
}
