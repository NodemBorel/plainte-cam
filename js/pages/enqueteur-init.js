/* ============================================================
   Espace Enqueteur — fonctions page et initialisation

   Les dossiers viennent de js/modules/data.js. Ce fichier definissait
   auparavant son propre tableau `mesDossiers`, qui contredisait data.js
   sur presque tout : type d'infraction, score, noms de plaignants, et
   deux numeros de dossier qui n'existaient nulle part ailleurs. Le meme
   dossier changeait donc d'identite selon l'ecran ouvert.

   Il en allait de meme pour les libelles de statut : AUDITION s'affichait
   en bleu ici et en violet ailleurs. On utilise STATUT_LABELS.
   ============================================================ */

/* Enqueteur connecte. Conforme a supabase/seed.sql, ou KANA porte les
   dossiers 2026-00451, 2026-00438 et 2026-00377 — soit les 3 annonces
   par le compteur de la barre laterale. NGUEMO y est commissaire, pas
   enqueteur. */
var ENQUETEUR_COURANT = 'Insp. KANA';

function mesDossiersActifs() {
  if (typeof DOSSIERS === 'undefined') return [];
  return DOSSIERS.filter(function (d) { return d.enqueteur === ENQUETEUR_COURANT; });
}

/* Les messages et notes sont saisis par l'agent puis reinjectes en
   innerHTML : ils doivent etre neutralises (§8.2 — protection XSS). */
