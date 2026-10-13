"use client";
import {useState} from "react";
import {AlisShell} from "@/components/alis-shell";
import {Icon} from "@/components/icon";

const seeded=[["Lease_notice_02.pdf","MAT-1037","PDF · 4 pages","Processed"],["Employment_contract.pdf","MAT-1042","PDF · 12 pages","Analysed"],["Vehicle_sale_photos.zip","MAT-1023","Archive · 18 items","Indexed"],["ID_copy_mpho.pdf","MAT-1014","PDF · 1 page","Stored"]];

export default function Documents(){
  const [file,setFile]=useState<File|null>(null); const [queued,setQueued]=useState(false);
  return <AlisShell><div className="page">
    <div className="page-head"><div><div className="eyebrow">Evidence locker</div><h1>Documents & evidence</h1><p>Keep the source material close to the matter it supports. Processing, extraction and analysis can happen asynchronously.</p></div><button className="btn btn-primary" onClick={()=>document.getElementById("file-input")?.click()}><Icon name="upload" size={15}/> Add evidence</button></div>
    <section className="card" style={{marginTop:22}}><div className="card-body">
      <label htmlFor="file-input" style={{display:"block",border:"1.5px dashed #b8c8c0",background:"#f8fbf9",borderRadius:15,padding:32,textAlign:"center",cursor:"pointer"}}><Icon name="upload" size={27}/><strong style={{display:"block",marginTop:10,fontSize:13}}>{file?file.name:"Drop a document here, or choose a file"}</strong><p style={{margin:"5px 0 0",color:"var(--muted)",fontSize:10}}>PDF, DOCX, images and supporting evidence. 10 MB demo limit.</p><input id="file-input" type="file" hidden onChange={e=>{setFile(e.target.files?.[0]??null);setQueued(false)}}/></label>
      {file&&<div className="activity-row" style={{borderTop:0}}><div className="activity-icon"><Icon name="document" size={14}/></div><div><strong>{file.name}</strong><span>{Math.round(file.size/1024)} KB · ready for analysis</span></div><button className="btn btn-primary" onClick={()=>setQueued(true)}>Queue analysis</button></div>}
      {queued&&<div className="banner" style={{marginTop:12}}><Icon name="check" size={14}/> Document queued for the Python AI/RAG layer.</div>}
    </div></section>
    <section className="card" style={{marginTop:14}}><div className="card-head"><div><h2>Recent evidence</h2><p>Tenant-scoped document activity</p></div><button className="btn"><Icon name="dots" size={14}/> Filters</button></div><div className="card-body">{seeded.map(r=><div className="activity-row" key={r[0]}><div className="activity-icon"><Icon name="document" size={14}/></div><div><strong>{r[0]}</strong><span>{r[1]} · {r[2]}</span></div><span className="status status-open">{r[3]}</span></div>)}</div></section>
  </div></AlisShell>
}
