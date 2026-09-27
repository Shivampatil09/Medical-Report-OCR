import { db, schema } from "./index";
import { Patient, Prescription } from "@/types";
import { eq, desc, ilike, or } from "drizzle-orm";
import { logger } from "@/lib/logger";

// Realistic clinic seed data for immediate demonstration and offline dev
const seedPatients: Patient[] = [
  {
    id: "e4a1936c-9c0d-4f12-8ec2-35fcf4b47da1",
    name: "Sunita Sharma",
    age: 42,
    gender: "Female",
    phone: "+91 98230 45129",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalPrescriptions: 2,
  },
  {
    id: "f8c2b510-18dc-4e4b-9721-729235e12814",
    name: "Ramesh Patel",
    age: 58,
    gender: "Male",
    phone: "+91 98451 90812",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    totalPrescriptions: 1,
  },
  {
    id: "b2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f",
    name: "Aarav Mehta",
    age: 8,
    gender: "Male",
    phone: "+91 97120 33411",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    totalPrescriptions: 1,
  },
];

const seedPrescriptions: Prescription[] = [
  {
    id: "01789a4c-2d00-48e1-98e1-5123456789ab",
    patientId: "f8c2b510-18dc-4e4b-9721-729235e12814",
    patientName: "Ramesh Patel",
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
    medicines: [
      { name: "Augmentin 625mg", dosage: "625mg", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" },
      { name: "Dolo 650mg", dosage: "650mg", frequency: "SOS (When needed)", instructions: "Max 3 tabs/day for fever" },
      { name: "Pan 40mg", dosage: "40mg", frequency: "1-0-0 (Morning)", duration: "5 days", instructions: "Before breakfast" },
      { name: "Grilinctus Syrup", dosage: "10ml", frequency: "TDS (Three times daily)", duration: "5 days" }
    ],
    importantFindings: [
      "Productive cough with low grade fever",
      "History of mild gastritis with NSAIDs",
      "Check BP during follow-up visit"
    ],
    doctorNotes: "Patient reminded to avoid cold beverages. Recheck chest sounds if wheezing develops.",
    tags: ["Fever", "Bronchitis", "Antibiotic", "Respiratory"],
    important: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "02123b4c-2d00-48e1-98e1-9876543210fe",
    patientId: "e4a1936c-9c0d-4f12-8ec2-35fcf4b47da1",
    patientName: "Sunita Sharma",
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
    medicines: [
      { name: "Telma 40mg", dosage: "40mg", frequency: "1-0-0 (Morning)", instructions: "Maintain BP target < 130/80" },
      { name: "Glycomet 500 SR", dosage: "500mg", frequency: "1-0-1 (Twice daily)", instructions: "After meals" },
      { name: "Neurobion Forte", dosage: "Standard", frequency: "0-1-0 (Afternoon)", instructions: "Post lunch for 30 days" }
    ],
    importantFindings: [
      "Blood pressure stable at 128/82 mmHg",
      "Recommended HbA1c testing every 3 months"
    ],
    doctorNotes: "Encouraged 30 mins brisk walking. Diet counseling provided.",
    tags: ["Hypertension", "Diabetes", "Routine Checkup"],
    important: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "03555c4c-2d00-48e1-98e1-456123789abc",
    patientId: "b2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f",
    patientName: "Aarav Mehta",
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
    medicines: [
      { name: "Calpol 250 Syrup", dosage: "5ml (250mg/5ml)", frequency: "SOS", instructions: "When temperature exceeds 100°F" },
      { name: "Levolin Syrup", dosage: "2.5ml", frequency: "1-0-1 (Twice daily)", duration: "3 days" },
      { name: "Meftal-P Syrup", dosage: "4ml", frequency: "SOS", instructions: "Only if fever persists after 2 hours" }
    ],
    importantFindings: [
      "Pediatric dosing calibrated for 24kg body weight",
      "No signs of secondary bacterial infection"
    ],
    doctorNotes: "Inform parents to seek immediate emergency care if breathing difficulty intensifies.",
    tags: ["Pediatric", "Fever", "Viral URI", "Cold"],
    important: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

// In-memory store fallback with state
const memoryStore = {
  patients: [...seedPatients],
  prescriptions: [...seedPrescriptions],
};

export const repository = {
  async getPatients(search?: string): Promise<Patient[]> {
    if (db) {
      try {
        const query = db.select().from(schema.patients);
        const results = await query;
        let list: Patient[] = results.map((p) => ({
          id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        }));
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(
            (p) => p.name.toLowerCase().includes(s) || p.phone.includes(s)
          );
        }
        return list;
      } catch (err) {
        logger.warn("Drizzle patient query failed, using memory store", err);
      }
    }

    let items = [...memoryStore.patients];
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(s) || p.phone.includes(s)
      );
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getPatientById(id: string): Promise<Patient | null> {
    if (db) {
      try {
        const [result] = await db.select().from(schema.patients).where(eq(schema.patients.id, id));
        if (result) {
          return {
            id: result.id,
            name: result.name,
            age: result.age,
            gender: result.gender,
            phone: result.phone,
            createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        logger.warn("Drizzle getPatientById failed, fallback to memory", err);
      }
    }
    return memoryStore.patients.find((p) => p.id === id) || null;
  },

  async createPatient(data: { name: string; age: number; gender: string; phone: string }): Promise<Patient> {
    const newId = crypto.randomUUID();
    const newPatient: Patient = {
      id: newId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
      createdAt: new Date().toISOString(),
      totalPrescriptions: 0,
    };

    if (db) {
      try {
        await db.insert(schema.patients).values({
          id: newId,
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
        });
        logger.info("Inserted patient into Neon DB", newId);
        return newPatient;
      } catch (err) {
        logger.error("Drizzle createPatient error, stored in memory fallback", err);
      }
    }

    memoryStore.patients.unshift(newPatient);
    return newPatient;
  },

  async updatePatient(id: string, data: Partial<{ name: string; age: number; gender: string; phone: string }>): Promise<Patient | null> {
    if (db) {
      try {
        await db.update(schema.patients).set(data).where(eq(schema.patients.id, id));
      } catch (err) {
        logger.warn("Drizzle updatePatient error", err);
      }
    }
    const idx = memoryStore.patients.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryStore.patients[idx] = { ...memoryStore.patients[idx], ...data };
      return memoryStore.patients[idx];
    }
    return null;
  },

  async deletePatient(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(schema.prescriptions).where(eq(schema.prescriptions.patientId, id));
        await db.delete(schema.patients).where(eq(schema.patients.id, id));
      } catch (err) {
        logger.warn("Drizzle deletePatient error", err);
      }
    }
    memoryStore.prescriptions = memoryStore.prescriptions.filter((p) => p.patientId !== id);
    const prevLen = memoryStore.patients.length;
    memoryStore.patients = memoryStore.patients.filter((p) => p.id !== id);
    return memoryStore.patients.length < prevLen;
  },

  async getPrescriptions(filters?: {
    patientId?: string;
    search?: string;
    importantOnly?: boolean;
    medicineSearch?: string;
  }): Promise<Prescription[]> {
    let list = [...memoryStore.prescriptions];

    if (db) {
      try {
        const rows = await db.select().from(schema.prescriptions).orderBy(desc(schema.prescriptions.createdAt));
        const patientsList = await this.getPatients();
        const patientMap = new Map(patientsList.map((p) => [p.id, p.name]));

        list = rows.map((r) => ({
          id: r.id,
          patientId: r.patientId,
          patientName: patientMap.get(r.patientId) || "Unknown Patient",
          imageUrl: r.imageUrl,
          rawOcr: r.rawOcr,
          correctedText: r.correctedText,
          aiSummary: r.aiSummary,
          medicines: (r.medicinesJson as unknown as any[]) || [],
          importantFindings: [],
          doctorNotes: r.doctorNotes,
          tags: (r.tags as unknown as string[]) || [],
          important: r.important ?? false,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        logger.warn("Drizzle getPrescriptions failed, using memory store", err);
      }
    }

    if (filters?.patientId) {
      list = list.filter((p) => p.patientId === filters.patientId);
    }
    if (filters?.importantOnly) {
      list = list.filter((p) => p.important);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.patientName?.toLowerCase().includes(q) ||
          p.correctedText.toLowerCase().includes(q) ||
          p.aiSummary.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.medicines.some((m) => m.name.toLowerCase().includes(q))
      );
    }
    if (filters?.medicineSearch) {
      const mQ = filters.medicineSearch.toLowerCase();
      list = list.filter((p) =>
        p.medicines.some((m) => m.name.toLowerCase().includes(mQ))
      );
    }

    // Sort: Starred / Important at the top, then newest first (per PRD Phase 2)
    return list.sort((a, b) => {
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  async getPrescriptionById(id: string): Promise<Prescription | null> {
    const all = await this.getPrescriptions();
    return all.find((p) => p.id === id) || null;
  },

  async createPrescription(data: Omit<Prescription, "id" | "createdAt">): Promise<Prescription> {
    const newId = crypto.randomUUID();
    const patient = await this.getPatientById(data.patientId);
    const newRecord: Prescription = {
      ...data,
      id: newId,
      patientName: patient?.name || "Patient",
      createdAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await db.insert(schema.prescriptions).values({
          id: newId,
          patientId: data.patientId,
          imageUrl: data.imageUrl,
          rawOcr: data.rawOcr,
          correctedText: data.correctedText,
          aiSummary: data.aiSummary,
          medicinesJson: data.medicines,
          doctorNotes: data.doctorNotes || null,
          tags: data.tags,
          important: data.important,
        });
        logger.info("Prescription inserted into Neon DB", newId);
        return newRecord;
      } catch (err) {
        logger.error("Drizzle createPrescription error", err);
      }
    }

    memoryStore.prescriptions.unshift(newRecord);
    return newRecord;
  },

  async toggleImportant(id: string): Promise<boolean> {
    const item = await this.getPrescriptionById(id);
    if (!item) return false;
    const updated = !item.important;

    if (db) {
      try {
        await db.update(schema.prescriptions).set({ important: updated }).where(eq(schema.prescriptions.id, id));
      } catch (err) {
        logger.warn("Drizzle toggleImportant error", err);
      }
    }

    const mItem = memoryStore.prescriptions.find((p) => p.id === id);
    if (mItem) mItem.important = updated;
    return updated;
  },

  async updateDoctorNotes(id: string, notes: string): Promise<boolean> {
    if (db) {
      try {
        await db.update(schema.prescriptions).set({ doctorNotes: notes }).where(eq(schema.prescriptions.id, id));
      } catch (err) {
        logger.warn("Drizzle updateDoctorNotes error", err);
      }
    }
    const mItem = memoryStore.prescriptions.find((p) => p.id === id);
    if (mItem) mItem.doctorNotes = notes;
    return true;
  },

  async deletePrescription(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(schema.prescriptions).where(eq(schema.prescriptions.id, id));
      } catch (err) {
        logger.warn("Drizzle deletePrescription error", err);
      }
    }
    const prev = memoryStore.prescriptions.length;
    memoryStore.prescriptions = memoryStore.prescriptions.filter((p) => p.id !== id);
    return memoryStore.prescriptions.length < prev;
  },
};
