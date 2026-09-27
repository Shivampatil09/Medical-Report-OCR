import { createWorker } from "tesseract.js";
import { logger } from "@/lib/logger";

export interface OCRResult {
  text: string;
  confidence: number;
  uncertainWords: string[];
}

export type OCRProgressCallback = (progress: {
  status: string;
  progress: number;
}) => void;

/**
 * Executes Tesseract OCR on a preprocessed image
 * Preserves raw output without alterations
 */
export async function performTesseractOCR(
  imageSource: string | File,
  onProgress?: OCRProgressCallback
): Promise<OCRResult> {
  logger.info("Initializing Tesseract OCR worker...");

  try {
    const worker = await createWorker("eng", 1, {
      logger: (m) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: Math.round((m.progress || 0) * 100),
          });
        }
      },
    });

    logger.info("Performing OCR recognition...");
    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    const text = ret.data.text.trim();
    const confidence = Math.round(ret.data.confidence);

    // Identify words with low confidence (< 65%) for Phase 2 uncertain word highlight
    const uncertainWords: string[] = [];
    if (ret.data.words && ret.data.words.length > 0) {
      for (const w of ret.data.words) {
        if (w.confidence < 65 && w.text.length > 2 && /^[a-zA-Z]+$/.test(w.text)) {
          uncertainWords.push(w.text);
        }
      }
    }

    logger.info(`OCR complete. Confidence: ${confidence}%. Extracted ${text.length} chars.`);

    return {
      text: text || "No text detected in the uploaded prescription.",
      confidence: isNaN(confidence) ? 75 : confidence,
      uncertainWords: Array.from(new Set(uncertainWords)).slice(0, 10),
    };
  } catch (error) {
    logger.error("Tesseract OCR execution error:", error);
    throw new Error(
      "Failed to read image with Tesseract OCR: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}
