// Typed ALIS backend client.
// Java (javaApi / httpGet/Post/...) -> Upload, Auth, profile, admin, rules, compliance
// Python (pGet/pPost/...) -> Trigger analysis, documents, reports, PDF download, search

import { httpGet, httpPost, httpPut, httpDelete } from "./http";
import { pGet, pPost, pDelete, pDownload, pythonApi } from "./pythonApi";
import { jGet, jPost, jDelete, javaApi } from "./javaApi";
import { getStoredSession } from "./auth";
import axios from "axios";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type DocumentStatus =
  | "PENDING"
  | "PROCESSING"
  | "EXTRACTED"
  | "ANALYZED"
  | "FAILED"
  | string;
export type AnalysisStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | string;

// ====================== CORE INTERFACES ======================
export interface DocumentItem {
  documentId: number;
  title: string;
  status: DocumentStatus;
  ingestionSource?: string;
  uploadedAt: string;
  filePath?: string;
  fileUrl?: string;
  clientId: number;
  riskLevel?: RiskLevel;
  similarityScore?: number;
  reportId?: number;
}

export interface UploadResponse {
  message: string;
  documentId: number;
  title: string;
  status: DocumentStatus;
  fileUrl?: string;
}

export interface ComplianceStatus {
  documentId: number;
  title: string;
  documentStatus: DocumentStatus;
  analysisStatus?: AnalysisStatus;
  riskLevel?: RiskLevel;
  similarityScore?: number;
  reportId?: number;
  reportReady: boolean;
  message?: string;
}

export interface ReportInfo {
  reportId: number;
  documentId: number;
  documentTitle: string;
  clientId: number;
  clientName?: string;
  riskLevel: RiskLevel;
  analysisStatus: AnalysisStatus;
  similarityScore: number;
  aiRecommendation: string;
  aiExplanation: string;
  generatedAt: string;
  modelVersion?: string;
  lawRuleId?: number;
  lawRuleKeyword?: string;
  actName?: string;
}

export interface Rule {
  ruleId: number;
  actId: number;
  actName?: string;
  keyword: string;
  requirements: string;
  riskLevel: RiskLevel;
  suggestion: string;
  edited?: boolean;
}

export interface RuleCreate {
  actId: number;
  keyword: string;
  requirements: string;
  riskLevel: RiskLevel;
  suggestion: string;
}

export interface RuleUpdate {
  requirements?: string;
  riskLevel?: RiskLevel;
  suggestion?: string;
  keyword?: string;
}

export interface ClientRecord {
  clientId: number;
  fullName: string;
  email: string;
  role: import("./auth").Role;
  active?: boolean;
  registeredAt?: string;
  documentCount?: number;
  companyName?: string;
}

export interface AdminDashboardData {
  totalClients?: number;
  totalDocuments?: number;
  totalReports?: number;
  highRiskDocuments?: number;
  roleDistribution?: Array<{ role: string; count: number }> | Record<string, number>;
  uploadTrend?: Array<{ date?: string; month?: string; count: number }>;
}

export interface AuditEntry {
  logId: number;
  timestamp: string;
  actionType: string;
  description: string;
  clientId?: number;
  documentId?: number;
  ipAddress?: string;
  clientName?: string;
}

export interface RoleDistributionRow {
  role: string;
  count: number;
  percentage?: number;
}

export interface RegistrationTrendRow {
  month: string;
  count: number;
}

export interface TopUploaderRow {
  rank?: number;
  clientId?: number;
  fullName: string;
  email: string;
  role: string;
  documentsUploaded?: number;
  count?: number;
}

export interface UploadOptions {
  title?: string;
  documentType: "EMPLOYMENT" | "NDA" | "LEASE" | "SERVICE_AGREEMENT" | "OTHER";
  jurisdiction?: string;
}

// ====================== DOCUMENTS ======================
export const getMyDocuments = () => jGet<DocumentItem[]>("/api/client/documents");
export const getDocument = (id: number) => jGet<DocumentItem>(`/api/client/documents/${id}`);
export const deleteDocument = (id: number) => jDelete(`/api/client/documents/${id}`);

