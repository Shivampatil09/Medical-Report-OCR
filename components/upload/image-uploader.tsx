"use client";

import { useState, useRef, useEffect } from "react";
import { Patient, GeminiExtractionResult, OCRQualityReport } from "@/types";
import { preprocessImageClient } from "@/lib/ocr/preprocess";
import { performTesseractOCR } from "@/lib/ocr/tesseract";
import { analyzeImageQuality } from "@/lib/ocr/quality-check";
import { QualityAlert } from "./quality-alert";
import { ReviewForm } from "@/components/prescription/review-form";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UploadCloud, 
  FileImage, 
  Sparkles, 
  Cpu, 
  Loader2, 
  CheckCircle2, 
  UserPlus, 
  RefreshCw,
  FileCheck,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface ImageUploaderProps {
  patients: Patient[];
  selectedPatientId?: string;
}

export function ImageUploader({
  patients: initialPatients,
  selectedPatientId: initialSelectedPatientId,
}: ImageUploaderProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialSelectedPatientId || (initialPatients[0]?.id ?? "")
  );
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false);

  // File & Preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stage tracking: 'idle' | 'quality_check' | 'processing' | 'review'
  const [pipelineStage, setPipelineStage] = useState<"idle" | "quality_check" | "processing" | "review">("idle");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  // Quality & OCR Results
  const [qualityReport, setQualityReport] = useState<OCRQualityReport | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string>("");
  const [geminiResult, setGeminiResult] = useState<GeminiExtractionResult | null>(null);

  // Sample Prescriptions for Instant Testing
  const SAMPLE_PRESETS = [
    {
      title: "Sample 1: Respiratory (Augmentin & Dolo)",
      url: "/samples/prescription-sample-1.svg",
    },
    {
      title: "Sample 2: Chronic (Hypertension & Diabetes)",
      url: "/samples/prescription-sample-2.svg",
    },
    {
      title: "Sample 3: Pediatric (Calpol & Levolin)",
      url: "/samples/prescription-sample-3.svg",
    },
  ];

  // Handle file selection
  const handleFileChange = async (file: File) => {
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Unsupported file format. Please upload JPG or PNG.");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewUrl(url);

    // Run Smart Image Quality Check (Phase 2)
    setProcessingStatus("Evaluating image quality (blur, lighting, orientation)...");
    const report = await analyzeImageQuality(file);
    setQualityReport(report);
    setPipelineStage("quality_check");
  };

  const handleSelectSample = async (sampleUrl: string) => {
    setPreviewUrl(sampleUrl);
    setProcessingStatus("Evaluating sample image quality...");
    const report = await analyzeImageQuality(sampleUrl);
    setQualityReport(report);
    setPipelineStage("quality_check");
  };

  // Run OCR & AI Pipeline
  const runExtractionPipeline = async () => {
    if (!previewUrl) return;
    if (!selectedPatientId) {
      toast.error("Please select a patient before analyzing the prescription.");
      return;
    }

    try {
      setPipelineStage("processing");

      // 1. Image Preprocessing
      setProcessingStatus("Optimizing image: adaptive contrast & binarization...");
      setProcessingProgress(15);
      const preprocessed = await preprocessImageClient(previewUrl);

      // 2. Tesseract OCR (Raw text extraction)
      setProcessingStatus("Stage 1: Running Tesseract OCR engine...");
      setProcessingProgress(30);

      const ocrResult = await performTesseractOCR(preprocessed.processedDataUrl, (p) => {
        setProcessingProgress(30 + Math.round((p.progress * 0.4)));
        setProcessingStatus(`Tesseract OCR: ${p.status} (${p.progress}%)`);
      });

      setRawOcrText(ocrResult.text);

      // Update quality report with uncertain words from OCR
      if (qualityReport) {
        setQualityReport({
          ...qualityReport,
          confidenceScore: ocrResult.confidence,
          uncertainWords: ocrResult.uncertainWords,
        });
      }

      // 3. Google Gemini Flash Refinement
      setProcessingStatus("Stage 2: Gemini Flash correcting OCR & extracting medications...");
      setProcessingProgress(75);

      const aiResponse = await apiClient<GeminiExtractionResult>("/api/gemini", {
        method: "POST",
        body: JSON.stringify({ rawOcr: ocrResult.text }),
      });

      setGeminiResult(aiResponse);
      setProcessingProgress(100);
      setPipelineStage("review");
      toast.success("AI extraction completed! Please review and verify.");
    } catch (error) {
      toast.error("Pipeline error: " + (error instanceof Error ? error.message : "Error"));
      setPipelineStage("quality_check");
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // If in review stage, render ReviewForm
  if (pipelineStage === "review" && geminiResult && previewUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPipelineStage("quality_check")}
            className="text-xs"
          >
            &larr; Back to Image Review
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">Stage 3: Doctor Review</Badge>
          </div>
        </div>

        <ReviewForm
          patientId={selectedPatientId}
          patientName={selectedPatient?.name || "Patient"}
          imageUrl={previewUrl}
          rawOcr={rawOcrText}
          initialAiResult={geminiResult}
          qualityReport={qualityReport}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step 1: Patient Selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Stethoscope className="h-4 w-4 text-blue-600" />
            1. Select Patient for Prescription
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setNewPatientModalOpen(true)}
            className="text-xs gap-1 border-dashed"
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-600" />
            New Patient
          </Button>
        </div>

        {patients.length > 0 ? (
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full h-11 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.age} Yrs ({p.gender}) • {p.phone}
              </option>
            ))}
          </select>
        ) : (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
            <span>No patients registered yet. Please create a patient record first.</span>
            <Button size="sm" onClick={() => setNewPatientModalOpen(true)}>
              Add Patient
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: Image Upload / Dropzone */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <UploadCloud className="h-4 w-4 text-blue-600" />
          2. Upload Prescription Image (JPG, PNG)
        </h4>

        {/* Hidden Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />

        {/* Dropzone Container */}
        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20 rounded-xl p-8 text-center cursor-pointer transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-800 text-sm">
              Click to select or drag &amp; drop prescription photo
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports handwritten Rx in JPG, JPEG, PNG format
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-96 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected Prescription"
                className="max-h-88 object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Change Image
              </Button>

              {pipelineStage === "quality_check" && (
                <Button
                  onClick={runExtractionPipeline}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-sm"
                >
                  <Cpu className="h-4 w-4" />
                  Analyze with Tesseract &amp; Gemini AI
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Phase 2: Preset Samples for Quick Testing */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2">
            Or test instantly with clinic prescription samples:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {SAMPLE_PRESETS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.url)}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 text-xs font-medium text-slate-700 transition-all flex items-center gap-2"
              >
                <FileImage className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="truncate">{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: Phase 2 Quality Check Feedback */}
      {pipelineStage === "quality_check" && qualityReport && (
        <QualityAlert
          report={qualityReport}
          onRetakeOrChange={() => fileInputRef.current?.click()}
          onProceedAnyway={runExtractionPipeline}
        />
      )}

      {/* Step 4: Live Processing Progress Indicator */}
      {pipelineStage === "processing" && (
        <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  {processingStatus}
                </p>
                <p className="text-xs text-slate-500">
                  Target speed: digitized in &lt; 15 seconds
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">{processingProgress}%</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-teal-500 h-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 text-center text-[11px] text-slate-500 pt-1">
            <span className={processingProgress >= 20 ? "text-blue-600 font-semibold" : ""}>
              1. Preprocessing
            </span>
            <span className={processingProgress >= 50 ? "text-blue-600 font-semibold" : ""}>
              2. Tesseract OCR
            </span>
            <span className={processingProgress >= 80 ? "text-teal-600 font-semibold" : ""}>
              3. Gemini Flash AI
            </span>
          </div>
        </div>
      )}

      {/* Quick Add Patient Modal */}
      <PatientDialog
        open={newPatientModalOpen}
        onOpenChange={setNewPatientModalOpen}
        onSuccess={(created) => {
          setPatients([created, ...patients]);
          setSelectedPatientId(created.id);
          setNewPatientModalOpen(false);
        }}
      />
    </div>
  );
}
