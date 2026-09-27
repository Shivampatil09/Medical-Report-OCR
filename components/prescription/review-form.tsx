"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Medicine, GeminiExtractionResult, OCRQualityReport } from "@/types";
import { savePrescriptionAction } from "@/actions/prescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OCRConfidenceIndicator } from "@/components/upload/confidence-indicator";
import { 
  Save, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle, 
  Eye, 
  FileText, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Pill,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  patientId: string;
  patientName: string;
  imageUrl: string;
  rawOcr: string;
  initialAiResult: GeminiExtractionResult;
  qualityReport?: OCRQualityReport | null;
}

export function ReviewForm({
  patientId,
  patientName,
  imageUrl,
  rawOcr,
  initialAiResult,
  qualityReport,
}: ReviewFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Review states (editable by doctor per PRD)
  const [summary, setSummary] = useState(initialAiResult.summary || "");
  const [correctedText, setCorrectedText] = useState(initialAiResult.corrected_text || rawOcr);
  const [medicines, setMedicines] = useState<Medicine[]>(
    initialAiResult.medicines.map((m) => ({
      name: m.name,
      dosage: m.dosage || "",
      frequency: m.frequency || "",
      isUncertain: m.name.toLowerCase().startsWith("possibly"),
    }))
  );
  const [findings, setFindings] = useState<string[]>(initialAiResult.important_findings || []);
  const [tags, setTags] = useState<string[]>(initialAiResult.tags || ["General"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  // Add medicine row
  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "OD" }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "name") {
      updated[index].isUncertain = value.toLowerCase().startsWith("possibly");
    }
    setMedicines(updated);
  };

  // Add tag
  const addTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save Record
  const handleSave = async () => {
    if (medicines.some((m) => !m.name.trim())) {
      toast.error("Please fill in or remove incomplete medicine entries.");
      return;
    }

    try {
      setSaving(true);
      const res = await savePrescriptionAction({
        patientId,
        imageUrl,
        rawOcr,
        correctedText,
        aiSummary: summary,
        medicines,
        importantFindings: findings,
        doctorNotes: doctorNotes || null,
        tags,
        important: isImportant,
      });

      if (res.success && res.data) {
        toast.success("Prescription verified and saved successfully!");
        router.push(`/prescriptions/${res.data.id}`);
      } else {
        toast.error(res.message || "Failed to save prescription");
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Authority reminder */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs md:text-sm">
        <div className="flex items-center gap-2.5 text-blue-950 font-medium">
          <Stethoscope className="h-5 w-5 text-blue-600 shrink-0" />
          <span>
            Doctor Verification Stage for <b>{patientName}</b>. Review and adjust AI-extracted data.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportant(!isImportant)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isImportant
                ? "bg-amber-100 border-amber-300 text-amber-900"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${isImportant ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
            <span>{isImportant ? "Marked Important ⭐" : "Mark as Important"}</span>
          </button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save &amp; Archive Record
          </Button>
        </div>
      </div>

      {qualityReport && (
        <OCRConfidenceIndicator
          confidenceScore={qualityReport.confidenceScore}
          confidenceLevel={qualityReport.confidenceLevel}
          uncertainWords={qualityReport.uncertainWords}
        />
      )}

      {/* Grid: Left = Original & Raw OCR, Right = AI Output & Doctor Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Original Prescription Image & Raw OCR */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-blue-600" />
              Original Uploaded Prescription
            </h4>
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-[3/4] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Prescription preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Raw OCR Display per PRD: Doctors should always be able to view original OCR output */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-slate-500" />
                Raw Tesseract OCR Output (Unmodified)
              </h4>
              <Badge variant="outline" className="text-[10px]">Stage 1</Badge>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
              {rawOcr}
            </pre>
          </div>
        </div>

        {/* Right Column: Doctor Review & AI Structured Data */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Clinical Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-600" />
                AI Clinical Summary (Editable)
              </label>
              <span className="text-[11px] text-slate-400">Gemini Flash Refined</span>
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full text-xs md:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 leading-relaxed resize-none"
              placeholder="Clinical summary..."
            />
          </div>

          {/* Extracted Medicines Table (Doctor Editable) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Prescribed Medications</h4>
                <Badge variant="default" className="text-[10px]">{medicines.length} Items</Badge>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedicine}
                className="text-xs gap-1 border-dashed"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Medication
              </Button>
            </div>

            <div className="space-y-2.5">
              {medicines.map((med, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-colors ${
                    med.isUncertain
                      ? "border-amber-300 bg-amber-50/40"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-5">
                      <label className="text-[10px] font-semibold text-slate-500">Medicine Name</label>
                      <Input
                        value={med.name}
                        onChange={(e) => updateMedicine(index, "name", e.target.value)}
                        placeholder="e.g. Tab. Augmentin 625mg"
                        className="h-8 text-xs bg-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-semibold text-slate-500">Dosage</label>
                      <Input
                        value={med.dosage || ""}
                        onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                        placeholder="e.g. 625mg / 5ml"
                        className="h-8 text-xs bg-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-semibold text-slate-500">Frequency / Timing</label>
                      <Input
                        value={med.frequency || ""}
                        onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                        placeholder="1-0-1 / SOS"
                        className="h-8 text-xs bg-white"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end justify-center pt-3 md:pt-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedicine(index)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        title="Delete medicine"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {med.isUncertain && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-700">
                      <HelpCircle className="h-3 w-3" />
                      <span>Uncertain handwritten text — please confirm drug name with prescription</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Corrected Text (Editable) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />
              Full Corrected Clinical Record (Doctor Review)
            </label>
            <textarea
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              rows={5}
              className="w-full text-xs md:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 leading-relaxed"
              placeholder="Corrected transcription..."
            />
          </div>

          {/* Tags & Doctor Personal Notes (Phase 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tags */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescription Tags
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 pt-1">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag (e.g. Fever)"
                  className="h-8 text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={addTag} className="h-8 text-xs">
                  Add
                </Button>
              </div>
            </div>

            {/* Doctor Personal Notes (Phase 2) */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Doctor Notes (Phase 2)
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400 resize-none"
                placeholder="e.g. Follow-up after 5 days, observe fever, increase hydration..."
              />
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Save Structured Record to Patient History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
