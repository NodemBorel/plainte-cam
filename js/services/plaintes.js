/* ============================================================
   Service Plaintes — CRUD dossiers, suivi
   ============================================================ */

var PlaintesService = {
  async creer(plainte) {
    var sb = getSupabase();
    if (!sb) return { data: null, error: { message: 'Supabase non initialisé' } };
    return sb.from('plaintes').insert(plainte).select().single();
  },

  async lister(filtres) {
    var sb = getSupabase();
    if (!sb) return { data: [], error: null };
    var query = sb.from('plaintes').select('*').order('created_at', { ascending: false });
    if (filtres && filtres.statut) query = query.eq('statut', filtres.statut);
    if (filtres && filtres.enqueteur_id) query = query.eq('enqueteur_id', filtres.enqueteur_id);
    if (filtres && filtres.commissariat_id) query = query.eq('commissariat_id', filtres.commissariat_id);
    return query;
  },

  async getById(id) {
    var sb = getSupabase();
    if (!sb) return { data: null, error: null };
    return sb.from('plaintes').select('*').eq('id', id).single();
  },

  async mettreAJour(id, updates) {
    var sb = getSupabase();
    if (!sb) return { data: null, error: null };
    return sb.from('plaintes').update(updates).eq('id', id).select().single();
  },

  async affecter(plainteId, enqueteurId) {
    return this.mettreAJour(plainteId, {
      enqueteur_id: enqueteurId,
      statut: 'EN_INSTRUCTION',
      date_affectation: new Date().toISOString()
    });
  },

  async cloturer(id) {
    return this.mettreAJour(id, {
      statut: 'CLOTURE',
      date_cloture: new Date().toISOString()
    });
  },

  async signerPV(plainteId, enqueteurId) {
    var sb = getSupabase();
    if (!sb) return { data: null, error: null };
    return sb.from('proces_verbaux').update({
      signe: true,
      signe_par: enqueteurId,
      date_signature: new Date().toISOString()
    }).eq('plainte_id', plainteId).select().single();
  },

  async suivre(numero) {
    var sb = getSupabase();
    if (!sb) return { data: null, error: null };
    return sb.from('plaintes')
      .select('*, historique(*)')
      .eq('numero_dossier', numero)
      .single();
  }
};
