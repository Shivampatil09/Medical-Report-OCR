import { repository } from "@/db/repository";
import { StatsWidgets } from "@/components/dashboard/stats-widgets";
import { PrescriptionCard } from "@/components/prescription/prescription-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  UploadCloud, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  FileCheck,
  Stethoscope
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [patients, prescriptions] = await Promise.all([
    repository.getPatients(),
    repository.getPrescriptions(),
  ]);

  const importantCount = prescriptions.filter((p) => p.important).length;
  const recentPrescriptions = prescriptions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 text-white p-6 md:p-8 shadow-lg shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
            <span>AI Prescription Digitization Platform</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Clinic Overview &amp; Records
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl leading-relaxed">
            Convert handwritten doctor prescriptions into structured, searchable digital records using Tesseract OCR and Google Gemini Flash.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/upload">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md">
              <UploadCloud className="h-4 w-4 mr-2" />
              Quick Scan Prescription
            </Button>
          </Link>
          <Link href="/patients">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/40 font-semibold shadow-xs backdrop-blur-xs"
            >
              <Users className="h-4 w-4 mr-2" />
              View Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Widgets */}
      <StatsWidgets
        totalPatients={patients.length}
        totalPrescriptions={prescriptions.length}
        importantCount={importantCount}
      />

      {/* Main Grid: Recent Prescriptions & Clinic Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Uploads Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-lg">Recent Digitized Prescriptions</h2>
            </div>
            <Link
              href="/prescriptions"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All ({prescriptions.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentPrescriptions.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-slate-300 bg-white">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-800">No prescriptions digitized yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Scan or upload your first handwritten prescription image to start building your clinic archive.
              </p>
              <Link href="/upload" className="mt-4 inline-block">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Upload First Prescription
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((p) => (
                <PrescriptionCard key={p.id} prescription={p} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Active Patients & Quick Info */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-600" />
                  Recent Patients
                </CardTitle>
                <Link
                  href="/patients"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.slice(0, 4).map((pt) => (
                <Link
                  key={pt.id}
                  href={`/patients/${pt.id}`}
                  className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 flex items-center justify-between transition-colors block"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{pt.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {pt.age} Yrs &bull; {pt.gender} &bull; {pt.phone}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* AI Saas Guarantee Card */}
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-teal-50/40 p-5">
            <div className="flex items-center gap-2 mb-2 text-blue-900 font-semibold text-sm">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              Doctor Control Guarantee
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ClinicOCR keeps you in complete control. Nothing is committed to your Neon PostgreSQL database without explicit doctor verification and review.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
