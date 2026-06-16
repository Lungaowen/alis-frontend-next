// Typed ALIS backend client.
// Java (javaApi / httpGet/Post/...) -> Upload, Auth, profile, admin, rules, compliance
// Python (pGet/pPost/...) -> Trigger analysis, documents, reports, PDF download, search

import { httpGet, httpPost, httpPut, httpDelete } from "./http";
import { pGet, pPost, pDelete, pDownload, pythonApi } from "./pythonApi";
import { jGet, jPost, jDelete, javaApi } from "./javaApi";
import { getStoredSession } from "./auth";
import axios from "axios";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';

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
  createdAt: string;
  actionType: string;
  description: string;
  clientId?: number;
  adminId?: number;
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

// ====================== WORKER API ======================
const WORKER_URL = import.meta.env.VITE_WORKER_URL || "https://filemeta-worker.lungaowen14.workers.dev";

// ====================== DIRECT DATABASE CONNECTION ======================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

let supabaseClient: any = null;

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase credentials not set');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }

  return supabaseClient;
}

export interface FileMetadataInput {
  document_id: number;
  size: number;
  hash: string;
  mime_type: string;
}

export interface DocumentChunkInput {
  chunk_index: number;
  chunk_text: string;
  token_count?: number;
}

export interface DocumentContentInput {
  document_id: number;
  extracted_text: string;
  embedding_vector?: string;
}

export interface AuditLogInput {
  admin_id?: number;
  client_id?: number;
  document_id?: number;
  action_type: 'LOGIN' | 'LOGOUT' | 'UPLOAD_DOCUMENT' | 'ANALYSIS_RUN' | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED';
  description?: string;
  ip_address?: string;
}

export async function insertFileMetadata(data: FileMetadataInput): Promise<any> {
  const response = await fetch(`${WORKER_URL}/api/file-metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to insert file metadata');
  }

  return response.json();
}

export async function updateFileMetadata(document_id: number, updates: Partial<FileMetadataInput>): Promise<any> {
  const response = await fetch(`${WORKER_URL}/api/file-metadata`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_id, ...updates }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update file metadata');
  }

  return response.json();
}

export async function insertDocumentChunks(document_id: number, chunks: DocumentChunkInput[]): Promise<any> {
  const response = await fetch(`${WORKER_URL}/api/document-chunks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_id, chunks }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to insert document chunks');
  }

  return response.json();
}

export async function updateDocumentChunks(document_id: number, chunks: DocumentChunkInput[]): Promise<any> {
  const response = await fetch(`${WORKER_URL}/api/document-chunks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_id, chunks }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update document chunks');
  }

  return response.json();
}

export async function insertDocumentContent(data: DocumentContentInput): Promise<any> {
  const response = await fetch(`${WORKER_URL}/api/document-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to insert document content');
  }

  return response.json();
}

