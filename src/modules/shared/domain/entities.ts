export type Id = string | number;
export type UserRole = "ADMIN" | "USER" | "LEGAL_PRACTITIONER" | "DEAL_MAKER";
export type TenantRole = "OWNER" | "ADMIN" | "LAWYER" | "STAFF";
export type MatterStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type DocumentStatus = "UPLOADED" | "PROCESSING" | "INDEXED" | "FAILED";
export type RiskState = "NO_OBVIOUS_ISSUE" | "POTENTIAL_CONCERN" | "SIGNIFICANT_CONCERN" | "URGENT_REVIEW";

export interface Tenant { id: Id; slug: string; name: string; role: TenantRole; }
export interface User { id: Id; name: string; email: string; role: UserRole; }
export interface Client { id: Id; tenantId?: Id; name: string; email?: string; phone?: string; }
export interface Matter { id: Id; tenantId?: Id; clientId?: Id; title: string; description?: string; status: MatterStatus; createdAt?: string; }
export interface Document { id: Id; tenantId?: Id; matterId?: Id; name: string; type?: string; status: DocumentStatus; uploadedAt?: string; }
export interface Evidence { id: Id; tenantId?: Id; matterId?: Id; documentId?: Id; label: string; source: "DOCUMENT" | "EMAIL" | "WHATSAPP" | "VOICE" | "PHOTO" | "OTHER"; capturedAt?: string; }
export interface TimelineEvent { id: Id; tenantId?: Id; matterId: Id; type: string; title: string; occurredAt: string; }
export interface LegalIssue { id: Id; tenantId?: Id; matterId: Id; title: string; state: RiskState; explanation?: string; source?: string; }
export interface ProfessionalMembership { userId: Id; tenantId: Id; role: TenantRole; permissions: string[]; }
export interface RealtimeEvent<T=unknown> { event: string; tenantId: Id; matterId?: Id; payload: T; occurredAt: string; }
