// Typed ALIS backend client.
// Java (javaApi / httpGet/Post/...) -> Upload, Auth, profile, admin, rules, compliance
// Python (pGet/pPost/...) -> Trigger analysis, documents, reports, PDF download, search

import { httpGet, httpPost, httpPut, httpDelete } from "./http";
import { pGet, pPost, pDelete, pDownload, pythonApi } from "./pythonApi";
import { jGet, jPost, jDelete, javaApi } from "./javaApi";
import { getStoredSession } from "./auth";
import axios from "axios";
import { toast } from "sonner";

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
  stats?: {
    totalClients: number;
    totalDocuments: number;
    totalReports: number;
    activeClients: number;
    pendingDocuments: number;
    failedDocuments: number;
    processedDocuments: number;
    highRiskReports: number;
  };
  clients?: Array<{
    clientId: number;
    fullName: string;
    email: string;
    role: string;
    registeredAt: string;
    documentCount: number;
    recentDocuments: unknown | null;
  }>;
  recentDocuments?: Array<{
    documentId: number;
    title: string;
    status: string;
    ingestionSource: string;
    uploadedAt: string;
    filePath: string | null;
    fileUrl: string;
    clientId: number;
    clientName: string;
  }>;
  reports?: Array<{
    reportId: number | null;
    documentId: number | null;
    clientId: number | null;
    documentTitle: string | null;
    riskLevel: string | null;
    analysisStatus: string | null;
    aiRecommendation: string | null;
    aiExplanation: string | null;
    generatedAt: string | null;
    modelVersion: string | null;
    reportSummaryJson: unknown | null;
    similarityScore: number | null;
  }>;
  roleDistribution?: Array<{ role: string; count: number }> | Record<string, number>;
  riskDistribution?: Array<{ riskLevel: string; count: number }>;
  uploadTrend?: Array<{ year: number; month: number; count: number; label: string }>;
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

export interface RoleDistributionResponse {
  countByRole: Record<string, number>;
  totalClients: number;
}

export interface RegistrationTrendRow {
  year: number;
  month: number;
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
  documentCount?: number;
}

