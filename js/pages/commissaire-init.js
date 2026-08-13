/* ============================================================
   Espace Commissaire — fonctions page et initialisation
   ============================================================ */

function navAgent(el, page) {
  document.querySelectorAll('.sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  showPage(page);
  if (page === 'page-dashboard') rafraichirTableauDeBord();
  if (page === 'page-dossiers')  initDashboard();
  if (page === 'page-stats')     majStatistiques();
}

/* Une affectation change les quatre indicateurs, la liste d'attente et la
   charge des enquêteurs : on redessine l'ensemble plutôt que de tenir à
   jour chaque morceau séparément. */
function rafraichirTableauDeBord() {
  majKPICommissaire();
  majAffectations();
  majChargeEnqueteurs();
  drawMiniChart();
}

var dossierAAffecter = null;

function affecterDossier(id) {
  dossierAAffecter = id;
  var d = (typeof DOSSIERS !== 'undefined') ? DOSSIERS.find(function (x) { return x.id === id; }) : null;
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

  openModal('modal-affectation');
}

function confirmAffectation(enqueteur) {
  var d = (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.find(function (x) { return x.id === dossierAAffecter; }) : null;
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

  closeModal('modal-affectation');
  toast('Dossier affecté à ' + enqueteur + ' (priorité ' + priorite.toLowerCase() + ')', 'success');
  initDashboard();
  rafraichirTableauDeBord();
}

/* Le filtre comparait la valeur brute de l'option (EN_INSTRUCTION) au texte
   affiche dans la ligne (« En instruction ») : aucune correspondance, donc
   toute selection vidait le tableau. On refiltre les donnees, pas le DOM. */
function filterDossiers(val) {
  if (typeof DOSSIERS === 'undefined' || typeof initDashboard !== 'function') return;
  initDashboard(val ? DOSSIERS.filter(function (d) { return d.statut === val; }) : null);
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

  var attente   = nonAffectes().length;
  var instruits = DOSSIERS.filter(function (d) { return d.statut === 'EN_INSTRUCTION'; }).length;
  var clos      = DOSSIERS.filter(function (d) {
    return d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
  }).length;
  var actifs    = DOSSIERS.filter(function (d) {
    return d.statut !== 'CLOTURE' && d.statut !== 'TRANSMIS';
  }).length;

  var cases = [
    ['urgent',   attente,   'En attente d\'affectation'],
    ['en-cours', instruits, 'En enquête'],
    ['ok',       clos,      'Dossiers achevés'],
    ['total',    actifs,    'Dossiers actifs']
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

  corps.innerHTML = liste.map(function (d) {
    var cls = d.score >= 80 ? 'high' : d.score >= 50 ? 'med' : 'low';
    var teinte = d.score >= 50 ? '' : ';color:var(--red)';
    var badge = d.priorite === 'URGENTE' ? 'badge-red'
              : d.priorite === 'HAUTE'   ? 'badge-orange' : 'badge-blue';
    return '<tr>' +
      '<td><strong>' + ech(d.id) + '</strong></td>' +
      '<td>' + ech(d.plaignant) + '</td>' +
      '<td><span class="badge ' + badge + '">' + ech(d.type) + '</span></td>' +
      '<td><div style="display:flex;align-items:center;gap:6px">' +
        '<div class="score-bar-wrap" style="width:70px">' +
          '<div class="score-bar ' + cls + '" style="width:' + d.score + '%"></div></div>' +
        '<span style="font-size:12px' + teinte + '">' + d.score + '%</span>' +
      '</div></td>' +
      '<td><button class="btn btn-primary btn-sm" onclick="affecterDossier(\'' + d.id + '\')">' +
        'Affecter</button></td>' +
    '</tr>';
  }).join('');
}

function majChargeEnqueteurs() {
  var zone = document.getElementById('charge-enqueteurs');
  if (!zone) return;
  zone.innerHTML = ENQUETEURS.map(function (e, i) {
    var n = chargeDe(e.nom);
    var couleur = n >= 5 ? 'badge-red' : n >= 3 ? 'badge-orange' : 'badge-green';
    var bord = i < ENQUETEURS.length - 1 ? ';border-bottom:1px solid var(--gray-2)' : '';
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
  if (!cartes || typeof DOSSIERS === 'undefined') return;

  var recues = DOSSIERS.length;
  var clos = DOSSIERS.filter(function (d) {
    return d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
  });
  var score = Math.round(DOSSIERS.reduce(function (s, d) { return s + (d.score || 0); }, 0) / (recues || 1));

  /* Délai réel : du dépôt au dernier évènement, sur les dossiers achevés.
     Aucun dossier clos ne permettrait de le calculer — on le dit alors. */
  var delais = clos.map(function (d) {
    var h = (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[d.id]) || [];
    if (!h.length) return null;
    var t = h.map(instantEvt).filter(function (x) { return !isNaN(x); });
    if (!t.length) return null;
    return (Math.max.apply(null, t) - Math.min.apply(null, t)) / 86400000;
  }).filter(function (x) { return x !== null; });

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
   TRANSFERT D'UN DOSSIER  (§7.4)

   « En cas d'indisponibilite de l'enqueteur en charge, le dossier est
   transfere a un autre enqueteur » — compte rendu d'entretien. La
   decision revient au commissaire : l'enqueteur ne se dessaisit pas
   lui-meme de son dossier.
   ============================================================ */

var ENQUETEURS = [
  { nom: 'Insp. KANA', specialite: 'Escroquerie, Fraude' },
  { nom: 'Insp. BIYA', specialite: 'Généraliste' }
];

var dossierATransferer = null;

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

  /* On ne propose pas de transferer un dossier a celui qui l'a deja. */
  var autres = ENQUETEURS.filter(function (e) { return e.nom !== d.enqueteur; });
  document.getElementById('transfert-liste').innerHTML = autres.length
    ? autres.map(function (e) {
        return '<button type="button" class="choix-agent" onclick="confirmerTransfert(\'' + e.nom + '\')">' +
          '<span class="choix-agent-nom">' + e.nom + '</span>' +
          '<span class="choix-agent-info">' + e.specialite + ' — ' + chargeDe(e.nom) + ' dossier(s)</span>' +
        '</button>';
      }).join('')
    : '<p style="font-size:13px;color:var(--text-light);margin:0">' +
      'Aucun autre enquêteur disponible dans ce commissariat.</p>';

  var err = document.getElementById('err-transfert');
  if (err) err.textContent = '';
  openModal('modal-transfert');
}

function confirmerTransfert(nouvelEnqueteur) {
  var d = (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.find(function (x) { return x.id === dossierATransferer; }) : null;
  if (!d) return;

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

  closeModal('modal-transfert');
  toast('Dossier ' + d.id + ' transféré à ' + nouvelEnqueteur, 'success');
  initDashboard();
  rafraichirTableauDeBord();
}

/* Liste des enqueteurs a qui affecter un dossier. Elle annoncait
   « Insp. NGUEMO — 5 dossiers » en dur : NGUEMO est le commissaire, et
   les charges ne correspondaient a rien. Elles se calculent. */
function remplirListeEnqueteurs() {
  var list = document.getElementById('enqueteur-list');
  if (!list) return;
  list.innerHTML = ENQUETEURS.map(function (e) {
    return '<button type="button" class="choix-agent" onclick="confirmAffectation(\'' + e.nom + '\')">' +
      '<span class="choix-agent-nom">' + e.nom + '</span>' +
      '<span class="choix-agent-info">' + e.specialite + ' — ' + chargeDe(e.nom) + ' dossier(s) en cours</span>' +
    '</button>';
  }).join('');
}

(function initCommissairePage() {
  remplirListeEnqueteurs();
  showPage('page-dashboard');
  initDashboard();
  rafraichirTableauDeBord();
  majStatistiques();
  setTimeout(function() {
    var el = document.getElementById('pie-chart');
    if (el) el.innerHTML = buildPieChart();
  }, 50);
})();
