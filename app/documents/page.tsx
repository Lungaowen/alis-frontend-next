"use client";

import { useState, type ChangeEvent } from "react";
import AttachFile from "@mui/icons-material/AttachFile";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CloudUpload from "@mui/icons-material/CloudUpload";
import Description from "@mui/icons-material/Description";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import { AlisShell } from "@/components/alis-shell";

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function Documents() {
  const [file, setFile] = useState<File | null>(null);
  const [reviewState, setReviewState] = useState(false);

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.currentTarget.files?.[0] ?? null);
    setReviewState(false);
  }

  return (
    <AlisShell>
      <section className="page-intro">
        <div><p className="page-kicker">Evidence locker</p><h1 className="page-title">Documents, with context.</h1><p className="page-description">Keep agreements, notices, messages and supporting evidence together. A document should be easy to connect back to the situation it belongs to.</p></div>
        <span className="sample-label">Local file preview</span>
      </section>

      <div className="documents-layout">
        <div className="dashboard-main-column">
          <section className="panel panel-padding">
            <div className="panel-heading"><div><h2>Add a document</h2><p>Choose a file to preview the intake flow.</p></div><span className="feature-card-icon"><CloudUpload /></span></div>
            <label className="file-drop">
              <span className="file-drop-icon"><CloudUpload /></span>
              <strong>Choose a file from your device</strong>
              <p>PDF, DOC, DOCX, TXT, JPG, PNG or WEBP. This frontend preview does not upload files yet.</p>
              <em>Browse files <AttachFile fontSize="small" /></em>
              <input type="file" hidden accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp" onChange={handleSelect} />
            </label>

            {file && <div className="selected-file"><Description /><div><strong>{file.name}</strong><span>{formatBytes(file.size)} · Kept in the current browser view</span></div><span className="status-pill status-neutral">Selected</span></div>}
            {file && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><button type="button" className="button-primary" onClick={() => setReviewState(true)}>Review selection <CheckCircle /></button></div>}
            {reviewState && file && <div className="draft-result" role="status"><div className="draft-result-heading"><CheckCircle /> File selection confirmed</div><p>{file.name} is selected in the interface. No upload, document parsing or legal analysis has occurred.</p></div>}
          </section>

          <div className="notice-box"><InfoOutlined /><div><strong>Privacy by design</strong><p>Only share documents you are authorised to provide. Before release, connect this screen to authenticated storage, tenant and matter checks, and upload validation.</p></div></div>
        </div>

        <aside className="dashboard-main-column">
          <section className="panel document-preview">
            <div className="document-preview-toolbar"><strong>Document review workspace</strong><span className="sample-label">Illustration</span></div>
            <div className="document-preview-canvas">
              <div className="paper-sheet" aria-label="Illustration of a document page">
                <div className="paper-sheet-top"><span className="paper-sheet-seal">A</span><span>Document preview</span></div>
                <div className="paper-line mid" /><div className="paper-line" /><div className="paper-line short" />
                <div className="paper-section">Terms and conditions</div>
                <div className="paper-line" /><div className="paper-line mid" /><div className="paper-highlight" /><div className="paper-line" /><div className="paper-line short" />
                <div className="paper-section">Additional notes</div><div className="paper-line mid" /><div className="paper-line" />
              </div>
            </div>
            <p className="document-preview-note">Design direction: keep the document and its related questions visible together, so context is not lost when reviewing a clause.</p>
          </section>

          <section className="panel panel-padding">
            <div className="panel-heading"><div><h2>Evidence types</h2><p>Common material you might organise.</p></div></div>
            <div className="file-list">
              <div className="file-list-row"><span className="file-list-icon"><PictureAsPdf /></span><span className="file-list-main"><strong>Contracts and notices</strong><span>Signed agreements, letters and formal notices</span></span></div>
              <div className="file-list-row"><span className="file-list-icon"><Description /></span><span className="file-list-main"><strong>Messages and records</strong><span>Emails, written conversations and receipts</span></span></div>
              <div className="file-list-row"><span className="file-list-icon"><AttachFile /></span><span className="file-list-main"><strong>Supporting evidence</strong><span>Photos and other relevant documents</span></span></div>
            </div>
          </section>
        </aside>
      </div>
    </AlisShell>
  );
}
