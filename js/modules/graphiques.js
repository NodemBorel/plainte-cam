/* ============================================================
   GRAPHIQUES — Chart.js

   Les tracés étaient faits à la main au canvas et en barres CSS. Chart.js
   apporte ce qu'on ne réécrit pas raisonnablement : axes multiples,
   info-bulles au survol, légendes cliquables, redimensionnement, et un
   rendu net sur écran haute densité.

   La bibliothèque est embarquée dans js/vendor/ plutôt que chargée d'un
   CDN : un commissariat ne peut pas supposer sa connexion, et une
   soutenance encore moins. C'est déjà ce que fait html2pdf.

   Si elle manque malgré tout, `chartjsPresent()` le dit et l'appelant
   retombe sur les barres en HTML — un graphique absent vaut mieux qu'une
   page cassée.
   ============================================================ */

function chartjsPresent() {
  return typeof Chart !== 'undefined' && typeof Chart.register === 'function';
}

/* Les couleurs viennent de la charte, lues sur le document : elles ne
   sont pas dupliquées ici, où elles divergeraient. */
function teinte(nom, repli) {
  if (typeof getComputedStyle !== 'function' || typeof document === 'undefined') return repli;
  var v = '';
  try { v = (getComputedStyle(document.documentElement).getPropertyValue(nom) || '').trim(); }
  catch (e) { v = ''; }
  return v || repli;
}

function palette() {
  return {
    marine:  teinte('--primary', '#0b1e45'),
    marineC: teinte('--primary-lt', '#172d6a'),
    or:      teinte('--gold', '#c98b00'),
    orange:  teinte('--orange', '#c96a00'),
    rouge:   teinte('--red', '#b2281c'),
    vert:    teinte('--green-lt', '#145e2e'),
    gris:    teinte('--gray-3', '#b8b2aa'),
    grille:  teinte('--gray-2', '#e0ddd8'),
    surface: teinte('--white', '#ffffff'),
    texte:   teinte('--text-light', '#6b6560')
  };
}

/* ── Rampe séquentielle des étapes ──────────────────────────
   Les six statuts d'un dossier ne sont pas six identités : ce sont les
   étapes d'une même procédure, dans l'ordre où on les traverse. Une
   couleur par étape — or, orange, rouge, vert — les traitait comme des
   catégories indépendantes, et le contrôle de palette le sanctionnait :
   or contre orange à ΔE 8 en vision normale, vert contre rouge à 2,8 en
   protanopie. Illisible, et faux sur le fond.

   Une seule teinte, du clair au foncé, dit ce que les couleurs ne
   disaient pas : plus la barre est sombre, plus le dossier est avancé.
   Clarté vérifiée décroissante et régulière (0,87 → 0,25).
   ─────────────────────────────────────────────────────────── */
var RAMPE_ETAPES = ['#ccd4e4', '#9fadc9', '#7286ab', '#48608d', '#28446f', '#0b1e45'];

/* Le mark d'une barre : arrondi du côté de la valeur, d'aplomb sur la
   ligne de base. Un arrondi aux quatre coins décolle la barre de son
   axe et fausse la lecture des petites valeurs. */
function boutArrondi(horizontal) {
  return horizontal
    ? { topLeft: 0, bottomLeft: 0, topRight: 4, bottomRight: 4 }
    : { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 };
}

/* Un graphique par emplacement. Redessiner sans détruire le précédent
   empile les instances sur le même canvas : la première continue de
   répondre au survol, et la mémoire ne se libère jamais. */
var GRAPHIQUES = {};

function detruireGraphique(id) {
  if (GRAPHIQUES[id]) {
    try { GRAPHIQUES[id].destroy(); } catch (e) { /* déjà détruit */ }
    delete GRAPHIQUES[id];
  }
}

function poserGraphique(id, config) {
  if (!chartjsPresent()) return null;
  var el = document.getElementById(id);
  if (!el || !el.getContext) return null;
  detruireGraphique(id);
  try {
    GRAPHIQUES[id] = new Chart(el.getContext('2d'), config);
  } catch (e) {
    return null;
  }
  return GRAPHIQUES[id];
}