function ech(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function badgeStatut(statut) {
  var l = (typeof STATUT_LABELS !== 'undefined' && STATUT_LABELS[statut]) || ['badge-gray', statut];
  return '<span class="badge ' + l[0] + '">' + l[1] + '</span>';
}

function renderMesDossiers(liste) {
  var tbody = document.getElementById('mes-dossiers-tbody');
  if (!tbody) return;
  var lignes = liste || mesDossiersActifs();

  if (!lignes.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:22px">' +
      'Aucun dossier ne correspond à ce filtre.</td></tr>';
    return;
  }

  /* Le score IA n'est pas affiche ici : il sert au commissaire pour
     prioriser et affecter. L'enqueteur recoit un dossier deja prioriser
     par sa hierarchie — le chef d'unite cote le dossier, selon le compte
     rendu d'entretien — et n'a pas a arbitrer sur ce critere. */
  tbody.innerHTML = lignes.map(function (d) {
    var prio = (d.priorite || 'NORMALE').toLowerCase();
    return '<tr>' +
      '<td><strong>' + d.id + '</strong></td>' +
      '<td>' + ech(d.plaignant) + '</td>' +
      '<td>' + ech(d.type) + '</td>' +
      '<td>' + d.date + '</td>' +
      '<td><span class="priority-dot ' + prio + '"></span>' + prio.charAt(0).toUpperCase() + prio.slice(1) + '</td>' +
      '<td>' + badgeStatut(d.statut) + '</td>' +
      '<td><button class="btn btn-primary btn-sm" onclick="ouvrirDossier(\'' + d.id + '\')">Instruire</button></td>' +
    '</tr>';
  }).join('');
}

function filterMesDossiers(val) {
  renderMesDossiers(val
    ? mesDossiersActifs().filter(function (d) { return d.statut === val; })
    : null);
}

/* ── Détail d'un dossier ─────────────────────────────────── */
var dossierOuvert = null;

/* Le detail tenait dans une modale, trop etroite pour tout ce qui doit y
   figurer. C'est desormais une page a part entiere. */
function ouvrirDossier(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;
  dossierOuvert = id;
  rendreDossier();
  showPage('page-dossier');
}

function retourDossiers() {
  dossierOuvert = null;
  var el = document.querySelector('.sidebar-item[data-page="page-dashboard"]');
  if (el) navEnq(el, 'page-dashboard');
  else showPage('page-dashboard');
}

/* Document affiche dans l'apercu : 'plainte' ou 'attestation'. */
var docAffiche = 'plainte';

/* Onglet ouvert. Le §7.4 demande une consultation du dossier en onglets :
   la piece, la conduite de l'instruction, les convocations. */
var ongletDossier = 'plainte';

/* Audition dont le PV est affiche : 'plaignant' ou 'mis_en_cause'. */
var pvAudition = 'plaignant';

var ONGLETS_DOSSIER = [
  { cle: 'plainte',      libelle: 'Plainte' },
  { cle: 'progression',  libelle: 'Progression' },
  { cle: 'convocations', libelle: 'Convocations' }
];

function rendreDossier() {
  var zone = document.getElementById('dossier-zone');
  if (!zone || !dossierOuvert) return;
  var d = mesDossiersActifs().find(function (x) { return x.id === dossierOuvert; });
  if (!d) { zone.innerHTML = ''; return; }
  var id = d.id;
  var prio = (d.priorite || 'NORMALE').toLowerCase();

  var nbConv = convocationsDe(id).length;

  zone.innerHTML =
    '<div class="dossier-tete">' +
      '<div>' +
        '<div class="page-title" style="margin-bottom:4px">Dossier ' + id + '</div>' +
        '<div class="page-subtitle" style="margin:0">' + ech(d.plaignant) + ' — ' + ech(d.type) + '</div>' +
      '</div>' +
      '<div class="dossier-tete-badges">' +
        badgeStatut(d.statut) +
        '<span class="badge badge-gray"><span class="priority-dot ' + prio + '"></span>Priorité ' + prio + '</span>' +
      '</div>' +
    '</div>' +

    '<div class="onglets" role="tablist">' +
      ONGLETS_DOSSIER.map(function (o) {
        var compteur = (o.cle === 'convocations' && nbConv)
          ? ' <span class="onglet-compteur">' + nbConv + '</span>' : '';
        return '<button type="button" role="tab" class="onglet' +
          (ongletDossier === o.cle ? ' actif' : '') + '"' +
          ' aria-selected="' + (ongletDossier === o.cle) + '"' +
          ' onclick="changerOngletDossier(\'' + o.cle + '\')">' + o.libelle + compteur + '</button>';
      }).join('') +
    '</div>' +

    '<div class="onglet-corps">' + corpsOnglet(d) + '</div>';

  if (ongletDossier === 'plainte') majApercuDocument();
  if (ongletDossier === 'convocations') rendreSuiviConvocations(id, 'dossier-conv-suivi');
}

function changerOngletDossier(cle) {
  ongletDossier = cle;
  rendreDossier();
}

function corpsOnglet(d) {
  if (ongletDossier === 'progression')  return ongletProgression(d);
  if (ongletDossier === 'convocations') return ongletConvocations(d);
  return ongletPlainte(d);
}

/* ── Onglet 1 : les pièces du dossier ────────────────────────
   Les trois documents se choisissent ici. Le proces-verbal avait sa
   propre entree de menu, alors qu'il n'existe que par le dossier
   auquel il se rattache : il est desormais un document parmi les
   autres, avec ses commandes propres. */
function ongletPlainte(d) {
  var estPV = docAffiche === 'pv';
  return '<div class="grid-2-1">' +
    '<div class="card" style="padding:0;overflow:hidden">' +
      '<div class="doc-onglets">' +
        '<button class="doc-onglet' + (docAffiche === 'plainte' ? ' actif' : '') + '" onclick="voirDocument(\'plainte\')">Déclaration de plainte</button>' +
        '<button class="doc-onglet' + (docAffiche === 'attestation' ? ' actif' : '') + '" onclick="voirDocument(\'attestation\')">Attestation de dépôt</button>' +
        '<button class="doc-onglet' + (estPV ? ' actif' : '') + '" onclick="voirDocument(\'pv\')">Procès-verbal</button>' +
        '<div class="doc-onglets-actions">' +
          '<button class="btn btn-outline btn-sm" onclick="telechargerDocumentAffiche()">Télécharger</button>' +
          '<button class="btn btn-outline btn-sm" onclick="agrandirDocument()">Plein écran</button>' +
        '</div>' +
      '</div>' +
      (estPV ? barrePV(d) : '') +
      '<div class="doc-apercu"><div class="feuille feuille--inline" id="doc-apercu"></div></div>' +
    '</div>' +

    '<div style="display:flex;flex-direction:column;gap:16px">' +
      blocPiecesDossier(d) +
    '</div>' +
  '</div>';
}

/* Message affiche a la place du document quand il n'y a rien a consigner.
   Meme forme pour les deux auditions : le plaignant n'avait aucun message,
   seulement un PV fabrique a partir de sa declaration alors qu'aucune
   audition n'avait eu lieu. */
function messagePVAbsent(titre, explication) {
  return '<div class="pv-absent">' +
    '<svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M9 2.5H4.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6z"/><path d="M9 2.5V6h3.5"/></svg>' +
    '<strong>' + ech(titre) + '</strong>' +
    '<p>' + ech(explication) + '</p>' +
  '</div>';
}

/* Un proces-verbal n'existe que si l'audition correspondante a eu lieu.
   Regle unique, partagee par le document et par sa barre de commandes :
   sinon l'une pourrait proposer de signer ce que l'autre declare absent. */
function pvExiste(d, audition) {
  var aEteAuditionne = (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[d.id] || [])
    .some(function (e) { return e.type === 'audition'; });
  if (audition === 'plaignant') return aEteAuditionne;
  return misEnCauseIdentifie(d) &&
         convocationsDe(d.id).some(function (c) { return c.statut === 'COMPARU'; });
}

/* Texte d'origine, avant toute correction. */
function declarationOriginale(d, audition) {
  return audition === 'plaignant'
    ? '« ' + d.declaration + ' »'
    : '« Je conteste les faits qui me sont reprochés et m\'en explique devant l\'officier. »';
}

/* Commandes propres au proces-verbal : quelle audition, la revision, la
   signature. Le §7.4 exige un PV revisable dont les modifications sont
   tracees — d'ou le bouton de correction et le journal des versions. */
function barrePV(d) {
  var signe = pvEstSigne(d.id);
  var revisions = pvRevisions(d.id, pvAudition);

  return '<div class="pv-barre">' +
    '<div class="form-group" style="margin:0;flex:1;min-width:190px">' +
      '<label class="form-label" for="pv-audition">Audition</label>' +
      '<select class="form-control" id="pv-audition" onchange="changerAuditionPV(this.value)">' +
        '<option value="plaignant"' + (pvAudition === 'plaignant' ? ' selected' : '') + '>Du plaignant</option>' +
        '<option value="mis_en_cause"' + (pvAudition === 'mis_en_cause' ? ' selected' : '') + '>De la personne mise en cause</option>' +
      '</select>' +
    '</div>' +
    '<div class="pv-barre-actions">' +
      (revisions.length
        ? '<button class="btn btn-outline btn-sm" onclick="voirRevisionsPV(\'' + d.id + '\')">' +
          revisions.length + ' révision' + (revisions.length > 1 ? 's' : '') + '</button>'
        : '') +
      (signe
        ? '<span class="badge badge-green">Signé — non modifiable</span>'
        : (modeCorrection
            ? '<button class="btn btn-success btn-sm" onclick="enregistrerCorrectionPV(\'' + d.id + '\')">Enregistrer la correction</button>' +
              '<button class="btn btn-outline btn-sm" onclick="basculerCorrection()">Annuler</button>'
            : '<button class="btn btn-outline btn-sm" onclick="basculerCorrection()">Corriger</button>' +
              '<button class="btn btn-primary btn-sm" onclick="signerPVDossier(\'' + d.id + '\')">Signer le PV</button>')) +
    '</div>' +
  '</div>' +
  (modeCorrection && !signe
    ? '<div class="pv-avis">Modifiez le corps de la déclaration ci-dessous. Chaque correction est horodatée et conservée.</div>'
    : '');
}

/* Le corps du PV est-il en cours de correction ? */
var modeCorrection = false;

function basculerCorrection() {
  modeCorrection = !modeCorrection;
  rendreDossier();
}

function changerAuditionPV(valeur) {
  pvAudition = valeur;
  modeCorrection = false;
  rendreDossier();
}

function enregistrerCorrectionPV(id) {
  var corps = document.getElementById('pv-corps');
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!corps || !d) return;

  var nouveau = corps.innerText.trim();
  if (!nouveau) { toast('Le corps du procès-verbal ne peut pas être vide', 'error'); return; }

  var change = corrigerPV(id, pvAudition, nouveau, ENQUETEUR_COURANT,
                          declarationOriginale(d, pvAudition));
  if (!change) {
    toast('Aucune modification à enregistrer', 'info');
    modeCorrection = false;
    rendreDossier();
    return;
  }

  /* La correction est un acte : elle rejoint le dossier en note interne,
     visible du commissariat mais pas du plaignant. */
  if (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[id]) {
    var m = new Date(), dd = function (n) { return String(n).padStart(2, '0'); };
    HISTORIQUE[id].push({
      etape: d.statut, type: 'note', auteur: ENQUETEUR_COURANT,
      date: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
      heure: dd(m.getHours()) + 'h' + dd(m.getMinutes()),
      texte: 'Correction du procès-verbal (audition ' +
             (pvAudition === 'plaignant' ? 'du plaignant' : 'du mis en cause') + ').'
    });
  }

  modeCorrection = false;
  toast('Correction enregistrée et tracée', 'success');
  rendreDossier();
}

/* Journal des versions : ce qui permet de répondre à un mis en cause qui
   conteste le contenu du PV. */
function voirRevisionsPV(id) {
  var revs = pvRevisions(id, pvAudition);
  if (!revs.length) return;

  var corps = revs.slice().reverse().map(function (r, i) {
    return '<article class="revision">' +
      '<header>' +
        '<span class="badge badge-gold">Version ' + (revs.length - i) + '</span>' +
        '<span>' + ech(r.auteur) + ' — ' + ech(r.date) + ' à ' + ech(r.heure) + '</span>' +
      '</header>' +
      '<div class="revision-cote"><strong>Avant</strong><p>' + ech(r.avant) + '</p></div>' +
      '<div class="revision-cote apres"><strong>Après</strong><p>' + ech(r.apres) + '</p></div>' +
    '</article>';
  }).join('');

  afficherDocument('Révisions du procès-verbal — ' + id,
    '<div class="revisions">' +
      '<p class="revisions-intro">Chaque correction du corps de la déclaration est conservée avec son auteur et son horodatage.</p>' +
      corps +
    '</div>',
    { classe: 'piece', imprimable: false });
}

