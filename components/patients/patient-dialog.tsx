"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Patient } from "@/types";
import { createPatientAction, updatePatientAction } from "@/actions/patients";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(0, "Age must be at least 0").max(120, "Age must be valid"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(8, "Phone number must have at least 8 digits"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientToEdit?: Patient | null;
  onSuccess?: (patient: Patient) => void;
}

export function PatientDialog({
  open,
  onOpenChange,
  patientToEdit,
  onSuccess,
}: PatientDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      age: 30,
      gender: "Male",
      phone: "",
    },
  });

  useEffect(() => {
    if (patientToEdit) {
      reset({
        name: patientToEdit.name,
        age: patientToEdit.age,
        gender: (patientToEdit.gender as "Male" | "Female" | "Other") || "Male",
        phone: patientToEdit.phone,
      });
    } else {
      reset({
        name: "",
        age: 30,
        gender: "Male",
        phone: "",
      });
    }
  }, [patientToEdit, reset, open]);

  const onSubmit = async (values: PatientFormValues) => {
    setLoading(true);
    try {
      if (patientToEdit) {
        const res = await updatePatientAction(patientToEdit.id, values);
        if (res.success && res.data) {
          toast.success("Patient updated successfully");
          onSuccess?.(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.message || "Failed to update patient");
        }
      } else {
        const res = await createPatientAction(values);
        if (res.success && res.data) {
          toast.success("Patient created successfully");
          onSuccess?.(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.message || "Failed to create patient");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{patientToEdit ? "Edit Patient Details" : "Register New Patient"}</DialogTitle>
          <DialogDescription>
            Enter patient demographic information for medical record association.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <Input
              {...register("name")}
              placeholder="e.g. Ramesh Patel"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Age</label>
              <Input
                type="number"
                {...register("age")}
                placeholder="45"
                className={errors.age ? "border-red-500" : ""}
              />
              {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Gender</label>
              <select
                {...register("gender")}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Phone Number</label>
            <Input
              {...register("phone")}
              placeholder="+91 98765 43210"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {patientToEdit ? "Update Patient" : "Save Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
