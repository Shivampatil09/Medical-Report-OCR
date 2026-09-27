import { pgTable, uuid, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Medicine } from "@/types";

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  rawOcr: text("raw_ocr").notNull(),
  correctedText: text("corrected_text").notNull(),
  aiSummary: text("ai_summary").notNull(),
  medicinesJson: jsonb("medicines_json").$type<Medicine[]>().notNull(),
  doctorNotes: text("doctor_notes"),
  tags: jsonb("tags").$type<string[]>().default([]),
  important: boolean("important").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type PatientInsert = typeof patients.$inferInsert;
export type PatientSelect = typeof patients.$inferSelect;
export type PrescriptionInsert = typeof prescriptions.$inferInsert;
export type PrescriptionSelect = typeof prescriptions.$inferSelect;
