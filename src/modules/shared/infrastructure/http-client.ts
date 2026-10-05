import { tenantHeaders } from "@/lib/tenant";

export interface HttpClient { get<T>(path:string):Promise<T>; post<T>(path:string,body:unknown):Promise<T>; put<T>(path:string,body:unknown):Promise<T>; delete<T>(path:string):Promise<T>; }

export function createHttpClient(baseUrl:string):HttpClient {
 const request=async<T>(path:string,init?:RequestInit):Promise<T>=>{const headers=new Headers(init?.headers);headers.set("Content-Type","application/json");for(const [k,v] of Object.entries(tenantHeaders()))headers.set(k,v);const token=typeof window!=="undefined"?localStorage.getItem("alis_token"):null;if(token)headers.set("Authorization",`Bearer ${token}`);const response=await fetch(`${baseUrl.replace(/\\\/$/,"")}${path}`,{...init,headers});if(!response.ok)throw new Error(`ALIS API request failed: ${response.status}`);if(response.status===204)return undefined as T;return response.json() as Promise<T>};
 return {get:path=>request(path),post:(path,body)=>request(path,{method:"POST",body:JSON.stringify(body)}),put:(path,body)=>request(path,{method:"PUT",body:JSON.stringify(body)}),delete:path=>request(path,{method:"DELETE"})};
}
