import Link from "next/link";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowOutward from "@mui/icons-material/ArrowOutward";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import Description from "@mui/icons-material/Description";
import FolderOpen from "@mui/icons-material/FolderOpen";
import People from "@mui/icons-material/People";
import Settings from "@mui/icons-material/Settings";
import Shield from "@mui/icons-material/Shield";
import { AlisShell } from "@/components/alis-shell";

const modules = [
  { icon: People, title: "Clients and memberships", description: "A professional practice should see only the clients and matters its membership allows.", href: "/matters", linkText: "View matters" },
  { icon: FolderOpen, title: "Matter management", description: "Organise open matters, supporting evidence, milestones and next steps in one working context.", href: "/matters", linkText: "Open matter list" },
  { icon: Description, title: "Documents and evidence", description: "Keep originals, extracted details and review notes connected to the matter they belong to.", href: "/documents", linkText: "Open evidence locker" },
  { icon: Settings, title: "Workspace configuration", description: "Roles, permissions, membership and retention settings belong to the organisation boundary.", href: "/profile", linkText: "Review profile preview" },
];

export default function Workspace() {
  return (
    <AlisShell>
      <section className="page-intro">
        <div><p className="page-kicker">Professional tools</p><h1 className="page-title">A workspace built around matters.</h1><p className="page-description">ALIS can support professional practices alongside individual accounts. Client records and organisational access need separate, explicit permissions.</p></div>
        <span className="sample-label">Professional view preview</span>
      </section>

      <section className="workspace-banner">
        <div><p className="panel-label">Professional workspace</p><h2>Practice overview</h2><p>Example organisation context, shown to illustrate the professional experience.</p></div>
        <div className="workspace-banner-meta"><BusinessCenter sx={{ color: "#47734e", fontSize: 25 }} /><strong>Example workspace</strong><span>Membership and tenant context must come from the API.</span></div>
      </section>

      <section className="workspace-grid">
        {modules.map((module) => {
          const Icon = module.icon;
          return <article className="workspace-module" key={module.title}><div className="workspace-module-top"><span className="profile-icon"><Icon /></span><ArrowOutward sx={{ color: "#9ba69b", fontSize: 17 }} /></div><h3>{module.title}</h3><p>{module.description}</p><Link href={module.href} className="workspace-module-link">{module.linkText} <ArrowForward /></Link></article>;
        })}
      </section>

      <div className="notice-box" style={{ marginTop: 18 }}><Shield /><div><strong>Access control is not a visual feature</strong><p>The Java backend must validate membership and tenant scope on every protected request. A browser-selected workspace is never proof of authorisation.</p></div></div>
    </AlisShell>
  );
}