/* Réglages communs : sans eux chaque graphique réinvente ses marges, ses
   polices et ses info-bulles, et l'ensemble paraît hétéroclite. */
function baseOptions(p) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: {
          boxWidth: 12, boxHeight: 12, usePointStyle: true, padding: 16,
          color: teinte('--text', '#241f1b'),
          font: { size: 12, family: 'inherit' }
        }
      },
      tooltip: {
        backgroundColor: p.marine,
        titleFont: { size: 12.5, family: 'inherit' },
        bodyFont:  { size: 12.5, family: 'inherit' },
        padding: 10, cornerRadius: 6, displayColors: true, boxPadding: 4
      }
    }
  };
}

function axeSimple(p, titre) {
  return {
    grid: { color: p.grille, drawBorder: false },
    ticks: { color: p.texte, font: { size: 11, family: 'inherit' }, precision: 0 },
    title: titre ? { display: true, text: titre, color: p.texte,
                     font: { size: 11, family: 'inherit' } } : { display: false }
  };
}

/* Écrit la valeur au bout des barres. Sans elle, il faut reporter la barre
   sur l'axe pour en deviner la hauteur — un détour qui rend abstrait un
   graphique qui ne porte que quelques nombres.

   Les étiquettes ne valent que parcimonieuses : au-delà d'une quinzaine de
   barres elles se chevauchent et cessent d'être lues. `seuil` borne leur
   nombre ; au-delà, seule la plus haute est nommée et l'axe reprend son
   rôle. Le texte porte l'encre, jamais la couleur de la série : un bleu
   clair est illisible sur fond blanc.
   ─────────────────────────────────────────────────────────── */
function etiquettesValeurs(seuil) {
  var limite = seuil || 15;
  return {
    id: 'etiquettesValeurs',
    afterDatasetsDraw: function (chart) {
      var ctx = chart.ctx;
      ctx.save();
      ctx.font = '700 11.5px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = teinte('--text', '#12110e');

      chart.data.datasets.forEach(function (ds, i) {
        var meta = chart.getDatasetMeta(i);
        if (meta.hidden) return;

        var valeurs = ds.data.filter(function (v) { return v; });
        var tropNombreuses = valeurs.length > limite;
        var sommet = valeurs.length ? Math.max.apply(null, valeurs) : 0;

        meta.data.forEach(function (barre, j) {
          var v = ds.data[j];
          if (v === null || v === undefined || v === 0) return;
          /* Trop de barres : on ne nomme que l'extrême, l'axe fait le reste. */
          if (tropNombreuses && v !== sommet) return;
          if (chart.options.indexAxis === 'y') {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(v), barre.x + 8, barre.y);
          } else {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(String(v), barre.x, barre.y - 6);
          }
        });
      });
      ctx.restore();
    }
  };
}

/* ── 1. Dépôts quotidiens ───────────────────────────────────
   Une barre par jour, le nombre écrit dessus. Rien d'autre.

   Ce graphique portait une seconde série — le cumul, en courbe, sur un
   axe de droite. Deux échelles pour répondre à « combien de plaintes
   avons-nous reçues ces jours-ci » : le lecteur devait comprendre quelle
   courbe se lisait sur quel axe avant d'apprendre quoi que ce soit. Et
   sur une période où les dépôts sont rares, le cumul n'était qu'un
   escalier qui monte — il ne disait rien que le total de l'en-tête ne
   dise mieux.
   ─────────────────────────────────────────────────────────── */
