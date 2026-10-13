import Link from "next/link";
import { Icon } from "@/components/icon";

export default function Home() {
  return <main><section className="hero"><div className="hero-copy">
    <span className="hero-kicker"><Icon name="shield" size={14}/> South African legal intelligence</span>
    <h1>Know what deserves attention before it becomes a legal problem.</h1>
    <p>ALIS turns everyday situations, documents and evidence into a structured legal workspace. It helps people understand what may matter, what to collect and when professional review is appropriate.</p>
    <div className="hero-actions"><Link href="/dashboard" className="btn btn-primary">Open workspace <Icon name="arrow" size={15}/></Link><Link href="/scanner" className="btn">Start a situation scan</Link></div>
    <div className="hero-notes"><span className="hero-note"><Icon name="lock" size={14}/> Tenant-aware professional workspaces</span><span className="hero-note"><Icon name="document" size={14}/> Source-linked document intelligence</span><span className="hero-note"><Icon name="gavel" size={14}/> Professional review when required</span></div>
  </div><div className="hero-visual"><div className="command-preview"><div className="preview-top"><div className="preview-dots"><span/><span/><span/></div><span style={{fontSize:10,color:"#7f8a85"}}>ALIS Command Centre</span></div><div className="preview-body"><div className="preview-side"><div style={{fontSize:11,fontWeight:800,color:"#173d35"}}>ALIS</div><div className="mini-nav"><span className="active"/><span/><span/><span/><span/></div></div><div className="preview-main"><div className="mini-title"/><div className="mini-sub"/><div className="preview-kpis">{[1,2,3,4].map(i=><div key={i} className="preview-kpi"><b/><i/></div>)}</div><div className="preview-grid"><div className="preview-card"><div className="mini-sub" style={{width:"30%"}}/><div className="preview-lines"><span/><span/><span/></div><div className="preview-lines"><span/><span/><span/></div></div><div className="preview-card"><div className="mini-sub" style={{width:"40%"}}/><div className="preview-chart">{[1,2,3,4,5,6].map(i=><span key={i}/>)}</div></div></div></div></div></div></div></section></main>;
}
