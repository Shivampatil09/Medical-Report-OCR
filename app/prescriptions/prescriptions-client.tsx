"use client";

import { useState } from "react";
import { Prescription } from "@/types";
import { PrescriptionCard } from "@/components/prescription/prescription-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Star, 
  FileText, 
  UploadCloud, 
  Calendar,
  Pill,
  X
} from "lucide-react";
import Link from "next/link";

interface PrescriptionsClientProps {
  initialPrescriptions: Prescription[];
  initialSearch?: string;
  initialImportant?: boolean;
}

export function PrescriptionsClient({
  initialPrescriptions,
  initialSearch = "",
  initialImportant = false,
}: PrescriptionsClientProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [importantOnly, setImportantOnly] = useState(initialImportant);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(initialPrescriptions.flatMap((p) => p.tags || []))
  );

  // Filter prescriptions
  const filtered = initialPrescriptions.filter((p) => {
    // 1. Important filter
    if (importantOnly && !p.important) return false;

    // 2. Tag filter
    if (selectedTag && !p.tags.includes(selectedTag)) return false;

    // 3. Multi-field search per Phase 2:
    // Search prescriptions by: Patient Name, Phone Number, Medicine Name, Prescription Date
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchPatient = p.patientName?.toLowerCase().includes(q);
      const matchMedicine = p.medicines.some((m) => m.name.toLowerCase().includes(q));
      const matchSummary = p.aiSummary.toLowerCase().includes(q);
      const matchDate = new Date(p.createdAt).toLocaleDateString().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      return matchPatient || matchMedicine || matchSummary || matchDate || matchTag;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Prescriptions Archive
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable patient prescription intelligence directory with OCR transcriptions and structured medications.
          </p>
        </div>

        <Link href="/upload">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-xs">
            <UploadCloud className="h-4 w-4" />
            <span>Scan New Prescription</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Multi-attribute search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Patient Name, Phone, Medicine (e.g. Augmentin, Dolo), or Date..."
              className="pl-9 bg-slate-50 border-slate-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Important ⭐ Toggle Button */}
          <Button
            type="button"
            variant={importantOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setImportantOnly(!importantOnly)}
            className={`gap-1.5 shrink-0 ${
              importantOnly
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "border-slate-300 text-slate-700"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${importantOnly ? "fill-white" : "text-amber-500"}`} />
            <span>Starred Only</span>
          </Button>
        </div>

        {/* Prescription Tags Filter Bar (Phase 2) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
              Filter by Tag:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                selectedTag === null
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <b>{filtered.length}</b> prescription{filtered.length === 1 ? "" : "s"}
        </span>
        {(search || selectedTag || importantOnly) && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedTag(null);
              setImportantOnly(false);
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Prescription Cards List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 bg-white">
          <p className="font-semibold text-slate-700">No matching prescriptions found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query, medicine name, or tag filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  );
}
