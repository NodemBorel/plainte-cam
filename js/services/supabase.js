/* ============================================================
   Service Supabase — client unique, initialisation
   ============================================================ */

var supabase = null;

function initSupabase() {
  if (supabase) return supabase;
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(
      APP_CONFIG.SUPABASE_URL,
      APP_CONFIG.SUPABASE_ANON_KEY
    );
  }
  return supabase;
}

function getSupabase() {
  if (!supabase) initSupabase();
  return supabase;
}
