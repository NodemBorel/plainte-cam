/* ============================================================
   DOCUMENTS OFFICIELS — attestation de depot, declaration de plainte
   et convocation.

   Ce module etait enferme dans le <script> de citoyen/index.html : les
   documents n'etaient donc telechargeables que depuis l'espace citoyen.
   L'enqueteur qui instruit un dossier doit pouvoir sortir les memes
   pieces. D'ou l'extraction.

   Depend de js/modules/qrcode.js (QR, urlVerification, codeVerification)
   et, quand il est charge, de js/modules/data.js (DOSSIERS, CITOYENS,
   etatCivilComplet, incriminationDe, VISAS_*).
   ============================================================ */

/* ══════════════════════════════════════════════════════════
   GABARITS

   Les documents suivaient un gabarit invente : en-tete centre sur toute
   la largeur, tableaux a bordures, paragraphes ordinaires. Les modeles
   reels de la Surete Nationale en different sur trois points, et ces
   trois points sont precisement ce qui fait reconnaitre une piece de
   procedure :

     • le timbre administratif occupe une colonne a gauche — Republique,
       service emetteur, numero d'ordre, objet, affaire, incrimination ;
     • chaque enonce est une ligne de procedure : elle commence par des
       tirets et se prolonge par des tirets jusqu'a la marge, de sorte
       qu'aucun ajout ne puisse etre glisse apres coup ;
     • l'acte se raconte, il ne se tabule pas — « L'an deux mille
       vingt-six, le 15 Mai a 14 heures 32 minutes, Nous, … ».

   Trois gabarits en decoulent :
     gabaritProcedure()   — PV et attestation (colonne + corps)
     gabaritConvocation() — en-tete bilingue pleine largeur
     gabaritLettre()      — la plainte, qui est une lettre du citoyen
   ══════════════════════════════════════════════════════════ */

const MOIS = ['janvier','février','mars','avril','mai','juin',
              'juillet','août','septembre','octobre','novembre','décembre'];