export async function updateDocumentContent(document_id: number, updates: Partial<DocumentContentInput>): Promise<any> {
  const response = await fetch(`${WORKER_URL}/api/document-content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_id, ...updates }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update document content');
  }

  return response.json();
}

// Helper function to calculate file hash
async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to split text into chunks
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper function to estimate tokens
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Client-side PDF text extraction
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source to jsdelivr CDN (more reliable)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}

// Function to insert document content after text extraction
export async function handleDocumentContentInsertion(documentId: number, extractedText: string, embeddingVector?: string): Promise<void> {
  try {
    await insertDocumentContent({
      document_id: documentId,
      extracted_text: extractedText,
      embedding_vector: embeddingVector,
    });
  } catch (error) {
    console.error("Failed to insert document content:", error);
    // Don't fail the process if content insertion fails
  }
}

// ====================== DIRECT DATABASE FUNCTIONS ======================
export async function insertFileMetadataDirect(data: FileMetadataInput): Promise<any> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available, falling back to worker');
    return insertFileMetadata(data);
  }

  try {
    const result = await client
      .from('file_metadata')
      .upsert({
        document_id: data.document_id,
        size: data.size,
        hash: data.hash,
        mime_type: data.mime_type,
      }, {
        onConflict: 'document_id'
      })
      .select()
      .single();
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Direct database insert failed:", error);
    throw error;
  }
}

export async function insertDocumentContentDirect(data: DocumentContentInput): Promise<any> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available, falling back to worker');
    return insertDocumentContent(data);
  }

  try {
    const result = await client
      .from('document_content')
      .upsert({
        document_id: data.document_id,
        extracted_text: data.extracted_text,
        embedding_vector: data.embedding_vector,
      }, {
        onConflict: 'document_id'
      })
      .select()
      .single();
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Direct database insert failed:", error);
    throw error;
  }
}

export async function insertDocumentChunksDirect(document_id: number, chunks: DocumentChunkInput[]): Promise<any> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available, falling back to worker');
    return insertDocumentChunks(document_id, chunks);
  }

  try {
    const rows = chunks
      .filter(c => c.chunk_index !== undefined && c.chunk_text)
      .map(c => ({
        document_id,
        chunk_index: c.chunk_index,
        chunk_text: c.chunk_text,
        token_count: c.token_count ?? null,
      }));

    if (rows.length === 0) {
      return { success: true, count: 0, data: [] };
    }

    const result = await client
      .from('document_chunk')
      .insert(rows)
      .select();
    
    return { success: true, count: result.data?.length || 0, data: result.data };
  } catch (error) {
    console.error("Direct database insert failed:", error);
    throw error;
  }
}

export async function insertAuditLogDirect(data: AuditLogInput): Promise<any> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available, skipping audit log');
    return null;
  }

  try {
    const result = await client
      .from('audit_log')
      .insert({
        admin_id: data.admin_id,
        client_id: data.client_id,
        document_id: data.document_id,
        action_type: data.action_type,
        description: data.description,
        ip_address: data.ip_address,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Audit log insert failed:", error);
    throw error;
  }
}

// ====================== REALTIME SUBSCRIPTIONS ======================
export function subscribeToAuditLog(callback: (payload: any) => void) {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available, cannot subscribe to audit log');
    return null;
  }

  const channel = client
    .channel('audit_log_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_log'
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromAuditLog(channel: any) {
  if (channel) {
    channel.unsubscribe();
  }
}

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

  const finalDocumentId = response.data.document_id || documentId;

  // Insert file metadata via direct database connection (fallback to worker)
  try {
    const hash = await calculateFileHash(file);
    await insertFileMetadataDirect({
      document_id: finalDocumentId,
      size: file.size,
      hash: hash,
      mime_type: file.type,
    });
  } catch (error) {
    console.error("Failed to insert file metadata:", error);
    // Don't fail the upload if metadata insertion fails
  }

  // Extract text from PDF and insert into document_content via direct database
  if (file.type === 'application/pdf') {
    try {
      const extractedText = await extractTextFromPDF(file);
      if (extractedText) {
        await insertDocumentContentDirect({
          document_id: finalDocumentId,
          extracted_text: extractedText,
        });
      }
    } catch (error) {
      console.error("Failed to extract PDF text:", error);
      // Don't fail the upload if text extraction fails
    }
  }

  // Log upload action to audit_log
  try {
    await insertAuditLogDirect({
      client_id: clientId,
      document_id: finalDocumentId,
      action_type: 'UPLOAD_DOCUMENT',
      description: `Uploaded document: ${opts.title || file.name}`,
      ip_address: 'client-side', // Can't get real IP from browser
    });
  } catch (error) {
    console.error("Failed to insert audit log:", error);
    // Don't fail the upload if audit log fails
  }

  return {
    message: response.data.message ?? "QUEUED",
    documentId: finalDocumentId,
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
  
  const report = response.data;
  
  // Extract text from report clauses and insert into document_content via direct database
  if (report.report_summary_json?.clauses && Array.isArray(report.report_summary_json.clauses)) {
    const extractedText = report.report_summary_json.clauses
      .map(clause => clause.text)
      .filter(text => text && text.trim())
      .join('\n\n');
    
    if (extractedText) {
      // Insert document content via direct database connection
      insertDocumentContentDirect({
        document_id: documentId,
        extracted_text: extractedText,
      }).catch(error => {
        console.error("Failed to insert document content:", error);
      });
    }
  }
  
  return report;
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

// ====================== FILE DOWNLOAD ======================
export async function downloadFile(fileUrl: string, filename?: string): Promise<void> {
  const token = localStorage.getItem("alis_token");
  
  try {
    const response = await axios.get(fileUrl, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || fileUrl.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download file. Please try again.");
    throw error;
  }
}

// ====================== GLOBAL SEARCH ======================
export interface DocumentSearchHit {
  documentId: number;
  title: string;
  status: DocumentStatus;
  uploadedAt: string;
  clientId: number;
  fileUrl?: string;
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
  fileUrl?: string;
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
  fileUrl?: string;
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
            fileUrl: row.file_url || (row.document && row.document.file_url) || undefined,
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
            fileUrl: row.file_url || (row.document && row.document.file_url) || undefined,
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
            fileUrl: row.file_url || (row.document && row.document.file_url) || undefined,
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