/* ============================================================
   Espace Citoyen — depot de plainte, suivi, vocal
   ============================================================ */

let depotStep = 1;
const depotData = {};

function updateDepotSteps() {
  document.querySelectorAll('.step-item').forEach((el, i) => {
    const num = i + 1;
    const circle = el.querySelector('.step-circle');
    if (num < depotStep) { circle.className = 'step-circle done'; circle.textContent = '✓'; }
    else if (num === depotStep) { circle.className = 'step-circle active'; circle.textContent = num; }
    else { circle.className = 'step-circle'; circle.textContent = num; }
  });
  document.querySelectorAll('.step-connector').forEach((el, i) => {
    el.classList.toggle('done', i + 1 < depotStep);
  });
  document.querySelectorAll('.depot-section').forEach(s => {
    s.style.display = parseInt(s.dataset.step) === depotStep ? '' : 'none';
  });
  document.getElementById('btn-prev-step').disabled = depotStep === 1;
  const btnNext = document.getElementById('btn-next-step');
  btnNext.textContent = 'Continuer';
  btnNext.style.display = depotStep === 5 ? 'none' : '';
  document.getElementById('btn-prev-step').style.display = depotStep === 5 ? 'none' : '';
  if (depotStep === 4) startQuestionnaire();
  if (depotStep === 5) buildRecap();
}

function nextDepotStep() {
  if (depotStep < 5) {
    depotStep++;
    updateDepotSteps();
    sauverBrouillon();
  } else {
    submitPlainte();
  }
  /* Quitter l'etape 5 interrompt la lecture vocale en cours. */
  if (depotStep !== 5 && typeof arreterLecture === 'function') arreterLecture();
}

