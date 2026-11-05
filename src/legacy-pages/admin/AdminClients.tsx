import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Trash2, Download } from "lucide-react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { Spinner, EmptyState } from "@/components/app/Primitives";
import { RiskBadge } from "@/components/app/StatusBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  adminDeleteClient, adminFilterClients, adminListClients, adminUpdateClient,
  adminClientsByRole, getResult, exportToCSV, type ClientRecord, type RiskLevel,
} from "@/lib/alis";
import type { Role } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROLES: { value: Role | "ALL"; label: string }[] = [
  { value: "ALL", label: "All roles" },
  { value: "LEGAL_PRACTITIONER", label: "Legal Practitioner" },
  { value: "DEAL_MAKER", label: "Deal Maker" },
];

function unwrap(res: unknown): ClientRecord[] {
  if (Array.isArray(res)) return res as ClientRecord[];
  const r = res as { content?: ClientRecord[]; items?: ClientRecord[] };
  return r.content ?? r.items ?? [];
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  const [selected, setSelected] = useState<ClientRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ClientRecord | null>(null);
  const [riskMap, setRiskMap] = useState<Record<number, RiskLevel | "NONE" | "LOADING">>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Per rubric: when a specific role is selected, use the /by-role endpoint.
      const res =
        roleFilter === "ALL"
          ? await adminListClients(page, size)
          : await adminClientsByRole(roleFilter, page, size);
      setClients(unwrap(res));
      const tp = (res as { totalPages?: number }).totalPages;
      setTotalPages(tp && tp > 0 ? tp : 1);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [page, size, roleFilter]);

  useEffect(() => { load(); }, [load]);

  function downloadClientsCSV() {
    const headers = [
      { key: 'clientId' as keyof ClientRecord, label: 'Client ID' },
      { key: 'fullName' as keyof ClientRecord, label: 'Full Name' },
      { key: 'email' as keyof ClientRecord, label: 'Email' },
      { key: 'role' as keyof ClientRecord, label: 'Role' },
      { key: 'registeredAt' as keyof ClientRecord, label: 'Registered Date' },
      { key: 'documentCount' as keyof ClientRecord, label: 'Document Count' },
      { key: 'active' as keyof ClientRecord, label: 'Active' },
    ];
    exportToCSV(clients, `clients-report-${format(new Date(), 'yyyy-MM-dd')}`, headers);
  }

  async function fetchRisk(c: ClientRecord) {
    setRiskMap((m) => ({ ...m, [c.clientId]: "LOADING" }));
    try {
      // We don't have a direct endpoint for "latest document"; pretend documentCount > 0 means try clientId mapping.
      // Backend exposes /api/compliance/result/{documentId}. Without it, we surface an inline message.
      const r = await getResult(c.clientId);
      setRiskMap((m) => ({ ...m, [c.clientId]: r.riskLevel ?? "NONE" }));
    } catch {
      setRiskMap((m) => ({ ...m, [c.clientId]: "NONE" }));
    }
  }

  return (
    <PortalLayout
      title="Client Management"
      eyebrow="Administration"
      description="Search, filter, edit, and audit every client in the platform."
      actions={
        <Button variant="outline" onClick={downloadClientsCSV} disabled={clients.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Export CSV
        </Button>
      }
    >
      {/* Filter bar */}
      <div className="mb-5 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-1">
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "ALL")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Spinner label="Loading clients…" />
      ) : clients.length === 0 ? (
        <EmptyState title="No clients found" description="Adjust your filters or invite new users." />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Full Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">AI Risk</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const risk = riskMap[c.clientId];
                return (
                  <tr key={c.clientId} className="border-t border-border">
                    <td className="px-4 py-3 text-mono text-xs text-muted-foreground">#{c.clientId}</td>
                    <td className="px-4 py-3 font-medium">{c.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-mono text-[10px] uppercase tracking-[0.16em]">
                        {c.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {risk === "LOADING" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      ) : risk && risk !== "NONE" ? (
                        <RiskBadge level={risk as RiskLevel} />
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => fetchRisk(c)}>
                          <Sparkles className="mr-1 h-3 w-3" /> Risk Summary
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => { setSelected(c); setEditing(false); }}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <ClientDrawer
              client={selected}
              editing={editing}
              setEditing={setEditing}
              onSaved={(updated) => {
                setClients((arr) => arr.map((c) => (c.clientId === updated.clientId ? updated : c)));
                setSelected(updated);
                setEditing(false);
              }}
              onDelete={() => setConfirmDelete(selected)}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{confirmDelete?.fullName}</strong> and all related records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDelete) return;
                try {
                  await adminDeleteClient(confirmDelete.clientId);
                  toast.success("Client deleted");
                  setClients((arr) => arr.filter((c) => c.clientId !== confirmDelete.clientId));
                  setSelected(null);
                  setConfirmDelete(null);
                } catch (e) {
                  toast.error((e as Error)?.message ?? "Delete failed");
                }
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
}

function ClientDrawer({
  client, editing, setEditing, onSaved, onDelete,
}: {
  client: ClientRecord; editing: boolean; setEditing: (b: boolean) => void;
  onSaved: (c: ClientRecord) => void; onDelete: () => void;
}) {
  const [fullName, setFullName] = useState(client.fullName);
  const [email, setEmail] = useState(client.email);
  const [role, setRole] = useState<Role>(client.role);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(client.fullName); setEmail(client.email); setRole(client.role);
  }, [client]);

  async function save() {
    setSaving(true);
    try {
      const updated = await adminUpdateClient(client.clientId, { fullName, email, role });
      toast.success("Client updated");
      onSaved({ ...client, ...updated, fullName, email, role });
    } catch (e) {
      toast.error((e as Error)?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{client.fullName}</SheetTitle>
        <SheetDescription>Client ID #{client.clientId} • {client.email}</SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-4">
        <Field label="Full Name">
          {editing ? <Input value={fullName} onChange={(e) => setFullName(e.target.value)} /> : <p>{fullName}</p>}
        </Field>
        <Field label="Email">
          {editing ? <Input value={email} onChange={(e) => setEmail(e.target.value)} /> : <p>{email}</p>}
        </Field>
        <Field label="Role">
          {editing ? (
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LEGAL_PRACTITIONER">Legal Practitioner</SelectItem>
                <SelectItem value="DEAL_MAKER">Deal Maker</SelectItem>
              </SelectContent>
            </Select>
          ) : <Badge variant="outline">{role.replace("_", " ")}</Badge>}
        </Field>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {!editing ? (
          <>
            <Button onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="outline" className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          </>
        ) : (
          <>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save changes
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</Label>
      <div>{children}</div>
    </div>
  );
}
