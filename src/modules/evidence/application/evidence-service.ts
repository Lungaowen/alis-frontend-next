import type {Evidence} from "@/src/modules/shared";import {createHttpClient} from "@/src/modules/shared";
const api=createHttpClient(process.env.NEXT_PUBLIC_JAVA_API_URL??"http://localhost:8080");
export const evidenceService={list:(matterId:string|number)=>api.get<Evidence[]>(`/api/matters/${matterId}/evidence`),get:(id:string|number)=>api.get<Evidence>(`/api/evidence/${id}`)};
