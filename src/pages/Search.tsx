import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, FileText, ClipboardCheck, Quote, Loader2 } from "lucide-react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { searchGlobal, type SearchResult } from "@/lib/alis";
import { StatusBadge } from "@/components/app/StatusBadges";

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function riskTone(level: string) {
  const l = (level || "").toUpperCase();
  if (l === "HIGH") return "bg-destructive/10 text-destructive border-destructive/30";
  if (l === "MEDIUM") return "bg-amber-500/10 text-amber-700 border-amber-500/30";
  return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const debounced = useDebounced(q.trim(), 300);

  useEffect(() => setPage(0), [debounced]);

  const query = useQuery({
    queryKey: ["search", debounced, page, pageSize],
    queryFn: () => searchGlobal(debounced, page, pageSize),
    enabled: debounced.length >= 2,
    // Real-time feel: refetch frequently while the panel is open
    refetchInterval: debounced.length >= 2 ? 5000 : false,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });

  const data: SearchResult | undefined = query.data;
  const totals = useMemo(
    () => ({
      docs: data?.totalDocuments ?? 0,
      reports: data?.totalReports ?? 0,
      clauses: data?.totalClauses ?? 0,
    }),
    [data]
  );
  const grandTotal = totals.docs + totals.reports + totals.clauses;

  return (
    <PortalLayout
      eyebrow="AI · Unified search"
      title="Global Search"
      description="Search across documents, compliance reports, and risky clauses. Results stream live as you type."
    >
      {/* Search bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clauses, document titles, AI recommendations…"
            className="h-12 pl-9 text-base"
          />
          {query.isFetching && debounced.length >= 2 && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-mono text-[10px] uppercase tracking-[0.16em]">
            Live
          </Badge>
          <span>Auto-refreshes every 5s • Debounced 300ms • Min 2 characters</span>
        </div>
      </div>

      {/* Empty / hint states */}
      {debounced.length < 2 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Type at least 2 characters to begin searching.
        </div>
      ) : query.isError ? (
        <div className="mt-8 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          Search failed. Please try again.
        </div>
      ) : !data || grandTotal === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-display text-lg">No matches</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No documents, reports or clauses match “{debounced}”.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All ({grandTotal})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({totals.docs})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({totals.reports})</TabsTrigger>
            <TabsTrigger value="clauses">Clauses ({totals.clauses})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-6">
            <DocumentList items={data.documents} />
            <ReportList items={data.reports} />
            <ClauseList items={data.clauses} />
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
            <DocumentList items={data.documents} />
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <ReportList items={data.reports} />
          </TabsContent>
          <TabsContent value="clauses" className="mt-4">
            <ClauseList items={data.clauses} />
          </TabsContent>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {page + 1}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  data.documents.length < pageSize &&
                  data.reports.length < pageSize &&
                  data.clauses.length < pageSize
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Tabs>
      )}
    </PortalLayout>
  );

  function DocumentList({ items }: { items: SearchResult["documents"] }) {
    if (!items?.length) return null;
    return (
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> Documents
        </h3>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {items.map((d) => (
            <li key={`d-${d.documentId}`} className="flex items-center gap-4 px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-ink text-primary-foreground">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/dashboard/documents/${d.documentId}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {d.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Uploaded {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "—"} · Client #
                  {d.clientId}
                </p>
              </div>
              <StatusBadge status={d.status} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  function ReportList({ items }: { items: SearchResult["reports"] }) {
    if (!items?.length) return null;
    return (
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <ClipboardCheck className="h-3.5 w-3.5" /> Compliance Reports
        </h3>
        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={`r-${r.reportId}`}
              className="rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {r.documentTitle ?? `Document #${r.documentId}`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Report #{r.reportId} · {r.analysisStatus} ·{" "}
                    {r.generatedAt ? new Date(r.generatedAt).toLocaleString() : ""}
                  </p>
                </div>
                <Badge variant="outline" className={riskTone(r.riskLevel)}>
                  {r.riskLevel}
                </Badge>
              </div>
              {r.aiRecommendation && (
                <p className="mt-2 text-sm">
                  <span className="text-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    AI Recommendation
                  </span>
                  <br />
                  {r.aiRecommendation}
                </p>
              )}
              {r.aiExplanation && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{r.aiExplanation}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  function ClauseList({ items }: { items: SearchResult["clauses"] }) {
    if (!items?.length) return null;
    return (
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Quote className="h-3.5 w-3.5" /> Clauses
        </h3>
        <ul className="space-y-2">
          {items.map((c) => (
            <li
              key={`c-${c.clauseId}`}
              className="rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-relaxed">{c.clauseText}</p>
                <Badge variant="outline" className={riskTone(c.riskLevel)}>
                  {c.riskLevel}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {c.documentTitle ?? `Document #${c.documentId}`}
                {typeof c.pageNumber === "number" ? ` · p.${c.pageNumber}` : ""}
              </p>
              {c.riskReason && (
                <p className="mt-1 text-xs italic text-muted-foreground">Why: {c.riskReason}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  }
}
