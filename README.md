# ClinicOCR — Medical Prescription Digitization & Document Intelligence Platform

**ClinicOCR** is an AI-powered SaaS platform designed for small clinics and medical practitioners to convert handwritten prescriptions into structured, searchable digital records using **Tesseract OCR** and **Google Gemini AI**.

---

## 🌟 Core Features

### Phase 1 (MVP)
- **Dashboard:** Overview widgets (Total Patients, Total Prescriptions, Recent Uploads, Quick Upload).
- **Patient Management:** Add, edit, delete, search, and manage clinic patients.
- **Prescription Upload:** Multi-format image upload (JPG, JPEG, PNG, SVG).
- **OCR Engine (Tesseract OCR):** Preprocessed text extraction with unmodified raw OCR display.
- **AI Processing (Google Gemini Flash):** 
  - Automated OCR correction
  - Structured medicine extraction (dosage, frequency, duration)
  - Concise clinical summary generation
  - Important clinical findings extraction
- **Doctor Verification & Authority:** Doctors can edit, modify, and review AI output before saving. Nothing is saved automatically.
- **Neon PostgreSQL Database:** Robust schema design with Drizzle ORM.
- **Patient History:** Chronological timeline of digitized records per patient.

### Phase 2 (Enhancements)
- **Smart Image Quality Check:** Real-time canvas analysis for blur, low lighting, and tilt before OCR.
- **OCR Confidence Indicator:** Quality ratings (*Excellent*, *Good*, *Needs Review*) and low-confidence word highlighting.
- **Smart Medicine Recognition:** Medicine badges with uncertain tagging (*e.g., "Possibly Levolin"*).
- **Multi-Field Search:** Instant search across Patient Name, Phone Number, Medicine Name, and Prescription Date.
- **Prescription Tags:** Auto-generated and custom clinical tags (*#Fever*, *#Antibiotic*, *#Pediatric*, *#Respiratory*).
- **Doctor Notes:** Private clinical notes and follow-up reminders.
- **Important Records (⭐):** Starred prescriptions pinned to the top of records.
- **Download Report (PDF Export):** One-click high-resolution clinical PDF report generation.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict type safety, no `any`)
- **Styling:** Tailwind CSS + Lucide Icons + Sonner
- **Database & ORM:** Neon PostgreSQL + Drizzle ORM
- **OCR:** Tesseract.js with HTML Canvas Preprocessing
- **AI:** Google Gemini Flash (`@google/generative-ai`)
- **PDF Generation:** jsPDF

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# Neon PostgreSQL Connection String (Optional for in-memory dev fallback)
DATABASE_URL="postgresql://user:password@ep-sample-pool.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Database Migration (Optional when using Neon DB)

```bash
npm run db:push
```

---

## 📁 Project Architecture

```
app/
├── api/
│   ├── gemini/route.ts
│   ├── patients/route.ts
│   └── prescriptions/route.ts
├── dashboard/ (root page.tsx)
├── patients/
│   ├── page.tsx
│   └── [id]/page.tsx
├── prescriptions/
│   ├── page.tsx
│   └── [id]/page.tsx
└── upload/
    └── page.tsx
components/
├── layout/ (AppShell, Header, Sidebar)
├── patients/ (PatientCard, PatientDialog)
├── prescription/ (MedicineBadge, PDFExportButton, PrescriptionCard, ReviewForm)
├── upload/ (ImageUploader, QualityAlert, ConfidenceIndicator)
└── ui/ (Button, Card, Badge, Dialog, Input, Skeleton)
db/
├── schema.ts
├── index.ts
└── repository.ts
lib/
├── api-client.ts
├── env.ts
├── logger.ts
└── ocr/
    ├── gemini.ts
    ├── preprocess.ts
    ├── quality-check.ts
    └── tesseract.ts
types/
└── index.ts
```

---

## 🩺 Doctor Workflow

1. **Select Patient** or register a new one.
2. **Upload or Capture** prescription photo (or click one of the clinic presets).
3. **Quality Check** alerts the doctor if the photo is blurry or dim.
4. **Tesseract OCR** extracts raw text.
5. **Gemini AI** cleans OCR errors and extracts medicines into structured badges.
6. **Doctor Reviews & Edits** (final medical authority).
7. **Save & Export PDF** to patient archive.
