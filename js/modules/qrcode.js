/* ============================================================
   GENERATEUR DE CODE QR — PlainteCam

   Pourquoi ce module existe : l'attestation affichait un QR recupere sur
   api.qrserver.com, qui encodait la chaine « PlainteCam-2026-00451-AUTH »
   — un numero code en dur, et une chaine qui n'est meme pas une URL. La
   scanner n'affichait que ce texte : aucune verification possible. Et
   l'impression dependait d'un appel reseau.

   Le code est desormais calcule ici, sans aucune dependance, et encode une
   URL de verification portant le vrai numero de dossier.

   Perimetre volontairement restreint : mode octet, niveau de correction L,
   versions 1 a 5. Sur cette plage, chaque version tient dans un seul bloc
   de correction d'erreur, ce qui evite tout entrelacement — la partie la
   plus delicate de la specification. Capacite : 106 octets, largement
   suffisant pour une URL de verification.
   ============================================================ */

var QR = (function () {

  /* ── Corps de Galois GF(256), polynome primitif 0x11D ────── */
  var EXP = new Array(512), LOG = new Array(256);
  (function initGF() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11D;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function mul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  /* Polynome generateur de Reed-Solomon de degre n. */
  function genPoly(n) {
    var g = [1];
    for (var i = 0; i < n; i++) {
      var ng = [];
      for (var z = 0; z <= g.length; z++) ng[z] = 0;
      for (var j = 0; j < g.length; j++) {
        ng[j]     ^= g[j];
        ng[j + 1] ^= mul(g[j], EXP[i]);
      }
      g = ng;
    }
    return g;
  }

  /* Mots de correction d'erreur pour un bloc de donnees. */
  function calculerECC(data, nEC) {
    var g = genPoly(nEC);
    var res = data.slice();
    for (var p = 0; p < nEC; p++) res.push(0);
    for (var i = 0; i < data.length; i++) {
      var coef = res[i];
      if (coef === 0) continue;
      for (var j = 0; j < g.length; j++) res[i + j] ^= mul(g[j], coef);
    }
    return res.slice(data.length);
  }

  /* ── Tables par version, niveau L, bloc unique ───────────── */
  /* [mots de donnees, mots de correction] */
  var VERSIONS = {
    1: [19,  7],
    2: [34, 10],
    3: [55, 15],
    4: [80, 20],
    5: [108, 26]
  };

  /* Capacite en octets : mots de donnees, moins 12 bits d'en-tete
     (4 bits de mode + 8 bits de longueur en mode octet, versions 1 a 9). */
  function capacite(v) { return Math.floor((VERSIONS[v][0] * 8 - 12) / 8); }

  function choisirVersion(nOctets) {
    for (var v = 1; v <= 5; v++) if (nOctets <= capacite(v)) return v;
    return null;
  }

  /* ── Encodage en octets UTF-8 ────────────────────────────── */
  function versOctets(txt) {
    var out = [];
    for (var i = 0; i < txt.length; i++) {
      var c = txt.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) {
        out.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
      } else if (c < 0xD800 || c >= 0xE000) {
        out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
      } else {
        /* paire de substitution */
        var c2 = txt.charCodeAt(++i);
        var cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00);
        out.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F),
                 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
      }
    }
    return out;
  }

  /* ── Construction du flux binaire ────────────────────────── */
  function construireDonnees(octets, v) {
    var nData = VERSIONS[v][0];
    var bits = [];
    function pousser(val, n) {
      for (var i = n - 1; i >= 0; i--) bits.push((val >> i) & 1);
    }

    pousser(0b0100, 4);            /* mode octet */
    pousser(octets.length, 8);     /* longueur, 8 bits pour v1-v9 */
    for (var i = 0; i < octets.length; i++) pousser(octets[i], 8);

    /* Terminateur, jusqu'a 4 bits, sans depasser la capacite. */
    var capaBits = nData * 8;
    var t = Math.min(4, capaBits - bits.length);
    for (var z = 0; z < t; z++) bits.push(0);
    /* Alignement sur l'octet. */
    while (bits.length % 8 !== 0) bits.push(0);

    /* Mots de remplissage alternes 0xEC / 0x11. */
    var mots = [];
    for (var b = 0; b < bits.length; b += 8) {
      var o = 0;
      for (var k = 0; k < 8; k++) o = (o << 1) | bits[b + k];
      mots.push(o);
    }
    var pad = [0xEC, 0x11], pi = 0;
    while (mots.length < nData) mots.push(pad[pi++ % 2]);

    return mots;
  }

  /* ── Matrice ─────────────────────────────────────────────── */
  function creerMatrice(v) {
    var n = v * 4 + 17;
    var m = [], reserve = [];
    for (var r = 0; r < n; r++) {
      m[r] = []; reserve[r] = [];
      for (var c = 0; c < n; c++) { m[r][c] = 0; reserve[r][c] = 0; }
    }

    function motif(cr, cc) {                       /* motif de recherche 7x7 */
      for (var dr = -1; dr <= 7; dr++) {
        for (var dc = -1; dc <= 7; dc++) {
          var r = cr + dr, c = cc + dc;
          if (r < 0 || c < 0 || r >= n || c >= n) continue;
          var dedans = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          var noir = dedans && (dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
                                (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          m[r][c] = noir ? 1 : 0;
          reserve[r][c] = 1;                        /* inclut le separateur */
        }
      }
    }
    motif(0, 0); motif(0, n - 7); motif(n - 7, 0);

    /* Motif d'alignement : un seul, au centre bas-droite, pour v2 a v5. */
    if (v >= 2) {
      var a = v * 4 + 10;
      for (var dr2 = -2; dr2 <= 2; dr2++) {
        for (var dc2 = -2; dc2 <= 2; dc2++) {
          var noir2 = Math.max(Math.abs(dr2), Math.abs(dc2)) !== 1;
          m[a + dr2][a + dc2] = noir2 ? 1 : 0;
          reserve[a + dr2][a + dc2] = 1;
        }
      }
    }

    /* Motifs de synchronisation. */
    for (var i = 8; i < n - 8; i++) {
      var bit = (i % 2 === 0) ? 1 : 0;
      if (!reserve[6][i]) { m[6][i] = bit; reserve[6][i] = 1; }
      if (!reserve[i][6]) { m[i][6] = bit; reserve[i][6] = 1; }
    }

    /* Module toujours noir. */
    m[n - 8][8] = 1; reserve[n - 8][8] = 1;

    /* Emplacements reserves a l'information de format. */
    for (var k = 0; k <= 8; k++) {
      if (!reserve[8][k]) reserve[8][k] = 1;
      if (!reserve[k][8]) reserve[k][8] = 1;
    }
    for (var k2 = 0; k2 < 8; k2++) {
      reserve[8][n - 1 - k2] = 1;
      reserve[n - 1 - k2][8] = 1;
    }

    return { m: m, reserve: reserve, n: n };
  }

  /* ── Placement des donnees en zigzag ─────────────────────── */
  function placerDonnees(mat, mots) {
    var bits = [];
    for (var i = 0; i < mots.length; i++) {
      for (var b = 7; b >= 0; b--) bits.push((mots[i] >> b) & 1);
    }
    var n = mat.n, idx = 0, versLeHaut = true;
    for (var droite = n - 1; droite >= 1; droite -= 2) {
      if (droite === 6) droite = 5;                /* saute la colonne de synchro */
      for (var v = 0; v < n; v++) {
        var y = versLeHaut ? (n - 1 - v) : v;
        for (var d = 0; d < 2; d++) {
          var x = droite - d;
          if (mat.reserve[y][x]) continue;
          mat.m[y][x] = idx < bits.length ? bits[idx++] : 0;
        }
      }
      versLeHaut = !versLeHaut;
    }
    return idx;
  }

  /* ── Masques ─────────────────────────────────────────────── */
  function conditionMasque(k, i, j) {
    switch (k) {
      case 0: return (i + j) % 2 === 0;
      case 1: return i % 2 === 0;
      case 2: return j % 3 === 0;
      case 3: return (i + j) % 3 === 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
      case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case 7: return (((i + j) % 2) + ((i * j) % 3)) % 2 === 0;
    }
    return false;
  }

  /* ── Information de format : BCH(15,5), niveau L = 01 ────── */
  function infoFormat(masque) {
    var donnee = (0b01 << 3) | masque;
    var d = donnee << 10;
    for (var i = 14; i >= 10; i--) {
      if ((d >> i) & 1) d ^= 0x537 << (i - 10);
    }
    return ((donnee << 10) | d) ^ 0x5412;
  }

  function poserFormat(mat, masque) {
    var n = mat.n, f = infoFormat(masque);
    function bit(i) { return (f >> i) & 1; }
    /* Copie autour du motif haut-gauche. */
    for (var i = 0; i <= 5; i++)  mat.m[8][i] = bit(i);
    mat.m[8][7] = bit(6);
    mat.m[8][8] = bit(7);
    mat.m[7][8] = bit(8);
    for (var j = 9; j <= 14; j++) mat.m[14 - j][8] = bit(j);
    /* Copie de secours : 7 modules en colonne (bits 0 a 6, lignes n-1 a n-7)
       et 8 en ligne (bits 7 a 14, colonnes n-8 a n-1). Le decoupage 8/7
       ecrasait le module toujours-noir en (n-8, 8). */
    for (var k = 0; k <= 6; k++)  mat.m[n - 1 - k][8] = bit(k);
    for (var l = 7; l <= 14; l++) mat.m[8][n - 15 + l] = bit(l);
  }

  /* ── Penalites, pour choisir le meilleur masque ──────────── */
  function penalite(m, n) {
    var p = 0, i, j, k, run, prec;

    /* Regle 1 : suites de 5 modules ou plus de meme teinte. */
    for (i = 0; i < n; i++) {
      run = 1; prec = m[i][0];
      for (j = 1; j < n; j++) {
        if (m[i][j] === prec) run++;
        else { if (run >= 5) p += 3 + (run - 5); run = 1; prec = m[i][j]; }
      }
      if (run >= 5) p += 3 + (run - 5);
      run = 1; prec = m[0][i];
      for (j = 1; j < n; j++) {
        if (m[j][i] === prec) run++;
        else { if (run >= 5) p += 3 + (run - 5); run = 1; prec = m[j][i]; }
      }
      if (run >= 5) p += 3 + (run - 5);
    }

    /* Regle 2 : blocs 2x2 uniformes. */
    for (i = 0; i < n - 1; i++) {
      for (j = 0; j < n - 1; j++) {
        var a = m[i][j];
        if (a === m[i][j + 1] && a === m[i + 1][j] && a === m[i + 1][j + 1]) p += 3;
      }
    }

    /* Regle 3 : motif 1:1:3:1:1 precede ou suivi de 4 modules clairs. */
    var A = [1,0,1,1,1,0,1,0,0,0,0];
    var B = [0,0,0,0,1,0,1,1,1,0,1];
    function correspond(ligne, dep, mot) {
      for (var z = 0; z < 11; z++) if (ligne[dep + z] !== mot[z]) return false;
      return true;
    }
    for (i = 0; i < n; i++) {
      var lig = m[i], col = [];
      for (k = 0; k < n; k++) col.push(m[k][i]);
      for (j = 0; j + 11 <= n; j++) {
        if (correspond(lig, j, A) || correspond(lig, j, B)) p += 40;
        if (correspond(col, j, A) || correspond(col, j, B)) p += 40;
      }
    }

    /* Regle 4 : ecart de la proportion de modules sombres a 50 %. */
    var sombres = 0;
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) sombres += m[i][j];
    var pct = sombres * 100 / (n * n);
    p += Math.floor(Math.abs(pct - 50) / 5) * 10;

    return p;
  }

  /* ── Entree principale ───────────────────────────────────── */
  /* Rend une matrice de 0 et 1, ou null si le texte est trop long. */
  function matrice(texte) {
    var octets = versOctets(texte);
    var v = choisirVersion(octets.length);
    if (!v) return null;

    var mots = construireDonnees(octets, v);
    var ec = calculerECC(mots, VERSIONS[v][1]);
    var complet = mots.concat(ec);

    var meilleur = null, meilleurScore = Infinity;
    for (var masque = 0; masque < 8; masque++) {
      var mat = creerMatrice(v);
      placerDonnees(mat, complet);
      for (var r = 0; r < mat.n; r++) {
        for (var c = 0; c < mat.n; c++) {
          if (!mat.reserve[r][c] && conditionMasque(masque, r, c)) mat.m[r][c] ^= 1;
        }
      }
      poserFormat(mat, masque);
      var s = penalite(mat.m, mat.n);
      if (s < meilleurScore) { meilleurScore = s; meilleur = mat.m; }
    }
    return meilleur;
  }

  /* ── Rendu SVG ───────────────────────────────────────────── */
  /* Un seul <path> plutot que N <rect> : plus leger, et shape-rendering
     crispEdges evite les bords flous a l'impression. */
  function svg(texte, opts) {
    opts = opts || {};
    var m = matrice(texte);
    if (!m) return '';
    var n = m.length;
    var marge = opts.marge == null ? 2 : opts.marge;   /* zone de silence */
    var total = n + marge * 2;
    var couleur = opts.couleur || '#0b1e45';
    var fond = opts.fond || '#ffffff';
    var d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (m[r][c]) d += 'M' + (c + marge) + ' ' + (r + marge) + 'h1v1h-1z';
      }
    }
    var attrs = 'viewBox="0 0 ' + total + ' ' + total + '"'
      + ' width="' + (opts.taille || 110) + '" height="' + (opts.taille || 110) + '"'
      + ' shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"'
      + ' role="img" aria-label="' + (opts.alt || 'Code QR de vérification') + '"';
    return '<svg ' + attrs + '>'
      + '<rect width="' + total + '" height="' + total + '" fill="' + fond + '"/>'
      + '<path d="' + d + '" fill="' + couleur + '"/>'
      + '</svg>';
  }

  return {
    matrice: matrice,
    svg: svg,
    capacite: capacite,
    _versions: VERSIONS,
    _infoFormat: infoFormat,
    _penalite: penalite
  };
})();

