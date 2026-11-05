// One public API entry point. The Cloudflare Worker routes /api/* to Java
// and /ai/* to Python, so the browser never needs direct origin URLs.
const STORAGE_KEY = "alis.apiBaseUrl";
const ENV_DEFAULT = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787";
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") { try { const override = window.localStorage.getItem(STORAGE_KEY); if (override) return override.replace(/\/+$/, ""); } catch { /* storage unavailable */ } }
  return ENV_DEFAULT.replace(/\/+$/, "");
}
export function setApiBaseUrl(url: string | null) {
  if (typeof window === "undefined") return;
  try { if (!url) window.localStorage.removeItem(STORAGE_KEY); else window.localStorage.setItem(STORAGE_KEY, url.replace(/\/+$/, "")); } catch { /* ignore storage failures */ }
}
export const API_BASE_URL = ENV_DEFAULT.replace(/\/+$/, "");
export function apiUrl(path: string): string { const suffix = path.startsWith("/") ? path : `/${path}`; return `${getApiBaseUrl()}${suffix}`; }
