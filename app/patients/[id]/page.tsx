import { notFound } from "next/navigation";
import { repository } from "@/db/repository";
import { PrescriptionCard } from "@/components/prescription/prescription-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  User, 
  Phone, 
  Calendar, 
  UploadCloud, 
  ArrowLeft, 
  FileText,
  Star,
  Activity
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  const [patient, prescriptions] = await Promise.all([
    repository.getPatientById(id),
    repository.getPrescriptions({ patientId: id }),
  ]);

  if (!patient) {
    notFound();
  }

  const starredCount = prescriptions.filter((p) => p.important).length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Patient Directory</span>
      </Link>

      {/* Patient Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <Badge variant="secondary" className="text-xs">
                {patient.gender}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
              <span>{patient.age} Years Old</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {patient.phone}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                Registered: {formatDate(patient.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/upload?patientId=${patient.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-xs">
              <UploadCloud className="h-4 w-4" />
              <span>Scan Prescription for {patient.name.split(" ")[0]}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Prescriptions</p>
              <p className="text-xl font-bold text-slate-900">{prescriptions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Important Records</p>
              <p className="text-xl font-bold text-slate-900">{starredCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 col-span-2 md:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Status</p>
              <p className="text-sm font-bold text-emerald-600 mt-1">Active Patient</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescription History Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Prescription History ({prescriptions.length})
          </h2>
          <span className="text-xs text-slate-400">
            Important prescriptions pinned to top
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 bg-white">
            <p className="font-semibold text-slate-700">No prescription history yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Upload a prescription image to digitize this patient's medical history.
            </p>
            <Link href={`/upload?patientId=${patient.id}`} className="mt-4 inline-block">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Upload Prescription
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                showPatientName={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
