import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { PortalLayout } from "@/components/app/PortalLayout";
import { StatCard, Spinner, EmptyState } from "@/components/app/Primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  adminInactiveClients, adminRegistrationTrend, adminReportSummary,
  adminRoleDistribution, adminTopUploaders,
  type RegistrationTrendRow, type RoleDistributionRow, type TopUploaderRow,
  type PaginatedTopUploadersResponse,
} from "@/lib/alis";
import { toast } from "sonner";

const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--gold))", "hsl(var(--destructive))"];

export default function AdminReportsPage() {
  return (
    <PortalLayout title="Platform Reports" eyebrow="Analytics" description="Aggregate insights across ALIS.">
      <Tabs defaultValue="role" className="w-full">
        <TabsList>
          <TabsTrigger value="role">Role Distribution</TabsTrigger>
          <TabsTrigger value="trend">Registration Trend</TabsTrigger>
          <TabsTrigger value="top">Top Uploaders</TabsTrigger>
        </TabsList>
        <TabsContent value="role"><RoleTab /></TabsContent>
        <TabsContent value="trend"><TrendTab /></TabsContent>
        <TabsContent value="top"><TopTab /></TabsContent>
      </Tabs>
    </PortalLayout>
  );
}

function RoleTab() {
  const [rows, setRows] = useState<RoleDistributionRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminRoleDistribution().then((r) => setRows(Array.isArray(r) ? r : []))
      .catch((e) => toast.error(e?.message ?? "Failed to load role distribution"))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  if (rows.length === 0) return <EmptyState title="No role data" />;
  const total = rows.reduce((a, r) => a + r.count, 0) || 1;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="count" nameKey="role" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Count</th><th className="px-4 py-3 text-left">Percentage</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.role} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.role.replace(/_/g, " ")}</td>
                <td className="px-4 py-3">{r.count}</td>
                <td className="px-4 py-3">{(r.percentage ?? (r.count / total) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrendTab() {
  const [months, setMonths] = useState("12");
  const [rows, setRows] = useState<RegistrationTrendRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    adminRegistrationTrend(parseInt(months, 10))
      .then((r) => setRows(Array.isArray(r) ? r : []))
      .catch((e) => toast.error(e?.message ?? "Failed to load trend"))
      .finally(() => setLoading(false));
  }, [months]);

  // Format data for chart - convert numeric month to readable label
  const chartData = rows.map(row => ({
    ...row,
    label: new Date(row.year, row.month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  })).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Client registrations per month.</p>
        <Select value={months} onValueChange={setMonths}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
            <SelectItem value="24">Last 24 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? <Spinner /> : rows.length === 0 ? <EmptyState title="No registrations recorded" /> : (
        <div className="h-80 rounded-lg border border-border bg-card p-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function TopTab() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [response, setResponse] = useState<PaginatedTopUploadersResponse | null>(null);
  const [inactive, setInactive] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminTopUploaders(page, pageSize).catch(() => null),
      adminInactiveClients().catch(() => ({ count: 0 })),
    ]).then(([t, i]) => {
      setResponse(t);
      const c = Array.isArray(i) ? i.length : (i as { count?: number }).count ?? 0;
      setInactive(c);
    }).finally(() => setLoading(false));
  }, [page, pageSize]);

  const rows = response?.content ?? [];
  const totalPages = response?.totalPages ?? 0;

  if (loading) return <Spinner />;
  return (
    <div className="space-y-4">
      <StatCard label="Inactive Clients" value={inactive} hint="No uploads in the recent window" />
      {rows.length === 0 ? <EmptyState title="No upload activity yet" /> : (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Documents Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.clientId ?? i} className="border-t border-border">
                  <td className="px-4 py-3 text-mono text-xs text-muted-foreground">#{r.rank ?? (page * pageSize) + i + 1}</td>
                  <td className="px-4 py-3 font-medium">{r.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3">{r.role.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">{r.documentCount ?? r.documentsUploaded ?? r.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages} ({response?.totalElements ?? 0} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