/* ── Onglet 2 : où en est le dossier, et les échanges ───── */
function ongletProgression(d) {
  var id = d.id;
  return '<div class="grid-1-2">' +
    '<div style="display:flex;flex-direction:column;gap:16px">' +
      '<div class="card">' +
        '<div class="card-title" style="margin-bottom:12px">Étapes</div>' +
        friseEtapes(d) +
        blocEtapeSuivante(d) +
      '</div>' +
      (d.statut !== 'CLOTURE' && d.statut !== 'TRANSMIS'
        ? '<div class="card"><div class="card-title" style="margin-bottom:10px">Clôture</div>' +
          '<p style="font-size:13px;color:var(--text-light);margin:0 0 12px">' +
          'Clôturer met fin à l\'instruction. Le plaignant en est informé dans son espace de suivi.</p>' +
          '<button class="btn btn-success btn-full" onclick="cloturerDossier(\'' + id + '\')">Clôturer le dossier</button></div>'
        : '') +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title" style="margin-bottom:12px">Suivi et échanges</div>' +
      '<div id="fil-dossier">' + renderFilDossier(id) + '</div>' +
      blocRedaction(id) +
    '</div>' +
  '</div>';
}

/* ── Onglet 3 : convocations du dossier ─────────────────── */
function ongletConvocations(d) {
  var identifie = misEnCauseIdentifie(d);

  return '<div class="grid-1-2">' +
    '<div style="display:flex;flex-direction:column;gap:16px">' +
      '<div class="card">' +
        '<div class="card-title" style="margin-bottom:12px">Personne mise en cause</div>' +
        '<div style="font-size:13.5px;line-height:1.7">' +
          (d.misEnCause
            ? ech(d.misEnCause) + '<div style="margin-top:8px">' + (identifie
                ? '<span class="badge badge-green">Identifiée</span>'
                : '<span class="badge badge-gray">Signalement seul</span>') + '</div>'
            : '<span class="text-muted">Inconnue du plaignant à la date de la déclaration.</span>') +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title" style="margin-bottom:12px">Émettre une convocation</div>' +
        '<div id="dossier-conv-formulaire">' + formulaireConvocation(d) + '</div>' +
      '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-header" style="margin-bottom:12px">' +
        '<span class="card-title">Convocations émises</span>' +
        '<span class="text-muted" style="font-size:12.5px">Trois absences entraînent la transmission au procureur</span>' +
      '</div>' +
      '<div id="dossier-conv-suivi"></div>' +
    '</div>' +
  '</div>';
}

/* Rend le document choisi dans l'apercu integre a la page. */
function majApercuDocument() {
  var el = document.getElementById('doc-apercu');
  if (!el || !dossierOuvert) return;
  if (docAffiche === 'pv') {
    el.innerHTML = htmlPV(dossierOuvert, pvAudition);
  } else if (docAffiche === 'attestation' && typeof htmlAttestation === 'function') {
    el.innerHTML = htmlAttestation(dossierOuvert);
  } else if (typeof htmlPlainte === 'function') {
    el.innerHTML = htmlPlainte(dossierOuvert);
  }
}

/* Trois documents possibles : on redessine l'onglet plutot que de jongler
   avec les classes actives. */
function voirDocument(quoi) {
  docAffiche = quoi;
  rendreDossier();
}

/* Le meme document, en pleine page, avec l'impression a portee. */
function agrandirDocument() {
  if (!dossierOuvert) return;
  if (docAffiche === 'pv') {
    afficherDocument('Procès-verbal — ' + dossierOuvert, htmlPV(dossierOuvert, pvAudition));
  } else if (docAffiche === 'attestation') {
    lireAttestation(dossierOuvert);
  } else {
    lirePlainte(dossierOuvert);
  }
}

/* Telecharge la piece affichee. */
function telechargerDocumentAffiche() {
  if (!dossierOuvert) return;
  if (docAffiche === 'pv') imprimerDocument(htmlPV(dossierOuvert, pvAudition));
  else if (docAffiche === 'attestation') telechargerAttestationPDF(dossierOuvert);
  else telechargerPlaintePDF(dossierOuvert);
}

/* Ouvre une piece versee par le plaignant dans la visionneuse. */
function ouvrirPieceDossier(index) {
  var d = mesDossiersActifs().find(function (x) { return x.id === dossierOuvert; });
  if (!d || !d.pieces || !d.pieces[index]) return;
  if (typeof afficherPiece === 'function') afficherPiece(d.pieces[index]);
}

/* Frise compacte des cinq etapes, cote enqueteur. */
function friseEtapes(d) {
  if (typeof ETAPES === 'undefined' || typeof ORDRE_ETAPES === 'undefined') return '';
  var rang = ORDRE_ETAPES.indexOf(d.statut);
  var clos = d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
  return '<ol class="frise-enq">' + ETAPES.map(function (et) {
    var r = ORDRE_ETAPES.indexOf(et.cle);
    var etat = (clos || r < rang) ? 'faite' : (r === rang ? 'courante' : 'avenir');
    return '<li class="' + etat + '"><span></span>' + et.libelle + '</li>';
  }).join('') + '</ol>';
}

/* apercuConvocations() a ete retiree : l'onglet Convocations affiche
   desormais le suivi complet, avec les actions comparu/absent. */

/* ouvrirPVDepuisDossier() et ouvrirConvocationsDepuisDossier() ont ete
   retirees : le PV et les convocations se gerent dans le dossier, il n'y
   a plus de page separee vers laquelle naviguer. */

/* blocPrejudice() a ete retiree : le prejudice figure dans le document
   officiel affiche en apercu, il n'y a plus lieu de le repeter a cote.

   Les pieces, en revanche, gardent leur carte : le document ne fait que
   les nommer, alors que l'enqueteur doit pouvoir les ouvrir. */
function blocPiecesDossier(d) {
  var n = (d.pieces || []).length;
  /* Cliquables : le nom d'un fichier ne dit pas ce qu'il contient. */
  var corps = n
    ? '<div class="fil-pieces">' + d.pieces.map(function (p, i) {
        return '<button type="button" class="fil-piece" onclick="ouvrirPieceDossier(' + i + ')">' +
          '<span class="fil-piece-nom">' + ech(p.nom) + '</span>' +
          '<span class="fil-piece-taille">' + ech(p.taille || '') + '</span>' +
        '</button>';
      }).join('') + '</div>' +
      '<p style="font-size:12px;color:var(--text-light);margin:10px 0 0;line-height:1.55">' +
        'Versées par le plaignant lors du dépôt. Cliquez pour les consulter.</p>'
    : '<p style="font-size:13px;color:var(--text-light);margin:0">' +
      'Le plaignant n\'a joint aucune pièce à sa déclaration.</p>';

  return '<div class="card">' +
    '<div class="card-header" style="margin-bottom:12px">' +
      '<span class="card-title">Pièces du dossier</span>' +
      (n ? '<span class="badge badge-blue">' + n + '</span>' : '') +
    '</div>' + corps +
  '</div>';
}