const MOIS_CAP = ['Janvier','Février','Mars','Avril','Mai','Juin',
                  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

/* Le texte d'un document est compose a partir de saisies libres. Il
   n'etait pas echappe : une declaration contenant un chevron cassait la
   mise en page, et le document se pretait a l'injection. */
function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* « 15/05/2026 » ou « 2026-05-15 » -> [15, 5, 2026] */
function partsDate(v) {
  if (!v) return null;
  let j, m, a;
  if (v.indexOf('/') !== -1)      { [j, m, a] = v.split('/'); }
  else if (v.indexOf('-') !== -1) { [a, m, j] = v.split('-'); }
  else return null;
  return [parseInt(j, 10), parseInt(m, 10), parseInt(a, 10)];
}

/* « 15/05/2026 » -> « 15 mai 2026 » */
function dateEnClair(v) {
  const p = partsDate(v);
  if (!p) return v || '';
  return p[0] + ' ' + (MOIS[p[1] - 1] || p[1]) + ' ' + p[2];
}

/* « 15/05/2026 » -> « 15 Mai » : l'en-tete d'un acte donne le quantieme
   et le mois, l'annee ayant deja ete enoncee en toutes lettres. */
function jourEtMois(v) {
  const p = partsDate(v);
  if (!p) return v || '';
  return p[0] + ' ' + (MOIS_CAP[p[1] - 1] || p[1]);
}

const UNITES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept',
  'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze',
  'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante',
  'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

/* 0 a 99 en toutes lettres — de quoi ecrire un millesime. */
function petitNombreEnLettres(n) {
  if (n < 20) return UNITES[n] || 'zéro';
  const d = Math.floor(n / 10), u = n % 10;
  let mot = DIZAINES[d];
  if (d === 7 || d === 9) {
    mot += (u === 1 && d === 7 ? ' et ' : '-') + UNITES[10 + u];
  } else if (u === 1 && d !== 8) {
    mot += ' et un';
  } else if (u) {
    mot += '-' + UNITES[u];
  } else if (d === 8) {
    mot += 's';
  }
  return mot;
}

/* « L'an deux mille vingt-six » : le millesime d'un acte s'ecrit en
   toutes lettres, jamais en chiffres. */
function anneeEnLettres(a) {
  const n = parseInt(a, 10);
  if (!n) return '';
  if (n < 2000 || n > 2099) return String(n);
  const reste = n - 2000;
  return 'deux mille' + (reste ? ' ' + petitNombreEnLettres(reste) : '');
}

/* « 14h32 » -> « 14 heures 32 minutes » ; « 14h » -> « 14 heures 00 minutes » */
function heureEnClair(h) {
  const m = String(h || '').match(/(\d{1,2})\s*[h:]\s*(\d{0,2})/);
  if (!m) return h || '';
  return parseInt(m[1], 10) + ' heures ' + (m[2] ? m[2].padStart(2, '0') : '00') + ' minutes';
}

/* « 10h00 » -> « 10 heures » ; « 10h30 » -> « 10 heures 30 ». La
   convocation annonce une heure de comparution, pas un horodatage :
   « à 10h00 précises » se lit « à 10 heures précises ». */
function heureRonde(h) {
  const m = String(h || '').match(/(\d{1,2})\s*[h:]\s*(\d{0,2})/);
  if (!m) return h || '';
  const min = m[2] ? parseInt(m[2], 10) : 0;
  return parseInt(m[1], 10) + ' heures' + (min ? ' ' + min : '');
}

/* Formule d'ouverture commune aux actes : « L'an deux mille vingt-six,
   le 15 Mai à 14 heures 32 minutes ». */
function ouvertureActe(date, heure) {
  const p = partsDate(date);
  return 'L’an ' + (p ? anneeEnLettres(p[2]) : '') +
         ', le ' + jourEtMois(date) +
         (heure ? ' à ' + heureEnClair(heure) : '');
}

/* « de escroquerie » -> « d'escroquerie ». La qualification penale est
   inseree dans des tournures — « du chef de », « sur les faits de » —
   ou l'elision est obligatoire. */
function deQualif(mot) {
  const m = String(mot || '').toLowerCase();
  return /^[aeiouyàâäéèêëîïôöûüh]/.test(m) ? 'd’' + m : 'de ' + m;
}

/* Numero d'ordre du registre : « N° 0451/DGSN/DRSNC/CSCV/SEC ».
   Il derive du numero de dossier, pour que les deux se recoupent. */
function numeroOrdre(numero) {
  const chiffres = String(numero || '').replace(/\D/g, '').slice(-4) || '0000';
  return 'N° ' + chiffres + '/DGSN/DRSNC/CSCV/SEC';
}

/* ══════════ FEUILLE DE STYLE DES DOCUMENTS ══════════
   Injectee dans le document lui-meme : ce qui est lu dans la
   visionneuse est exactement ce qui sort a l'impression, sans dependre
   d'une feuille externe que la fenetre d'impression ne chargerait pas.

   .doc-f est le remplissage par tirets. Une boite en ligne de largeur
   nulle laisse deborder son contenu ; le bloc parent, en overflow
   hidden, le coupe net a la marge. Les tirets partent donc exactement
   ou le texte s'arrete et s'arretent exactement au bord — sans image de
   fond, que la boite d'impression supprimerait. */
function stylesDocument() {
  return `<style>
    .doc { font-family:"Times New Roman",Times,serif; color:#000; font-size:15px; line-height:1.95; }
    .doc p { margin:0; }
    .doc-l { text-align:justify; overflow:hidden; white-space:normal; }
    .doc-f { display:inline-block; width:0; white-space:nowrap; overflow:visible; letter-spacing:.5px; }
    .doc-grille { width:100%; border-collapse:collapse; }
    .doc-grille > tbody > tr > td { vertical-align:top; }
    .doc-marge { width:31%; padding:0 14px 0 0; font-size:11.5px; line-height:1.5; text-align:center; }
    .doc-marge .bloc { margin-bottom:13px; }
    .doc-marge .sep { letter-spacing:1px; }
    .doc-marge .champ { text-align:left; margin-bottom:13px; line-height:1.6; }
    .doc-corps { width:69%; padding:0 0 0 16px; }
    .doc-titre { text-align:center; font-weight:bold; font-size:19px; line-height:1.3;
                 text-transform:uppercase; letter-spacing:1px; margin:0; }
    .doc-etoiles { text-align:center; letter-spacing:3px; font-size:13px; margin:0 0 20px; }
    .doc-section { text-align:center; font-weight:bold; text-decoration:underline;
                   letter-spacing:.5px; margin:22px 0 10px; }
    .doc-sign { width:100%; border-collapse:collapse; margin-top:26px; }
    .doc-sign td { text-align:center; font-weight:bold; font-size:12.5px;
                    line-height:1.4; padding-top:6px; }
    .doc-sign .trait { display:block; border-top:1px solid #000; width:76%;
                       margin:40px auto 4px; }
    .doc-qa { margin:2px 0; text-align:justify; }
    .doc-qa .q { font-weight:bold; }
    .doc-pied { margin-top:30px; padding-top:9px; border-top:1px solid #000;
                font-size:9.5px; line-height:1.5; }
    .doc-pied td { vertical-align:middle; }
    .pv-editable { outline:2px dashed #666; outline-offset:3px; }
  </style>`;
}

/* Une ligne de procedure : tirets d'amorce, texte, tirets jusqu'a la
   marge. C'est l'unite de base des trois gabarits. */
const TIRETS = '-'.repeat(220);

function ligneP(texte, style) {
  return '<p class="doc-l"' + (style ? ' style="' + style + '"' : '') + '>----' +
         texte + '<span class="doc-f">' + TIRETS + '</span></p>';
}

/* Ligne de fermeture : « Plus rien ne déclare… », suivie des tirets. */
function ligneFin(texte) {
  return ligneP(texte, 'margin-top:10px');
}

/* ══════════ COLONNE ADMINISTRATIVE ══════════
   Le timbre de gauche. `champs` est la liste des mentions propres a
   l'acte : OBJET, AFFAIRE, INCRIMINATION, telephone. */
function colonneAdministrative(opts) {
  const o = opts || {};
  const services = (o.services || []).map(s =>
    '<div class="bloc">' + s + '</div><div class="sep">--------</div>').join('');

  const champs = (o.champs || []).filter(Boolean).map(c =>
    '<div class="champ"><strong>' + c[0] + '</strong>' +
    (c[1] ? ' : ' + c[1] : '') + '</div>').join('');

  return `
    <div class="bloc" style="font-weight:bold">RÉPUBLIQUE DU CAMEROUN<br>
      <span style="font-weight:normal;font-style:italic">Paix - Travail - Patrie</span><br>
      REPUBLIC OF CAMEROON<br>
      <span style="font-weight:normal;font-style:italic">Peace - Work - Fatherland</span>
    </div>
    <div class="sep">--------</div>
    ${services}
    <div class="champ" style="font-weight:bold;margin-top:16px">${o.numero || ''}</div>
    ${champs}`;
}

/* ══════════ GABARIT « PIÈCE DE PROCÉDURE » ══════════
   PV et attestation : colonne administrative a gauche, acte a droite. */
function gabaritProcedure(opts) {
  const o = opts || {};
  return stylesDocument() + '<div class="doc">' +
    '<table class="doc-grille"><tbody><tr>' +
      '<td class="doc-marge">' + colonneAdministrative(o) + '</td>' +
      '<td class="doc-corps">' +
        '<p class="doc-titre">' + o.titre + '</p>' +
        '<p class="doc-etoiles">**********</p>' +
        o.corps +
      '</td>' +
    '</tr></tbody></table>' +
    (o.pied || '') +
  '</div>';
}

/* ══════════ EN-TÊTE BILINGUE PLEINE LARGEUR ══════════
   Celui de la convocation : Republique, Presidence, Delegation
   generale, Delegation regionale, service — en francais a gauche, en
   anglais a droite, embleme au centre.

   L'embleme est dessine, non reproduit : la plateforme n'a pas a
   embarquer les armoiries de l'Etat dans un depot de code. */
function enteteOfficielle(service) {
  const s = service || 'Commissariat Central';
  return `
    <table style="width:100%;border-collapse:collapse;font-size:11.5px;line-height:1.45;font-weight:bold;margin-bottom:8px">
      <tr>
        <td style="width:40%;vertical-align:top;text-align:center">
          RÉPUBLIQUE DU CAMEROUN<br>
          <span style="font-weight:normal;font-style:italic">Paix - Travail - Patrie</span><br>
          <span style="letter-spacing:1px">********</span><br>
          PRÉSIDENCE DE LA RÉPUBLIQUE<br>
          <span style="letter-spacing:1px">********</span><br>
          DÉLÉGATION GÉNÉRALE À LA SÛRETÉ NATIONALE<br>
          <span style="letter-spacing:1px">********</span><br>
          DÉLÉGATION RÉGIONALE DE LA SÛRETÉ NATIONALE DU CENTRE<br>
          <span style="letter-spacing:1px">********</span><br>
          ${esc(s).toUpperCase()}
        </td>
        <td style="width:20%;vertical-align:top;text-align:center;padding-top:6px">
          <div style="width:80px;height:80px;border:2px solid #000;border-radius:50%;
                      margin:0 auto;display:flex;align-items:center;justify-content:center;
                      font-size:8.5px;font-weight:bold;text-align:center;line-height:1.3;
                      letter-spacing:.2px">
            POLICE<br>CAMEROUNAISE
          </div>
        </td>
        <td style="width:40%;vertical-align:top;text-align:center">
          REPUBLIC OF CAMEROON<br>
          <span style="font-weight:normal;font-style:italic">Peace - Work - Fatherland</span><br>
          <span style="letter-spacing:1px">********</span><br>
          PRESIDENCY OF THE REPUBLIC<br>
          <span style="letter-spacing:1px">********</span><br>
          GENERAL DELEGATION FOR NATIONAL SECURITY<br>
          <span style="letter-spacing:1px">********</span><br>
          REGIONAL DELEGATION FOR NATIONAL SECURITY CENTRE<br>
          <span style="letter-spacing:1px">********</span><br>
          ${esc(s).toUpperCase()}
        </td>
      </tr>
    </table>`;
}

function gabaritConvocation(opts) {
  const o = opts || {};
  return stylesDocument() + '<div class="doc">' +
    enteteOfficielle(o.service) +
    '<p style="font-weight:bold;font-size:13px;margin:4px 0 22px">' + (o.numero || '') + '</p>' +
    '<p class="doc-titre" style="font-size:22px">' + o.titre + '</p>' +
    '<p class="doc-etoiles">**********</p>' +
    o.corps +
    (o.pied || '') +
  '</div>';
}

/* ══════════ GABARIT « LETTRE » ══════════
   La plainte n'est pas un acte de police : c'est le citoyen qui ecrit.
   Elle suit donc la forme de la lettre administrative — expediteur en
   haut a gauche, lieu et date a droite, destinataire en dessous a
   droite, objet, corps, signature. */
function gabaritLettre(opts) {
  const o = opts || {};
  return stylesDocument() + '<div class="doc" style="line-height:1.85">' +
    `<table style="width:100%;border-collapse:collapse;margin-bottom:26px">
      <tr>
        <td style="width:55%;vertical-align:top;font-size:14.5px;line-height:1.6">${o.expediteur}</td>
        <td style="width:45%;vertical-align:top;text-align:right;font-size:14.5px">${o.lieuDate}</td>
      </tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:30px">
      <tr>
        <td style="width:42%"></td>
        <td style="width:58%;vertical-align:top;font-size:14.5px;line-height:1.6;font-weight:bold">${o.destinataire}</td>
      </tr>
    </table>` +
    o.objet +
    o.corps +
    (o.pied || '') +
  '</div>';
}

/* ══════════ PIED DE VÉRIFICATION ══════════
   Le QR n'existe sur aucun modele reel : c'est l'apport de la
   plateforme. Il est donc relegue en pied de page, en petit, pour que
   le document garde l'allure d'une piece de procedure tout en restant
   verifiable par qui le recoit sur papier. */
function piedVerification(numero) {
  if (typeof QR === 'undefined') return '';
  return `
    <table class="doc-pied" style="width:100%;border-collapse:collapse">
      <tr>
        <td style="width:58px;padding-right:10px">
          ${QR.svg(urlVerification(numero), { taille: 52, couleur: '#000000', alt: 'Code QR de vérification' })}
        </td>
        <td>
          <strong>Vérification du document</strong> — ce document est authentifiable en ligne.<br>
          ${urlVerification(numero)} &nbsp;·&nbsp; code de contrôle : <strong>${codeVerification(numero)}</strong><br>
          <span style="font-style:italic">Document édité par la plateforme PlainteCam. Toute altération le rend
          non conforme à l'original conservé au dossier.</span>
        </td>
      </tr>
    </table>`;
}

/* Mécanique d'impression, commune à tous les documents. */
function imprimerDocument(html) {
  const zone = document.createElement('div');
  zone.id = 'print-doc-area';
  zone.style.width = '100%';
  zone.style.fontFamily = '"Times New Roman", Times, serif';
  zone.style.color = '#000';
  zone.style.background = '#fff';
  zone.style.padding = '20px';
  zone.innerHTML = html;

  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      #print-doc-area, #print-doc-area * { visibility: visible; }
      #print-doc-area { position: absolute; left: 0; top: 0; width: 100%; }
      /* Les tirets de conduite ne doivent pas etre coupes par un saut
         de page au milieu d'un enonce. */
      #print-doc-area .doc-l { page-break-inside: avoid; }
      #print-doc-area .doc-sign { page-break-inside: avoid; }
    }`;

  document.head.appendChild(style);
  document.body.appendChild(zone);
  /* Le QR est calculé localement : aucun chargement réseau à attendre. */
  window.print();
  setTimeout(() => {
    if (zone.parentNode)  document.body.removeChild(zone);
    if (style.parentNode) document.head.removeChild(style);
  }, 400);
}

function donneesDossier(numero) {
  const d = (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.find(x => x.id === numero) : null;
  if (d) {
    return {
      numero: d.id, plaignant: d.plaignant, type: d.type,
      /* L'etat civil complet du plaignant se lit sur sa fiche citoyen :
         le dossier ne porte que le nom affiche. */
      citoyen: d.citoyen || null,
      date: d.date, heure: d.heure || '',
      lieu: d.lieu || '', declaration: d.declaration || '',
      misEnCause: d.misEnCause || '', prejudice: d.prejudice || null,
      pieces: d.pieces || [],
      contact: d.contact || null,
      commissariat: d.commissariat || 'Commissariat compétent',
      statut: (typeof STATUT_LABELS !== 'undefined' && STATUT_LABELS[d.statut])
              ? STATUT_LABELS[d.statut][1] : d.statut,
      enqueteur: d.enqueteur || null
    };
  }

  /* Repli : le formulaire de dépôt de la session en cours. */
  const val = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
  const dateEl = document.querySelector('[data-step="1"] input[type="date"]');
  const mecNom = document.getElementById('mec-nom');
  const mecDesc = document.getElementById('mec-description');
  const infoComm = document.getElementById('commissariat-info-text');
  const courant = (typeof citoyenCourant === 'function') ? citoyenCourant() : null;
  return {
    numero: numero,
    /* Le plaignant d'une plainte en cours de saisie est le compte
       connecté : son nom était écrit ici, ce qui faisait signer Jean
       MBIDA sur le document de n'importe quel utilisateur. */
    plaignant: courant ? nomCitoyen(courant) : '',
    citoyen: courant ? courant.id : null,
    type: val('nature-infraction'),
    date: dateEl ? dateEl.value : '', heure: '',
    lieu: val('lieu-faits'),
    declaration: val('declaration-text'),
    misEnCause: (mecNom && mecNom.value.trim())
      ? mecNom.value.trim() + (mecDesc && mecDesc.value.trim() ? ' — ' + mecDesc.value.trim() : '')
      : (mecDesc ? mecDesc.value.trim() : ''),
    prejudice: val('prejudice-nature') ? {
      nature: val('prejudice-nature'),
      montant: val('prejudice-montant'),
      detail: val('prejudice-detail')
    } : null,
    pieces: [],
    contact: courant ? { email: courant.email, telephone: courant.telephone } : null,
    commissariat: infoComm ? infoComm.textContent.trim() : 'Commissariat compétent',
    statut: 'Transmis pour instruction',
    enqueteur: null
  };
}

function numeroCourant() {
  const el = document.querySelector('#page-confirmation .big-num');
  return (el ? el.textContent : 'N° 2026-00451').replace(/^\s*N°\s*/, '').trim();
}

/* Etat civil du plaignant, ou a defaut son seul nom : le document ne
   doit pas inventer une filiation qu'il n'a pas. */
function etatCivilPlaignant(d) {
  if (d.citoyen && typeof citoyen === 'function') {
    const c = citoyen(d.citoyen);
    if (c && typeof etatCivilComplet === 'function') {
      return '<strong>' + esc(nomCitoyen(c)) + '</strong>, ' + esc(etatCivilComplet(c));
    }
  }
  return '<strong>' + esc(d.plaignant) + '</strong>';
}

function qualificationDe(type) {
  return (typeof incriminationDe === 'function')
    ? incriminationDe(type)
    : { qualification: type || 'Faits à qualifier', articles: 'Code pénal' };
}

/* Nom porte a la rubrique AFFAIRE et a l'objet de la plainte. Un
   signalement physique — « Jeune homme, environ 25 ans, tee-shirt
   rouge » — n'est pas une identite : la piece se dirige alors contre X,
   comme le veut l'usage. Le document nommait « Jeune homme » comme
   partie adverse, ce qui aurait fait convoquer un signalement. */
function nomMisEnCause(d) {
  if (!d || !d.misEnCause) return 'X';
  const identifie = (typeof misEnCauseIdentifie === 'function')
    ? misEnCauseIdentifie(d)
    : !/^(jeune homme|homme|femme|individu|inconnu)/i.test(String(d.misEnCause).trim());
  return identifie ? d.misEnCause.split(',')[0].trim().replace(/\.$/, '') : 'X';
}

/* ══════════════════════════════════════════════════════════
   ATTESTATION DE DÉPÔT

   Elle n'a pas de modele reel : aucune piece de ce type ne circule
   aujourd'hui, et c'est justement le manque que la plateforme comble —
   le compte rendu d'entretien decrit un plaignant qui repart sans rien.
   Faute de modele, elle emprunte le gabarit des pieces de procedure,
   pour que le lot des quatre documents se tienne.
   ══════════════════════════════════════════════════════════ */
function htmlAttestation(numero) {
  const n = numero || numeroCourant();
  const d = donneesDossier(n);
  const inc = qualificationDe(d.type);

  const corps =
    ligneP(ouvertureActe(d.date, d.heure) + ',') +
    ligneP('Nous, Chef du ' + esc(d.commissariat) + ', Officier de Police Judiciaire, ' +
           'auxiliaire de Monsieur le Procureur de la République ;') +
    ligneP('Vu la déclaration de plainte enregistrée sous le numéro <strong>' + esc(d.numero) +
           '</strong> sur la plateforme nationale PlainteCam ;') +
    ligneP('Attestons que la plainte ci-après a été formellement reçue et consignée au registre du service :') +

    ligneP('Plaignant : ' + etatCivilPlaignant(d) + ' ;', 'margin-top:12px') +
    ligneP('Nature des faits dénoncés : <strong>' + esc(d.type) + '</strong>, ' +
           'faits qualifiés ' + esc(deQualif(inc.qualification)) + ' au sens de l’' + esc(inc.articles) + ' ;') +
    ligneP('Lieu des faits : ' + esc(d.lieu || 'non précisé') + ' ;') +
    ligneP('Date et heure d’enregistrement : ' + dateEnClair(d.date) +
           (d.heure ? ' à ' + heureEnClair(d.heure) : '') + ' ;') +
    ligneP('État de la procédure à ce jour : <strong>' + esc(d.statut) + '</strong>' +
           (d.enqueteur ? ', dossier confié à ' + esc(d.enqueteur) : ', enquêteur non encore désigné') + ' ;') +

    ligneP('La présente attestation fait foi de la date certaine du dépôt. Elle ne préjuge ni de la ' +
           'qualification définitive des faits, ni de la suite qui sera réservée à la procédure.',
           'margin-top:12px') +
    ligneP('Rappelons au plaignant que toute dénonciation calomnieuse expose son auteur aux peines ' +
           'prévues par le Code pénal.') +
    ligneFin('En foi de quoi la présente attestation lui est délivrée pour servir et valoir ce que de droit.') +

    `<table class="doc-sign"><tr>
       <td style="width:50%"></td>
       <td style="width:50%">
         <span style="font-weight:normal;font-size:13px">Fait à ${esc((d.commissariat || '').split(',').pop().trim() || 'Yaoundé')},
         le ${dateEnClair(d.date)}</span><br>
         L’OFFICIER DE POLICE JUDICIAIRE
         <span class="trait"></span>
       </td>
     </tr></table>`;

  return gabaritProcedure({
    services: ['DÉLÉGATION GÉNÉRALE<br>À LA SÛRETÉ NATIONALE<br>GENERAL DELEGATION<br>FOR NATIONAL SECURITY',
               esc(d.commissariat).toUpperCase()],
    numero: numeroOrdre(d.numero),
    champs: [
      ['OBJET', 'Attestation de dépôt de plainte au profit du nommé ' + esc(d.plaignant)],
      ['AFFAIRE', esc(d.plaignant) + '<br>C/<br>' + esc(nomMisEnCause(d))],
      ['INCRIMINATION', esc(inc.qualification)],
      d.contact && d.contact.telephone ? ['Tél', esc(d.contact.telephone)] : null
    ],
    titre: 'Attestation de dépôt de plainte',
    corps: corps,
    pied: piedVerification(d.numero)
  });
}

/* ══════════════════════════════════════════════════════════
   DÉCLARATION DE PLAINTE

   Une plainte ecrite est une lettre : elle emane du plaignant, elle est
   adressee, elle porte un objet et elle se signe. Le document la
   presentait en sections numerotees, ce qu'aucun modele ne fait.
   ══════════════════════════════════════════════════════════ */
function htmlPlainte(numero) {
  const n = numero || numeroCourant();
  const d = donneesDossier(n);
  const inc = qualificationDe(d.type);
  const c = (d.citoyen && typeof citoyen === 'function') ? citoyen(d.citoyen) : null;
  const ville = (d.commissariat || '').split(',').pop().trim() || 'Yaoundé';
  const mis = nomMisEnCause(d);

  const expediteur =
    '<strong>' + esc(c ? (c.sexe === 'F' ? 'Mme ' : 'M. ') + nomCitoyen(c) : d.plaignant) + '</strong><br>' +
    (c && c.profession ? esc(c.profession) + '<br>' : '') +
    (c && c.adresse ? esc(c.adresse) + '<br>' : '') +
    (d.contact && d.contact.telephone ? 'Tél : ' + esc(d.contact.telephone) + '<br>' : '') +
    (d.contact && d.contact.email ? esc(d.contact.email) : '');

  const destinataire =
    'À Monsieur le Commissaire,<br>' +
    'Chef du ' + esc(d.commissariat) + '<br>' +
    '<span style="font-weight:normal;font-style:italic">Sous couvert de Monsieur le Procureur de la ' +
    'République près le Tribunal de Première Instance de ' + esc(ville) + '</span>';

  const objet = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14.5px">
      <tr>
        <td style="width:70px;vertical-align:top;font-weight:bold;text-decoration:underline">Objet :</td>
        <td style="vertical-align:top">Plainte contre ${esc(mis)}</td>
      </tr>
      <tr>
        <td style="width:70px;vertical-align:top;font-weight:bold;text-decoration:underline">Pour :</td>
        <td style="vertical-align:top">${esc(inc.qualification)}<br>
          <span style="font-style:italic;font-size:13.5px">(${esc(inc.articles)})</span></td>
      </tr>
      <tr>
        <td style="width:70px;vertical-align:top;font-weight:bold;text-decoration:underline">Réf. :</td>
        <td style="vertical-align:top">Dossier PlainteCam n° <strong>${esc(d.numero)}</strong></td>
      </tr>
    </table>`;

  const para = (t, style) =>
    '<p style="text-align:justify;margin:0 0 15px;' + (style || '') + '">' + t + '</p>';

  let corps =
    para('Monsieur le Commissaire,', 'margin-bottom:20px') +
    para('J’ai l’honneur de vous exposer, en vous remerciant par avance pour l’attention que vous ' +
         'porterez à la lecture de ma plainte, les faits suivants, afin que toute lumière soit faite et que ' +
         'les auteurs en répondent.') +
    para('Je soussigné' + (c && c.sexe === 'F' ? 'e' : '') + ' ' + etatCivilPlaignant(d) + '.');

  /* Le recit du plaignant est reproduit tel qu'il a ete saisi. Il n'est
     ni resume ni reformule : c'est sa parole qui est versee au dossier. */
  corps += para('<strong>Exposé des faits.</strong> Les faits se sont produits le <strong>' +
                dateEnClair(d.date) + '</strong>, à <strong>' + esc(d.lieu || 'un lieu que je précise ci-après') + '</strong>.');
  corps += d.declaration
    ? para('« ' + esc(d.declaration) + ' »', 'font-style:italic;padding-left:20px;border-left:2px solid #000')
    : para('<em>Aucun récit n’a été enregistré pour ce dossier.</em>');

  if (d.prejudice) {
    corps += para('<strong>Préjudice subi.</strong> ' + esc(d.prejudice.nature) +
      (d.prejudice.montant ? ', évalué à <strong>' + esc(d.prejudice.montant) + ' FCFA</strong>' : '') +
      (d.prejudice.detail ? ' — ' + esc(d.prejudice.detail) : '') + '.');
  }

  corps += para('<strong>Personne mise en cause.</strong> ' +
    (d.misEnCause
      ? esc(d.misEnCause)
      : 'L’auteur des faits ne m’est pas connu à ce jour. Je porte donc plainte contre X.'));

  if (d.pieces && d.pieces.length) {
    corps += para('<strong>Pièces jointes.</strong> À l’appui de ma plainte, je verse les pièces ' +
      'suivantes : ' + d.pieces.map(p => esc(p.nom)).join(', ') + '.');
  }

  corps += para('C’est pourquoi je vous prie de bien vouloir enregistrer la présente plainte, diligenter ' +
    'l’enquête qu’elle appelle et lui réserver la suite que de droit.', 'margin-top:18px');
  corps += para('Je certifie sur l’honneur l’exactitude des faits exposés ci-dessus et n’ignore ' +
    'pas que toute dénonciation calomnieuse expose son auteur aux peines prévues par le Code pénal.');
  corps += para('Dans l’attente d’une suite favorable, je vous prie d’agréer, Monsieur le Commissaire, ' +
    'l’expression de ma haute considération.', 'margin-bottom:34px');

  corps += `
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="width:52%"></td>
        <td style="width:48%;text-align:center;font-size:14px">
          Le plaignant,<br>
          <span style="display:block;border-top:1px solid #000;width:82%;margin:56px auto 4px"></span>
          <strong>${esc(d.plaignant)}</strong>
        </td>
      </tr>
    </table>`;

  return gabaritLettre({
    expediteur: expediteur,
    lieuDate: esc(ville) + ', le ' + dateEnClair(d.date),
    destinataire: destinataire,
    objet: objet,
    corps: corps,
    pied: piedVerification(d.numero)
  });
}

