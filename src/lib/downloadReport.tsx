// Client-side PDF report generator. Fetches from Supabase first, falls back to Java.
import { pdf } from "@react-pdf/renderer";
import { supabase } from "./supabaseClient";
import { httpGet } from "./http";
import type { ReportInfo } from "./alis";
import {
  ReportPDFDocument,
  type ParsedSummary,
} from "@/components/reports/ReportPDFDocument";

function slug(s: string | undefined, max = 60): string {
  return (s ?? "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max) || "report";
}

function safeParseSummary(raw: unknown): ParsedSummary | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as ParsedSummary;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as ParsedSummary;
  } catch {
    return null;
  }
}

function mapSupabaseRow(row: Record<string, unknown>): ReportInfo {
  return {
    reportId: Number(row.report_id ?? row.reportId),
    documentId: Number(row.document_id ?? row.documentId),
    clientId: Number(row.client_id ?? row.clientId),
    documentTitle: (row.document_title ?? row.documentTitle ?? "Untitled") as string,
    riskLevel: (row.risk_level ?? row.riskLevel ?? "LOW") as ReportInfo["riskLevel"],
    analysisStatus: (row.analysis_status ?? row.analysisStatus ?? "COMPLETED") as ReportInfo["analysisStatus"],
    similarityScore: Number(row.similarity_score ?? row.similarityScore ?? 0),
    aiRecommendation: (row.ai_recommendation ?? row.aiRecommendation ?? "") as string,
    aiExplanation: (row.ai_explanation ?? row.aiExplanation ?? "") as string,
    generatedAt: (row.generated_at ?? row.generatedAt ?? new Date().toISOString()) as string,
    modelVersion: (row.model_version ?? row.modelVersion) as string | undefined,
  };
}

async function getReportFromSupabase(
  reportId: number
): Promise<{ report: ReportInfo; summary: ParsedSummary | null } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("report")
    .select("*")
    .eq("report_id", reportId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    report: mapSupabaseRow(row),
    summary: safeParseSummary(row.report_summary_json ?? row.reportSummaryJson),
  };
}

async function getReportFromJava(
  reportId: number
): Promise<{ report: ReportInfo; summary: ParsedSummary | null }> {
  const r = await httpGet<ReportInfo & { reportSummaryJson?: string | object }>(
    `/api/reports/${reportId}`
  );
  return {
    report: r,
    summary: safeParseSummary((r as { reportSummaryJson?: unknown }).reportSummaryJson),
  };
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer revoke so Safari can start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Generate and download a PDF report for the given report ID.
 * Tries Supabase first, falls back to the Java backend.
 */
export async function downloadReportPdf(reportId: number, _filenameHint?: string): Promise<void> {
  let payload = await getReportFromSupabase(reportId).catch(() => null);
  if (!payload) {
    try {
      payload = await getReportFromJava(reportId);
    } catch (e) {
      const msg = (e as Error)?.message ?? "Unable to load report";
      throw new Error(`Could not load report #${reportId}: ${msg}`);
    }
  }

  const { report, summary } = payload;

  let blob: Blob;
  try {
    blob = await pdf(<ReportPDFDocument report={report} summary={summary} />).toBlob();
  } catch (e) {
    throw new Error(`Failed to render PDF: ${(e as Error)?.message ?? "unknown error"}`);
  }

  const filename = `ALIS-Report-${reportId}-${slug(report.documentTitle)}.pdf`;
  triggerBrowserDownload(blob, filename);
}