function buildRecap() {
  const nature   = document.getElementById('nature-infraction').value || 'Non renseigne';
  const lieu     = document.getElementById('lieu-faits').value || 'Non renseigne';
  const dateEl   = document.querySelector('[data-step="1"] input[type="date"]');
  const dateFait = dateEl ? dateEl.value : '';
  const desc     = document.getElementById('declaration-text').value || '';

  const nomMec   = document.getElementById('mec-nom');
  const descMec  = document.getElementById('mec-description');
  const nomMecVal  = nomMec  && nomMec.value.trim()  ? nomMec.value.trim()  : null;
  const descMecVal = descMec && descMec.value.trim() ? descMec.value.trim() : null;

  /* Les cles de qaAnswers sont desormais les intitules reels des questions,
     plus 'Q1'/'Q2' : le document affichait « Q1 | Oui ». */
  const reponsesHtml = Object.keys(qaAnswers).length
    ? '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px">' +
        Object.entries(qaAnswers).map(([k,v]) =>
          `<tr><td style="padding:5px 8px;border:1px solid var(--gray-2);color:var(--text-light);width:52%">${echapper(k)}</td><td style="padding:5px 8px;border:1px solid var(--gray-2)">${echapper(v)}</td></tr>`
        ).join('') +
      '</table>'
    : '<em style="color:var(--gray-3)">Aucune question complémentaire</em>';

  /* ── Préjudice subi (§7.2) ── */
  const prejNature = (document.getElementById('prejudice-nature') || {}).value || '';
  const prejMontant = ((document.getElementById('prejudice-montant') || {}).value || '').trim();
  const prejDetail  = ((document.getElementById('prejudice-detail')  || {}).value || '').trim();
  const prejudiceHtml = prejNature ? `
      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Préjudice subi :</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        <tr><td style="padding:6px 10px;border:1px solid var(--gray-2);font-weight:600;background:var(--gray-1);width:35%">Nature</td><td style="padding:6px 10px;border:1px solid var(--gray-2)">${echapper(prejNature)}</td></tr>
        ${prejMontant ? `<tr><td style="padding:6px 10px;border:1px solid var(--gray-2);font-weight:600;background:var(--gray-1)">Montant estimé</td><td style="padding:6px 10px;border:1px solid var(--gray-2)">${echapper(prejMontant)} FCFA</td></tr>` : ''}
        ${prejDetail  ? `<tr><td style="padding:6px 10px;border:1px solid var(--gray-2);font-weight:600;background:var(--gray-1)">Précisions</td><td style="padding:6px 10px;border:1px solid var(--gray-2)">${echapper(prejDetail)}</td></tr>` : ''}
      </table>` : '';

  /* ── Pièces jointes ── */
  const pjHtml = piecesJointes.length ? `
      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Pièces jointes (${piecesJointes.length}) :</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        ${piecesJointes.map(f => `<tr><td style="padding:5px 10px;border:1px solid var(--gray-2)">${echapper(f.name)}</td><td style="padding:5px 10px;border:1px solid var(--gray-2);width:110px;text-align:right">${tailleLisible(f.size)}</td></tr>`).join('')}
      </table>` : '';

  const body = document.getElementById('apercu-body');
  if (body) {
    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8;width:35%">Type d'infraction</td><td style="padding:6px 10px;border:1px solid #ddd">${nature}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Date des faits</td><td style="padding:6px 10px;border:1px solid #ddd">${dateFait || 'Non precisee'}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Lieu des faits</td><td style="padding:6px 10px;border:1px solid #ddd">${lieu}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Commissariat competent</td><td style="padding:6px 10px;border:1px solid #ddd">${echapper(commissariatCompetent || 'Non renseigné')}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Plaignant</td><td style="padding:6px 10px;border:1px solid #ddd">${
          typeof citoyenCourant === 'function' ? nomCitoyen(citoyenCourant()) : ''
        }</td></tr>
      </table>

      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Déclaration du plaignant :</p>
      <div style="background:var(--gray-1);border-left:3px solid var(--primary);padding:12px;border-radius:var(--radius-sm);font-style:italic;font-size:13px;line-height:1.7;margin-bottom:18px">
        "${echapper(desc) || 'Aucune déclaration saisie.'}"
      </div>

      ${nomMecVal || descMecVal ? `
      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Mis en cause :</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        ${nomMecVal  ? `<tr><td style="padding:6px 10px;border:1px solid var(--gray-2);font-weight:600;background:var(--gray-1);width:35%">Identité</td><td style="padding:6px 10px;border:1px solid var(--gray-2)">${echapper(nomMecVal)}</td></tr>` : ''}
        ${descMecVal ? `<tr><td style="padding:6px 10px;border:1px solid var(--gray-2);font-weight:600;background:var(--gray-1)">Description physique</td><td style="padding:6px 10px;border:1px solid var(--gray-2)">${echapper(descMecVal)}</td></tr>` : ''}
      </table>` : ''}

      ${prejudiceHtml}
      ${pjHtml}

      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Informations complémentaires :</p>
      ${reponsesHtml}
    `;
  }

  const mini = document.getElementById('recap-mini');
  if (mini) {
    mini.innerHTML =
      `<div><strong>Type :</strong> ${nature}</div>` +
      `<div><strong>Date :</strong> ${dateFait || '—'}</div>` +
      `<div><strong>Lieu :</strong> ${lieu.split(',')[0] || lieu}</div>` +
      (nomMecVal ? `<div><strong>Mis en cause :</strong> ${nomMecVal}</div>` : '') +
      `<div><strong>Questions completees :</strong> ${Object.keys(qaAnswers).length}</div>`;
  }
}

function rejectAndCorrect() {
  openModal('modal-corriger');
}

function goToStep(step) {
  closeModal('modal-corriger');
  depotStep = step;
  updateDepotSteps();
  document.getElementById('btn-next-step').textContent = 'Continuer';
}

function submitPlainte() {
  arreterLecture();
  /* La declaration est transmise : le brouillon local n'a plus de raison d'etre. */
  supprimerBrouillon(false);
  showPage('page-confirmation');
  majAttestation();
  toast('Plainte transmise au commissariat','success');
}

/* Renseigne le QR et le code de controle de l'attestation affichee. */
function majAttestation() {
  var elNum = document.querySelector('#page-confirmation .big-num');
  if (!elNum || typeof rendreQR !== 'function') return;
  var num = elNum.textContent.replace(/^\s*N°\s*/, '').trim();
  rendreQR('qr-attestation', num, 104);
  var elCode = document.getElementById('code-verif');
  if (elCode) elCode.textContent = codeVerification(num);
}

/* ── SAISIE VOCALE SIMULEE ───────────────────────────────── */
let isRecording = false;
let recTimer = null;
let recSecs = 0;
const FAKE_TRANSCRIPTIONS = [
  'Le quinze mai deux mille vingt-six, ',
  'vers quatorze heures, ',
  'je me trouvais au marche Mokolo a Yaounde. ',
  'Un individu inconnu, jeune, environ vingt-cinq ans, ',
  'a arrache mon telephone Samsung Galaxy de couleur noire ',
  'et a pris la fuite en direction de la rue principale. ',
  'La valeur du telephone est de cent cinquante mille francs CFA. ',
  "Je n'ai pas pu identifier le suspect clairement."
];
let transIdx = 0;
let transText = '';

function toggleRecording() {
  const btn = document.getElementById('mic-btn');
  const statusEl = document.getElementById('rec-status');
  const timerEl = document.getElementById('rec-timer');
  const transEl = document.getElementById('transcription-live');
  const transcribeBtn = document.getElementById('validate-transcription');

  if (!isRecording) {
    isRecording = true;
    btn.classList.add('recording');
    btn.innerHTML = icone('stop', 26);
    btn.setAttribute('aria-label', 'Arrêter l\'enregistrement');
    btn.setAttribute('aria-pressed', 'true');
    statusEl.textContent = 'Enregistrement en cours...';
    statusEl.style.color = 'var(--red)';
    transIdx = 0; transText = '';
    transEl.textContent = '';

    recSecs = 0;
    recTimer = setInterval(() => {
      recSecs++;
      const m = String(Math.floor(recSecs / 60)).padStart(2, '0');
      const s = String(recSecs % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
      if (transIdx < FAKE_TRANSCRIPTIONS.length) {
        transText += FAKE_TRANSCRIPTIONS[transIdx++];
        transEl.textContent = transText;
      }
    }, 900);
  } else {
    isRecording = false;
    clearInterval(recTimer);
    btn.classList.remove('recording');
    btn.innerHTML = icone('micro', 26);
    btn.setAttribute('aria-label', 'Démarrer l\'enregistrement');
    btn.setAttribute('aria-pressed', 'false');
    statusEl.textContent = 'Enregistrement terminé';
    statusEl.style.color = 'var(--green-lt)';
    if (transcribeBtn) transcribeBtn.style.display = '';
    const mainTxt = document.getElementById('declaration-text');
    if (mainTxt && transText) mainTxt.value = transText;
    toast('Transcription terminée','success');
  }
}

function validateTranscription() {
  const transEl = document.getElementById('transcription-live');
  const mainTxt = document.getElementById('declaration-text');
  if (mainTxt && transEl) mainTxt.value = transEl.textContent;
  document.getElementById('mode-vocal').style.display = 'none';
  document.getElementById('mode-texte').style.display = '';
  toast('Transcription validée','success');
}

/* ── ICONOGRAPHIE ────────────────────────────────────────────
   Jeu d'icones au trait, grille 16x16, monochrome : la couleur est
   heritee de currentColor, donc pilotee par la charte. Remplace les
   emoji, qui rendaient differemment selon l'OS et affaiblissaient le
   caractere institutionnel des documents.
   ─────────────────────────────────────────────────────────── */
const ICON_PATHS = {
  recu:    '<path d="M8 2.25v6.5"/><path d="M5.5 6.25 8 8.75l2.5-2.5"/><path d="M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2"/>',
  loupe:   '<circle cx="7" cy="7" r="4.25"/><path d="M10.2 10.2 14 14"/>',
  tribunal:'<path d="M2 6.5 8 2.5l6 4"/><path d="M3.5 6.75v6.75"/><path d="M12.5 6.75v6.75"/><path d="M6.25 13.5V9.75"/><path d="M9.75 13.5V9.75"/><path d="M2 13.5h12"/>',
  balance: '<path d="M8 2.5v11"/><path d="M4.5 13.5h7"/><path d="M3 5.25h10"/><path d="M3 5.25 1.5 9h3z"/><path d="M13 5.25 11.5 9h3z"/>',
  valide:  '<circle cx="8" cy="8" r="5.75"/><path d="M5.5 8.25 7.25 10l3.25-4"/>',
  courriel:'<rect x="1.75" y="3.5" width="12.5" height="9" rx="1"/><path d="m2.25 4.25 5.75 4 5.75-4"/>',
  batiment:'<path d="M3.5 13.5v-10a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10"/><path d="M2 13.5h12"/><path d="M6 5.5h1.25M8.75 5.5H10M6 8h1.25M8.75 8H10"/><path d="M7 13.5V11h2v2.5"/>',
  agent:   '<circle cx="8" cy="5.5" r="2.5"/><path d="M3.25 13.5a4.75 4.75 0 0 1 9.5 0"/>',
  horloge: '<circle cx="8" cy="8" r="5.75"/><path d="M8 4.75V8l2.5 1.5"/>',
  attente: '<path d="M4.5 2.5h7"/><path d="M4.5 13.5h7"/><path d="M5.5 2.5v2.25L8 7.5l2.5-2.75V2.5"/><path d="M5.5 13.5v-2.25L8 8.5l2.5 2.75v2.25"/>',
  document:'<path d="M9 2.5H4.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6z"/><path d="M9 2.5V6h3.5"/>',
  message: '<path d="M2.5 4.25a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1H6.75L4 13.25V10.75h-.5a1 1 0 0 1-1-1z"/>',
  etape:   '<circle cx="8" cy="8" r="5.75"/><path d="M8 5.25v5.5M5.25 8h5.5"/>',
  micro:   '<rect x="6.25" y="1.75" width="3.5" height="7" rx="1.75"/><path d="M4 7.25v1.25a4 4 0 0 0 8 0V7.25"/><path d="M8 12.5v1.75"/>',
  stop:    '<rect x="4" y="4" width="8" height="8" rx="1.25"/>',
};

function icone(nom, taille) {
  const p = ICON_PATHS[nom];
  if (!p) return '';
  const s = taille || 16;
  return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="currentColor"`
       + ` stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`
       + ` aria-hidden="true" style="flex-shrink:0">${p}</svg>`;
}

