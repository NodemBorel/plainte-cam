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

function affecterDossier(id) {
  document.querySelector('#modal-affectation .card-title').textContent = 'Affecter le dossier ' + id;
  openModal('modal-affectation');
}

function confirmAffectation(enqueteur) {
  closeModal('modal-affectation');
  toast('Dossier affecte a ' + enqueteur);
  initDashboard();
}

function filterDossiers(val) {
  var rows = document.querySelectorAll('#dossiers-tbody tr');
  rows.forEach(function(r) {
    r.style.display = (!val || r.textContent.includes(val)) ? '' : 'none';
  });
}

function buildPieChart() {
  var data = [
    { label: 'Vol simple', pct: 38, color: '#0d2a6e' },
    { label: 'Escroquerie', pct: 24, color: '#e67e22' },
    { label: 'Agression', pct: 17, color: '#c0392b' },
    { label: 'Harcelement', pct: 13, color: '#8e44ad' },
    { label: 'Autre', pct: 8, color: '#7f8c8d' },
  ];
  return data.map(function(d) {
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
      '<div style="width:14px;height:14px;border-radius:3px;background:' + d.color + ';flex-shrink:0"></div>' +
      '<div style="flex:1;font-size:13px">' + d.label + '</div>' +
      '<div style="width:120px;background:var(--gray-2);border-radius:20px;height:10px">' +
        '<div style="width:' + d.pct + '%;height:10px;background:' + d.color + ';border-radius:20px"></div>' +
      '</div>' +
      '<div style="font-size:13px;font-weight:600;width:32px;text-align:right">' + d.pct + '%</div>' +
    '</div>';
  }).join('');
}

(function initCommissairePage() {
  var agents = [
    { name: 'Insp. NGUEMO', spec: 'Vol, Agression', load: '5 dossiers', star: true },
    { name: 'Insp. KANA', spec: 'Escroquerie, Fraude', load: '3 dossiers', star: false },
    { name: 'Insp. BIYA', spec: 'Generaliste', load: '2 dossiers', star: false },
  ];
  var list = document.getElementById('enqueteur-list');
  if (list) {
    list.innerHTML = agents.map(function(a) {
      return '<div onclick="confirmAffectation(\'' + a.name + '\')"' +
        ' style="padding:12px 16px;border:1.5px solid var(--gray-2);border-radius:var(--radius-sm);cursor:pointer;margin-bottom:10px;font-size:14px"' +
        ' onmouseover="this.style.borderColor=\'var(--primary)\'"' +
        ' onmouseout="this.style.borderColor=\'var(--gray-2)\'">' +
        '<strong>' + a.name + '</strong>' + (a.star ? ' (recommande)' : '') + '<br>' +
        '<span class="text-muted">' + a.spec + ' - ' + a.load + '</span>' +
      '</div>';
    }).join('');
  }

  showPage('page-dashboard');
  initDashboard();
  drawMiniChart();
  setTimeout(function() {
    var el = document.getElementById('pie-chart');
    if (el) el.innerHTML = buildPieChart();
  }, 50);
})();
