import type { Tenant } from "@/src/modules/shared";
import { DEMO_TENANTS } from "@/lib/tenant";
export interface TenantService { list():Promise<Tenant[]>; getActive():Tenant; setActive(id:string):Tenant; }
export const tenantService:TenantService={async list(){return DEMO_TENANTS;},getActive(){return DEMO_TENANTS.find(t=>typeof window!=="undefined"&&localStorage.getItem("alis_tenant_id")===t.id)??DEMO_TENANTS[0];},setActive(id){const tenant=DEMO_TENANTS.find(t=>t.id===id);if(!tenant)throw new Error("Tenant not found");if(typeof window!=="undefined")localStorage.setItem("alis_tenant_id",tenant.id);return tenant;}};