/* ============================================================
   VISIONNEUSE
   Le document devait jusqu'ici passer par la boite d'impression du
   navigateur pour etre lu. L'enqueteur qui instruit doit pouvoir le
   consulter sans quitter l'application : on l'affiche donc dans une page
   au format A4, telle qu'elle sortira a l'impression.
   ============================================================ */

/* opts.classe    : classe du conteneur ('feuille' par defaut, pour un
                    document A4 ; 'piece' pour une image ou un fichier)
   opts.imprimable: masque le bouton d'impression quand il n'a pas de sens */
function afficherDocument(titre, html, opts) {
  opts = opts || {};
  let vue = document.getElementById('visionneuse');
  if (!vue) {
    vue = document.createElement('div');
    vue.id = 'visionneuse';
    vue.className = 'visionneuse';
    vue.setAttribute('role', 'dialog');
    vue.setAttribute('aria-modal', 'true');
    vue.setAttribute('aria-label', 'Aperçu du document');
    vue.innerHTML =
      '<div class="visionneuse-barre">' +
        '<span class="visionneuse-titre" id="visionneuse-titre"></span>' +
        '<div class="visionneuse-actions">' +
          '<button type="button" class="btn btn-outline-white btn-sm visionneuse-imprimer" onclick="imprimerVisionneuse()">Télécharger / Imprimer</button>' +
          '<button type="button" class="btn btn-outline-white btn-sm" onclick="fermerVisionneuse()">Fermer</button>' +
        '</div>' +
      '</div>' +
      '<div class="visionneuse-defilement"><div id="visionneuse-feuille"></div></div>';
    document.body.appendChild(vue);
  }

  document.getElementById('visionneuse-titre').textContent = titre;
  const corps = document.getElementById('visionneuse-feuille');
  corps.className = opts.classe || 'feuille';
  corps.innerHTML = html;

  const btnImp = vue.querySelector('.visionneuse-imprimer');
  if (btnImp) btnImp.style.display = (opts.imprimable === false) ? 'none' : '';

  vue.classList.add('ouverte');
  document.body.style.overflow = 'hidden';
  vue.focus();
}

