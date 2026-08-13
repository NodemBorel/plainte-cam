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
  var existe = pvExiste(d, pvAudition);
  var signe = pvEstSigne(d.id);
  var revisions = pvRevisions(d.id, pvAudition);

  var actions;
  if (!existe) {
    /* Aucun document : ni signature ni correction possibles. */
    actions = '<span class="text-muted" style="font-size:12.5px">Aucun procès-verbal à ce stade</span>';
  } else if (signe) {
    actions = '<span class="badge badge-green">Signé — non modifiable</span>';
  } else if (modeCorrection) {
    actions =
      '<button class="btn btn-success btn-sm" onclick="enregistrerCorrectionPV(\'' + d.id + '\')">Enregistrer la correction</button>' +
      '<button class="btn btn-outline btn-sm" onclick="basculerCorrection()">Annuler</button>';
  } else {
    actions =
      '<button class="btn btn-outline btn-sm" onclick="basculerCorrection()">Corriger</button>' +
      '<button class="btn btn-primary btn-sm" onclick="signerPVDossier(\'' + d.id + '\')">Signer le PV</button>';
  }

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
      actions +
    '</div>' +
  '</div>' +

  /* Chaque correction est listee avec son heure et son auteur : une seule
     ligne « derniere modification » ne suffit pas a rendre compte de
     l'historique quand un mis en cause conteste le contenu du PV. */
  blocModifications(revisions, d.id) +

  (modeCorrection && existe && !signe
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

/* Liste des corrections, sous la barre du PV. Chaque ligne porte son
   numéro de version, son horodatage et son auteur ; un clic ouvre le
   détail avant / après. */
function blocModifications(revisions, id) {
  if (!revisions.length) return '';

  var lignes = revisions.map(function (r, i) {
    return '<li><button type="button" onclick="voirRevisionsPV(\'' + id + '\')">' +
      '<span class="modif-version">v' + (i + 1) + '</span>' +
      '<span class="modif-quand">' + ech(r.date) + ' à ' + ech(r.heure) + '</span>' +
      '<span class="modif-qui">' + ech(r.auteur) + '</span>' +
    '</button></li>';
  }).reverse().join('');

  /* Replie par defaut : l'historique n'a d'interet qu'a la demande, il ne
     doit pas s'interposer entre l'agent et le document. */
  return '<details class="pv-modifs">' +
    '<summary>' + revisions.length + ' modification' + (revisions.length > 1 ? 's' : '') +
      ' — la dernière le ' + ech(revisions[revisions.length - 1].date) +
      ' à ' + ech(revisions[revisions.length - 1].heure) +
      '<span class="fil-chevron" aria-hidden="true"></span></summary>' +
    '<ul>' + lignes + '</ul>' +
  '</details>';
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
/* Tout tient dans l'étapier : ce qu'une étape demande et ce qui s'y est
   passé se lisaient dans deux colonnes séparées, si bien qu'un message
   écrit à l'audition voisinait à l'écran avec un acte de la décision.
   Chaque étape porte désormais ses actes, son fil et, si c'est celle en
   cours, de quoi écrire au dossier. */
function ongletProgression(d) {
  return '<div class="card">' +
    '<div class="card-title" style="margin-bottom:18px">Étapes du dossier</div>' +
    friseEtapes(d) +
  '</div>';
}

/* ── Actions possibles à l'étape en cours ────────────────────
   Le dossier ne se pilotait que par le bouton « étape suivante », sans
   qu'on sache ce qu'il reste à faire avant de l'actionner. Chaque étape
   annonce donc les actes qui lui appartiennent, et ceux déjà accomplis
   apparaissent barrés plutôt que masqués : l'agent voit son avancement.
   ─────────────────────────────────────────────────────────── */
function actesDeLEtape(d, cle) {
  var id = d.id;
  var h = (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[id]) || [];
  var aEtape = function (etape, type) {
    return h.some(function (e) { return e.etape === etape && e.type === type; });
  };
  var aAudition   = h.some(function (e) { return e.type === 'audition'; });
  var aPV         = h.some(function (e) { return e.type === 'pv'; });
  var convPlaign  = h.some(function (e) { return e.type === 'convocation' && /plaignant/i.test(e.libelle || ''); });
  var convMEC     = convocationsDe(id).length > 0;
  var comparuMEC  = convocationsDe(id).some(function (c) { return c.statut === 'COMPARU'; });
  var clos        = d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
  var actes = [];

  /* Évènements que cette étape doit rendre visibles. Chaque acte prélève
     ce qui le concerne ; ce qui reste échoit en fin de fonction à l'acte
     principal de l'étape. Sans ce prélèvement exclusif, un évènement que
     personne ne revendique — un message, une convocation au libellé
     inattendu — ne s'afficherait nulle part et disparaîtrait sans bruit,
     le journal commun n'étant plus là pour le rattraper. */
  var bassin = h.filter(function (e) { return !e.apropos && e.etape === cle; });
  var traces = function (test) {
    var pris = bassin.filter(test);
    bassin = bassin.filter(function (e) { return pris.indexOf(e) < 0; });
    return pris;
  };

  /* La convocation est acquise si elle figure à l'historique, mais aussi
     dès que l'audition a eu lieu : on ne tient pas une audition sans
     l'avoir fixée. Sans cette seconde branche, un dossier déjà entendu
     affichait « 1 à faire » sur une étape franchie de longue date. */
  if (cle === 'RECU') {
    /* Le dépôt, la réception et l'affectation ne sont pas des actes de
       l'enquêteur : ils précèdent son intervention. Ils se lisent quand
       même, sous l'acte que sa saisine ouvre. */
    actes.push(acte('Fixer la date d\'audition du plaignant',
      'Émet la convocation et fait passer le dossier à l\'étape Audition.',
      'programmerAudition(\'' + id + '\', \'RECU\')', convPlaign || aAudition,
      false,
      traces(function (e) { return e.etape === 'RECU'; }),
      [doc('Déclaration de plainte', 'Telle que déposée en ligne',
           'lirePlainte(\'' + id + '\')'),
       doc('Attestation de dépôt', 'Remise au plaignant',
           'lireAttestation(\'' + id + '\')')]));
  }

  /* L'étape Audition mène deux fils : celui du plaignant — on l'entend,
     puis on signe son PV — et celui du mis en cause — on l'identifie, on
     le convoque, on constate s'il vient. Chacun suit son ordre, mais les
     deux avancent de front : signer le PV du plaignant n'attend pas la
     comparution. Un acte dont le tour n'est pas venu reste affiché, sans
     bouton, avec la raison — comme une étape à venir. */
  if (cle === 'AUDITION') {
    actes.push(acte('Enregistrer l\'audition du plaignant',
      'Consigne que l\'audition a eu lieu. Le procès-verbal devient alors établissable.',
      'enregistrerAudition(\'' + id + '\', \'AUDITION\')', aAudition, false,
      traces(function (e) {
        return e.etape === 'AUDITION' &&
          (e.type === 'audition' ||
           (e.type === 'convocation' && /plaignant/i.test(e.libelle || '')) ||
           (e.type === 'statut' && /audition/i.test(e.libelle || '')));
      }),
      convPlaign
        ? [doc('Convocation du plaignant', 'Document remis ou adressé',
               'ouvrirConvocationActe(\'' + id + '\', \'plaignant\')')]
        : []));

    actes.push(acte('Relire et signer le procès-verbal',
      aAudition ? 'Le document s\'ouvre ci-dessous ; la signature se pose depuis l\'onglet Plainte.'
                : 'Après l\'enregistrement de l\'audition.',
      'allerAuPV()', aPV, !aAudition,
      traces(function (e) { return e.type === 'pv'; }),
      /* Le PV n'existe qu'une fois l'audition tenue : le proposer avant
         ouvrirait un document vide. */
      aAudition
        ? [doc('Procès-verbal d\'audition du plaignant',
               pvEstSigne(id) ? 'Signé — lecture seule' : 'Établi, en attente de signature',
               'ouvrirPVActe(\'' + id + '\', \'plaignant\')')]
        : []));

    actes.push(acte(misEnCauseIdentifie(d)
        ? 'Convoquer la personne mise en cause'
        : 'Identifier la personne mise en cause',
      misEnCauseIdentifie(d)
        ? 'Trois absences injustifiées entraînent la transmission au procureur.'
        : 'Aucune convocation possible tant qu\'elle n\'est pas identifiée.',
      'changerOngletDossier(\'convocations\')', convMEC, false,
      traces(function (e) {
        return e.type === 'convocation' && /mis en cause/i.test(e.libelle || '');
      }),
      /* Une convocation par ordre émis, plus le PV du mis en cause s'il a
         été entendu. */
      convocationsDe(id).map(function (c) {
        return doc((ORDINAUX[c.ordre - 1] || c.ordre + 'e') + ' convocation',
          ech(c.nom) + ' — ' + (STATUT_CONVOCATION[c.statut] || [, c.statut])[1],
          'ouvrirConvocationActe(\'' + id + '\', \'mis_en_cause\', ' + c.ordre + ')');
      }).concat(pvExiste(d, 'mis_en_cause')
        ? [doc('Procès-verbal d\'audition du mis en cause', 'Comparution enregistrée',
               'ouvrirPVActe(\'' + id + '\', \'mis_en_cause\')')]
        : [])));

    /* Les comparutions vivent dans CONVOCATIONS, pas dans l'historique :
       on en fabrique la lecture, sans quoi l'acte se déplierait vide. */
    actes.push(acte('Constater la comparution ou l\'absence',
      convMEC ? absencesConstatees(id) + ' absence(s) déjà constatée(s).'
              : 'Après l\'émission de la convocation.',
      'changerOngletDossier(\'convocations\')', comparuMEC, !convMEC,
      convocationsDe(id)
        .filter(function (c) { return c.statut !== 'EN_ATTENTE'; })
        .map(function (c) {
          return { date: c.date, heure: c.heure,
                   libelle: (ORDINAUX[c.ordre - 1] || c.ordre + 'e') + ' convocation — ' +
                            (STATUT_CONVOCATION[c.statut] || [, c.statut])[1],
                   detail: ech(c.nom) };
        })));
  }

  if (cle === 'EN_INSTRUCTION') {
    /* Ces deux actes se cochent d'eux-mêmes : un message ou une note
       rattachés à l'étape valent exécution. Sans quoi une étape franchie
       depuis longtemps continuerait d'afficher « 2 à faire ». */
    actes.push(acte('Informer le plaignant de l\'avancement',
      'Un message dans son espace de suivi, avec pièce jointe si besoin.',
      'ouvrirEcrit(\'' + id + '\', \'message\')', aEtape('EN_INSTRUCTION', 'message'), false,
      traces(function (e) {
        return e.etape === 'EN_INSTRUCTION' && e.type === 'message';
      })));
    actes.push(acte('Consigner une observation interne',
      'Note visible du commissariat seul, jamais du plaignant.',
      'ouvrirEcrit(\'' + id + '\', \'note\')', aEtape('EN_INSTRUCTION', 'note'), false,
      traces(function (e) {
        return e.etape === 'EN_INSTRUCTION' &&
          (e.type === 'note' || e.type === 'statut' || e.type === 'convocation');
      })));
  }

  /* Etape terminale : les deux issues possibles, et rien d'autre. C'est le
     seul endroit d'où le dossier peut être clos — toutes les étapes qui
     précèdent ont alors été franchies. L'issue retenue se coche, de sorte
     qu'on lise sur un dossier achevé laquelle des deux a été prise. */
  if (cle === 'DECISION') {
    actes.push(acte('Transmettre au procureur',
      'Pour les dossiers relevant du parquet.',
      'transmettreProcureur(\'' + id + '\')', d.statut === 'TRANSMIS', false,
      traces(function (e) {
        return /procureur|parquet|transmis/i.test(e.libelle || '');
      })));
    /* La mise en délibération n'appartient à aucune des deux issues : elle
       les précède. Elle se range sous le classement, qui est l'issue par
       défaut d'un dossier que le parquet ne réclame pas. */
    actes.push(acte('Clôturer le dossier',
      'Classement. Le plaignant en est informé dans son espace de suivi.',
      'cloturerDossier(\'' + id + '\')', d.statut === 'CLOTURE', false,
      traces(function () { return true; })));
  }

  /* L'étape Clôture n'appelle aucun acte : elle constate. Lui donner sa
     ligne évite que ses évènements — notification, classement — se
     retrouvent rangés sous la décision, une étape plus haut. */
  if (cle === 'CLOTURE' && clos) {
    actes.push(acte(
      d.statut === 'TRANSMIS' ? 'Dossier transmis au procureur' : 'Dossier clôturé',
      'L\'instruction est achevée ; le plaignant en est informé.',
      '', true, false, traces(function () { return true; })));
  }

  /* Reliquat : ce qu'aucun acte n'a revendiqué rejoint le premier de
     l'étape, qui en est le pivot. */
  if (bassin.length && actes.length) {
    actes[0].traces = actes[0].traces.concat(bassin);
  }

  return actes;
}

/* Un dossier achevé ne se pilote plus : ses étapes restent consultables,
   mais aucun acte n'y est actionnable. Sans quoi un dossier clôturé
   proposait encore « Identifier la personne mise en cause », bouton
   compris, sur une étape franchie des semaines plus tôt. */
function dossierVerrouille(d) {
  return d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
}

function acte(libelle, aide, action, fait, bloque, traces, docs) {
  return {
    libelle: libelle, aide: aide, action: action,
    fait: !!fait,
    /* Un acte accompli ne peut plus être bloqué : le prérequis a
       forcément été rempli pour qu'il le soit. */
    bloque: !fait && !!bloque,
    traces: traces || [],
    /* Documents produits par l'acte : ils s'ouvrent depuis son dépliant,
       sans passer par l'onglet Plainte. */
    docs: docs || []
  };
}

/* Une pièce consultable depuis un acte. */
function doc(libelle, precision, action) {
  return { libelle: libelle, precision: precision || '', action: action };
}

/* ── Ouverture des documents depuis un acte ──────────────────
   Le procès-verbal, la plainte et l'attestation ne se lisaient que dans
   l'onglet Plainte : il fallait quitter la progression pour vérifier ce
   qu'un acte avait produit, puis y revenir. Ils s'ouvrent maintenant là
   où l'acte les mentionne, dans la même visionneuse — celle qui porte
   « Télécharger / Imprimer ».
   ─────────────────────────────────────────────────────────── */
function ouvrirPVActe(id, audition) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;
  var qui = audition === 'mis_en_cause' ? 'de la personne mise en cause' : 'du plaignant';
  afficherDocument('Procès-verbal d\'audition ' + qui + ' — ' + id,
                   htmlPV(id, audition));
}

function ouvrirConvocationActe(id, destinataire, ordre) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;

  if (destinataire === 'plaignant') {
    /* La convocation du plaignant ne figure pas dans CONVOCATIONS, qui ne
       numérote que celles du mis en cause : on la reconstitue à partir de
       l'évènement qui l'a consignée. */
    var e = ((typeof HISTORIQUE !== 'undefined' && HISTORIQUE[id]) || [])
      .filter(function (x) {
        return x.type === 'convocation' && /plaignant|votre audition/i.test(x.libelle || '');
      })[0];
    if (!e) return;
    var quand = /au (\d{2}\/\d{2}\/\d{4}) à (\d+h\d+)/.exec(e.detail || '');
    lireConvocation(d, {
      nom: d.plaignant,
      date: quand ? quand[1] : e.date,
      heure: quand ? quand[2] : e.heure,
      emise: e.date,
      ordre: 1,
      motif: 'Audition dans le cadre de l\'instruction de votre plainte.'
    }, 'plaignant');
    return;
  }

  var liste = convocationsDe(id);
  var conv = liste.filter(function (c) { return c.ordre === ordre; })[0] || liste[liste.length - 1];
  if (conv) lireConvocation(d, conv, 'mis_en_cause');
}

