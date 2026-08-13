/* ============================================================
   Espace Commissaire — fonctions page et initialisation
   ============================================================ */

function navAgent(el, page) {
  document.querySelectorAll('.sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  showPage(page);
  if (page === 'page-dashboard') drawMiniChart();
  if (page === 'page-dossiers') initDashboard();
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
}

/* Le filtre comparait la valeur brute de l'option (EN_INSTRUCTION) au texte
   affiche dans la ligne (« En instruction ») : aucune correspondance, donc
   toute selection vidait le tableau. On refiltre les donnees, pas le DOM. */
function filterDossiers(val) {
  if (typeof DOSSIERS === 'undefined' || typeof initDashboard !== 'function') return;
  initDashboard(val ? DOSSIERS.filter(function (d) { return d.statut === val; }) : null);
}

function buildPieChart() {
  /* Palette prise dans 01-tokens.css. Les valeurs precedentes
     (#0d2a6e, #e67e22, #c0392b, #8e44ad, #7f8c8d) etaient etrangeres a la
     charte, sur le seul graphique colore de l'application. */
  var data = [
    { label: 'Vol simple',   pct: 38, color: 'var(--primary)' },
    { label: 'Escroquerie',  pct: 24, color: 'var(--orange)' },
    { label: 'Agression',    pct: 17, color: 'var(--red)' },
    { label: 'Harcèlement',  pct: 13, color: 'var(--gold)' },
    { label: 'Autre',        pct:  8, color: 'var(--gray-3)' },
  ];
  return data.map(function(d) {
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
      '<div style="width:12px;height:12px;border-radius:var(--radius-sm);background:' + d.color + ';flex-shrink:0"></div>' +
      '<div style="flex:1;font-size:13px">' + d.label + '</div>' +
      '<div style="width:120px;background:var(--gray-2);border-radius:var(--radius-sm);height:8px;flex-shrink:0">' +
        '<div style="width:' + d.pct + '%;height:8px;background:' + d.color + ';border-radius:var(--radius-sm)"></div>' +
      '</div>' +
      '<div style="font-size:13px;font-weight:600;width:32px;text-align:right;font-variant-numeric:tabular-nums">' + d.pct + '%</div>' +
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
  drawMiniChart();
  setTimeout(function() {
    var el = document.getElementById('pie-chart');
    if (el) el.innerHTML = buildPieChart();
  }, 50);
})();
