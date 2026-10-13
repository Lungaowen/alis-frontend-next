"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CircleAlert, ClipboardList, FileText, LoaderCircle } from "lucide-react";
import { AlisShell } from "@/components/alis-shell";

const API_BASE = (process.env.NEXT_PUBLIC_JAVA_API_URL || "http://localhost:8080").replace(/\/$/, "");
type Matter = { id: number; title: string; description?: string | null; status?: string; createdAt?: string; updatedAt?: string };

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadMatters() {
      try {
        const token = window.localStorage.getItem("alis_token");
        if (!token) throw new Error("Sign in to view matters saved to your ALIS workspace.");
        const response = await fetch(API_BASE + "/api/v1/matters", { headers: { Authorization: "Bearer " + token } });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
          throw new Error(typeof body.message === "string" ? body.message : "ALIS could not load your matters (" + response.status + ").");
        }
        if (active) setMatters(Array.isArray(payload) ? payload as Matter[] : []);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "ALIS could not load your matters.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadMatters();
    return () => { active = false; };
  }, []);

  return (
    <AlisShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">Workspace records</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your matters</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">A private list of matters saved to your account, including situation maps created through guided triage.</p></div>
        <Link href="/workflows" className="inline-flex items-center gap-2 rounded-xl bg-[#173d35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#205248]">Start a workflow <ArrowRight size={16} /></Link>
      </div>

      {loading && <div className="mt-8 flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/60"><LoaderCircle size={18} className="animate-spin text-[#176b5b]" />Loading your matters…</div>}
      {error && <div role="alert" className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><CircleAlert size={18} className="mt-0.5 shrink-0" />{error}</div>}
      {!loading && !error && matters.length === 0 && <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-white p-8 sm:p-12"><div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef4f1] text-[#176b5b]"><ClipboardList size={22} /></div><h2 className="mt-5 text-xl font-semibold">Your workspace is ready for its first matter.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-black/55">Choose a guided workflow to build a structured record from the facts and documents you already have.</p><Link href="/workflows" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#176b5b]">Explore guided workflows <ArrowRight size={16} /></Link></div>}

      {!loading && !error && matters.length > 0 && <div className="mt-8 space-y-3">{matters.map((matter) => {
        const isTriage = matter.title?.startsWith("Situation triage:");
        const href = isTriage ? "/matters/" + matter.id + "/triage" : "/matter/" + matter.id;
        return (
          <article key={matter.id} className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eef4f1] text-[#176b5b]">{isTriage ? <ClipboardList size={20} /> : <BriefcaseBusiness size={20} />}</div><div className="min-w-0"><h2 className="font-semibold">{matter.title || "Untitled matter"}</h2><p className="mt-1 line-clamp-2 text-sm leading-6 text-black/50">{matter.description || "No description has been added."}</p><p className="mt-3 text-xs text-black/40">Matter #{matter.id}{matter.status ? " · " + matter.status.replaceAll("_", " ").toLowerCase() : ""}{matter.updatedAt ? " · Updated " + new Date(matter.updatedAt).toLocaleDateString("en-ZA") : ""}</p></div></div>
            <Link href={href} className="inline-flex shrink-0 items-center justify-between gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold hover:bg-black/[0.03]"><FileText size={16} />{isTriage ? "Open situation map" : "Open matter"}<ArrowRight size={15} /></Link>
          </article>
        );
      })}</div>}
    </AlisShell>
  );
}
