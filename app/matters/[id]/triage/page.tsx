"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Check, Clock3, FileText, LoaderCircle, ShieldAlert, Users } from "lucide-react";
import { AlisShell } from "@/components/alis-shell";

type TriageResult = {
  matter_summary: string;
  parties_involved: string[];
  timeline_of_events: { date: string; event: string }[];
  extracted_clauses: { issue_type: string; exact_quote: string; business_impact: string }[];
  identified_gaps: string[];
  recommended_next_steps: string[];
};
type JobStatus = { task_id: string; status: string; message: string; result?: TriageResult | null; error?: string | null };

const API_BASE = (process.env.NEXT_PUBLIC_JAVA_API_URL || "http://localhost:8080").replace(/\/$/, "");
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export default function SavedTriagePage() {
  const params = useParams<{ id: string }>();
  const matterId = String(params.id || "");
  const [analysis, setAnalysis] = useState<TriageResult | null>(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("Loading the latest situation map…");
  const [error, setError] = useState("");
  const [preparedGaps, setPreparedGaps] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = window.localStorage.getItem("alis_token");
        if (!token) throw new Error("Sign in to view this matter's situation map.");
        for (let attempt = 0; attempt < 90; attempt += 1) {
          const response = await fetch(API_BASE + "/api/v1/matters/" + encodeURIComponent(matterId) + "/triage/latest", {
            headers: { Authorization: "Bearer " + token },
          });
          const payload: unknown = await response.json().catch(() => null);
          if (!response.ok) {
            const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
            throw new Error(typeof body.message === "string" ? body.message : typeof body.detail === "string" ? body.detail : "ALIS could not load the situation map (" + response.status + ").");
          }
          const current = payload as JobStatus;
          if (!active) return;
          setStatus(current.status);
          setMessage(current.message || "Refreshing status…");
          if (current.status === "COMPLETED" && current.result) {
            setAnalysis(current.result);
            return;
          }
          if (current.status === "FAILED") throw new Error(current.error || "This situation map could not be completed. You can start a new analysis from the Scanner.");
          await wait(2000);
        }
        throw new Error("This analysis is taking longer than expected. Return later and reopen the saved matter.");
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "ALIS could not load the saved situation map.");
      }
    }
    if (matterId) void load();
    return () => { active = false; };
  }, [matterId]);

  function toggleGap(index: number) {
    setPreparedGaps((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  return (
    <AlisShell>
      <div className="max-w-5xl">
        <Link href="/matters" className="inline-flex items-center gap-2 text-sm font-medium text-black/50 hover:text-[#176b5b]"><ArrowLeft size={16} />Back to matters</Link>
        <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">Saved situation map</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Matter #{matterId}</h1><p className="mt-3 text-sm leading-6 text-black/55">A structured preparation record, saved with this matter.</p></div>

        {!analysis && !error && <div aria-live="polite" className="mt-8 flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-5"><LoaderCircle size={20} className="mt-0.5 animate-spin text-[#176b5b]" /><div><p className="font-semibold">{status === "PROCESSING" ? "Preparing your situation map" : "Retrieving your situation map"}</p><p className="mt-1 text-sm leading-6 text-black/55">{message}</p></div></div>}
        {error && <div role="alert" className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p>{error}</p><Link href="/scanner" className="mt-3 inline-flex items-center gap-2 font-semibold underline underline-offset-4">Return to the Situation Scanner</Link></div></div>}

        {analysis && <section className="mt-8 space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-[#d9e5df] bg-[#eef4f1] p-4 sm:p-5"><ShieldAlert size={20} className="mt-0.5 shrink-0 text-[#176b5b]" /><div><p className="font-semibold">AI-generated preparation aid, not legal advice</p><p className="mt-1 text-sm leading-6 text-black/65">This map organises the information supplied and may be incomplete or mistaken. Check it against original records and verify time-sensitive matters with a qualified professional.</p></div></div>

          <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Situation summary</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-black/65">{analysis.matter_summary}</p></article>
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6"><h2 className="flex items-center gap-2 text-base font-semibold"><Users size={17} className="text-[#176b5b]" />Parties involved</h2>{analysis.parties_involved.length ? <ul className="mt-4 space-y-2">{analysis.parties_involved.map((item, index) => <li key={index} className="rounded-xl bg-[#f7f8f7] p-3 text-sm leading-5">{item}</li>)}</ul> : <p className="mt-3 text-sm text-black/45">No parties could be reliably identified.</p>}</article>
            <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6"><h2 className="flex items-center gap-2 text-base font-semibold"><Clock3 size={17} className="text-[#176b5b]" />Timeline</h2>{analysis.timeline_of_events.length ? <ol className="mt-4 space-y-4">{analysis.timeline_of_events.map((item, index) => <li key={index} className="border-l border-[#d9e5df] pl-4"><p className="text-xs font-semibold text-[#176b5b]">{item.date === "Unknown" ? "Date not established" : item.date}</p><p className="mt-1 text-sm leading-6 text-black/65">{item.event}</p></li>)}</ol> : <p className="mt-3 text-sm text-black/45">No material events could be reliably dated.</p>}</article>
          </div>

          <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Identified gaps</h2><p className="mt-1 text-sm leading-6 text-black/50">Use this as a preparation checklist. These marks apply only to this page session.</p></div><span className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/55">{preparedGaps.length} / {analysis.identified_gaps.length} gathered</span></div>{analysis.identified_gaps.length ? <ul className="mt-5 space-y-3">{analysis.identified_gaps.map((gap, index) => { const done = preparedGaps.includes(index); return <li key={index} className={"flex items-start gap-3 rounded-2xl border p-4 " + (done ? "border-[#cddfd5] bg-[#f5f9f6]" : "border-black/10")}><button type="button" aria-pressed={done} onClick={() => toggleGap(index)} aria-label={done ? "Mark not gathered" : "Mark gathered"} className={"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border " + (done ? "border-[#176b5b] bg-[#176b5b] text-white" : "border-black/25 text-transparent")}><Check size={13} /></button><span className={"text-sm leading-6 " + (done ? "text-black/45 line-through" : "text-black/70")}>{gap}</span></li>; })}</ul> : <p className="mt-4 text-sm text-black/50">No material gaps were identified from the supplied information. This does not confirm that the record is complete.</p>}</article>

          <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Relevant document wording</h2>{analysis.extracted_clauses.length ? <div className="mt-4 space-y-4">{analysis.extracted_clauses.map((item, index) => <div key={index} className="rounded-2xl border border-black/10 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#176b5b]">{item.issue_type}</p>{item.exact_quote && <blockquote className="mt-3 border-l-2 border-[#176b5b]/40 pl-3 text-sm leading-6 text-black/75">{item.exact_quote}</blockquote>}<p className="mt-3 text-sm leading-6 text-black/55">{item.business_impact}</p></div>)}</div> : <p className="mt-3 text-sm text-black/50">No reliable clause quotation was produced for this report.</p>}</article>

          <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Recommended preparation steps</h2><ol className="mt-4 space-y-3">{analysis.recommended_next_steps.map((item, index) => <li key={index} className="flex gap-3 rounded-2xl bg-[#f7f8f7] p-4"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#173d35] text-xs font-semibold text-white">{index + 1}</span><p className="pt-0.5 text-sm leading-6 text-black/65">{item}</p></li>)}</ol></article>
          <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-black/55"><FileText size={18} className="mt-0.5 shrink-0 text-[#176b5b]" /><p><strong className="text-[#15221f]">Preserve the source documents.</strong> The situation map is a summary aid. Original agreements, notices, messages and proof of receipt remain important evidence.</p></div>
        </section>}
      </div>
    </AlisShell>
  );
}