/* ── SUIVI CITOYEN ───────────────────────────────────────── */
function initSuivi() {
  const num = document.getElementById('suivi-numero').value.trim();
  if (!num) return;
  const d = DOSSIERS.find(d => d.id === num) || DOSSIERS[0];
  const result = document.getElementById('suivi-result');
  result.style.display = '';

  const statut = d.statut;
  const statutInfo = STATUT_LABELS[statut];
  const badgeClass = statutInfo[0];
  const badgeLabel = statutInfo[1];

  /* Couleur, icone et message selon statut.
     Les rgba() reprennent les canaux des jetons de 01-tokens.css : elles
     servent de teintes, que var() seule ne permet pas de moduler en opacite. */
  const statutMeta = {
    'RECU':           { col: 'var(--primary)',    tint: 'rgba(11,30,69,.05)',  edge: 'rgba(11,30,69,.16)',  icon: 'recu',     msg: 'Votre plainte a bien été reçue et est en attente d\'affectation.' },
    'EN_INSTRUCTION': { col: 'var(--orange)',     tint: 'rgba(201,106,0,.06)', edge: 'rgba(201,106,0,.20)', icon: 'loupe',    msg: 'Un enquêteur a été désigné et instruit votre dossier.' },
    'AUDITION':       { col: 'var(--gold)',       tint: 'rgba(201,139,0,.07)', edge: 'rgba(201,139,0,.22)', icon: 'tribunal', msg: 'Une convocation d\'audition vous sera adressée prochainement.' },
    'DECISION':       { col: 'var(--primary-lt)', tint: 'rgba(23,45,106,.05)', edge: 'rgba(23,45,106,.16)', icon: 'balance',  msg: 'Le dossier est en cours de délibération.' },
    'CLOTURE':        { col: 'var(--green-lt)',   tint: 'rgba(20,94,46,.06)',  edge: 'rgba(20,94,46,.18)',  icon: 'valide',   msg: 'Le dossier est clôturé. Merci pour votre confiance.' },
  };
  const meta = statutMeta[statut] || statutMeta['RECU'];

  result.innerHTML = `
    <!-- Résumé statut principal -->
    <div style="background: ${meta.tint}; border: 1px solid ${meta.edge}; border-radius: var(--radius); padding: 24px; margin-bottom: 24px; display: flex; gap: 18px; align-items: center; flex-wrap: wrap;">
      <div style="width: 48px; height: 48px; border-radius: var(--radius); background: var(--white); border: 1px solid ${meta.edge}; color: ${meta.col}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        ${icone(meta.icon, 22)}
      </div>
      <div style="flex: 1; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
          <span style="font-size: 20px; font-weight: 700; color: var(--primary);">Dossier N° ${d.id}</span>
          <span class="badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <p style="font-size: 14px; color: var(--text-light); margin: 0;">${meta.msg}</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 7px; flex-shrink: 0;">
        <button class="btn btn-primary btn-sm" style="gap: 7px; justify-content: flex-start;" onclick="telechargerAttestationPDF('${d.id}')">
          ${icone('document', 14)} Attestation PDF
        </button>
        <button class="btn btn-outline btn-sm" style="gap: 7px; justify-content: flex-start;" onclick="telechargerPlaintePDF('${d.id}')">
          ${icone('document', 14)} Ma plainte PDF
        </button>
      </div>
    </div>

    <!-- Grille d'infos dossier — auto-fit : passe seule en 1 colonne sur mobile -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card" style="padding: 20px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-light); margin-bottom: 12px;">Informations dossier</div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Plaignant</span>
            <span style="font-weight: 600;">${d.plaignant}</span>
          </div>
          <div style="height: 1px; background: var(--gray-2);"></div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Type d'infraction</span>
            <span style="font-weight: 600;">${d.type}</span>
          </div>
          <div style="height: 1px; background: var(--gray-2);"></div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Date de dépôt</span>
            <span style="font-weight: 600;">${d.date}</span>
          </div>
        </div>
      </div>
      <div class="card" style="padding: 20px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-light); margin-bottom: 12px;">Traitement</div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Commissariat</span>
            <span style="font-weight: 600;">${echapper(d.commissariat || 'Non renseigné')}</span>
          </div>
          <div style="height: 1px; background: var(--gray-2);"></div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Enquêteur assigné</span>
            <span style="font-weight: 600;">${d.enqueteur
              ? echapper(d.enqueteur)
              : '<span style="color:var(--text-light);font-weight:500">Pas encore affecté</span>'}</span>
          </div>
          <div style="height: 1px; background: var(--gray-2);"></div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Réception</span>
            <span style="font-weight: 600; color: var(--green-lt); display: inline-flex; align-items: center; gap: 5px;">${icone('valide', 13)} Confirmée</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline de traitement -->
    <div class="card" style="padding: 28px;">
      <div style="font-size: 15px; font-weight: 700; color: var(--primary); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
        Historique de traitement
      </div>
      <div style="position: relative;">
        ${buildTimeline(d)}
      </div>
    </div>
  `;
}

