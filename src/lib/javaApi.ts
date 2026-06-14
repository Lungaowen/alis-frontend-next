// src/lib/javaApi.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { DocumentItem } from "./alis";

export const JAVA_BASE_URL =
  (import.meta.env.VITE_JAVA_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://54.235.231.201:8080";

const TOKEN_KEY = "alis_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const javaApi = axios.create({
  baseURL: JAVA_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
javaApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
javaApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("alis_user");
      localStorage.removeItem("alis.session");
      localStorage.removeItem("alis.token");

      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

// Convenience methods
export const jGet = async <T = any>(url: string, config?: AxiosRequestConfig) =>
  (await javaApi.get<T>(url, config)).data;

export const jPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  (await javaApi.post<T>(url, data, config)).data;

export const jPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  (await javaApi.put<T>(url, data, config)).data;

export const jDelete = async <T = any>(url: string, config?: AxiosRequestConfig) =>
  (await javaApi.delete<T>(url, config)).data;

// ─── Document endpoints (Java) ────────────────────────────────────────────
// Used by LegalDocumentsPage, alis.ts (re-exported), and others to list,
// fetch, and delete documents owned by the authenticated client.
export const documentApi = {
  /** GET /api/client/documents — list all documents for the authenticated client */
  getMyDocuments: (): Promise<DocumentItem[]> =>
    jGet<DocumentItem[]>("/api/client/documents"),

  /** GET /api/client/documents/{id} — fetch one owned document */
  getDocument: (id: number): Promise<DocumentItem> =>
    jGet<DocumentItem>(`/api/client/documents/${id}`),

  /** DELETE /api/client/documents/{id} */
  deleteDocument: (id: number): Promise<{ success?: boolean }> =>
    jDelete<{ success?: boolean }>(`/api/client/documents/${id}`),
};

export default javaApi;