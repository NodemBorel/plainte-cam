/* ============================================================
   DOCUMENTS OFFICIELS — attestation de depot et declaration de plainte

   Ce module etait enferme dans le <script> de citoyen/index.html : les
   documents n'etaient donc telechargeables que depuis l'espace citoyen.
   L'enqueteur qui instruit un dossier doit pouvoir sortir les memes
   pieces. D'ou l'extraction.

   Depend de js/modules/qrcode.js (QR, urlVerification, codeVerification)
   et, quand il est charge, de js/modules/data.js (DOSSIERS).
   ============================================================ */

/* ══════════════════════════════════════════════════════════
   DOCUMENTS OFFICIELS TÉLÉCHARGEABLES

   Deux documents distincts, tous deux imprimables en PDF par
   l'impression native du navigateur :

     • l'attestation de dépôt — preuve que la plainte a été reçue ;
     • la déclaration de plainte — le contenu même de la plainte.

   L'en-tête bilingue, le bloc de vérification et la mécanique
   d'impression sont partagés : les deux documents ne peuvent pas
   dériver l'un de l'autre.
   ══════════════════════════════════════════════════════════ */

const MOIS = ['janvier','février','mars','avril','mai','juin',
              'juillet','août','septembre','octobre','novembre','décembre'];

/* « 15/05/2026 » ou « 2026-05-15 » -> « 15 mai 2026 » */
function dateEnClair(v) {
  if (!v) return '';
  let j, m, a;
  if (v.indexOf('/') !== -1)      { [j, m, a] = v.split('/'); }
  else if (v.indexOf('-') !== -1) { [a, m, j] = v.split('-'); }
  else return v;
  const mi = parseInt(m, 10) - 1;
  return parseInt(j, 10) + ' ' + (MOIS[mi] || m) + ' ' + a;
}

function enteteOfficielle() {
  return `
    <table style="width:100%;text-align:center;font-size:14px;font-weight:bold;margin-bottom:40px;border-collapse:collapse">
      <tr>
        <td style="width:45%;vertical-align:top;line-height:1.4">
          RÉPUBLIQUE DU CAMEROUN<br>
          <span style="font-weight:normal;font-style:italic">Paix - Travail - Patrie</span><br>
          ---------<br>
          DIRECTION GÉNÉRALE DE LA SÛRETÉ NATIONALE
        </td>
        <td style="width:10%;vertical-align:top">
          <div style="width:80px;height:80px;border:2px solid #000;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;text-align:center">DGSN</div>
        </td>
        <td style="width:45%;vertical-align:top;line-height:1.4">
          REPUBLIC OF CAMEROON<br>
          <span style="font-weight:normal;font-style:italic">Peace - Work - Fatherland</span><br>
          ---------<br>
          GENERAL DELEGATION FOR NATIONAL SECURITY
        </td>
      </tr>
    </table>`;
}

function titreDocument(titre, numero) {
  return `
    <div style="text-align:center;margin-bottom:40px">
      <h1 style="margin:0;font-size:26px;text-transform:uppercase;text-decoration:underline;letter-spacing:1px">${titre}</h1>
      <p style="margin:14px 0 0;font-size:19px">Dossier N° <strong>${numero}</strong></p>
    </div>`;
}

/* Bloc de vérification : QR calculé localement + code de contrôle et URL
   en clair, pour que le document reste vérifiable sans lecteur de QR. */
function blocVerification(numero, mentionDroite) {
  return `
    <table style="width:100%;font-size:15px;margin-top:20px">
      <tr>
        <td style="width:50%;vertical-align:top;text-align:left;padding-left:10px">
          <div style="font-weight:bold;margin-bottom:8px;width:150px;text-align:center">Vérification Électronique</div>
          <div style="width:116px;height:116px;border:2px solid #000;margin-left:18px;display:flex;align-items:center;justify-content:center;padding:4px">
            ${QR.svg(urlVerification(numero), { taille: 106, couleur: '#000000', alt: 'Code QR de vérification' })}
          </div>
          <div style="font-size:11px;margin-top:6px;width:240px;line-height:1.5">
            Code de contrôle : <strong>${codeVerification(numero)}</strong><br>
            <span style="font-size:10px">${urlVerification(numero)}</span>
          </div>
        </td>
        <td style="width:50%;vertical-align:bottom;text-align:right;padding-right:10px">
          ${mentionDroite}
        </td>
      </tr>
    </table>`;
}

