"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import AttachFile from "@mui/icons-material/AttachFile";
import ArrowForward from "@mui/icons-material/ArrowForward";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Description from "@mui/icons-material/Description";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { AlisShell } from "@/components/alis-shell";

const examples = [
  "I am about to sign an employment contract",
  "My landlord sent me a notice",
  "I want to start a small business",
  "Someone owes me money",
  "I received a legal document",
];
function readableSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function Scanner() {
  const [situation, setSituation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [draftReady, setDraftReady] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.currentTarget.files?.[0] ?? null);
    setDraftReady(false);
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (situation.trim()) setDraftReady(true);
  }

  return (
    <AlisShell>
      <section className="page-intro">
        <div><p className="page-kicker">Situation scanner</p><h1 className="page-title">What is happening?</h1><p className="page-description">Start with your own words. Include the dates, people involved and what you need to decide. You can add a supporting document too.</p></div>
        <span className="sample-label">Draft intake</span>
      </section>

      <div className="intake-layout">
        <form className="panel intake-form" onSubmit={handleSubmit}>
          <label className="intake-label" htmlFor="situation-description">Tell us what happened or what you are considering<span className="intake-hint">Share only details you are comfortable entering in this preview.</span></label>
          <textarea id="situation-description" className="textarea-field" value={situation} onChange={(event) => { setSituation(event.currentTarget.value); setDraftReady(false); }} placeholder="For example: My employer gave me a new agreement to sign by Friday. I am unsure what the notice-period clause means..." required />
          <div className="prompt-chips" aria-label="Suggested starting points">
            {examples.map((example) => <button type="button" className="prompt-chip" key={example} onClick={() => { setSituation(example); setDraftReady(false); }}>{example}</button>)}
          </div>
          <div className="intake-divider" />
          <div className="intake-controls">
            <label className="attach-control"><AttachFile /> Add supporting file<input type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt" onChange={handleFileChange} /></label>
            <button type="submit" className="button-primary" disabled={!situation.trim()}>Prepare draft <ArrowForward /></button>
          </div>
          {file && <div className="selected-file"><Description /><div><strong>{file.name}</strong><span>{readableSize(file.size)} · Selected locally</span></div></div>}
          {draftReady && <div className="draft-result" role="status"><div className="draft-result-heading"><CheckCircle /> Your situation draft is ready</div><p>This preview has captured your text{file ? " and selected file" : ""}. No legal analysis has been generated and nothing has been sent to a server.</p><div className="draft-quote">{situation.trim()}</div><p>Next integration step: connect this intake to the ALIS conversation and analysis API.</p></div>}
        </form>

        <aside className="intake-side">
          <section className="panel panel-padding intake-side-card">
            <span className="feature-card-icon"><AutoAwesome /></span>
            <h2>How a situation becomes a matter</h2>
            <p>The experience is designed to move from a plain-language account to organised evidence and an informed next step.</p>
            <div className="process-steps">
              <div className="process-step"><span className="process-step-index">01</span><span><strong>Describe the facts</strong><p>What happened, when it happened and who was involved.</p></span></div>
              <div className="process-step"><span className="process-step-index">02</span><span><strong>Connect evidence</strong><p>Attach documents that help explain the situation.</p></span></div>
              <div className="process-step"><span className="process-step-index">03</span><span><strong>Prepare next questions</strong><p>Review source-backed information and identify what needs professional attention.</p></span></div>
            </div>
          </section>
          <div className="notice-box"><InfoOutlined /><div><strong>Keep it factual</strong><p>A simple timeline and the original documents are often a useful starting point. Do not upload information you are not authorised to share.</p></div></div>
          <Link href="/documents" className="button-secondary">Go to evidence locker <ArrowForward /></Link>
        </aside>
      </div>
    </AlisShell>
  );
}
