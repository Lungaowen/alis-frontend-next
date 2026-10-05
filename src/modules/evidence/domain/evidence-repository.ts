import type {Evidence} from "@/src/modules/shared";export interface EvidenceRepository{list(matterId:string|number):Promise<Evidence[]>;get(id:string|number):Promise<Evidence>;}
