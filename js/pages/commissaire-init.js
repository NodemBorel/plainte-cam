/* ============================================================
   Espace Commissaire — fonctions page et initialisation
   ============================================================ */

function navAgent(el, page) {
  document.querySelectorAll('.sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  /* Les liens de la barre supérieure appellent aussi navAgent, sans
     élément à activer : el peut être nul. */
  if (el && el.classList) el.classList.add('active');
  else {
    var item = document.querySelector('.sidebar-item[data-page="' + page + '"]');
    if (item) item.classList.add('active');
  }
  showPage(page);
  if (page === 'page-dashboard') rafraichirTableauDeBord();
  if (page === 'page-dossiers')  initDashboard();
  if (page === 'page-stats')     majStatistiques();
  if (page === 'page-audit')     { remplirFiltreAuteurs(); bornerChampsDate(); rendreAudit(); }
  if (page === 'page-agents')    rendreAgents();
}

/* Une affectation change les quatre indicateurs, la liste d'attente, la
   charge des enquêteurs et la répartition par statut : on redessine
   l'ensemble plutôt que de tenir à jour chaque morceau séparément. */
function rafraichirTableauDeBord() {
  majKPICommissaire();
  majAffectations();
  majChargeEnqueteurs();
  /* Les charges annoncées dans le filtre bougent avec les affectations. */
  remplirFiltreEnqueteurs();
  majGraphiques();
  majCompteurSidebar();
  drawMiniChart();
}

/* Le badge de la barre latérale annonçait « 2 » en toutes circonstances. */
function majCompteurSidebar() {
  var el = document.getElementById('badge-dossiers');
  if (!el || typeof DOSSIERS === 'undefined') return;
  el.textContent = DOSSIERS.length;
}

var dossierAAffecter = null;
var enqueteurPourAffectation = null;

function affecterDossier(id) {
  dossierAAffecter = id;
  var d = dossierParId(id);
  document.querySelector('#modal-affectation .card-title').textContent = 'Affecter le dossier ' + id;

  /* La suggestion s'appuie sur le score de complétude et la nature des
     faits : c'est ici, chez le commissaire, que ce score sert. */
  var sug = document.getElementById('affectation-suggestion');
  if (sug && d) {
    sug.innerHTML = '<div class="alert alert-info" style="margin-bottom:18px"><div>' +
      '<strong>' + d.type + '</strong> — score de complétude ' + d.score + ' %.<br>' +
      'Enquêteur suggéré selon la spécialité : <strong>' +
      (/escroquerie|fraude/i.test(d.type) ? 'Insp. KANA' : 'Insp. BIYA') + '</strong>.' +
      '</div></div>';
  }

  /* Priorité pré-positionnée sur celle du dossier, modifiable. */
  var sel = document.getElementById('affect-priorite');
  if (sel && d) sel.value = d.priorite || 'NORMALE';

  /* La liste était remplie une fois pour toutes au chargement : les
     charges annoncées dataient de l'ouverture de la page, et un agent
     recruté depuis n'y figurait pas. */
  enqueteurPourAffectation = null;
  remplirListeEnqueteurs();
  majBoutonAffectation();
  var err = document.getElementById('err-affectation');
  if (err) err.textContent = '';

  openModal('modal-affectation');
}

/* Exécution : l'enquêteur retenu vient de la sélection — c'est la
   confirmation qui déclenche, plus le clic sur un nom. */
function confirmAffectation() {
  var d = dossierParId(dossierAAffecter);
  var enqueteur = enqueteurPourAffectation;
  if (!d || !enqueteur) return;
  var sel = document.getElementById('affect-priorite');
  var priorite = sel ? sel.value : 'NORMALE';

  if (d) {
    d.enqueteur = enqueteur;
    d.priorite = priorite;
    /* Le dossier reste a l'etape Reçu : affecter n'est pas convoquer.
       C'est l'enqueteur qui le fera passer a l'audition en fixant la date,
       depuis l'onglet Progression de son dossier. */

    /* L'affectation et la priorité retenue rejoignent l'historique : le
       plaignant voit que son dossier a été confié à quelqu'un. */
    if (typeof HISTORIQUE !== 'undefined') {
      if (!HISTORIQUE[d.id]) HISTORIQUE[d.id] = [];
      var m = new Date(), dd = function (n) { return String(n).padStart(2, '0'); };
      HISTORIQUE[d.id].push({
        etape: 'RECU', type: 'affectation',
        date: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
        heure: dd(m.getHours()) + 'h' + dd(m.getMinutes()),
        libelle: 'Dossier affecté',
        detail: enqueteur + ' désigné — priorité ' + priorite.toLowerCase()
      });
    }
  }

  closeModal('modal-affectation-confirmation');
  closeModal('modal-affectation');
  enqueteurPourAffectation = null;
  toast('Dossier ' + d.id + ' affecté à ' + enqueteur +
        ' (priorité ' + priorite.toLowerCase() + ')', 'success');
  initDashboard();
  rafraichirTableauDeBord();
}

/* Le sélecteur d'enquêteur du tableau proposait « Insp. NGUEMO » — le
   commissaire — et n'avait de toute façon aucun gestionnaire. Il se
   remplit depuis le registre des agents, avec le nombre de dossiers de chacun, et
   une entrée pour les plaintes que personne n'instruit encore. */
function remplirFiltreEnqueteurs() {
  var sel = document.getElementById('filtre-enqueteur');
  if (!sel) return;
  var garde = sel.value;
  var sans = (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.filter(function (d) { return !d.enqueteur; }).length : 0;

  sel.innerHTML =
    '<option value="">Tous les enquêteurs</option>' +
    enqueteursActifs().map(function (e) {
      return '<option value="' + ech(e.nom) + '">' + ech(e.nom) +
        ' (' + chargeDe(e.nom) + ')</option>';
    }).join('') +
    '<option value="__aucun">Non affectés (' + sans + ')</option>';
  sel.value = garde;
}

/* ============================================================
   TABLEAU DE BORD

   Les quatre indicateurs, la liste des plaintes à affecter, la charge des
   enquêteurs et les statistiques étaient écrits dans le HTML : « 24
   dossiers actifs » pour un commissariat qui en comptait sept, une plainte
   « à affecter » qui l'était depuis le premier jour, et NGUEMO — le
   commissaire — compté parmi ses propres enquêteurs. Tout se calcule.
   ============================================================ */


function nonAffectes() {
  if (typeof DOSSIERS === 'undefined') return [];
  return DOSSIERS.filter(function (d) { return !d.enqueteur; })
    .slice()
    .sort(function (a, b) { return horodatage(b) - horodatage(a); });
}

function majKPICommissaire() {
  var zone = document.getElementById('kpi-commissaire');
  if (!zone || typeof DOSSIERS === 'undefined') return;

  /* La vue d'ensemble dit ce qu'il y a à traiter aujourd'hui. Le nombre
     de dossiers achevés y figurait : c'est un chiffre de bilan, il est à
     sa place dans les statistiques et faisait double emploi. On lui
     substitue les comparutions attendues, qui appellent une action. */
  var attente   = nonAffectes().length;
  var instruits = DOSSIERS.filter(function (d) { return d.statut === 'EN_INSTRUCTION'; }).length;
  var actifs    = DOSSIERS.filter(function (d) {
    return d.statut !== 'CLOTURE' && d.statut !== 'TRANSMIS';
  }).length;
  var comparutions = DOSSIERS.reduce(function (n, d) {
    return n + convocationsDe(d.id).filter(function (c) {
      return c.statut === 'EN_ATTENTE';
    }).length;
  }, 0);

  var cases = [
    ['urgent',   attente,      'En attente d\'affectation'],
    ['en-cours', instruits,    'En enquête'],
    ['ok',       comparutions, 'Comparutions attendues'],
    ['total',    actifs,       'Dossiers actifs']
  ];
  zone.innerHTML = cases.map(function (c) {
    return '<div class="kpi ' + c[0] + '">' +
      '<div class="num">' + c[1] + '</div>' +
      '<div class="lbl">' + c[2] + '</div>' +
    '</div>';
  }).join('');
}

function majAffectations() {
  var corps = document.getElementById('a-affecter');
  var compteur = document.getElementById('attente-compteur');
  if (!corps) return;

  var liste = nonAffectes();
  if (compteur) {
    compteur.textContent = liste.length
      ? liste.length + (liste.length > 1 ? ' en attente' : ' en attente')
      : 'aucune';
    compteur.className = 'badge ' + (liste.length ? 'badge-red' : 'badge-green');
  }

  if (!liste.length) {
    corps.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:22px">' +
      'Toutes les plaintes reçues ont été affectées.</td></tr>';
    return;
  }

  /* La complétude servait de colonne ici : elle relève de la cotation,
     que le commissaire arbitre au moment d'affecter — elle figure dans la
     fenêtre d'affectation. Ce qu'on veut voir dans une file d'attente,
     c'est depuis quand une plainte attend. */
  corps.innerHTML = liste.map(function (d) {
    var badge = d.priorite === 'URGENTE' ? 'badge-red'
              : d.priorite === 'HAUTE'   ? 'badge-orange' : 'badge-blue';
    return '<tr>' +
      '<td><strong>' + ech(d.id) + '</strong></td>' +
      '<td>' + ech(d.plaignant) + '</td>' +
      '<td><span class="badge ' + badge + '">' + ech(d.type) + '</span></td>' +
      '<td style="white-space:nowrap">' + ech(d.date) +
        '<br><span class="text-muted">' + ech(attenteDepuis(d)) + '</span></td>' +
      '<td><button class="btn btn-primary btn-sm" onclick="affecterDossier(\'' + d.id + '\')">' +
        'Affecter</button></td>' +
    '</tr>';
  }).join('');
}

/* Depuis combien de temps une plainte attend. Le repère est le dépôt le
   plus récent du commissariat, non la date du jour : le jeu de données
   est daté, et « il y a 47 jours » ne dirait rien d'utile. */
function attenteDepuis(d) {
  if (typeof DOSSIERS === 'undefined') return '';
  var t = DOSSIERS.map(horodatage).filter(function (x) { return !isNaN(x); });
  if (!t.length) return '';
  var jours = Math.round((Math.max.apply(null, t) - horodatage(d)) / 86400000);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return 'depuis 1 jour';
  return 'depuis ' + jours + ' jours';
}

function majChargeEnqueteurs() {
  var zone = document.getElementById('charge-enqueteurs');
  if (!zone) return;
  zone.innerHTML = enqueteursActifs().map(function (e, i) {
    var n = chargeDe(e.nom);
    var couleur = n >= 5 ? 'badge-red' : n >= 3 ? 'badge-orange' : 'badge-green';
    var bord = i < enqueteursActifs().length - 1 ? ';border-bottom:1px solid var(--gray-2)' : '';
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0' + bord + '">' +
      '<div><strong>' + ech(e.nom) + '</strong><br>' +
        '<span class="text-muted">' + ech(e.specialite) + '</span></div>' +
      '<span class="badge ' + couleur + '">' + n + ' dossier' + (n > 1 ? 's' : '') + '</span>' +
    '</div>';
  }).join('');
}

/* Statistiques : les mêmes dossiers, vus autrement. */
function majStatistiques() {
  var cartes = document.getElementById('stats-cartes');
  var periode = document.getElementById('stats-periode');
  majChargeDetaillee();
  majGraphiques();
  if (!cartes || typeof DOSSIERS === 'undefined') return;

  var recues = DOSSIERS.length;
  var clos = DOSSIERS.filter(function (d) {
    return d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
  });
  var score = Math.round(DOSSIERS.reduce(function (s, d) { return s + (d.score || 0); }, 0) / (recues || 1));

  /* Délai réel : du dépôt au dernier évènement, sur les dossiers achevés.
     Aucun dossier clos ne permettrait de le calculer — on le dit alors. */
  var delais = clos.map(delaiDossier).filter(function (x) { return x !== null; });

  var moyen = delais.length
    ? (delais.reduce(function (a, b) { return a + b; }, 0) / delais.length)
    : null;

  if (periode) {
    periode.textContent = 'Commissariat Cité Verte, Yaoundé — ' + recues +
      ' dossier' + (recues > 1 ? 's' : '') + ' enregistré' + (recues > 1 ? 's' : '');
  }

  var stats = [
    { classe: '',       style: '',                                  n: recues,      lbl: 'Plaintes enregistrées' },
    { classe: 'green',  style: '',                                  n: clos.length, lbl: 'Dossiers achevés' },
    { classe: 'orange', style: '',
      n: moyen === null ? '—' : moyen.toFixed(1).replace('.', ',') + ' j',
      lbl: 'Délai moyen de traitement' },
    { classe: '',       style: 'border-left-color:var(--gold)',     n: score + ' %', lbl: 'Score de complétude moyen' }
  ];
  cartes.innerHTML = stats.map(function (s) {
    return '<div class="stat-card ' + s.classe + '"' +
      (s.style ? ' style="' + s.style + '"' : '') + '>' +
      '<div><div class="stat-num">' + s.n + '</div>' +
      '<div class="stat-label">' + s.lbl + '</div></div>' +
    '</div>';
  }).join('');
}

function instantEvt(e) {
  var d = String(e.date || '').split('/');
  var h = String(e.heure || '00h00').split('h');
  if (d.length !== 3) return NaN;
  return new Date(+d[2], +d[1] - 1, +d[0], +h[0] || 0, +h[1] || 0).getTime();
}

/* ── Barres horizontales ─────────────────────────────────────
   Un rendu unique pour les trois répartitions — statut, type, priorité.
   Les barres se proportionnent à la plus haute et non à cent : sinon un
   statut à 7 % se réduit à un liseré qu'on ne distingue pas de zéro.
   ─────────────────────────────────────────────────────────── */
function barresHorizontales(donnees, total) {
  if (!donnees.length) {
    return '<p style="font-size:13px;color:var(--text-light);margin:0">Aucun dossier enregistré.</p>';
  }
  var max = Math.max.apply(null, donnees.map(function (d) { return d.n; })) || 1;
  return '<div class="barres">' + donnees.map(function (d) {
    var pct = Math.round(d.n * 100 / (total || 1));
    return '<div class="barre-ligne">' +
      '<span class="barre-puce" style="background:' + d.couleur + '"></span>' +
      '<span class="barre-lib">' + ech(d.libelle) + '</span>' +
      '<span class="barre-piste">' +
        '<span class="barre-remplie" style="width:' +
          Math.max(2, Math.round(d.n * 100 / max)) + '%;background:' + d.couleur + '"></span>' +
      '</span>' +
      '<span class="barre-n">' + d.n + '</span>' +
      '<span class="barre-pct">' + pct + ' %</span>' +
    '</div>';
  }).join('') + '</div>';
}

/* Les six statuts de la procédure, dans l'ordre où on les traverse — y
   compris ceux qui ne comptent aucun dossier : une case vide dit qu'aucun
   dossier n'y est parvenu, ce que son absence ne dirait pas. */
var TEINTE_STATUT = {
  RECU:           'var(--gray-3)',
  AUDITION:       'var(--gold)',
  EN_INSTRUCTION: 'var(--orange)',
  DECISION:       'var(--primary-lt)',
  TRANSMIS:       'var(--red)',
  CLOTURE:        'var(--green-lt)'
};

function repartitionParStatut() {
  if (typeof DOSSIERS === 'undefined') return [];
  return ORDRE_ETAPES.map(function (cle) {
    var n = DOSSIERS.filter(function (d) { return d.statut === cle; }).length;
    return {
      cle: cle, n: n,
      libelle: (STATUT_LABELS[cle] || [, cle])[1],
      couleur: TEINTE_STATUT[cle] || 'var(--gray-3)'
    };
  });
}

var ORDRE_PRIORITES = ['URGENTE', 'HAUTE', 'NORMALE', 'BASSE'];
var TEINTE_PRIORITE = {
  URGENTE: 'var(--red)', HAUTE: 'var(--orange)',
  NORMALE: 'var(--primary)', BASSE: 'var(--gray-3)'
};

function repartitionParPriorite() {
  if (typeof DOSSIERS === 'undefined') return [];
  return ORDRE_PRIORITES.map(function (p) {
    return {
      n: DOSSIERS.filter(function (d) { return d.priorite === p; }).length,
      libelle: p.charAt(0) + p.slice(1).toLowerCase(),
      couleur: TEINTE_PRIORITE[p]
    };
  }).filter(function (x) { return x.n > 0; });
}

/* Chaque graphique n'a qu'un emplacement. Les statuts étaient tracés sur
   les deux pages, et la répartition par type aussi : le même dessin deux
   fois, avec le risque d'en corriger un seul. La vue d'ensemble montre où
   en sont les dossiers, les statistiques ce qu'ils sont et ce qu'ils ont
   coûté en temps. */
function majGraphiques() {
  if (typeof DOSSIERS === 'undefined') return;
  var total = DOSSIERS.length;

  /* Vue d'ensemble : où en sont les dossiers. */
  var statuts = repartitionParStatut();
  var st = document.getElementById('chart-statuts');
  if (st) st.innerHTML = barresHorizontales(statuts, total);

  var lg = document.getElementById('statuts-legende');
  if (lg) {
    var actifs = statuts.filter(function (s) {
      return s.cle !== 'CLOTURE' && s.cle !== 'TRANSMIS';
    }).reduce(function (s, x) { return s + x.n; }, 0);
    lg.textContent = actifs + ' en cours sur ' + total;
  }

  /* Statistiques : ce que sont les dossiers, et comment ils sont cotés. */
  var pr = document.getElementById('chart-priorites');
  if (pr) pr.innerHTML = barresHorizontales(repartitionParPriorite(), total);

  var pie = document.getElementById('pie-chart');
  if (pie) pie.innerHTML = buildPieChart();
}

/* Charge par enquêteur : en cours, achevés, et délai réellement observé
   entre le dépôt et le dernier acte des dossiers qu'il a menés à terme. */
function majChargeDetaillee() {
  var corps = document.getElementById('charge-detaillee');
  if (!corps || typeof DOSSIERS === 'undefined') return;

  /* « Dossiers menés » est le total confié, achevé ou non — il ne répète
     pas les dossiers en cours, que la vue d'ensemble suit déjà. */
  corps.innerHTML = enqueteursActifs().map(function (e) {
    var siens = DOSSIERS.filter(function (d) { return d.enqueteur === e.nom; });
    var acheves = siens.filter(function (d) {
      return d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
    });
    var delais = acheves.map(delaiDossier).filter(function (x) { return x !== null; });
    var moyen = delais.length
      ? (delais.reduce(function (a, b) { return a + b; }, 0) / delais.length) : null;

    return '<tr>' +
      '<td><strong>' + ech(e.nom) + '</strong><br>' +
        '<span class="text-muted" style="font-size:12px">' + ech(e.specialite) + '</span></td>' +
      '<td>' + siens.length + '</td>' +
      '<td>' + acheves.length + '</td>' +
      '<td>' + (moyen === null
        ? '<span class="text-muted">—</span>'
        : moyen.toFixed(1).replace('.', ',') + ' j') + '</td>' +
    '</tr>';
  }).join('');
}

/* Du dépôt au dernier acte consigné, en jours. */
function delaiDossier(d) {
  var h = (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[d.id]) || [];
  var t = h.map(instantEvt).filter(function (x) { return !isNaN(x); });
  if (!t.length) return null;
  return (Math.max.apply(null, t) - Math.min.apply(null, t)) / 86400000;
}

/* Répartition par type d'infraction. Les proportions étaient écrites en
   dur — 38 % de vols pour un jeu de données qui n'en comptait pas autant.
   Palette prise dans 01-tokens.css : les valeurs précédentes (#0d2a6e,
   #e67e22, #c0392b, #8e44ad, #7f8c8d) étaient étrangères à la charte. */
var TEINTES_TYPE = ['var(--primary)', 'var(--orange)', 'var(--red)',
                    'var(--gold)', 'var(--primary-lt)', 'var(--gray-3)'];

function repartitionParType() {
  if (typeof DOSSIERS === 'undefined' || !DOSSIERS.length) return [];
  var compte = {};
  DOSSIERS.forEach(function (d) {
    var t = d.type || 'Autre';
    compte[t] = (compte[t] || 0) + 1;
  });
  return Object.keys(compte)
    .map(function (t) {
      return { label: t, n: compte[t], pct: Math.round(compte[t] * 100 / DOSSIERS.length) };
    })
    .sort(function (a, b) { return b.n - a.n || a.label.localeCompare(b.label); })
    .map(function (x, i) {
      x.color = TEINTES_TYPE[i % TEINTES_TYPE.length];
      return x;
    });
}

function buildPieChart() {
  var data = repartitionParType();
  if (!data.length) {
    return '<p style="font-size:13px;color:var(--text-light);margin:0">Aucun dossier enregistré.</p>';
  }
  var max = data[0].pct || 1;
  return data.map(function (d) {
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
      '<div style="width:12px;height:12px;border-radius:var(--radius-sm);background:' + d.color + ';flex-shrink:0"></div>' +
      '<div style="flex:1;font-size:13px">' + ech(d.label) +
        ' <span class="text-muted">(' + d.n + ')</span></div>' +
      '<div style="width:120px;background:var(--gray-2);border-radius:var(--radius-sm);height:8px;flex-shrink:0">' +
        /* Barres proportionnées à la plus haute, sinon 7 % occupe un
           liseré illisible à côté d'un 29 %. */
        '<div style="width:' + Math.round(d.pct * 100 / max) + '%;height:8px;background:' + d.color + ';border-radius:var(--radius-sm)"></div>' +
      '</div>' +
      '<div style="font-size:13px;font-weight:600;width:36px;text-align:right;font-variant-numeric:tabular-nums">' + d.pct + '%</div>' +
    '</div>';
  }).join('');
}

/* ============================================================
   GESTION DES AGENTS

   Le commissaire dirige son unité : il doit voir qui la compose, ce que
   chacun porte, et pouvoir mettre un agent hors service — un congé, une
   mutation. La règle qui compte : on ne met pas hors service un agent
   qui détient encore des dossiers. Ils resteraient à son nom sans que
   personne ne les instruise. Il faut d'abord les transférer.
   ============================================================ */

var vueAgents = { recherche: '', role: '', etat: '' };
var agentEnEdition = null;   /* id, ou null pour une création */
var agentAEtat = null;       /* agent dont on change l'état */

function agentsFiltres() {
  if (typeof AGENTS === 'undefined') return [];
  var v = vueAgents;
  var terme = sansAccents(v.recherche);
  return AGENTS.filter(function (a) {
    if (v.role && a.role !== v.role) return false;
    if (v.etat === 'actif' && !a.actif) return false;
    if (v.etat === 'inactif' && a.actif) return false;
    if (!terme) return true;
    var foin = sansAccents([a.nom, a.prenom, a.nomFamille, a.matricule,
                            a.grade, a.specialite, a.email].join(' '));
    return terme.split(/\s+/).filter(Boolean).every(function (m) {
      return foin.indexOf(m) !== -1;
    });
  });
}

function chercherAgents(t) { vueAgents.recherche = t || ''; rendreAgents(); }

function filtrerAgents() {
  var lu = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
  vueAgents.role = lu('filtre-agent-role');
  vueAgents.etat = lu('filtre-agent-etat');
  rendreAgents();
}

function reinitialiserAgents() {
  vueAgents.recherche = vueAgents.role = vueAgents.etat = '';
  ['recherche-agents', 'filtre-agent-role', 'filtre-agent-etat'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  rendreAgents();
}

function rendreAgents() {
  var corps = document.getElementById('agents-tbody');
  if (!corps || typeof AGENTS === 'undefined') return;

  majKPIAgents();
  var liste = agentsFiltres();
  majBilanAgents(liste.length);

  if (!liste.length) {
    corps.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:26px">' +
      'Aucun agent ne correspond à cette recherche.' +
      '<br><button class="btn btn-ghost btn-sm" style="margin-top:12px" ' +
      'onclick="reinitialiserAgents()">Réinitialiser</button></td></tr>';
    return;
  }

  corps.innerHTML = liste.map(function (a) {
    var charge = a.role === 'enqueteur' ? chargeDe(a.nom) : null;
    return '<tr' + (a.actif ? '' : ' class="agent-inactif"') + '>' +
      '<td><strong>' + ech(a.nom) + '</strong><br>' +
        '<span class="text-muted">' + ech(a.prenom) + ' ' + ech(a.nomFamille) +
        ' — ' + ech(a.grade) + '</span></td>' +
      '<td><span class="badge ' + teinteRole(a.role) + '">' +
        ech(ROLES_AGENT[a.role] || a.role) + '</span></td>' +
      '<td style="font-variant-numeric:tabular-nums">' + ech(a.matricule) + '</td>' +
      '<td>' + ech(a.specialite) + '</td>' +
      '<td>' + (charge === null
        ? '<span class="text-muted">—</span>'
        : '<strong>' + charge + '</strong>') + '</td>' +
      '<td>' + (a.actif
        ? '<span class="badge badge-green">En service</span>'
        : '<span class="badge badge-gray">Hors service</span>' +
          (a.motifInactif ? '<br><span class="text-muted" style="font-size:11.5px">' +
            ech(a.motifInactif) + '</span>' : '')) + '</td>' +
      '<td><div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="btn btn-outline btn-sm" onclick="ouvrirFicheAgent(\'' + a.id + '\')">Modifier</button>' +
        (a.role === 'commissaire' ? ''
          : '<button class="btn btn-ghost btn-sm" onclick="ouvrirEtatAgent(\'' + a.id + '\')">' +
            (a.actif ? 'Mettre hors service' : 'Remettre en service') + '</button>') +
      '</div></td>' +
    '</tr>';
  }).join('');
}

function teinteRole(role) {
  return role === 'commissaire' ? 'badge-gold'
       : role === 'enqueteur'   ? 'badge-blue' : 'badge-gray';
}

function majKPIAgents() {
  var zone = document.getElementById('kpi-agents');
  if (!zone || typeof AGENTS === 'undefined') return;

  var enq = AGENTS.filter(function (a) { return a.role === 'enqueteur'; });
  var dispo = enq.filter(function (a) { return a.actif; });
  var portes = dispo.reduce(function (s, a) { return s + chargeDe(a.nom); }, 0);
  var moyenne = dispo.length ? (portes / dispo.length) : 0;

  var cases = [
    ['total',    AGENTS.length,  'Agents au registre'],
    ['ok',       dispo.length,   'Enquêteurs en service'],
    ['en-cours', portes,         'Dossiers instruits'],
    ['urgent',   moyenne.toFixed(1).replace('.', ','), 'Charge moyenne']
  ];
  zone.innerHTML = cases.map(function (c) {
    return '<div class="kpi ' + c[0] + '">' +
      '<div class="num">' + c[1] + '</div><div class="lbl">' + c[2] + '</div></div>';
  }).join('');

  var st = document.getElementById('agents-soustitre');
  if (st) {
    st.textContent = 'Commissariat Cité Verte, Yaoundé — ' + AGENTS.length +
      ' agent' + (AGENTS.length > 1 ? 's' : '') + ', dont ' + dispo.length +
      ' enquêteur' + (dispo.length > 1 ? 's' : '') + ' en service.';
  }
}

function majBilanAgents(total) {
  var el = document.getElementById('agents-bilan');
  if (!el || typeof AGENTS === 'undefined') return;
  var v = vueAgents;
  var actifs = [
    v.recherche && '« ' + ech(v.recherche) + ' »',
    v.role && (ROLES_AGENT[v.role] || v.role),
    v.etat && (v.etat === 'actif' ? 'en service' : 'hors service')
  ].filter(Boolean);

  el.innerHTML = total
    ? '<span><strong>' + total + '</strong> agent' + (total > 1 ? 's' : '') +
        (total < AGENTS.length ? ' <span class="text-muted">(' + AGENTS.length + ' au registre)</span>' : '') +
      '</span>' +
      (actifs.length ? '<span class="filtres-actifs">' + actifs.join(' · ') + '</span>' : '')
    : '<span class="filtres-vide">Aucun agent' +
      (actifs.length ? ' pour ' + actifs.join(' · ') : '') + '</span>';
}

/* ── Fiche : création ou modification ─────────────────────── */
function ouvrirFicheAgent(id) {
  agentEnEdition = id || null;
  var a = id ? agentParId(id) : null;

  var mettre = function (champ, valeur) {
    var el = document.getElementById('agent-' + champ);
    if (el) el.value = valeur || '';
  };
  mettre('prenom', a && a.prenom);
  mettre('nom', a && a.nomFamille);
  mettre('matricule', a && a.matricule);
  mettre('grade', a && a.grade);
  mettre('specialite', a && a.specialite);
  mettre('telephone', a && a.telephone);
  mettre('email', a && a.email);
  var role = document.getElementById('agent-role');
  if (role) role.value = (a && a.role) || 'enqueteur';

  var titre = document.getElementById('agent-titre');
  if (titre) titre.textContent = a ? 'Modifier ' + a.nom : 'Nouvel agent';
  var err = document.getElementById('err-agent');
  if (err) err.textContent = '';

  openModal('modal-agent');
}

/* Le nom d'usage — « Insp. KANA » — sert de clé aux dossiers. On le
   construit du grade et du patronyme, comme dans le registre. */
function nomDUsage(grade, nomFamille) {
  var abrege = /commissaire/i.test(grade) ? 'Comm.'
             : /brigadier/i.test(grade)   ? 'Brig.'
             : /inspecteur/i.test(grade)  ? 'Insp.'
             : /agent/i.test(grade)       ? 'Ag.' : '';
  return (abrege ? abrege + ' ' : '') + String(nomFamille || '').toUpperCase();
}

function enregistrerAgent() {
  var lu = function (champ) {
    var el = document.getElementById('agent-' + champ);
    return el ? String(el.value || '').trim() : '';
  };
  var err = document.getElementById('err-agent');
  var dire = function (m) { if (err) err.textContent = m; };

  var prenom = lu('prenom'), nomFamille = lu('nom');
  var matricule = lu('matricule'), grade = lu('grade');

  if (!prenom || !nomFamille) { dire('Le prénom et le nom sont requis.'); return; }
  if (!grade) { dire('Indiquez le grade : il détermine le nom d\'usage.'); return; }
  if (!matricule) { dire('Le matricule est requis.'); return; }

  /* Deux agents ne peuvent porter le même matricule : c'est ce qui les
     identifie dans les registres de la police. */
  var doublon = AGENTS.filter(function (a) {
    return a.matricule.toLowerCase() === matricule.toLowerCase() && a.id !== agentEnEdition;
  })[0];
  if (doublon) { dire('Le matricule ' + matricule + ' est déjà porté par ' + doublon.nom + '.'); return; }

  var role = lu('role') || 'enqueteur';
  var nom = nomDUsage(grade, nomFamille);

  if (agentEnEdition) {
    var a = agentParId(agentEnEdition);
    if (!a) return;
    /* Renommer un agent qui détient des dossiers les orphelinerait : le
       rattachement se fait sur le nom d'usage. On reprend les dossiers. */
    if (a.nom !== nom) renommerDansDossiers(a.nom, nom);
    a.prenom = prenom; a.nomFamille = nomFamille; a.nom = nom;
    a.role = role; a.matricule = matricule; a.grade = grade;
    a.specialite = lu('specialite') || 'Généraliste';
    a.telephone = lu('telephone'); a.email = lu('email');
    toast('Fiche de ' + nom + ' mise à jour', 'success');
  } else {
    if (agentParNom(nom)) { dire('Un agent porte déjà le nom d\'usage ' + nom + '.'); return; }
    var m = new Date(), dd = function (n) { return String(n).padStart(2, '0'); };
    AGENTS.push({
      id: 'AG-' + String(AGENTS.length + 1).padStart(3, '0'),
      nom: nom, nomFamille: nomFamille, prenom: prenom, role: role,
      matricule: matricule, grade: grade,
      specialite: lu('specialite') || 'Généraliste',
      telephone: lu('telephone'), email: lu('email'),
      actif: true,
      depuis: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
      commissariat: 'Commissariat Cité Verte, Yaoundé'
    });
    toast(nom + ' a rejoint le commissariat', 'success');
  }

  closeModal('modal-agent');
  agentEnEdition = null;
  rendreAgents();
  rafraichirTableauDeBord();
}

function renommerDansDossiers(ancien, nouveau) {
  if (typeof DOSSIERS === 'undefined') return;
  DOSSIERS.forEach(function (d) { if (d.enqueteur === ancien) d.enqueteur = nouveau; });
}

/* ── Mise hors service ───────────────────────────────────── */
function ouvrirEtatAgent(id) {
  var a = agentParId(id);
  if (!a) return;
  agentAEtat = id;

  var charge = a.role === 'enqueteur' ? chargeDe(a.nom) : 0;
  var titre = document.getElementById('agent-etat-titre');
  var recap = document.getElementById('agent-etat-recap');
  var champ = document.getElementById('agent-etat-champ');
  var bouton = document.getElementById('btn-agent-etat');
  var err = document.getElementById('err-agent-etat');
  if (err) err.textContent = '';

  if (a.actif) {
    if (titre) titre.textContent = 'Mettre ' + a.nom + ' hors service';
    /* Un agent qui détient des dossiers ne peut pas être écarté : ils
       resteraient à son nom sans que personne ne les instruise. */
    if (charge > 0) {
      if (recap) {
        recap.innerHTML = '<div class="alert alert-warning" style="margin-bottom:16px"><div>' +
          '<strong>' + ech(a.nom) + ' instruit encore ' + charge + ' dossier' +
          (charge > 1 ? 's' : '') + '.</strong><br>' +
          'Transférez-les à un autre enquêteur avant de le mettre hors service : ' +
          'sans cela, ils resteraient à son nom sans être suivis.' +
          '</div></div>' +
          '<div class="recap">' + dossiersDeLAgent(a.nom) + '</div>';
      }
      if (champ) champ.style.display = 'none';
      if (bouton) { bouton.disabled = true; bouton.textContent = 'Transfert requis'; }
      openModal('modal-agent-etat');
      return;
    }
    if (recap) {
      recap.innerHTML = '<p style="font-size:14px;line-height:1.7;margin:0 0 16px">' +
        ech(a.nom) + ' ne recevra plus de dossier tant qu\'il sera hors service. ' +
        'Sa fiche est conservée au registre.</p>';
    }
    if (champ) champ.style.display = '';
    if (bouton) { bouton.disabled = false; bouton.textContent = 'Mettre hors service'; }
  } else {
    if (titre) titre.textContent = 'Remettre ' + a.nom + ' en service';
    if (recap) {
      recap.innerHTML = '<p style="font-size:14px;line-height:1.7;margin:0 0 16px">' +
        ech(a.nom) + ' redeviendra affectable.' +
        (a.motifInactif ? '<br><span class="text-muted">Motif enregistré : ' +
          ech(a.motifInactif) + '</span>' : '') + '</p>';
    }
    if (champ) champ.style.display = 'none';
    if (bouton) { bouton.disabled = false; bouton.textContent = 'Remettre en service'; }
  }
  openModal('modal-agent-etat');
}

function dossiersDeLAgent(nom) {
  return DOSSIERS.filter(function (d) {
    return d.enqueteur === nom && d.statut !== 'CLOTURE' && d.statut !== 'TRANSMIS';
  }).map(function (d) {
    return '<div class="recap-ligne"><span>' + ech(d.id) + '</span><strong>' +
      ech(d.type) + ' — ' + ech((STATUT_LABELS[d.statut] || [, d.statut])[1]) +
      '</strong></div>';
  }).join('');
}

function confirmerEtatAgent() {
  var a = agentParId(agentAEtat);
  if (!a) return;

  if (a.actif) {
    if (chargeDe(a.nom) > 0) return;   /* garde-fou, le bouton est déjà inerte */
    var motif = ((document.getElementById('agent-motif') || {}).value || '').trim();
    if (motif.length < 3) {
      var err = document.getElementById('err-agent-etat');
      if (err) err.textContent = 'Indiquez le motif : congé, mutation, formation…';
      return;
    }
    a.actif = false;
    a.motifInactif = motif;
    toast(a.nom + ' est hors service — ' + motif, 'success');
  } else {
    a.actif = true;
    delete a.motifInactif;
    toast(a.nom + ' est de nouveau en service', 'success');
  }

  closeModal('modal-agent-etat');
  agentAEtat = null;
  rendreAgents();
  rafraichirTableauDeBord();
}

/* ============================================================
   JOURNAUX D'AUDIT

   L'entrée du menu se contentait d'un message « Journaux consultés ». Le
   journal existait pourtant déjà, éclaté : chaque acte de procédure est
   horodaté, qualifié et signé dans l'historique de son dossier. On les
   réunit en une chronologie unique, du plus récent au plus ancien —
   l'ordre dans lequel on consulte un journal.

   Les notes internes y figurent : c'est un journal de supervision, non ce
   que voit le plaignant. Leur nature reste signalée.
   ============================================================ */

var LIBELLE_ACTE = {
  depot:       'Dépôt de plainte',
  attestation: 'Attestation délivrée',
  reception:   'Réception au commissariat',
  affectation: 'Affectation',
  convocation: 'Convocation',
  audition:    'Audition',
  pv:          'Procès-verbal',
  statut:      'Changement de statut',
  message:     'Message au plaignant',
  note:        'Note interne'
};

var TEINTE_ACTE = {
  depot: 'badge-blue', attestation: 'badge-blue', reception: 'badge-gray',
  affectation: 'badge-gold', convocation: 'badge-orange', audition: 'badge-gold',
  pv: 'badge-green', statut: 'badge-blue', message: 'badge-gold', note: 'badge-gray'
};

var vueAudit = { recherche: '', type: '', auteur: '', du: '', au: '', page: 1, parPage: 15 };

/* « 2026-06-08 » d'un champ date vers un instant. `finDeJournee` porte la
   borne à 23h59 : sans cela, filtrer « au 8 juin » exclurait tout ce qui
   s'est passé ce jour-là après minuit, c'est-à-dire tout. */
function instantDeChamp(v, finDeJournee) {
  if (!v) return null;
  var p = String(v).split('-');
  if (p.length !== 3) return null;
  return finDeJournee
    ? new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59).getTime()
    : new Date(+p[0], +p[1] - 1, +p[2], 0, 0, 0).getTime();
}

/* Étendue réellement couverte par le journal, pour borner les champs. */
function etendueJournal() {
  var t = journalComplet().map(function (l) { return l.instant; })
    .filter(function (x) { return !isNaN(x); });
  if (!t.length) return null;
  return { debut: Math.min.apply(null, t), fin: Math.max.apply(null, t) };
}

function enChampDate(ms) {
  var d = new Date(ms), dd = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + dd(d.getMonth() + 1) + '-' + dd(d.getDate());
}

/* Toutes les écritures du commissariat, à plat. L'auteur d'un acte n'est
   pas toujours nommé — un dépôt vient du plaignant, une attestation part
   automatiquement : on l'attribue plutôt que de laisser la case vide. */
function journalComplet() {
  if (typeof HISTORIQUE === 'undefined' || typeof DOSSIERS === 'undefined') return [];
  var lignes = [];
  DOSSIERS.forEach(function (d) {
    (HISTORIQUE[d.id] || []).forEach(function (e) {
      lignes.push({
        dossier: d.id,
        plaignant: d.plaignant,
        type: e.type,
        date: e.date,
        heure: e.heure,
        instant: instantEvt(e),
        detail: e.texte || e.detail || e.libelle || '',
        libelle: e.libelle || LIBELLE_ACTE[e.type] || e.type,
        auteur: e.auteur || auteurImplicite(e, d)
      });
    });
  });
  return lignes.sort(function (a, b) { return b.instant - a.instant; });
}

function auteurImplicite(e, d) {
  if (e.type === 'depot') return d.plaignant;
  if (e.type === 'attestation') return 'Système';
  if (e.type === 'reception') return 'Accueil du commissariat';
  if (e.type === 'affectation') return 'Commissaire NGUEMO';
  return d.enqueteur || 'Commissariat';
}

function auditFiltre() {
  var v = vueAudit;
  var terme = sansAccents(v.recherche);
  var du = instantDeChamp(v.du, false);
  var au = instantDeChamp(v.au, true);

  return journalComplet().filter(function (l) {
    if (v.type && l.type !== v.type) return false;
    if (v.auteur && l.auteur !== v.auteur) return false;
    if (du !== null && !(l.instant >= du)) return false;
    if (au !== null && !(l.instant <= au)) return false;
    if (!terme) return true;
    var foin = sansAccents([l.dossier, l.plaignant, l.libelle, l.detail, l.auteur].join(' '));
    return terme.split(/\s+/).filter(Boolean).every(function (m) {
      return foin.indexOf(m) !== -1;
    });
  });
}

/* Un intervalle à l'envers ne rend jamais rien : autant le dire plutôt
   que de laisser croire à un journal vide. */
function periodeInversee() {
  var du = instantDeChamp(vueAudit.du, false);
  var au = instantDeChamp(vueAudit.au, true);
  return du !== null && au !== null && du > au;
}

function chercherAudit(t) { vueAudit.recherche = t || ''; vueAudit.page = 1; rendreAudit(); }

function filtrerAudit() {
  var lu = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
  vueAudit.type   = lu('filtre-audit-type');
  vueAudit.auteur = lu('filtre-audit-auteur');
  vueAudit.du     = lu('filtre-audit-du');
  vueAudit.au     = lu('filtre-audit-au');
  vueAudit.page = 1;
  rendreAudit();
}

function reinitialiserAudit() {
  vueAudit.recherche = vueAudit.type = vueAudit.auteur = vueAudit.du = vueAudit.au = '';
  vueAudit.page = 1;
  ['recherche-audit', 'filtre-audit-type', 'filtre-audit-auteur',
   'filtre-audit-du', 'filtre-audit-au'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  rendreAudit();
}

/* Les champs de date ne proposent que l'étendue du journal. */
function bornerChampsDate() {
  var e = etendueJournal();
  if (!e) return;
  ['filtre-audit-du', 'filtre-audit-au'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el || !el.setAttribute) return;
    el.setAttribute('min', enChampDate(e.debut));
    el.setAttribute('max', enChampDate(e.fin));
  });
}

function allerPageAudit(n) { vueAudit.page = n; rendreAudit(); }

/* Le sélecteur d'auteurs se construit sur ceux qui ont réellement écrit. */
function remplirFiltreAuteurs() {
  var sel = document.getElementById('filtre-audit-auteur');
  if (!sel) return;
  var garde = sel.value;
  var vus = {};
  journalComplet().forEach(function (l) { vus[l.auteur] = (vus[l.auteur] || 0) + 1; });
  sel.innerHTML = '<option value="">Tous les auteurs</option>' +
    Object.keys(vus).sort().map(function (a) {
      return '<option value="' + ech(a) + '">' + ech(a) + ' (' + vus[a] + ')</option>';
    }).join('');
  sel.value = garde;
}

function rendreAudit() {
  var corps = document.getElementById('audit-tbody');
  if (!corps) return;

  var lignes = auditFiltre();
  var total = lignes.length;
  var pages = Math.max(1, Math.ceil(total / vueAudit.parPage));
  if (vueAudit.page > pages) vueAudit.page = pages;
  var debut = (vueAudit.page - 1) * vueAudit.parPage;
  var page = lignes.slice(debut, debut + vueAudit.parPage);

  var soustitre = document.getElementById('audit-soustitre');
  if (soustitre) {
    soustitre.textContent = journalComplet().length +
      ' actes de procédure enregistrés sur ' + DOSSIERS.length + ' dossiers — ' +
      'du plus récent au plus ancien.';
  }

  majBilanAudit(total, debut, page.length);
  majPaginationAudit(total, pages);

  if (!page.length) {
    corps.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:26px">' +
      'Aucun acte ne correspond à cette recherche.' +
      '<br><button class="btn btn-ghost btn-sm" style="margin-top:12px" ' +
      'onclick="reinitialiserAudit()">Réinitialiser</button></td></tr>';
    return;
  }

  corps.innerHTML = page.map(function (l) {
    return '<tr>' +
      '<td style="white-space:nowrap;font-variant-numeric:tabular-nums">' +
        ech(l.date) + '<br><span class="text-muted">' + ech(l.heure || '') + '</span></td>' +
      '<td><button type="button" class="lien-dossier" onclick="consulterDossier(\'' + l.dossier + '\')">' +
        ech(l.dossier) + '</button><br>' +
        '<span class="text-muted">' + ech(l.plaignant) + '</span></td>' +
      '<td><span class="badge ' + (TEINTE_ACTE[l.type] || 'badge-gray') + '">' +
        ech(LIBELLE_ACTE[l.type] || l.type) + '</span></td>' +
      '<td class="audit-detail">' + ech(l.libelle) +
        (l.detail && l.detail !== l.libelle
          ? '<span>' + ech(abreger(l.detail, 120)) + '</span>' : '') + '</td>' +
      '<td>' + ech(l.auteur) + '</td>' +
    '</tr>';
  }).join('');
}

function abreger(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s;
}

/* « du 1er au 8 juin 2026 », ou une seule borne si l'autre est ouverte. */
function libellePeriode(du, au) {
  var enClair = function (v) {
    var p = String(v).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : v;
  };
  if (du && au) return 'du ' + enClair(du) + ' au ' + enClair(au);
  if (du) return 'à partir du ' + enClair(du);
  if (au) return "jusqu'au " + enClair(au);
  return '';
}

function majBilanAudit(total, debut, affiches) {
  var el = document.getElementById('audit-bilan');
  if (!el) return;
  var v = vueAudit;
  var tout = journalComplet().length;
  var actifs = [
    v.recherche && '« ' + ech(v.recherche) + ' »',
    v.type && (LIBELLE_ACTE[v.type] || v.type),
    v.auteur,
    libellePeriode(v.du, v.au)
  ].filter(Boolean);

  /* Deux dates dans le mauvais ordre ne rendront jamais rien : le dire
     vaut mieux que « aucun acte », qui ferait chercher ailleurs. */
  if (periodeInversee()) {
    el.innerHTML = '<span class="filtres-vide">La date de début est postérieure ' +
      'à la date de fin : aucun acte ne peut correspondre.</span>';
    return;
  }

  if (!total) {
    el.innerHTML = '<span class="filtres-vide">Aucun acte' +
      (actifs.length ? ' pour ' + actifs.join(' · ') : '') + '</span>';
    return;
  }
  el.innerHTML =
    '<span><strong>' + (debut + 1) + '–' + (debut + affiches) + '</strong> sur ' +
      total + ' acte' + (total > 1 ? 's' : '') +
      (total < tout ? ' <span class="text-muted">(' + tout + ' au total)</span>' : '') +
    '</span>' +
    (actifs.length ? '<span class="filtres-actifs">' + actifs.join(' · ') + '</span>' : '');
}

/* Le nombre de lignes par page. Changer de taille remet en première page :
   rester « page 7 » d'une liste qui n'en compte plus que trois n'a pas de
   sens, et le rattrapage silencieux déroute. */
function changerTaillePageAudit(n) {
  vueAudit.parPage = parseInt(n, 10) || 15;
  vueAudit.page = 1;
  rendreAudit();
}

function majPaginationAudit(total, pages) {
  var el = document.getElementById('pagination-audit');
  if (!el) return;
  var taille = selecteurTaille('taille-audit', vueAudit.parPage, 'changerTaillePageAudit');

  /* Une seule page : le sélecteur reste, il sert justement à en obtenir
     plusieurs ou à tout voir d'un coup. Les flèches, elles, disparaissent. */
  if (pages <= 1) {
    el.innerHTML = '<nav class="pagination">' + taille +
      '<span class="text-muted" style="font-size:12.5px">' +
        total + ' acte' + (total > 1 ? 's' : '') + ' — page unique</span></nav>';
    return;
  }

  var p = vueAudit.page;
  var bouton = function (n, libelle, dispo, courante) {
    return '<button type="button" class="page-btn' + (courante ? ' courante' : '') + '"' +
      (dispo ? ' onclick="allerPageAudit(' + n + ')"' : ' disabled') +
      (courante ? ' aria-current="page"' : '') + '>' + libelle + '</button>';
  };
  var nums = [];
  var de = Math.max(1, Math.min(p - 2, pages - 4));
  var a  = Math.min(pages, Math.max(p + 2, 5));
  if (de > 1) nums.push(bouton(1, '1', true, false), '<span class="page-ellipse">…</span>');
  for (var i = de; i <= a; i++) nums.push(bouton(i, String(i), true, i === p));
  if (a < pages) nums.push('<span class="page-ellipse">…</span>', bouton(pages, String(pages), true, false));

  el.innerHTML = '<nav class="pagination" aria-label="Pages du journal">' +
    taille +
    '<span class="pagination-nav">' +
      bouton(p - 1, 'Précédent', p > 1, false) +
      '<span class="pagination-pages">' + nums.join('') + '</span>' +
      bouton(p + 1, 'Suivant', p < pages, false) +
    '</span>' +
    '<span class="pagination-etat">Page ' + p + ' sur ' + pages + '</span>' +
  '</nav>';
}

/* ============================================================
   TRANSFERT D'UN DOSSIER  (§7.4)

   « En cas d'indisponibilite de l'enqueteur en charge, le dossier est
   transfere a un autre enqueteur » — compte rendu d'entretien. La
   decision revient au commissaire : l'enqueteur ne se dessaisit pas
   lui-meme de son dossier.
   ============================================================ */

/* La liste était écrite ici, réduite à deux noms. Elle se lit maintenant
   du registre des agents, et ne retient que ceux en service : proposer un
   enquêteur en congé pour une affectation n'avait pas de sens. */
function enqueteursActifs() {
  return (typeof enqueteursDisponibles === 'function') ? enqueteursDisponibles() : [];
}



var dossierATransferer = null;
var enqueteurChoisi = null;

function chargeDe(nomEnqueteur) {
  if (typeof DOSSIERS === 'undefined') return 0;
  return DOSSIERS.filter(function (d) {
    return d.enqueteur === nomEnqueteur && d.statut !== 'CLOTURE' && d.statut !== 'TRANSMIS';
  }).length;
}

function ouvrirTransfert(id) {
  var d = (typeof DOSSIERS !== 'undefined') ? DOSSIERS.find(function (x) { return x.id === id; }) : null;
  if (!d) return;
  dossierATransferer = id;

  document.getElementById('transfert-titre').textContent = 'Transférer le dossier ' + id;
  document.getElementById('transfert-actuel').innerHTML =
    '<div class="alert alert-info" style="margin-bottom:16px"><div>' +
      'Actuellement confié à <strong>' + d.enqueteur + '</strong>' +
      ' — ' + chargeDe(d.enqueteur) + ' dossier(s) en cours.' +
    '</div></div>';

  /* Tous les enquêteurs en service sont présentés, comme à l'affectation.
     Celui qui détient déjà le dossier figure dans la liste, inerte et
     expliqué : le retirer laissait croire qu'il n'existait pas, et sur
     deux enquêteurs le choix paraissait imposé. */
  var dispo = enqueteursActifs();
  document.getElementById('transfert-liste').innerHTML = dispo.length
    ? dispo.map(function (e) {
        var detenteur = (e.nom === d.enqueteur);
        return '<button type="button" class="choix-agent' + (detenteur ? ' indisponible' : '') + '" ' +
          'data-agent="' + ech(e.nom) + '"' + (detenteur ? ' disabled' : '') + ' ' +
          (detenteur ? '' : 'onclick="choisirEnqueteur(\'' + ech(e.nom) + '\')"') + '>' +
          '<span class="choix-agent-nom">' + ech(e.nom) + '</span>' +
          '<span class="choix-agent-info">' + ech(e.specialite) + ' — ' +
            chargeDe(e.nom) + ' dossier(s)' +
            (detenteur ? ' · détient ce dossier' : '') + '</span>' +
        '</button>';
      }).join('')
    : '<p style="font-size:13px;color:var(--text-light);margin:0">' +
      'Aucun enquêteur en service. Vérifiez le registre des agents.</p>';

  var err = document.getElementById('err-transfert');
  if (err) err.textContent = '';
  enqueteurChoisi = null;
  majBoutonTransfert();
  openModal('modal-transfert');
}

/* Sélection : le clic marque l'enquêteur, il ne transfère rien. */
function choisirEnqueteur(nom) {
  enqueteurChoisi = nom;
  document.querySelectorAll('#transfert-liste .choix-agent').forEach(function (b) {
    var estCelui = b.getAttribute('data-agent') === nom;
    b.classList.toggle('choisi', estCelui);
    b.setAttribute('aria-pressed', estCelui ? 'true' : 'false');
  });
  var err = document.getElementById('err-transfert');
  if (err) err.textContent = '';
  majBoutonTransfert();
}

/* Tant qu'aucun enquêteur n'est choisi, le bouton reste inerte : mieux
   vaut le montrer indisponible que d'accepter un clic sans effet. */
function majBoutonTransfert() {
  var b = document.getElementById('btn-transferer');
  if (!b) return;
  b.disabled = !enqueteurChoisi;
  b.textContent = enqueteurChoisi ? 'Transférer à ' + enqueteurChoisi : 'Transférer';
}

/* Étape de confirmation : un transfert dessaisit un enquêteur de son
   dossier, on ne le déclenche pas d'un clic isolé. */
function demanderTransfert() {
  var d = (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.find(function (x) { return x.id === dossierATransferer; }) : null;
  if (!d) return;

  if (!enqueteurChoisi) {
    var err = document.getElementById('err-transfert');
    if (err) err.textContent = 'Choisissez l\'enquêteur à qui confier le dossier.';
    return;
  }

  var motif = (document.getElementById('transfert-motif') || {}).value || 'Transfert';
  var zone = document.getElementById('transfert-recapitulatif');
  if (zone) {
    zone.innerHTML =
      '<p style="font-size:14px;line-height:1.7;margin:0 0 16px">' +
        'Le dossier <strong>' + ech(d.id) + '</strong> — ' + ech(d.type) + ', ' +
        ech(d.plaignant) + ' — va être retiré à <strong>' + ech(d.enqueteur) +
        '</strong> et confié à <strong>' + ech(enqueteurChoisi) + '</strong>.' +
      '</p>' +
      '<div class="recap">' +
        '<div class="recap-ligne"><span>Motif</span><strong>' + ech(motif) + '</strong></div>' +
        '<div class="recap-ligne"><span>Charge après transfert</span><strong>' +
          ech(d.enqueteur) + ' : ' + (chargeDe(d.enqueteur) - 1) + ' · ' +
          ech(enqueteurChoisi) + ' : ' + (chargeDe(enqueteurChoisi) + 1) +
        '</strong></div>' +
      '</div>' +
      '<p style="font-size:12.5px;color:var(--text-light);margin:14px 0 0">' +
        'Le transfert est consigné au dossier et le plaignant en est informé ' +
        'dans son espace de suivi.</p>';
  }
  openModal('modal-transfert-confirmation');
}

/* Exécution : l'enquêteur retenu vient de la sélection, plus d'un
   argument passé par le bouton — c'est la confirmation qui déclenche. */
function confirmerTransfert() {
  var d = (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.find(function (x) { return x.id === dossierATransferer; }) : null;
  var nouvelEnqueteur = enqueteurChoisi;
  if (!d || !nouvelEnqueteur) return;

  var motif = (document.getElementById('transfert-motif') || {}).value || 'Transfert';
  var ancien = d.enqueteur;
  d.enqueteur = nouvelEnqueteur;

  /* Le transfert est un acte de procedure : il rejoint l'historique, donc
     le suivi du plaignant, qui doit savoir qui instruit son dossier. */
  if (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[d.id]) {
    var m = new Date(), dd = function (n) { return String(n).padStart(2, '0'); };
    HISTORIQUE[d.id].push({
      etape: d.statut, type: 'affectation',
      date: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
      heure: dd(m.getHours()) + 'h' + dd(m.getMinutes()),
      libelle: 'Dossier transféré',
      detail: 'De ' + ancien + ' à ' + nouvelEnqueteur + ' — ' + motif
    });
  }

  closeModal('modal-transfert-confirmation');
  closeModal('modal-transfert');
  enqueteurChoisi = null;
  toast('Dossier ' + d.id + ' transféré de ' + ancien + ' à ' + nouvelEnqueteur, 'success');
  initDashboard();
  rafraichirTableauDeBord();
}

/* Liste des enqueteurs a qui affecter un dossier. Elle annoncait
   « Insp. NGUEMO — 5 dossiers » en dur : NGUEMO est le commissaire, et
   les charges ne correspondaient a rien. Elles se calculent. */
function remplirListeEnqueteurs() {
  var list = document.getElementById('enqueteur-list');
  if (!list) return;
  var dispo = enqueteursActifs();

  list.innerHTML = dispo.length
    ? dispo.map(function (e) {
        return '<button type="button" class="choix-agent" data-agent="' + ech(e.nom) + '" ' +
          'onclick="choisirPourAffectation(\'' + ech(e.nom) + '\')">' +
          '<span class="choix-agent-nom">' + ech(e.nom) + '</span>' +
          '<span class="choix-agent-info">' + ech(e.specialite) + ' — ' +
            chargeDe(e.nom) + ' dossier(s) en cours</span>' +
        '</button>';
      }).join('')
    : '<p style="font-size:13px;color:var(--text-light);margin:0">' +
      'Aucun enquêteur en service. Vérifiez le registre des agents.</p>';
}

/* Sélection : le clic marque l'enquêteur, il n'affecte rien. */
function choisirPourAffectation(nom) {
  enqueteurPourAffectation = nom;
  document.querySelectorAll('#enqueteur-list .choix-agent').forEach(function (b) {
    var estCelui = b.getAttribute('data-agent') === nom;
    b.classList.toggle('choisi', estCelui);
    b.setAttribute('aria-pressed', estCelui ? 'true' : 'false');
  });
  var err = document.getElementById('err-affectation');
  if (err) err.textContent = '';
  majBoutonAffectation();
}

function majBoutonAffectation() {
  var b = document.getElementById('btn-affecter');
  if (!b) return;
  b.disabled = !enqueteurPourAffectation;
  b.textContent = enqueteurPourAffectation
    ? 'Affecter à ' + enqueteurPourAffectation : 'Affecter';
}

/* Étape de confirmation : saisir un enquêteur l'engage sur un dossier et
   le fait savoir au plaignant. */
function demanderAffectation() {
  var d = dossierParId(dossierAAffecter);
  if (!d) return;

  if (!enqueteurPourAffectation) {
    var err = document.getElementById('err-affectation');
    if (err) err.textContent = 'Choisissez l\'enquêteur à qui confier le dossier.';
    return;
  }

  var priorite = (document.getElementById('affect-priorite') || {}).value || 'NORMALE';
  var zone = document.getElementById('affectation-recapitulatif');
  if (zone) {
    zone.innerHTML =
      '<p style="font-size:14px;line-height:1.7;margin:0 0 16px">' +
        'Le dossier <strong>' + ech(d.id) + '</strong> — ' + ech(d.type) + ', ' +
        ech(d.plaignant) + ' — va être confié à <strong>' +
        ech(enqueteurPourAffectation) + '</strong>.' +
      '</p>' +
      '<div class="recap">' +
        '<div class="recap-ligne"><span>Priorité retenue</span><strong>' +
          ech(priorite.charAt(0) + priorite.slice(1).toLowerCase()) + '</strong></div>' +
        '<div class="recap-ligne"><span>Charge après affectation</span><strong>' +
          ech(enqueteurPourAffectation) + ' : ' +
          (chargeDe(enqueteurPourAffectation) + 1) + ' dossier(s)</strong></div>' +
      '</div>' +
      '<p style="font-size:12.5px;color:var(--text-light);margin:14px 0 0">' +
        'L\'affectation est consignée au dossier et le plaignant en est informé ' +
        'dans son espace de suivi.</p>';
  }
  openModal('modal-affectation-confirmation');
}

(function initCommissairePage() {
  remplirListeEnqueteurs();
  remplirFiltreEnqueteurs();
  remplirFiltreAuteurs();
  bornerChampsDate();
  rendreAgents();
  showPage('page-dashboard');
  initDashboard();
  rafraichirTableauDeBord();
  majStatistiques();
  rendreAudit();
})();
