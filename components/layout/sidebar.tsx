"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UploadCloud, 
  Users, 
  FileText, 
  Activity, 
  Sparkles,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Upload Prescription",
    href: "/upload",
    icon: UploadCloud,
    badge: "AI OCR",
  },
  {
    label: "Patients Directory",
    href: "/patients",
    icon: Users,
  },
  {
    label: "All Prescriptions",
    href: "/prescriptions",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-lg tracking-tight">ClinicOCR</span>
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">v2.0</span>
          </div>
          <p className="text-xs text-slate-500">Medical Document AI</p>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Sparkles className="h-2.5 w-2.5" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Status / Clinic Info Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">Gemini &amp; OCR Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          Tesseract preprocessed recognition with Google Gemini Flash refinement.
        </p>
        <Link
          href="/upload"
          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors shadow-xs"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Scan Prescription
        </Link>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
          DR
        </div>
        <div className="text-xs truncate">
          <p className="font-semibold text-slate-800">Dr. Rajesh Varma</p>
          <p className="text-slate-400 text-[11px]">General Physician</p>
        </div>
      </div>
    </aside>
  );
}
