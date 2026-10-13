"use client";
import {useState} from "react";
const tenants=[{id:"tenant-moraka",name:"Moraka Attorneys"},{id:"tenant-example",name:"Example Legal Practice"}];
export function TenantSwitcher(){const [active,setActive]=useState(tenants[0].id);return <select aria-label="Professional workspace" value={active} onChange={e=>setActive(e.target.value)} className="btn">{tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>}
