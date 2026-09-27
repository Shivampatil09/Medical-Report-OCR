import { repository } from "@/db/repository";
import { PrescriptionsClient } from "./prescriptions-client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    search?: string;
    important?: string;
  }>;
}

export default async function PrescriptionsPage({ searchParams }: Props) {
  const { search, important } = await searchParams;
  const prescriptions = await repository.getPrescriptions();

  return (
    <PrescriptionsClient
      initialPrescriptions={prescriptions}
      initialSearch={search || ""}
      initialImportant={important === "true"}
    />
  );
}