/* Ordre chronologique. Les dates sont au format JJ/MM/AAAA et HHhMM. */
function horodatage(e) {
  const [j, m, a] = (e.date || '01/01/1970').split('/');
  const [hh, mm]  = (e.heure || '00h00').split('h');
  return new Date(+a, +m - 1, +j, +hh || 0, +mm || 0).getTime();
}

/* Construit la frise par étapes de la procédure.
   Les messages de l'enquêteur ne sont pas des étapes : ils se rattachent à
   l'étape en cours au moment où ils ont été écrits, et se déplient à la
   demande pour ne pas noyer le fil de la procédure. */
function buildTimeline(dossier) {
  const evts = (typeof historiqueCitoyen === 'function' ? historiqueCitoyen(dossier.id) : []);
  if (!evts.length) {
    return `<p style="font-size:13px;color:var(--text-light);margin:0">
      Aucun évènement enregistré pour ce dossier.</p>`;
  }

  const etapes = (typeof ETAPES !== 'undefined') ? ETAPES : [];
  const ordre  = (typeof ORDRE_ETAPES !== 'undefined') ? ORDRE_ETAPES : [];
  const rang   = ordre.indexOf(dossier.statut);
  const clos   = dossier.statut === 'CLOTURE';

  return etapes.map((et, i) => {
    const r        = ordre.indexOf(et.cle);
    const franchie = clos || r < rang;
    const courante = !clos && r === rang;
    const dernier  = i === etapes.length - 1;

    const dedans   = evts.filter(e => e.etape === et.cle)
                         .sort((a, b) => horodatage(a) - horodatage(b));
    const actes    = dedans.filter(e => e.type !== 'message');
    const messages = dedans.filter(e => e.type === 'message');

    const couleur = franchie ? 'var(--green-lt)' : courante ? 'var(--primary)' : 'var(--gray-3)';
    const fond    = franchie ? 'rgba(20,94,46,.08)' : courante ? 'rgba(11,30,69,.07)' : 'var(--gray-1)';
    const filet   = (franchie || courante) ? 'var(--green-lt)' : 'var(--gray-2)';
    const ic      = icone(franchie ? 'valide' : et.icon, 17);

    return `
      <div style="display:flex;gap:16px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:36px;height:36px;border-radius:50%;background:${fond};border:1.5px solid ${couleur};color:${couleur};display:flex;align-items:center;justify-content:center;z-index:1">${ic}</div>
          ${dernier ? '' : `<div style="width:1.5px;flex:1;min-height:34px;background:${filet};margin:4px 0"></div>`}
        </div>
        <div style="flex:1;min-width:0;padding-bottom:${dernier ? '0' : '24px'}">
          <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">
            <span style="font-size:14.5px;font-weight:700;color:${courante || franchie ? 'var(--primary)' : 'var(--text-light)'}">${et.libelle}</span>
            ${courante ? '<span class="badge badge-blue">En cours</span>' : ''}
          </div>
          ${actes.length ? `<ul class="fil-actes">${actes.map(acteHtml).join('')}</ul>`
                         : `<div style="font-size:13px;color:var(--text-light);margin-top:3px">${et.attente}</div>
                            <div style="font-size:12px;margin-top:5px;font-weight:500;display:inline-flex;align-items:center;gap:5px;color:var(--text-light)">${icone('attente', 12)}À venir</div>`}
          ${messages.length ? blocMessages(messages) : ''}
        </div>
      </div>`;
  }).join('');
}