function graphiqueDepots(idCanvas, jours, etiquettes) {
  var p = palette();
  var dense = jours.filter(function (v) { return v; }).length > 15;
  var o = baseOptions(p);
  o.plugins.legend.display = false;
  o.interaction = { mode: 'nearest', intersect: false };
  o.plugins.tooltip.callbacks = {
    title: function (c) { return 'Le ' + c[0].label; },
    label: function (c) {
      return c.parsed.y === 0 ? ' Aucun dépôt'
        : ' ' + c.parsed.y + ' plainte' + (c.parsed.y > 1 ? 's' : '') + ' déposée' +
          (c.parsed.y > 1 ? 's' : '');
    }
  };

  return poserGraphique(idCanvas, {
    type: 'bar',
    data: {
      labels: etiquettes,
      datasets: [{ label: 'Dépôts', data: jours,
                   backgroundColor: p.marine, borderRadius: boutArrondi(false),
                   maxBarThickness: 24 }]
    },
    options: Object.assign({}, o, {
      layout: { padding: { top: 18 } },
      scales: {
        x: { grid: { display: false }, border: { display: false },
             ticks: { color: p.texte, font: { size: 11, family: 'inherit' },
                      maxRotation: 0, autoSkipPadding: 10 } },
        /* Sur une courte période le chiffre est sur la barre et l'axe ne
           sert plus. Sur trois mois les étiquettes se chevaucheraient :
           l'axe reprend alors son rôle. */
        y: dense
          ? Object.assign({ beginAtZero: true }, axeSimple(p))
          : { display: false, beginAtZero: true, grace: '20%',
              grid: { display: false } }
      }
    }),
    plugins: [etiquettesValeurs(15)]
  });
}

/* ── 2. Où en sont les dossiers ────────────────────────────
   Six barres dans l'ordre de la procédure, la valeur écrite au bout de
   chacune. L'axe des abscisses disparaît : il n'apportait qu'une lecture
   indirecte de ce que le chiffre dit déjà.
   ─────────────────────────────────────────────────────────── */
function graphiqueStatuts(idCanvas, libelles, valeurs, couleurs) {
  var p = palette();
  var o = baseOptions(p);
  o.plugins.legend.display = false;
  o.interaction = { mode: 'nearest', intersect: true };
  var total = valeurs.reduce(function (a, b) { return a + b; }, 0) || 1;
  o.plugins.tooltip.callbacks = {
    title: function (c) { return c[0].label; },
    label: function (c) {
      return ' ' + c.parsed.x + ' dossier' + (c.parsed.x > 1 ? 's' : '') +
             ' — ' + Math.round(c.parsed.x * 100 / total) + ' % du total';
    }
  };

  return poserGraphique(idCanvas, {
    type: 'bar',
    data: {
      labels: libelles,
      datasets: [{ label: 'Dossiers', data: valeurs,
                   backgroundColor: couleurs, borderRadius: boutArrondi(true),
                   maxBarThickness: 24 }]
    },
    options: Object.assign({}, o, {
      indexAxis: 'y',
      /* De la place à droite pour l'étiquette du plus grand. */
      layout: { padding: { right: 28 } },
      scales: {
        x: { display: false, beginAtZero: true,
             grace: '12%', grid: { display: false } },
        y: { grid: { display: false }, border: { display: false },
             ticks: { color: teinte('--text', '#241f1b'),
                      font: { size: 12.5, family: 'inherit' } } }
      }
    }),
    plugins: [etiquettesValeurs(8)]
  });
}

/* ── 3. Répartition par type : anneau ─────────────────────── */
function graphiqueTypes(idCanvas, libelles, valeurs) {
  var p = palette();
  var couleurs = [p.marine, p.orange, p.rouge, p.or, p.marineC, p.vert, p.gris];
  var o = baseOptions(p);
  o.plugins.legend.position = 'right';
  o.interaction = { mode: 'nearest', intersect: true };
  /* Un pourcentage sans l'effectif ne dit pas grand-chose sur quatorze
     dossiers : l'info-bulle porte les deux. */
  o.plugins.tooltip.callbacks = {
    label: function (ctx) {
      var t = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0) || 1;
      return ' ' + ctx.label + ' : ' + ctx.parsed +
             ' (' + Math.round(ctx.parsed * 100 / t) + ' %)';
    }
  };

  return poserGraphique(idCanvas, {
    type: 'doughnut',
    data: {
      labels: libelles,
      datasets: [{ data: valeurs, backgroundColor: couleurs,
                   borderColor: '#fff', borderWidth: 2, hoverOffset: 6 }]
    },
    options: Object.assign({}, o, { cutout: '58%' })
  });
}

