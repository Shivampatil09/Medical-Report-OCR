import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { ApiResponse } from "@/types/api";
import { Prescription } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const search = searchParams.get("search") || undefined;
    const importantOnly = searchParams.get("important") === "true";
    const medicineSearch = searchParams.get("medicine") || undefined;

    const list = await repository.getPrescriptions({
      patientId,
      search,
      importantOnly,
      medicineSearch,
    });

    return NextResponse.json<ApiResponse<Prescription[]>>({
      success: true,
      data: list,
      message: "Prescriptions loaded",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Error fetching prescriptions",
      },
      { status: 500 }
    );
  }
}
