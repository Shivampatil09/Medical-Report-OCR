import { repository } from "@/db/repository";
import { ImageUploader } from "@/components/upload/image-uploader";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function UploadPage({ searchParams }: Props) {
  const { patientId } = await searchParams;
  const patients = await repository.getPatients();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Digitize Prescription
            </h1>
            <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Tesseract + Gemini Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload handwritten doctor prescription images. The AI pipeline optimizes, transcribes, structures, and extracts medicines for clinical review.
          </p>
        </div>
      </div>

      <ImageUploader patients={patients} selectedPatientId={patientId} />
    </div>
  );
}
