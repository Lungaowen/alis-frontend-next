 "use client";
import {useEffect,useState} from "react"; import {Radio} from "lucide-react"; import {connectRealtime,type RealtimeMessage} from "@/lib/realtime";
export function RealtimeStatus({onMessage}:{onMessage?:(m:RealtimeMessage)=>void}){const [connected,setConnected]=useState(false);useEffect(()=>connectRealtime(m=>onMessage?.(m),setConnected),[onMessage]);return <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium"><Radio size={13} className={connected?"text-emerald-600":"text-black/30"}/>{connected?"Live":"Offline"}</span>}
