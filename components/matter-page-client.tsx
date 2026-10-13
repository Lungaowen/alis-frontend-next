"use client";

import { useEffect, useState } from "react";
import { AlisShell } from "@/components/alis-shell";
import { Icon } from "@/components/icon";
import { connectRealtime, type RealtimeMessage } from "@/lib/realtime";

export function MatterPageClient({ id }: { id: string }) {
  const [live, setLive] = useState<RealtimeMessage | null>(null);
  useEffect(() => connectRealtime((message) => {
    if (!message.matterId || message.matterId === id) setLive(message);
  }), [id]);

  const evidence = [
    ["Employment_contract.pdf", "12 pages · analysed"],
    ["Email_thread_01.pdf", "6 pages · indexed"],
    ["Client_note.txt", "Text note · stored"],
  ];
  const events = [
    ["Document analysis completed", "Matter event recorded", "13 Oct · 09:18"],
    ["Employment contract added", "Matter event recorded", "12 Oct · 16:42"],
    ["Situation scan created", "Matter event recorded", "10 Oct · 11:03"],
  ];

  return <AlisShell><div className="page">
    <div className="page-head"><div>
      <div className="eyebrow">{id} · matter workspace</div>
      <h1>Employment agreement review</h1>
      <p>Structured around evidence, findings and next actions instead of one giant AI chat.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
        <span className="status status-review"><span className="dot" />Potential legal concern</span>
        <span className="status status-muted">Nandi M.</span>
        <span className="status status-muted">Employment</span>
        <span className="status status-muted">Moraka Attorneys</span>
      </div>
    </div><div className="actions"><button className="btn" aria-label="Matter actions"><Icon name="dots" size={15} /></button></div></div>

    {live && <div className="card" style={{ marginTop: 14 }}><div className="card-body">
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800 }}><span>{live.stage || "Analysis"}</span><span>{live.progress || 0}%</span></div>
      <div style={{ height: 6, marginTop: 8, borderRadius: 99, background: "#e8eeeb" }}><div style={{ height: 6, borderRadius: 99, background: "var(--brand)", width: (live.progress || 0) + "%" }} /></div>
      <p style={{ margin: "7px 0 0", fontSize: 10, color: "var(--muted)" }}>{live.message}</p>
    </div></div>}

    <div className="grid-2" style={{ marginTop: 14 }}><section className="card">
      <div className="card-head"><div><h2>Legal intelligence</h2><p>Explain findings with evidence and sources</p></div><span className="status status-review"><span className="dot" />Needs review</span></div>
      <div className="card-body" style={{ display: "grid", gap: 10 }}>
        <div className="card" style={{ boxShadow: "none", background: "#fbfcfb" }}><div className="card-body"><h3 style={{ margin: 0, fontSize: 12 }}>Termination clause may deserve attention</h3><p style={{ margin: "6px 0 0", fontSize: 10, color: "var(--muted)", lineHeight: 1.55 }}>The working summary indicates a termination provision that may not align with the situation described by the client.</p><div style={{ marginTop: 8, color: "var(--brand2)", fontSize: 9, fontWeight: 800 }}>Source · Employment Contract · Clause 8.2</div></div></div>
        <div className="card" style={{ boxShadow: "none", background: "#fbfcfb" }}><div className="card-body"><h3 style={{ margin: 0, fontSize: 12 }}>Notice period needs confirmation</h3><p style={{ margin: "6px 0 0", fontSize: 10, color: "var(--muted)", lineHeight: 1.55 }}>The analysis needs the date and wording of the alleged notice before a conclusion can be made.</p><div style={{ marginTop: 8, color: "var(--brand2)", fontSize: 9, fontWeight: 800 }}>Missing evidence · Original notice</div></div></div>
        <div style={{ padding: 13, borderRadius: 12, border: "1px solid #ecd7d2", background: "#fff6f3" }}><strong style={{ fontSize: 11 }}>Professional review recommended</strong><p style={{ margin: "4px 0 0", fontSize: 10, color: "#7e6b67", lineHeight: 1.5 }}>This matter contains a potentially consequential employment decision. ALIS should present evidence and uncertainty, not make the final legal decision.</p></div>
      </div>
    </section>

    <aside className="card" style={{ background: "var(--brand)", color: "#fff" }}><div className="card-body">
      <div className="eyebrow" style={{ color: "#b8d0c6" }}>ALIS assistant</div><h2 style={{ margin: "7px 0 0", fontSize: 17 }}>Ask about this matter.</h2>
      <p style={{ margin: "7px 0 0", fontSize: 10, lineHeight: 1.55, color: "rgba(255,255,255,.68)" }}>Explore the evidence, sources already retrieved or what information is still missing.</p>
      <div style={{ display: "flex", gap: 7, marginTop: 14, padding: 7, borderRadius: 11, background: "rgba(255,255,255,.08)" }}><input placeholder="What should I look at next?" aria-label="Ask about this matter" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "#fff", fontSize: 10 }} /><button aria-label="Send question" style={{ width: 28, height: 28, border: 0, borderRadius: 8, background: "#d7ece3", color: "var(--brand)" }}><Icon name="arrow" size={14} /></button></div>
      <div style={{ display: "grid", gap: 7, marginTop: 12 }}>{["Summarise the latest evidence", "What information is missing?", "Show the relevant sources"].map((label) => <button key={label} style={{ textAlign: "left", padding: "8px 9px", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9, background: "transparent", color: "#dbe9e3", fontSize: 9 }}>{label}</button>)}</div>
    </div></aside></div>

    <div className="grid-3">
      <section className="card"><div className="card-head"><div><h2>Evidence</h2><p>Files linked to this matter</p></div></div><div className="card-body">{evidence.map(([name, detail]) => <div className="activity-row" key={name}><div className="activity-icon"><Icon name="document" size={14} /></div><div><strong>{name}</strong><span>{detail}</span></div><span className="status status-open">Stored</span></div>)}</div></section>
      <section className="card"><div className="card-head"><div><h2>Timeline</h2><p>Key events and actions</p></div></div><div className="card-body">{events.map(([name, detail, time]) => <div className="activity-row" key={name}><div className="activity-icon"><Icon name="clock" size={14} /></div><div><strong>{name}</strong><span>{detail}</span></div><div className="activity-time">{time}</div></div>)}</div></section>
      <section className="card"><div className="card-head"><div><h2>Next actions</h2><p>Keep the matter moving</p></div></div><div className="card-body" style={{ display: "grid", gap: 8 }}>{["Confirm notice date", "Attach the original notice", "Review clause 8.2 with client"].map((label) => <button className="btn" key={label} style={{ justifyContent: "space-between" }}><span style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="check" size={13} />{label}</span><Icon name="arrow" size={12} /></button>)}</div></section>
    </div>
  </div></AlisShell>;
}
