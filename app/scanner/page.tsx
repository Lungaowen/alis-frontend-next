"use client";
import {useState} from "react";
import {AlisShell} from "@/components/alis-shell";
import {Icon} from "@/components/icon";

const prompts=["I am about to sign an employment contract","My landlord sent me a notice","I want to start a small business","Someone owes me money","I received a legal document"];

export default function Scanner(){
  const [situation,setSituation]=useState(""); const [submitted,setSubmitted]=useState(false);
  return <AlisShell><div className="page">
    <div className="page-head"><div><div className="eyebrow">Situation scanner</div><h1>Start with what happened.</h1><p>Describe the situation in ordinary language. ALIS can turn the context into questions, evidence requests and a structured Matter.</p></div><span className="status status-open"><span className="dot"/>Human-readable flow</span></div>
    <div className="grid-2" style={{marginTop:22}}>
      <section className="card"><div className="card-body">
        <div className="eyebrow">Your situation</div>
        <textarea value={situation} onChange={e=>setSituation(e.target.value)} placeholder="Tell ALIS what you are about to do, what happened, what you received, or what you are worried about..." style={{width:"100%",minHeight:255,marginTop:12,padding:15,border:"1px solid var(--line)",borderRadius:13,resize:"vertical",outline:"none",background:"#fbfcfb",color:"var(--ink)",lineHeight:1.6,fontSize:13}} />
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:10}}>{prompts.map(x=><button key={x} className="btn" style={{borderRadius:999,padding:"7px 10px",fontSize:10,color:"var(--muted)"}} onClick={()=>setSituation(x)}>{x}</button>)}</div>
        <div className="actions" style={{justifyContent:"space-between",marginTop:14}}><span style={{display:"flex",alignItems:"center",gap:7,color:"var(--muted)",fontSize:10}}><Icon name="document" size={13}/> Add evidence after the first pass.</span><button className="btn btn-primary" disabled={!situation.trim()} style={{opacity:situation.trim()?1:.45}} onClick={()=>setSubmitted(true)}>Analyse situation <Icon name="arrow" size={14}/></button></div>
      </div></section>
      <aside className="card"><div className="card-body">
        <div className="eyebrow">How ALIS approaches it</div>
        <div style={{display:"grid",gap:15,marginTop:16}}>
          {[["01","Understand the context","Capture the people, event, timing and what you need to decide."],["02","Find relevant legal material","Connect the situation to supported South African legal sources and evidence."],["03","Surface concerns","Explain what may matter, what is uncertain and what information is missing."],["04","Prepare the next action","Create a Matter, collect evidence or escalate to qualified professional help."]].map(([n,t,p])=><div key={n} style={{display:"grid",gridTemplateColumns:"28px 1fr",gap:10}}><div style={{width:28,height:28,display:"grid",placeItems:"center",borderRadius:8,background:"var(--brand)",color:"#fff",fontSize:10,fontWeight:800}}>{n}</div><div><strong style={{fontSize:11}}>{t}</strong><p style={{margin:"4px 0 0",color:"var(--muted)",fontSize:10,lineHeight:1.55}}>{p}</p></div></div>)}
        </div>
        <div className="banner" style={{marginTop:18}}><Icon name="shield" size={13}/> Findings should expose sources, uncertainty and reasoning.</div>
      </div></aside>
    </div>
    {submitted&&<section className="card" style={{marginTop:14}}><div className="card-body"><div className="banner"><Icon name="spark" size={14}/><strong>Assessment created.</strong>&nbsp;The production flow can now hand this context to the AI/RAG service and create a Matter.</div><div className="grid-3" style={{marginTop:12}}>{[["Working summary","ALIS has captured the situation and can ask targeted follow-up questions next."],["Evidence to collect","Documents, dates, messages and other supporting material can be attached."],["Next step","Review the initial findings before making a high-stakes decision."]].map(([t,p])=><div className="card" key={t}><div className="card-body"><h2 style={{margin:0,fontSize:12}}>{t}</h2><p style={{margin:"6px 0 0",fontSize:10,color:"var(--muted)",lineHeight:1.55}}>{p}</p></div></div>)}</div></div></section>}
  </div></AlisShell>
}
