/* ============================================================
   Espace Enqueteur — fonctions page et initialisation
   ============================================================ */

var mesDossiers = [
  { id: '2026-00451', plaignant: 'Jean MBIDA', type: 'Escroquerie', date: '15/05/2026', prio: 'haute', score: 78, statut: 'EN_INSTRUCTION' },
  { id: '2026-00312', plaignant: 'Marie ESSOMBA', type: 'Harcelement', date: '10/05/2026', prio: 'normale', score: 65, statut: 'AUDITION' },
  { id: '2026-00278', plaignant: 'Paul NKOA', type: 'Fraude', date: '02/05/2026', prio: 'basse', score: 88, statut: 'DECISION' },
];

var statusLabels = {
  EN_INSTRUCTION: '<span class="badge badge-orange">En instruction</span>',
  AUDITION: '<span class="badge badge-blue">Audition fixee</span>',
  DECISION: '<span class="badge badge-green">Decision en cours</span>',
  CLOTURE: '<span class="badge badge-green">Cloture</span>',
};

function renderMesDossiers(list) {
  var tbody = document.getElementById('mes-dossiers-tbody');
  if (!tbody) return;
  tbody.innerHTML = (list || mesDossiers).map(function(d) {
    var score_color = d.score >= 70 ? 'var(--green-lt)' : d.score >= 50 ? 'var(--orange)' : 'var(--red)';
    return '<tr>' +
      '<td><strong>' + d.id + '</strong></td>' +
      '<td>' + d.plaignant + '</td>' +
      '<td>' + d.type + '</td>' +
      '<td>' + d.date + '</td>' +
      '<td><span class="priority-dot ' + d.prio + '"></span>' + d.prio.charAt(0).toUpperCase() + d.prio.slice(1) + '</td>' +
      '<td><span style="font-weight:700;color:' + score_color + '">' + d.score + '%</span></td>' +
      '<td>' + (statusLabels[d.statut] || d.statut) + '</td>' +
      '<td><button class="btn btn-primary btn-sm" onclick="ouvrirDossier(\'' + d.id + '\')">Instruire</button></td>' +
    '</tr>';
  }).join('');
}

function filterMesDossiers(val) {
  renderMesDossiers(val ? mesDossiers.filter(function(d) { return d.statut === val; }) : mesDossiers);
}

function ouvrirDossier(id) {
  var d = mesDossiers.find(function(x) { return x.id === id; });
  if (!d) return;
  document.getElementById('modal-dossier-title').textContent = 'Dossier ' + d.id + ' - ' + d.plaignant;
  document.getElementById('modal-dossier-body').innerHTML =
    '<div style="font-size:14px;line-height:2.1">' +
    '<div><strong>Type :</strong> ' + d.type + '</div>' +
    '<div><strong>Date depot :</strong> ' + d.date + '</div>' +
    '<div><strong>Priorite :</strong> ' + d.prio + '</div>' +
    '<div><strong>Score IA :</strong> ' + d.score + '%</div>' +
    '<div><strong>Statut :</strong> ' + d.statut + '</div>' +
    '</div>' +
    '<div class="divider"></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
    '<button class="btn btn-primary btn-sm" onclick="navEnqTo(\'page-pv\')">Voir le PV</button>' +
    '<button class="btn btn-outline btn-sm" onclick="navEnqTo(\'page-convocations\')">Emettre une convocation</button>' +
    '<button class="btn btn-success btn-sm" onclick="cloturerDossier(\'' + id + '\')">Cloturer le dossier</button>' +
    '</div>';
  openModal('modal-dossier');
}

function navEnqTo(page) {
  closeModal('modal-dossier');
  var el = document.querySelector('.sidebar-item[data-page="' + page + '"]');
  if (el) navEnq(el, page);
}

function cloturerDossier(id) {
  closeModal('modal-dossier');
  toast('Dossier ' + id + ' cloture');
  mesDossiers = mesDossiers.filter(function(d) { return d.id !== id; });
  renderMesDossiers(mesDossiers);
}

function navEnq(el, page) {
  document.querySelectorAll('.sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  showPage(page);
}

function signPV() {
  var badge = document.getElementById('pv-ia-badge');
  if (badge) badge.style.display = '';
  var sb = document.getElementById('sig-box');
  if (sb) sb.style.background = '#dcfce7';
  toast('PV signe electroniquement avec horodatage');
}

(function initEnqueteurPage() {
  showPage('page-dashboard');
  renderMesDossiers(mesDossiers);
})();
