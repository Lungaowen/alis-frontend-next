"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Check, Clock3, FileText, LoaderCircle, LockKeyhole, ShieldAlert, Users } from "lucide-react";
import { AlisShell } from "@/components/alis-shell";

type WorkflowId = "general" | "ccma_dispute" | "lease_dispute" | "popia_incident";
type TimelineItem = { date: string; event: string };
type ClauseItem = { issue_type: string; exact_quote: string; business_impact: string };
type TriageResult = {
  matter_summary: string;
  parties_involved: string[];
  timeline_of_events: TimelineItem[];
  extracted_clauses: ClauseItem[];
  identified_gaps: string[];
  recommended_next_steps: string[];
};
type JobStatus = { task_id: string; status: string; message: string; result?: TriageResult | null; error?: string | null };
type MatterCreated = { id: number; title?: string };

const API_BASE = (process.env.NEXT_PUBLIC_JAVA_API_URL || "http://localhost:8080").replace(/\/$/, "");
const workflowOptions: { id: WorkflowId; label: string; summary: string; checklist: string[]; quickStart: string }[] = [
  { id: "general", label: "General situation", summary: "Map the facts and identify what still needs confirming.", checklist: ["What happened, and who was involved?", "Which dates, amounts or promises matter?", "Which records can confirm the account?"], quickStart: "I need help organising a situation before I speak with a legal professional." },
  { id: "ccma_dispute", label: "Employment / CCMA", summary: "Prepare employment events, notices and relevant records.", checklist: ["Describe the employment event and date.", "Keep the contract, payslips and disciplinary records.", "Confirm when any notice or referral document was received."], quickStart: "I have an employment-related dispute and want to organise the facts before seeking advice." },
  { id: "lease_dispute", label: "Lease / landlord notice", summary: "Organise the agreement, payments, notices and property evidence.", checklist: ["Keep the full lease and addenda.", "Record relevant payments, repairs and communications.", "Confirm the wording and receipt date of any notice."], quickStart: "I have a lease or landlord-related issue and want to organise the facts and evidence." },
  { id: "popia_incident", label: "Personal information incident", summary: "Record known events, affected information and evidence gaps.", checklist: ["Describe when the incident was discovered.", "List what information may be involved and who may be affected.", "Preserve relevant system logs and note any containment steps."], quickStart: "I am concerned about a possible personal-information incident and need to organise what is known." },
];

