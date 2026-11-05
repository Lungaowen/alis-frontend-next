// Java/Spring API client. All requests use the Cloudflare gateway.
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "./api";
import { toJavaApiPath } from "./api-contracts";
import { getStoredSession, storeSession } from "./auth";
export class AlisForbiddenError extends Error { readonly status = 403 as const; constructor(message = "You do not have permission to perform this action.") { super(message); } }
export class AlisApiError extends Error { constructor(public status: number, message: string, public body?: unknown) { super(message); } }
export const http = axios.create({ timeout: 60_000 });
http.interceptors.request.use((config) => { config.baseURL = getApiBaseUrl(); if (config.url) config.url = toJavaApiPath(config.url); const token = getStoredSession()?.token; if (token) config.headers.set("Authorization", `Bearer ${token}`); return config; });
function extractMessage(data: unknown, fallback: string): string {
 if (data && typeof data === "object" && "message" in data) { const m=(data as {message?:unknown}).message; if(typeof m === "string" && m) return m; }
 if (data && typeof data === "object" && "detail" in data) { const d=(data as {detail?:unknown}).detail; if(typeof d === "string" && d) return d; }
 if(typeof data === "string" && data.length>0 && data.length<500) return data; return fallback;
}
http.interceptors.response.use(r=>r,(error:AxiosError)=>{ const status=error.response?.status??0; const data=error.response?.data; const isLogin=error.config?.url?.includes("/api/v1/auth/login"); const message=extractMessage(data,error.message||"Request failed");
 // 403 is an authorization decision, not an expired session.
 if(status===401 && !isLogin && getStoredSession()){ storeSession(null); if(typeof window!=="undefined"&&!window.location.pathname.startsWith("/login")){ try{sessionStorage.setItem("alis.loginMessage","Session expired, please log in again.");}catch{/* ignore */} window.location.assign("/login"); } }
 return Promise.reject(new AlisApiError(status,isLogin?extractMessage(data,"Invalid credentials"):message,data)); });
export async function httpGet<T>(path:string,config?:AxiosRequestConfig):Promise<T>{return (await http.get<T>(path,config)).data;}
export async function httpPost<T>(path:string,body?:unknown,config?:AxiosRequestConfig):Promise<T>{return (await http.post<T>(path,body,config)).data;}
export async function httpPut<T>(path:string,body?:unknown,config?:AxiosRequestConfig):Promise<T>{return (await http.put<T>(path,body,config)).data;}
export async function httpDelete<T>(path:string,config?:AxiosRequestConfig):Promise<T>{return (await http.delete<T>(path,config)).data;}
