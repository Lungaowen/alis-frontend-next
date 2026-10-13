"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Icon} from "@/components/icon";

const links=[
  {href:"/dashboard",label:"Overview",icon:"grid" as const},
  {href:"/scanner",label:"Situation Scanner",icon:"scan" as const},
  {href:"/matters",label:"Matters",icon:"folder" as const,count:"8"},
  {href:"/documents",label:"Evidence & Documents",icon:"document" as const},
  {href:"/profile",label:"Legal Safety Profile",icon:"shield" as const},
  {href:"/workspace",label:"Professional Workspace",icon:"briefcase" as const},
];

export function AlisShell({children}:{children:React.ReactNode}) {
  const pathname=usePathname();
  const title=pathname==="/dashboard"?"Overview":pathname==="/scanner"?"Situation Scanner":pathname==="/matters"?"Matters":pathname==="/documents"?"Documents":pathname.startsWith("/matter/")?"Matter":pathname==="/profile"?"Legal Safety Profile":"Workspace";
  return <div className="shell"><aside className="sidebar">
    <Link href="/dashboard" className="brand"><span className="brand-mark">A</span><span className="brand-copy"><strong>ALIS</strong><span>Legal intelligence</span></span></Link>
    <div className="nav-label">Command center</div><nav className="nav">{links.slice(0,2).map(l=><Link key={l.href} href={l.href} className={"nav-item "+(pathname===l.href?"active":"")}><Icon name={l.icon} size={17}/><span>{l.label}</span></Link>)}</nav>
    <div className="nav-label">Matter workspace</div><nav className="nav">{links.slice(2).map(l=><Link key={l.href} href={l.href} className={"nav-item "+(pathname===l.href||pathname.startsWith(l.href+"/")?"active":"")}><Icon name={l.icon} size={17}/><span>{l.label}</span>{l.count&&<span className="count">{l.count}</span>}</Link>)}</nav>
    <div className="sidebar-foot"><div className="workspace-card"><div className="eyebrow">Active workspace</div><strong>Moraka Attorneys</strong><div className="row"><Icon name="lock" size={13}/> Tenant-isolated environment</div></div></div>
  </aside><main className="main"><header className="topbar"><div className="crumb">ALIS / <strong>{title}</strong></div><div className="global-search"><Icon name="search" size={15}/><input placeholder="Search matters, documents, clients..." /></div><div className="topbar-right"><button className="icon-button" aria-label="Notifications"><Icon name="bell" size={16}/></button><div className="avatar">LO</div></div></header>{children}</main></div>;
}
