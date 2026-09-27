/**
 * Production-safe Logger
 * Completely silent in production, informative in development.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info(message: string, ...args: unknown[]) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn(message: string, ...args: unknown[]) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error(message: string, ...args: unknown[]) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  debug(message: string, ...args: unknown[]) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
