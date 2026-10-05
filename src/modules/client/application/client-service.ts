import type {Client} from "@/src/modules/shared";import {createHttpClient} from "@/src/modules/shared";
const api=createHttpClient(process.env.NEXT_PUBLIC_JAVA_API_URL??"http://localhost:8080");
export const clientService={list:()=>api.get<Client[]>("/api/clients"),get:(id:string|number)=>api.get<Client>(`/api/clients/${id}`),create:(input:Omit<Client,"id">)=>api.post<Client>("/api/clients",input)};
