/* ============================================================
   Espace Commissaire — tableau de bord, dossiers, PV
   ============================================================ */

/* ============================================================
   TABLEAU DES DOSSIERS : recherche, filtres, pagination

   Un seul état décrit ce que le tableau montre. Les trois mécanismes s'y
   composent : on cherche dans un statut filtré, on pagine le résultat, et
   changer un critère ramène à la première page — sinon on se retrouve
   page 3 d'une liste qui n'en compte plus qu'une.
   ============================================================ */
var vueDossiers = {
  recherche: '',
  statut: '',
  enqueteur: '',
  priorite: '',
  page: 1,
  parPage: 8
};

/* Texte cherché dans tout ce qui identifie un dossier. Les accents sont
   retirés des deux côtés : « Degradation » doit trouver « Dégradation ». */
function sansAccents(s) {
  return String(s == null ? '' : s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function correspond(d, terme) {
  if (!terme) return true;
  const foin = sansAccents([
    d.id, d.plaignant, d.type, d.lieu, d.enqueteur || '',
    d.statut, d.priorite, (d.prejudice && d.prejudice.montant) || ''
  ].join(' '));
  /* Plusieurs mots : tous doivent se retrouver, dans n'importe quel ordre. */
  return sansAccents(terme).split(/\s+/).filter(Boolean)
    .every(mot => foin.indexOf(mot) !== -1);
}

function dossiersFiltres() {
  if (typeof DOSSIERS === 'undefined') return [];
  const v = vueDossiers;
  return DOSSIERS.filter(d =>
    (!v.statut    || d.statut === v.statut) &&
    (!v.priorite  || d.priorite === v.priorite) &&
    (!v.enqueteur || (v.enqueteur === '__aucun' ? !d.enqueteur : d.enqueteur === v.enqueteur)) &&
    correspond(d, v.recherche)
  );
}

function chercherDossiers(terme) {
  vueDossiers.recherche = terme || '';
  vueDossiers.page = 1;
  initDashboard();
}

function filtrerDossiers() {
  const lu = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  vueDossiers.statut    = lu('filtre-statut');
  vueDossiers.enqueteur = lu('filtre-enqueteur');
  vueDossiers.priorite  = lu('filtre-priorite');
  vueDossiers.page = 1;
  initDashboard();
}

function reinitialiserFiltres() {
  vueDossiers.recherche = vueDossiers.statut = vueDossiers.enqueteur = vueDossiers.priorite = '';
  vueDossiers.page = 1;
  ['recherche-dossiers', 'filtre-statut', 'filtre-enqueteur', 'filtre-priorite']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  initDashboard();
}

function allerPageDossiers(n) {
  vueDossiers.page = n;
  initDashboard();
  /* Changer de page sans remonter laisse l'œil au bas d'un tableau qui a
     changé sous lui. */
  const t = document.getElementById('dossiers-tbody');
  if (t && t.scrollIntoView) t.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function initDashboard(liste) {
  const tbody = document.getElementById('dossiers-tbody');
  if (!tbody) return;

  /* `liste` reste accepté pour un appel direct ; sans elle, c'est l'état
     de la vue qui décide. */
  const filtres = liste || dossiersFiltres();
  const total = filtres.length;
  const pages = Math.max(1, Math.ceil(total / vueDossiers.parPage));
  if (vueDossiers.page > pages) vueDossiers.page = pages;
  const debut = (vueDossiers.page - 1) * vueDossiers.parPage;
  const lignes = liste || filtres.slice(debut, debut + vueDossiers.parPage);

  majBilanFiltres(total, debut, lignes.length);
  majPaginationDossiers(total, pages);

  if (!lignes.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-light);padding:26px">'
      + 'Aucun dossier ne correspond à cette recherche.'
      + '<br><button class="btn btn-ghost btn-sm" style="margin-top:12px" '
      + 'onclick="reinitialiserFiltres()">Réinitialiser les filtres</button></td></tr>';
    return;
  }
  tbody.innerHTML = lignes.map(d => {
    const [cls, lbl] = STATUT_LABELS[d.statut];
    const scoreClass = d.score >= 80 ? 'high' : d.score >= 50 ? 'med' : 'low';
    const prioColor = d.priorite === 'URGENTE' ? 'red' : d.priorite === 'HAUTE' ? 'orange' : 'gray';
    return `<tr onclick="consulterDossier('${d.id}')" style="cursor:pointer">
      <td><strong>${d.id}</strong></td>
      <td>${d.plaignant}</td>
      <td>${d.type}</td>
      <td>${d.date}</td>
      <td><span class="badge badge-${prioColor}">${d.priorite}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="score-bar-wrap" style="width:80px">
            <div class="score-bar ${scoreClass}" style="width:${d.score}%"></div>
          </div>
          <span style="font-size:12px">${d.score}%</span>
        </div>
      </td>
      <td><span class="badge ${cls}">${lbl}</span></td>
      <td>${d.enqueteur || '<span class="text-muted">Non affecte</span>'}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();consulterDossier('${d.id}')">Ouvrir</button>
          ${d.enqueteur
            ? `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation();ouvrirTransfert('${d.id}')">Transférer</button>`
            : `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation();affecterDossier('${d.id}')">Affecter</button>`}
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* Combien de dossiers on regarde, et sur quel total : sans ce repère, un
   filtre actif ne se distingue pas d'un commissariat vide. */
function majBilanFiltres(total, debut, affiches) {
  const el = document.getElementById('filtres-bilan');
  if (!el) return;
  const v = vueDossiers;
  const tout = (typeof DOSSIERS !== 'undefined') ? DOSSIERS.length : 0;
  const actifs = [
    v.recherche && `« ${ech(v.recherche)} »`,
    v.statut    && (STATUT_LABELS[v.statut] ? STATUT_LABELS[v.statut][1] : v.statut),
    v.enqueteur && (v.enqueteur === '__aucun' ? 'non affectés' : v.enqueteur),
    v.priorite  && ('priorité ' + v.priorite.toLowerCase())
  ].filter(Boolean);

  if (!total) {
    el.innerHTML = '<span class="filtres-vide">Aucun résultat' +
      (actifs.length ? ' pour ' + actifs.join(' · ') : '') + '</span>';
    return;
  }
  el.innerHTML =
    '<span><strong>' + (debut + 1) + '–' + (debut + affiches) + '</strong> sur ' +
      total + ' dossier' + (total > 1 ? 's' : '') +
      (total < tout ? ' <span class="text-muted">(' + tout + ' au total)</span>' : '') +
    '</span>' +
    (actifs.length ? '<span class="filtres-actifs">' + actifs.join(' · ') + '</span>' : '');
}

/* Sélecteur du nombre de lignes, partagé par le tableau des dossiers et
   le journal d'audit. Il vit ici, dans le fichier chargé en premier :
   défini dans l'autre, il n'aurait existé qu'après son premier usage. */
function selecteurTaille(id, valeur, action) {
  return '<label class="par-page" for="' + id + '">Lignes' +
    '<select class="form-control" id="' + id + '" onchange="' + action + '(this.value)">' +
      [10, 15, 25, 50, 100].map(function (n) {
        return '<option value="' + n + '"' + (n === valeur ? ' selected' : '') + '>' + n + '</option>';
      }).join('') +
    '</select></label>';
}

/* Changer le nombre de lignes ramène en première page : rester « page 7 »
   d'une liste qui n'en compte plus que trois n'a pas de sens. */
function changerTaillePageDossiers(n) {
  vueDossiers.parPage = parseInt(n, 10) || 8;
  vueDossiers.page = 1;
  initDashboard();
}

function majPaginationDossiers(total, pages) {
  const el = document.getElementById('pagination-dossiers');
  if (!el) return;
  const taille = selecteurTaille('taille-dossiers', vueDossiers.parPage,
                                 'changerTaillePageDossiers');

  /* Une seule page : le sélecteur reste — il sert à en obtenir plusieurs
     ou à tout afficher d'un coup. Les flèches, elles, disparaissent. */
  if (pages <= 1) {
    el.innerHTML = total
      ? '<nav class="pagination">' + taille +
        '<span class="text-muted" style="font-size:12.5px">' +
          total + ' dossier' + (total > 1 ? 's' : '') + ' — page unique</span></nav>'
      : '';
    return;
  }

  const p = vueDossiers.page;
  const bouton = (n, libelle, dispo, courante) =>
    '<button type="button" class="page-btn' + (courante ? ' courante' : '') + '"' +
      (dispo ? ' onclick="allerPageDossiers(' + n + ')"' : ' disabled') +
      (courante ? ' aria-current="page"' : '') +
    '>' + libelle + '</button>';

  /* Fenêtre glissante autour de la page courante : au-delà d'une dizaine
     de pages, toutes les afficher déborderait. */
  const nums = [];
  const de = Math.max(1, Math.min(p - 2, pages - 4));
  const a  = Math.min(pages, Math.max(p + 2, 5));
  if (de > 1) nums.push(bouton(1, '1', true, false), '<span class="page-ellipse">…</span>');
  for (let i = de; i <= a; i++) nums.push(bouton(i, String(i), true, i === p));
  if (a < pages) nums.push('<span class="page-ellipse">…</span>', bouton(pages, String(pages), true, false));

  el.innerHTML = '<nav class="pagination" aria-label="Pages de résultats">' +
    taille +
    '<span class="pagination-nav">' +
      bouton(p - 1, 'Précédent', p > 1, false) +
      '<span class="pagination-pages">' + nums.join('') + '</span>' +
      bouton(p + 1, 'Suivant', p < pages, false) +
    '</span>' +
    '<span class="pagination-etat">Page ' + p + ' sur ' + pages + '</span>' +
  '</nav>';
}


/* Ouvrir un dossier depuis le tableau ou le journal : c'est la vue
   complète de l'enquêteur qui s'affiche, en lecture seule. La fiche
   résumée en fenêtre n'en montrait qu'une partie et dupliquait un travail
   déjà fait ailleurs. */
function consulterDossier(id) {
  if (typeof MODE_CONSULTATION !== 'undefined') MODE_CONSULTATION = true;
  /* Le commissaire vient voir où en est le dossier, non lire la plainte :
     on l'ouvre sur la progression, qui porte aussi le retour d'étape. */
  if (typeof ongletDossier !== 'undefined') ongletDossier = 'progression';
  if (typeof ouvrirDossier === 'function') ouvrirDossier(id);
}

/* Ouvre le journal d'audit prérempli sur ce dossier. */
function voirJournalDossier(id) {
  const champ = document.getElementById('recherche-audit');
  if (champ) champ.value = id;
  chercherAudit(id);
  navAgent(null, 'page-audit');
}

/* Dépôts des quatorze derniers jours, comptés sur les dossiers réels.
   Le graphique traçait [8,12,6,15,…] : des barres inventées, sans rapport
   avec le commissariat, sur une carte qui annonce « plaintes reçues ».
   Le dernier jour représenté est celui du dépôt le plus récent — le jeu
   de données est daté, et se caler sur la date du jour donnerait un
   graphique vide. */
function depotsRecents(jours) {
  const n = jours || 14;
  const vide = new Array(n).fill(0);
  if (typeof DOSSIERS === 'undefined' || !DOSSIERS.length) return { data: vide, fin: null };

  const jour = (d) => {
    const [j, m, a] = String(d.date || '').split('/').map(Number);
    return (a && m && j) ? new Date(a, m - 1, j).getTime() : NaN;
  };
  const dates = DOSSIERS.map(jour).filter((t) => !isNaN(t));
  if (!dates.length) return { data: vide, fin: null };

  const fin = Math.max(...dates);
  const JOUR = 86400000;
  const data = vide.slice();
  dates.forEach((t) => {
    const recul = Math.round((fin - t) / JOUR);
    if (recul >= 0 && recul < n) data[n - 1 - recul]++;
  });
  return { data, fin: new Date(fin) };
}

function drawMiniChart() {
  const c = document.getElementById('chart-plaintes');
  if (!c) return;
  const ctx = c.getContext('2d');
  const recents = depotsRecents(14);
  const data = recents.data;
  /* Sans dépôt sur la période, toutes les barres valent zéro : diviser
     par ce maximum donnerait des NaN et un graphique vide sans raison. */
  const max = Math.max(1, ...data);

  const legende = document.getElementById('chart-legende');
  if (legende) {
    const total = data.reduce((a, b) => a + b, 0);
    const dernier = data[data.length - 1];
    legende.textContent = recents.fin
      ? total + ' dépôt' + (total > 1 ? 's' : '') + ' sur la période — ' +
        dernier + ' le ' + recents.fin.toLocaleDateString('fr-FR')
      : 'Aucun dépôt enregistré';
  }

  /* Le canvas etait fige a 800px de large dans un conteneur plus etroit :
     il etait tout simplement coupe sur mobile. On le redimensionne sur la
     largeur reellement disponible, et on tient compte de la densite d'ecran
     pour eviter un trace flou sur les affichages haute resolution. */
  const dispo = c.parentNode ? c.parentNode.clientWidth : 800;
  const dpr = window.devicePixelRatio || 1;
  const W = Math.max(260, dispo);
  const H = 160;
  c.style.width = '100%';
  c.style.height = H + 'px';
  c.width  = Math.round(W * dpr);
  c.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /* Couleurs lues sur la charte au lieu d'etre dupliquees en dur. */
  const styles = getComputedStyle(document.documentElement);
  const cOr    = (styles.getPropertyValue('--gold') || '#c98b00').trim();
  const cMarine= (styles.getPropertyValue('--primary') || '#0b1e45').trim();
  const cGrille= (styles.getPropertyValue('--gray-2') || '#e0ddd8').trim();

  const pad = 20;
  const espace = W > 480 ? 4 : 2;
  const barW = Math.max(3, (W - pad * 2) / data.length - espace);

  ctx.clearRect(0, 0, W, H);

  /* Ligne de base, pour que les barres reposent sur quelque chose. */
  ctx.strokeStyle = cGrille;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, H - pad + .5);
  ctx.lineTo(W - pad, H - pad + .5);
  ctx.stroke();

  data.forEach((v, i) => {
    const x = pad + i * (barW + espace);
    const bh = (v / max) * (H - pad * 2);
    const y = H - pad - bh;
    ctx.fillStyle = i === data.length - 1 ? cOr : cMarine;
    ctx.beginPath();
    /* roundRect n'existe pas sur Firefox < 112 ni Safari < 16.4 : sans repli,
       l'exception laissait le graphique entierement vide, sans message. */
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, barW, bh, 3);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, barW, bh);
    }
  });
}

/* Le graphique n'etait pas retrace au redimensionnement. */
(function suivreRedimensionnement() {
  let t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      if (document.getElementById('chart-plaintes')) drawMiniChart();
    }, 160);
  });
})();
