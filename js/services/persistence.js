/* État métier partagé par SQLite, avec une vue limitée aux dossiers du citoyen connecté. */
(function () {
  var cacheKey = 'plaintecam.state.v1', snapshot = null, writing = false, currentUser = null;

  function readState() {
    var state;
    try { state = { CITOYENS: CITOYENS, AGENTS: AGENTS, DOSSIERS: DOSSIERS, HISTORIQUE: HISTORIQUE, CONVOCATIONS: CONVOCATIONS, PV_CORRECTIONS: PV_CORRECTIONS, draft: JSON.parse(localStorage.getItem('plaintecam.brouillon.v1') || 'null') }; }
    catch (_) { return null; }
    if (currentUser && currentUser.role === 'citoyen') {
      state.CITOYENS = state.CITOYENS.filter(function (person) { return person.id === currentUser.id || person.email === currentUser.email; });
      state.AGENTS = [];
      state.DOSSIERS = state.DOSSIERS.filter(function (dossier) { return dossier.citoyen === currentUser.id; });
      var ids = new Set(state.DOSSIERS.map(function (dossier) { return dossier.id; }));
      ['HISTORIQUE','CONVOCATIONS'].forEach(function (key) { var own = {}; Object.keys(state[key]).forEach(function (id) { if (ids.has(id)) own[id] = state[key][id]; }); state[key] = own; });
      var revisions = {}; Object.keys(state.PV_CORRECTIONS).forEach(function (key) { if (ids.has(key.split('|')[0])) revisions[key] = state.PV_CORRECTIONS[key]; }); state.PV_CORRECTIONS = revisions;
    }
    return state;
  }

  function replaceArray(target, values) { target.splice.apply(target, [0, target.length].concat(values || [])); }
  function replaceObject(target, values) { Object.keys(target).forEach(function (key) { delete target[key]; }); Object.keys(values || {}).forEach(function (key) { target[key] = values[key]; }); }
  function applyState(state) {
    if (!state) return;
    if (Array.isArray(state.CITOYENS)) replaceArray(CITOYENS, state.CITOYENS);
    if (Array.isArray(state.AGENTS)) replaceArray(AGENTS, state.AGENTS);
    if (Array.isArray(state.DOSSIERS)) replaceArray(DOSSIERS, state.DOSSIERS);
    if (state.HISTORIQUE) replaceObject(HISTORIQUE, state.HISTORIQUE);
    if (state.CONVOCATIONS) replaceObject(CONVOCATIONS, state.CONVOCATIONS);
    if (state.PV_CORRECTIONS) replaceObject(PV_CORRECTIONS, state.PV_CORRECTIONS);
    if (Object.prototype.hasOwnProperty.call(state, 'draft')) {
      if (state.draft) localStorage.setItem('plaintecam.brouillon.v1', JSON.stringify(state.draft));
      else localStorage.removeItem('plaintecam.brouillon.v1');
    }
  }
  function notify() { window.dispatchEvent(new CustomEvent('plaintecam:state-restored')); }

  window.appStateReady = (async function () {
    try {
      currentUser = await AuthService.getUser();
      var local = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (local && (!currentUser || currentUser.role !== 'citoyen')) applyState(local);
      var remote = await LocalAPI.request('/state');
      if (remote) applyState(remote);
      if (currentUser) {
        if ((currentUser.role === 'enqueteur' || currentUser.role === 'accueil') && currentUser.profile && currentUser.profile.displayName && typeof ENQUETEUR_COURANT !== 'undefined') ENQUETEUR_COURANT = currentUser.profile.displayName;
        if (currentUser.role === 'citoyen') {
          var person = CITOYENS.find(function (row) { return row.id === currentUser.id || row.email === currentUser.email; });
          if (!person) { var p = currentUser.profile || {}; person = { id: currentUser.id, prenom: p.prenom || currentUser.name.split(/\s+/)[0] || '', nom: p.nom || currentUser.name.split(/\s+/).slice(1).join(' ') || '', email: currentUser.email, telephone: p.telephone || '', pays: p.pays || 'Cameroun', region: p.region || '', ville: p.ville || '', profession: '', adresse: '', naissance: '', cni: '' }; CITOYENS.push(person); }
          CITOYEN_CONNECTE = person.id;
          if (!remote) { AGENTS.splice(0, AGENTS.length); DOSSIERS.splice(0, DOSSIERS.length); replaceObject(HISTORIQUE, {}); replaceObject(CONVOCATIONS, {}); replaceObject(PV_CORRECTIONS, {}); }
        }
      }
      var state = readState(); snapshot = JSON.stringify(state); localStorage.setItem(cacheKey, snapshot);
      if (!remote && state) await LocalAPI.request('/state', { method: 'PUT', body: snapshot });
      notify();
    } catch (_) { snapshot = JSON.stringify(readState()); }
    return true;
  })();

  window.sauverEtatMetier = async function () {
    if (window.appStateReady) await window.appStateReady;
    var state = readState();
    if (!state) throw new Error('Impossible de préparer la sauvegarde du dossier.');
    await LocalAPI.request('/state', { method: 'PUT', body: JSON.stringify(state) });
    snapshot = JSON.stringify(state);
    localStorage.setItem(cacheKey, snapshot);
  };

  setInterval(async function () {
    if (!snapshot || writing) return;
    var state = readState(), next; try { next = JSON.stringify(state); } catch (_) { return; }
    if (!next || next === snapshot) return;
    writing = true;
    try { await LocalAPI.request('/state', { method: 'PUT', body: next }); snapshot = next; localStorage.setItem(cacheKey, next); }
    catch (_) { /* reprise au prochain cycle */ }
    finally { writing = false; }
  }, 1200);
})();