// ====================== UPLOAD (Fixed 415 Error) ======================
export async function uploadDocument(
  file: File,
  optsOrProgress?: UploadOptions | ((pct: number) => void),
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const opts: UploadOptions =
    typeof optsOrProgress === "function" || !optsOrProgress
      ? { title: file.name, documentType: "OTHER" }
      : optsOrProgress;

  const progressCb =
    typeof optsOrProgress === "function" ? optsOrProgress : onProgress;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", opts.documentType);
  formData.append("jurisdiction", opts.jurisdiction ?? "South Africa");
  if (opts.title) formData.append("document_title", opts.title); // if backend expects it

  const token = localStorage.getItem("alis_token");

  const response = await axios.post<{
    message: string;
    documentId: number;
    status: string;
  }>(`${import.meta.env.VITE_JAVA_API_URL || "https://54-235-231-201.nip.io"}/api/client/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // Let browser set proper multipart boundary
    },
    onUploadProgress: (e) => {
      if (e.total && progressCb) {
        progressCb(Math.round((e.loaded * 100) / e.total));
      }
    },
    timeout: 180000, // 3 minutes for large files
  });

  return {
    message: response.data.message ?? "QUEUED",
    documentId: response.data.documentId,
    title: opts.title || file.name,
    status: response.data.status as DocumentStatus,
  };
}

// ====================== ANALYSIS & REPORTS ======================
export const triggerAnalysis = (documentId: number) =>
  pPost<{ status: string }>(`/api/analysis/run/${documentId}`, {});

export const getStatus = (documentId: number) =>
  httpGet<ComplianceStatus>(`/api/compliance/status/${documentId}`);

export const getResult = (documentId: number) =>
  httpGet<ReportInfo>(`/api/compliance/result/${documentId}`);

export const getPipelineStatus = (documentId: number) =>
  pGet<{ documentId: number; status: string; step?: string; progress?: number; message?: string }>(
    `/api/analysis/status/${documentId}`
  );

export const getAnalysisReport = (documentId: number) =>
  pGet<ReportInfo>(`/api/analysis/report/${documentId}`);

export const getDocumentReports = async (documentId: number): Promise<ReportInfo[]> => {
  try {
    const report = await httpGet<ReportInfo>(`/api/client/documents/${documentId}/report`);
    return report ? [report] : [];
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
};

export const getMyReports = () => httpGet<ReportInfo[]>("/api/client/reports");

// ====================== RULES ======================
export const listRules = () => httpGet<Rule[]>("/api/rules");
export const getRule = (id: number) => httpGet<Rule>(`/api/rules/${id}`);
export const createRule = (input: RuleCreate) => httpPost<Rule>("/api/rules", input);
export const updateRule = (id: number, input: RuleUpdate) => httpPut<Rule>(`/api/rules/${id}`, input);
export const deleteRule = (id: number) => httpDelete(`/api/rules/${id}`);

export const adminDashboard = () => httpGet<AdminDashboardData>("/api/admin/dashboard");
export const adminListClients = (page = 0, size = 20) => httpGet(`/api/admin/clients?page=${page}&size=${size}`);
export const adminFilterClients = (filter: any) => httpPost("/api/admin/clients/filter", filter);
export const adminRecentAudit = (limit = 100) => httpGet<AuditEntry[]>(`/api/admin/audit/recent?limit=${limit}`);
export const adminGetClient = (id: number) => httpGet<ClientRecord>(`/api/admin/clients/${id}`);
export const adminUpdateClient = (id: number, body: any) => httpPut(`/api/admin/clients/${id}`, body);
export const adminDeleteClient = (id: number) => httpDelete(`/api/admin/clients/${id}`);
export const adminClientsByRole = (role: string, page = 0, size = 20) =>
  httpGet(`/api/admin/clients/by-role?role=${encodeURIComponent(role)}&page=${page}&size=${size}`);
  export { downloadReportPdf } from "./downloadReport";
export const adminInactiveClients = () =>
  httpGet<{ count?: number; clients?: ClientRecord[] } | ClientRecord[]>(
    "/api/admin/clients/reports/inactive"
  );
  export const adminRegistrationTrend = (months = 12) =>
  httpGet<RegistrationTrendRow[]>(`/api/admin/clients/reports/registration-trend?months=${months}`);
  export const adminReportSummary = () =>
  httpGet<Record<string, number | string>>("/api/admin/clients/reports/summary");

export const adminRoleDistribution = () =>
  httpGet<RoleDistributionRow[]>("/api/admin/clients/reports/role-distribution");

export const adminTopUploaders = () =>
  httpGet<TopUploaderRow[]>("/api/admin/clients/reports/top-uploaders");
// ====================== GLOBAL SEARCH ======================
export interface DocumentSearchHit {
  documentId: number;
  title: string;
  status: DocumentStatus;
  uploadedAt: string;
  clientId: number;
  rank?: number;
}

export interface ReportSearchHit {
  reportId: number;
  riskLevel: RiskLevel;
  analysisStatus: AnalysisStatus;
  aiRecommendation?: string;
  aiExplanation?: string;
  documentId: number;
  documentTitle?: string;
  clientId: number;
  generatedAt?: string;
  rank?: number;
}

export interface ClauseSearchHit {
  clauseId: number;
  clauseText: string;
  riskLevel: RiskLevel;
  riskReason?: string;
  pageNumber?: number;
  documentId: number;
  documentTitle?: string;
  clientId: number;
  rank?: number;
}

export interface SearchResult {
  query: string;
  page: number;
  pageSize: number;
  totalDocuments: number;
  totalReports: number;
  totalClauses: number;
  documents: DocumentSearchHit[];
  reports: ReportSearchHit[];
  clauses: ClauseSearchHit[];
}

export const searchGlobal = (q: string, page = 0, pageSize = 10) =>
  httpGet<SearchResult>(
    `/api/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`
  );

// ====================== PROFILE ======================
export const updateProfile = (body: {
  fullName?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}) => httpPut<{ message?: string }>("/api/client/profile", body);

// ====================== REPORTS ======================
export const getReport = (reportId: number) =>
  httpGet<ReportInfo>(`/api/client/reports/${reportId}`);

export const getReportForDocument = (documentId: number) =>
  httpGet<ReportInfo>(`/api/client/documents/${documentId}/report`);

export const adminClientAudit = (clientId: number) =>
  httpGet<AuditEntry[]>(`/api/admin/audit/client/${clientId}`);
// Backward compatibility
export const listReportsForClient = () => getMyReports();

// ====================== DEFAULT EXPORT ======================
export default {
  uploadDocument,
  getMyDocuments,
  getDocument,
  deleteDocument,
  triggerAnalysis,
  getStatus,
  getResult,
  getPipelineStatus,
  getMyReports,
  getReport,
  getReportForDocument,
  listRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
  adminDashboard,
  adminListClients,
  adminFilterClients,
  adminRecentAudit,
  adminGetClient,
  adminUpdateClient,
  adminDeleteClient,
  adminClientsByRole,
  searchGlobal,
  updateProfile,
  adminClientAudit,
  adminInactiveClients,
  adminRegistrationTrend,
  adminReportSummary,
  adminRoleDistribution,
  adminTopUploaders,
};