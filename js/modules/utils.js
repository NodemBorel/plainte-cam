/* ============================================================
   Utilitaires globaux : navigation, tiroir mobile, toast, modales
   ============================================================ */

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = '';

  document.querySelectorAll('.sidebar-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === id);
  });

  /* La classe active de la navbar restait figee sur le premier lien : elle
     n'etait mise a jour que pour la barre laterale. Certains liens portent un
     data-page, d'autres n'ont que leur onclick — on lit les deux. */
  document.querySelectorAll('.navbar-links a').forEach(a => {
    let cible = a.dataset.page;
    if (!cible) {
      const m = (a.getAttribute('onclick') || '').match(/showPage\(\s*['"]([\w-]+)['"]/);
      cible = m ? m[1] : null;
    }
    if (cible) a.classList.toggle('active', cible === id);
  });

  /* Naviguer depuis le tiroir doit le refermer. */
  fermerTiroir();
  window.scrollTo(0, 0);
}

/* ── Tiroir lateral (≤ 860px) ───────────────────────────────── */
function basculerTiroir() {
  const sb = document.querySelector('.sidebar');
  if (!sb) return;
  sb.classList.contains('ouvert') ? fermerTiroir() : ouvrirTiroir();
}

function ouvrirTiroir() {
  const sb = document.querySelector('.sidebar');
  const voile = document.getElementById('sidebar-voile');
  const btn = document.querySelector('.nav-burger');
  if (!sb) return;
  sb.classList.add('ouvert');
  if (voile) voile.classList.add('ouvert');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  const premier = sb.querySelector('.sidebar-fermer, .sidebar-item');
  if (premier) premier.focus();
}

function fermerTiroir() {
  const sb = document.querySelector('.sidebar');
  const voile = document.getElementById('sidebar-voile');
  const btn = document.querySelector('.nav-burger');
  if (sb) sb.classList.remove('ouvert');
  if (voile) voile.classList.remove('ouvert');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* ── Messages de validation ──────────────────────────────────
   toast(message, type) ou type vaut 'success', 'error', 'info',
   'warning' — ou rien pour un message neutre.

   Le second parametre etait auparavant une icone, affichee telle quelle :
   les appels ecrits toast('...', 'success') affichaient donc le mot
   « success » a cote du message. Il porte desormais le sens, et la
   couleur en decoule.
   ─────────────────────────────────────────────────────────── */
const TOAST_TYPES = {
  success: { classe: 'toast-succes', role: 'status',
             chemin: '<circle cx="8" cy="8" r="5.75"/><path d="M5.5 8.25 7.25 10l3.25-4"/>' },
  error:   { classe: 'toast-erreur', role: 'alert',
             chemin: '<circle cx="8" cy="8" r="5.75"/><path d="M8 5v3.75M8 11.1v.15"/>' },
  warning: { classe: 'toast-alerte', role: 'alert',
             chemin: '<path d="M8 2.5 14.5 13.5h-13z"/><path d="M8 6.75v3M8 11.6v.15"/>' },
  info:    { classe: 'toast-info', role: 'status',
             chemin: '<circle cx="8" cy="8" r="5.75"/><path d="M8 7.5v3.25M8 5.1v.15"/>' }
};

function toast(msg, type) {
  const c = document.getElementById('toast-container');
  if (!c) return;

  /* Tolerance : d'anciens appels passent une chaine vide. */
  const t = TOAST_TYPES[type] || null;

  const el = document.createElement('div');
  el.className = 'toast' + (t ? ' ' + t.classe : ' toast-info');
  el.setAttribute('role', t ? t.role : 'status');

  if (t) {
    const svg = '<span class="toast-icone"><svg width="16" height="16" viewBox="0 0 16 16"'
      + ' fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"'
      + ' stroke-linejoin="round" aria-hidden="true">' + t.chemin + '</svg></span>';
    el.innerHTML = svg + '<span class="toast-txt"></span>';
  } else {
    el.innerHTML = '<span class="toast-txt"></span>';
  }
  /* textContent : un message peut contenir des donnees saisies par l'usager. */
  el.querySelector('.toast-txt').textContent = msg;

  c.appendChild(el);
  const duree = String(msg).length > 70 ? 5200 : 3400;
  setTimeout(() => { el.style.opacity = '0'; }, duree);
  setTimeout(() => { if (el.parentNode === c) c.removeChild(el); }, duree + 400);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* Echap ferme le tiroir, puis la modale ouverte. */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const sb = document.querySelector('.sidebar.ouvert');
  if (sb) { fermerTiroir(); return; }
  const modale = document.querySelector('.modal.open, .modal-overlay.open');
  if (modale && modale.id) closeModal(modale.id);
});

/* Repasser en grand ecran doit reinitialiser l'etat du tiroir, sinon la
   barre laterale reste marquee « ouvert » alors qu'elle est de nouveau fixe. */
window.addEventListener('resize', function () {
  if (window.innerWidth > 860) fermerTiroir();
});
