import Constants from "expo-constants";

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getExtra(name: string): string {
  const extra = Constants.expoConfig?.extra as
    | Record<string, unknown>
    | undefined;
  return normalize(extra?.[name]);
}

// Expo inlines EXPO_PUBLIC_* vars only when accessed statically.
const EXPO_PUBLIC_EVACUAID_API_BASE_URL = normalize(
  process.env.EXPO_PUBLIC_EVACUAID_API_BASE_URL,
);
const EXPO_PUBLIC_API_BASE_URL = normalize(
  process.env.EXPO_PUBLIC_API_BASE_URL,
);
const API_BASE_URL = normalize(process.env.API_BASE_URL);

const EXPO_PUBLIC_GEMINI_API_KEY = normalize(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY,
);
const GEMINI_API_KEY = normalize(process.env.GEMINI_API_KEY);

export function getApiBaseUrl(): string {
  const explicit =
    EXPO_PUBLIC_EVACUAID_API_BASE_URL ||
    EXPO_PUBLIC_API_BASE_URL ||
    API_BASE_URL ||
    getExtra("EXPO_PUBLIC_EVACUAID_API_BASE_URL") ||
    getExtra("EXPO_PUBLIC_API_BASE_URL") ||
    getExtra("apiBaseUrl");

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  return "";
}

export function getGeminiApiKey(): string {
  return (
    EXPO_PUBLIC_GEMINI_API_KEY ||
    GEMINI_API_KEY ||
    getExtra("EXPO_PUBLIC_GEMINI_API_KEY")
  );
}
