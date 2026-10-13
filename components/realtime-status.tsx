"use client";
import {useEffect,useState} from "react";
import {connectRealtime} from "@/lib/realtime";
export function RealtimeStatus(){const [connected,setConnected]=useState(false);useEffect(()=>connectRealtime(()=>{},setConnected),[]);return <span className={"status "+(connected?"status-open":"status-muted")}><span className="dot"/>{connected?"Live":"Offline"}</span>}
