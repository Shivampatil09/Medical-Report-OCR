import { OCRQualityReport } from "@/types";

/**
 * Smart Image Quality Check (Phase 2)
 * Evaluates blur, lighting conditions, aspect ratio, and resolution
 * before invoking OCR to give doctors upfront guidance.
 */
export async function analyzeImageQuality(
  imageSource: string | File
): Promise<OCRQualityReport> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(getDefaultReport());
          return;
        }

        // Downsample for fast quality calculation
        const sampleWidth = 320;
        const sampleHeight = Math.round((img.height * sampleWidth) / img.width);
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;

        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        const data = imgData.data;

        // 1. Calculate average luminance
        let totalLuminance = 0;
        const pixelCount = sampleWidth * sampleHeight;
        const grayValues = new Uint8Array(pixelCount);

        for (let i = 0; i < pixelCount; i++) {
          const idx = i * 4;
          const lum = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          grayValues[i] = lum;
          totalLuminance += lum;
        }

        const avgLuminance = totalLuminance / pixelCount;
        const isLowLight = avgLuminance < 65;
        const isOverExposed = avgLuminance > 230;

        // 2. Blur analysis: Laplacian Variance approximation
        // High variance = sharp edges, Low variance = blurry
        let laplacianSum = 0;
        let laplacianSqSum = 0;
        let edgeSamples = 0;

        for (let y = 1; y < sampleHeight - 1; y += 2) {
          for (let x = 1; x < sampleWidth - 1; x += 2) {
            const center = grayValues[y * sampleWidth + x];
            const up = grayValues[(y - 1) * sampleWidth + x];
            const down = grayValues[(y + 1) * sampleWidth + x];
            const left = grayValues[y * sampleWidth + (x - 1)];
            const right = grayValues[y * sampleWidth + (x + 1)];

            const laplacian = 4 * center - up - down - left - right;
            laplacianSum += laplacian;
            laplacianSqSum += laplacian * laplacian;
            edgeSamples++;
          }
        }

        const meanLap = laplacianSum / (edgeSamples || 1);
        const variance = (laplacianSqSum / (edgeSamples || 1)) - (meanLap * meanLap);
        const isBlurry = variance < 70;

        // 3. Aspect ratio check
        const ratio = img.width / img.height;
        const isTilted = ratio > 1.8 || ratio < 0.45;

        const warnings: string[] = [];
        if (isBlurry) warnings.push("Image appears blurry. Text edges may be difficult to read.");
        if (isLowLight) warnings.push("Lighting is dim or uneven. Consider taking photo in brighter light.");
        if (isOverExposed) warnings.push("Image is over-exposed or has glare.");
        if (isTilted) warnings.push("Prescription orientation may be tilted or skewed.");
        if (img.width < 700 || img.height < 700) {
          warnings.push("Low resolution image. Higher resolution yields better OCR accuracy.");
        }

        let score = 90;
        if (isBlurry) score -= 30;
        if (isLowLight) score -= 20;
        if (isOverExposed) score -= 15;
        if (isTilted) score -= 10;
        if (img.width < 800) score -= 10;

        score = Math.max(20, Math.min(100, score));

        let confidenceLevel: "Excellent" | "Good" | "Needs Review" = "Excellent";
        if (score < 65) confidenceLevel = "Needs Review";
        else if (score < 85) confidenceLevel = "Good";

        resolve({
          isBlurry,
          isLowLight,
          isTilted,
          confidenceScore: score,
          confidenceLevel,
          uncertainWords: [],
          warnings,
          recommendation:
            warnings.length > 0
              ? "You can still proceed, but capturing a steady, well-lit photo gives the highest recognition accuracy."
              : "Image quality looks optimal for Tesseract OCR recognition.",
        });
      } catch {
        resolve(getDefaultReport());
      }
    };

    img.onerror = () => resolve(getDefaultReport());

    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(getDefaultReport());
      reader.readAsDataURL(imageSource);
    }
  });
}

function getDefaultReport(): OCRQualityReport {
  return {
    isBlurry: false,
    isLowLight: false,
    isTilted: false,
    confidenceScore: 85,
    confidenceLevel: "Good",
    uncertainWords: [],
    warnings: [],
    recommendation: "Ready for OCR processing.",
  };
}
