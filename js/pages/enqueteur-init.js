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
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-light);padding:22px">' +
      'Aucun dossier ne correspond à ce filtre.</td></tr>';
    return;
  }

  tbody.innerHTML = lignes.map(function (d) {
    var prio = (d.priorite || 'NORMALE').toLowerCase();
    /* Memes seuils que l'espace commissaire : un score de 75 ne peut pas
       etre vert d'un cote et orange de l'autre. */
    var couleurScore = d.score >= 80 ? 'var(--green-lt)' : d.score >= 50 ? 'var(--orange-txt)' : 'var(--red-txt)';
    return '<tr>' +
      '<td><strong>' + d.id + '</strong></td>' +
      '<td>' + d.plaignant + '</td>' +
      '<td>' + d.type + '</td>' +
      '<td>' + d.date + '</td>' +
      '<td><span class="priority-dot ' + prio + '"></span>' + prio.charAt(0).toUpperCase() + prio.slice(1) + '</td>' +
      '<td><span style="font-weight:700;color:' + couleurScore + '">' + d.score + '%</span></td>' +
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

function ouvrirDossier(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (!d) return;
  dossierOuvert = id;

  document.getElementById('modal-dossier-title').textContent = 'Dossier ' + d.id + ' — ' + d.plaignant;
  document.getElementById('modal-dossier-body').innerHTML =
    '<div class="form-row" style="font-size:14px">' +
      '<div><strong>Type :</strong> ' + d.type + '</div>' +
      '<div><strong>Date de dépôt :</strong> ' + d.date + '</div>' +
      '<div><strong>Priorité :</strong> ' + (d.priorite || 'NORMALE') + '</div>' +
      '<div><strong>Score IA :</strong> ' + d.score + ' %</div>' +
    '</div>' +
    '<div style="margin-top:10px;font-size:14px"><strong>Statut :</strong> ' + badgeStatut(d.statut) + '</div>' +
    '<div style="margin-top:10px;font-size:14px"><strong>Lieu :</strong> ' + (d.lieu || '—') + '</div>' +

    '<div class="divider"></div>' +
    '<div class="card-title" style="margin-bottom:8px">Déclaration du plaignant</div>' +
    '<div style="background:var(--gray-1);border-left:3px solid var(--primary);padding:12px 14px;' +
      'border-radius:var(--radius-sm);font-size:13.5px;line-height:1.7;font-style:italic">' +
      (d.declaration || 'Aucune déclaration enregistrée.') +
    '</div>' +

    '<div class="divider"></div>' +
    '<div class="card-title" style="margin-bottom:10px">Suivi du dossier</div>' +
    '<div id="fil-dossier">' + renderFilDossier(id) + '</div>' +

    blocRedaction(id) +

    '<div class="divider"></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-sm" onclick="navEnqTo(\'page-pv\')">Voir le PV</button>' +
      '<button class="btn btn-outline btn-sm" onclick="navEnqTo(\'page-convocations\')">Émettre une convocation</button>' +
      (d.statut !== 'CLOTURE'
        ? '<button class="btn btn-success btn-sm" onclick="cloturerDossier(\'' + id + '\')">Clôturer le dossier</button>'
        : '') +
    '</div>';

  openModal('modal-dossier');
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
  closeModal('modal-dossier');
  var el = document.querySelector('.sidebar-item[data-page="' + page + '"]');
  if (el) navEnq(el, page);
}

function cloturerDossier(id) {
  var d = mesDossiersActifs().find(function (x) { return x.id === id; });
  if (d) {
    d.statut = 'CLOTURE';
    if (typeof HISTORIQUE !== 'undefined' && HISTORIQUE[id]) {
      var m = new Date();
      var dd = function (n) { return String(n).padStart(2, '0'); };
      HISTORIQUE[id].push({
        type: 'statut',
        date: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
        heure: dd(m.getHours()) + 'h' + dd(m.getMinutes()),
        libelle: 'Dossier clôturé',
        detail: 'Clôturé par ' + ENQUETEUR_COURANT
      });
    }
  }
  closeModal('modal-dossier');
  toast('Dossier ' + id + ' clôturé', 'success');
  renderMesDossiers();
  majCompteurDossiers();
}

function navEnq(el, page) {
  document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
  el.classList.add('active');
  showPage(page);
}

function signPV() {
  var badge = document.getElementById('pv-ia-badge');
  if (badge) badge.style.display = '';
  var sb = document.getElementById('sig-box');
  if (sb) sb.style.background = 'rgba(20,94,46,.08)';
  toast('PV signé électroniquement avec horodatage', 'success');
}

/* Le compteur de la barre laterale ne suivait pas les cloture : le
   tableau tombait a deux lignes et le badge affichait toujours 3. */
function majCompteurDossiers() {
  var el = document.querySelector('.sidebar-item[data-page="page-dashboard"] .badge');
  if (!el) return;
  var n = mesDossiersActifs().filter(function (d) { return d.statut !== 'CLOTURE'; }).length;
  el.textContent = n;
  el.style.display = n ? '' : 'none';
}

(function initEnqueteurPage() {
  showPage('page-dashboard');
  renderMesDossiers();
  majCompteurDossiers();
})();