/* Faire avancer le dossier d'une étape. */
function blocEtapeSuivante(d) {
  var suite = LIBELLE_ETAPE_SUIVANTE[d.statut];
  if (!suite) {
    return '<div class="divider"></div>' +
      '<div class="alert alert-info" style="margin:0 0 14px"><div>' +
      'Ce dossier a atteint son terme : aucune étape suivante.</div></div>';
  }
  var l = (typeof STATUT_LABELS !== 'undefined' && STATUT_LABELS[suite.vers])
    ? STATUT_LABELS[suite.vers][1] : suite.vers;
  return '<div class="divider"></div>' +
    '<div class="card-title" style="margin-bottom:8px">Faire avancer le dossier</div>' +
    '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      '<span style="font-size:13px;color:var(--text-light)">Étape suivante : <strong style="color:var(--primary)">' + l + '</strong></span>' +
      '<button class="btn btn-primary btn-sm" onclick="avancerStatut(\'' + d.id + '\')">' + ech(suite.libelle) + '</button>' +
    '</div>';
}

/* ── Fil du dossier : évènements, messages et notes ──────── */
function renderFilDossier(id) {
  var evts = (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[id]) ? HISTORIQUE[id] : [];
  if (!evts.length) return '<p style="font-size:13px;color:var(--text-light)">Aucun évènement.</p>';

  return evts.slice().sort(function (a, b) {
    return horodatageEvt(a) - horodatageEvt(b);
  }).map(function (e) {
    var quand = e.date + (e.heure ? ' à ' + e.heure : '');

    if (e.type === 'message' || e.type === 'note') {
      var interne = (e.type === 'note');
      var couleur = interne ? 'var(--gray-3)' : 'var(--gold)';
      var fond    = interne ? 'var(--gray-1)' : 'rgba(201,139,0,.06)';
      return '<div style="border:1px solid var(--gray-2);border-left:3px solid ' + couleur + ';' +
        'background:' + fond + ';border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px">' +
          '<span class="badge ' + (interne ? 'badge-gray' : 'badge-gold') + '">' +
            (interne ? 'Note interne' : 'Message au plaignant') + '</span>' +
          '<span style="font-size:12px;color:var(--text-light)">' + ech(e.auteur || '') + ' — ' + ech(quand) + '</span>' +
        '</div>' +
        '<div style="font-size:13px;line-height:1.6">' + ech(e.texte) + '</div>' +
        piecesHtml(e.pieces) +
      '</div>';
    }

    return '<div style="display:flex;justify-content:space-between;gap:12px;padding:7px 0;' +
      'border-bottom:1px solid var(--gray-2);font-size:13px">' +
      '<span><strong>' + ech(e.libelle) + '</strong>' +
        (e.detail ? '<br><span class="text-muted">' + ech(e.detail) + '</span>' : '') + '</span>' +
      '<span style="color:var(--text-light);white-space:nowrap">' + ech(quand) + '</span>' +
    '</div>';
  }).join('');
}

function piecesHtml(pieces) {
  if (!pieces || !pieces.length) return '';
  return '<div class="fil-pieces">' + pieces.map(function (p) {
    var ouvre = p.url ? '<a class="fil-piece" href="' + p.url + '" download="' + ech(p.nom) + '">'
                      : '<span class="fil-piece">';
    var ferme = p.url ? '</a>' : '</span>';
    return ouvre +
      '<span class="fil-piece-nom">' + ech(p.nom) + '</span>' +
      '<span class="fil-piece-taille">' + ech(p.taille || '') + '</span>' +
      ferme;
  }).join('') + '</div>';
}

function horodatageEvt(e) {
  var d = (e.date || '01/01/1970').split('/');
  var h = (e.heure || '00h00').split('h');
  return new Date(+d[2], +d[1] - 1, +d[0], +h[0] || 0, +h[1] || 0).getTime();
}

/* ── Rédaction : message au plaignant ou note interne ─────
   La distinction est explicite parce qu'elle a une conséquence : une
   procédure en cours est confidentielle, et l'enquêteur seul décide de
   ce qui est porté à la connaissance du plaignant. */
function blocRedaction(id) {
  return '' +
    '<div class="divider"></div>' +
    '<div class="card-title" style="margin-bottom:10px">Écrire au dossier</div>' +
    '<div class="form-group" style="margin-bottom:10px">' +
      '<label class="form-label" for="ecrit-texte">Contenu</label>' +
      '<textarea class="form-control" id="ecrit-texte" rows="3" ' +
        'placeholder="Décrivez l\'avancement, une demande de pièce, ou consignez une observation interne."></textarea>' +
      '<div class="field-error" id="err-ecrit-texte"></div>' +
    '</div>' +
    '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;font-size:13px">' +
      '<label style="display:flex;align-items:center;gap:7px;cursor:pointer">' +
        '<input type="radio" name="ecrit-type" value="message" checked> Message au plaignant' +
      '</label>' +
      '<label style="display:flex;align-items:center;gap:7px;cursor:pointer">' +
        '<input type="radio" name="ecrit-type" value="note"> Note interne' +
      '</label>' +
    '</div>' +
    '<div class="form-group" style="margin-bottom:10px">' +
      '<label class="form-label" for="ecrit-pieces">Pièces jointes</label>' +
      '<input type="file" id="ecrit-pieces" multiple class="form-control" ' +
        'accept=".jpg,.jpeg,.png,.pdf,.mp4" style="padding:7px 10px;font-size:13px">' +
      '<div class="form-hint">PV, convocation, notification… Le plaignant pourra les télécharger.</div>' +
    '</div>' +
    '<div class="form-hint" id="ecrit-portee" style="margin-bottom:12px">' +
      'Ce texte sera visible par le plaignant dans son espace de suivi.' +
    '</div>' +
    '<button class="btn btn-primary btn-sm" onclick="ajouterEcrit(\'' + id + '\')">Enregistrer</button>';
}

function tailleFichier(o) {
  if (o < 1024) return o + ' o';
  if (o < 1024 * 1024) return Math.round(o / 1024) + ' Ko';
  return (o / (1024 * 1024)).toFixed(1).replace('.', ',') + ' Mo';
}

