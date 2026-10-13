import Link from "next/link";
import Add from "@mui/icons-material/Add";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowOutward from "@mui/icons-material/ArrowOutward";
import FolderOpen from "@mui/icons-material/FolderOpen";
import Description from "@mui/icons-material/Description";
import { AlisShell } from "@/components/alis-shell";

const matters = [
  { id: "MAT-1042", title: "Employment agreement review", summary: "Terms to clarify before signing; supporting agreement not yet connected in this example.", status: "Review suggested", tone: "amber", updated: "Example record" },
  { id: "MAT-1037", title: "Landlord notice received", summary: "A place to organise the notice, timeline and related correspondence.", status: "In progress", tone: "green", updated: "Example record" },
];

export default function Matters() {
  return (
    <AlisShell>
      <section className="page-intro">
        <div><p className="page-kicker">Your workspace</p><h1 className="page-title">Matters</h1><p className="page-description">Keep a clear record of each situation, its documents and the questions that still need an answer.</p></div>
        <div className="page-intro-actions"><span className="sample-label">Example records</span><Link href="/scanner" className="button-primary"><Add /> New matter</Link></div>
      </section>

      <section className="panel panel-padding">
        <div className="panel-heading"><div><h2>Your matter list</h2><p>Example data illustrates the intended information hierarchy; it is not a live account record.</p></div><FolderOpen sx={{ color: "#607968", fontSize: 21 }} /></div>
        <div className="matter-list-page">
          {matters.map((matter) => (
            <Link className="matter-card" key={matter.id} href={"/matter/" + matter.id}>
              <span className="matter-file-icon"><Description /></span>
              <span className="matter-card-main">
                <span className="matter-card-topline"><span className="matter-id">{matter.id}</span><span className={"status-pill " + (matter.tone === "amber" ? "status-amber" : "status-green")}><i />{matter.status}</span></span>
                <h2>{matter.title}</h2><p>{matter.summary}</p><span className="matter-row-meta">{matter.updated}</span>
              </span>
              <ArrowOutward className="matter-row-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <div className="notice-box" style={{ marginTop: 16 }}><ArrowForward /><div><strong>Keep each matter grounded in its evidence</strong><p>When live data is connected, matter records should resolve to the account and professional workspace allowed to see them.</p></div></div>
    </AlisShell>
  );
}
