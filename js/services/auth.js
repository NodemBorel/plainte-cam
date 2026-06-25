/* ============================================================
   Service Auth — connexion, inscription, session
   ============================================================ */

var AuthService = {
  async signInWithOtp(phone) {
    var sb = getSupabase();
    if (!sb) return { error: { message: 'Supabase non initialisé' } };
    return sb.auth.signInWithOtp({ phone: '+237' + phone });
  },

  async verifyOtp(phone, token) {
    var sb = getSupabase();
    if (!sb) return { error: { message: 'Supabase non initialisé' } };
    return sb.auth.verifyOtp({ phone: '+237' + phone, token: token, type: 'sms' });
  },

  async signInWithPassword(matricule, password) {
    var sb = getSupabase();
    if (!sb) return { error: { message: 'Supabase non initialisé' } };
    return sb.auth.signInWithPassword({
      email: matricule + '@police.cm',
      password: password
    });
  },

  async signOut() {
    var sb = getSupabase();
    if (!sb) return;
    return sb.auth.signOut();
  },

  async getSession() {
    var sb = getSupabase();
    if (!sb) return null;
    var result = await sb.auth.getSession();
    return result.data ? result.data.session : null;
  },

  async getUser() {
    var sb = getSupabase();
    if (!sb) return null;
    var result = await sb.auth.getUser();
    return result.data ? result.data.user : null;
  }
};
