import type {LegalIssue} from "@/src/modules/shared";export interface LegalIssueRepository{list(matterId:string|number):Promise<LegalIssue[]>;}
