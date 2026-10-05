import type {Id,RealtimeEvent} from "@/src/modules/shared";
export interface RealtimeSubscription{close():void;}
export interface RealtimeService{subscribe<T>(tenantId:Id,matterId:Id|undefined,onEvent:(event:RealtimeEvent<T>)=>void):RealtimeSubscription;}
export function createRealtimeService(url:string):RealtimeService{return {subscribe<T>(tenantId,matterId,onEvent){const socket=new WebSocket(url);socket.addEventListener("open",()=>socket.send(JSON.stringify({type:"subscribe",tenantId,matterId})));socket.addEventListener("message",e=>{try{const event=JSON.parse(e.data) as RealtimeEvent<T>;if(String(event.tenantId)===String(tenantId)&&(!matterId||String(event.matterId)===String(matterId)))onEvent(event);}catch{}});return {close:()=>socket.close()};}};}