/* Mécanique d'impression, commune aux deux documents. */
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
    }`;

  document.head.appendChild(style);
  document.body.appendChild(zone);
  /* Le QR est calculé localement : aucun chargement réseau à attendre. */
  window.print();
  setTimeout(() => {
    if (zone.parentNode)  document.body.removeChild(zone);
    if (style.parentNode) document.head.removeChild(style);
  }, 800);
}

/* ── Source des données ──────────────────────────────────────
   Depuis le suivi, le dossier vient de DOSSIERS. Juste après un dépôt,
   il vient du formulaire encore rempli. On ne fabrique rien : si une
   information est absente, elle est signalée comme telle. */
function donneesDossier(numero) {
  const d = (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.find(x => x.id === numero) : null;
  if (d) {
    return {
      numero: d.id, plaignant: d.plaignant, type: d.type,
      date: d.date, heure: d.heure || '',
      lieu: d.lieu || '', declaration: d.declaration || '',
      misEnCause: d.misEnCause || '', prejudice: d.prejudice || null,
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
  return {
    numero: numero,
    plaignant: 'Jean MBIDA',
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
    commissariat: infoComm ? infoComm.textContent.trim() : 'Commissariat compétent',
    statut: 'Transmis pour instruction',
    enqueteur: null
  };
}

function numeroCourant() {
  const el = document.querySelector('#page-confirmation .big-num');
  return (el ? el.textContent : 'N° 2026-00451').replace(/^\s*N°\s*/, '').trim();
}

function ligne(intitule, valeur) {
  return `<tr>
    <td style="padding:11px 14px;border:1px solid #000;width:38%;font-weight:bold">${intitule}</td>
    <td style="padding:11px 14px;border:1px solid #000">${valeur || '<em>non renseigné</em>'}</td>
  </tr>`;
}

/* ══════════ ATTESTATION DE DÉPÔT ══════════ */
function htmlAttestation(numero) {
  const n = numero || numeroCourant();
  const d = donneesDossier(n);

  return (
    enteteOfficielle() +
    titreDocument('Attestation de Dépôt de Plainte', d.numero) + `
    <div style="font-size:17px;line-height:1.8;text-align:justify;margin-bottom:30px">
      <p>Il est certifié par la présente que la déclaration de plainte enregistrée sur la plateforme nationale <strong>PlainteCam</strong> a été formellement reçue et consignée dans nos systèmes sécurisés.</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:15px;margin-bottom:34px">
      <tbody>
        ${ligne("Date d'enregistrement", dateEnClair(d.date) + (d.heure ? ' à ' + d.heure : ''))}
        ${ligne('Identité du plaignant', '<strong>' + d.plaignant + '</strong>')}
        ${ligne("Nature de l'infraction", d.type)}
        ${ligne('Commissariat en charge', d.commissariat)}
        ${ligne('Statut actuel', '<strong>' + d.statut + '</strong>')}
      </tbody>
    </table>
    <div style="font-size:14px;line-height:1.6;text-align:justify;margin-bottom:44px;border-left:4px solid #000;padding-left:18px;font-style:italic">
      <strong>Note importante :</strong> ce document numérique est généré automatiquement par le système central PlainteCam. Il fait foi de la date certaine du dépôt de votre plainte. L'officier de police judiciaire en charge du dossier vous contactera pour la suite de la procédure et l'audition. Toute fausse déclaration expose son auteur aux sanctions prévues par le Code pénal.
    </div>` +
    blocVerification(d.numero, `
      <div style="margin-bottom:26px">Fait à Yaoundé, le ${dateEnClair(d.date)}</div>
      <div style="font-weight:bold;margin-bottom:12px">Pour la Délégation Générale,<br>Le Système Central PlainteCam</div>
      <div style="font-size:13px;margin-bottom:34px">(Signature électronique et cachet numérique)</div>
      <div style="display:inline-block;border-bottom:1px solid #000;width:220px"></div>`)
  );
}

/* ══════════ DÉCLARATION DE PLAINTE ══════════ */
function htmlPlainte(numero) {
  const n = numero || numeroCourant();
  const d = donneesDossier(n);

  const prej = d.prejudice ? `
    <p style="font-weight:bold;margin:26px 0 8px">III. PRÉJUDICE SUBI</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      <tbody>
        ${ligne('Nature du préjudice', d.prejudice.nature)}
        ${d.prejudice.montant ? ligne('Montant estimé', d.prejudice.montant + ' FCFA') : ''}
        ${d.prejudice.detail  ? ligne('Précisions', d.prejudice.detail) : ''}
      </tbody>
    </table>` : '';

  return (
    enteteOfficielle() +
    titreDocument('Déclaration de Plainte', d.numero) + `
    <p style="font-weight:bold;margin:0 0 8px">I. IDENTITÉ ET OBJET</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      <tbody>
        ${ligne('Plaignant', '<strong>' + d.plaignant + '</strong>')}
        ${ligne("Nature de l'infraction", d.type)}
        ${ligne('Date des faits', dateEnClair(d.date))}
        ${ligne('Lieu des faits', d.lieu)}
        ${ligne('Commissariat compétent', d.commissariat)}
        ${d.enqueteur ? ligne('Enquêteur désigné', d.enqueteur) : ''}
      </tbody>
    </table>

    <p style="font-weight:bold;margin:26px 0 8px">II. EXPOSÉ DES FAITS</p>
    <div style="font-size:15px;line-height:1.85;text-align:justify;border:1px solid #000;padding:16px 18px">
      ${d.declaration
        ? '« ' + d.declaration + ' »'
        : '<em>Aucune déclaration enregistrée pour ce dossier.</em>'}
    </div>
    ${prej}

    <p style="font-weight:bold;margin:26px 0 8px">IV. MIS EN CAUSE</p>
    <div style="font-size:15px;line-height:1.7;border:1px solid #000;padding:14px 18px">
      ${d.misEnCause || '<em>Mis en cause inconnu du plaignant à la date de la déclaration.</em>'}
    </div>

    <div style="font-size:14px;line-height:1.6;text-align:justify;margin:30px 0 36px;border-left:4px solid #000;padding-left:18px;font-style:italic">
      <strong>Mention légale :</strong> la présente déclaration reproduit les informations saisies par le plaignant sur la plateforme PlainteCam. Elle ne constitue pas un procès-verbal d'audition : celui-ci est établi par l'officier de police judiciaire lors de l'audition. Toute fausse déclaration expose son auteur aux sanctions prévues par le Code pénal camerounais.
    </div>` +
    blocVerification(d.numero, `
      <div style="margin-bottom:26px">Déclaration établie le ${dateEnClair(d.date)}${d.heure ? ' à ' + d.heure : ''}</div>
      <div style="font-weight:bold;margin-bottom:44px">Signature du déclarant<br><span style="font-weight:normal;font-size:14px">${d.plaignant}</span></div>
      <div style="display:inline-block;border-bottom:1px solid #000;width:220px"></div>`)
  );
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
   ============================================================ */
function htmlConvocation(d, conv, destinataire) {
  const versLePlaignant = destinataire === 'plaignant';
  const nom = versLePlaignant ? d.plaignant : (conv.nom || 'La personne mise en cause');
  const qualite = versLePlaignant ? 'plaignant' : 'personne mise en cause';

  return enteteOfficielle() +
    titreDocument('Convocation', d.id) + `
    <p style="text-align:right;font-size:14px;margin:0 0 26px">
      ${/* Une convocation est datée du jour où elle est écrite, non du jour
           où l'on comparaît : l'en-tête reprenait la date de comparution,
           si bien que le document semblait rédigé le jour même. */
         d.commissariat || 'Commissariat compétent'}, le ${dateEnClair(conv.emise || conv.date)}
    </p>

    <p style="font-size:16px;line-height:1.9;text-align:justify">
      Nous, officier de police judiciaire près le ${d.commissariat || 'commissariat compétent'},
      invitons <strong>${nom}</strong>, en qualité de <strong>${qualite}</strong>,
      à se présenter dans nos locaux&nbsp;:
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:15px;margin:24px 0">
      <tbody>
        ${ligne('Date de comparution', '<strong>' + dateEnClair(conv.date) + '</strong>')}
        ${ligne('Heure', '<strong>' + (conv.heure || '') + '</strong>')}
        ${ligne('Lieu', d.commissariat || '—')}
        ${ligne('Dossier concerné', 'N° ' + d.id + ' — ' + d.type)}
        ${ligne('Rang de la convocation', (conv.ordre || 1) + (conv.ordre === 1 ? 're' : 'e') + ' convocation')}
      </tbody>
    </table>

    <p style="font-size:15px;line-height:1.8;text-align:justify">${conv.motif || ''}</p>

    <p style="font-size:14px;line-height:1.7;text-align:justify;border-left:4px solid #000;padding-left:18px;font-style:italic;margin:24px 0 40px">
      Munissez-vous d'une pièce d'identité. ${versLePlaignant
        ? "Votre présence permet le recueil de vos déclarations et l'établissement du procès-verbal d'audition."
        : "En cas d'absence non justifiée, une nouvelle convocation vous sera adressée. Après trois absences, le dossier est transmis au procureur de la République."}
    </p>` +
    blocVerification(d.id, `
      <div style="font-weight:bold;margin-bottom:44px">L'officier de police judiciaire<br>
        <span style="font-weight:normal;font-size:14px">${d.enqueteur || ''}</span></div>
      <div style="display:inline-block;border-bottom:1px solid #000;width:220px"></div>`);
}

function lireConvocation(d, conv, destinataire) {
  afficherDocument('Convocation — ' + (destinataire === 'plaignant' ? d.plaignant : conv.nom),
                   htmlConvocation(d, conv, destinataire));
}