/* Une chaîne destinée à un argument de fonction dans un attribut onclick :
   sans échappement, « Enregistrer l'audition » ferme le littéral JS sur
   son apostrophe et le bouton ne fait plus rien. */
function argJS(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

/* Écrits rattachés à un acte précis, dans l'ordre où ils ont été posés. */
function commentairesDeLActe(id, libelle) {
  return ((typeof HISTORIQUE !== 'undefined' && HISTORIQUE[id]) || [])
    .filter(function (e) { return e.apropos === libelle; })
    .sort(function (a, b) { return horodatageEvt(a) - horodatageEvt(b); });
}

/* Tous les actes de l'étape sont rendus, quel que soit leur état : celui
   qui est fait porte sa coche, celui qui attend un prérequis le dit, et
   tous acceptent un commentaire — c'est souvent sur un acte bloqué ou
   déjà accompli qu'on a le plus à écrire. Seul « Faire » est conditionnel.
   Les commentaires s'affichent sous l'acte qu'ils concernent, sans quoi
   il faudrait déplier le détail pour savoir qu'ils existent. */
function rendreActe(a, id, verrou) {
  var classe = a.fait ? ' fait' : (a.bloque ? ' bloque' : '');
  var notes = commentairesDeLActe(id, a.libelle);
  var detail = a.traces.slice().sort(function (x, y) {
    return horodatageEvt(x) - horodatageEvt(y);
  });

  /* Les boutons vivent dans le <summary> : sans stopPropagation, cliquer
     « Faire » replierait l'acte au passage. */
  var boutons =
    '<span class="acte-cmd">' +
      '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();ouvrirEcrit(\'' +
        id + '\', \'note\', \'' + argJS(a.libelle) + '\')">Commenter</button>' +
      (a.fait || a.bloque || verrou
        ? (a.bloque ? '<span class="acte-attente">En attente</span>' : '')
        : '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();' +
            a.action + '">Faire</button>') +
    '</span>';

  var ligne =
    (a.fait
      ? '<span class="acte-etat">' + coche() + '</span>'
      : '<span class="acte-etat vide"></span>') +
    '<span class="acte-txt">' +
      '<strong>' + a.libelle + '</strong>' +
      '<span>' + a.aide + '</span>' +
    '</span>' +
    boutons;

  /* Rien à montrer : pas de chevron ni de dépliant, qui s'ouvriraient sur
     du vide. */
  if (!detail.length && !notes.length && !a.docs.length) {
    return '<li class="acte' + classe + '"><div class="acte-ligne">' + ligne + '</div></li>';
  }

  return '<li class="acte' + classe + '">' +
    '<details class="acte-bloc">' +
      '<summary class="acte-ligne">' + ligne +
        (a.docs.length
          ? '<span class="acte-docs-n" title="Documents consultables">' +
              a.docs.length + '</span>'
          : '') +
        '<span class="etape-chevron" aria-hidden="true"></span>' +
      '</summary>' +
      '<div class="acte-detail">' +
        (a.docs.length
          ? '<div class="doc-liste">' + a.docs.map(rendreDocActe).join('') + '</div>'
          : '') +
        (detail.length
          ? '<ul class="acte-traces">' + detail.map(rendreTrace).join('') + '</ul>'
          : '') +
        (notes.length
          ? '<ul class="acte-notes">' + notes.map(rendreCommentaire).join('') + '</ul>'
          : '') +
      '</div>' +
    '</details>' +
  '</li>';
}

function rendreDocActe(x) {
  return '<button type="button" class="doc-item" onclick="' + x.action + '">' +
    '<span class="doc-item-txt">' +
      '<span class="doc-item-nom">' + x.libelle + '</span>' +
      (x.precision ? '<span class="doc-item-sous">' + x.precision + '</span>' : '') +
    '</span>' +
    '<span class="doc-item-act">Ouvrir</span>' +
  '</button>';
}

/* Un évènement rattaché à un acte : soit un écrit, soit un fait daté.
   Certaines notes du dossier portent un libellé et un détail plutôt qu'un
   texte signé — les traiter comme des écrits affichait un corps vide. */
function rendreTrace(e) {
  if ((e.type === 'message' || e.type === 'note') && e.texte) return rendreCommentaire(e);
  return '<li class="acte-trace">' +
    '<span>' + ech(e.libelle || '') +
      (e.detail ? '<em>' + ech(e.detail) + '</em>' : '') + '</span>' +
    '<time>' + ech(e.date || '') + (e.heure ? ' à ' + ech(e.heure) : '') + '</time>' +
  '</li>';
}

function rendreCommentaire(e) {
  var interne = (e.type === 'note');
  return '<li class="acte-note' + (interne ? ' interne' : '') + '">' +
    '<div class="acte-note-tete">' +
      '<span class="badge ' + (interne ? 'badge-gray' : 'badge-gold') + '">' +
        (interne ? 'Note interne' : 'Message au plaignant') + '</span>' +
      '<span>' + ech(e.auteur || '') + ' — ' + ech(e.date) +
        (e.heure ? ' à ' + ech(e.heure) : '') + '</span>' +
    '</div>' +
    '<p>' + ech(e.texte) + '</p>' +
    piecesHtml(e.pieces) +
  '</li>';
}

/* Coche nue : le cercle vient du CSS, aussi bien pour la pastille de la
   frise que pour la puce d'un acte accompli. */
function coche() {
  return '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2.5 6.25 4.75 8.5 9.5 3.5"/></svg>';
}

function etiquetteEtape(statut) {
  var e = (typeof ETAPES !== 'undefined') &&
    ETAPES.find(function (x) { return x.cle === statut; });
  return e ? e.libelle : statut;
}

/* Fixer la date d'audition : un petit formulaire s'ouvre sous la liste. */
function programmerAudition(id, cle) {
  var zone = document.getElementById('acte-form-' + (cle || 'RECU'));
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!zone || !d) return;
  zone.innerHTML =
    '<div class="acte-form">' +
      '<div class="form-row-3">' +
        '<div class="form-group" style="margin:0">' +
          '<label class="form-label" for="aud-date">Date d\'audition</label>' +
          '<input class="form-control" type="date" id="aud-date">' +
        '</div>' +
        '<div class="form-group" style="margin:0">' +
          '<label class="form-label" for="aud-heure">Heure</label>' +
          '<input class="form-control" type="time" id="aud-heure" value="09:00">' +
        '</div>' +
        '<div class="form-group" style="margin:0">' +
          '<label class="form-label" for="aud-canal">Envoi</label>' +
          '<select class="form-control" id="aud-canal">' +
            (d.contact && d.contact.email ? '<option value="email">E-mail</option>' : '') +
            (d.contact && d.contact.telephone ? '<option value="sms">SMS</option>' : '') +
            '<option value="remise">Main propre</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="field-error" id="err-aud-date"></div>' +
      '<button class="btn btn-primary btn-sm" onclick="confirmerAudition(\'' + id + '\')">Envoyer la convocation</button>' +
    '</div>';
  var champ = document.getElementById('aud-date');
  if (champ) champ.focus();
}

