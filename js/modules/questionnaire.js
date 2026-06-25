/* ============================================================
   Module questionnaire IA — questions complementaires
   ============================================================ */

const QA_BANK = {
  'Vol simple': [
    { q: "Pouvez-vous decrire l'objet vole (marque, couleur, valeur approximative) ?", type: 'text', placeholder: "Ex : telephone Samsung noir, 150 000 FCFA" },
    { q: "A quel moment de la journee le vol a-t-il eu lieu ?", opts: ["Matin (6h-12h)", "Apres-midi (12h-18h)", "Soiree (18h-22h)", "Nuit (22h-6h)"] },
    { q: "Avez-vous pu identifier ou voir le suspect ?", opts: ["Oui, je l'ai vu clairement", "Je l'ai apercu brievement", "Non, je ne l'ai pas vu"] },
    { q: "Y avait-il des temoins presents au moment des faits ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { q: "Avez-vous un justificatif de propriete de l'objet vole (facture, photo) ?", opts: ["Oui, je peux le fournir", "Non"] },
    { q: "Avez-vous deja signale ce vol a la police avant de deposer cette plainte ?", opts: ["Non, c'est ma premiere demarche", "Oui, mais sans suite"] },
  ],
  'Vol avec violence': [
    { q: "Avez-vous subi des blessures physiques lors de l'agression ?", opts: ["Oui, blessures legeres", "Oui, blessures graves necessitant des soins", "Non"] },
    { q: "Avez-vous consulte un medecin ou ete hospitalise suite a cet incident ?", opts: ["Oui", "Non, mais je le prevois", "Non"] },
    { q: "Le ou les agresseurs etaient-ils armes ?", opts: ["Oui, avec une arme a feu", "Oui, avec une arme blanche", "Non, a mains nues", "Je ne suis pas certain"] },
    { q: "Combien de personnes ont participe a l'agression ?", opts: ["Une seule personne", "2 a 3 personnes", "Plus de 3 personnes", "Je ne sais pas"] },
    { q: "Avez-vous pu decrire physiquement l'un des agresseurs ?", opts: ["Oui", "Partiellement", "Non"] },
    { q: "Y avait-il des temoins ou des cameras dans le secteur ?", opts: ["Des temoins presents", "Des cameras probables", "Les deux", "Aucun"] },
  ],
  'Agression physique': [
    { q: "Connaissez-vous l'auteur de l'agression ?", opts: ["Oui, c'est une personne de mon entourage", "Oui, c'est une connaissance", "Non, c'est un inconnu"] },
    { q: "S'agit-il d'une agression isolee ou repetee ?", opts: ["Premier incident", "Ce n'est pas la premiere fois"] },
    { q: "Avez-vous des preuves (photos de blessures, messages, temoins) ?", opts: ["Oui, photos de blessures", "Oui, messages ou echanges ecrits", "Oui, temoins", "Non"] },
    { q: "Avez-vous consulte un medecin ? Avez-vous un certificat medical ?", opts: ["Oui, j'ai un certificat medical", "Soins recus sans certificat", "Non"] },
    { q: "Quel etait le mobile apparent de l'agression ?", opts: ["Conflit personnel", "Vol", "Motif inconnu", "Autre"] },
  ],
  'Escroquerie / Fraude': [
    { q: "Comment avez-vous ete contacte par l'escroc ?", opts: ["En personne", "Par telephone", "Via les reseaux sociaux", "Par e-mail ou SMS", "Autre"] },
    { q: "Quel montant ou quelle valeur avez-vous perdu ?", type: 'text', placeholder: "Ex : 500 000 FCFA" },
    { q: "Disposez-vous de preuves de la transaction (recus, captures d'ecran, contrats) ?", opts: ["Oui", "Partiellement", "Non"] },
    { q: "Avez-vous des informations sur l'identite du suspect (nom, numero, profil) ?", opts: ["Oui, nom et numero de telephone", "Oui, profil sur les reseaux", "Informations partielles", "Aucune information"] },
    { q: "Avez-vous effectue un virement bancaire ou mobile money ?", opts: ["Oui, via Mobile Money (MTN/Orange)", "Oui, virement bancaire", "Remise d'especes en main propre", "Non"] },
    { q: "Combien de temps apres les faits faites-vous cette declaration ?", opts: ["Moins de 48 heures", "Entre 48h et 1 semaine", "Plus d'une semaine", "Plus d'un mois"] },
  ],
  'Harcelement': [
    { q: "Quelle est la nature du harcelement subi ?", opts: ["Harcelement verbal", "Harcelement physique", "Harcelement en ligne / cyberharcelement", "Harcelement au travail", "Harcelement sexuel"] },
    { q: "Connaissez-vous l'auteur du harcelement ?", opts: ["Oui, c'est une personne de mon entourage proche", "Oui, c'est un collegue ou superieur", "C'est une connaissance", "Non, c'est un inconnu"] },
    { q: "Depuis combien de temps dure ce harcelement ?", opts: ["Quelques jours", "Quelques semaines", "Plusieurs mois", "Plus d'un an"] },
    { q: "Avez-vous des preuves (captures d'ecran, messages, enregistrements) ?", opts: ["Oui, nombreuses preuves", "Oui, quelques preuves", "Non"] },
    { q: "Avez-vous deja demande a l'auteur de cesser ses agissements ?", opts: ["Oui, sans resultat", "Oui, mais ca a empire", "Non, j'avais peur"] },
    { q: "Existe-t-il des temoins ou d'autres victimes de cet auteur ?", opts: ["Oui", "Je ne sais pas", "Non"] },
  ],
  'Degradation de biens': [
    { q: "Quel bien a ete degrade ou detruit ?", type: 'text', placeholder: "Ex : vehicule, porte d'entree, vitrine de commerce..." },
    { q: "Estimez-vous la valeur des degats ?", type: 'text', placeholder: "Ex : 80 000 FCFA" },
    { q: "Connaissez-vous l'auteur de la degradation ?", opts: ["Oui", "Je le soupconne", "Non"] },
    { q: "Avez-vous des photos des degats ?", opts: ["Oui", "Non, mais je peux en prendre", "Non"] },
    { q: "Y avait-il des temoins au moment des faits ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { q: "S'agit-il d'un acte isole ou d'une repetition ?", opts: ["Premier incident", "Cela s'est deja produit"] },
  ],
  'Accident de la route': [
    { q: "Quel type de vehicules etait implique ?", opts: ["Voiture contre voiture", "Voiture contre moto", "Moto contre pieton", "Poids lourd", "Autre"] },
    { q: "Y a-t-il eu des blesses parmi les parties impliquees ?", opts: ["Oui, blesses legers", "Oui, blesses graves", "Non, uniquement des degats materiels"] },
    { q: "L'autre conducteur etait-il present sur les lieux apres l'accident ?", opts: ["Oui, il est reste", "Il a pris la fuite", "Je ne suis pas certain"] },
    { q: "Avez-vous note le numero d'immatriculation du vehicule implique ?", type: 'text', placeholder: "Ex : LT-123-AA ou inconnu" },
    { q: "Y avait-il des temoins ou un constat a l'amiable a-t-il ete dresse ?", opts: ["Oui, constat a l'amiable signe", "Des temoins presents, pas de constat", "Non"] },
    { q: "Un proces-verbal de police a-t-il deja ete etabli sur les lieux ?", opts: ["Oui", "Non"] },
  ],
  'Autre': [
    { q: "Comment decririez-vous la nature principale de l'incident ?", opts: ["Atteinte aux biens", "Atteinte aux personnes", "Menaces ou intimidations", "Probleme administratif", "Autre"] },
    { q: "L'auteur presume vous est-il connu ?", opts: ["Oui, c'est un proche", "Oui, c'est une connaissance", "Non"] },
    { q: "Depuis combien de temps avez-vous connaissance des faits ?", opts: ["Aujourd'hui meme", "Dans les dernieres 48 heures", "Cette semaine", "Plus d'une semaine"] },
    { q: "Disposez-vous de preuves (documents, photos, enregistrements) ?", opts: ["Oui", "Partiellement", "Non"] },
  ]
};

const QA_SIGNALS = {
  'Vol simple': [
    { key: 'objet',    patterns: ['telephone','sac','portefeuille','moto','voiture','argent','ordinateur','bijou','montre','valeur','fcfa','franc'], q: 0 },
    { key: 'heure',    patterns: ['matin','midi','soir','nuit','heure','h00','h30','h15','h45','vers'], q: 1 },
    { key: 'suspect',  patterns: ['individu','homme','femme','jeune','vieux','inconnu','suspect','visage','apercu','vu'], q: 2 },
    { key: 'temoin',   patterns: ['temoin','commercant','voisin','passant','vu par'], q: 3 },
    { key: 'facture',  patterns: ['facture','recu','photo','justificatif','preuve'], q: 4 },
    { key: 'signale',  patterns: ['deja signale','deja declare','premier','premiere fois'], q: 5 },
  ],
  'Vol avec violence': [
    { key: 'blessure',  patterns: ['blesse','blessure','frappe','tape','coups','sang','douleur','mal'], q: 0 },
    { key: 'medecin',   patterns: ['medecin','hopital','soins','infirmier','certificat'], q: 1 },
    { key: 'arme',      patterns: ['arme','couteau','pistolet','machette','revolver'], q: 2 },
    { key: 'nombre',    patterns: ['seul','deux','trois','plusieurs','groupe','bande','agresseur'], q: 3 },
    { key: 'description',patterns: ['grand','petit','mince','gros','noir','rouge','chemise','pantalon','age','ans'], q: 4 },
    { key: 'temoin',    patterns: ['temoin','camera','surveillance','passant'], q: 5 },
  ],
  'Agression physique': [
    { key: 'auteur',   patterns: ['connais','voisin','collegue','ami','famille','frere','soeur','inconnu'], q: 0 },
    { key: 'recurrence',patterns: ['premiere fois','deja','plusieurs fois','repete','recurrent','encore'], q: 1 },
    { key: 'preuve',   patterns: ['photo','message','sms','whatsapp','temoin','enregistrement','video'], q: 2 },
    { key: 'certificat',patterns: ['medecin','certificat','hopital','soins'], q: 3 },
    { key: 'mobile',   patterns: ['raison','motif','parce que','a cause','conflit','dispute','argent','jalousie'], q: 4 },
  ],
  'Escroquerie / Fraude': [
    { key: 'contact',  patterns: ['telephone','whatsapp','facebook','instagram','sms','rencontre','internet','ligne'], q: 0 },
    { key: 'montant',  patterns: ['fcfa','franc','somme','montant','argent','envoye','verse','paye'], q: 1 },
    { key: 'preuve',   patterns: ['recu','contrat','capture','screenshot','preuve','document','ecrit'], q: 2 },
    { key: 'identite', patterns: ['nom','prenom','numero','compte','profil','identite'], q: 3 },
    { key: 'virement', patterns: ['momo','mobile money','orange money','mtn','virement','banque','main propre','espece'], q: 4 },
    { key: 'delai',    patterns: ['hier','aujourd','semaine','mois','il y a'], q: 5 },
  ],
  'Harcelement': [
    { key: 'nature',   patterns: ['verbal','physique','ligne','internet','travail','sexuel','message'], q: 0 },
    { key: 'auteur',   patterns: ['connais','voisin','collegue','patron','ami','famille','inconnu'], q: 1 },
    { key: 'duree',    patterns: ['depuis','jours','semaines','mois','an','ans','longtemps'], q: 2 },
    { key: 'preuve',   patterns: ['capture','screenshot','message','enregistrement','temoin','preuve'], q: 3 },
    { key: 'demande',  patterns: ['demande','dit d\'arreter','arreter','cesse','averti'], q: 4 },
    { key: 'autre_victime',patterns: ['autres','victimes','pas le seul','pas la seule','collegues'], q: 5 },
  ],
  'Degradation de biens': [
    { key: 'bien',     patterns: ['voiture','moto','porte','fenetre','vitrine','cloture','propriete','bien'], q: 0 },
    { key: 'valeur',   patterns: ['fcfa','franc','valeur','degat','dommage','cout','estimation'], q: 1 },
    { key: 'auteur',   patterns: ['connais','voisin','suspect','auteur','inconnu'], q: 2 },
    { key: 'photo',    patterns: ['photo','image','video','capture'], q: 3 },
    { key: 'temoin',   patterns: ['temoin','vu','assiste','present'], q: 4 },
    { key: 'recurrence',patterns: ['premiere fois','deja','encore','repete'], q: 5 },
  ],
  'Accident de la route': [
    { key: 'vehicule', patterns: ['voiture','moto','camion','bus','vehicule','pieton','taxi'], q: 0 },
    { key: 'blesse',   patterns: ['blesse','blessure','mort','deces','hopital','soins','dommage','degat'], q: 1 },
    { key: 'fuite',    patterns: ['reste','parti','fui','fuite','enfui','present'], q: 2 },
    { key: 'immat',    patterns: ['immatriculation','plaque','numero'], q: 3 },
    { key: 'constat',  patterns: ['constat','temoin','amiable'], q: 4 },
    { key: 'pv',       patterns: ['proces-verbal','pv','police','gendarmerie','deja'], q: 5 },
  ],
  'Autre': [
    { key: 'nature',   patterns: ['bien','personne','menace','administratif'], q: 0 },
    { key: 'auteur',   patterns: ['connais','proche','inconnu'], q: 1 },
    { key: 'delai',    patterns: ['hier','aujourd','semaine','mois'], q: 2 },
    { key: 'preuve',   patterns: ['preuve','photo','document','message'], q: 3 },
  ]
};

let qaIdx = 0;
let qaSequence = [];
let qaAnswers = {};

function analyseDeclaration(texte, nature) {
  const txt = texte.toLowerCase();
  const allQuestions = QA_BANK[nature] || QA_BANK['Autre'];
  const signals = QA_SIGNALS[nature] || QA_SIGNALS['Autre'];
  const missing = [];
  signals.forEach(signal => {
    const found = signal.patterns.some(p => txt.includes(p));
    if (!found) missing.push(allQuestions[signal.q]);
  });
  return missing.filter(Boolean);
}

function startQuestionnaire() {
  const nature = document.getElementById('nature-infraction').value || 'Autre';
  const texte = document.getElementById('declaration-text').value || '';
  const container = document.getElementById('qa-container');
  container.innerHTML = '';
  qaIdx = 0;
  qaAnswers = {};

  const missing = analyseDeclaration(texte, nature);
  qaSequence = missing;

  if (missing.length === 0) {
    const done = document.createElement('div');
    done.className = 'chat-bubble';
    done.innerHTML = `<div class="bubble-msg" style="background:rgba(20,94,46,.08);border-left:3px solid var(--green-lt);color:var(--green)">
      Votre declaration est suffisamment detaillee. Aucune question complementaire n'est necessaire. Vous pouvez passer a l'etape suivante.
    </div>`;
    container.appendChild(done);
    return;
  }

  const intro = document.createElement('div');
  intro.className = 'chat-bubble';
  intro.innerHTML = `<div class="bubble-msg" style="background:rgba(11,30,69,.05);border-left:3px solid var(--primary)">
    Votre declaration a ete analysee. Pour completer votre dossier, <strong>${missing.length} information${missing.length > 1 ? 's' : ''} manquante${missing.length > 1 ? 's' : ''}</strong> ont ete detectees. Veuillez repondre aux questions suivantes.
  </div>`;
  container.appendChild(intro);
  setTimeout(showNextQuestion, 500);
}

function showNextQuestion() {
  const container = document.getElementById('qa-container');
  if (qaIdx >= qaSequence.length) {
    const done = document.createElement('div');
    done.className = 'chat-bubble';
    done.innerHTML = `<div class="bubble-msg" style="background:rgba(20,94,46,.08);border-left:3px solid var(--green-lt);">
      <strong style="color:var(--green)">Dossier complete.</strong><br>
      <span style="color:var(--text-light);font-size:13px">Merci pour vos reponses. Les informations manquantes ont ete ajoutees a votre dossier. Vous pouvez passer a l'etape suivante.</span>
    </div>`;
    container.appendChild(done);
    container.scrollTop = container.scrollHeight;
    return;
  }
  const qa = qaSequence[qaIdx];
  const progress = `<span style="font-size:11px;color:var(--text-light);float:right">${qaIdx + 1}/${qaSequence.length}</span>`;
  const iaMsg = document.createElement('div');
  iaMsg.className = 'chat-bubble';
  iaMsg.innerHTML = `<div>
    <div class="bubble-msg">${progress}${qa.q}</div>
    ${qa.opts
      ? `<div class="chat-actions">${qa.opts.map(o =>
          `<button class="quick-reply" onclick="answerQuestion(this,'${o.replace(/'/g,"\\'")}'">${o}</button>`
        ).join('')}</div>`
      : `<div class="chat-actions" style="margin-top:10px;display:flex;gap:8px;align-items:center">
          <input type="text" class="form-control" id="qa-text-input" placeholder="${qa.placeholder || ''}" style="flex:1;max-width:320px">
          <button class="btn btn-primary btn-sm" onclick="answerTextQuestion()">Envoyer</button>
        </div>`
    }
  </div>`;
  container.appendChild(iaMsg);
  container.scrollTop = container.scrollHeight;
}

function answerQuestion(btn, answer) {
  const container = document.getElementById('qa-container');
  btn.closest('.chat-actions').querySelectorAll('.quick-reply').forEach(b => {
    b.disabled = true;
    b.style.opacity = b.textContent === answer ? '1' : '0.35';
  });
  btn.style.background = 'var(--primary)';
  btn.style.color = '#fff';
  btn.style.borderColor = 'var(--primary)';

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-bubble user';
  userMsg.innerHTML = `<div class="bubble-msg user-bubble">${answer}</div>`;
  container.appendChild(userMsg);

  qaAnswers['Q' + (qaIdx + 1)] = answer;
  qaIdx++;
  container.scrollTop = container.scrollHeight;
  setTimeout(showNextQuestion, 600);
}

function answerTextQuestion() {
  const inp = document.getElementById('qa-text-input');
  if (!inp || !inp.value.trim()) return;
  const answer = inp.value.trim();
  inp.disabled = true;
  inp.nextElementSibling.disabled = true;

  const container = document.getElementById('qa-container');
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-bubble user';
  userMsg.innerHTML = `<div class="bubble-msg user-bubble">${answer}</div>`;
  container.appendChild(userMsg);

  qaAnswers['Q' + (qaIdx + 1)] = answer;
  qaIdx++;
  container.scrollTop = container.scrollHeight;
  setTimeout(showNextQuestion, 600);
}
