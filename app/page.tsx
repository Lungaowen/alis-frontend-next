import Link from "next/link";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowOutward from "@mui/icons-material/ArrowOutward";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Description from "@mui/icons-material/Description";
import Security from "@mui/icons-material/Security";

const capabilities = [
  {
    icon: AutoAwesome,
    title: "Start with your situation",
    description: "Explain what happened or what you are planning in everyday language. You do not need to know the legal terminology first.",
  },
  {
    icon: Description,
    title: "Keep the evidence connected",
    description: "Bring agreements, notices, photos and supporting documents into one organised place alongside the matter they relate to.",
  },
  {
    icon: Security,
    title: "Understand the next step",
    description: "Get structured information, see where uncertainty remains and prepare more useful questions for a qualified professional.",
  },
];

export default function Home() {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav" aria-label="Main navigation">
        <Link href="/" className="marketing-brand" aria-label="ALIS home">
          <span className="brand-mark">A</span>
          <span className="brand-words"><strong>ALIS</strong><span>Legal intelligence, made clearer</span></span>
        </Link>
        <div className="marketing-links">
          <a href="#approach">How it works</a>
          <a href="#safety">Legal safety</a>
          <Link href="/workspace">For professionals</Link>
        </div>
        <Link href="/dashboard" className="button-secondary">Enter workspace <ArrowOutward /></Link>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> South African legal preparation</div>
          <h1 className="hero-title">Make your next move with <em>more clarity.</em></h1>
          <p className="hero-description">Legal problems rarely arrive with a clear label. ALIS helps you organise what is happening, understand documents and prepare for the right conversation before you take your next step.</p>
          <div className="hero-actions">
            <Link href="/scanner" className="button-primary">Describe your situation <ArrowForward /></Link>
            <Link href="/dashboard" className="button-secondary">Explore the workspace</Link>
          </div>
          <div className="hero-footnote">
            <span><CheckCircle /> Plain-language intake</span>
            <span><CheckCircle /> Evidence in context</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Illustrative preview of a document review workspace">
          <div className="hero-visual-label"><span>Inside the workspace</span><span className="window-dots" aria-hidden="true"><i /><i /><i /></span></div>
          <div className="preview-window">
            <div className="preview-topline">
              <div><p className="preview-overline">Document review</p><h2 className="preview-heading">A clearer view of the details</h2></div>
              <span className="preview-state"><i /> Review suggested</span>
            </div>
            <div className="preview-document">
              <span className="document-symbol"><Description /></span>
              <span className="preview-document-copy"><strong>Employment agreement.pdf</strong><span>Illustrative document · 8 pages</span></span>
              <ArrowOutward fontSize="small" sx={{ color: "#8d998e" }} />
            </div>
            <div className="preview-review-heading"><strong>Points to understand</strong><span>Illustrative preview</span></div>
            <div className="preview-finding"><span className="finding-marker">01</span><div><strong>Notice period</strong><p>Find the clause, clarify the wording and record your question.</p></div></div>
            <div className="preview-finding"><span className="finding-marker">02</span><div><strong>Restrictive clause</strong><p>Keep the source visible so the context is not lost.</p></div></div>
            <p className="preview-disclaimer">This is a UI illustration, not an assessment of a real contract or a legal-risk score.</p>
          </div>
          <div className="preview-float">
            <span className="preview-float-icon"><Security fontSize="small" /></span>
            <span><strong>Context stays connected</strong><span>Situation · Evidence · Next steps</span></span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Product principles">
        <div className="trust-strip-inner">
          <div className="trust-item"><span className="trust-item-icon"><Description /></span><span><strong>Documents with context</strong><span>Keep evidence alongside the story.</span></span></div>
          <div className="trust-item"><span className="trust-item-icon"><AutoAwesome /></span><span><strong>Explainable assistance</strong><span>Clarity over black-box conclusions.</span></span></div>
          <div className="trust-item"><span className="trust-item-icon"><Security /></span><span><strong>Human judgement matters</strong><span>Prepare for informed professional advice.</span></span></div>
        </div>
      </section>

      <section className="marketing-section" id="approach">
        <div className="section-heading">
          <div><p className="section-eyebrow">A calmer way to prepare</p><h2 className="section-title">Start with what happened. Build from there.</h2></div>
          <p className="section-description">ALIS is designed around the way people actually experience legal issues: a conversation, a document, a deadline or a decision that needs a closer look.</p>
        </div>
        <div className="feature-grid">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return <article className="feature-card" key={item.title}><span className="feature-card-icon"><Icon /></span><h3>{item.title}</h3><p>{item.description}</p></article>;
          })}
        </div>
      </section>

      <section className="marketing-section" id="safety" style={{ paddingTop: 0 }}>
        <div className="safety-band">
          <div>
            <p className="section-eyebrow">A clear boundary</p>
            <h2>Better preparation. Not a replacement for a lawyer.</h2>
            <p>ALIS is intended to help organise facts, documents and questions. Legal outcomes depend on the full circumstances and applicable law. Important decisions should be checked with a qualified legal professional.</p>
          </div>
          <Link href="/scanner" className="button-secondary">Start with your situation <ArrowForward /></Link>
        </div>
      </section>

      <footer className="marketing-footer"><span><strong>ALIS</strong> · Automated Legal Intelligence System</span><span>Designed for clearer legal preparation in South Africa.</span></footer>
    </main>
  );
}
