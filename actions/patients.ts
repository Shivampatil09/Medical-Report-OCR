"use server";

import { repository } from "@/db/repository";
import { Patient } from "@/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const patientSchema = z.object({
  name: z.string().min(2, "Patient name must be at least 2 characters"),
  age: z.coerce.number().min(0, "Age must be valid").max(125, "Age must be realistic"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export async function getPatientsAction(search?: string): Promise<{ success: boolean; data: Patient[]; message: string }> {
  try {
    const list = await repository.getPatients(search);
    return { success: true, data: list, message: "Patients retrieved successfully" };
  } catch (error) {
    return { success: false, data: [], message: error instanceof Error ? error.message : "Failed to load patients" };
  }
}

export async function getPatientAction(id: string): Promise<{ success: boolean; data: Patient | null; message: string }> {
  try {
    const patient = await repository.getPatientById(id);
    if (!patient) {
      return { success: false, data: null, message: "Patient not found" };
    }
    return { success: true, data: patient, message: "Patient loaded" };
  } catch (error) {
    return { success: false, data: null, message: error instanceof Error ? error.message : "Error loading patient" };
  }
}

export async function createPatientAction(data: PatientFormData): Promise<{ success: boolean; data: Patient | null; message: string }> {
  try {
    const validated = patientSchema.parse(data);
    const newPatient = await repository.createPatient(validated);
    revalidatePath("/patients");
    revalidatePath("/dashboard");
    revalidatePath("/upload");
    return { success: true, data: newPatient, message: "Patient created successfully" };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof z.ZodError ? error.errors[0].message : "Failed to create patient",
    };
  }
}

export async function updatePatientAction(id: string, data: Partial<PatientFormData>): Promise<{ success: boolean; data: Patient | null; message: string }> {
  try {
    const updated = await repository.updatePatient(id, data);
    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return { success: true, data: updated, message: "Patient updated successfully" };
  } catch (error) {
    return { success: false, data: null, message: error instanceof Error ? error.message : "Failed to update patient" };
  }
}

export async function deletePatientAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const deleted = await repository.deletePatient(id);
    revalidatePath("/patients");
    revalidatePath("/dashboard");
    return { success: deleted, message: deleted ? "Patient deleted" : "Patient not found" };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete patient" };
  }
}
