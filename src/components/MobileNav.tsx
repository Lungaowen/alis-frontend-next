import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Home, FileText, Upload, Gavel, Search, User, ShieldAlert, BarChart3, Users, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuth();
  const location = useLocation();
  const role = session?.role;

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: Home, roles: ["USER", "LEGAL_PRACTITIONER", "DEAL_MAKER", "ADMIN"] },
    { to: "/dashboard/upload", label: "Upload & Analyze", icon: Upload, roles: ["USER", "LEGAL_PRACTITIONER", "DEAL_MAKER"] },
    { to: "/dashboard/documents", label: "My Documents", icon: FileText, roles: ["USER", "LEGAL_PRACTITIONER", "DEAL_MAKER"] },
    { to: "/dashboard/rules", label: "Rules Workspace", icon: Gavel, roles: ["LEGAL_PRACTITIONER"] },
    { to: "/dealer/deals", label: "Deal Documents", icon: FileCheck, roles: ["DEAL_MAKER"] },
    { to: "/dealer/risk", label: "Risk Summary", icon: ShieldAlert, roles: ["DEAL_MAKER"] },
    { to: "/legal/documents", label: "Legal Documents", icon: FileText, roles: ["LEGAL_PRACTITIONER"] },
    { to: "/legal/rules", label: "Legal Rules", icon: Gavel, roles: ["LEGAL_PRACTITIONER"] },
    { to: "/legal/reports", label: "Legal Reports", icon: BarChart3, roles: ["LEGAL_PRACTITIONER"] },
    { to: "/admin/clients", label: "Manage Clients", icon: Users, roles: ["ADMIN"] },
    { to: "/admin/audit", label: "Audit Logs", icon: FileCheck, roles: ["ADMIN"] },
    { to: "/admin/reports", label: "Admin Reports", icon: BarChart3, roles: ["ADMIN"] },
    { to: "/search", label: "Search", icon: Search, roles: ["USER", "LEGAL_PRACTITIONER", "DEAL_MAKER", "ADMIN"] },
    { to: "/profile", label: "My Profile", icon: User, roles: ["USER", "LEGAL_PRACTITIONER", "DEAL_MAKER", "ADMIN"] },
  ];

  const filteredNavItems = navItems.filter(item => role && item.roles.includes(role));

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-card shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-ink text-primary-foreground">
                <Home className="h-4.5 w-4.5" strokeWidth={1.75} />
              </div>
              <span className="text-display text-xl font-semibold tracking-tight">
                ALIS
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">{session?.fullName}</p>
              <p className="mt-1">{role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
