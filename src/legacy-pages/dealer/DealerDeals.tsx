import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { CalendarIcon, Download, Sparkles, Loader2, RefreshCw, File } from "lucide-react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { Spinner, EmptyState, ProgressBar } from "@/components/app/Primitives";
import { StatusBadge, RiskBadge } from "@/components/app/StatusBadges";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { downloadReportPdf, getMyDocuments, triggerAnalysis, getStatus, getReportForDocument, type DocumentItem } from "@/lib/alis";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DealerDealsPage() {
  const [docs, setDocs] = useState<DocumentItem[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<number | null>(null);

  useEffect(() => {
    getMyDocuments().then((d) => setDocs(Array.isArray(d) ? d : []))
      .catch((e) => { toast.error(e?.message ?? "Failed to load"); setDocs([]); });
  }, []);

  async function handleReanalyze(docId: number) {
    setAnalyzingId(docId);
    try {
      await triggerAnalysis(docId);
      toast.success("Analysis triggered successfully");
      
      // Poll for analysis completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await getStatus(docId);
          if (status.reportReady || status.documentStatus === "ANALYZED") {
            clearInterval(pollInterval);
            setAnalyzingId(null);
            // Refresh documents to get updated reportId
            getMyDocuments().then((d) => setDocs(Array.isArray(d) ? d : []));
            toast.success("Analysis complete - report ready for download");
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
      
      // Stop polling after 2 minutes to prevent infinite loops
      setTimeout(() => {
        clearInterval(pollInterval);
        if (analyzingId === docId) {
          setAnalyzingId(null);
          toast.error("Analysis timed out - please try again");
        }
      }, 120000);
      
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to trigger analysis");
      setAnalyzingId(null);
    }
  }

  async function handleDownload(doc: DocumentItem) {
    setDownloadingDocId(doc.documentId);
    try {
      // If reportId exists, use it directly
      if (doc.reportId) {
        await downloadReportPdf(doc.reportId, `${doc.title}.pdf`);
      } else {
        // Otherwise try to get report by documentId
        const report = await getReportForDocument(doc.documentId);
        if (report && report.reportId) {
          await downloadReportPdf(report.reportId, `${doc.title}.pdf`);
          // Update the document with the reportId
          setDocs(prev => prev?.map(d => 
            d.documentId === doc.documentId ? { ...d, reportId: report.reportId } : d
          ) ?? null);
        } else {
          toast.error("Report not ready yet - please try again or refresh");
        }
      }
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to download report");
    } finally {
      setDownloadingDocId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!docs) return [];
    return docs.filter((d) => {
      if (statusFilter !== "ALL" && d.status?.toUpperCase() !== statusFilter) return false;
      if (riskFilter !== "ALL" && d.riskLevel !== riskFilter) return false;
      const ts = new Date(d.uploadedAt).getTime();
      if (from && ts < from.getTime()) return false;
      if (to && ts > to.getTime() + 86_400_000) return false;
      return true;
    });
  }, [docs, statusFilter, riskFilter, from, to]);

  return (
    <PortalLayout
      title="My Documents"
      eyebrow="Deal Maker"
      description="Browse every deal document you've submitted to ALIS."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => getMyDocuments().then((d) => setDocs(Array.isArray(d) ? d : []))}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
        </Button>
      }
    >
      <div className="mb-5 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="EXTRACTED">Extracted</SelectItem>
            <SelectItem value="ANALYZED">Analyzed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All risk levels</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>
        <DateField label="From" value={from} onChange={setFrom} />
        <DateField label="To" value={to} onChange={setTo} />
      </div>

      {!docs ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState title="No documents yet" description="No documents yet — upload your first deal document." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <div key={d.documentId} className="flex flex-col rounded-lg border border-border bg-gradient-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-display text-base font-semibold leading-tight">{d.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(d.uploadedAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                {d.riskLevel ? <RiskBadge level={d.riskLevel} /> : <span className="text-xs text-muted-foreground">No risk yet</span>}
              </div>
              {d.similarityScore != null && (
                <div className="mt-3">
                  <p className="text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Compliance score</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <ProgressBar value={d.similarityScore} />
                    <span className="text-xs text-muted-foreground">{Math.round(d.similarityScore)}</span>
                  </div>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                {(d.status?.toUpperCase() === "EXTRACTED" || d.status?.toUpperCase() === "FAILED") && (
                  <Button
                    size="sm"
                    onClick={() => handleReanalyze(d.documentId)}
                    disabled={analyzingId === d.documentId}
                  >
                    {analyzingId === d.documentId ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                    {analyzingId === d.documentId ? "Analyzing..." : "Analyze Deal"}
                  </Button>
                )}
                {analyzingId === d.documentId && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Analysis in progress...
                  </span>
                )}
                {d.fileUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                      <File className="mr-1 h-3 w-3" /> Document
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/dealer/report/${d.documentId}`}>View Report</Link>
                </Button>
                <Button
                  size="sm"
                  disabled={downloadingDocId === d.documentId}
                  onClick={() => handleDownload(d)}
                >
                  {downloadingDocId === d.documentId ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
                  {downloadingDocId === d.documentId ? "Downloading..." : "Download"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start text-left font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}
