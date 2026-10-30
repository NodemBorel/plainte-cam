/* Gestion des dossiers sur l'API locale SQLite. */
var PlaintesService = {
  async creer(plainte) { return LocalAPI.query('plaintes').insert(plainte).select().single(); },
  async lister(filtres) {
    var query = LocalAPI.query('plaintes').select('*').order('created_at', { ascending: false });
    if (filtres && filtres.statut) query.eq('statut', filtres.statut);
    if (filtres && filtres.enqueteur_id) query.eq('enqueteur_id', filtres.enqueteur_id);
    if (filtres && filtres.commissariat_id) query.eq('commissariat_id', filtres.commissariat_id);
    return query;
  },
  async getById(id) {
    try { return { data: await LocalAPI.request('/records/plaintes/' + encodeURIComponent(id)), error: null }; }
    catch (error) { return { data: null, error: { message: error.message } }; }
  },
  async mettreAJour(id, updates) {
    try { return { data: await LocalAPI.request('/records/plaintes/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(updates) }), error: null }; }
    catch (error) { return { data: null, error: { message: error.message } }; }
  },
  async affecter(plainteId, enqueteurId) { return this.mettreAJour(plainteId, { enqueteur_id: enqueteurId, statut: 'EN_INSTRUCTION', date_affectation: new Date().toISOString() }); },
  async cloturer(id) { return this.mettreAJour(id, { statut: 'CLOTURE', date_cloture: new Date().toISOString() }); },
  async signerPV(plainteId, enqueteurId) {
    var result = await LocalAPI.query('proces_verbaux').update({ signe: true, signe_par: enqueteurId, date_signature: new Date().toISOString() }).eq('plainte_id', plainteId).select().single();
    return result;
  },
  async suivre(numero) {
    var result = await this.lister({});
    if (result.error) return result;
    var plainte = (result.data || []).find(function (p) { return p.numero_dossier === numero; });
    if (!plainte) return { data: null, error: { message: 'Dossier introuvable' } };
    var historique = await LocalAPI.request('/records/historique');
    plainte.historique = historique.filter(function (h) { return h.plainte_id === plainte.id; });
    return { data: plainte, error: null };
  }
};
