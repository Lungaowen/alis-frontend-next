import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileCheck2, Loader2, Play, RefreshCcw, Sparkles, UploadCloud } from "lucide-react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { Spinner, EmptyState, Gauge, ProgressBar } from "@/components/app/Primitives";
import { StatusBadge, RiskBadge } from "@/components/app/StatusBadges";
import { Button } from "@/components/ui/button";
import {
  getStatus, getResult, triggerAnalysis, downloadReportPdf,
  uploadDocument,
  type DocumentItem, type ReportInfo,
} from "@/lib/alis";
import { documentApi } from "@/lib/javaApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Per-document processing state
interface DocState {
  step: "idle" | "triggering" | "processing" | "done" | "failed";
  message?: string;
}

export default function LegalDocumentsPage() {
  const [docs, setDocs]             = useState<DocumentItem[] | null>(null);
  const [aiByDoc, setAiByDoc]       = useState<Record<number, ReportInfo>>({});
  const [docState, setDocState]     = useState<Record<number, DocState>>({});
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct]   = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef  = useRef<HTMLInputElement>(null);
  const pollers  = useRef<Record<number, number>>({});

  const load = useCallback(() => {
    documentApi.getMyDocuments()
      .then((d) => setDocs(Array.isArray(d) ? d : []))
      .catch((e) => { toast.error(e?.message ?? "Failed to load documents"); setDocs([]); });
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => {
    Object.values(pollers.current).forEach(clearInterval);
  }, []);

  function setDs(id: number, s: Partial<DocState>) {
    setDocState((m) => ({ ...m, [id]: { ...m[id], step: "idle", ...s } }));
  }

  function stopPoller(id: number) {
    if (pollers.current[id]) { clearInterval(pollers.current[id]); delete pollers.current[id]; }
  }

  // ── Upload ────────────────────────────────────────────────────────────
  async function handleUpload(file: File) {
    if (file.type !== "application/pdf") { toast.error("Only PDF files accepted"); return; }
    setUploadFile(file);
    setUploadPct(0);
    try {
      const res = await uploadDocument(file, { title: file.name, documentType: "SERVICE_AGREEMENT" }, setUploadPct);
      toast.success("Uploaded — extracting…");
      load();
      if (res.documentId) pollExtraction(res.documentId);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Upload failed");
    } finally {
      setUploadFile(null);
      setUploadPct(0);
    }
  }

  // ── Poll extraction progress right after upload ───────────────────────
  // The Python pipeline (Stages 1-7) runs automatically after upload and
  // moves the document from PENDING/PROCESSING -> EXTRACTED. This poller
  // surfaces that progress in the table and refreshes the list once done,
  // so the new document appears immediately and updates without a manual
  // page refresh.
  function pollExtraction(id: number) {
    stopPoller(id);
    setDs(id, { step: "processing", message: "Extracting…" });

    pollers.current[id] = window.setInterval(async () => {
      try {
        const s = await getStatus(id);
        const docStatus = s.documentStatus?.toUpperCase();

        if (docStatus === "EXTRACTED" || docStatus === "ANALYZED") {
          stopPoller(id);
          setDs(id, { step: "idle" });
          load();
        } else if (docStatus === "FAILED" || s.analysisStatus === "FAILED") {
          stopPoller(id);
          setDs(id, { step: "failed", message: "Extraction failed" });
          load();
        } else {
          setDs(id, { step: "processing", message: s.message ?? "Extracting…" });
        }
      } catch {
        // keep polling silently on transient errors
      }
    }, 2500);
  }

  // ── Poll after trigger ────────────────────────────────────────────────
  function startPolling(id: number) {
    stopPoller(id);
    setDs(id, { step: "processing", message: "Analysis running…" });

    const toastId = toast.loading("Analysing document…", { id: `poll-${id}`, duration: Infinity });

    pollers.current[id] = window.setInterval(async () => {
      try {
        const s = await getStatus(id);

        if (s.reportReady) {
          stopPoller(id);
          setDs(id, { step: "done", message: "Analysis complete" });
          toast.success("Analysis complete ✓", { id: toastId });
          try {
            const r = await getResult(id);
            setAiByDoc((m) => ({ ...m, [id]: r }));
          } catch { /* result fetch failed silently */ }
          load();
        } else if (s.documentStatus === "FAILED" || s.analysisStatus === "FAILED") {
          stopPoller(id);
          setDs(id, { step: "failed", message: "Analysis failed" });
          toast.error("Analysis failed — retry or check the document", { id: toastId });
          load();
        } else {
          const msg = s.message ?? "Processing…";
          setDs(id, { step: "processing", message: msg });
          toast.loading(msg, { id: toastId, duration: Infinity });
        }
      } catch { /* keep polling silently on transient errors */ }
    }, 3000);
  }

  // ── Trigger ───────────────────────────────────────────────────────────
  async function handleTrigger(d: DocumentItem) {
    try {
      setDs(d.documentId, { step: "triggering", message: "Sending request…" });
      await triggerAnalysis(d.documentId);
      startPolling(d.documentId);
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status ?? 0;
      setDs(d.documentId, { step: "idle" });
      if (status === 409) {
        toast.warning("Another document is being processed. Please wait and try again.");
      } else {
        toast.error(e?.message ?? "Could not trigger analysis");
      }
    }
  }

  async function viewReport(id: number) {
    try {
      const r = await getResult(id);
      setAiByDoc((m) => ({ ...m, [id]: r }));
    } catch (e) {
      toast.error((e as Error)?.message ?? "No report found");
    }
  }

  const canTrigger = (s: string) =>
    ["PENDING", "EXTRACTED", "ANALYZED", "FAILED"].includes(s?.toUpperCase());

  if (!docs) return <PortalLayout title="Document Centre"><Spinner /></PortalLayout>;

  return (
    <PortalLayout
      title="Document Centre"
      eyebrow="Practitioner"
      description="Upload PDFs then trigger compliance analysis when ready."
    >
      <div className="space-y-6">

        {/* ── Drop zone ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f); }}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-8 py-10 transition-colors",
            isDragging ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/60"
          )}
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium">
            {uploadFile ? uploadFile.name : "Drop a PDF here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PDF only · 50 MB max</p>

          {uploadFile ? (
            <div className="mt-4 w-full max-w-xs space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span><span>{uploadPct}%</span>
              </div>
              <ProgressBar value={uploadPct} />
            </div>
          ) : (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => fileRef.current?.click()}>
              Choose file
            </Button>
          )}

          <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
          />
        </div>

        {/* ── Documents table ── */}
        {docs.length === 0 ? (
          <EmptyState title="No documents yet" description="Upload a PDF above to get started." />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Uploaded</th>
                  <th className="px-4 py-3 text-left">Risk</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const ai           = aiByDoc[d.documentId];
                  const ds           = docState[d.documentId] ?? { step: "idle" };
                  const analyzed     = d.status?.toUpperCase() === "ANALYZED";
                  const isTriggering = ds.step === "triggering";
                  const isProcessing = ds.step === "processing" || d.status?.toUpperCase() === "PROCESSING";
                  const isBusy       = isTriggering || isProcessing;
                  const isFailed     = ds.step === "failed";

                  return (
                    <React.Fragment key={d.documentId}>
                      <tr className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{d.title}</td>
                        <td className="px-4 py-3">
                          {isProcessing ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                              <Loader2 className="h-3 w-3 animate-spin" /> Analysing…
                            </span>
                          ) : (
                            <StatusBadge status={d.status} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(d.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {d.riskLevel ? <RiskBadge level={d.riskLevel} /> : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant={analyzed ? "outline" : "default"}
                              disabled={isBusy || !canTrigger(d.status)}
                              onClick={() => handleTrigger(d)}
                            >
                              {isTriggering ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Sending…</> :
                               isProcessing  ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Running…</> :
                               analyzed      ? <><RefreshCcw className="mr-1 h-3 w-3" />Re-analyze</> :
                                              <><Play className="mr-1 h-3 w-3" />Trigger Analysis</>}
                            </Button>

                            {(analyzed || ds.step === "done") && (
                              <Button size="sm" variant="outline" onClick={() => viewReport(d.documentId)}>
                                <Sparkles className="mr-1 h-3 w-3" /> View Report
                              </Button>
                            )}
                          </div>

                          {ds.message && (isProcessing || isFailed) && (
                            <p className={cn(
                              "mt-1.5 text-right text-[11px]",
                              isFailed ? "text-destructive" : "text-muted-foreground"
                            )}>
                              {ds.message}
                            </p>
                          )}
                        </td>
                      </tr>

                      {/* Processing progress row */}
                      {isProcessing && (
                        <tr className="border-t border-border bg-amber-50/40">
                          <td colSpan={5} className="px-4 py-3">
                            <div className="flex items-center gap-4">
                              <ol className="flex gap-3">
                                {(["Uploaded", "Extracting", "Analysing", "Report"] as const).map((label, i) => {
                                  const currentStep = d.status?.toUpperCase() === "EXTRACTED" ? 2 : 1;
                                  const state = i < currentStep ? "done" : i === currentStep ? "current" : "pending";
                                  return (
                                    <li key={label} className={cn(
                                      "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium",
                                      state === "done"    ? "border-accent bg-accent/10 text-accent" :
                                      state === "current" ? "border-amber-400 bg-amber-50 text-amber-700" :
                                                            "border-border text-muted-foreground"
                                    )}>
                                      {state === "done"    ? <FileCheck2 className="h-3 w-3" /> :
                                       state === "current" ? <Loader2 className="h-3 w-3 animate-spin" /> :
                                                             <span className="w-3 text-center">{i + 1}</span>}
                                      {label}
                                    </li>
                                  );
                                })}
                              </ol>
                              <span className="text-xs text-muted-foreground">{ds.message}</span>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* AI insight row */}
                      {ai && (
                        <tr className="border-t border-border bg-accent/5">
                          <td colSpan={5} className="px-4 py-5">
                            <div className="flex flex-wrap items-start gap-6">
                              <div className="flex items-center gap-2 text-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                                <Sparkles className="h-3 w-3" /> AI Insight
                              </div>
                              <Gauge
                                value={ai.riskLevel === "LOW" ? 90 : ai.riskLevel === "MEDIUM" ? 60 : 25}
                                size={84} label="Risk"
                                tone={ai.riskLevel === "LOW" ? "accent" : ai.riskLevel === "MEDIUM" ? "gold" : "destructive"}
                              />
                              <Gauge value={ai.similarityScore ?? 0} size={84} label="Similarity" tone="primary" />
                              <div className="flex-1 min-w-[200px]">
                                <p className="text-xs font-semibold text-foreground mb-1">Recommendation</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {ai.aiRecommendation?.slice(0, 300) ?? ""}
                                  {(ai.aiRecommendation?.length ?? 0) > 300 ? "…" : ""}
                                </p>
                                {ai.actName && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    Act: <span className="font-medium text-foreground">{ai.actName}</span>
                                    {ai.lawRuleKeyword && <> · Rule: <span className="font-medium text-foreground">{ai.lawRuleKeyword}</span></>}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm" variant="outline"
                                onClick={() => downloadReportPdf(ai.reportId, `${ai.documentTitle ?? `report-${ai.reportId}`}.pdf`)}
                              >
                                <Download className="mr-1 h-3 w-3" /> PDF
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}