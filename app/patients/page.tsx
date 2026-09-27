import { repository } from "@/db/repository";
import { PatientClient } from "./patient-client";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const patients = await repository.getPatients();
  return <PatientClient initialPatients={patients} />;
}
