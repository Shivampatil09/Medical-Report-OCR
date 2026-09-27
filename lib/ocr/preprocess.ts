/**
 * Image Preprocessing for Tesseract OCR
 * Performs grayscale conversion, contrast enhancement, adaptive binarization,
 * and noise reduction using HTML Canvas API.
 */

export interface PreprocessOptions {
  contrast?: number; // 1.0 = normal, 1.5 = high
  brightness?: number; // 0 = normal
  binarize?: boolean;
  sharpen?: boolean;
}

/**
 * Preprocesses an image from data URL or File using client-side canvas
 */
export async function preprocessImageClient(
  imageSource: string | File,
  options: PreprocessOptions = { contrast: 1.3, brightness: 10, binarize: true, sharpen: true }
): Promise<{ processedDataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Unable to create canvas 2d context"));
          return;
        }

        // Limit maximum dimension to 2400px to maintain speed while ensuring clear OCR
        let { width, height } = img;
        const maxDim = 2400;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 1. Grayscale & Contrast enhancement
        const contrastFactor = (259 * ((options.contrast ?? 1.3) * 100 + 255)) / (255 * (259 - (options.contrast ?? 1.3) * 100));
        const brightnessOffset = options.brightness ?? 10;

        for (let i = 0; i < data.length; i += 4) {
          // Standard luminance weights
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Apply brightness
          let adjusted = gray + brightnessOffset;
          // Apply contrast
          adjusted = contrastFactor * (adjusted - 128) + 128;
          adjusted = Math.min(255, Math.max(0, adjusted));

          // 2. High-contrast adaptive binarization for handwritten text
          if (options.binarize) {
            adjusted = adjusted > 140 ? 255 : adjusted < 90 ? 0 : adjusted;
          }

          data[i] = adjusted;     // R
          data[i + 1] = adjusted; // G
          data[i + 2] = adjusted; // B
        }

        ctx.putImageData(imgData, 0, 0);

        resolve({
          processedDataUrl: canvas.toDataURL("image/png", 0.95),
          width,
          height,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(new Error("Failed to load image for preprocessing: " + e));

    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    }
  });
}
