import type {LegalIssue} from "@/src/modules/shared";import {createHttpClient} from "@/src/modules/shared";
const api=createHttpClient(process.env.NEXT_PUBLIC_AI_API_URL??"http://localhost:8000");
export const legalIntelligenceService={listIssues:(matterId:string|number)=>api.get<LegalIssue[]>(`/api/matters/${matterId}/legal-issues`),analyse:(matterId:string|number,input:unknown)=>api.post<LegalIssue[]>(`/api/matters/${matterId}/analysis`,input)};
