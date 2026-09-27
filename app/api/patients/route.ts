import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/db/repository";
import { ApiResponse } from "@/types/api";
import { Patient } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const list = await repository.getPatients(search);
    return NextResponse.json<ApiResponse<Patient[]>>({
      success: true,
      data: list,
      message: "Patients loaded",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Error fetching patients",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, gender, phone } = body;
    if (!name || !phone || !gender || age === undefined) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          message: "All patient fields are required",
        },
        { status: 400 }
      );
    }
    const created = await repository.createPatient({
      name,
      age: Number(age),
      gender,
      phone,
    });
    return NextResponse.json<ApiResponse<Patient>>({
      success: true,
      data: created,
      message: "Patient registered",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Error saving patient",
      },
      { status: 500 }
    );
  }
}
