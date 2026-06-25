/* ============================================================
   Espace Citoyen — logique cascade geographique
   ============================================================ */

function updateDepts() {
  var region = document.getElementById('lieu-region').value;
  var deptSel = document.getElementById('lieu-dept');
  var arrondSel = document.getElementById('lieu-arrond');
  var quartSel = document.getElementById('lieu-quartier');
  deptSel.innerHTML = '<option value="">-- Sélectionner le département --</option>';
  arrondSel.innerHTML = '<option value="">-- Sélectionner d\'abord le département --</option>';
  quartSel.innerHTML = '<option value="">-- Sélectionner d\'abord l\'arrondissement --</option>';
  deptSel.disabled = !region;
  arrondSel.disabled = true;
  quartSel.disabled = true;
  resetCommissariat();
  if (!region) return;
  var depts = GEO[region].depts;
  Object.keys(depts).forEach(function(k) {
    var opt = document.createElement('option');
    opt.value = k; opt.textContent = depts[k].label;
    deptSel.appendChild(opt);
  });
}

function updateArrondissements() {
  var region = document.getElementById('lieu-region').value;
  var dept = document.getElementById('lieu-dept').value;
  var arrondSel = document.getElementById('lieu-arrond');
  var quartSel = document.getElementById('lieu-quartier');
  arrondSel.innerHTML = '<option value="">-- Sélectionner l\'arrondissement --</option>';
  quartSel.innerHTML = '<option value="">-- Sélectionner d\'abord l\'arrondissement --</option>';
  arrondSel.disabled = !dept;
  quartSel.disabled = true;
  resetCommissariat();
  if (!dept) return;
  var arronds = GEO[region].depts[dept].arronds;
  Object.keys(arronds).forEach(function(k) {
    var opt = document.createElement('option');
    opt.value = k; opt.textContent = arronds[k];
    arrondSel.appendChild(opt);
  });
}

function updateQuartiers() {
  var arrond = document.getElementById('lieu-arrond').value;
  var quartSel = document.getElementById('lieu-quartier');
  quartSel.innerHTML = '<option value="">-- Sélectionner le quartier --</option>';
  quartSel.disabled = !arrond;
  resetCommissariat();
  if (!arrond) return;
  getQuartiers(arrond).forEach(function(q) {
    var opt = document.createElement('option');
    opt.value = q; opt.textContent = q;
    quartSel.appendChild(opt);
  });
}

function updateLieuFaits() {
  var regionEl  = document.getElementById('lieu-region');
  var deptEl    = document.getElementById('lieu-dept');
  var arrondEl  = document.getElementById('lieu-arrond');
  var quartEl   = document.getElementById('lieu-quartier');
  var adresseEl = document.getElementById('lieu-adresse');

  if (!quartEl.value) { resetCommissariat(); return; }

  var regionOpt  = regionEl.options[regionEl.selectedIndex];
  var deptOpt    = deptEl.options[deptEl.selectedIndex];
  var arrondOpt  = arrondEl.options[arrondEl.selectedIndex];

  var region = GEO[regionEl.value] ? GEO[regionEl.value].label : regionOpt.text;
  var dept   = deptOpt.text;
  var arrond = arrondOpt.text;
  var quart  = quartEl.value;

  var lieu = quart + ', ' + arrond + ', ' + dept + ' — ' + region;
  if (adresseEl && adresseEl.value.trim()) lieu = adresseEl.value.trim() + ', ' + lieu;
  document.getElementById('lieu-faits').value = lieu;

  showCommissariat(arrond, quart);
}

function showCommissariat(arrond, quartier) {
  var commissariat = 'Commissariat de ' + arrond;
  document.getElementById('commissariat-info-text').innerHTML =
    'Commissariat compétent : <strong>' + commissariat + '</strong> — dossier transmis automatiquement à la réception.';
  document.getElementById('commissariat-info').style.display = '';
  document.getElementById('commissariat-default').style.display = 'none';
}

function resetCommissariat() {
  document.getElementById('lieu-faits').value = '';
  document.getElementById('commissariat-info').style.display = 'none';
  document.getElementById('commissariat-default').style.display = '';
}

function setMode(mode) {
  document.getElementById('mode-texte').style.display = mode === 'texte' ? '' : 'none';
  document.getElementById('mode-vocal').style.display = mode === 'vocal' ? '' : 'none';
}

function prevDepotStep() {
  if (depotStep > 1) { depotStep--; updateDepotSteps(); }
}

function resetDepot() {
  depotStep = 1;
  updateDepotSteps();
  showPage('page-depot');
}
