import type {Tenant,TenantRole} from "@/src/modules/shared";
export type {Tenant,TenantRole};
export const DEMO_TENANTS:Tenant[]=[{id:"tenant-moraka",name:"Moraka Attorneys",slug:"moraka-attorneys",role:"OWNER"},{id:"tenant-example",name:"Example Legal Practice",slug:"example-legal",role:"LAWYER"}];
export function getActiveTenant():Tenant{if(typeof window!=="undefined"){const id=localStorage.getItem("alis_tenant_id");const found=DEMO_TENANTS.find(t=>String(t.id)===id);if(found)return found;}return DEMO_TENANTS[0];}
export function setActiveTenant(id:string){if(typeof window!=="undefined")localStorage.setItem("alis_tenant_id",id);}
export function tenantHeaders(){const t=getActiveTenant();return {"X-Tenant-Id":String(t.id),"X-Tenant-Slug":t.slug};}
