import { notFound } from "next/navigation";
import { repository } from "@/db/repository";
import { PrescriptionDetailClient } from "./prescription-detail-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionDetailPage({ params }: Props) {
  const { id } = await params;
  const prescription = await repository.getPrescriptionById(id);

  if (!prescription) {
    notFound();
  }

  const patient = await repository.getPatientById(prescription.patientId);

  return (
    <PrescriptionDetailClient
      prescription={prescription}
      patient={patient}
    />
  );
}
