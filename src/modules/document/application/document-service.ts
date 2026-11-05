import type { Document } from "@/src/modules/shared";
import { documentApi, jGet } from "@/lib/javaApi";

interface BackendDocument { id:number; matterId:number; fileName:string; status:string; createdAt:string; }
function mapDocument(item: BackendDocument | { documentId:number; title:string; status:string; uploadedAt:string }): Document {
  const id = "id" in item ? item.id : item.documentId;
  const name = "fileName" in item ? item.fileName : item.title;
  const status = item.status === "PROCESSED" ? "INDEXED" : item.status;
  return { id, name, status: status as Document["status"], uploadedAt: "createdAt" in item ? item.createdAt : item.uploadedAt, matterId: "matterId" in item ? item.matterId : undefined };
}

export const documentService = {
  list: async (matterId?: string | number): Promise<Document[]> => {
    if (matterId !== undefined) {
      const items = await jGet<BackendDocument[]>(`/api/v1/matters/${matterId}/documents`);
      return items.map(mapDocument);
    }
    const items = await documentApi.getMyDocuments();
    return items.map(mapDocument);
  },
  get: async (id: string | number): Promise<Document> => mapDocument(await documentApi.getDocument(Number(id))),
};