function fermerVisionneuse() {
  const vue = document.getElementById('visionneuse');
  if (vue) vue.classList.remove('ouverte');
  document.body.style.overflow = '';
}

/* Impression depuis la visionneuse : on reutilise le meme HTML, donc ce
   qui est lu a l'ecran est exactement ce qui sort sur le papier. */
function imprimerVisionneuse() {
  const feuille = document.getElementById('visionneuse-feuille');
  if (feuille) imprimerDocument(feuille.innerHTML);
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fermerVisionneuse();
});

/* ── Points d'entrée ─────────────────────────────────────────
   lire*  : consultation dans l'application
   telecharger* : impression directe, pour qui veut le fichier tout de suite
   ─────────────────────────────────────────────────────────── */
function lireAttestation(numero) {
  afficherDocument('Attestation de dépôt — ' + (numero || numeroCourant()), htmlAttestation(numero));
}
function lirePlainte(numero) {
  afficherDocument('Déclaration de plainte — ' + (numero || numeroCourant()), htmlPlainte(numero));
}
function telechargerAttestationPDF(numero) { imprimerDocument(htmlAttestation(numero)); }
function telechargerPlaintePDF(numero)     { imprimerDocument(htmlPlainte(numero)); }

/* ============================================================
   APERCU D'UNE PIECE JOINTE
   Le nom d'un fichier ne dit pas ce qu'il contient. L'enqueteur doit
   pouvoir l'ouvrir sans le telecharger d'abord.
   ============================================================ */