function ajouterEcrit(id) {
  var champ = document.getElementById('ecrit-texte');
  var err = document.getElementById('err-ecrit-texte');
  var texte = champ ? champ.value.trim() : '';

  if (texte.length < 10) {
    if (err) err.textContent = 'Rédigez au moins une phrase (10 caractères minimum).';
    if (champ) champ.focus();
    return;
  }
  if (err) err.textContent = '';

  var choisi = document.querySelector('input[name="ecrit-type"]:checked');
  var type = choisi ? choisi.value : 'message';

  var maintenant = new Date();
  var deuxChiffres = function (n) { return String(n).padStart(2, '0'); };

  /* Les fichiers joints restent en memoire du navigateur : createObjectURL
     donne un lien reellement telechargeable pendant la session, faute de
     serveur de stockage. */
  var champFichiers = document.getElementById('ecrit-pieces');
  var pieces = [];
  if (champFichiers && champFichiers.files) {
    Array.prototype.forEach.call(champFichiers.files, function (f) {
      pieces.push({ nom: f.name, taille: tailleFichier(f.size), url: URL.createObjectURL(f) });
    });
  }

  if (typeof HISTORIQUE === 'undefined') return;
  if (!HISTORIQUE[id]) HISTORIQUE[id] = [];

  /* Le message se rattache a l'etape ou en est le dossier : ce n'est pas
     une etape de plus dans la procedure. */
  var dossier = mesDossiersActifs().find(function (x) { return x.id === id; });
  var etape = dossier ? dossier.statut : 'RECU';

  HISTORIQUE[id].push({
    etape: etape,
    type: type,
    date: deuxChiffres(maintenant.getDate()) + '/' + deuxChiffres(maintenant.getMonth() + 1) + '/' + maintenant.getFullYear(),
    heure: deuxChiffres(maintenant.getHours()) + 'h' + deuxChiffres(maintenant.getMinutes()),
    auteur: ENQUETEUR_COURANT,
    texte: texte,
    pieces: pieces
  });

  champ.value = '';
  if (champFichiers) champFichiers.value = '';
  document.getElementById('fil-dossier').innerHTML = renderFilDossier(id);

  var suffixe = pieces.length ? ' (' + pieces.length + ' pièce' + (pieces.length > 1 ? 's' : '') + ')' : '';
  toast((type === 'message'
    ? 'Message transmis au plaignant'
    : 'Note interne enregistrée') + suffixe, 'success');
}

/* Le libellé de portée suit le choix, pour que l'enquêteur sache toujours
   qui lira ce qu'il écrit. */
document.addEventListener('change', function (e) {
  if (e.target.name !== 'ecrit-type') return;
  var el = document.getElementById('ecrit-portee');
  if (!el) return;
  el.textContent = e.target.value === 'message'
    ? 'Ce texte sera visible par le plaignant dans son espace de suivi.'
    : 'Ce texte reste interne au commissariat : le plaignant ne le verra pas.';
});

/* ── Navigation et actions ───────────────────────────────── */
function navEnqTo(page) {
  var el = document.querySelector('.sidebar-item[data-page="' + page + '"]');
  if (el) navEnq(el, page);
  else showPage(page);
}

function cloturerDossier(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (d) {
    /* L'evenement se rattache a l'etape ou etait le dossier, et le statut
       ne change qu'apres, pour que l'historique reste lisible. */
    ajouterEvenementStatut(id, 'Dossier clôturé', 'Clôturé par ' + ENQUETEUR_COURANT);
    d.statut = 'CLOTURE';
  }
  toast('Dossier ' + id + ' clôturé', 'success');
  renderMesDossiers();
  majCompteurDossiers();
  majKPI();
  if (dossierOuvert === id) rendreDossier();
}

function navEnq(el, page) {
  document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
  el.classList.add('active');
  showPage(page);
}

/* signPV() visait #pv-ia-badge et #sig-box, deux elements de l'ancienne
   page PV statique. signerPVDossier() la remplace : elle inscrit la
   signature dans l'historique du dossier, donc dans le suivi du plaignant. */

/* Le compteur de la barre laterale ne suivait pas les cloture : le
   tableau tombait a deux lignes et le badge affichait toujours 3. */
function majCompteurDossiers() {
  var el = document.querySelector('.sidebar-item[data-page="page-dashboard"] .badge');
  if (!el) return;
  var n = mesDossiersActifs().filter(function (d) { return d.statut !== 'CLOTURE'; }).length;
  el.textContent = n;
  el.style.display = n ? '' : 'none';
}

/* ============================================================
   INDICATEURS
   Calcules, et non ecrits en dur : la page annoncait « 3 en instruction »
   et « 8 dossiers actifs » pour un portefeuille de 3 dossiers.
   ============================================================ */
function majKPI() {
  var zone = document.getElementById('kpi-enqueteur');
  if (!zone) return;
  var mes = mesDossiersActifs();
  var actifs = mes.filter(function (d) { return d.statut !== 'CLOTURE'; });
  var enEnquete = mes.filter(function (d) { return d.statut === 'EN_INSTRUCTION'; }).length;
  var clos = mes.filter(function (d) { return d.statut === 'CLOTURE'; }).length;

  /* « PV a signer » remplace : la regle voulait une audition sans PV, or
     chaque audition du jeu de donnees est suivie de son PV — le compteur
     restait donc structurellement a zero. Les comparutions attendues, elles,
     appellent une action de l'enqueteur. */
  var attendues = mes.reduce(function (n, d) {
    return n + convocationsDe(d.id).filter(function (c) { return c.statut === 'EN_ATTENTE'; }).length;
  }, 0);

  var cases = [
    ['urgent',   attendues,      'Comparutions attendues'],
    ['en-cours', enEnquete,      'En enquête'],
    ['ok',       clos,           'Clôturés'],
    ['total',    actifs.length,  'Dossiers actifs']
  ];
  zone.innerHTML = cases.map(function (c) {
    return '<div class="kpi ' + c[0] + '"><div class="num">' + c[1] + '</div>' +
           '<div class="lbl">' + c[2] + '</div></div>';
  }).join('');
}


/* ============================================================
   PROCES-VERBAUX
   Le document etait entierement statique : il annoncait « Escroquerie,
   78 % » pour un dossier que data.js decrit comme un vol simple a 82 %,
   et son recit etait celui d'un autre dossier.

   Le compte rendu decrit deux auditions distinctes — le plaignant, puis
   le mis en cause — donnant chacune lieu a un PV. Les deux sont ici.
   ============================================================ */
/* Le proces-verbal rend desormais son HTML, comme la plainte et
   l'attestation : il s'affiche dans le meme apercu et dans la meme
   visionneuse. */
