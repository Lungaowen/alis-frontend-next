"use client";

import { useState } from "react";
import type { Tenant } from "@/src/modules/shared";
import { tenantService } from "../application/tenant-service";

export function TenantSwitcher({ tenants }: { tenants?: Tenant[] }) {
  const currentTenant = tenantService.getActive();
  const candidates = [...(tenants ?? []), currentTenant];
  const available = candidates.filter((tenant, index, all) =>
    all.findIndex((candidate) => candidate.id === tenant.id) === index
  );
  const [active, setActive] = useState(currentTenant);

  return (
    <select
      aria-label="Professional workspace"
      value={String(active.id)}
      onChange={(event) => {
        const next = tenantService.setActive(event.target.value);
        setActive(next);
        window.location.reload();
      }}
      className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
    >
      {available.map((tenant) => (
        <option key={tenant.id} value={String(tenant.id)}>{tenant.name}</option>
      ))}
    </select>
  );
}