/* ============================================================
   VERIFICATION D'UNE ATTESTATION
   ============================================================ */

/* Code de controle a 4 caracteres derive du numero de dossier.
   Il ne pretend pas etre cryptographique : il permet de detecter une
   saisie erronee ou une retouche grossiere du document, et donne a
   l'agent qui recoit l'attestation quelque chose a confronter. */
function codeVerification(numeroDossier) {
  var h = 0x1505;
  var s = String(numeroDossier || '');
  for (var i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) & 0xFFFFFFFF;
  }
  var alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';  /* sans I ni O */
  var out = '';
  var x = Math.abs(h);
  for (var k = 0; k < 4; k++) {
    out += alphabet[x % alphabet.length];
    x = Math.floor(x / alphabet.length);
  }
  return out;
}

/* URL encodee dans le QR. Scanner l'attestation ouvre la page de suivi
   avec le dossier deja renseigne. */
function urlVerification(numeroDossier) {
  var base = (typeof CONFIG !== 'undefined' && CONFIG.BASE_URL)
    ? CONFIG.BASE_URL.replace(/\/+$/, '')
    : 'https://plaintecam.cm';
  return base + '/verifier?d=' + encodeURIComponent(numeroDossier)
       + '&c=' + codeVerification(numeroDossier);
}

/* Remplit un conteneur avec le QR de verification du dossier. */
function rendreQR(idConteneur, numeroDossier, taille) {
  var el = document.getElementById(idConteneur);
  if (!el) return;
  var code = QR.svg(urlVerification(numeroDossier), {
    taille: taille || 110,
    alt: 'Code QR de vérification du dossier ' + numeroDossier
  });
  if (code) {
    el.innerHTML = code;
  } else {
    el.textContent = '—';
  }
}
