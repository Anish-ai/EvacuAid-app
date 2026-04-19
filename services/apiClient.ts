import { Platform } from "react-native";
import { getApiBaseUrl } from "./config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
};

function ensureBaseConfigured(base: string): void {
  if (!base) {
    throw new ApiError(
      "API base URL is not configured. Set EXPO_PUBLIC_EVACUAID_API_BASE_URL in .env.",
      0,
    );
  }
}

function buildUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function candidateBases(baseUrl: string): string[] {
  if (!baseUrl) return [];

  const trimmed = baseUrl.replace(/\/$/, "");
  if (Platform.OS !== "android") return [trimmed];

  const trySet = new Set<string>();
  trySet.add(trimmed);

  const toLocalhost = trimmed
    .replace("://10.0.2.2", "://127.0.0.1")
    .replace("://localhost", "://127.0.0.1");
  const toEmulatorHost = trimmed
    .replace("://127.0.0.1", "://10.0.2.2")
    .replace("://localhost", "://10.0.2.2");
  const toLiteralLocalhost = trimmed
    .replace("://10.0.2.2", "://localhost")
    .replace("://127.0.0.1", "://localhost");

  // Android can work either via 10.0.2.2 (host route) or localhost (adb reverse).
  trySet.add(toEmulatorHost);
  trySet.add(toLocalhost);
  trySet.add(toLiteralLocalhost);

  return [...trySet];
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;
  const base = getApiBaseUrl();
  ensureBaseConfigured(base);

  const bases = candidateBases(base);
  let lastError: unknown = null;

  for (let i = 0; i < bases.length; i++) {
    const url = buildUrl(bases[i], path);
    const t0 = Date.now();
    console.log(
      `[API] ${method} ${url} attempt ${i + 1}/${bases.length}`,
      body === undefined ? "" : { body },
    );

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const payload = isJson ? await response.json() : null;

      console.log(
        `[API] ${method} ${url} -> ${response.status} (${Date.now() - t0}ms)`,
        payload ?? "",
      );

      if (!response.ok) {
        const message =
          (payload && (payload.error || payload.message)) ||
          `Request failed: ${response.status}`;
        throw new ApiError(message, response.status);
      }

      return payload as T;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.log(
        `[API] ${method} ${url} failed attempt ${i + 1}/${bases.length}: ${message}`,
      );
      // Try next base candidate.
    }
  }

  if (lastError instanceof ApiError) {
    throw lastError;
  }

  if (lastError instanceof Error) {
    throw new ApiError(lastError.message, 0);
  }

  throw new ApiError("Network request failed", 0);
}
