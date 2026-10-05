import type {Document} from "@/src/modules/shared";export interface DocumentRepository{list(matterId?:string|number):Promise<Document[]>;get(id:string|number):Promise<Document>;}
