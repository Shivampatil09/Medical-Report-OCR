"use client";

import { useState } from "react";
import { Patient } from "@/types";
import { PatientCard } from "@/components/patients/patient-card";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Users, Loader2 } from "lucide-react";
import { deletePatientAction } from "@/actions/patients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PatientClient({ initialPatients }: { initialPatients: Patient[] }) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  });

  const handleEdit = (p: Patient) => {
    setEditingPatient(p);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient and their prescription records?")) {
      return;
    }
    try {
      const res = await deletePatientAction(id);
      if (res.success) {
        setPatients(patients.filter((p) => p.id !== id));
        toast.success("Patient deleted successfully");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete patient");
      }
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Patient Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your clinic patients, contact details, and their linked medical prescription histories.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingPatient(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Patient</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or phone number..."
          className="pl-9 bg-white"
        />
      </div>

      {/* Grid of Patient Cards */}
      {filteredPatients.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 bg-white">
          <p className="font-semibold text-slate-700">No patients found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? "No results match your search criteria." : "Get started by adding your first patient."}
          </p>
          {!search && (
            <Button
              size="sm"
              onClick={() => {
                setEditingPatient(null);
                setModalOpen(true);
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add First Patient
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Dialog for Add / Edit */}
      <PatientDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        patientToEdit={editingPatient}
        onSuccess={(saved) => {
          if (editingPatient) {
            setPatients(patients.map((p) => (p.id === saved.id ? saved : p)));
          } else {
            setPatients([saved, ...patients]);
          }
          setModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