/* Acte de procédure : une ligne, son intitulé et son horodatage. */
function acteHtml(e) {
  return `<li>
    <span class="fil-acte-txt">
      <strong>${echapper(e.libelle)}</strong>
      ${e.detail ? `<span>${echapper(e.detail)}</span>` : ''}
    </span>
    <span class="fil-acte-date">${echapper(e.date)}${e.heure ? ' · ' + echapper(e.heure) : ''}</span>
  </li>`;
}

/* Messages repliés par défaut, sauf s'il n'y en a qu'un : le plaignant ne
   doit pas avoir à chercher la seule chose qu'on lui a écrite.
   <details> plutôt qu'un accordéon en JS : accessible au clavier, et le
   contenu reste présent à l'impression. */
function blocMessages(messages) {
  const n = messages.length;
  return `
    <details class="fil-messages" ${n === 1 ? 'open' : ''}>
      <summary>
        ${icone('message', 14)}
        <span>${n} message${n > 1 ? 's' : ''} de votre enquêteur</span>
        <span class="fil-chevron" aria-hidden="true"></span>
      </summary>
      <div class="fil-messages-corps">
        ${messages.map(messageHtml).join('')}
      </div>
    </details>`;
}

function messageHtml(e) {
  const pieces = (e.pieces && e.pieces.length) ? `
    <div class="fil-pieces">
      ${e.pieces.map(p => `
        ${p.url
          ? `<a class="fil-piece" href="${p.url}" download="${echapper(p.nom)}">`
          : `<span class="fil-piece">`}
          ${icone('document', 13)}
          <span class="fil-piece-nom">${echapper(p.nom)}</span>
          <span class="fil-piece-taille">${echapper(p.taille || '')}</span>
        ${p.url ? '</a>' : '</span>'}`).join('')}
    </div>` : '';

  return `
    <article class="fil-message">
      <header>
        <span class="badge badge-gold">${echapper(e.auteur || 'Enquêteur')}</span>
        <span class="fil-message-date">${echapper(e.date)}${e.heure ? ' à ' + echapper(e.heure) : ''}</span>
      </header>
      <p>${echapper(e.texte)}</p>
      ${pieces}
    </article>`;
}

function downloadAttestation() {
  if (typeof telechargerAttestationPDF === 'function') {
    telechargerAttestationPDF();
  }
}

/* ============================================================
   UTILITAIRES
   ============================================================ */

/* Le contenu saisi par le plaignant est reinjecte dans le document via
   innerHTML : il doit etre neutralise (§8.2 — protection XSS). */

function tailleLisible(o) {
  if (o < 1024) return o + ' o';
  if (o < 1024 * 1024) return (o / 1024).toFixed(0) + ' Ko';
  return (o / (1024 * 1024)).toFixed(1).replace('.', ',') + ' Mo';
}

/* ============================================================
   PREJUDICE SUBI  (§7.2 — etape 5 du parcours documente)
   ============================================================ */
function onPrejudiceChange() {
  var nature = document.getElementById('prejudice-nature').value;
  var grp = document.getElementById('grp-prejudice-montant');
  /* Un prejudice moral ou inexistant ne se chiffre pas. */
  var chiffrable = ['Matériel', 'Financier', 'Multiple'].indexOf(nature) !== -1;
  if (grp) grp.style.visibility = chiffrable ? '' : 'hidden';
  var err = document.getElementById('err-prejudice-nature');
  if (err && nature) err.textContent = '';
  sauverBrouillon();
}

/* ============================================================
   PIECES JOINTES  (§5.1 perimetre, §7.2 etape 6)
   ============================================================ */
var piecesJointes = [];

var PJ_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
var PJ_EXT   = ['jpg', 'jpeg', 'png', 'pdf', 'mp4'];
var PJ_MAX   = 20 * 1024 * 1024;   /* 20 Mo par fichier, comme le §7.2 */

function ajouterPiecesJointes(fileList) {
  var refus = [];
  Array.prototype.forEach.call(fileList || [], function(f) {
    var ext = (f.name.split('.').pop() || '').toLowerCase();
    if (PJ_TYPES.indexOf(f.type) === -1 && PJ_EXT.indexOf(ext) === -1) {
      refus.push(f.name + ' : format non accepté');
      return;
    }
    if (f.size > PJ_MAX) {
      refus.push(f.name + ' : ' + tailleLisible(f.size) + ', au-delà des 20 Mo autorisés');
      return;
    }
    var doublon = piecesJointes.some(function(p) {
      return p.name === f.name && p.size === f.size;
    });
    if (doublon) { refus.push(f.name + ' : déjà joint'); return; }
    piecesJointes.push(f);
  });

  var err = document.getElementById('err-pj-input');
  if (err) err.innerHTML = refus.map(echapper).join('<br>');

  document.getElementById('pj-input').value = '';   /* permet de rechoisir le meme fichier */
  renderPiecesJointes();
  if (piecesJointes.length && !refus.length) {
    toast(piecesJointes.length + ' pièce' + (piecesJointes.length > 1 ? 's' : '') + ' jointe' + (piecesJointes.length > 1 ? 's' : ''), 'success');
  }
}

function retirerPieceJointe(i) {
  piecesJointes.splice(i, 1);
  renderPiecesJointes();
}

function renderPiecesJointes() {
  var ul = document.getElementById('pj-liste');
  if (!ul) return;
  ul.innerHTML = piecesJointes.map(function(f, i) {
    return '<li class="pj-item">' +
      '<span class="pj-item-icone">' + icone('document', 15) + '</span>' +
      '<span class="pj-item-nom" title="' + echapper(f.name) + '">' + echapper(f.name) + '</span>' +
      '<span class="pj-item-taille">' + tailleLisible(f.size) + '</span>' +
      '<button type="button" class="pj-item-retirer" onclick="retirerPieceJointe(' + i + ')" aria-label="Retirer ' + echapper(f.name) + '">' +
        '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>' +
      '</button>' +
    '</li>';
  }).join('');
}

