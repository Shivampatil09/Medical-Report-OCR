"use client";

import { useState } from "react";
import { Prescription, Patient } from "@/types";
import { MedicineBadge } from "@/components/prescription/medicine-badge";
import { PDFExportButton } from "@/components/prescription/pdf-export-button";
import { toggleImportantAction, updateDoctorNotesAction } from "@/actions/prescriptions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  User, 
  FileText, 
  Sparkles, 
  Pill, 
  Eye, 
  CheckCircle2, 
  StickyNote,
  Tag as TagIcon,
  Save,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface PrescriptionDetailClientProps {
  prescription: Prescription;
  patient: Patient | null;
}

export function PrescriptionDetailClient({
  prescription: initialPrescription,
  patient,
}: PrescriptionDetailClientProps) {
  const [prescription, setPrescription] = useState<Prescription>(initialPrescription);
  const [isImportant, setIsImportant] = useState(initialPrescription.important);
  const [doctorNotes, setDoctorNotes] = useState(initialPrescription.doctorNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

  // Toggle Important Star
  const handleToggleStar = async () => {
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

  // Save Doctor Notes
  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const res = await updateDoctorNotesAction(prescription.id, doctorNotes);
      if (res.success) {
        toast.success("Doctor notes updated successfully");
      } else {
        toast.error("Failed to update notes");
      }
    } catch {
      toast.error("Failed to update notes");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back and Actions Nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/prescriptions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Prescriptions</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Star Toggle */}
          <button
            type="button"
            onClick={handleToggleStar}
            disabled={starLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isImportant
                ? "bg-amber-100 border-amber-300 text-amber-900"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${isImportant ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
            <span>{isImportant ? "Starred ⭐" : "Mark as Important"}</span>
          </button>

          {/* PDF Download Button */}
          <PDFExportButton prescription={prescription} patient={patient} />
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Digitized Prescription Record
            </span>
            {isImportant && (
              <Badge variant="warning" className="text-[10px] gap-1 font-bold">
                <Star className="h-2.5 w-2.5 fill-amber-500" />
                Important
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {patient ? (
              <Link href={`/patients/${patient.id}`} className="hover:text-blue-600 transition-colors">
                {patient.name}
              </Link>
            ) : (
              prescription.patientName || "Patient Record"
            )}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
            {patient && <span>{patient.age} Yrs &bull; {patient.gender} &bull; {patient.phone}</span>}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              Prescription Date: {formatDate(prescription.createdAt)}
            </span>
            <span className="font-mono text-slate-400">ID: {prescription.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* Tags */}
        {prescription.tags && prescription.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <TagIcon className="h-3.5 w-3.5 text-slate-400" />
            {prescription.tags.map((tag, idx) => (
              <Badge key={idx} variant="default" className="text-xs font-semibold">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Left = Original & Raw OCR, Right = AI Summary, Medicines, Corrected Text, Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Original Prescription Image & Raw OCR */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-600" />
                Original Prescription Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-[3/4] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prescription.imageUrl}
                  alt="Original Prescription"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stage 1: Raw OCR Output per PRD */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Stage 1: Raw Tesseract OCR Output
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">Unmodified</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed border border-slate-800">
                {prescription.rawOcr}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Structured Clinical Intelligence */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Clinical Summary */}
          <Card className="border-teal-200 bg-teal-50/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5 text-teal-900">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  AI Clinical Summary
                </CardTitle>
                <Badge variant="success" className="text-[10px]">Gemini Refined</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-800 leading-relaxed font-normal">
                {prescription.aiSummary}
              </p>
            </CardContent>
          </Card>

          {/* Structured Medicines Section */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-900">
                  <Pill className="h-4 w-4 text-blue-600" />
                  Structured Medications ({prescription.medicines.length})
                </CardTitle>
                <span className="text-xs text-slate-400">Verified by Doctor</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prescription.medicines.map((med, idx) => (
                  <MedicineBadge
                    key={idx}
                    name={med.name}
                    dosage={med.dosage}
                    frequency={med.frequency}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Corrected Clinical Record */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5 text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Corrected Transcription &amp; Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 font-mono text-xs md:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {prescription.correctedText}
              </div>
            </CardContent>
          </Card>

          {/* Doctor Personal Notes (Phase 2) */}
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5 text-amber-900">
                  <StickyNote className="h-4 w-4 text-amber-600" />
                  Doctor Clinical Notes (Phase 2)
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {savingNotes ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                  Save Notes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={3}
                placeholder="Add doctor observation, follow-up instructions, or patient precautions..."
                className="w-full text-xs md:text-sm p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 resize-none leading-relaxed"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
