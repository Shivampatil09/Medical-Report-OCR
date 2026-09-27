import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log("Seeding Neon database...");

  // Insert seed patients
  const patient1Id = "e4a1936c-9c0d-4f12-8ec2-35fcf4b47da1";
  const patient2Id = "f8c2b510-18dc-4e4b-9721-729235e12814";
  const patient3Id = "b2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f";

  // Check if patients already exist
  const existingPatients = await db.select().from(schema.patients);
  if (existingPatients.length === 0) {
    await db.insert(schema.patients).values([
      {
        id: patient1Id,
        name: "Sunita Sharma",
        age: 42,
        gender: "Female",
        phone: "+91 98230 45129",
      },
      {
        id: patient2Id,
        name: "Ramesh Patel",
        age: 58,
        gender: "Male",
        phone: "+91 98451 90812",
      },
      {
        id: patient3Id,
        name: "Aarav Mehta",
        age: 8,
        gender: "Male",
        phone: "+91 97120 33411",
      },
    ]);
    console.log("Inserted 3 patients.");
  }

  // Valid RFC 4122 UUIDs
  const p1Id = "01789a4c-2d00-48e1-98e1-5123456789ab";
  const p2Id = "02123b4c-2d00-48e1-98e1-9876543210fe";
  const p3Id = "03555c4c-2d00-48e1-98e1-456123789abc";

  const existingPrescriptions = await db.select().from(schema.prescriptions);
  if (existingPrescriptions.length === 0) {
    await db.insert(schema.prescriptions).values([
      {
        id: p1Id,
        patientId: patient2Id,
        imageUrl: "/samples/prescription-sample-1.svg",
        rawOcr: `Rx
Tab. Augmentin 625mg  1-0-1  5 days
Tab. Dolo 650mg  1-0-1 (SOS)  Fever
Cap. Pan 40mg  1-0-0 (Before meal)  5 days
Syp. Grilinctus 10ml  TDS  5 days
Adv: Steam inhalation bd, warm water gargle.
Follow up in 5 days if cough persists.`,
        correctedText: `Prescription Record:
Patient: Ramesh Patel (58/M)
Diagnosis: Acute Bronchitis with mild pyrexia

Medications:
1. Tab. Augmentin 625mg (Amoxicillin + Potassium Clavulanate) - 1 tablet twice daily for 5 days after food.
2. Tab. Dolo 650mg (Paracetamol) - 1 tablet as needed (SOS) for fever/bodyache.
3. Cap. Pan 40mg (Pantoprazole) - 1 capsule once daily before breakfast for 5 days.
4. Syp. Grilinctus 10ml - Three times daily for 5 days.

General Advice:
- Steam inhalation twice daily
- Warm saline gargle`,
        aiSummary: "58yo male presented with acute bronchitis and fever. Prescribed Augmentin 625mg course with antipyretic SOS and cough syrup. Advised steam inhalation and 5-day review.",
        medicinesJson: [
          { name: "Augmentin 625mg", dosage: "625mg", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" },
          { name: "Dolo 650mg", dosage: "650mg", frequency: "SOS (When needed)", instructions: "Max 3 tabs/day for fever" },
          { name: "Pan 40mg", dosage: "40mg", frequency: "1-0-0 (Morning)", duration: "5 days", instructions: "Before breakfast" },
          { name: "Grilinctus Syrup", dosage: "10ml", frequency: "TDS (Three times daily)", duration: "5 days" }
        ],
        doctorNotes: "Patient reminded to avoid cold beverages. Recheck chest sounds if wheezing develops.",
        tags: ["Fever", "Bronchitis", "Antibiotic", "Respiratory"],
        important: true,
      },
      {
        id: p2Id,
        patientId: patient1Id,
        imageUrl: "/samples/prescription-sample-2.svg",
        rawOcr: `Rx
Tab. Telma 40mg  1-0-0  Morning
Tab. Glycomet 500mg SR  1-0-1  After meal
Cap. Neurobion Forte  0-1-0  Post lunch
Review FBS/PPBS next week.`,
        correctedText: `Prescription Record:
Patient: Sunita Sharma (42/F)
Diagnosis: Essential Hypertension & Type 2 Diabetes Mellitus review

Medications:
1. Tab. Telma 40mg (Telmisartan) - 1 tablet once daily morning before breakfast.
2. Tab. Glycomet 500mg SR (Metformin) - 1 tablet twice daily after meals.
3. Cap. Neurobion Forte - 1 capsule daily after lunch.

Instructions:
- Monitor daily morning BP
- Repeat fasting and post-prandial blood sugar before next visit`,
        aiSummary: "42yo female on routine hypertension and glycemic control. Maintained on Telmisartan 40mg and Metformin 500mg SR with B-complex supplement.",
        medicinesJson: [
          { name: "Telma 40mg", dosage: "40mg", frequency: "1-0-0 (Morning)", instructions: "Maintain BP target < 130/80" },
          { name: "Glycomet 500 SR", dosage: "500mg", frequency: "1-0-1 (Twice daily)", instructions: "After meals" },
          { name: "Neurobion Forte", dosage: "Standard", frequency: "0-1-0 (Afternoon)", instructions: "Post lunch for 30 days" }
        ],
        doctorNotes: "Encouraged 30 mins brisk walking. Diet counseling provided.",
        tags: ["Hypertension", "Diabetes", "Routine Checkup"],
        important: false,
      },
      {
        id: p3Id,
        patientId: patient3Id,
        imageUrl: "/samples/prescription-sample-3.svg",
        rawOcr: `Rx (Pediatric)
Syp. Calpol 250mg  5ml SOS fever > 100 F
Syp. Levolin 2.5ml  bd x 3 days
Syp. Meftal-P 4ml if fever not subsiding
Plenty of liquids.`,
        correctedText: `Prescription Record:
Patient: Aarav Mehta (8/M)
Weight: 24 kg
Diagnosis: Viral URI with sporadic fever

Medications:
1. Syp. Calpol 250 (Paracetamol) - 5ml orally when fever > 100°F (minimum 4-6 hours gap).
2. Syp. Levolin (Levosalbutamol) - 2.5ml twice daily for 3 days for wheezing relief.
3. Syp. Meftal-P - 4ml SOS if high grade fever does not subside after paracetamol.`,
        aiSummary: "8yo pediatric patient with viral upper respiratory tract infection and fever spikes. Prescribed Calpol and Levolin bronchodilator.",
        medicinesJson: [
          { name: "Calpol 250 Syrup", dosage: "5ml (250mg/5ml)", frequency: "SOS", instructions: "When temperature exceeds 100°F" },
          { name: "Levolin Syrup", dosage: "2.5ml", frequency: "1-0-1 (Twice daily)", duration: "3 days" },
          { name: "Meftal-P Syrup", dosage: "4ml", frequency: "SOS", instructions: "Only if fever persists after 2 hours" }
        ],
        doctorNotes: "Inform parents to seek immediate emergency care if breathing difficulty intensifies.",
        tags: ["Pediatric", "Fever", "Viral URI", "Cold"],
        important: true,
      }
    ]);
    console.log("Inserted 3 prescriptions.");
  }

  console.log("Neon database successfully seeded with initial patients and prescriptions!");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