function confirmerAudition(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  var date = (document.getElementById('aud-date') || {}).value || '';
  var heure = (document.getElementById('aud-heure') || {}).value || '09:00';
  var canal = (document.getElementById('aud-canal') || {}).value || 'remise';
  var err = document.getElementById('err-aud-date');

  if (!date) { if (err) err.textContent = 'Indiquez la date d\'audition.'; return; }
  if (!d) return;

  var p = date.split('-');
  var jour = p[2] + '/' + p[1] + '/' + p[0];
  var hh = heure.replace(':', 'h');
  var lib = canal === 'email' ? 'par e-mail à ' + d.contact.email
          : canal === 'sms'   ? 'par SMS au ' + d.contact.telephone
          : 'remise en main propre';

  HISTORIQUE[id].push({
    etape: 'AUDITION', type: 'convocation',
    date: jour, heure: hh,
    libelle: 'Convocation du plaignant',
    detail: 'Audition fixée au ' + jour + ' à ' + hh + ' — ' + lib
  });

  if (d.statut === 'RECU') {
    d.statut = 'AUDITION';
    ajouterEvenementStatut(id, 'Audition programmée', 'Convocation du plaignant émise');
  }

  toast('Convocation envoyée ' + lib, 'success');
  renderMesDossiers();
  majKPI();
  rendreDossier();
}

