import type {Document} from "@/src/modules/shared";import {createHttpClient} from "@/src/modules/shared";
const api=createHttpClient(process.env.NEXT_PUBLIC_AI_API_URL??"http://localhost:8000");
export const documentService={list:(matterId?:string|number)=>api.get<Document[]>(matterId?`/api/documents?matterId=${matterId}`:"/api/documents"),get:(id:string|number)=>api.get<Document>(`/api/documents/${id}`)};
