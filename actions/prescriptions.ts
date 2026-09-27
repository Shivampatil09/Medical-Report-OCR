"use server";

import { repository } from "@/db/repository";
import { Prescription, Medicine } from "@/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const savePrescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  imageUrl: z.string().min(1, "Prescription image is required"),
  rawOcr: z.string().min(1, "Raw OCR content cannot be empty"),
  correctedText: z.string().min(1, "Corrected text cannot be empty"),
  aiSummary: z.string().min(1, "Summary cannot be empty"),
  medicines: z.array(
    z.object({
      name: z.string().min(1, "Medicine name is required"),
      dosage: z.string().default(""),
      frequency: z.string().default(""),
      duration: z.string().optional(),
      instructions: z.string().optional(),
    })
  ),
  importantFindings: z.array(z.string()).default([]),
  doctorNotes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  important: z.boolean().default(false),
});

export type SavePrescriptionInput = z.infer<typeof savePrescriptionSchema>;

export async function getPrescriptionsAction(filters?: {
  patientId?: string;
  search?: string;
  importantOnly?: boolean;
  medicineSearch?: string;
}): Promise<{ success: boolean; data: Prescription[]; message: string }> {
  try {
    const list = await repository.getPrescriptions(filters);
    return { success: true, data: list, message: "Prescriptions loaded" };
  } catch (error) {
    return { success: false, data: [], message: error instanceof Error ? error.message : "Failed to load prescriptions" };
  }
}

export async function getPrescriptionAction(id: string): Promise<{ success: boolean; data: Prescription | null; message: string }> {
  try {
    const item = await repository.getPrescriptionById(id);
    if (!item) {
      return { success: false, data: null, message: "Prescription not found" };
    }
    return { success: true, data: item, message: "Prescription loaded" };
  } catch (error) {
    return { success: false, data: null, message: error instanceof Error ? error.message : "Error loading prescription" };
  }
}

export async function savePrescriptionAction(
  data: SavePrescriptionInput
): Promise<{ success: boolean; data: Prescription | null; message: string }> {
  try {
    const validated = savePrescriptionSchema.parse(data);
    const saved = await repository.createPrescription({
      patientId: validated.patientId,
      imageUrl: validated.imageUrl,
      rawOcr: validated.rawOcr,
      correctedText: validated.correctedText,
      aiSummary: validated.aiSummary,
      medicines: validated.medicines as Medicine[],
      importantFindings: validated.importantFindings,
      doctorNotes: validated.doctorNotes,
      tags: validated.tags,
      important: validated.important,
    });

    revalidatePath("/dashboard");
    revalidatePath("/prescriptions");
    revalidatePath(`/patients/${validated.patientId}`);
    return { success: true, data: saved, message: "Prescription saved successfully!" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof z.ZodError ? error.errors[0].message : "Failed to save prescription",
    };
  }
}

export async function toggleImportantAction(id: string): Promise<{ success: boolean; important: boolean; message: string }> {
  try {
    const state = await repository.toggleImportant(id);
    revalidatePath("/dashboard");
    revalidatePath("/prescriptions");
    return { success: true, important: state, message: state ? "Marked as Important ⭐" : "Unmarked" };
  } catch (error) {
    return { success: false, important: false, message: error instanceof Error ? error.message : "Failed to update star" };
  }
}

export async function updateDoctorNotesAction(id: string, notes: string): Promise<{ success: boolean; message: string }> {
  try {
    await repository.updateDoctorNotes(id, notes);
    revalidatePath(`/prescriptions/${id}`);
    return { success: true, message: "Doctor notes updated successfully" };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update notes" };
  }
}

export async function deletePrescriptionAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const deleted = await repository.deletePrescription(id);
    revalidatePath("/dashboard");
    revalidatePath("/prescriptions");
    return { success: deleted, message: deleted ? "Prescription deleted" : "Prescription not found" };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete prescription" };
  }
}