function extensionDe(nom) {
  return String(nom || '').split('.').pop().toLowerCase();
}

function afficherPiece(piece) {
  if (!piece) return;
  const ext = extensionDe(piece.nom);
  const estImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(ext) !== -1;
  const estPdf   = ext === 'pdf';
  let corps;

  if (piece.url && estImage) {
    corps = '<img src="' + piece.url + '" alt="' + piece.nom + '">';
  } else if (piece.url && estPdf) {
    corps = '<iframe src="' + piece.url + '" title="' + piece.nom + '"></iframe>';
  } else if (piece.url) {
    corps = blocPieceIndisponible(piece, ext,
      'Ce format ne s\'affiche pas dans le navigateur. Téléchargez-le pour le consulter.');
  } else {
    /* Rien n'est invente : sans fichier derriere, on le dit. */
    corps = blocPieceIndisponible(piece, ext,
      'Le fichier n\'est pas encore disponible sur ce poste. Il sera consultable une fois le stockage des pièces raccordé.');
  }

  afficherDocument(piece.nom + (piece.taille ? ' — ' + piece.taille : ''),
                   corps, { classe: 'piece', imprimable: false });
}

function blocPieceIndisponible(piece, ext, message) {
  return '<div class="piece-vide">' +
    '<div class="piece-vide-ext">' + (ext || 'fichier').toUpperCase() + '</div>' +
    '<div class="piece-vide-nom">' + piece.nom + '</div>' +
    (piece.taille ? '<div class="piece-vide-taille">' + piece.taille + '</div>' : '') +
    '<p>' + message + '</p>' +
    (piece.url
      ? '<a class="btn btn-primary btn-sm" href="' + piece.url + '" download="' + piece.nom + '">Télécharger</a>'
      : '') +
  '</div>';
}

