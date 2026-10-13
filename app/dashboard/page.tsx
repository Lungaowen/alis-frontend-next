import Link from "next/link";
import Add from "@mui/icons-material/Add";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowOutward from "@mui/icons-material/ArrowOutward";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Description from "@mui/icons-material/Description";
import FolderOpen from "@mui/icons-material/FolderOpen";
import Gavel from "@mui/icons-material/Gavel";
import Security from "@mui/icons-material/Security";
import { AlisShell } from "@/components/alis-shell";

const sampleMatters = [
  { id: "MAT-1042", title: "Employment agreement review", description: "Contract terms to clarify before signing", status: "Review suggested", tone: "amber", updated: "Example matter" },
  { id: "MAT-1037", title: "Landlord notice received", description: "Notice and supporting documents", status: "In progress", tone: "green", updated: "Example matter" },
];

export default function Dashboard() {
  return (
    <AlisShell>
      <section className="page-intro">
        <div><p className="page-kicker">Your legal workspace</p><h1 className="page-title">Keep the full picture in view.</h1><p className="page-description">Start with a situation, review a document or continue organising a matter. ALIS helps you put the details in order before deciding what to do next.</p></div>
        <div className="page-intro-actions"><span className="sample-label">Example workspace data</span><Link href="/scanner" className="button-primary"><Add /> New situation</Link></div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <section className="welcome-panel">
            <div className="welcome-panel-content">
              <span className="panel-label">A useful place to begin</span>
              <h2>What is happening in your life right now?</h2>
              <p>You do not need a legal label. Describe what happened, what you received or what you are considering. Start with the facts you know.</p>
              <div className="welcome-panel-actions"><Link href="/scanner" className="button-secondary">Describe the situation <ArrowForward /></Link><span className="welcome-mark"><AutoAwesome /></span></div>
            </div>
          </section>

          <section className="quick-grid" aria-label="Quick actions">
            <Link href="/scanner" className="quick-card"><div className="quick-card-top"><span className="quick-card-icon"><AutoAwesome /></span><ArrowOutward className="quick-card-arrow" /></div><h3>Talk through a situation</h3><p>Write in plain language and keep the context together.</p></Link>
            <Link href="/documents" className="quick-card"><div className="quick-card-top"><span className="quick-card-icon"><Description /></span><ArrowOutward className="quick-card-arrow" /></div><h3>Review a document</h3><p>Choose a contract, notice, photo or supporting file.</p></Link>
          </section>

          <section className="panel panel-padding">
            <div className="panel-heading"><div><h2>Recent matters</h2><p>Example records to demonstrate the workspace.</p></div><Link href="/matters" className="button-small">View all <ArrowForward fontSize="small" /></Link></div>
            <div className="matter-list">
              {sampleMatters.map((matter) => (
                <Link href={"/matter/" + matter.id} className="matter-row" key={matter.id}>
                  <span className="matter-file-icon"><FolderOpen /></span>
                  <span className="matter-row-main"><strong className="matter-row-title">{matter.title}</strong><span className="matter-row-meta"><span>{matter.id}</span><span>·</span><span>{matter.updated}</span></span><span className="matter-row-meta">{matter.description}</span></span>
                  <span className={"status-pill " + (matter.tone === "amber" ? "status-amber" : "status-green")}><i />{matter.status}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="dashboard-side-column">
          <section className="next-step-panel"><span className="next-step-icon"><CheckCircle /></span><p className="panel-label">A good next step</p><h2>Keep dates and documents close.</h2><p>For notices, agreements and disputes, record when something happened and keep a copy of the material you received.</p><Link href="/documents" className="button-quiet">Open evidence locker <ArrowForward /></Link></section>
          <section className="panel panel-padding">
            <div className="panel-heading"><div><h2>How ALIS approaches concerns</h2><p>Useful information, without false certainty.</p></div></div>
            <div className="principle-list">
              <div className="principle-item"><CheckCircle /><span><strong>Show the context</strong><p>Keep findings connected to the document or facts they came from.</p></span></div>
              <div className="principle-item"><Description /><span><strong>Make sources visible</strong><p>Important legal information should be traceable to a source.</p></span></div>
              <div className="principle-item"><Gavel /><span><strong>Respect professional judgement</strong><p>Uncertainty and the limits of automated guidance should be clear.</p></span></div>
            </div>
          </section>
          <div className="notice-box"><Security /><div><strong>Preparation, not a legal verdict</strong><p>ALIS helps structure information. Consult a qualified legal professional before making high-stakes decisions.</p></div></div>
        </aside>
      </div>
    </AlisShell>
  );
}
