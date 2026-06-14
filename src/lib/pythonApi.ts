// src/lib/pythonApi.ts
// Python FastAPI client — Documents, reports, PDF downloads, search, analysis

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken } from "./javaApi";

export const PYTHON_BASE_URL =
  (import.meta.env.VITE_PYTHON_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://54.235.231.201:8000";

export const pythonApi = axios.create({
  baseURL: PYTHON_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach Bearer token
pythonApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 logout
pythonApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("alis_token");
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

// Convenience wrappers
export const pGet = async <T = any>(url: string, config?: AxiosRequestConfig) =>
  (await pythonApi.get<T>(url, config)).data;

export const pPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  (await pythonApi.post<T>(url, data, config)).data;

export const pPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  (await pythonApi.put<T>(url, data, config)).data;

export const pDelete = async <T = any>(url: string, config?: AxiosRequestConfig) =>
  (await pythonApi.delete<T>(url, config)).data;

/** Download binary file (e.g. PDF) from Python API */
export async function pDownload(path: string, filename: string): Promise<void> {
  try {
    const res = await pythonApi.get(path, { responseType: "blob" });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed", err);
    throw new Error("Failed to download file");
  }
}

export default pythonApi;