/* Consigner qu'une audition s'est tenue : c'est ce qui rend le PV
   etablissable. Rien ne le permettait jusqu'ici.

   La deposition se dicte : le compte rendu decrit une audition prise a la
   main puis ressaisie, double travail qui eloigne le proces-verbal des
   mots du comparant. Ce qui est transcrit devient le corps du PV, sans
   ressaisie. La dictee n'etant pas offerte par tous les navigateurs, la
   frappe au clavier reste possible et le bouton dit pourquoi le cas
   echeant, plutot que d'echouer en silence. */
var sonAudition = null;   /* enregistrement capte pendant la deposition */

function enregistrerAudition(id, cle) {
  var zone = document.getElementById('acte-form-' + (cle || 'AUDITION'));
  if (!zone) return;
  sonAudition = null;

  var dictable = (typeof Dictee !== 'undefined') && Dictee.transcriptionPossible();
  /* Module absent : la saisie reste possible, mais l'agent doit savoir
     pourquoi le micro n'est pas proposé plutôt que face à un champ nu. */
  var raison = (typeof Dictee !== 'undefined')
    ? Dictee.empechement()
    : 'Dictée indisponible : saisissez la déposition au clavier.';

  zone.innerHTML =
    '<div class="acte-form">' +
      '<div class="form-row">' +
        '<div class="form-group" style="margin:0">' +
          '<label class="form-label" for="tenue-date">Date de l\'audition tenue</label>' +
          '<input class="form-control" type="date" id="tenue-date">' +
        '</div>' +
        '<div class="form-group" style="margin:0">' +
          '<label class="form-label" for="tenue-heure">Heure</label>' +
          '<input class="form-control" type="time" id="tenue-heure" value="09:00">' +
        '</div>' +
      '</div>' +
      '<div class="field-error" id="err-tenue-date"></div>' +

      '<div class="dictee">' +
        '<div class="dictee-tete">' +
          '<label class="form-label" for="tenue-texte" style="margin:0">Déposition recueillie</label>' +
          (dictable
            ? '<button type="button" class="btn btn-ghost btn-sm" id="dictee-bouton" ' +
                'onclick="basculerDictee()">' + iconeMicro() + 'Dicter</button>'
            : '') +
        '</div>' +
        '<textarea class="form-control" id="tenue-texte" rows="5" ' +
          'placeholder="Dictez ou saisissez les déclarations du comparant, à la première personne."></textarea>' +
        '<div class="dictee-etat" id="dictee-etat">' +
          (dictable
            ? 'La transcription alimente le procès-verbal ; elle reste modifiable.'
            : ech(raison)) +
        '</div>' +
      '</div>' +

      '<button class="btn btn-primary btn-sm" onclick="confirmerAuditionTenue(\'' + id + '\')">' +
        'Enregistrer l\'audition</button>' +
    '</div>';

  var champ = document.getElementById('tenue-date');
  if (champ) champ.focus();
}