async function apiRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(API_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(init?.headers || {}),
    },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const item = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const message = typeof item.detail === "string" ? item.detail : typeof item.message === "string" ? item.message : "ALIS request failed (" + response.status + ").";
    throw new Error(message);
  }
  return payload as T;
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export default function Scanner() {
  const [workflow, setWorkflow] = useState<WorkflowId>("general");
  const [situation, setSituation] = useState("");
  const [documentContext, setDocumentContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [stageMessage, setStageMessage] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<TriageResult | null>(null);
  const [matterId, setMatterId] = useState<number | null>(null);
  const [taskId, setTaskId] = useState("");
  const [preparedGaps, setPreparedGaps] = useState<number[]>([]);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("workflow");
    if (["general", "ccma_dispute", "lease_dispute", "popia_incident"].includes(value || "")) {
      setWorkflow(value as WorkflowId);
      const selected = workflowOptions.find((item) => item.id === value);
      if (selected && !situation) setSituation(selected.quickStart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedWorkflow = workflowOptions.find((item) => item.id === workflow) || workflowOptions[0];

  async function startAnalysis() {
    setError("");
    setAnalysis(null);
    setMatterId(null);
    setTaskId("");
    setPreparedGaps([]);
    setLoading(true);
    try {
      const token = window.localStorage.getItem("alis_token");
      if (!token) throw new Error("Please sign in to ALIS before creating a matter and running a situation map.");

      setStageMessage("Creating a matter in your workspace…");
      const matter = await apiRequest<MatterCreated>("/api/v1/matters", token, {
        method: "POST",
        body: JSON.stringify({
          title: "Situation triage: " + selectedWorkflow.label,
          description: situation.trim().slice(0, 1500),
        }),
      });
      if (!matter?.id || !Number.isFinite(Number(matter.id))) {
        throw new Error("ALIS created no usable matter reference. Please refresh your matters list and try again.");
      }
      setMatterId(Number(matter.id));

      const snippets = documentContext.trim()
        ? documentContext.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean).slice(0, 10)
        : [];

      setStageMessage("Queueing the situation map…");
      const queued = await apiRequest<JobStatus>("/api/v1/matters/" + matter.id + "/triage", token, {
        method: "POST",
        body: JSON.stringify({
          workflow,
          narrative: situation.trim(),
          jurisdiction: "South Africa",
          document_context: snippets,
        }),
      });
      if (!queued?.task_id) throw new Error("ALIS did not return a triage job reference. Please try again.");
      setTaskId(queued.task_id);
      setStageMessage(queued.message || "Your situation map is queued.");

      for (let attempt = 0; attempt < 90; attempt += 1) {
        await wait(2000);
        const current = await apiRequest<JobStatus>(
          "/api/v1/matters/" + matter.id + "/triage/" + encodeURIComponent(queued.task_id), token,
        );
        setStageMessage(current.message || "ALIS is organising the supplied information…");
        if (current.status === "COMPLETED" && current.result) {
          setAnalysis(current.result);
          setStageMessage("Situation map ready for review.");
          return;
        }
        if (current.status === "FAILED") throw new Error(current.error || "The situation map could not be completed. Your matter has been created; you can retry later.");
      }
      setError("The analysis is taking longer than expected. Your matter and job reference have been created. Retry the status check later or seek direct help if a deadline may be close.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while preparing your situation map.");
    } finally {
      setLoading(false);
    }
  }

  function toggleGap(index: number) {
    setPreparedGaps((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  return (
    <AlisShell>
      <div className="max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">Situation scanner · South Africa</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Build a clear record of what happened.</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-black/55">Describe the situation in your own words. ALIS will organise the details you provide, flag what is missing and prepare a practical checklist for a legal consultation.</p>
          </div>
          <Link href="/workflows" className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium hover:bg-black/[0.03]">Browse workflows <ArrowRight size={15} /></Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
          <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
            <label htmlFor="workflow" className="text-sm font-semibold">What kind of situation is this?</label>
            <select id="workflow" value={workflow} onChange={(event) => setWorkflow(event.target.value as WorkflowId)} className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#176b5b] focus:ring-2 focus:ring-[#176b5b]/15">
              {workflowOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <p className="mt-2 text-sm leading-6 text-black/50">{selectedWorkflow.summary}</p>

            <label htmlFor="situation" className="mt-6 block text-sm font-semibold">Tell ALIS what happened</label>
            <textarea id="situation" value={situation} onChange={(event) => setSituation(event.target.value)} maxLength={20000} placeholder="Include what happened, who was involved, dates you know, what each person said, and what outcome you are trying to understand…" className="mt-2 min-h-48 w-full resize-y rounded-2xl border border-black/10 bg-[#fbfcfb] p-4 text-sm leading-6 outline-none transition placeholder:text-black/30 focus:border-[#176b5b] focus:ring-2 focus:ring-[#176b5b]/15" />
            <div className="mt-2 flex justify-between gap-3 text-xs text-black/40"><span>Only include information relevant to this matter.</span><span>{situation.length.toLocaleString()} / 20,000</span></div>

            <label htmlFor="document-context" className="mt-6 block text-sm font-semibold">Relevant wording or records <span className="font-normal text-black/40">(optional)</span></label>
            <textarea id="document-context" value={documentContext} onChange={(event) => setDocumentContext(event.target.value)} placeholder="Paste an important paragraph from a notice, agreement or email. Separate multiple excerpts with a blank line. Do not paste passwords or access tokens." className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-black/10 bg-[#fbfcfb] p-4 text-sm leading-6 outline-none transition placeholder:text-black/30 focus:border-[#176b5b] focus:ring-2 focus:ring-[#176b5b]/15" />
            <p className="mt-2 text-xs leading-5 text-black/40">Text pasted here is treated as source material, not as instructions to the AI. For complete files, use Evidence &amp; Documents.</p>

            <button onClick={startAnalysis} disabled={loading || situation.trim().length < 10} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173d35] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#205248] disabled:cursor-not-allowed disabled:opacity-40">
              {loading ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowRight size={17} />}
              {loading ? "Preparing situation map…" : "Create situation map"}
            </button>
            {error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">The analysis needs attention</p><p className="mt-1">{error}</p>{taskId && matterId && <p className="mt-2 text-xs">Matter #{matterId} · Job {taskId}</p>}</div></div>}
            {loading && <div aria-live="polite" className="mt-4 flex items-start gap-3 rounded-xl border border-black/10 bg-[#f7f8f7] p-4 text-sm"><Clock3 size={18} className="mt-0.5 shrink-0 text-[#176b5b]" /><div><p className="font-semibold">Working on your matter</p><p className="mt-1 leading-6 text-black/55">{stageMessage}</p><p className="mt-2 text-xs text-black/40">The request is processed in the background. Keep this page open while ALIS checks for the result.</p></div></div>}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Useful details to gather</h2>
              <ul className="mt-4 space-y-3">{selectedWorkflow.checklist.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-black/60"><Check size={16} className="mt-1 shrink-0 text-[#176b5b]" />{item}</li>)}</ul>
            </div>
            <div className="rounded-3xl border border-[#d9e5df] bg-[#eef4f1] p-5 sm:p-6">
              <div className="flex items-start gap-3"><ShieldAlert size={20} className="mt-0.5 shrink-0 text-[#176b5b]" /><div><h2 className="text-sm font-semibold">AI triage, not legal advice</h2><p className="mt-2 text-sm leading-6 text-black/65">ALIS organises the information supplied. It does not decide whether a party broke the law, predict a legal outcome or replace a qualified legal practitioner.</p></div></div>
              <div className="mt-4 flex items-start gap-2 border-t border-[#173d35]/10 pt-4 text-xs leading-5 text-black/55"><LockKeyhole size={15} className="mt-0.5 shrink-0" /><span>Use the private ALIS workspace for case records. Share only material needed to understand the situation.</span></div>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6"><div className="flex items-center gap-2 text-sm font-semibold"><Users size={17} className="text-[#176b5b]" />Before you consult</div><p className="mt-2 text-sm leading-6 text-black/55">Keep original documents and proof of receipt. If a hearing, court date or response deadline may be close, verify it promptly with a qualified professional or the relevant authority.</p></div>
          </aside>
        </div>

        {analysis && (
          <section className="mt-8 space-y-5" aria-labelledby="result-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">Preliminary analysis</p><h2 id="result-heading" className="mt-2 text-2xl font-semibold tracking-tight">Your situation map</h2><p className="mt-2 text-sm text-black/50">Matter #{matterId} · Review the source facts and unresolved gaps below.</p></div>
              {matterId && <Link href={"/matter/" + matterId} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium hover:bg-black/[0.03]">Open matter <ArrowRight size={15} /></Link>}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[#d9e5df] bg-[#eef4f1] p-4 sm:p-5"><ShieldAlert size={20} className="mt-0.5 shrink-0 text-[#176b5b]" /><div><p className="font-semibold">AI-generated preparation aid</p><p className="mt-1 text-sm leading-6 text-black/65">This map reflects the supplied narrative and excerpts. It may be incomplete or mistaken. Confirm important facts against original records and get professional advice before acting on legal issues or deadlines.</p></div></div>

            <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"><h3 className="text-lg font-semibold">Situation summary</h3><p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-black/65">{analysis.matter_summary}</p></article>

            <div className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6"><h3 className="text-base font-semibold">Parties involved</h3>{analysis.parties_involved.length ? <ul className="mt-4 space-y-2">{analysis.parties_involved.map((party, index) => <li key={index} className="rounded-xl bg-[#f7f8f7] px-3 py-2.5 text-sm leading-5">{party}</li>)}</ul> : <p className="mt-3 text-sm text-black/45">No parties could be identified reliably from the supplied information.</p>}</article>
              <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6"><h3 className="text-base font-semibold">Timeline of events</h3>{analysis.timeline_of_events.length ? <ol className="mt-4 space-y-4">{analysis.timeline_of_events.map((item, index) => <li key={index} className="relative border-l border-[#d9e5df] pl-4"><p className="text-xs font-semibold text-[#176b5b]">{item.date === "Unknown" ? "Date not established" : item.date}</p><p className="mt-1 text-sm leading-6 text-black/65">{item.event}</p></li>)}</ol> : <p className="mt-3 text-sm text-black/45">No material events could be reliably placed in a timeline.</p>}</article>
            </div>

            <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">Identified gaps</h3><p className="mt-1 text-sm leading-6 text-black/50">These are the facts or records ALIS could not confirm. Mark an item as gathered when you locate the supporting material.</p></div><span className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/55">{preparedGaps.length} / {analysis.identified_gaps.length} gathered</span></div>
              {analysis.identified_gaps.length ? <ul className="mt-5 space-y-3">{analysis.identified_gaps.map((gap, index) => { const done = preparedGaps.includes(index); return <li key={index} className={"flex items-start gap-3 rounded-2xl border p-4 " + (done ? "border-[#cddfd5] bg-[#f5f9f6]" : "border-black/10 bg-white")}><button type="button" onClick={() => toggleGap(index)} aria-pressed={done} aria-label={done ? "Mark evidence as not yet gathered" : "Mark evidence as gathered"} className={"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border " + (done ? "border-[#176b5b] bg-[#176b5b] text-white" : "border-black/25 bg-white text-transparent")}><Check size={13} /></button><span className={"text-sm leading-6 " + (done ? "text-black/45 line-through" : "text-black/70")}>{gap}</span></li>; })}</ul> : <p className="mt-4 text-sm text-black/50">No material gaps were identified from the information supplied. This does not confirm that the record is complete.</p>}
              <p className="mt-3 text-xs text-black/40">Checklist marks are temporary for this page session and do not certify that an issue has been legally resolved.</p>
            </article>

            <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"><h3 className="text-lg font-semibold">Relevant document wording</h3><p className="mt-1 text-sm leading-6 text-black/50">Only exact source text should appear as a quotation. Check each extract against the original document.</p>
              {analysis.extracted_clauses.length ? <div className="mt-5 space-y-4">{analysis.extracted_clauses.map((clause, index) => <div key={index} className="rounded-2xl border border-black/10 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#176b5b]">{clause.issue_type}</p>{clause.exact_quote && <blockquote className="mt-3 border-l-2 border-[#176b5b]/40 pl-3 text-sm leading-6 text-black/75">{clause.exact_quote}</blockquote>}<p className="mt-3 text-sm leading-6 text-black/55">{clause.business_impact}</p></div>)}</div> : <p className="mt-4 rounded-xl bg-[#f7f8f7] p-4 text-sm leading-6 text-black/50">No reliable clause quotation was produced. Provide the relevant document text or review the original document.</p>}
            </article>

            <article className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"><h3 className="text-lg font-semibold">Recommended preparation steps</h3><ol className="mt-4 space-y-3">{analysis.recommended_next_steps.map((step, index) => <li key={index} className="flex gap-3 rounded-2xl bg-[#f7f8f7] p-4"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#173d35] text-xs font-semibold text-white">{index + 1}</span><p className="pt-0.5 text-sm leading-6 text-black/65">{step}</p></li>)}</ol></article>

            <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-black/55"><FileText size={18} className="mt-0.5 shrink-0 text-[#176b5b]" /><p><strong className="text-[#15221f]">Keep the originals.</strong> Preserve signed agreements, original notices, email headers, payment records and proof of receipt. An AI-generated map is not a substitute for the underlying evidence.</p></div>
          </section>
        )}
      </div>
    </AlisShell>
  );
}