/* ============================================================
   ANALYSE EN DIRECT  (§7.3 score, §9.3 jauge et seuils)
   ============================================================ */
var LIBELLES_SIGNAUX = {
  objet: 'Objet concerné', heure: 'Moment des faits', suspect: 'Description du suspect',
  temoin: 'Témoins', facture: 'Justificatif', signale: 'Démarche antérieure',
  blessure: 'Blessures', medecin: 'Prise en charge médicale', arme: 'Arme',
  nombre: 'Nombre d\'agresseurs', description: 'Signalement physique',
  auteur: 'Auteur identifié', recurrence: 'Faits répétés', preuve: 'Preuves',
  certificat: 'Certificat médical', mobile: 'Mobile', contact: 'Mode de contact',
  montant: 'Montant', identite: 'Identité du suspect', virement: 'Moyen de paiement',
  delai: 'Délai de déclaration', nature: 'Nature des faits', duree: 'Durée',
  demande: 'Démarche auprès de l\'auteur', autre_victime: 'Autres victimes',
  bien: 'Bien concerné', valeur: 'Valeur des dégâts', photo: 'Photos',
  vehicule: 'Véhicules impliqués', blesse: 'Blessés', fuite: 'Présence de l\'autre partie',
  immat: 'Immatriculation', constat: 'Constat', pv: 'PV déjà établi'
};

function majAnalyseLive() {
  var bloc = document.getElementById('analyse-live');
  if (!bloc || typeof analyserSignaux !== 'function') return;

  var texte  = (document.getElementById('declaration-text') || {}).value || '';
  var nature = (document.getElementById('nature-infraction') || {}).value || 'Autre';
  var detail = analyserSignaux(texte, nature);
  var score  = detail.length
    ? Math.round(detail.filter(function(s) { return s.trouve; }).length / detail.length * 100)
    : 0;

  /* Seuils du §9.3 : rouge < 50, orange 50-80, vert > 80. */
  bloc.classList.remove('niv-bas', 'niv-moyen', 'niv-bon');
  if (texte.trim().length < 20) {
    bloc.classList.add('niv-bas');
  } else if (score > 80) {
    bloc.classList.add('niv-bon');
  } else if (score >= 50) {
    bloc.classList.add('niv-moyen');
  } else {
    bloc.classList.add('niv-bas');
  }

  document.getElementById('analyse-score').textContent = score + ' %';
  document.getElementById('analyse-barre').style.width = score + '%';

  document.getElementById('analyse-chips').innerHTML = detail.map(function(s) {
    var lbl = LIBELLES_SIGNAUX[s.key] || s.key;
    return '<span class="chip ' + (s.trouve ? 'chip-ok' : 'chip-ko') + '">' +
      (s.trouve ? icone('valide', 12) : '') + echapper(lbl) + '</span>';
  }).join('');

  var manquants = detail.filter(function(s) { return !s.trouve; }).length;
  var note = document.getElementById('analyse-note');
  if (!texte.trim()) {
    note.textContent = 'Commencez à écrire : l\'assistant repère au fil de la saisie les éléments déjà présents.';
  } else if (!manquants) {
    note.textContent = 'Votre déclaration couvre tous les points attendus. Aucune question complémentaire ne vous sera posée.';
  } else {
    note.textContent = manquants + ' élément' + (manquants > 1 ? 's' : '') + ' encore absent' + (manquants > 1 ? 's' : '') +
      '. Vous pouvez les ajouter maintenant, ou répondre aux questions de l\'assistant à l\'étape 4.';
  }
}

/* ============================================================
   LECTURE VOCALE DU RECAPITULATIF
   Repond au compte rendu §3.3 : un plaignant illettre doit pouvoir
   verifier a l'oral le document qu'il valide.
   ============================================================ */
var lectureEnCours = false;

function supporteSynthese() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/* Construit une version parlee du recapitulatif, a partir des champs
   du formulaire — pas du HTML du document, qui lirait les balises. */
function texteALire() {
  function v(id) { var e = document.getElementById(id); return e ? (e.value || '').trim() : ''; }
  var parts = [];

  parts.push('Récapitulatif de votre déclaration de plainte.');
  if (v('nature-infraction')) parts.push('Type d\'infraction : ' + v('nature-infraction') + '.');

  var dateEl = document.querySelector('[data-step="1"] input[type="date"]');
  if (dateEl && dateEl.value) {
    var d = dateEl.value.split('-');
    parts.push('Date des faits : le ' + d[2] + ' ' + MOIS_FR[parseInt(d[1], 10) - 1] + ' ' + d[0] + '.');
  }
  if (v('lieu-faits')) parts.push('Lieu des faits : ' + v('lieu-faits') + '.');

  var desc = v('declaration-text');
  if (desc) parts.push('Voici votre déclaration. ' + desc);

  var prej = v('prejudice-nature');
  if (prej) {
    var p = 'Préjudice subi : ' + prej + '.';
    if (v('prejudice-montant')) p += ' Montant estimé : ' + v('prejudice-montant') + ' francs CFA.';
    if (v('prejudice-detail'))  p += ' ' + v('prejudice-detail');
    parts.push(p);
  }

  var mec = document.getElementById('mec-nom');
  var mecDesc = document.getElementById('mec-description');
  if (mec && mec.value.trim()) parts.push('Mis en cause : ' + mec.value.trim() + '.');
  else if (mecDesc && mecDesc.value.trim()) parts.push('Le mis en cause n\'est pas identifié. Description : ' + mecDesc.value.trim());

  if (piecesJointes.length) {
    parts.push(piecesJointes.length + ' pièce' + (piecesJointes.length > 1 ? 's' : '') + ' jointe' + (piecesJointes.length > 1 ? 's' : '') + '.');
  }

  Object.keys(qaAnswers).forEach(function(q) {
    parts.push(q + ' Votre réponse : ' + qaAnswers[q] + '.');
  });

  parts.push('Fin du récapitulatif. Si tout est exact, vous pouvez transmettre votre déclaration.');
  return parts.join(' ');
}

