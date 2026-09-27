"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, UploadCloud, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientDialog } from "@/components/patients/patient-dialog";

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/prescriptions?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/prescriptions");
    }
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Search Bar - Multi-attribute per PRD Phase 2 */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient, phone, medicine (e.g. Paracetamol), date..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPatientModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4 text-slate-600" />
            <span>Add Patient</span>
          </Button>

          <Button
            size="sm"
            onClick={() => router.push("/upload")}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Prescription</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>
      </header>

      {/* Quick Add Patient Modal */}
      <PatientDialog
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
        onSuccess={() => {
          setPatientModalOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
