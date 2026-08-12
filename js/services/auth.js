/* ============================================================
   Service Auth — connexion, inscription, session
   ============================================================ */

var AuthService = {
  /* Le citoyen s'authentifie par adresse e-mail et code OTP recu par mail.
     Le telephone reste un simple moyen de contact, facultatif : il n'entre
     pas dans le parcours d'authentification. */
  async signInWithOtp(email) {
    var sb = getSupabase();
    if (!sb) return { error: { message: 'Supabase non initialisé' } };
    return sb.auth.signInWithOtp({ email: email });
  },

  async verifyOtp(email, token) {
    var sb = getSupabase();
    if (!sb) return { error: { message: 'Supabase non initialisé' } };
    return sb.auth.verifyOtp({ email: email, token: token, type: 'email' });
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