function htmlPV(id, audition) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return '';

  /* Un proces-verbal consigne une audition qui a eu lieu. Tant qu'elle
     n'est pas tenue, il n'y a rien a consigner : on le dit, plutot que de
     produire un document qui aurait l'air authentique. */
  var aEteAuditionne = (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[d.id] || [])
    .some(function (e) { return e.type === 'audition'; });

  if (audition === 'plaignant' && !aEteAuditionne) {
    return messagePVAbsent(
      'Le plaignant n\'a pas encore été auditionné.',
      'Le procès-verbal sera établi à l\'issue de son audition. ' +
      (convocationsDe(d.id).length
        ? 'Une convocation a été émise.'
        : 'Aucune convocation n\'a encore été émise.'));
  }

  /* Le PV du mis en cause suppose qu'il soit identifie et qu'il ait
     comparu : sur un vol commis par un inconnu, il n'y a pas d'audition
     possible, et le dire vaut mieux qu'un document vide. */
  if (audition === 'mis_en_cause') {
    var identifie = misEnCauseIdentifie(d);
    var comparu = convocationsDe(d.id).some(function (c) { return c.statut === 'COMPARU'; });
    if (!identifie || !comparu) {
      var abs = absencesConstatees(d.id);
      return messagePVAbsent(
        !identifie
          ? 'La personne mise en cause n\'est pas identifiée.'
          : 'La personne mise en cause n\'a pas encore comparu.',
        (!identifie
          ? 'Aucune convocation ne peut lui être adressée en l\'état, et donc aucun procès-verbal établi.'
          : 'Le procès-verbal sera établi après son audition.') +
        (abs ? ' ' + abs + ' absence' + (abs > 1 ? 's' : '') + ' constatée' + (abs > 1 ? 's' : '') + '.' : ''));
    }
  }

  var signe = pvEstSigne(d.id);
  var auditionne = audition === 'plaignant' ? d.plaignant : (d.misEnCause || '').split(',')[0];
  var qualite = audition === 'plaignant' ? 'plaignant' : 'mis en cause';
  var revisions = pvRevisions(d.id, audition);

  return (typeof enteteOfficielle === 'function' ? enteteOfficielle() : '') +
    '<div style="text-align:center;margin-bottom:34px">' +
      '<h1 style="margin:0;font-size:24px;text-transform:uppercase;text-decoration:underline;letter-spacing:1px">Procès-verbal d\'audition</h1>' +
      '<p style="margin:12px 0 0;font-size:17px">Dossier N° <strong>' + d.id + '</strong> — audition du ' + qualite + '</p>' +
    '</div>' +
    '<div style="font-size:15px;line-height:1.85;text-align:justify">' +
      '<p>L\'an deux mille vingt-six, le <strong>' + dateLettres(d.date) + '</strong>,</p>' +
      '<p>Nous, <strong>' + ech(ENQUETEUR_COURANT) + '</strong>, officier de police judiciaire au ' + ech(d.commissariat) + ',</p>' +
      '<p>avons procédé à l\'audition de :</p>' +
      '<p style="margin-left:18px"><strong>' + ech(auditionne) + '</strong>, en qualité de ' + qualite + '.</p>' +
      '<p>Lequel nous a déclaré ce qui suit, après avoir prêté serment de dire la vérité :</p>' +
      /* Seul le corps de la déclaration est révisable : l'en-tête, les
         mentions légales et les signatures ne se corrigent pas. */
      '<div id="pv-corps"' + (modeCorrection && !signe ? ' contenteditable="true" class="pv-editable"' : '') +
        ' style="border:1px solid #000;padding:14px 16px;font-style:italic;margin:12px 0">' +
        ech(pvTexte(d.id, audition, declarationOriginale(d, audition))) +
      '</div>' +
      (audition === 'plaignant' && d.prejudice
        ? '<p><strong>Préjudice déclaré :</strong> ' + ech(d.prejudice.nature) +
          (d.prejudice.montant ? ', estimé à ' + ech(d.prejudice.montant) + ' FCFA' : '') +
          (d.prejudice.detail ? ' — ' + ech(d.prejudice.detail) : '') + '.</p>'
        : '') +
      '<p>Lecture faite du présent procès-verbal, le comparant déclare qu\'il est fidèle à ses déclarations et le signe.</p>' +
      /* Mention obligatoire si le document a été corrigé : elle rend le
         nombre de versions opposable, sans exposer leur contenu. */
      (revisions.length
        ? '<p style="font-size:13px;font-style:italic">Le présent procès-verbal a fait l\'objet de ' +
          revisions.length + ' correction' + (revisions.length > 1 ? 's' : '') +
          ', dont la dernière le ' + revisions[revisions.length - 1].date +
          ' à ' + revisions[revisions.length - 1].heure + '. Le détail des versions est conservé au dossier.</p>'
        : '') +
      (signe
        ? '<p style="border:1px solid #000;padding:9px 12px;font-weight:bold">Signé électroniquement par ' + ech(ENQUETEUR_COURANT) + '.</p>'
        : '') +
    '</div>' +
    '<table style="width:100%;font-size:14px;margin-top:34px"><tr>' +
      '<td style="width:50%;text-align:center"><div style="border-top:1px solid #000;width:170px;margin:0 auto;padding-top:6px">Signature du comparant<br>' + ech(auditionne) + '</div></td>' +
      '<td style="width:50%;text-align:center"><div style="border-top:1px solid #000;width:190px;margin:0 auto;padding-top:6px">Signature de l\'enquêteur<br>' + ech(ENQUETEUR_COURANT) + '</div></td>' +
    '</tr></table>';
}

function signerPVDossier(id) {
  if (typeof HISTORIQUE === 'undefined') return;
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;
  var m = new Date(), dd = function (n) { return String(n).padStart(2, '0'); };
  HISTORIQUE[id].push({
    etape: d.statut, type: 'pv',
    date: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
    heure: dd(m.getHours()) + 'h' + dd(m.getMinutes()),
    libelle: 'Procès-verbal établi', detail: 'PV signé par ' + ENQUETEUR_COURANT
  });
  toast('PV signé électroniquement avec horodatage', 'success');
  majKPI();
  rendreDossier();
}

/* ============================================================
   CONVOCATIONS
   Le compte rendu impose un minimum de trois convocations avant
   transmission au procureur : le numero d'ordre est donc affiche, et
   la bascule proposee des la troisieme absence.
   ============================================================ */
/* Formulaire d'emission, rendu dans l'onglet Convocations du dossier.
   Il vivait sur une page separee, alors qu'une convocation n'existe que
   par le dossier qui la motive. */
/* Destinataire courant du formulaire : 'plaignant' ou 'mis_en_cause'. */
var convDestinataire = 'plaignant';

function changerDestinataireConvocation(valeur) {
  convDestinataire = valeur;
  var d = mesDossiersActifs().find(function (x) { return x.id === dossierOuvert; });
  var zone = document.getElementById('dossier-conv-formulaire');
  if (d && zone) zone.innerHTML = formulaireConvocation(d);
}

function contactDe(d, destinataire) {
  return destinataire === 'plaignant' ? (d.contact || null) : (d.contactMisEnCause || null);
}

