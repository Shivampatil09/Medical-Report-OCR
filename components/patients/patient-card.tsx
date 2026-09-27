"use client";

import { Patient } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Calendar, ArrowRight, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (id: string) => void;
}

export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  return (
    <Card className="hover:shadow-md transition-all border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <Link
                href={`/patients/${patient.id}`}
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <span>{patient.name}</span>
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">
                  {patient.age} Yrs &bull; {patient.gender}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(patient)}
                className="h-8 w-8 text-slate-500 hover:text-slate-900"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(patient.id)}
                className="h-8 w-8 text-slate-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{patient.phone}</span>
          </div>

          <Link
            href={`/patients/${patient.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <span>History</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
