"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {AlisShell} from "@/components/alis-shell";
import {Icon} from "@/components/icon";

const data=[
  ["MAT-1042","Employment agreement review","Nandi M.","REVIEW","Clause extraction completed","18 min ago"],
  ["MAT-1037","Landlord notice received","Thabo K.","OPEN","Evidence added","1 hr ago"],
  ["MAT-1029","Small business registration","Lerato P.","OPEN","Questionnaire updated","Yesterday"],
  ["MAT-1023","Vehicle sale dispute","Sizwe D.","URGENT","Professional review requested","Yesterday"],
  ["MAT-1014","Independent contractor agreement","Mpho R.","CLOSED","Matter archived","4 days ago"]
];

export default function Matters(){
  const [query,setQuery]=useState(""); const [filter,setFilter]=useState("All");
  const filtered=useMemo(()=>data.filter(r=>(r.join(" ").toLowerCase().includes(query.toLowerCase()))&&(filter==="All"||r[3]===filter)),[query,filter]);
  const cls=(s:string)=>s==="URGENT"?"status-urgent":s==="REVIEW"?"status-review":s==="CLOSED"?"status-muted":"status-open";
  return <AlisShell><div className="page">
    <div className="page-head"><div><div className="eyebrow">Matter workspace</div><h1>Matters</h1><p>One structured record for the situation, people, evidence, legal issues and professional review.</p></div><Link href="/scanner" className="btn btn-primary"><Icon name="plus" size={15}/> New matter</Link></div>
    <section className="card" style={{marginTop:22}}><div className="card-head"><div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap"}}><div style={{display:"flex",alignItems:"center",gap:8,minWidth:240,padding:"9px 11px",border:"1px solid var(--line)",borderRadius:10,background:"#fff"}}><Icon name="search" size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search matters, clients, IDs..." style={{border:0,outline:0,width:"100%",fontSize:11}}/></div><select value={filter} onChange={e=>setFilter(e.target.value)} className="btn" style={{padding:"9px 11px",fontSize:11}}><option>All</option><option>OPEN</option><option>REVIEW</option><option>URGENT</option><option>CLOSED</option></select></div><span style={{color:"var(--subtle)",fontSize:10}}>{filtered.length} shown</span></div>
      <div style={{overflowX:"auto"}}><table className="table"><thead><tr><th>Matter</th><th>Client</th><th>Status</th><th>Latest activity</th><th>Updated</th><th/></tr></thead><tbody>{filtered.map(r=><tr key={r[0]}><td><Link href={"/matter/"+r[0]}><div className="matter-title">{r[1]}</div><div className="matter-id">{r[0]}</div></Link></td><td>{r[2]}</td><td><span className={"status "+cls(r[3])}><span className="dot"/>{r[3]}</span></td><td>{r[4]}</td><td>{r[5]}</td><td><Link href={"/matter/"+r[0]} className="icon-button" aria-label="Open matter"><Icon name="arrow" size={14}/></Link></td></tr>)}</tbody></table></div>
    </section>
  </div></AlisShell>
}
