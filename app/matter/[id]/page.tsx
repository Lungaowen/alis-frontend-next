"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Description from "@mui/icons-material/Description";
import Gavel from "@mui/icons-material/Gavel";
import Message from "@mui/icons-material/Message";
import People from "@mui/icons-material/People";
import Schedule from "@mui/icons-material/Schedule";
import Security from "@mui/icons-material/Security";
import { AlisShell } from "@/components/alis-shell";
import { RealtimeStatus } from "@/components/realtime-status";
import { connectRealtime, type RealtimeMessage } from "@/lib/realtime";

type MatterParams = Promise<{ id: string }>;

export default function MatterPage({ params }: { params: MatterParams }) {
  const { id } = use(params);
  const [live, setLive] = useState<RealtimeMessage | null>(null);
  const isLandlordMatter = id === "MAT-1037";
  const title = isLandlordMatter ? "Landlord notice received" : "Employment agreement review";
  const status = isLandlordMatter ? "In progress" : "Review suggested";

  useEffect(() => connectRealtime((message) => {
    if (!message.matterId || message.matterId === id) setLive(message);
  }), [id]);

  return (
    <AlisShell>
      <div className="detail-heading-row">
        <div>
          <Link href="/matters" className="button-quiet" style={{ marginBottom: 15 }}><ArrowBack /> Back to matters</Link>
          <div className="detail-id"><span />{id}<span style={{ width: 3, height: 3, background: "#b1b9ae" }} />Example record</div>
          <h1 className="page-title" style={{ marginTop: 10 }}>{title}</h1>
          <p className="page-description">Bring the facts, supporting documents and open questions into one reviewable place.</p>
        </div>
        <div style={{ display: "grid", justifyItems: "end", gap: 9 }}>
          <span className={"status-pill " + (isLandlordMatter ? "status-green" : "status-amber")}><i />{status}</span>
          <RealtimeStatus />
        </div>
      </div>

      <nav className="detail-tab-bar" aria-label="Matter sections">
        <a className="detail-tab" href="#overview">Overview</a><a className="detail-tab" href="#evidence">Evidence</a><a className="detail-tab" href="#questions">Questions</a><a className="detail-tab" href="#timeline">Timeline</a>
      </nav>

      {live && (
        <section className="panel panel-padding" style={{ marginBottom: 17 }}>
          <div className="panel-heading"><div><h2>{live.stage || "Live analysis update"}</h2><p>{live.message || "A realtime status update was received."}</p></div><span className="status-pill status-green"><i /> Live update</span></div>
          <div style={{ height: 5, borderRadius: 99, background: "#edf0eb", overflow: "hidden" }}><div style={{ width: Math.max(0, Math.min(100, live.progress || 0)) + "%", height: "100%", borderRadius: 99, background: "#4f8059" }} /></div>
          <p className="detail-copy" style={{ marginBottom: 0, marginTop: 8 }}>{typeof live.progress === "number" ? live.progress + "% complete" : "Progress is being reported by the connected service."}</p>
        </section>
      )}

      <div className="detail-grid" id="overview">
        <div className="detail-column">
          <section className="panel panel-padding" id="questions">
            <div className="panel-heading"><div><h2>Questions to organise</h2><p>Examples of useful prompts, not findings about your actual circumstances.</p></div><Message sx={{ color: "#6b826c", fontSize: 20 }} /></div>
            <div className="detail-list">
              <div className="detail-list-item"><CheckCircle /><span><strong>What happened, and when?</strong><p>Capture dates, events and the original wording where possible.</p></span></div>
              <div className="detail-list-item"><CheckCircle /><span><strong>What decision or deadline is coming up?</strong><p>Note any response date, signing date or other time-sensitive step.</p></span></div>
              <div className="detail-list-item"><CheckCircle /><span><strong>What still needs professional review?</strong><p>Separate what is known from what remains uncertain.</p></span></div>
            </div>
          </section>

          <section className="panel panel-padding" id="evidence">
            <div className="panel-heading"><div><h2>Evidence locker</h2><p>Documents should remain attached to their matter and access scope.</p></div><Description sx={{ color: "#6b826c", fontSize: 20 }} /></div>
            <div className="file-list"><div className="file-list-row"><span className="file-list-icon"><Description /></span><span className="file-list-main"><strong>No documents connected in this example</strong><span>Connect the upload and matter APIs to load real evidence.</span></span></div></div>
            <Link href="/documents" className="button-secondary" style={{ marginTop: 18 }}>Open evidence locker <Description fontSize="small" /></Link>
          </section>
        </div>

        <aside className="detail-column">
          <section className="panel panel-padding">
            <div className="panel-heading"><div><h2>Matter overview</h2><p>Core context for the next conversation.</p></div></div>
            <div className="detail-list">
              <div className="detail-list-item"><Description sx={{ color: "#6b826c", fontSize: 20 }} /><span><strong>Record</strong><p>{id}</p></span></div>
              <div className="detail-list-item"><Schedule /><span><strong>Timeline</strong><p>Add key dates and the order events occurred.</p></span></div>
              <div className="detail-list-item"><People /><span><strong>People involved</strong><p>Record roles and relationships where relevant.</p></span></div>
            </div>
          </section>

          <section className="panel panel-padding" id="timeline">
            <div className="panel-heading"><div><h2>Timeline</h2><p>Example steps for an organised review.</p></div></div>
            <div className="timeline-list">
              <div className="timeline-item"><span className="timeline-rail"><i className="timeline-dot" /></span><span><strong>Situation recorded</strong><p>Start with your own description and dates.</p></span></div>
              <div className="timeline-item"><span className="timeline-rail"><i className="timeline-dot" /></span><span><strong>Evidence connected</strong><p>Attach original documents where possible.</p></span></div>
              <div className="timeline-item"><span className="timeline-rail"><i className="timeline-dot" /></span><span><strong>Questions prepared</strong><p>Identify what needs clarification or qualified advice.</p></span></div>
            </div>
          </section>

          <div className="notice-box"><Security /><div><strong>No automated legal verdict</strong><p>Any future analysis should display its source, reasoning and uncertainty. Serious issues need qualified professional review.</p></div></div>
        </aside>
      </div>
    </AlisShell>
  );
}
