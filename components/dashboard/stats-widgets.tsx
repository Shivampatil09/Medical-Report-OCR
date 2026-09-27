"use client";

import { Users, FileText, UploadCloud, TrendingUp, Sparkles, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface StatsWidgetsProps {
  totalPatients: number;
  totalPrescriptions: number;
  importantCount: number;
}

export function StatsWidgets({
  totalPatients,
  totalPrescriptions,
  importantCount,
}: StatsWidgetsProps) {
  const stats = [
    {
      title: "Total Patients",
      value: totalPatients,
      subtitle: "Active clinic patients",
      icon: Users,
      color: "from-blue-600 to-blue-500",
      iconBg: "bg-blue-50 text-blue-600",
      href: "/patients",
    },
    {
      title: "Digitized Prescriptions",
      value: totalPrescriptions,
      subtitle: "OCR + Gemini structured",
      icon: FileText,
      color: "from-teal-600 to-emerald-500",
      iconBg: "bg-teal-50 text-teal-600",
      href: "/prescriptions",
    },
    {
      title: "Important Records",
      value: importantCount,
      subtitle: "Starred for rapid recall",
      icon: Star,
      color: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600",
      href: "/prescriptions?important=true",
    },
    {
      title: "AI Processing Time",
      value: "< 15s",
      subtitle: "Tesseract + Gemini Flash",
      icon: Sparkles,
      color: "from-indigo-600 to-purple-500",
      iconBg: "bg-indigo-50 text-indigo-600",
      href: "/upload",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Link key={idx} href={s.href}>
            <Card className="hover:shadow-md transition-all border-slate-200/90 group cursor-pointer">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {s.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.subtitle}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.iconBg} shadow-xs`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