export interface PaginatedTopUploadersResponse {
  content: TopUploaderRow[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
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

  const session = getStoredSession();
  const clientId = session?.clientId;

  if (!clientId) {
    throw new Error("User not authenticated. Please login first.");
  }

  // Auto-generate document ID (use timestamp + random for uniqueness)
  const documentId = Date.now() + Math.floor(Math.random() * 1000);

  const formData = new FormData();
  formData.append("document_id", documentId.toString());
  formData.append("client_id", clientId.toString());
  formData.append("document_title", opts.title || file.name);
  formData.append("document_type", opts.documentType);
  formData.append("jurisdiction", opts.jurisdiction ?? "South Africa");
  formData.append("file", file);

  const token = localStorage.getItem("alis_token");

  const response = await axios.post<{
    task_id: string;
    status: string;
    document_id: number;
    file_name: string;
    message: string;
  }>("https://102-37-137-111.nip.io/api/process", formData, {
    headers: {
      accept: "application/json",
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
    documentId: response.data.document_id || documentId,
    title: opts.title || file.name,
    status: response.data.status as DocumentStatus,
  };
}

// ====================== ANALYSIS & REPORTS ======================
export const triggerAnalysis = (documentId: number) =>
  pPost<{ status: string }>(`/api/analysis/run/${documentId}`, {});

export const getStatus = (documentId: number) =>
  pGet<ComplianceStatus>(`/api/analysis/status/${documentId}`);

export const getResult = (documentId: number) =>
  httpGet<ReportInfo>(`/api/analysis/result/${documentId}`);

export const getPipelineStatus = (documentId: number) =>
  pGet<{ documentId: number; status: string; step?: string; progress?: number; message?: string }>(
    `/api/analysis/status/${documentId}`
  );

export const getAnalysisReport = (documentId: number) =>
  pGet<ReportInfo>(`/api/analysis/report/${documentId}`);

export interface DetailedReport {
  similarity_score: number;
  client_id: number;
  document_id: number;
  generated_at: string;
  report_id: number;
  rule_id: number;
  ai_explanation: string;
  ai_recommendation: string;
  analysis_status: string;
  model_version: string;
  risk_level: RiskLevel;
  search_vector: string;
  report_url: string;
  report_summary_json: {
    clauses: Array<{
      text: string;
      type: string;
      clauseId: string;
      highlight: boolean;
      pageNumber: number | null;
      explanation: string;
      mlRiskLevel: string;
      clauseNumber: number;
      lawReference: string | null;
      violatedRule: string | null;
      groqRiskLevel: string;
      finalRiskLevel: string;
      recommendation: string;
      detectedKeywords: string[];
      similarToHistorical: any;
    }>;
    analysis: {
      keyFindings: string;
      violatedRules: any[];
      lawsApplicable: string[];
      executiveSummary: string;
      similarCasesUsed: number;
      overallExplanation: string;
      overallRecommendation: string;
      similarReportsContext: Array<{
        riskLevel: string;
        documentTitle: string;
        recommendation: string;
      }>;
    };
    entities: {
      dates: Array<{ type: string; isoDate: string; rawString: string }>;
      parties: any[];
      durations: any[];
      locations: Array<{ name: string }>;
      caseDetails: any;
      identifiers: {
        idNumbers: any[];
        caseNumbers: string[];
        companyRegNumbers: string[];
        actSectionReferences: any[];
      };
      willDetails: any;
      contactDetails: {
        emails: any[];
        phones: any[];
        addresses: string[];
      };
      statuteDetails: any;
      extractionStats: {
        confidence: number;
        totalEntities: number;
      };
      monetaryAmounts: any[];
    };
    keywords: {
      keywordStats: {
        tfidfKeywordCount: number;
        totalMatchedCategories: number;
      };
      tfidfKeywords: Array<{ score: number; keyword: string }>;
      topRiskCategories: any[];
      detectedCategories: Array<{
        score: number;
        category: string;
        riskLevel: string;
        lawReference: string;
        matchedKeywords: string[];
      }>;
      documentTypeKeywords: string[];
      dominantLawReferences: string[];
      overallKeywordRiskLevel: string;
    };
    reportMeta: {
      clientId: number;
      documentId: number;
      generatedAt: string;
      documentType: string;
      jurisdiction: string;
      modelVersion: string;
      documentTitle: string;
      pipelineVersion: string;
    };
    riskProfile: {
      totalClauses: number;
      lowRiskClauses: number;
      complianceScore: number;
      highRiskClauses: number;
      flaggedForReview: boolean;
      overallRiskLevel: string;
      mediumRiskClauses: number;
    };
    topRulesUsed: Array<{
      keyword: string;
      rule_id: number;
      act_name: string;
      act_year: number;
      act_number: string;
      risk_level: string;
      suggestion: string;
      act_section: string | null;
      requirements: string;
      relevanceScore: number;
    }>;
  };
}

export const getDetailedReport = async (documentId: number): Promise<DetailedReport> => {
  const response = await axios.get<DetailedReport>(
    `https://102-37-137-111.nip.io/api/analysis/report/${documentId}`
  );
  return response.data;
};

// CSV export utility for admin reports
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }

  // Create CSV header row
  const headerRow = headers.map(h => h.label).join(',');

  // Create CSV data rows
  const dataRows = data.map(row =>
    headers.map(h => {
      const value = row[h.key];
      // Handle null/undefined, escape quotes and commas
      if (value == null) return '';
      const stringValue = String(value);
      // Escape quotes by doubling them and wrap in quotes if contains comma or quote
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Exported ${data.length} records to CSV`);
}

export const getDocumentReports = async (documentId: number): Promise<ReportInfo[]> => {
  try {
    const report = await httpGet<ReportInfo>(`/api/client/documents/${documentId}/report`);
    return report ? [report] : [];
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
};

export interface ClientProfile {
  clientId: number;
  fullName: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string;
  active: boolean;
  deactivatedAt: string | null;
  barNumber: string | null;
  lawFirm: string | null;
  companyName: string | null;
  dealSpecialty: string | null;
}

export const getClientProfile = async (): Promise<ClientProfile> => {
  return httpGet<ClientProfile>("/api/client/profile");
};

export interface ResetPasswordResponse {
  message: string;
  client_id: number;
  email: string;
  full_name: string;
}

export const resetPassword = async (clientId?: number, email?: string, newPassword?: string): Promise<ResetPasswordResponse> => {
  const params = new URLSearchParams();
  if (clientId) params.append("clientId", clientId.toString());
  if (email) params.append("email", email);

  const response = await axios.patch<ResetPasswordResponse>(
    `https://pvgibvnszcnewjtxzbvw.supabase.co/functions/v1/reset-password?${params.toString()}`,
    { newPassword }
  );
  return response.data;
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
  export const adminRegistrationTrend = async (months = 12): Promise<RegistrationTrendRow[]> => {
  const response = await httpGet<{ trend: RegistrationTrendRow[] }>(`/api/admin/clients/reports/registration-trend?months=${months}`);
  return response?.trend ?? [];
};
  export const adminReportSummary = () =>
  httpGet<Record<string, number | string>>("/api/admin/clients/reports/summary");

export const adminRoleDistribution = async (): Promise<RoleDistributionRow[]> => {
  const response = await httpGet<RoleDistributionResponse>("/api/admin/clients/reports/role-distribution");
  if (!response || !response.countByRole) return [];
  
  const total = response.totalClients || 0;
  return Object.entries(response.countByRole).map(([role, count]) => ({
    role,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
};

export const adminTopUploaders = (page = 0, size = 10) =>
  jGet<PaginatedTopUploadersResponse>(`/api/admin/clients/reports/top-uploaders?page=${page}&size=${size}`);
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

export const searchGlobal = async (q: string, page = 0, pageSize = 10): Promise<SearchResult> => {
  const response = await axios.get(
    `https://alis-search.lungaowen14.workers.dev/?q=${encodeURIComponent(q)}`
  );

  // Transform Workers.dev response to match SearchResult interface
  const data = response.data;
  const documents: DocumentSearchHit[] = [];
  const reports: ReportSearchHit[] = [];
  const clauses: ClauseSearchHit[] = [];

  if (data.results && Array.isArray(data.results)) {
    for (const result of data.results) {
      if (result.type === "document" && Array.isArray(result.rows)) {
        for (const row of result.rows) {
          documents.push({
            documentId: row.document_id,
            title: row.title || "Untitled",
            status: row.status || "ANALYZED",
            uploadedAt: row.uploaded_at || new Date().toISOString(),
            clientId: row.client_id || 0,
          });
        }
      } else if (result.type === "report" && Array.isArray(result.rows)) {
        for (const row of result.rows) {
          reports.push({
            reportId: row.report_id || 0,
            riskLevel: row.risk_level || "LOW",
            analysisStatus: row.analysis_status || "COMPLETED",
            aiRecommendation: row.ai_recommendation,
            aiExplanation: row.ai_explanation,
            documentId: row.document_id || 0,
            documentTitle: row.document_title,
            clientId: row.client_id || 0,
            generatedAt: row.generated_at,
          });
        }
      } else if (result.type === "clause" && Array.isArray(result.rows)) {
        for (const row of result.rows) {
          clauses.push({
            clauseId: row.clause_id || 0,
            clauseText: row.clause_text || "",
            riskLevel: row.risk_level || "LOW",
            riskReason: row.risk_reason,
            pageNumber: row.page_number,
            documentId: row.document_id || 0,
            documentTitle: row.document_title,
            clientId: row.client_id || 0,
          });
        }
      }
    }
  }

  // Apply pagination
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    query: q,
    page,
    pageSize,
    totalDocuments: documents.length,
    totalReports: reports.length,
    totalClauses: clauses.length,
    documents: documents.slice(startIndex, endIndex),
    reports: reports.slice(startIndex, endIndex),
    clauses: clauses.slice(startIndex, endIndex),
  };
};

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