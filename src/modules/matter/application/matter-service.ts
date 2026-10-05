import type {Matter} from "@/src/modules/shared";import {createHttpClient} from "@/src/modules/shared";
const api=createHttpClient(process.env.NEXT_PUBLIC_JAVA_API_URL??"http://localhost:8080");
export const matterService={list:()=>api.get<Matter[]>("/api/matters"),get:(id:string|number)=>api.get<Matter>(`/api/matters/${id}`),create:(input:Omit<Matter,"id">)=>api.post<Matter>("/api/matters",input),update:(id:string|number,input:Partial<Matter>)=>api.put<Matter>(`/api/matters/${id}`,input)};