var MOIS_FR = ['janvier','février','mars','avril','mai','juin',
               'juillet','août','septembre','octobre','novembre','décembre'];

function basculerLecture() {
  var txtBtn = document.getElementById('btn-ecouter-txt');

  if (!supporteSynthese()) {
    toast('La lecture vocale n\'est pas disponible sur ce navigateur', 'warning');
    return;
  }
  if (lectureEnCours) { arreterLecture(); return; }

  var u = new SpeechSynthesisUtterance(texteALire());
  u.lang = 'fr-FR';
  u.rate = 0.95;            /* legerement ralenti : c'est un document officiel */
  u.onend = arreterLecture;
  u.onerror = arreterLecture;

  /* Voix francaise si le systeme en propose une. */
  var voix = window.speechSynthesis.getVoices().filter(function(x) {
    return /^fr/i.test(x.lang);
  });
  if (voix.length) u.voice = voix[0];

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  lectureEnCours = true;
  if (txtBtn) txtBtn.textContent = 'Arrêter la lecture';
}

function arreterLecture() {
  if (supporteSynthese()) window.speechSynthesis.cancel();
  lectureEnCours = false;
  var txtBtn = document.getElementById('btn-ecouter-txt');
  if (txtBtn) txtBtn.textContent = 'Écouter ma déclaration';
}

/* ============================================================
   BROUILLON  (localStorage)
   Un depot fait cinq etapes : une coupure reseau ou un rafraichissement
   ne doit pas effacer la saisie. §2.1 documente l'instabilite des acces
   comme un facteur aggravant.
   ============================================================ */
var BROUILLON_CLE = 'plaintecam.brouillon.v1';
var CHAMPS_BROUILLON = [
  'nature-infraction', 'lieu-region', 'lieu-dept', 'lieu-arrond', 'lieu-quartier',
  'lieu-adresse', 'declaration-text',
  'prejudice-nature', 'prejudice-montant', 'prejudice-detail'
];

function sauverBrouillon() {
  try {
    var data = { etape: depotStep, champs: {}, quand: new Date().toISOString() };
    CHAMPS_BROUILLON.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) data.champs[id] = el.value;
    });
    var dateEl = document.querySelector('[data-step="1"] input[type="date"]');
    if (dateEl) data.champs['__date'] = dateEl.value;

    var mec = document.getElementById('mec-nom');
    var mecDesc = document.getElementById('mec-description');
    if (mec) data.champs['__mecNom'] = mec.value;
    if (mecDesc) data.champs['__mecDesc'] = mecDesc.value;

    localStorage.setItem(BROUILLON_CLE, JSON.stringify(data));
    signalerSauvegarde();
  } catch (e) { /* quota plein ou mode prive : la saisie continue normalement */ }
}

function signalerSauvegarde() {
  var el = document.getElementById('brouillon-etat');
  if (!el) return;
  el.textContent = 'Brouillon enregistré sur cet appareil.';
  clearTimeout(signalerSauvegarde._t);
  signalerSauvegarde._t = setTimeout(function() { el.textContent = ''; }, 2200);
}