function iconeMicro() {
  return '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round" aria-hidden="true" style="margin-right:5px">' +
    '<rect x="5.75" y="1.75" width="4.5" height="8" rx="2.25"/>' +
    '<path d="M3.25 7.25v.75a4.75 4.75 0 0 0 9.5 0v-.75M8 12.75v1.5"/></svg>';
}

/* Un seul bouton pour les deux sens : deux boutons dont un seul sert a la
   fois laissent toujours l'agent devant le mauvais. */
function basculerDictee() {
  if (typeof Dictee === 'undefined') return;
  if (Dictee.enCours()) { arreterDictee(); return; }

  var champ = document.getElementById('tenue-texte');
  var etat = document.getElementById('dictee-etat');
  var bouton = document.getElementById('dictee-bouton');
  if (!champ) return;

  /* Ce qui est deja saisi n'est pas efface : on dicte a la suite. */
  var socle = champ.value ? champ.value.replace(/\s*$/, ' ') : '';

  var lance = Dictee.demarrer({
    surTexte: function (acquis, encours) {
      if (acquis) socle += acquis;
      champ.value = socle + encours;
      champ.scrollTop = champ.scrollHeight;
    },
    surErreur: function (m) {
      if (etat) { etat.textContent = m; etat.className = 'dictee-etat erreur'; }
    },
    surFin: function () { majBoutonDictee(false); }
  });

  if (!lance) return;
  majBoutonDictee(true);
  if (etat) {
    etat.textContent = 'Dictée en cours — parlez normalement.';
    etat.className = 'dictee-etat actif';
  }
  if (bouton) bouton.classList.add('enregistre');

  /* Le son est un complement : son refus n'interrompt pas la dictee. */
  if (Dictee.captureSonPossible()) {
    Dictee.capturerSon().catch(function () { sonAudition = null; });
  }
}

