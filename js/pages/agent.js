/* ============================================================
   Espace Commissaire — tableau de bord, dossiers, PV
   ============================================================ */

function initDashboard() {
  const tbody = document.getElementById('dossiers-tbody');
  if (!tbody) return;
  tbody.innerHTML = DOSSIERS.map(d => {
    const [cls, lbl] = STATUT_LABELS[d.statut];
    const scoreClass = d.score >= 80 ? 'high' : d.score >= 50 ? 'med' : 'low';
    const prioColor = d.priorite === 'URGENTE' ? 'red' : d.priorite === 'HAUTE' ? 'orange' : 'gray';
    return `<tr onclick="openDossier('${d.id}')" style="cursor:pointer">
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
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openDossier('${d.id}')">Ouvrir</button>
      </td>
    </tr>`;
  }).join('');
}

function openDossier(id) {
  const d = DOSSIERS.find(d => d.id === id);
  if (!d) return;
  document.getElementById('modal-dossier-title').textContent = 'Dossier N° ' + d.id;
  document.getElementById('modal-dossier-body').innerHTML = buildDossierModal(d);
  openModal('modal-dossier');
}

function buildDossierModal(d) {
  const [cls, lbl] = STATUT_LABELS[d.statut];
  return `
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
      <span class="badge ${cls}">${lbl}</span>
      <span class="badge badge-${d.priorite === 'URGENTE' ? 'red' : d.priorite === 'HAUTE' ? 'orange' : 'gray'}">${d.priorite}</span>
      <span class="badge badge-blue">Score IA : ${d.score}%</span>
    </div>
    <div class="form-row" style="font-size:14px;gap:16px;margin-bottom:18px">
      <div><strong>Plaignant :</strong> ${d.plaignant}</div>
      <div><strong>Type :</strong> ${d.type}</div>
      <div><strong>Date :</strong> ${d.date}</div>
      <div><strong>Enqueteur :</strong> ${d.enqueteur || 'Non affecte'}</div>
    </div>

    <div style="border-bottom:1px solid var(--gray-2);margin-bottom:16px;display:flex;gap:0">
      ${['Declaration','Proces-verbal IA','Convocation'].map((t,i)=>`
        <button onclick="switchTab(this,'tab-${i}')" class="btn btn-sm ${i===0?'btn-primary':'btn-outline'}" style="border-radius:0;flex:1">${t}</button>
      `).join('')}
    </div>

    <div id="tab-0">
      <p style="font-size:14px;line-height:1.8">
        Le <span class="entity entity-date">15 mai 2026</span> vers <span class="entity entity-date">14h00</span>,
        <span class="entity entity-per">${d.plaignant}</span> etait present(e) au
        <span class="entity entity-loc">Marche Mokolo, Yaounde</span>.
        Un <span class="entity entity-per">individu inconnu</span> a derobe un
        <span class="entity entity-obj">telephone portable</span> d'une valeur de
        <span class="entity entity-money">150 000 FCFA</span> avant de prendre la fuite.
      </p>
    </div>
    <div id="tab-1" style="display:none">
      <div class="alert alert-info" style="margin-bottom:14px">
        <span>Ce PV a ete genere automatiquement par l'IA a partir de la declaration.</span>
      </div>
      <textarea class="form-control" style="min-height:200px;font-family:'Times New Roman',serif">PROCES-VERBAL D'AUDITION N° PV-2026-00451

Le quinze mai deux mille vingt-six a quatorze heures trente-deux minutes,
Nous, Inspecteur ${d.enqueteur || 'N. NGUEMO'}, officier de police judiciaire,
avons procede a l'audition de :

M./Mme ${d.plaignant}, ne(e) le XX/XX/XXXX,
demeurant a Yaounde, porteur(se) de la CNI N° XXXX.

Lequel/Laquelle nous a declare ce qui suit :

"${d.plaignant === 'Jean MBIDA' ? "Le 15 mai 2026 vers 14h00, je me trouvais au Marche Mokolo. Un individu inconnu m'a arrache mon telephone Samsung Galaxy d'une valeur de 150 000 FCFA et a pris la fuite." : "Un individu s'est presente a mon domicile en se faisant passer pour un agent commercial. Il m'a extorque la somme de 300 000 FCFA sous pretexte de regulariser mon abonnement telephonique."}"

Lecture faite, le comparant declare que le present proces-verbal est fidele a ses declarations.

Fait a Yaounde, le ${d.date}.
                    Signature du plaignant         Signature de l'enqueteur</textarea>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn-success btn-sm" onclick="signPV()">Signer electroniquement le PV</button>
        <button class="btn btn-outline btn-sm" onclick="toast('PV exporte en PDF')">Exporter PDF</button>
      </div>
    </div>
    <div id="tab-2" style="display:none">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nom du destinataire</label>
          <input class="form-control" value="Suspect inconnu (description)">
        </div>
        <div class="form-group">
          <label class="form-label">Date de convocation</label>
          <input type="date" class="form-control" value="2026-05-22">
        </div>
        <div class="form-group">
          <label class="form-label">Heure</label>
          <input type="time" class="form-control" value="09:00">
        </div>
        <div class="form-group">
          <label class="form-label">N° ordre</label>
          <select class="form-control"><option>1ere convocation</option><option>2eme</option><option>3eme</option></select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Motif</label>
        <textarea class="form-control" rows="3">Audition dans le cadre de l'affaire N° ${d.id} - ${d.type}</textarea>
      </div>
      <button class="btn btn-primary" onclick="sendConvocation()">Envoyer la convocation par SMS</button>
    </div>`;
}

function switchTab(btn, tabId) {
  ['tab-0','tab-1','tab-2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? '' : 'none';
  });
  btn.parentElement.querySelectorAll('button').forEach(b => {
    b.className = 'btn btn-sm btn-outline';
    b.style.borderRadius = '0';
    b.style.flex = '1';
  });
  btn.className = 'btn btn-sm btn-primary';
  btn.style.borderRadius = '0';
  btn.style.flex = '1';
}

function signPV() {
  toast('PV signe electroniquement - ' + new Date().toLocaleString('fr-FR'));
}

function sendConvocation() {
  toast('Convocation envoyee par SMS');
  closeModal('modal-dossier');
}

function drawMiniChart() {
  const c = document.getElementById('chart-plaintes');
  if (!c) return;
  const ctx = c.getContext('2d');
  const data = [8, 12, 6, 15, 9, 18, 11, 14, 7, 20, 13, 16, 10, 19];
  const max = Math.max(...data);
  const W = c.width, H = c.height;
  const pad = 20, barW = (W - pad * 2) / data.length - 4;
  ctx.clearRect(0, 0, W, H);
  data.forEach((v, i) => {
    const x = pad + i * (barW + 4);
    const bh = ((v / max) * (H - pad * 2));
    const y = H - pad - bh;
    ctx.fillStyle = i === data.length - 1 ? '#c98b00' : '#0b1e45';
    ctx.beginPath();
    ctx.roundRect(x, y, barW, bh, 3);
    ctx.fill();
  });
}
