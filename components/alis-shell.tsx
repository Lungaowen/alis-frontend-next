"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Dashboard from "@mui/icons-material/Dashboard";
import QrCodeScanner from "@mui/icons-material/QrCodeScanner";
import FolderOpen from "@mui/icons-material/FolderOpen";
import Description from "@mui/icons-material/Description";
import Security from "@mui/icons-material/Security";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import Person from "@mui/icons-material/Person";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import Help from "@mui/icons-material/Help";
import { RealtimeStatus } from "@/components/realtime-status";

const personalLinks = [
  { href: "/dashboard", label: "Overview", icon: Dashboard },
  { href: "/scanner", label: "Situation scanner", icon: QrCodeScanner },
  { href: "/matters", label: "Matters", icon: FolderOpen },
  { href: "/documents", label: "Evidence locker", icon: Description },
  { href: "/profile", label: "Legal safety profile", icon: Security },
];
const professionalLinks = [{ href: "/workspace", label: "Professional workspace", icon: BusinessCenter }];
const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/scanner": "Situation scanner",
  "/matters": "Matters",
  "/documents": "Evidence locker",
  "/profile": "Legal safety profile",
  "/workspace": "Professional workspace",
};

function isLinkActive(pathname: string, href: string) {
  if (href === "/matters" && pathname.startsWith("/matter/")) return true;
  return pathname === href || pathname.startsWith(href + "/");
}

export function AlisShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = pathname.startsWith("/matter/") ? "Matter overview" : (pageTitles[pathname] || "Legal workspace");

  function renderLink(item: (typeof personalLinks)[number] | (typeof professionalLinks)[number]) {
    const Icon = item.icon;
    const active = isLinkActive(pathname, item.href);
    return <Link key={item.href} href={item.href} className={"app-nav-link" + (active ? " is-active" : "")} aria-current={active ? "page" : undefined}><Icon /><span>{item.label}</span></Link>;
  }

  function renderMobileLink(item: (typeof personalLinks)[number]) {
    const Icon = item.icon;
    const active = isLinkActive(pathname, item.href);
    return <Link key={item.href} href={item.href} className={"mobile-nav-item" + (active ? " is-active" : "")} aria-current={active ? "page" : undefined}><Icon /><span>{item.href === "/scanner" ? "Scan" : item.href === "/documents" ? "Evidence" : item.label}</span></Link>;
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar" aria-label="Main workspace navigation">
        <Link href="/dashboard" className="app-brand"><span className="brand-mark">A</span><span className="brand-words"><strong>ALIS</strong><span>Legal intelligence</span></span></Link>
        <div className="sidebar-rule" />
        <p className="nav-caption">Your space</p>
        <nav className="app-nav">{personalLinks.map(renderLink)}</nav>
        <p className="nav-caption">Professional tools</p>
        <nav className="app-nav">{professionalLinks.map(renderLink)}</nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="sidebar-note-top"><VerifiedUser /> Start with clear facts</div>
            <p>Keep documents, dates and your own notes together. A complete context makes professional conversations more useful.</p>
          </div>
          <Link href="/profile" className="sidebar-help"><Help /> Your legal safety profile</Link>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-context"><p className="topbar-kicker">ALIS workspace</p><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <span className="private-workspace"><VerifiedUser /> Personal workspace</span>
            <RealtimeStatus />
            <Link href="/profile" className="user-chip" aria-label="Open legal safety profile"><span className="user-avatar">A</span><span className="user-chip-label">My profile</span><Person fontSize="small" /></Link>
          </div>
        </header>
        <main className="app-main-inner">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {personalLinks.filter((item) => ["/dashboard", "/scanner", "/matters", "/documents"].includes(item.href)).map(renderMobileLink)}
      </nav>
    </div>
  );
}