/* ============================================================
   CONVOCATION

   Le compte rendu decrit une difficulte precise : c'est en principe le
   plaignant lui-meme qui porte la convocation au mis en cause, ce qui
   l'expose a des represailles. La plateforme permet donc l'envoi
   electronique quand une adresse ou un numero est connu — et, a defaut,
   produit le document a remettre en main propre.

   Le modele reel est une piece a en-tete bilingue pleine largeur : elle
   ne porte pas de colonne administrative, contrairement au PV.
   ============================================================ */
function htmlConvocation(d, conv, destinataire) {
  const versLePlaignant = destinataire === 'plaignant';
  const nom = versLePlaignant ? d.plaignant : (conv.nom || 'La personne mise en cause');
  const qualite = versLePlaignant ? 'plaignant' : 'personne mise en cause';

  /* Les accords etaient figes au feminin — « munie de ses pieces »,
     « entendue » — parce que le modele de reference visait une femme.
     Ils se reglent sur la fiche du plaignant ; du mis en cause, dont le
     sexe n'est pas au dossier, on garde le masculin generique. */
  const fiche = (versLePlaignant && d.citoyen && typeof citoyen === 'function')
    ? citoyen(d.citoyen) : null;
  const e = (fiche && fiche.sexe === 'F') ? 'e' : '';
  const il = (fiche && fiche.sexe === 'F') ? 'elle' : 'il';
  const inc = qualificationDe(d.type);
  const ville = (d.commissariat || '').split(',').pop().trim() || 'Yaoundé';
  const visas = (typeof VISAS_CONVOCATION !== 'undefined')
    ? VISAS_CONVOCATION : 'articles 79, 82 à 92, 103 à 115 du Code de Procédure Pénale';

  /* Une convocation est datée du jour où elle est écrite, non du jour
     où l'on comparaît : l'en-tête reprenait la date de comparution,
     si bien que le document semblait rédigé le jour même. */
  const emise = conv.emise || conv.date;

  /* Le plaignant n'est pas identifie dans le fichier des citoyens quand
     la convocation vise le mis en cause : on ne decline alors que ce
     que le dossier connait de lui. */
  const identite = versLePlaignant
    ? etatCivilPlaignant({ citoyen: d.citoyen, plaignant: d.plaignant })
    : '<strong>' + esc(nom) + '</strong>' +
      (conv.adresse ? ', domicilié à ' + esc(conv.adresse) : '');

  const corps =
    ligneP(ouvertureActe(emise, conv.heureEmission || '') + ',') +
    ligneP('Nous, <strong>' + esc(d.enqueteur || 'l’Officier de Police Judiciaire de permanence') +
           '</strong>, Officier de Police Judiciaire près le ' + esc(d.commissariat) + ',') +
    ligneP('Auxiliaire de Monsieur le Procureur de la République ;') +
    ligneP('Vu les ' + esc(visas) + ' ;') +
    ligneP('Agissant pour faire suite à l’enquête préliminaire en cours au ' +
           esc(d.commissariat) + ', sous le dossier n° <strong>' + esc(d.id) + '</strong> ;') +

    ligneP('<strong>Invitons à comparaître devant nous</strong>, au ' + esc(d.commissariat) +
           ', le <strong>' + dateEnClair(conv.date) + '</strong> à <strong>' +
           heureRonde(conv.heure) + '</strong> précises ;', 'margin-top:14px') +
    ligneP(identite + ', en qualité de <strong>' + qualite + '</strong>, ' +
           'muni' + e + ' de ses pièces d’identité, pour être entendu' + e +
           ' sur les faits ' + esc(deQualif(inc.qualification)) + '.') +

    (conv.motif ? ligneP(esc(conv.motif), 'margin-top:10px') : '') +

    ligneP('L’avisons qu’' + il +
           ' est libre de se faire assister d’un conseil de son choix' +
           (versLePlaignant
             ? '. Sa présence permet le recueil de ses déclarations et l’établissement du ' +
               'procès-verbal d’audition.'
             : ' et qu’en cas de défaillance, ' + (conv.ordre >= 3
                 ? 'la procédure sera transmise en l’état à Monsieur le Procureur de la République'
                 : 'une nouvelle convocation lui sera adressée, la troisième valant dernier avertissement ' +
                   'avant transmission au Parquet') +
               ', conformément aux dispositions du Code de Procédure Pénale.'),
           'margin-top:10px') +

    ligneFin('La présente convocation vaut ' +
             ((typeof ORDINAUX !== 'undefined' && ORDINAUX[(conv.ordre || 1) - 1]) ||
              (conv.ordre || 1) + 'e') + ' convocation.') +

    `<table class="doc-sign"><tr>
       <td style="width:48%"></td>
       <td style="width:52%">
         <span style="font-weight:normal;font-size:13px">${esc(ville)}, le ${dateEnClair(emise)}</span><br>
         L’OFFICIER DE POLICE JUDICIAIRE<br>
         <span style="font-weight:normal;font-size:13px">${esc(d.enqueteur || '')}</span>
         <span class="trait"></span>
       </td>
     </tr></table>`;

  return gabaritConvocation({
    service: d.commissariat,
    numero: numeroOrdre(d.id),
    titre: 'Convocation',
    corps: corps,
    pied: piedVerification(d.id)
  });
}

function lireConvocation(d, conv, destinataire) {
  afficherDocument('Convocation — ' + (destinataire === 'plaignant' ? d.plaignant : conv.nom),
                   htmlConvocation(d, conv, destinataire));
}
