import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, FileText, Sparkles } from "lucide-react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { StatCard, Spinner, EmptyState, ProgressBar } from "@/components/app/Primitives";
import { StatusBadge, RiskBadge } from "@/components/app/StatusBadges";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { UploadAndPoll } from "@/components/app/UploadAndPoll";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getMyDocuments, type DocumentItem } from "@/lib/alis";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function DealerDashboardPage() {
  const { session } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[] | null>(null);

  useEffect(() => {
    getMyDocuments().then((d) => setDocs(Array.isArray(d) ? d : []))
      .catch((e) => { toast.error(e?.message ?? "Failed to load deals"); setDocs([]); });
  }, []);

  if (!docs) return <PortalLayout title="Deal Overview"><Spinner /></PortalLayout>;

  const submitted = docs.length;
  const ready = docs.filter((d) => d.status?.toUpperCase() === "ANALYZED").length;
  const high = docs.filter((d) => d.riskLevel === "HIGH").length;
  const scores = docs.map((d) => d.similarityScore ?? 0).filter((s) => s > 0);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <PortalLayout
      title="Deal Overview"
      eyebrow="Deal Maker"
      description={`Welcome, ${session?.fullName ?? ""} — ${(session as { companyName?: string } | null)?.companyName ?? "Independent"}.`}
      actions={
        <div className="flex gap-2">
          <ThemeToggle />
          <Dialog>
            <DialogTrigger asChild>
              <Button><Sparkles className="mr-1.5 h-4 w-4" /> Quick Analysis</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Upload Deal Document</DialogTitle></DialogHeader>
              <UploadAndPoll variant="compact" showReadiness />
            </DialogContent>
          </Dialog>
          <Button asChild variant="outline"><Link to="/dealer/upload"><UploadCloud className="mr-1.5 h-4 w-4" /> Full Upload</Link></Button>
          <Button asChild variant="outline"><Link to="/dealer/risk"><FileText className="mr-1.5 h-4 w-4" /> Risk Summary</Link></Button>
        </div>
      }
    >
      <div className="animate-slide-in-right grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents Submitted" value={submitted} />
        <StatCard label="Reports Ready" value={ready} tone="accent" />
        <StatCard label="High Risk Deals" value={high} tone="destructive" />
        <StatCard label="Avg. Compliance Score" value={`${avg}%`} tone="gold" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Deal Pipeline</h2>
        </div>
        {docs.length === 0 ? (
          <EmptyState title="No deals submitted yet" description="Upload your first document to begin compliance review." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Document</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Risk</th>
                <th className="px-5 py-3 text-left w-44">Score</th>
                <th className="px-5 py-3 text-left">Ready</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.documentId} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{d.title}</td>
                  <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-3">{d.riskLevel ? <RiskBadge level={d.riskLevel} /> : "—"}</td>
                  <td className="px-5 py-3">
                    {d.similarityScore != null ? (
                      <div className="flex items-center gap-2">
                        <ProgressBar value={d.similarityScore} />
                        <span className="text-xs text-muted-foreground">{Math.round(d.similarityScore)}</span>
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{d.status?.toUpperCase() === "ANALYZED" ? "Yes" : "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalLayout>
  );
}
