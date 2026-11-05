import type { LegalIssue, RiskState } from "@/src/modules/shared";
import { jGet } from "@/lib/javaApi";
import { pGet, pPost } from "@/lib/pythonApi";

interface BackendDocument { id:number; fileName:string; }
interface Clause { clause_id:number; clause_text:string; risk_level:string; risk_reason?:string; page_number?:number; }
interface ClauseGroups { high:Clause[]; medium:Clause[]; low:Clause[]; }
interface AnalysisQueuedResponse { document_id:number; status:string; task_id:string; message:string; }
function riskState(level:string):RiskState {
  if (level === "HIGH") return "SIGNIFICANT_CONCERN";
  if (level === "MEDIUM") return "POTENTIAL_CONCERN";
  return "NO_OBVIOUS_ISSUE";
}

export const legalIntelligenceService = {
  // The Java API scopes documents to a matter. Python stores clause analysis
  // by document, so gather each document's clause groups and map them to issues.
  listIssues: async (matterId:string|number):Promise<LegalIssue[]> => {
    const documents = await jGet<BackendDocument[]>(`/api/v1/matters/${matterId}/documents`);
    const groups = await Promise.all(documents.map(async (document) => {
      const result = await pGet<ClauseGroups>(`/api/analysis/report/${document.id}/clauses`);
      return [...(result.high || []), ...(result.medium || []), ...(result.low || [])].map((clause) => ({
        id: clause.clause_id,
        matterId,
        title: clause.clause_text,
        state: riskState(clause.risk_level),
        explanation: clause.risk_reason,
        source: `${document.fileName}${clause.page_number ? `, page ${clause.page_number}` : ""}`,
      }));
    }));
    return groups.flat();
  },
  analyse: (documentId:string|number, _input:unknown):Promise<AnalysisQueuedResponse> =>
    pPost<AnalysisQueuedResponse>(`/api/analysis/run/${documentId}`, {}),
};