function arreterDictee() {
  if (typeof Dictee === 'undefined') return;
  Dictee.arreter();
  majBoutonDictee(false);

  var etat = document.getElementById('dictee-etat');
  if (etat) {
    etat.textContent = 'Dictée arrêtée. Relisez et corrigez avant d\'enregistrer.';
    etat.className = 'dictee-etat';
  }

  if (Dictee.captureSonPossible()) {
    Dictee.arreterCapture().then(function (son) { sonAudition = son; });
  }
}

function majBoutonDictee(enCours) {
  var b = document.getElementById('dictee-bouton');
  if (!b) return;
  b.innerHTML = iconeMicro() + (enCours ? 'Arrêter' : 'Dicter');
  b.classList.toggle('enregistre', !!enCours);
}

function confirmerAuditionTenue(id) {
  var date = (document.getElementById('tenue-date') || {}).value || '';
  var heure = (document.getElementById('tenue-heure') || {}).value || '09:00';
  var texte = ((document.getElementById('tenue-texte') || {}).value || '').trim();
  var err = document.getElementById('err-tenue-date');
  if (!date) { if (err) err.textContent = 'Indiquez la date de l\'audition.'; return; }

  /* Une dictee laissee ouverte continuerait a ecouter apres coup. */
  if (typeof Dictee !== 'undefined' && Dictee.enCours()) Dictee.arreter();

  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  var p = date.split('-');
  var pieces = sonAudition
    ? [{ nom: 'audition-' + id + '.webm',
         taille: tailleFichier(sonAudition.octets),
         url: sonAudition.url }]
    : [];

  HISTORIQUE[id].push({
    etape: 'AUDITION', type: 'audition',
    date: p[2] + '/' + p[1] + '/' + p[0], heure: heure.replace(':', 'h'),
    libelle: 'Votre audition',
    detail: texte
      ? 'Déclarations recueillies — procès-verbal établi à partir de la déposition'
      : 'Déclarations recueillies — procès-verbal en cours de relecture',
    pieces: pieces
  });

  /* Le proces-verbal se remplit de la deposition : c'est ce qui a ete dit
     a l'audition qui doit y figurer, non le texte du formulaire en ligne.
     La substitution passe par corrigerPV, donc elle est horodatee et
     signee comme toute autre reecriture. */
  var etabli = false;
  if (texte && d) {
    etabli = corrigerPV(id, 'plaignant', '« ' + texte + ' »',
                        ENQUETEUR_COURANT, declarationOriginale(d, 'plaignant'));
  }

  sonAudition = null;
  toast(etabli
    ? 'Audition enregistrée — procès-verbal établi à partir de la déposition'
    : 'Audition enregistrée — le procès-verbal peut être établi', 'success');
  majKPI();
  rendreDossier();
}

