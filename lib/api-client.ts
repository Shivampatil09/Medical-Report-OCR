import { ApiResponse } from "@/types/api";
import { logger } from "@/lib/logger";

class ApiClientError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Standard centralized client adhering to strict production rules:
 * - Returns ONLY data on success
 * - Rejects on success === false or HTTP errors
 * - Typed signatures, no any
 * - dev-only logging via logger
 */
export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logger.warn("401 Unauthorized detected - redirecting or clearing auth");
      if (typeof window !== "undefined") {
        // Handle redirect or logout if applicable
      }
      throw new ApiClientError("Unauthorized access. Please re-authenticate.", 401);
    }

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || !json.success) {
      const errorMessage = json.message || `Request failed with status ${response.status}`;
      logger.error(`API Error on [${url}]:`, errorMessage);
      throw new ApiClientError(errorMessage, response.status);
    }

    return json.data;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error occurred";
    logger.error(`Network or fetch error on [${url}]:`, message);
    throw new ApiClientError(message);
  }
}
