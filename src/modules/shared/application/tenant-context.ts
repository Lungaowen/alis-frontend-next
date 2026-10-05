import type { Id, Tenant } from "../domain/entities";

export interface TenantContext { tenant: Tenant; tenantId: Id; tenantSlug: string; }
export function toTenantContext(tenant: Tenant): TenantContext { return { tenant, tenantId: tenant.id, tenantSlug: tenant.slug }; }
