import Link from "next/link";
import { Icon } from "@/components/icon";

const features = [
  { number: "01", icon: "document" as const, title: "Make sense of legal documents", body: "Bring a contract, notice or policy into a workspace built to organise the clauses, dates and questions that deserve a closer look." },
  { number: "02", icon: "scan" as const, title: "Start with what happened", body: "Describe a situation in ordinary language. ALIS helps organise the context, identify gaps and map possible next steps." },
  { number: "03", icon: "folder" as const, title: "Keep the full picture together", body: "Collect files, notes, events and follow-ups around one matter instead of searching across scattered conversations." },
  { number: "04", icon: "gavel" as const, title: "Know when to bring in a professional", body: "Separate supported findings from uncertainty, so you can prepare better questions for a qualified legal practitioner." },
];

export default function Home() {
  return (
    <main className="marketing-page">
      <div className="mkt-announcement"><span><i /> Legal intelligence designed around South African context</span></div>
      <div className="mkt-nav-wrap">
        <nav className="mkt-nav" aria-label="Main navigation">
          <Link href="/" className="mkt-brand" aria-label="ALIS home">
            <span className="mkt-brand-mark"><Icon name="shield" size={21} /></span>
            <span className="mkt-brand-text"><strong>ALIS</strong><small>Legal intelligence</small></span>
          </Link>
          <div className="mkt-nav-links"><a href="#platform">Platform</a><a href="#how-it-works">How it works</a><a href="#who-its-for">Who it’s for</a><a href="#responsible-use">Responsible use</a></div>
          <div className="mkt-nav-actions"><Link href="/login" className="mkt-login-link">Sign in</Link><Link href="/register" className="mkt-button mkt-button-primary">Create an account <Icon name="arrow" size={14} /></Link></div>
        </nav>
      </div>

      <section className="mkt-hero">
        <div className="mkt-hero-copy">
          <div className="mkt-eyebrow">A clearer way to approach legal complexity</div>
          <h1>Legal clarity for <em>the moments</em> that matter.</h1>
          <p className="mkt-hero-lead">Understand the documents, decisions and situations in front of you. ALIS brings legal information, evidence and next steps into one considered workspace, so you can move forward with more context and less guesswork.</p>
          <div className="mkt-hero-actions"><Link href="/register" className="mkt-button mkt-button-primary">Create your workspace <Icon name="arrow" size={15} /></Link><a href="#how-it-works" className="mkt-button mkt-button-secondary">See how ALIS works</a></div>
          <div className="mkt-quick-points"><div className="mkt-quick-point"><span><Icon name="document" size={11} /></span>Documents in context</div><div className="mkt-quick-point"><span><Icon name="lock" size={11} /></span>Organised private workspace</div><div className="mkt-quick-point"><span><Icon name="gavel" size={11} /></span>Human judgment stays central</div></div>
        </div>
        <div className="mkt-showcase" aria-label="Illustrative ALIS workspace preview">
          <div className="mkt-app-window">
            <div className="mkt-app-chrome"><i className="mkt-window-dot"/><i className="mkt-window-dot"/><i className="mkt-window-dot"/><span className="mkt-window-label">alis.app / workspace</span><span style={{marginLeft:"auto",fontSize:8,color:"#8b958c"}}>Sample workspace</span></div>
            <div className="mkt-app-inside">
              <aside className="mkt-app-sidebar"><div className="mkt-app-side-brand">ALIS<span style={{color:"#a2ab9c",fontWeight:500}}> / workspace</span></div><div className="mkt-app-side-section">Workspace</div><div className="mkt-app-nav-item active"><i className="mkt-app-nav-square"/>Overview</div><div className="mkt-app-nav-item"><i className="mkt-app-nav-square"/>Matters</div><div className="mkt-app-nav-item"><i className="mkt-app-nav-square"/>Documents</div><div className="mkt-app-nav-item"><i className="mkt-app-nav-square"/>Situation scan</div><div className="mkt-app-side-section" style={{marginTop:20}}>Personal</div><div className="mkt-app-nav-item"><i className="mkt-app-nav-square"/>Profile</div></aside>
              <div className="mkt-app-content">
                <div className="mkt-app-meta"><span className="mkt-app-overline">Workspace overview</span><span className="mkt-demo-badge">Illustrative preview</span></div>
                <h3 className="mkt-app-title">Keep the details in view.</h3><p className="mkt-app-description">A structured view of matters, evidence and what needs attention.</p>
                <div className="mkt-app-stats"><div className="mkt-app-stat"><label>Open matters</label><strong>03</strong><small>Across your workspace</small></div><div className="mkt-app-stat"><label>Documents</label><strong>12</strong><small>Organised by matter</small></div><div className="mkt-app-stat"><label>Follow-ups</label><strong>02</strong><small>Dates to keep in view</small></div></div>
                <div className="mkt-review-card"><div className="mkt-review-head"><strong>Employment agreement</strong><span>Needs a closer look</span></div><div className="mkt-review-body"><div><div className="mkt-risk-line">POINT TO REVIEW</div><h4>Notice period wording</h4><p>The sample clause refers to written notice. Confirm the applicable period and how notice must be delivered before relying on it.</p><div className="mkt-evidence-list"><div className="mkt-evidence-item"><span className="mkt-evidence-check"><Icon name="check" size={9}/></span>Clause excerpt saved</div><div className="mkt-evidence-item"><span className="mkt-evidence-check"><Icon name="check" size={9}/></span>Question for review recorded</div></div></div><div className="mkt-review-side"><span>MATTER STATUS</span><strong>In review</strong><span>NEXT STEP</span><strong>Check original document</strong></div></div></div>
              </div>
            </div>
          </div>
          <p className="mkt-caption">Illustrative interface · Sample content, not a legal assessment</p>
        </div>
      </section>

      <div className="mkt-context-strip"><div className="mkt-context-inner"><div className="mkt-context-label">Made for the real-life work around legal questions.</div><div className="mkt-context-tags"><span>Individuals</span><span>Small businesses</span><span>Legal professionals</span><span>Documents & evidence</span></div></div></div>

      <section className="mkt-section" id="platform">
        <div className="mkt-section-heading"><div className="mkt-eyebrow">One considered workspace</div><h2>From a pile of paperwork to a clearer next step.</h2><p>Legal concerns rarely arrive neatly organised. ALIS helps you bring the pieces together, understand what may matter and keep track of the questions that still need answers.</p></div>
        <div className="mkt-feature-grid">{features.map((item)=><article className="mkt-feature-card" key={item.number}><div className="mkt-feature-icon"><Icon name={item.icon} size={19}/></div><h3>{item.title}</h3><p>{item.body}</p><span className="mkt-feature-number">{item.number} / CAPABILITY</span></article>)}</div>
      </section>

      <section className="mkt-workflow" id="how-it-works"><div className="mkt-workflow-inner"><div className="mkt-section-heading"><div className="mkt-eyebrow">A more structured starting point</div><h2>Start with the facts. Build from there.</h2><p>ALIS is designed to make the first steps less overwhelming without pretending that every legal question has a simple answer.</p></div><div className="mkt-steps"><article className="mkt-step"><div className="mkt-step-no">01</div><h3>Explain the situation</h3><p>Describe what happened, ask a question or add the document you are trying to understand.</p></article><article className="mkt-step"><div className="mkt-step-no">02</div><h3>Organise what matters</h3><p>Bring the relevant documents, dates, missing information and potential points of concern into view.</p></article><article className="mkt-step"><div className="mkt-step-no">03</div><h3>Prepare your next move</h3><p>Review the findings, keep evidence together and decide whether professional guidance is needed.</p></article></div></div></section>

      <section className="mkt-section" id="who-its-for"><div className="mkt-section-heading"><div className="mkt-eyebrow">Built around your reality</div><h2>Legal matters are personal. Your tools should fit the work.</h2></div><div className="mkt-audience-grid"><article className="mkt-audience-card"><span className="mkt-audience-tag">For individuals</span><h3>Understand what is in front of you.</h3><p>Make sense of a notice, agreement or difficult situation. Keep dates, documents and questions together so you can prepare for a conversation with a qualified professional.</p><Link href="/register" className="mkt-text-link">Create a personal workspace <Icon name="arrow" size={14}/></Link></article><article className="mkt-audience-card dark"><span className="mkt-audience-tag">For business & professional work</span><h3>Keep important decisions better organised.</h3><p>Structure business documents, recurring obligations and client matters in one place. Build a clearer record of what has been reviewed and what still needs attention.</p><Link href="/register" className="mkt-text-link">Explore ALIS <Icon name="arrow" size={14}/></Link></article></div></section>

      <section className="mkt-trust-panel" id="responsible-use"><div className="mkt-trust-inner"><div className="mkt-trust-copy"><div className="mkt-eyebrow">Useful, with clear limits</div><h2>Better context. No false certainty.</h2><p>Legal technology should help you think more clearly, not create the impression that a complex matter has been settled by a screen. ALIS is an information and organisation tool, not a substitute for advice from a qualified legal practitioner.</p></div><div className="mkt-trust-list"><div className="mkt-trust-item"><span className="mkt-trust-icon"><Icon name="document" size={15}/></span><div><strong>Keep the source in view</strong><p>Work with the documents and details relevant to the question.</p></div></div><div className="mkt-trust-item"><span className="mkt-trust-icon"><Icon name="scan" size={15}/></span><div><strong>Make gaps visible</strong><p>Identify what may be missing or needs confirmation.</p></div></div><div className="mkt-trust-item"><span className="mkt-trust-icon"><Icon name="lock" size={15}/></span><div><strong>Bring work together</strong><p>Keep notes, documents and matter context in a structured place.</p></div></div><div className="mkt-trust-item"><span className="mkt-trust-icon"><Icon name="gavel" size={15}/></span><div><strong>Respect professional judgment</strong><p>Escalate high-stakes questions to a qualified legal practitioner.</p></div></div></div></div></section>

      <section className="mkt-bottom-cta"><div className="mkt-bottom-cta-inner"><div><h2>Start with a question. Leave with a clearer plan.</h2><p>Bring the facts together and take your next step with more context.</p></div><Link href="/register" className="mkt-button mkt-button-primary">Create your ALIS account <Icon name="arrow" size={15}/></Link></div></section>

      <footer className="mkt-footer"><div className="mkt-footer-brand"><span className="mkt-brand-mark" style={{width:27,height:27,borderRadius:8}}><Icon name="shield" size={15}/></span> ALIS <span style={{fontWeight:500,color:"#91988f"}}>Legal intelligence</span></div><div className="mkt-footer-links"><Link href="/login">Sign in</Link><Link href="/register">Create account</Link><a href="#platform">Platform</a><a href="#responsible-use">Responsible use</a></div><div className="mkt-footer-note">ALIS provides information and document-organisation support. It does not provide a definitive legal opinion or replace advice from a qualified legal practitioner. Always verify applicable law and seek professional guidance where appropriate.</div></footer>
    </main>
  );
}
