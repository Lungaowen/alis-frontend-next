import type {AuthSession} from "../domain/auth-session";export interface AuthService{getSession():AuthSession|null;setSession(session:AuthSession):void;clear():void;}
const KEY="alis_session";
export const authService:AuthService={getSession(){if(typeof window==="undefined")return null;const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw) as AuthSession:null;},setSession(session){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(session));},clear(){if(typeof window!=="undefined")localStorage.removeItem(KEY);}};
