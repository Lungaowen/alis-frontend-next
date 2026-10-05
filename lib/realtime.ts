export type RealtimeMessage={event:string;documentId?:string;matterId?:string;stage?:string;progress?:number;message?:string};
export function connectRealtime(onMessage:(m:RealtimeMessage)=>void,onStatus?:(connected:boolean)=>void){
 if(typeof window==="undefined") return ()=>{};
 const url=process.env.NEXT_PUBLIC_REALTIME_URL; if(!url) return ()=>{};
 const socket=new WebSocket(url);
 socket.onopen=()=>onStatus?.(true); socket.onclose=()=>onStatus?.(false); socket.onerror=()=>onStatus?.(false);
 socket.onmessage=(event)=>{try{onMessage(JSON.parse(event.data) as RealtimeMessage)}catch{}};
 return ()=>socket.close();
}
