/**
 * ClinicOCR Domain Types
 */

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other" | string;
  phone: string;
  createdAt: string;
  totalPrescriptions?: number;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  isUncertain?: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName?: string;
  imageUrl: string;
  rawOcr: string;
  correctedText: string;
  aiSummary: string;
  medicines: Medicine[];
  importantFindings: string[];
  doctorNotes?: string | null;
  tags: string[];
  important: boolean;
  createdAt: string;
}

export interface OCRQualityReport {
  isBlurry: boolean;
  isLowLight: boolean;
  isTilted: boolean;
  confidenceScore: number;
  confidenceLevel: "Excellent" | "Good" | "Needs Review";
  uncertainWords: string[];
  warnings: string[];
  recommendation?: string;
}

export interface GeminiExtractionResult {
  corrected_text: string;
  summary: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  important_findings: string[];
  tags: string[];
}
