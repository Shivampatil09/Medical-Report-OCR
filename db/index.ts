import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { logger } from "@/lib/logger";

const connectionString = process.env.DATABASE_URL;

let dbInstance: ReturnType<typeof drizzle> | null = null;

if (connectionString && connectionString.startsWith("postgres")) {
  try {
    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema });
    logger.info("Initialized Neon PostgreSQL client");
  } catch (e) {
    logger.error("Failed to connect to Neon PostgreSQL, falling back to local store", e);
  }
} else {
  logger.info("DATABASE_URL not set or invalid; using resilient in-memory medical store for development");
}

export const db = dbInstance;
export { schema };
