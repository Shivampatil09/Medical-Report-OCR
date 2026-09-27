import { NextRequest, NextResponse } from "next/server";
import { processPrescriptionWithGemini } from "@/lib/ocr/gemini";
import { ApiResponse } from "@/types/api";
import { GeminiExtractionResult } from "@/types";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawOcr } = body;

    if (!rawOcr || typeof rawOcr !== "string" || rawOcr.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          message: "rawOcr text is required",
        },
        { status: 400 }
      );
    }

    logger.info("Processing prescription with Gemini AI...");
    const result = await processPrescriptionWithGemini(rawOcr);

    return NextResponse.json<ApiResponse<GeminiExtractionResult>>({
      success: true,
      data: result,
      message: "Prescription analyzed successfully",
    });
  } catch (error) {
    logger.error("Gemini API Route Error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to analyze prescription with AI",
      },
      { status: 500 }
    );
  }
}