function formulaireConvocation(d) {
  var id = d.id;
  var versPlaignant = convDestinataire === 'plaignant';
  var identifie = misEnCauseIdentifie(d);

  /* On ne convoque pas quelqu'un qu'on ne sait pas nommer. */
  if (!versPlaignant && !identifie) {
    return selecteurDestinataire(d) +
      '<div class="alert alert-info" style="margin:0"><div>' +
      'La personne mise en cause n\'est pas identifiée : aucune convocation ne peut lui être adressée.' +
      (d.misEnCause ? '<br><span class="text-muted">Signalement au dossier : ' + ech(d.misEnCause) + '</span>' : '') +
      '</div></div>';
  }

  var contact = contactDe(d, convDestinataire);
  var aMail = !!(contact && contact.email);
  var aTel  = !!(contact && contact.telephone);
  var ordre = versPlaignant ? 1 : convocationsDe(id).length + 1;
  var nomDefaut = versPlaignant ? d.plaignant : (d.misEnCause || '').split(',')[0];

  /* Rappel du rang seulement pour le mis en cause : la regle des trois
     convocations le concerne lui, pas le plaignant. */
  /* Une simple mention sous le selecteur, plutot qu'un encadre : le rang
     se lit d'un coup d'oeil sans occuper trois lignes. */
  var rappel = versPlaignant ? '' :
    '<div class="conv-rang' + (ordre >= 3 ? ' alerte' : '') + '">' +
      (ORDINAUX[ordre - 1] || ordre + 'e') + ' convocation' +
      (absencesConstatees(id) ? ' — ' + absencesConstatees(id) + ' absence(s) constatée(s)' : '') +
      (ordre >= 3 ? ' — au-delà, transmission au procureur' : '') +
    '</div>';

  return selecteurDestinataire(d) + rappel +
    '<div class="form-row-3">' +
      '<div class="form-group" style="margin:0">' +
        '<label class="form-label" for="conv-nom">Nom</label>' +
        '<input class="form-control" type="text" id="conv-nom" value="' + ech(nomDefaut) + '">' +
      '</div>' +
      '<div class="form-group" style="margin:0">' +
        '<label class="form-label" for="conv-date">Date</label>' +
        '<input class="form-control" type="date" id="conv-date">' +
      '</div>' +
      '<div class="form-group" style="margin:0">' +
        '<label class="form-label" for="conv-heure">Heure</label>' +
        '<input class="form-control" type="time" id="conv-heure" value="09:00">' +
      '</div>' +
    '</div>' +
    '<div class="form-group">' +
      '<label class="form-label" for="conv-motif">Motif</label>' +
      '<input class="form-control" type="text" id="conv-motif" value="Audition dans le cadre de l\'instruction d\'une plainte pour ' +
        ech(d.type.toLowerCase()) + ' déposée le ' + d.date + '.">' +
    '</div>' +

    blocCanaux(contact, aMail, aTel) +

    '<div class="field-error" id="err-conv-date"></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
      '<button class="btn btn-primary" onclick="emettreConvocation(\'' + id + '\')">Émettre</button>' +
      '<button class="btn btn-outline" onclick="apercuConvocation(\'' + id + '\')">Aperçu</button>' +
    '</div>';
}

function selecteurDestinataire(d) {
  return '<div class="form-group">' +
    '<label class="form-label" for="conv-destinataire">Convoquer</label>' +
    '<select class="form-control" id="conv-destinataire" onchange="changerDestinataireConvocation(this.value)">' +
      '<option value="plaignant"' + (convDestinataire === 'plaignant' ? ' selected' : '') + '>' +
        'Le plaignant — ' + ech(d.plaignant) + '</option>' +
      '<option value="mis_en_cause"' + (convDestinataire === 'mis_en_cause' ? ' selected' : '') + '>' +
        'La personne mise en cause</option>' +
    '</select>' +
  '</div>';
}

/* Canaux de remise, en boutons segmentes. Sans adresse ni numero il ne
   reste que la remise en main propre — c'est precisement la situation
   decrite dans le compte rendu, ou le plaignant porte lui-meme la
   convocation au mis en cause. */
function blocCanaux(contact, aMail, aTel) {
  var choix = '';
  if (aMail) choix += optionCanal('email',  'E-mail', true);
  if (aTel)  choix += optionCanal('sms',    'SMS',    !aMail);
  choix += optionCanal('remise', 'Main propre', !aMail && !aTel);

  var precision = aMail ? contact.email
                : aTel  ? contact.telephone
                : 'Aucune coordonnée au dossier : la convocation sera imprimée.';

  return '<div class="form-group">' +
    '<label class="form-label">Mode de remise</label>' +
    '<div class="canaux">' + choix + '</div>' +
    '<div class="form-hint" id="canal-precision">' + ech(precision) + '</div>' +
  '</div>';
}

function optionCanal(valeur, libelle, coche) {
  return '<label class="canal">' +
    '<input type="radio" name="conv-canal" value="' + valeur + '"' +
      (coche ? ' checked' : '') + ' onchange="majPrecisionCanal()">' +
    '<span>' + libelle + '</span>' +
  '</label>';
}

/* La precision suit le canal choisi : l'agent voit ou part la convocation. */
function majPrecisionCanal() {
  var el = document.getElementById('canal-precision');
  var choisi = document.querySelector('input[name="conv-canal"]:checked');
  if (!el || !choisi) return;
  var d = mesDossiersActifs().find(function (x) { return x.id === dossierOuvert; });
  var contact = d ? contactDe(d, convDestinataire) : null;
  el.textContent =
    choisi.value === 'email' ? (contact && contact.email) || ''
  : choisi.value === 'sms'   ? (contact && contact.telephone) || ''
  : 'La convocation sera imprimée pour être remise.';
}

/* Aperçu avant émission : le document tel qu'il sera envoyé ou remis. */
function apercuConvocation(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;
  var date = (document.getElementById('conv-date') || {}).value || '';
  if (!date) {
    var err = document.getElementById('err-conv-date');
    if (err) err.textContent = 'Indiquez la date de comparution avant l\'aperçu.';
    return;
  }
  var p = date.split('-');
  lireConvocation(d, {
    ordre: convDestinataire === 'plaignant' ? 1 : convocationsDe(id).length + 1,
    nom: (document.getElementById('conv-nom') || {}).value || '',
    date: p[2] + '/' + p[1] + '/' + p[0],
    heure: ((document.getElementById('conv-heure') || {}).value || '09:00').replace(':', 'h'),
    motif: (document.getElementById('conv-motif') || {}).value || ''
  }, convDestinataire);
}