/* ── 4. Priorités : barres verticales ─────────────────────── */
function graphiquePriorites(idCanvas, libelles, valeurs, couleurs) {
  var p = palette();
  var o = baseOptions(p);
  o.plugins.legend.display = false;

  return poserGraphique(idCanvas, {
    type: 'bar',
    data: {
      labels: libelles,
      datasets: [{ data: valeurs, backgroundColor: couleurs,
                   borderRadius: boutArrondi(false), maxBarThickness: 24 }]
    },
    options: Object.assign({}, o, {
      scales: {
        x: { grid: { display: false },
             ticks: { color: teinte('--text', '#241f1b'),
                      font: { size: 12, family: 'inherit' } } },
        y: Object.assign({ beginAtZero: true }, axeSimple(p, 'Dossiers'))
      }
    })
  });
}

/* ── 5. Dossiers par enquêteur ──────────────────────────────
   Deux barres côte à côte, une seule unité, un seul axe.

   Ce graphique portait aussi le délai moyen, en courbe, sur un second
   axe. C'était une faute de lecture : une courbe relie des points pour
   suggérer une progression, or KANA, BIYA et NKOA ne se suivent pas — ils
   ne sont pas ordonnés. La ligne dessinait une tendance qui n'existe pas,
   et mêlait des jours à des dossiers sur le même dessin. Le délai se lit
   dans le tableau voisin, où il a un sens ligne à ligne.
   ─────────────────────────────────────────────────────────── */
function graphiqueEnqueteurs(idCanvas, noms, enCours, acheves) {
  var p = palette();
  var o = baseOptions(p);
  o.interaction = { mode: 'index', intersect: false };
  o.plugins.tooltip.callbacks = {
    label: function (c) {
      return ' ' + c.dataset.label + ' : ' + c.parsed.y +
             ' dossier' + (c.parsed.y > 1 ? 's' : '');
    },
    footer: function (items) {
      var t = items.reduce(function (s, i) { return s + i.parsed.y; }, 0);
      return 'Portefeuille : ' + t + ' dossier' + (t > 1 ? 's' : '');
    }
  };

  return poserGraphique(idCanvas, {
    type: 'bar',
    data: {
      labels: noms,
      datasets: [
        { label: 'En cours', data: enCours, backgroundColor: p.orange,
          borderRadius: boutArrondi(false), maxBarThickness: 24 },
        { label: 'Achevés', data: acheves, backgroundColor: p.vert,
          borderRadius: boutArrondi(false), maxBarThickness: 24 }
      ]
    },
    options: Object.assign({}, o, {
      layout: { padding: { top: 18 } },
      scales: {
        x: { grid: { display: false },
             ticks: { color: teinte('--text', '#241f1b'),
                      font: { size: 12.5, family: 'inherit' } } },
        y: { display: false, beginAtZero: true, grace: '18%',
             grid: { display: false } }
      }
    }),
    plugins: [etiquettesValeurs(12)]
  });
}

/* ── 6. Actes de procédure par mois ───────────────────────── */
function graphiqueActivite(idCanvas, mois, series) {
  var p = palette();
  var couleurs = [p.marine, p.or, p.orange, p.vert];
  var o = baseOptions(p);

  return poserGraphique(idCanvas, {
    type: 'line',
    data: {
      labels: mois,
      datasets: series.map(function (s, i) {
        return { label: s.nom, data: s.valeurs,
                 borderColor: couleurs[i % couleurs.length],
                 backgroundColor: couleurs[i % couleurs.length],
                 borderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
                 tension: .3, fill: false };
      })
    },
    options: Object.assign({}, o, {
      scales: {
        x: { grid: { display: false },
             ticks: { color: teinte('--text', '#241f1b'),
                      font: { size: 12, family: 'inherit' } } },
        y: Object.assign({ beginAtZero: true }, axeSimple(p, 'Actes'))
      }
    })
  });
}
