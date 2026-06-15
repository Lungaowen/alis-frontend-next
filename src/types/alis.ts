// Centralized ALIS request / response types.
export type Role = "ADMIN" | "USER" | "LEGAL_PRACTITIONER" | "DEAL_MAKER";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type DocumentType = "EMPLOYMENT" | "NDA" | "LEASE" | "SERVICE_AGREEMENT";
export type PipelineStatus =
  | "QUEUED"
  | "PROCESSING"
  | "EXTRACTED"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED"
  | string;

export interface LoginRequest { email: string; password: string }
export interface LoginResponse {
  token: string;
  clientId: number;
  role: Role;
  email: string;
  fullName: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  companyName?: string;
  dealSpecialty?: string;
  barNumber?: string;
  lawFirm?: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface DocumentRecord {
  documentId: number;
  documentTitle: string;
  documentType: DocumentType;
  jurisdiction?: string;
  clientId: number;
  status: PipelineStatus;
  uploadedAt: string;
  fileUrl?: string;
}

export interface UploadAcceptedResponse {
  task_id: string;
  status: "QUEUED";
  document_id: number;
  file_name: string;
}

export interface PipelineStatusResponse {
  documentId: number;
  status: PipelineStatus;
  step?: string;
  progress?: number;
  message?: string;
}

export interface ReportRecord {
  reportId: number;
  documentId: number;
  clientId: number;
  documentTitle?: string;
  riskLevel: RiskLevel;
  analysisStatus: PipelineStatus;
  similarityScore?: number;
  aiRecommendation?: string;
  aiExplanation?: string;
  generatedAt?: string;
  modelVersion?: string;
}

export interface Rule {
  ruleId: number;
  actId: number;
  actName?: string;
  keyword: string;
  requirements: string;
  riskLevel: RiskLevel;
  suggestion: string;
}
export interface RuleInput {
  actId: number;
  keyword: string;
  requirements: string;
  riskLevel: RiskLevel;
  suggestion: string;
}

export interface SearchResponse {
  query: string;
  page: number;
  pageSize: number;
  totalDocuments: number;
  totalReports: number;
  totalClauses: number;
  documents: Array<Record<string, unknown>>;
  reports: Array<Record<string, unknown>>;
  clauses: Array<Record<string, unknown>>;
}

export interface DashboardStats {
  totalClients: number;
  totalDocuments: number;
  totalReports: number;
  activeClients: number;
  pendingDocuments: number;
  failedDocuments: number;
  processedDocuments: number;
  highRiskReports: number;
}

export interface DashboardClient {
  clientId: number;
  fullName: string;
  email: string;
  role: Role;
  registeredAt: string;
  documentCount: number;
  recentDocuments: unknown | null;
}

export interface DashboardDocument {
  documentId: number;
  title: string;
  status: PipelineStatus;
  ingestionSource: "UPLOAD" | "MANUAL";
  uploadedAt: string;
  filePath: string | null;
  fileUrl: string;
  clientId: number;
  clientName: string;
}

export interface DashboardReport {
  reportId: number | null;
  documentId: number | null;
  clientId: number | null;
  documentTitle: string | null;
  riskLevel: RiskLevel | null;
  analysisStatus: PipelineStatus | null;
  aiRecommendation: string | null;
  aiExplanation: string | null;
  generatedAt: string | null;
  modelVersion: string | null;
  reportSummaryJson: unknown | null;
  similarityScore: number | null;
}

export interface RoleDistribution {
  role: Role;
  count: number;
}

export interface RiskDistribution {
  riskLevel: RiskLevel;
  count: number;
}

export interface UploadTrend {
  year: number;
  month: number;
  count: number;
  label: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  clients: DashboardClient[];
  recentDocuments: DashboardDocument[];
  reports: DashboardReport[];
  roleDistribution: RoleDistribution[];
  riskDistribution: RiskDistribution[];
  uploadTrend: UploadTrend[];
}