/* Raccourcis vers l'endroit ou l'acte se realise. */
function allerAuPV() {
  docAffiche = 'pv';
  pvAudition = 'plaignant';
  changerOngletDossier('plainte');
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

/* Étapier du dossier : les cinq étapes, chacune portant ce qu'elle
   demande. On ouvre celle qu'on veut revoir ; celle en cours est dépliée
   d'office. */
function friseEtapes(d) {
  if (typeof ETAPES === 'undefined' || typeof ORDRE_ETAPES === 'undefined') return '';
  var rang = ORDRE_ETAPES.indexOf(d.statut);
  var clos = d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
  var verrou = dossierVerrouille(d);
  return '<ol class="etapier">' + ETAPES.map(function (et, i) {
    var r = ORDRE_ETAPES.indexOf(et.cle);
    var etat = (clos || r < rang) ? 'faite' : (r === rang ? 'courante' : 'avenir');
    var tete = '<span class="etape-pt">' + (etat === 'faite' ? coche() : (i + 1)) + '</span>' +
               '<span class="etape-lib">' + et.libelle + '</span>';

    /* Une étape à venir ne s'ouvre pas : ses actes n'ont pas lieu d'être
       avant son tour, et un bouton « Clôturer » offert dès la réception
       de la plainte contredirait la règle qu'on vient de poser. */
    if (etat === 'avenir') {
      return '<li class="etape avenir"><div class="etape-tete">' + tete + '</div></li>';
    }

    /* Les actes sont la seule lecture de l'étape : tous y figurent, avec
       leur état, et chacun se déplie sur ce qui le concerne — les faits
       qui l'attestent et les commentaires qu'on y a laissés. Un journal
       commun en bas d'étape mélangeait tout et obligeait à chercher. */
    var tous = actesDeLEtape(d, et.cle);
    var restants = tous.filter(function (a) { return !a.fait; });

    var jauge = (!tous.length || verrou) ? ''
      : '<span class="etape-jauge' + (restants.length ? '' : ' fini') + '">' +
          (restants.length ? restants.length + ' à faire' : 'Tout est fait') + '</span>';

    var corps = tous.length
      ? '<ul class="actes">' + tous.map(function (a) {
          return rendreActe(a, d.id, verrou);
        }).join('') + '</ul>'
      : '<p class="fil-vide">Rien n\'a encore été consigné à cette étape.</p>';

    return '<li class="etape ' + etat + '">' +
      '<details class="etape-bloc"' + (etat === 'courante' ? ' open' : '') + '>' +
        '<summary class="etape-tete">' + tete + jauge +
          '<span class="etape-chevron" aria-hidden="true"></span>' +
        '</summary>' +
        '<div class="etape-panneau">' +
          corps +
          '<div class="acte-slot" id="acte-form-' + et.cle + '"></div>' +
          (etat === 'courante' ? blocEtapeSuivante(d) : '') +
        '</div>' +
      '</details>' +
    '</li>';
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
/* Passage à l'étape suivante. Deux cas ne l'affichent pas : le dossier
   terminé, et l'étape Décision — là, l'issue n'est pas un « suivant »
   mécanique mais un choix entre transmission et classement, déjà proposé
   dans la liste des actes. */
function blocEtapeSuivante(d) {
  var suite = LIBELLE_ETAPE_SUIVANTE[d.statut];
  if (!suite || suite.vers === 'CLOTURE') return '';

  var l = (typeof STATUT_LABELS !== 'undefined' && STATUT_LABELS[suite.vers])
    ? STATUT_LABELS[suite.vers][1] : suite.vers;
  return '<div class="etape-suite">' +
    '<span>Étape suivante<strong>' + ech(l) + '</strong></span>' +
    '<button class="btn btn-outline btn-sm" onclick="avancerStatut(\'' + d.id + '\')">' +
      'Passer à l\'étape suivante</button>' +
  '</div>';
}

/* ── Écrits et pièces rattachés à un acte ────────────────── */

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
var dossierAEcrire = null;
var acteCommente = null;

/* `nature` permet aux actes de l'étape Enquête d'ouvrir la fenêtre sur le
   bon type : « consigner une observation interne » ne doit pas atterrir
   sur un message au plaignant. `aPropos` rattache l'écrit à un acte
   précis, pour qu'on sache plus tard de quoi il parlait. */
function ouvrirEcrit(id, nature, aPropos) {
  dossierAEcrire = id;
  acteCommente = aPropos || null;
  var type = nature === 'note' ? 'note' : 'message';

  var titre = document.getElementById('ecrit-titre');
  if (titre) titre.textContent = aPropos ? 'Commenter un acte' : 'Écrire au dossier ' + id;

  var zone = document.getElementById('ecrit-apropos');
  if (zone) {
    zone.innerHTML = aPropos
      ? '<div class="ecrit-apropos"><span>À propos de</span><strong>' +
          ech(aPropos) + '</strong></div>'
      : '';
  }

  var radio = document.querySelector('input[name="ecrit-type"][value="' + type + '"]');
  if (radio) radio.checked = true;

  var champ = document.getElementById('ecrit-texte');
  if (champ) champ.value = '';
  var fichiers = document.getElementById('ecrit-pieces');
  if (fichiers) fichiers.value = '';
  var err = document.getElementById('err-ecrit-texte');
  if (err) err.textContent = '';

  majPorteeEcrit();
  openModal('modal-ecrit');
  if (champ) champ.focus();
}

/* Qui lira ce texte : la réponse change avec le type, elle doit donc se
   mettre à jour, et non rester figée sur le cas du message. */
function majPorteeEcrit() {
  var zone = document.getElementById('ecrit-portee');
  if (!zone) return;
  var choisi = document.querySelector('input[name="ecrit-type"]:checked');
  var note = choisi && choisi.value === 'note';

  zone.className = 'alert ' + (note ? 'alert-warning' : 'alert-info');
  zone.style.marginBottom = '18px';
  zone.innerHTML = '<div>' + (note
    ? 'Cette note reste interne au commissariat : le plaignant ne la verra pas.'
    : 'Ce texte sera visible par le plaignant dans son espace de suivi.') + '</div>';
}

function enregistrerEcrit() {
  if (dossierAEcrire) ajouterEcrit(dossierAEcrire);
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
    pieces: pieces,
    apropos: acteCommente || null
  });

  champ.value = '';
  if (champFichiers) champFichiers.value = '';
  acteCommente = null;
  closeModal('modal-ecrit');
  /* Le fil est desormais reparti dans les etapes : on redessine l'etapier
     plutot que de viser un conteneur unique qui n'existe plus. */
  rendreDossier();

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
  if (!d) return;

  /* On ne clot pas un dossier dont l'instruction n'est pas allee a son
     terme : audition, enquete et deliberation doivent avoir eu lieu. */
  if (ORDRE_ETAPES.indexOf(d.statut) < ORDRE_ETAPES.indexOf('DECISION')) {
    var reste = ETAPES
      .filter(function (e) {
        return ORDRE_ETAPES.indexOf(e.cle) > ORDRE_ETAPES.indexOf(d.statut) &&
               e.cle !== 'CLOTURE';
      })
      .map(function (e) { return e.libelle.toLowerCase(); });
    toast('Clôture impossible : il reste ' + reste.join(', ') + ' à mener', 'error');
    return;
  }

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
  if (audition === 'plaignant' && !pvExiste(d, 'plaignant')) {
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
      '<p>L\'an deux mille vingt-six, le <strong>' + dateEnClair(d.date) + '</strong>,</p>' +
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

  /* L'evenement se rattache a l'etape ou etait le dossier — la decision —
     et le statut ne change qu'apres. Fixer TRANSMIS d'abord datait
     l'evenement d'une etape que la frise n'affiche pas : il devenait
     introuvable. La cloture procedait deja dans le bon ordre. */
  var motif = (typeof absencesConstatees === 'function' && absencesConstatees(id) >= 3)
    ? 'Trois absences injustifiées du mis en cause'
    : 'Les faits relèvent de la compétence du parquet';
  ajouterEvenementStatut(id, 'Dossier transmis au procureur', motif);
  d.statut = 'TRANSMIS';

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
