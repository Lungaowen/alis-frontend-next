// Supabase JS client — used ONLY for real-time subscriptions on document/report tables.
// All data writes/reads go through Java + Python APIs.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  URL && ANON ? createClient(URL, ANON, { auth: { persistSession: false } }) : null;

export function isSupabaseEnabled() {
  return !!supabase;
}

/** Subscribe to row changes on `document` table for one client. Returns unsubscribe fn. */
export function subscribeDocuments(clientId: number, onChange: () => void): () => void {
  if (!supabase) return () => {};
  const ch = supabase
    .channel(`docs:${clientId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "document", filter: `client_id=eq.${clientId}` },
      () => onChange()
    )
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

/** Subscribe to row changes on `report` table for one client. Returns unsubscribe fn. */
export function subscribeReports(clientId: number, onChange: () => void): () => void {
  if (!supabase) return () => {};
  const ch = supabase
    .channel(`reports:${clientId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "report", filter: `client_id=eq.${clientId}` },
      () => onChange()
    )
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}
