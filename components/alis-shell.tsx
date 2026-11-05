"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Briefcase, ClipboardList, FileText, FolderOpen, LayoutDashboard, Search, ShieldCheck, UserRound, ScanLine } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/scanner", label: "Situation Scanner", icon: ScanLine },
  { href: "/workflows", label: "Guided workflows", icon: ClipboardList },
  { href: "/matters", label: "Matters", icon: FolderOpen },
  { href: "/documents", label: "Evidence & Documents", icon: FileText },
  { href: "/profile", label: "Legal Safety Profile", icon: ShieldCheck },
  { href: "/workspace", label: "Professional Workspace", icon: Briefcase },
];

export function AlisShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#f7f8f7] text-[#15221f]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/10 bg-white p-5 lg:block">
        <Link href="/dashboard" className="mb-10 block">
          <div className="font-display text-2xl font-extrabold tracking-tight">ALIS</div>
          <div className="mt-1 text-xs text-black/45">Legal early-warning workspace</div>
        </Link>
        <nav className="space-y-1" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined}
                className={"flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors " + (active ? "bg-[#173d35] text-white" : "text-black/60 hover:bg-black/5 hover:text-[#15221f]")}>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-[#eef4f1] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Activity size={16} strokeWidth={1.8} />Evidence first</div>
          <p className="mt-1 text-xs leading-5 text-black/55">ALIS organises facts and uncertainty. Legal conclusions belong with a qualified practitioner.</p>
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 px-5 py-4 backdrop-blur lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3"><Search size={17} strokeWidth={1.8} className="text-black/35" /><span className="text-sm text-black/45">Search matters, documents and legal intelligence</span></div>
            <Link href="/profile" className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm hover:bg-black/[0.03]"><UserRound size={16} strokeWidth={1.8} />Profile</Link>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
