/* ============================================================
   Utilitaires globaux : toast, modal, navigation sidebar
   ============================================================ */

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = '';
  document.querySelectorAll('.sidebar-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === id);
  });
}

function toast(msg, icon) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = icon
    ? `<span>${icon}</span><span>${msg}</span>`
    : `<span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 3200);
  setTimeout(() => c.removeChild(t), 3600);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