function rendreSuiviConvocations(id, cibleId) {
  var zone = document.getElementById(cibleId || 'conv-suivi');
  if (!zone) return;
  var liste = convocationsDe(id);

  if (!liste.length) {
    zone.innerHTML = '<p style="font-size:13px;color:var(--text-light);margin:0">Aucune convocation émise pour ce dossier.</p>';
    return;
  }

  var html = liste.slice().sort(function (a, b) { return a.ordre - b.ordre; }).map(function (c) {
    var l = STATUT_CONVOCATION[c.statut] || ['badge-gray', c.statut];
    return '<div style="padding:11px 0;border-bottom:1px solid var(--gray-2)">' +
      '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">' +
        '<div style="min-width:0">' +
          '<strong>' + (ORDINAUX[c.ordre - 1] || c.ordre + 'e') + ' convocation</strong> — ' + ech(c.nom) + '<br>' +
          '<span class="text-muted">Le ' + ech(c.date) + ' à ' + ech(c.heure) + '</span>' +
        '</div>' +
        '<span class="badge ' + l[0] + '">' + l[1] + '</span>' +
      '</div>' +
      (c.statut === 'EN_ATTENTE'
        ? '<div style="display:flex;gap:8px;margin-top:9px;flex-wrap:wrap">' +
            '<button class="btn btn-success btn-sm" onclick="marquerConvocation(\'' + id + '\',' + c.ordre + ',\'COMPARU\')">A comparu</button>' +
            '<button class="btn btn-outline btn-sm" onclick="marquerConvocation(\'' + id + '\',' + c.ordre + ',\'ABSENT\')">Absent</button>' +
          '</div>'
        : '') +
    '</div>';
  }).join('');

  if (doitPasserAuProcureur(id)) {
    html += '<div class="alert alert-warning" style="margin-top:14px"><div>' +
      '<strong>Trois absences injustifiées constatées.</strong><br>' +
      'Conformément à la procédure, le dossier doit être transmis au procureur de la République.' +
      '<div style="margin-top:10px"><button class="btn btn-primary btn-sm" onclick="transmettreProcureur(\'' + id + '\')">Transmettre au procureur</button></div>' +
      '</div></div>';
  }
  zone.innerHTML = html;
}

/* Le suivi et le formulaire vivent tous deux dans l'onglet du dossier. */
function rafraichirConvocations(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  var form = document.getElementById('dossier-conv-formulaire');
  if (form && d) form.innerHTML = formulaireConvocation(d);
  if (document.getElementById('dossier-conv-suivi')) rendreSuiviConvocations(id, 'dossier-conv-suivi');
}

function marquerConvocation(id, ordre, statut) {
  var c = convocationsDe(id).find(function (x) { return x.ordre === ordre; });
  if (!c) return;
  c.statut = statut;
  toast(statut === 'COMPARU' ? 'Comparution enregistrée' : 'Absence constatée',
        statut === 'COMPARU' ? 'success' : 'warning');
  rafraichirConvocations(id);
}

function emettreConvocation(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  var nom = (document.getElementById('conv-nom') || {}).value || '';
  var date = (document.getElementById('conv-date') || {}).value || '';
  var heure = (document.getElementById('conv-heure') || {}).value || '09:00';
  var motif = (document.getElementById('conv-motif') || {}).value || '';
  var err = document.getElementById('err-conv-date');

  if (!date) {
    if (err) err.textContent = 'Indiquez la date de comparution.';
    return;
  }
  if (err) err.textContent = '';

  var canalEl = document.querySelector('input[name="conv-canal"]:checked');
  var canal = canalEl ? canalEl.value : 'remise';
  var versPlaignant = convDestinataire === 'plaignant';
  var contact = contactDe(d, convDestinataire);
  var p = date.split('-');

  var conv = {
    ordre: versPlaignant ? 1 : (convocationsDe(id).length + 1),
    destinataire: convDestinataire,
    nom: nom.trim(),
    date: p[2] + '/' + p[1] + '/' + p[0],
    heure: heure.replace(':', 'h'),
    statut: 'EN_ATTENTE',
    canal: canal,
    motif: motif.trim()
  };

  /* Seules les convocations du mis en cause sont numerotees : la regle
     des trois absences ne vise que lui. */
  if (!versPlaignant) {
    if (!CONVOCATIONS[id]) CONVOCATIONS[id] = [];
    CONVOCATIONS[id].push(conv);
  }

  var libelleCanal = canal === 'email' ? 'par e-mail à ' + (contact ? contact.email : '')
                   : canal === 'sms'   ? 'par SMS au ' + (contact ? contact.telephone : '')
                   : 'à remettre en main propre';

  /* La convocation est un acte de procédure : elle rejoint l'historique,
     donc le suivi du plaignant. */
  if (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[id]) {
    HISTORIQUE[id].push({
      etape: d ? d.statut : 'AUDITION', type: 'convocation',
      date: conv.date, heure: conv.heure,
      libelle: versPlaignant
        ? 'Convocation du plaignant'
        : (ORDINAUX[conv.ordre - 1] || conv.ordre + 'e') + ' convocation émise',
      detail: (versPlaignant ? 'Audition fixée' : 'Personne mise en cause convoquée') +
              ' — ' + libelleCanal
    });
  }

  /* Sans canal electronique, le document doit etre imprime : on l'ouvre. */
  if (canal === 'remise') {
    toast('Convocation établie — à imprimer et remettre', 'info');
    lireConvocation(d, conv, convDestinataire);
  } else {
    toast('Convocation envoyée ' + libelleCanal, 'success');
  }

  rafraichirConvocations(id);
  rendreDossier();
}

function transmettreProcureur(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;
  d.statut = 'TRANSMIS';
  ajouterEvenementStatut(id, 'Dossier transmis au procureur',
    'Trois absences injustifiées du mis en cause');
  toast('Dossier ' + id + ' transmis au procureur', 'success');
  renderMesDossiers();
  majKPI();
  rendreDossier();
}

/* ============================================================
   CHANGEMENT DE STATUT
   Sans lui, le cycle de vie du dossier ne pouvait pas etre parcouru :
   la frise du citoyen affiche cinq etapes que rien ne faisait avancer.
   ============================================================ */
function ajouterEvenementStatut(id, libelle, detail) {
  if (typeof HISTORIQUE === 'undefined' || !HISTORIQUE[id]) return;
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  var m = new Date(), dd = function (n) { return String(n).padStart(2, '0'); };
  HISTORIQUE[id].push({
    etape: d ? d.statut : 'RECU', type: 'statut',
    date: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
    heure: dd(m.getHours()) + 'h' + dd(m.getMinutes()),
    libelle: libelle, detail: detail || ''
  });
}

var LIBELLE_ETAPE_SUIVANTE = {
  RECU:           { vers: 'AUDITION',       libelle: 'Audition programmée',     detail: 'Convocation des parties' },
  AUDITION:       { vers: 'EN_INSTRUCTION', libelle: 'Enquête ouverte',         detail: 'Vérifications engagées' },
  EN_INSTRUCTION: { vers: 'DECISION',       libelle: 'Dossier en délibération', detail: 'Analyse des éléments recueillis' },
  DECISION:       { vers: 'CLOTURE',        libelle: 'Dossier clôturé',         detail: 'Décision notifiée au plaignant' }
};

function avancerStatut(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;
  var suite = LIBELLE_ETAPE_SUIVANTE[d.statut];
  if (!suite) { toast('Ce dossier a atteint son terme', 'info'); return; }

  d.statut = suite.vers;
  ajouterEvenementStatut(id, suite.libelle, suite.detail);
  toast('Dossier ' + id + ' — ' + suite.libelle.toLowerCase(), 'success');

  renderMesDossiers();
  majKPI();
  majCompteurDossiers();
  ouvrirDossier(id);   /* rafraichit la fiche ouverte */
}

(function initEnqueteurPage() {
  showPage('page-dashboard');
  renderMesDossiers();
  majCompteurDossiers();
  majKPI();
})();
