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
  } else {
    submitPlainte();
  }
}

function buildRecap() {
  const nature   = document.getElementById('nature-infraction').value || 'Non renseigne';
  const lieu     = document.getElementById('lieu-faits').value || 'Non renseigne';
  const dateEl   = document.querySelector('[data-step="1"] input[type="date"]');
  const dateFait = dateEl ? dateEl.value : '';
  const desc     = document.getElementById('declaration-text').value || '';

  const nomMec   = document.querySelector('[data-step="3"] input[placeholder="Nom du mis en cause"]');
  const descMec  = document.querySelector('[data-step="3"] textarea');
  const nomMecVal  = nomMec  && nomMec.value.trim()  ? nomMec.value.trim()  : null;
  const descMecVal = descMec && descMec.value.trim() ? descMec.value.trim() : null;

  const reponsesHtml = Object.keys(qaAnswers).length
    ? '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px">' +
        Object.entries(qaAnswers).map(([k,v]) =>
          `<tr><td style="padding:5px 8px;border:1px solid #ddd;color:#666;width:40%">${k}</td><td style="padding:5px 8px;border:1px solid #ddd">${v}</td></tr>`
        ).join('') +
      '</table>'
    : '<em style="color:#aaa">Aucune question complementaire</em>';

  const body = document.getElementById('apercu-body');
  if (body) {
    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8;width:35%">Type d'infraction</td><td style="padding:6px 10px;border:1px solid #ddd">${nature}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Date des faits</td><td style="padding:6px 10px;border:1px solid #ddd">${dateFait || 'Non precisee'}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Lieu des faits</td><td style="padding:6px 10px;border:1px solid #ddd">${lieu}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Commissariat competent</td><td style="padding:6px 10px;border:1px solid #ddd">Commissariat de ${lieu.split(',')[1] || lieu}</td></tr>
        <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Plaignant</td><td style="padding:6px 10px;border:1px solid #ddd">Jean MBIDA</td></tr>
      </table>

      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Declaration du plaignant :</p>
      <div style="background:#f9f9f9;border-left:3px solid var(--primary);padding:12px;border-radius:4px;font-style:italic;font-size:13px;line-height:1.7;margin-bottom:18px">
        "${desc || 'Aucune declaration saisie.'}"
      </div>

      ${nomMecVal || descMecVal ? `
      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Mis en cause :</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        ${nomMecVal  ? `<tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8;width:35%">Identite</td><td style="padding:6px 10px;border:1px solid #ddd">${nomMecVal}</td></tr>` : ''}
        ${descMecVal ? `<tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f8f8f8">Description physique</td><td style="padding:6px 10px;border:1px solid #ddd">${descMecVal}</td></tr>` : ''}
      </table>` : ''}

      <p style="font-weight:600;font-size:13px;margin-bottom:6px">Informations complementaires :</p>
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
  showPage('page-confirmation');
  toast('Plainte transmise au commissariat');
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
    btn.textContent = '⏹';
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
    btn.textContent = '🎤';
    statusEl.textContent = 'Enregistrement termine';
    statusEl.style.color = 'var(--green)';
    if (transcribeBtn) transcribeBtn.style.display = '';
    const mainTxt = document.getElementById('declaration-text');
    if (mainTxt && transText) mainTxt.value = transText;
    toast('Transcription terminee');
  }
}

function validateTranscription() {
  const transEl = document.getElementById('transcription-live');
  const mainTxt = document.getElementById('declaration-text');
  if (mainTxt && transEl) mainTxt.value = transEl.textContent;
  document.getElementById('mode-vocal').style.display = 'none';
  document.getElementById('mode-texte').style.display = '';
  toast('Transcription validee');
}

/* ── SUIVI CITOYEN ───────────────────────────────────────── */
function initSuivi() {
  const num = document.getElementById('suivi-numero').value.trim();
  if (!num) return;
  const d = DOSSIERS.find(d => d.id === num) || DOSSIERS[0];
  const result = document.getElementById('suivi-result');
  result.style.display = '';
  result.innerHTML = `
    <div class="card mb-3">
      <div class="card-header">
        <span class="card-title">Dossier N° ${d.id}</span>
        <span class="badge ${STATUT_LABELS[d.statut][0]}">${STATUT_LABELS[d.statut][1]}</span>
      </div>
      <div class="form-row" style="font-size:14px;gap:18px">
        <div><strong>Plaignant :</strong> ${d.plaignant}</div>
        <div><strong>Type :</strong> ${d.type}</div>
        <div><strong>Deposee le :</strong> ${d.date}</div>
        <div><strong>Commissariat :</strong> Commissariat Cite Verte</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title mb-3">Historique de traitement</div>
      <div class="timeline">
        ${buildTimeline(d.statut)}
      </div>
      <div class="divider"></div>
      <button class="btn btn-primary btn-sm" onclick="downloadAttestation()">
        Telecharger mon attestation (PDF)
      </button>
    </div>`;
}

function buildTimeline(statut) {
  const steps = [
    { key: 'RECU', label: 'Plainte deposee', date: '15/05/2026 a 14h32' },
    { key: 'RECU', label: 'Attestation envoyee par SMS', date: '15/05/2026 a 14h33' },
    { key: 'RECU', label: 'Recue au Commissariat Cite Verte', date: '15/05/2026 a 14h35' },
    { key: 'EN_INSTRUCTION', label: 'Dossier affecte a un enqueteur', date: '16/05/2026' },
    { key: 'AUDITION', label: 'En cours d\'instruction', date: null },
    { key: 'DECISION', label: 'Audition planifiee', date: null },
    { key: 'TRANSMIS', label: 'Decision finale', date: null },
  ];
  const order = ['RECU','EN_INSTRUCTION','AUDITION','DECISION','TRANSMIS','CLOTURE'];
  const cur = order.indexOf(statut);
  return steps.map((s, i) => {
    const si = order.indexOf(s.key);
    const state = si < cur ? 'done' : si === cur ? 'active' : 'pending';
    return `
      <div class="tl-item">
        <div class="tl-dot ${state}"></div>
        <div class="tl-title">${s.label}</div>
        ${s.date ? `<div class="tl-date">${s.date}</div>` : '<div class="tl-date text-muted">En attente...</div>'}
      </div>`;
  }).join('');
}

function downloadAttestation() {
  toast('Attestation telechargee');
  openModal('modal-attestation');
}
