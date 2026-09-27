"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { Prescription, Patient } from "@/types";
import { toast } from "sonner";

interface PDFExportButtonProps {
  prescription: Prescription;
  patient?: Patient | null;
}

export function PDFExportButton({ prescription, patient }: PDFExportButtonProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setGenerating(true);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const primaryColor = "#0284c7"; // Clinical Blue
      const darkColor = "#1e293b";
      const grayColor = "#64748b";

      // 1. Header Banner
      doc.setFillColor(240, 249, 255);
      doc.roundedRect(14, 12, 182, 28, 3, 3, "F");

      doc.setTextColor(primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("METRO CARE CLINIC — CLINICAL PRESCRIPTION RECORD", 20, 22);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(grayColor);
      doc.text("ClinicOCR Digitized Document Intelligence Archive • Official Clinical Copy", 20, 29);
      doc.text(`Record ID: ${prescription.id} • Digitized: ${new Date(prescription.createdAt).toLocaleDateString()}`, 20, 35);

      // 2. Patient Demographics Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 44, 182, 20, 2, 2, "FD");

      doc.setTextColor(darkColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Patient: ${patient?.name || prescription.patientName || "Patient"}`, 20, 52);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Age/Gender: ${patient ? `${patient.age} Yrs / ${patient.gender}` : "N/A"}`, 20, 59);
      doc.text(`Phone: ${patient?.phone || "N/A"}`, 110, 59);

      let currentY = 72;

      // 3. AI Clinical Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor);
      doc.text("CLINICAL SUMMARY & FINDINGS", 14, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      const summaryLines = doc.splitTextToSize(prescription.aiSummary || "No summary recorded.", 182);
      doc.text(summaryLines, 14, currentY);
      currentY += summaryLines.length * 5 + 6;

      // 4. Structured Medications Table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor);
      doc.text("PRESCRIBED MEDICATIONS", 14, currentY);
      currentY += 5;

      // Table Header
      doc.setFillColor(238, 242, 246);
      doc.rect(14, currentY, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(darkColor);
      doc.text("#", 17, currentY + 5.5);
      doc.text("Medicine Name", 25, currentY + 5.5);
      doc.text("Dosage", 95, currentY + 5.5);
      doc.text("Frequency", 135, currentY + 5.5);
      currentY += 9;

      // Table Rows
      doc.setFont("helvetica", "normal");
      prescription.medicines.forEach((med, index) => {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(9);
        doc.setTextColor(darkColor);
        doc.text(`${index + 1}.`, 17, currentY + 4);
        doc.text(med.name, 25, currentY + 4);
        doc.text(med.dosage || "—", 95, currentY + 4);
        doc.text(med.frequency || "—", 135, currentY + 4);

        doc.setDrawColor(241, 245, 249);
        doc.line(14, currentY + 6.5, 196, currentY + 6.5);
        currentY += 7.5;
      });

      currentY += 6;

      // 5. Corrected Full Prescription Record
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor);
      doc.text("FULL CORRECTED RECORD & INSTRUCTIONS", 14, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(darkColor);
      const correctedLines = doc.splitTextToSize(prescription.correctedText || "", 182);
      doc.text(correctedLines, 14, currentY);
      currentY += correctedLines.length * 4.5 + 8;

      // 6. Doctor Notes (if any)
      if (prescription.doctorNotes) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor("#d97706"); // Amber
        doc.text("DOCTOR CLINICAL NOTES:", 14, currentY);
        currentY += 5;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(darkColor);
        const noteLines = doc.splitTextToSize(prescription.doctorNotes, 182);
        doc.text(noteLines, 14, currentY);
        currentY += noteLines.length * 4.5 + 8;
      }

      // 7. Footer & Stamp
      if (currentY > 250) {
        doc.addPage();
        currentY = 30;
      }
      currentY = Math.max(currentY + 10, 260);

      doc.setDrawColor(203, 213, 225);
      doc.line(14, currentY, 196, currentY);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(grayColor);
      doc.text("Digitized with ClinicOCR. Doctor verification confirmed prior to archival.", 14, currentY + 6);
      doc.text("Authorized Medical Practitioner Signature", 135, currentY + 6);

      // Save file
      const safePatientName = (patient?.name || prescription.patientName || "Prescription").replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`ClinicOCR_Prescription_${safePatientName}_${prescription.id.slice(0, 8)}.pdf`);

      toast.success("Prescription PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to generate PDF: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      disabled={generating}
      className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      ) : (
        <Download className="h-4 w-4 text-blue-600" />
      )}
      <span>Export PDF</span>
    </Button>
  );
}
