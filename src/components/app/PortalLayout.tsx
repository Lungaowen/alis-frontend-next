import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Gauge, Users, ScrollText, BarChart3, FileText, Gavel, ClipboardCheck,
  UploadCloud, Briefcase, ShieldAlert, Home, LogOut, Scale, Search, Menu, X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiBaseDialog } from "@/components/ApiBaseDialog";
import { NAV_BY_ROLE, ROLE_LABEL } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Gauge> = {
  Gauge, Users, ScrollText, BarChart3, FileText, Gavel, ClipboardCheck,
  UploadCloud, Briefcase, ShieldAlert, Home, Search,
};


interface PortalLayoutProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PortalLayout({ title, description, eyebrow, actions, children }: PortalLayoutProps) {
  const { session, role, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const items = role ? NAV_BY_ROLE[role] : [];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcut: CTRL+ALT+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      // ESC to close
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Moving documents background animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          >
            <FileText className="h-8 w-8 text-primary" strokeWidth={1} />
          </div>
        ))}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              title="Toggle sidebar (Ctrl+Alt+B)"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-ink text-primary-foreground">
              <Scale className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="text-display text-lg font-semibold tracking-tight">ALIS</span>
            <span className="hidden text-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
              Legal Intelligence
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ApiBaseDialog />
            {session && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-medium text-foreground">{session.fullName}</span>
                {role && (
                  <Badge variant="outline" className="text-mono text-[10px] uppercase tracking-[0.16em]">
                    {ROLE_LABEL[role]}
                  </Badge>
                )}
              </div>
            )}
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-60 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:block"
          } ${sidebarOpen ? "block" : "hidden lg:block"}`}
        >
          <nav className="sticky top-14 flex h-full flex-col gap-1 p-4">
            <div className="flex items-center justify-between lg:hidden">
              <p className="mb-3 px-2 text-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/70">
                {role ? ROLE_LABEL[role] : "Workspace"}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {!sidebarOpen && (
              <p className="mb-3 px-2 text-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/70 hidden lg:block">
                {role ? ROLE_LABEL[role] : "Workspace"}
              </p>
            )}
            {items.map((it) => {
              const Icon = ICONS[it.iconName] ?? Gauge;
              const active = loc.pathname === it.to || loc.pathname.startsWith(it.to + "/");
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{it.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="border-b border-border bg-gradient-card">
            <div className="px-4 py-8 lg:px-8">
              {eyebrow && (
                <p className="text-mono text-[11px] uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
              )}
              <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                  {description && (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                {actions}
              </div>
            </div>
          </div>
          <div className="animate-fade-in-up px-4 py-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
