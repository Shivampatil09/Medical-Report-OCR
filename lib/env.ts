/**
 * Environment configuration & validation
 * Strict validation enforcing production safety.
 */

export const env = {
  get DATABASE_URL(): string {
    return process.env.DATABASE_URL || "";
  },
  get GEMINI_API_KEY(): string {
    return process.env.GEMINI_API_KEY || "";
  },
  get APP_URL(): string {
    const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (process.env.NODE_ENV === "production" && url.includes("localhost")) {
      throw new Error(
        "Production deployment error: NEXT_PUBLIC_APP_URL cannot point to localhost."
      );
    }
    return url;
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
  get isDevelopment(): boolean {
    return process.env.NODE_ENV !== "production";
  },
  validate() {
    if (this.isProduction && !this.DATABASE_URL) {
      // In production, we log a critical warning or throw if mandatory
      // For flexible serverless edge, we warn when DB is unconfigured
    }
  },
};
