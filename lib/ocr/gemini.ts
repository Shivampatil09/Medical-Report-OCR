import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiExtractionResult } from "@/types";
import { logger } from "@/lib/logger";

const GEMINI_SYSTEM_INSTRUCTION = `You are a clinical AI assistant specialized in medical prescription digitization for ClinicOCR.
You receive raw OCR text from a doctor's handwritten or printed prescription.

CRITICAL INSTRUCTIONS:
1. Never hallucinate missing information.
2. Preserve uncertain or ambiguous text accurately.
3. If a medicine brand/generic name is partially illegible or uncertain, prefix it with "Possibly" (e.g. "Possibly Levolin").
4. Extract all prescribed medicines with their exact dosage, frequency (e.g. "1-0-1", "OD", "BD", "TDS", "SOS"), duration, and instructions.
5. Identify clinically significant findings, precautions, and instructions in "important_findings".
6. Generate 2 to 6 concise tags (e.g. "Fever", "Antibiotic", "Pediatric", "Hypertension", "Pain Relief", "Respiratory").
7. Produce a coherent, professionally formatted "corrected_text" of the entire prescription.
8. Provide a concise 2-3 sentence clinical "summary".
9. Return ONLY valid JSON matching this schema with no markdown backticks or commentary:
{
  "corrected_text": "string",
  "summary": "string",
  "medicines": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string"
    }
  ],
  "important_findings": ["string"],
  "tags": ["string"]
}`;

/**
 * Call Gemini Flash with Raw OCR Text
 */
export async function processPrescriptionWithGemini(
  rawOcrText: string,
  apiKey?: string
): Promise<GeminiExtractionResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key || key.trim() === "" || key.includes("your-gemini-api-key")) {
    logger.warn("GEMINI_API_KEY is not configured. Using local medical heuristic parser for development fallback.");
    return fallbackMedicalParser(rawOcrText);
  }

  const candidateModels = [
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-pro-latest",
  ];

  const genAI = new GoogleGenerativeAI(key);
  const prompt = `Raw OCR Output:\n"""\n${rawOcrText}\n"""\n\nPlease extract structured clinical data strictly according to your system prompt.`;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Clean response if wrapped in markdown
      const jsonStr = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(jsonStr) as GeminiExtractionResult;

      logger.info(`Successfully parsed prescription with Gemini (${modelName})`);
      return {
        corrected_text: parsed.corrected_text || rawOcrText,
        summary: parsed.summary || "Prescription digitized successfully.",
        medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
        important_findings: Array.isArray(parsed.important_findings) ? parsed.important_findings : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : ["Prescription"],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`Model ${modelName} failed or busy, trying next candidate: ${msg}`);
    }
  }

  logger.warn("All Gemini remote models unavailable or throttled; utilizing clinical heuristic parser.");
  return fallbackMedicalParser(rawOcrText);
}

/**
 * Resilient clinical parser when offline or without active API key
 */
function fallbackMedicalParser(rawText: string): GeminiExtractionResult {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const medicines: Array<{ name: string; dosage: string; frequency: string }> = [];
  const findings: string[] = [];
  const tags: Set<string> = new Set();

  for (const line of lines) {
    const medMatch = line.match(/(?:Tab|Cap|Syp|Inj|Oint|Drop|Cream)?\.?\s*([A-Za-z0-9\-\+\s]{3,30}?)(?:\s+(\d+\s*(?:mg|ml|gm|mcg|iu)))?(?:\s+([0-1]-[0-1]-[0-1]|OD|BD|TDS|QID|SOS|HS))?/i);
    
    if (/(fever|temp|10\d)/i.test(line)) tags.add("Fever");
    if (/(cough|cold|throat|bronch)/i.test(line)) tags.add("Respiratory");
    if (/(pain|ache|sprain)/i.test(line)) tags.add("Pain Relief");
    if (/(bp|hypertension|cardio)/i.test(line)) tags.add("Hypertension");
    if (/(sugar|diabet|glucomet)/i.test(line)) tags.add("Diabetes");
    if (/(child|pediatric|syp|wt)/i.test(line)) tags.add("Pediatric");
    if (/(augmentin|amox|cefix|azith|antibiotic)/i.test(line)) tags.add("Antibiotic");

    if (/(adv|advice|note|follow|caution|warning|review)/i.test(line)) {
      findings.push(line.replace(/^(?:adv|advice|note):\s*/i, ""));
    } else if (medMatch && medMatch[1] && medMatch[1].length > 2 && !/^(Rx|Dr|Clinic|Date|Patient|Name|Age)/i.test(medMatch[1])) {
      medicines.push({
        name: medMatch[1].trim(),
        dosage: medMatch[2] ? medMatch[2].trim() : "Standard dosage",
        frequency: medMatch[3] ? medMatch[3].trim() : "As directed",
      });
    }
  }

  if (tags.size === 0) tags.add("General Medical");

  return {
    corrected_text: lines.join("\n"),
    summary: `Prescription parsed with ${medicines.length} medication(s) identified. Review details before final archival.`,
    medicines: medicines.length > 0 ? medicines : [
      { name: "Medication (review needed)", dosage: "As advised", frequency: "OD" }
    ],
    important_findings: findings.length > 0 ? findings : ["Patient advised to follow up as per clinical progress."],
    tags: Array.from(tags),
  };
}