function lireBrouillon() {
  try {
    var raw = localStorage.getItem(BROUILLON_CLE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function verifierBrouillon() {
  var d = lireBrouillon();
  var bandeau = document.getElementById('brouillon-bandeau');
  if (!d || !bandeau) return;

  /* Ne rien proposer si le brouillon est vide de substance. */
  var utile = (d.champs && (d.champs['declaration-text'] || d.champs['nature-infraction']));
  if (!utile) { supprimerBrouillon(false); return; }

  var info = document.getElementById('brouillon-info');
  if (info) info.textContent = 'Interrompue à l\'étape ' + (d.etape || 1) + ' — ' + depuisQuand(d.quand) + '.';
  bandeau.style.display = '';
}

function depuisQuand(iso) {
  var ms = Date.now() - new Date(iso).getTime();
  var min = Math.floor(ms / 60000);
  if (isNaN(min) || min < 1) return 'il y a quelques instants';
  if (min < 60) return 'il y a ' + min + ' minute' + (min > 1 ? 's' : '');
  var h = Math.floor(min / 60);
  if (h < 24) return 'il y a ' + h + ' heure' + (h > 1 ? 's' : '');
  var j = Math.floor(h / 24);
  return 'il y a ' + j + ' jour' + (j > 1 ? 's' : '');
}

function reprendreBrouillon() {
  var d = lireBrouillon();
  if (!d) return;

  /* La region doit etre restauree avant le departement, qui doit l'etre
     avant l'arrondissement : chaque liste depend de la precedente. */
  function set(id, val) {
    var el = document.getElementById(id);
    if (el && val != null) el.value = val;
  }
  set('nature-infraction', d.champs['nature-infraction']);
  var dateEl = document.querySelector('[data-step="1"] input[type="date"]');
  if (dateEl && d.champs['__date']) dateEl.value = d.champs['__date'];

  if (d.champs['lieu-region']) {
    set('lieu-region', d.champs['lieu-region']);
    if (typeof updateDepts === 'function') updateDepts();
    if (d.champs['lieu-dept']) {
      set('lieu-dept', d.champs['lieu-dept']);
      if (typeof updateArrondissements === 'function') updateArrondissements();
      if (d.champs['lieu-arrond']) {
        set('lieu-arrond', d.champs['lieu-arrond']);
        if (typeof updateQuartiers === 'function') updateQuartiers();
        set('lieu-quartier', d.champs['lieu-quartier']);
      }
    }
  }
  set('lieu-adresse', d.champs['lieu-adresse']);
  if (typeof updateLieuFaits === 'function') updateLieuFaits();

  set('declaration-text',   d.champs['declaration-text']);
  set('prejudice-nature',   d.champs['prejudice-nature']);
  set('prejudice-montant',  d.champs['prejudice-montant']);
  set('prejudice-detail',   d.champs['prejudice-detail']);
  onPrejudiceChange();

  var mec = document.getElementById('mec-nom');
  var mecDesc = document.getElementById('mec-description');
  if (mec && d.champs['__mecNom'])      mec.value = d.champs['__mecNom'];
  if (mecDesc && d.champs['__mecDesc']) mecDesc.value = d.champs['__mecDesc'];

  depotStep = Math.min(d.etape || 1, 5);
  updateDepotSteps();
  majAnalyseLive();

  document.getElementById('brouillon-bandeau').style.display = 'none';
  toast('Déclaration restaurée à l\'étape ' + depotStep, 'success');
  /* Les fichiers joints ne sont pas serialisables : on le dit franchement. */
  if (d.champs['declaration-text']) {
    var note = document.getElementById('brouillon-etat');
    if (note) note.textContent = 'Vos pièces jointes doivent être ré-attachées : les fichiers ne peuvent pas être conservés localement.';
  }
}

function supprimerBrouillon(reinit) {
  try { localStorage.removeItem(BROUILLON_CLE); } catch (e) {}
  var bandeau = document.getElementById('brouillon-bandeau');
  if (bandeau) bandeau.style.display = 'none';
  if (reinit) {
    if (typeof resetDepot === 'function') resetDepot();
    toast('Nouvelle déclaration','info');
  }
}

/* ============================================================
   INITIALISATION DE LA PAGE DEPOT
   ============================================================ */
(function initDepot() {
  var decl = document.getElementById('declaration-text');
  var nature = document.getElementById('nature-infraction');
  if (!decl && !nature) return;   /* pas sur la page citoyen */

  /* Analyse en direct : au fil de la saisie, avec une petite latence pour
     ne pas recalculer a chaque frappe. */
  var t;
  function planifier() {
    clearTimeout(t);
    t = setTimeout(function() { majAnalyseLive(); sauverBrouillon(); }, 250);
  }
  if (decl) decl.addEventListener('input', planifier);
  if (nature) nature.addEventListener('change', function() { majAnalyseLive(); sauverBrouillon(); });

  ['lieu-region','lieu-dept','lieu-arrond','lieu-quartier','lieu-adresse',
   'prejudice-montant','prejudice-detail'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', sauverBrouillon);
  });

  /* On coupe la lecture vocale si l'utilisateur quitte l'etape 5. */
  window.addEventListener('beforeunload', function() { if (lectureEnCours) arreterLecture(); });

  onPrejudiceChange();
  majAnalyseLive();
  verifierBrouillon();
})();

/* ============================================================
   LE COMPTE CONNECTÉ

   « Jean MBIDA » était écrit en dur à six endroits de la page — en-tête,
   barre latérale, profil, signature du document — plus ses initiales, sa
   profession, son lieu de résidence, et deux compteurs d'activité posés
   à la main. Rien ne garantissait que ces mentions concordent, et
   présenter la plateforme sous une autre identité demandait d'éditer le
   HTML. Tout se lit maintenant du registre des citoyens.
   ============================================================ */
function majCompteCitoyen() {
  if (typeof citoyenCourant !== 'function') return;
  var c = citoyenCourant();
  if (!c) return;

  var nom = nomCitoyen(c);
  var poser = function (id, valeur) {
    var el = document.getElementById(id);
    if (!el) return;
    if ('value' in el && el.tagName === 'INPUT') el.value = valeur;
    else el.textContent = valeur;
  };

  poser('moi-nom-barre', nom);
  poser('moi-nom-lateral', nom);
  poser('moi-nom-profil', nom);
  poser('moi-signature', nom);
  poser('moi-nom-famille', c.nom);
  poser('moi-prenom', c.prenom);
  poser('moi-residence', c.ville + ', ' + c.region);
  poser('moi-profession', c.profession);
  /* Initiales : première lettre du prénom et du patronyme. */
  poser('moi-initiales', (c.prenom.charAt(0) + c.nom.charAt(0)).toUpperCase());

  /* Les deux compteurs annonçaient « 2 » et « 1 » quel que soit le
     compte : ils se comptent. */
  var miens = (typeof mesDossiers === 'function') ? mesDossiers(c.id) : [];
  poser('moi-nb-plaintes', String(miens.length));
  poser('moi-nb-closes', String(miens.filter(function (d) {
    return d.statut === 'CLOTURE' || d.statut === 'TRANSMIS';
  }).length));

  /* Le résumé de dépôt citait une date figée. Il porte celle du dossier
     affiché sur l'attestation — et non celle du dossier le plus récent du
     compte : l'écran de confirmation annonce un numéro précis, et le voir
     surmonté de la date d'un autre dossier faisait douter du document. */
  var elNum = document.querySelector('#page-confirmation .big-num');
  var numAffiche = elNum ? elNum.textContent.replace(/^\s*N°\s*/, '').trim() : '';
  var affiche = miens.filter(function (d) { return d.id === numAffiche; })[0] || miens[0];
  poser('moi-depot-resume', affiche
    ? 'Déposée le ' + affiche.date + ' à ' + (affiche.heure || '—') + ' — ' + nom
    : 'Aucune plainte déposée pour l\'instant.');
}

(function initCompteCitoyen() {
  if (!document.getElementById('moi-nom-lateral')) return;
  majCompteCitoyen();
})();
