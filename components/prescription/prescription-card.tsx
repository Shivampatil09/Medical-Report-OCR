"use client";

import { useState } from "react";
import Link from "next/link";
import { Prescription } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MedicineBadge } from "./medicine-badge";
import { PDFExportButton } from "./pdf-export-button";
import { toggleImportantAction } from "@/actions/prescriptions";
import { 
  Star, 
  Calendar, 
  ArrowRight, 
  FileText, 
  Tag as TagIcon,
  StickyNote,
  Sparkles
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface PrescriptionCardProps {
  prescription: Prescription;
  showPatientName?: boolean;
}

export function PrescriptionCard({
  prescription,
  showPatientName = true,
}: PrescriptionCardProps) {
  const [isImportant, setIsImportant] = useState(prescription.important);
  const [starLoading, setStarLoading] = useState(false);

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setStarLoading(true);
      const res = await toggleImportantAction(prescription.id);
      if (res.success) {
        setIsImportant(res.important);
        toast.success(res.message);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStarLoading(false);
    }
  };

  return (
    <Card className={`border transition-all hover:shadow-md ${isImportant ? "border-amber-300/80 bg-amber-50/15" : "border-slate-200"}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {showPatientName && prescription.patientName && (
                <Link
                  href={`/patients/${prescription.patientId}`}
                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-base"
                >
                  {prescription.patientName}
                </Link>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDate(prescription.createdAt)}</span>
              </div>

              {isImportant && (
                <Badge variant="warning" className="text-[10px] gap-1 font-bold">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-600" />
                  Important
                </Badge>
              )}
            </div>

            {/* AI Summary */}
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
              {prescription.aiSummary}
            </p>

            {/* Medicines List as Smart Badges (Phase 2) */}
            <div className="flex flex-wrap gap-2 mb-3">
              {prescription.medicines.slice(0, 4).map((med, idx) => (
                <MedicineBadge
                  key={idx}
                  name={med.name}
                  dosage={med.dosage}
                  frequency={med.frequency}
                />
              ))}
              {prescription.medicines.length > 4 && (
                <span className="text-xs text-slate-400 self-center">
                  +{prescription.medicines.length - 4} more
                </span>
              )}
            </div>

            {/* Tags (Phase 2) */}
            {prescription.tags && prescription.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <TagIcon className="h-3 w-3 text-slate-400" />
                {prescription.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Star & Actions */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleToggleStar}
              disabled={starLoading}
              title={isImportant ? "Marked as Important" : "Mark as Important"}
              className={`p-2 rounded-lg transition-colors ${
                isImportant
                  ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                  : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
              }`}
            >
              <Star className={`h-4 w-4 ${isImportant ? "fill-amber-500" : ""}`} />
            </button>

            <div className="flex items-center gap-2">
              <PDFExportButton prescription={prescription} />

              <Link
                href={`/prescriptions/${prescription.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-all"
              >
                <span>View Details</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {prescription.doctorNotes && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/50 p-2 rounded-lg">
            <StickyNote className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="line-clamp-1 italic">
              <span className="font-semibold not-italic">Doctor note:</span> {prescription.doctorNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
