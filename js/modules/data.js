/* ============================================================
   Données fictives partagées entre les espaces

   Les champs lieu, declaration, misEnCause et commissariat sont repris
   de supabase/seed.sql, afin que le document de plainte téléchargeable
   depuis le suivi porte le contenu réel du dossier et non un texte
   générique.
   ============================================================ */

/* ── Citoyens ───────────────────────────────────────────────
   L'espace citoyen écrivait « Jean MBIDA » en dur à huit endroits :
   l'en-tête, la barre latérale, le profil, la signature du document.
   Changer de compte pour une démonstration obligeait à éditer le HTML,
   et rien ne garantissait que ces huit mentions concordent. Le compte
   connecté se lit désormais ici, et les dossiers y renvoient.
   ─────────────────────────────────────────────────────────── */
const CITOYENS = [
  { id: 'CIT-001', nom: 'MBIDA',    prenom: 'Jean',    sexe: 'M',
    cni: 'CM0012345678', naissance: '12/03/1988', lieuNaissance: 'Yaoundé',
    profession: 'Commerçant', adresse: 'Mvog-Ada, Yaoundé 4ème',
    email: 'j.mbida@gmail.com',    telephone: '+237 677 100 001',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-002', nom: 'ESSOMBA',  prenom: 'Marie',   sexe: 'F',
    cni: 'CM0012345679', naissance: '04/09/1992', lieuNaissance: 'Douala',
    profession: 'Coiffeuse', adresse: 'Biyem-Assi, Yaoundé 6ème',
    email: 'm.essomba@gmail.com',  telephone: '+237 677 100 002',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-003', nom: 'ATANGANA', prenom: 'Paul',    sexe: 'M',
    cni: 'CM0012345680', naissance: '27/01/1979', lieuNaissance: 'Ebolowa',
    profession: 'Enseignant', adresse: 'Nlongkak, Yaoundé 1er',
    email: 'p.atangana@gmail.com', telephone: '+237 677 100 003',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-004', nom: 'BELLO',    prenom: 'Fatima',  sexe: 'F',
    cni: 'CM0012345681', naissance: '15/06/1995', lieuNaissance: 'Garoua',
    profession: 'Secrétaire', adresse: 'Mendong, Yaoundé 6ème',
    email: 'f.bello@gmail.com',    telephone: '+237 677 100 004',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-005', nom: 'FOKO',     prenom: 'Alain',   sexe: 'M',
    cni: 'CM0012345682', naissance: '08/11/1984', lieuNaissance: 'Bafoussam',
    profession: 'Mototaximan', adresse: 'Obili, Yaoundé 1er',
    email: 'a.foko@gmail.com',     telephone: '+237 677 100 005',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-006', nom: 'NANA',     prenom: 'Sylvie',  sexe: 'F',
    cni: 'CM0012345683', naissance: '21/04/1990', lieuNaissance: 'Yaoundé',
    profession: 'Revendeuse', adresse: 'Nkolbisson, Yaoundé 7ème',
    email: 's.nana@gmail.com',     telephone: '+237 677 100 006',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-007', nom: 'TCHOUMI',  prenom: 'Georges', sexe: 'M',
    cni: 'CM0012345684', naissance: '30/07/1981', lieuNaissance: 'Dschang',
    profession: 'Comptable', adresse: 'Essos, Yaoundé 4ème',
    email: 'g.tchoumi@gmail.com',  telephone: '+237 677 100 007',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-008', nom: 'ONANA',    prenom: 'Clarisse', sexe: 'F',
    cni: 'CM0012345685', naissance: '02/02/1998', lieuNaissance: 'Mbalmayo',
    profession: 'Étudiante', adresse: 'Ngoa-Ekelle, Yaoundé 3ème',
    email: 'c.onana@gmail.com',    telephone: '+237 677 100 008',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-009', nom: 'NJOYA',    prenom: 'Emmanuel', sexe: 'M',
    cni: 'CM0012345686', naissance: '19/12/1976', lieuNaissance: 'Foumban',
    profession: 'Chauffeur', adresse: 'Mvan, Yaoundé 3ème',
    email: 'e.njoya@gmail.com',    telephone: '+237 677 100 009',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-010', nom: 'MEKA',     prenom: 'Rachel',  sexe: 'F',
    cni: 'CM0012345687', naissance: '11/05/1993', lieuNaissance: 'Yaoundé',
    profession: 'Infirmière', adresse: 'Emana, Yaoundé 1er',
    email: 'r.meka@gmail.com',     telephone: '+237 677 100 010',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-011', nom: 'TALLA',    prenom: 'Hervé',   sexe: 'M',
    cni: 'CM0012345688', naissance: '23/08/1986', lieuNaissance: 'Bafang',
    profession: 'Menuisier', adresse: 'Etoudi, Yaoundé 1er',
    email: 'h.talla@gmail.com',    telephone: '+237 677 100 011',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-012', nom: 'MANGA',    prenom: 'Brigitte', sexe: 'F',
    cni: 'CM0012345689', naissance: '06/10/1989', lieuNaissance: 'Kribi',
    profession: 'Caissière', adresse: 'Mimboman, Yaoundé 4ème',
    email: 'b.manga@gmail.com',    telephone: '+237 677 100 012',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-013', nom: 'EYENGA',   prenom: 'Serge',   sexe: 'M',
    cni: 'CM0012345690', naissance: '14/02/1983', lieuNaissance: 'Sangmélima',
    profession: 'Vigile', adresse: 'Nkoldongo, Yaoundé 4ème',
    email: 's.eyenga@gmail.com',   telephone: '+237 677 100 013',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-014', nom: 'ABANDA',   prenom: 'Léonie', sexe: 'F',
    cni: 'CM0012345691', naissance: '17/07/1991', lieuNaissance: 'Yaoundé',
    profession: 'Restauratrice', adresse: 'Mokolo, Yaoundé 2ème',
    email: 'l.abanda@gmail.com',   telephone: '+237 677 100 014',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-015', nom: 'KAMGA',    prenom: 'Théodore', sexe: 'M',
    cni: 'CM0012345692', naissance: '05/03/1974', lieuNaissance: 'Bafoussam',
    profession: 'Transporteur', adresse: 'Nsam, Yaoundé 3ème',
    email: 't.kamga@gmail.com',    telephone: '+237 677 100 015',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-016', nom: 'NGO BASSONG', prenom: 'Adèle', sexe: 'F',
    cni: 'CM0012345693', naissance: '29/11/1996', lieuNaissance: 'Édéa',
    profession: 'Aide-soignante', adresse: 'Nkomo, Yaoundé 5ème',
    email: 'a.ngobassong@gmail.com', telephone: '+237 677 100 016',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-017', nom: 'OWONA',    prenom: 'Vincent', sexe: 'M',
    cni: 'CM0012345694', naissance: '12/09/1987', lieuNaissance: 'Yaoundé',
    profession: 'Électricien', adresse: 'Efoulan, Yaoundé 3ème',
    email: 'v.owona@gmail.com',    telephone: '+237 677 100 017',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-018', nom: 'DJOUMESSI', prenom: 'Nadège', sexe: 'F',
    cni: 'CM0012345695', naissance: '08/05/1994', lieuNaissance: 'Bandjoun',
    profession: 'Couturière', adresse: 'Mvog-Mbi, Yaoundé 4ème',
    email: 'n.djoumessi@gmail.com', telephone: '+237 677 100 018',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-019', nom: 'ETOUNDI',  prenom: 'Blaise', sexe: 'M',
    cni: 'CM0012345696', naissance: '24/01/1980', lieuNaissance: 'Akonolinga',
    profession: 'Boulanger', adresse: 'Etoa-Meki, Yaoundé 2ème',
    email: 'b.etoundi@gmail.com',  telephone: '+237 677 100 019',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-020', nom: 'MBALLA',   prenom: 'Solange', sexe: 'F',
    cni: 'CM0012345697', naissance: '03/12/1989', lieuNaissance: 'Yaoundé',
    profession: 'Gérante de boutique', adresse: 'Tsinga, Yaoundé 1er',
    email: 's.mballa@gmail.com',   telephone: '+237 677 100 020',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' },
  { id: 'CIT-021', nom: 'NDJOMO',   prenom: 'Aristide', sexe: 'M',
    cni: 'CM0012345698', naissance: '19/06/1985', lieuNaissance: 'Mbalmayo',
    profession: 'Mécanicien', adresse: 'Odza, Yaoundé 4ème',
    email: 'a.ndjomo@gmail.com',   telephone: '+237 677 100 021',
    pays: 'Cameroun', region: 'Centre', ville: 'Yaoundé' }
];

/* Compte ouvert dans l'espace citoyen. Une seule ligne à changer pour
   présenter la plateforme sous une autre identité. */
const CITOYEN_CONNECTE = 'CIT-001';

/* ── Agents du commissariat ─────────────────────────────────
   La liste des enquêteurs vivait dans commissaire-init.js, réduite à deux
   noms et une spécialité. Les grades, matricules et coordonnées ne
   figuraient que dans seed.sql, et l'entrée « Gestion des agents » du
   menu se contentait d'un message. Le registre est ici, partagé.

   `nom` est l'identité telle qu'elle apparaît dans les dossiers
   (`d.enqueteur`) : c'est la clé de rattachement, elle ne se change pas
   sans reprendre les dossiers.
   ─────────────────────────────────────────────────────────── */
const AGENTS = [
  { id: 'AG-001', nom: 'Comm. NGUEMO', nomFamille: 'NGUEMO', prenom: 'Nicole',
    role: 'commissaire', matricule: 'SN-2018001', grade: 'Commissaire de Police',
    specialite: 'Direction du commissariat', telephone: '+237 677 000 010',
    email: 'n.nguemo@police.cm', actif: true, depuis: '02/01/2018',
    commissariat: 'Commissariat Cité Verte, Yaoundé' },
  { id: 'AG-002', nom: 'Insp. KANA', nomFamille: 'KANA', prenom: 'Nicole',
    role: 'enqueteur', matricule: 'SN-2021044', grade: 'Inspecteur de Police',
    specialite: 'Escroquerie, Fraude', telephone: '+237 677 000 011',
    email: 'n.kana@police.cm', actif: true, depuis: '15/03/2021',
    commissariat: 'Commissariat Cité Verte, Yaoundé' },
  { id: 'AG-003', nom: 'Insp. BIYA', nomFamille: 'BIYA', prenom: 'Pierre',
    role: 'enqueteur', matricule: 'SN-2020031', grade: 'Inspecteur de Police',
    specialite: 'Généraliste', telephone: '+237 677 000 012',
    email: 'p.biya@police.cm', actif: true, depuis: '04/09/2020',
    commissariat: 'Commissariat Cité Verte, Yaoundé' },
  { id: 'AG-004', nom: 'Insp. NKOA', nomFamille: 'NKOA', prenom: 'Estelle',
    role: 'enqueteur', matricule: 'SN-2022017', grade: 'Inspecteur de Police',
    specialite: 'Atteintes aux personnes', telephone: '+237 677 000 013',
    email: 'e.nkoa@police.cm', actif: true, depuis: '11/01/2022',
    commissariat: 'Commissariat Cité Verte, Yaoundé' },
  /* En congé : il garde sa place au registre mais ne reçoit plus de
     dossier — c'est ce que décrit le compte rendu d'entretien lorsqu'il
     parle du transfert « en cas d'indisponibilité ». */
  { id: 'AG-005', nom: 'Insp. TCHATCHOUA', nomFamille: 'TCHATCHOUA', prenom: 'Marc',
    role: 'enqueteur', matricule: 'SN-2019008', grade: 'Inspecteur de Police',
    specialite: 'Généraliste', telephone: '+237 677 000 014',
    email: 'm.tchatchoua@police.cm', actif: false, depuis: '20/06/2019',
    motifInactif: 'Congé annuel jusqu\'au 30/06/2026',
    commissariat: 'Commissariat Cité Verte, Yaoundé' },
  { id: 'AG-006', nom: 'Brig. MOUKOURI', nomFamille: 'MOUKOURI', prenom: 'Alice',
    role: 'accueil', matricule: 'SN-2023005', grade: 'Brigadier',
    specialite: 'Accueil et enregistrement des plaintes', telephone: '+237 677 000 015',
    email: 'a.moukouri@police.cm', actif: true, depuis: '06/02/2023',
    commissariat: 'Commissariat Cité Verte, Yaoundé' }
];

const ROLES_AGENT = {
  commissaire: 'Commissaire',
  enqueteur:   'Enquêteur',
  accueil:     'Accueil'
};

function agentParId(id)   { return AGENTS.find(a => a.id === id) || null; }
function agentParNom(nom) { return AGENTS.find(a => a.nom === nom) || null; }

/* Enquêteurs à qui l'on peut confier un dossier : ceux qui sont en
   service. Un agent en congé reste au registre, il ne reçoit rien. */
function enqueteursDisponibles() {
  return AGENTS.filter(a => a.role === 'enqueteur' && a.actif);
}

/* Un dossier se trouve par son numéro, quel que soit l'agent qui le
   consulte. La recherche passait par mesDossiersActifs(), filtrée sur
   l'enquêteur connecté : le commissaire, qui supervise tous les dossiers,
   n'en aurait trouvé aucun. */
function dossierParId(numero) {
  return (typeof DOSSIERS !== 'undefined')
    ? DOSSIERS.find(d => d.id === numero) || null
    : null;
}

function citoyen(idCitoyen) {
  return CITOYENS.find(c => c.id === idCitoyen) || null;
}
function citoyenCourant() { return citoyen(CITOYEN_CONNECTE); }
function nomCitoyen(c) { return c ? c.prenom + ' ' + c.nom : ''; }

/* Dossiers du compte connecté, du plus récent au plus ancien. */
function mesDossiers(idCitoyen) {
  const cible = idCitoyen || CITOYEN_CONNECTE;
  return DOSSIERS.filter(d => d.citoyen === cible)
    .slice()
    .sort((a, b) => horodatage(b) - horodatage(a));
}

/* « 15/05/2026 » + « 14h32 » vers un instant comparable. */
function horodatage(d) {
  const [j, m, a] = String(d.date || '01/01/2026').split('/').map(Number);
  const [h, mi] = String(d.heure || '00h00').split('h').map(Number);
  return new Date(a, (m || 1) - 1, j || 1, h || 0, mi || 0).getTime();
}

const DOSSIERS = [
  {
    id: '2026-00451', citoyen: 'CIT-001', type: 'Vol simple', plaignant: 'Jean MBIDA',
    date: '15/05/2026', heure: '14h32', statut: 'EN_INSTRUCTION', score: 82,
    enqueteur: 'Insp. KANA', priorite: 'HAUTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Marché Mokolo, Mokolo, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '150 000', detail: 'Téléphone Samsung Galaxy noir' },
    declaration: "Le 15 mai 2026 vers 14h00, je me trouvais au Marché Mokolo à Yaoundé. Un individu inconnu, jeune homme d'environ 25 ans, vêtu d'un tee-shirt rouge, a arraché mon téléphone Samsung Galaxy de couleur noire. Il a pris la fuite en courant. Valeur : 150 000 FCFA.",
    contact: { email: 'j.mbida@gmail.com',    telephone: '+237 677 100 001' },
    contactMisEnCause: null,
    pieces: [{ nom: 'facture-achat-telephone.pdf', taille: '128 Ko' },
              { nom: 'photo-lieu-des-faits.jpg',    taille: '1,8 Mo' }],
    misEnCause: "Jeune homme, environ 25 ans, taille moyenne, tee-shirt rouge, jean bleu."
  },
  {
    id: '2026-00438', citoyen: 'CIT-002', type: 'Escroquerie', plaignant: 'Marie ESSOMBA',
    date: '12/05/2026', heure: '09h15', statut: 'AUDITION', score: 67,
    enqueteur: 'Insp. KANA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Biyem-Assi, Yaoundé 6ème, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '200 000', detail: 'Virement Mobile Money non remboursé' },
    declaration: "Un individu s'est présenté comme agent d'une société de micro-finance. Il m'a soutiré un virement de 200 000 FCFA en promettant un remboursement avec intérêts. Depuis lors, il est injoignable.",
    misEnCause: "NKOLO Bertrand, se présentant comme agent de micro-finance.",
    contact: { email: 'm.essomba@gmail.com',  telephone: '+237 677 100 002' },
    /* Identifie en cours d'enquete a partir du numero utilise pour le
       virement : la convocation peut donc lui etre adressee. */
    contactMisEnCause: { email: null, telephone: '+237 655 803 217' },
    pieces: [{ nom: 'recu-mobile-money.jpg',        taille: '740 Ko' },
              { nom: 'captures-conversation.pdf',   taille: '2,1 Mo' }]
  },
  {
    id: '2026-00412', citoyen: 'CIT-003', type: 'Agression', plaignant: 'Paul ATANGANA',
    date: '08/05/2026', heure: '11h20', statut: 'DECISION', score: 91,
    enqueteur: 'Insp. BIYA', priorite: 'URGENTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Nlongkak, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Corporel', montant: '', detail: 'Blessures légères — certificat médical disponible' },
    declaration: "J'ai été agressé physiquement par mon voisin suite à un différend concernant un terrain. Il m'a frappé à plusieurs reprises, causant des blessures légères. Je dispose d'un certificat médical.",
    contact: { email: 'p.atangana@gmail.com', telephone: '+237 677 100 003' },
    /* Voisin direct : ses coordonnees sont connues du plaignant. */
    contactMisEnCause: { email: null, telephone: '+237 699 442 018' },
    pieces: [{ nom: 'certificat-medical.pdf',       taille: '344 Ko' },
              { nom: 'photos-blessures.jpg',        taille: '2,6 Mo' }],
    misEnCause: "FOUDA Ernest, voisin direct, 40 ans environ."
  },
  {
    id: '2026-00398', citoyen: 'CIT-004', type: 'Harcèlement', plaignant: 'Fatima BELLO',
    date: '04/05/2026', heure: '16h45', statut: 'RECU', score: 45,
    enqueteur: null, priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Mendong, Yaoundé 6ème, Mfoundi, Centre',
    prejudice: { nature: 'Moral', montant: '', detail: 'Messages menaçants répétés' },
    declaration: "Je suis victime de harcèlement répété de la part d'un collègue de bureau depuis plusieurs semaines. Il m'envoie des messages menaçants et me surveille.",
    contact: { email: 'f.bello@gmail.com',    telephone: '+237 677 100 004' },
    contactMisEnCause: null,
    pieces: [{ nom: 'captures-messages.pdf',        taille: '1,2 Mo' }],
    misEnCause: null
  },
  {
    id: '2026-00377', citoyen: 'CIT-005', type: 'Dégradation', plaignant: 'Alain FOKO',
    date: '28/04/2026', heure: '07h00', statut: 'CLOTURE', score: 88,
    enqueteur: 'Insp. KANA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Obili, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '450 000', detail: 'Moto Yamaha 125 — rétroviseurs et phare avant brisés' },
    declaration: "Ma moto a été délibérément endommagée dans la nuit du 28 avril. Les rétroviseurs et le phare avant ont été brisés. Des voisins ont entendu du bruit mais n'ont pas vu l'auteur.",
    contact: { email: 'a.foko@gmail.com',     telephone: '+237 677 100 005' },
    contactMisEnCause: null,
    pieces: [{ nom: 'photos-degats-moto.jpg',       taille: '3,4 Mo' },
              { nom: 'facture-moto.pdf',            taille: '96 Ko' }],
    misEnCause: null
  },
  /* Dossier affecte mais pas encore convoque : c'est le seul etat ou
     « Fixer la date d'audition » est proposee. Il permet de derouler la
     chaine complete — convocation, audition tenue, proces-verbal — sans
     rien avoir a preparer. */
  {
    id: '2026-00462', citoyen: 'CIT-006', type: 'Escroquerie', plaignant: 'Sylvie NANA',
    date: '02/06/2026', heure: '10h15', statut: 'RECU', score: 79,
    enqueteur: 'Insp. KANA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Nkolbisson, Yaoundé 7ème, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '320 000', detail: 'Versement pour une commande de marchandises jamais livrée' },
    declaration: "J'ai versé 320 000 FCFA à un commerçant pour une commande de marchandises qui ne m'a jamais été livrée. Il ne répond plus à mes appels depuis trois semaines. J'ai conservé le reçu de versement et nos échanges.",
    contact: { email: 's.nana@gmail.com', telephone: '+237 677 100 006' },
    /* Coordonnees connues : la convocation du mis en cause est donc
       possible par les trois canaux. */
    contactMisEnCause: { email: 'commerce.mbala@yahoo.fr', telephone: '+237 655 231 470' },
    pieces: [{ nom: 'recu-versement.pdf',           taille: '128 Ko' },
              { nom: 'echanges-whatsapp.pdf',       taille: '870 Ko' }],
    misEnCause: "MBALA Joseph, commerçant au marché Mokolo, boutique B-42."
  },
  /* Instruction menee a son terme : c'est le seul etat ou la cloture est
     proposee, et le seul dossier de KANA a l'atteindre. */
  {
    id: '2026-00429', citoyen: 'CIT-007', type: 'Vol avec violence', plaignant: 'Georges TCHOUMI',
    date: '10/05/2026', heure: '19h30', statut: 'DECISION', score: 85,
    enqueteur: 'Insp. KANA', priorite: 'URGENTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Essos, Yaoundé 4ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel et corporel', montant: '180 000', detail: 'Sacoche contenant 180 000 FCFA — contusions au bras' },
    declaration: "En rentrant du travail le 10 mai vers 19h30, deux individus à moto m'ont barré la route à Essos. L'un d'eux m'a saisi le bras et arraché ma sacoche contenant 180 000 FCFA avant de prendre la fuite. J'ai été légèrement blessé au bras.",
    contact: { email: 'g.tchoumi@gmail.com', telephone: '+237 677 100 007' },
    contactMisEnCause: { email: null, telephone: '+237 690 774 512' },
    pieces: [{ nom: 'certificat-medical-bras.pdf', taille: '212 Ko' },
              { nom: 'plan-des-lieux.jpg',         taille: '1,4 Mo' }],
    misEnCause: "ONANA Serge, interpellé le 21 mai, reconnu par le plaignant."
  },

  /* ── Dossiers d'un commissariat en activité ──────────────────
     Quatre plaintes attendent une affectation, deux enquêteurs se
     partagent le reste, et tous les statuts sont représentés — y compris
     la transmission au parquet, qu'aucun dossier n'illustrait.
     ─────────────────────────────────────────────────────────── */
  {
    id: '2026-00473', citoyen: 'CIT-001', type: 'Escroquerie / Fraude', plaignant: 'Jean MBIDA',
    date: '08/06/2026', heure: '08h50', statut: 'RECU', score: 71,
    enqueteur: null, priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Mvog-Ada, Yaoundé 4ème, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '95 000', detail: 'Achat en ligne d\'un téléphone jamais livré' },
    declaration: "J'ai commandé un téléphone sur une page de vente en ligne et versé 95 000 FCFA par Mobile Money à un vendeur qui s'est engagé à livrer sous deux jours. La livraison n'a jamais eu lieu et le vendeur a bloqué mon numéro.",
    contact: { email: 'j.mbida@gmail.com', telephone: '+237 677 100 001' },
    contactMisEnCause: null,
    pieces: [{ nom: 'capture-annonce-vente.jpg', taille: '610 Ko' },
              { nom: 'recu-mobile-money.pdf',     taille: '84 Ko' }],
    misEnCause: "Vendeur en ligne se présentant sous le nom « Tech Deals 237 »."
  },
  {
    id: '2026-00470', citoyen: 'CIT-008', type: 'Vol avec violence', plaignant: 'Clarisse ONANA',
    date: '03/06/2026', heure: '21h10', statut: 'RECU', score: 88,
    enqueteur: null, priorite: 'URGENTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Ngoa-Ekelle, Yaoundé 3ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel et corporel', montant: '240 000', detail: 'Sac à dos, ordinateur portable — éraflures au poignet' },
    declaration: "Le 3 juin vers 21h00, en rentrant du campus, deux individus m'ont bousculée à hauteur du carrefour Ngoa-Ekelle et arraché mon sac à dos contenant mon ordinateur portable. J'ai été tirée au sol et me suis blessée au poignet.",
    contact: { email: 'c.onana@gmail.com', telephone: '+237 677 100 008' },
    contactMisEnCause: null,
    pieces: [{ nom: 'certificat-medical-poignet.pdf', taille: '198 Ko' },
              { nom: 'facture-ordinateur.pdf',        taille: '145 Ko' }],
    misEnCause: "Deux individus à pied, non identifiés."
  },
  {
    id: '2026-00468', citoyen: 'CIT-009', type: 'Accident de la route', plaignant: 'Emmanuel NJOYA',
    date: '01/06/2026', heure: '07h25', statut: 'RECU', score: 64,
    enqueteur: null, priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Carrefour Mvan, Yaoundé 3ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '380 000', detail: 'Aile avant et portière gauche du véhicule' },
    declaration: "Le 1er juin au matin, un véhicule a grillé le feu au carrefour Mvan et heurté l'avant gauche du mien. Le conducteur a refusé le constat amiable et a quitté les lieux. J'ai relevé sa plaque d'immatriculation.",
    contact: { email: 'e.njoya@gmail.com', telephone: '+237 677 100 009' },
    contactMisEnCause: null,
    pieces: [{ nom: 'photos-degats-vehicule.jpg', taille: '2,9 Mo' },
              { nom: 'constat-non-signe.pdf',     taille: '112 Ko' }],
    misEnCause: "Conducteur d'un véhicule immatriculé LT 745 AB, non identifié à ce jour."
  },
  {
    id: '2026-00455', citoyen: 'CIT-010', type: 'Escroquerie / Fraude', plaignant: 'Rachel MEKA',
    date: '20/05/2026', heure: '11h40', statut: 'EN_INSTRUCTION', score: 76,
    enqueteur: 'Insp. BIYA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Emana, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '450 000', detail: 'Frais versés pour un emploi fictif' },
    declaration: "Une personne se présentant comme agent de recrutement d'un hôpital privé m'a réclamé 450 000 FCFA de frais de dossier pour un poste d'infirmière. Après le versement, elle a cessé de répondre et l'établissement m'a confirmé qu'aucun recrutement n'était ouvert.",
    contact: { email: 'r.meka@gmail.com', telephone: '+237 677 100 010' },
    contactMisEnCause: { email: 'recrut.sante@yahoo.fr', telephone: '+237 691 208 334' },
    pieces: [{ nom: 'recu-versement-frais.pdf',  taille: '96 Ko' },
              { nom: 'echanges-sms.pdf',          taille: '540 Ko' }],
    misEnCause: "AYISSI Léon, se présentant comme agent de recrutement."
  },
  {
    id: '2026-00441', citoyen: 'CIT-011', type: 'Dégradation de biens', plaignant: 'Hervé TALLA',
    date: '13/05/2026', heure: '06h40', statut: 'AUDITION', score: 69,
    enqueteur: 'Insp. BIYA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Etoudi, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '620 000', detail: 'Atelier de menuiserie — machines et stock de bois' },
    declaration: "Dans la nuit du 12 au 13 mai, la porte de mon atelier de menuiserie a été forcée et deux machines ont été détériorées. Du bois de commande a été répandu et rendu inutilisable. Un différend m'oppose depuis des mois à un voisin au sujet de la mitoyenneté.",
    contact: { email: 'h.talla@gmail.com', telephone: '+237 677 100 011' },
    contactMisEnCause: { email: null, telephone: '+237 678 445 190' },
    pieces: [{ nom: 'photos-atelier.jpg',        taille: '3,1 Mo' },
              { nom: 'devis-reparation.pdf',     taille: '132 Ko' },
              { nom: 'facture-bois-commande.pdf', taille: '78 Ko' }],
    misEnCause: "MBALLA Didier, voisin mitoyen de l'atelier."
  },
  {
    id: '2026-00405', citoyen: 'CIT-012', type: 'Harcèlement', plaignant: 'Brigitte MANGA',
    date: '06/05/2026', heure: '17h55', statut: 'CLOTURE', score: 58,
    enqueteur: 'Insp. BIYA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Mimboman, Yaoundé 4ème, Mfoundi, Centre',
    prejudice: { nature: 'Moral', montant: '', detail: 'Appels et messages répétés, jour et nuit' },
    declaration: "Depuis mars, je reçois des appels et des messages répétés d'un ancien collègue, parfois en pleine nuit. Il se présente devant mon domicile et attend mon retour. J'ai changé de numéro sans que cela cesse.",
    contact: { email: 'b.manga@gmail.com', telephone: '+237 677 100 012' },
    contactMisEnCause: { email: null, telephone: '+237 696 331 025' },
    pieces: [{ nom: 'releve-appels.pdf',      taille: '224 Ko' },
              { nom: 'captures-messages.pdf', taille: '1,1 Mo' }],
    misEnCause: "ABEGA Cyrille, ancien collègue de la plaignante."
  },
  {
    id: '2026-00389', citoyen: 'CIT-013', type: 'Vol avec violence', plaignant: 'Serge EYENGA',
    date: '30/04/2026', heure: '22h30', statut: 'TRANSMIS', score: 84,
    enqueteur: 'Insp. KANA', priorite: 'HAUTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Nkoldongo, Yaoundé 4ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel et corporel', montant: '310 000', detail: 'Téléphone et recette de la journée — coup porté à la tête' },
    declaration: "En quittant mon poste de garde le 30 avril vers 22h30, un individu que je connais de vue m'a menacé puis frappé à la tête avant d'emporter mon téléphone et la recette de la journée. J'ai été soigné à l'hôpital de district.",
    contact: { email: 's.eyenga@gmail.com', telephone: '+237 677 100 013' },
    contactMisEnCause: { email: null, telephone: '+237 699 512 806' },
    pieces: [{ nom: 'certificat-medical-tete.pdf', taille: '256 Ko' },
              { nom: 'attestation-employeur.pdf',  taille: '88 Ko' }],
    misEnCause: "NDONGO Alphonse, connu du plaignant, domicilié au quartier Nkoldongo."
  },

  /* ── Deuxième trimestre : le reste de l'activité ─────────────
     Le commissariat en compte assez pour que les files d'attente se
     paginent, que les statistiques portent sur autre chose qu'une
     poignée de dossiers, et que chaque enquêteur ait un historique.
     ─────────────────────────────────────────────────────────── */
  {
    id: '2026-00476', citoyen: 'CIT-014', type: 'Vol simple', plaignant: 'Léonie ABANDA',
    date: '09/06/2026', heure: '13h20', statut: 'RECU', score: 62,
    enqueteur: null, priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Marché Mokolo, Yaoundé 2ème, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '75 000', detail: 'Recette de la matinée, dans une sacoche' },
    declaration: "Ce matin au marché Mokolo, pendant que je servais des clients, ma sacoche posée derrière le comptoir a disparu avec la recette de la matinée, environ 75 000 FCFA. Personne n'a rien vu.",
    contact: { email: 'l.abanda@gmail.com', telephone: '+237 677 100 014' },
    contactMisEnCause: null,
    pieces: [{ nom: 'plan-emplacement.jpg', taille: '520 Ko' }],
    misEnCause: null
  },
  {
    id: '2026-00475', citoyen: 'CIT-015', type: 'Accident de la route', plaignant: 'Théodore KAMGA',
    date: '09/06/2026', heure: '06h40', statut: 'RECU', score: 70,
    enqueteur: null, priorite: 'HAUTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Carrefour Nsam, Yaoundé 3ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '1 250 000', detail: 'Camionnette de livraison — essieu avant et cabine' },
    declaration: "Un camion a reculé sur ma camionnette stationnée au carrefour Nsam, endommageant l'essieu avant et la cabine. Le chauffeur a reconnu les faits sur place mais son employeur refuse toute prise en charge.",
    contact: { email: 't.kamga@gmail.com', telephone: '+237 677 100 015' },
    contactMisEnCause: { email: null, telephone: '+237 694 118 220' },
    pieces: [{ nom: 'photos-camionnette.jpg', taille: '3,8 Mo' },
              { nom: 'devis-garage.pdf',      taille: '164 Ko' }],
    misEnCause: "SIMO Bertrand, chauffeur du camion immatriculé CE 902 KL."
  },
  {
    id: '2026-00474', citoyen: 'CIT-016', type: 'Harcèlement', plaignant: 'Adèle NGO BASSONG',
    date: '08/06/2026', heure: '19h05', statut: 'RECU', score: 54,
    enqueteur: null, priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Nkomo, Yaoundé 5ème, Mfoundi, Centre',
    prejudice: { nature: 'Moral', montant: '', detail: 'Propos menaçants répétés sur le lieu de travail' },
    declaration: "Un collègue de service tient depuis deux mois des propos menaçants à mon encontre devant les patients. Ma hiérarchie a été informée par écrit et n'a pris aucune mesure.",
    contact: { email: 'a.ngobassong@gmail.com', telephone: '+237 677 100 016' },
    contactMisEnCause: null,
    pieces: [{ nom: 'courrier-hierarchie.pdf', taille: '92 Ko' }],
    misEnCause: "Collègue de service, nommé dans le courrier joint."
  },
  {
    id: '2026-00466', citoyen: 'CIT-017', type: 'Escroquerie / Fraude', plaignant: 'Vincent OWONA',
    date: '31/05/2026', heure: '15h30', statut: 'AUDITION', score: 74,
    enqueteur: 'Insp. KANA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Efoulan, Yaoundé 3ème, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '260 000', detail: 'Acompte pour un lot de matériel électrique jamais livré' },
    declaration: "J'ai versé un acompte de 260 000 FCFA pour un lot de câbles et de disjoncteurs. Le fournisseur a encaissé, m'a donné trois rendez-vous auxquels il ne s'est pas présenté, puis a fermé sa boutique.",
    contact: { email: 'v.owona@gmail.com', telephone: '+237 677 100 017' },
    contactMisEnCause: { email: null, telephone: '+237 677 903 441' },
    pieces: [{ nom: 'bon-de-commande.pdf', taille: '108 Ko' },
              { nom: 'recu-acompte.pdf',    taille: '76 Ko' }],
    misEnCause: "TAGNE Fabrice, gérant d'un magasin de matériel électrique à Efoulan."
  },
  {
    id: '2026-00461', citoyen: 'CIT-018', type: 'Dégradation de biens', plaignant: 'Nadège DJOUMESSI',
    date: '28/05/2026', heure: '08h15', statut: 'AUDITION', score: 66,
    enqueteur: 'Insp. BIYA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Mvog-Mbi, Yaoundé 4ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '185 000', detail: 'Machine à coudre industrielle et tissus de commande' },
    declaration: "En ouvrant mon atelier, j'ai trouvé la machine à coudre industrielle renversée et des tissus de commande tachés de peinture. La serrure n'a pas été forcée : quelqu'un possède une clé.",
    contact: { email: 'n.djoumessi@gmail.com', telephone: '+237 677 100 018' },
    contactMisEnCause: null,
    pieces: [{ nom: 'photos-atelier-couture.jpg', taille: '2,4 Mo' },
              { nom: 'factures-tissus.pdf',       taille: '118 Ko' }],
    misEnCause: null
  },
  {
    id: '2026-00452', citoyen: 'CIT-019', type: 'Vol avec violence', plaignant: 'Blaise ETOUNDI',
    date: '21/05/2026', heure: '04h50', statut: 'EN_INSTRUCTION', score: 81,
    enqueteur: 'Insp. BIYA', priorite: 'HAUTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Etoa-Meki, Yaoundé 2ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel et corporel', montant: '420 000', detail: 'Recette de la boulangerie — poignet foulé' },
    declaration: "En ouvrant la boulangerie avant l'aube, deux individus m'ont poussé à l'intérieur et pris la recette de la veille, 420 000 FCFA. Je me suis foulé le poignet en tombant. L'un d'eux portait un blouson que je reconnaîtrais.",
    contact: { email: 'b.etoundi@gmail.com', telephone: '+237 677 100 019' },
    contactMisEnCause: null,
    pieces: [{ nom: 'certificat-medical-poignet.pdf', taille: '186 Ko' },
              { nom: 'releve-caisse.pdf',             taille: '64 Ko' }],
    misEnCause: "Deux individus, dont un reconnaissable à son blouson."
  },
  {
    id: '2026-00448', citoyen: 'CIT-020', type: 'Escroquerie / Fraude', plaignant: 'Solange MBALLA',
    date: '18/05/2026', heure: '10h05', statut: 'EN_INSTRUCTION', score: 77,
    enqueteur: 'Insp. KANA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Tsinga, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '540 000', detail: 'Marchandises payées, jamais reçues' },
    declaration: "Un grossiste m'a fait virer 540 000 FCFA pour un conteneur de marchandises. Les documents de transport qu'il m'a transmis sont des faux — le transporteur cité n'a jamais reçu cette commande.",
    contact: { email: 's.mballa@gmail.com', telephone: '+237 677 100 020' },
    contactMisEnCause: { email: 'grossiste.import@yahoo.fr', telephone: '+237 655 740 019' },
    pieces: [{ nom: 'ordre-de-virement.pdf',   taille: '88 Ko' },
              { nom: 'faux-connaissement.pdf', taille: '210 Ko' }],
    misEnCause: "NKOUE Guy-Bertrand, se présentant comme grossiste importateur."
  },
  {
    id: '2026-00431', citoyen: 'CIT-021', type: 'Vol simple', plaignant: 'Aristide NDJOMO',
    date: '11/05/2026', heure: '17h40', statut: 'CLOTURE', score: 72,
    enqueteur: 'Insp. NKOA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Odza, Yaoundé 4ème, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '210 000', detail: 'Caisse à outils et compresseur' },
    declaration: "Ma caisse à outils et mon petit compresseur ont disparu de l'atelier pendant la pause. Un apprenti a vu partir un homme avec un sac de ce format.",
    contact: { email: 'a.ndjomo@gmail.com', telephone: '+237 677 100 021' },
    contactMisEnCause: { email: null, telephone: '+237 698 220 517' },
    pieces: [{ nom: 'liste-outils.pdf',      taille: '54 Ko' },
              { nom: 'facture-compresseur.pdf', taille: '72 Ko' }],
    misEnCause: "ESSOMBA Rodrigue, ancien apprenti de l'atelier."
  },
  {
    id: '2026-00420', citoyen: 'CIT-014', type: 'Agression physique', plaignant: 'Léonie ABANDA',
    date: '04/05/2026', heure: '20h55', statut: 'CLOTURE', score: 68,
    enqueteur: 'Insp. NKOA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Mokolo, Yaoundé 2ème, Mfoundi, Centre',
    prejudice: { nature: 'Corporel', montant: '', detail: 'Contusions au bras — huit jours d\'arrêt' },
    declaration: "Une dispute au sujet d'un emplacement de vente a dégénéré : une commerçante voisine m'a frappée au bras avec un tabouret. J'ai huit jours d'arrêt de travail.",
    contact: { email: 'l.abanda@gmail.com', telephone: '+237 677 100 014' },
    contactMisEnCause: { email: null, telephone: '+237 677 445 903' },
    pieces: [{ nom: 'certificat-medical-bras-abanda.pdf', taille: '148 Ko' }],
    misEnCause: "NGONO Pauline, commerçante voisine au marché Mokolo."
  },
  {
    id: '2026-00402', citoyen: 'CIT-015', type: 'Escroquerie / Fraude', plaignant: 'Théodore KAMGA',
    date: '05/05/2026', heure: '09h30', statut: 'DECISION', score: 79,
    enqueteur: 'Insp. BIYA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Nsam, Yaoundé 3ème, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '300 000', detail: 'Fausse assurance de véhicule' },
    declaration: "J'ai souscrit et payé 300 000 FCFA une assurance pour ma camionnette auprès d'un démarcheur. À la première vérification routière, l'attestation s'est révélée fausse : la compagnie citée ne l'a jamais émise.",
    contact: { email: 't.kamga@gmail.com', telephone: '+237 677 100 015' },
    contactMisEnCause: { email: null, telephone: '+237 656 331 887' },
    pieces: [{ nom: 'fausse-attestation.pdf', taille: '124 Ko' },
              { nom: 'recu-paiement.pdf',      taille: '68 Ko' }],
    misEnCause: "MEKONGO Jules, démarcheur en assurances, interpellé le 22 mai."
  }
];

/* ============================================================
   HISTORIQUE DE TRAITEMENT

   Un événement par dossier, daté, dans l'ordre chronologique. Remplace la
   frise à sept étapes qui était écrite en dur dans citoyen.js : elle
   affichait les mêmes dates (15/05/2026) et le même enquêteur pour tous
   les dossiers, y compris celui déposé le 28 avril.

   Deux natures d'écrit de l'enquêteur, volontairement distinctes :

     type 'message' — adressé au plaignant, visible dans son espace ;
     type 'note'    — interne au commissariat, jamais affichée au citoyen.

   Les portails de suivi existants (San Francisco, Minneapolis, Seattle)
   exposent le statut d'un dossier mais pas les notes d'enquête : une
   procédure en cours reste confidentielle. C'est l'enquêteur qui décide
   de ce qu'il partage.
   ============================================================ */

/* Ordre réel de la procédure : le plaignant est d'abord convoqué et
   auditionné, l'enquête vient ensuite. L'ordre précédent plaçait
   l'instruction avant l'audition, ce qui ne correspond pas au déroulement
   décrit dans le compte rendu d'entretien au commissariat. */
const ORDRE_ETAPES = ['RECU', 'AUDITION', 'EN_INSTRUCTION', 'DECISION', 'TRANSMIS', 'CLOTURE'];

/* Libellés des étapes de la frise, côté citoyen. */
const ETAPES = [
  { cle: 'RECU',           icon: 'batiment', libelle: 'Plainte reçue',   attente: 'Réception et affectation à un enquêteur' },
  { cle: 'AUDITION',       icon: 'tribunal', libelle: 'Audition',        attente: 'Convocation et recueil de vos déclarations' },
  { cle: 'EN_INSTRUCTION', icon: 'loupe',    libelle: 'Enquête',         attente: 'Vérifications et recherche des éléments' },
  { cle: 'DECISION',       icon: 'balance',  libelle: 'Décision',        attente: 'Transmission au parquet ou classement' },
  { cle: 'CLOTURE',        icon: 'valide',   libelle: 'Clôture',         attente: 'Vous êtes notifié par e-mail' }
];

/* Chaque évènement porte l'étape à laquelle il se rattache : les messages
   ne sont pas des étapes, ils se lisent à l'intérieur de l'étape en cours
   au moment où l'enquêteur les a écrits. */
const HISTORIQUE = {
  '2026-00451': [
    { etape: 'RECU', type: 'depot',       date: '15/05/2026', heure: '14h32', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '15/05/2026', heure: '14h33', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '15/05/2026', heure: '14h35', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '16/05/2026', heure: '09h00', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné' },

    { etape: 'AUDITION', type: 'convocation', date: '16/05/2026', heure: '11h00', libelle: 'Convocation à votre audition', detail: 'Audition fixée au 17/05/2026 à 10h00' },
    { etape: 'AUDITION', type: 'statut',      date: '16/05/2026', heure: '11h10', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '17/05/2026', heure: '10h00', libelle: 'Votre audition',               detail: 'Déclarations recueillies' },
    { etape: 'AUDITION', type: 'pv',          date: '17/05/2026', heure: '11h20', libelle: 'Procès-verbal établi',         detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'message', date: '17/05/2026', heure: '11h35', auteur: 'Insp. KANA',
      texte: "Votre audition s'est bien déroulée, le procès-verbal est joint. Relisez-le : si un détail vous paraît inexact, signalez-le-moi avant la fin de l'enquête.",
      pieces: [{ nom: 'PV-audition-2026-00451.pdf', taille: '184 Ko' }] },

    { etape: 'EN_INSTRUCTION', type: 'statut', date: '18/05/2026', heure: '09h00', libelle: 'Enquête ouverte', detail: 'Vérifications engagées' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '18/05/2026', heure: '10h15', auteur: 'Insp. KANA',
      texte: "J'ai sollicité les images de vidéosurveillance des commerces situés à l'entrée du marché. Si vous retrouvez la facture d'achat de votre téléphone ou son numéro IMEI, transmettez-les : cela faciliterait son identification en cas de revente.",
      pieces: [{ nom: 'demande-piece-IMEI.pdf', taille: '62 Ko' }] },
    { etape: 'EN_INSTRUCTION', type: 'note', date: '18/05/2026', heure: '10h20', auteur: 'Insp. KANA',
      texte: "Réquisition adressée au gérant du magasin d'électronique. Vérifier auprès des revendeurs du quartier Mokolo." }
  ],

  '2026-00438': [
    { etape: 'RECU', type: 'depot',       date: '12/05/2026', heure: '09h15', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '12/05/2026', heure: '09h16', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '12/05/2026', heure: '09h20', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '13/05/2026', heure: '10h00', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné' },
    { etape: 'RECU', type: 'message', date: '15/05/2026', heure: '15h40', auteur: 'Insp. KANA',
      texte: "Le numéro de téléphone que vous avez communiqué est enregistré au nom d'un tiers. Merci de me transmettre les captures d'écran de vos échanges ainsi que le reçu du transfert Mobile Money : ces pièces sont nécessaires à l'identification.",
      pieces: [] },

    { etape: 'AUDITION', type: 'convocation', date: '18/05/2026', heure: '10h50', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 20/05/2026 à 10h00 — par e-mail à m.essomba@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '18/05/2026', heure: '11h00', libelle: 'Audition programmée', detail: 'Convocation du plaignant émise' },
    /* L'intitulé disait « Convocation émise » alors qu'il s'agit du mis en
       cause : l'acte auquel l'évènement se rattache se lit sur le libellé,
       si bien qu'il se rangeait sous l'audition du plaignant. */
    { etape: 'AUDITION', type: 'convocation', date: '18/05/2026', heure: '11h10', libelle: 'Convocation du mis en cause',
      detail: 'NKOLO Bertrand convoqué pour le 22/05/2026 à 09h00' },
    { etape: 'AUDITION', type: 'message', date: '19/05/2026', heure: '08h30', auteur: 'Insp. KANA',
      texte: "Votre audition est fixée. Présentez-vous au commissariat muni de votre pièce d'identité et de tout justificatif du virement. La convocation est jointe.",
      pieces: [{ nom: 'convocation-2026-00438.pdf', taille: '78 Ko' }] },
    /* Audition tenue, procès-verbal encore non signé : c'est le seul
       dossier où l'enquêteur peut corriger le PV avant de le signer. Sans
       lui, la révision du §7.4 n'aurait aucun cas de démonstration. */
    { etape: 'AUDITION', type: 'audition', date: '20/05/2026', heure: '10h00', libelle: 'Votre audition', detail: 'Déclarations recueillies — procès-verbal en cours de relecture' }
  ],

  '2026-00412': [
    { etape: 'RECU', type: 'depot',       date: '08/05/2026', heure: '11h20', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '08/05/2026', heure: '11h21', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '08/05/2026', heure: '11h25', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '09/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné — priorité urgente' },

    { etape: 'AUDITION', type: 'convocation', date: '09/05/2026', heure: '08h30', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 10/05/2026 à 10h00 — par SMS au +237 677 100 003' },
    { etape: 'AUDITION', type: 'statut',      date: '09/05/2026', heure: '08h40', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition', date: '10/05/2026', heure: '10h00', libelle: 'Votre audition',                       detail: 'Déclarations recueillies' },
    { etape: 'AUDITION', type: 'pv',       date: '10/05/2026', heure: '14h00', libelle: 'Procès-verbal établi',                detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'audition', date: '13/05/2026', heure: '09h30', libelle: 'Audition de la personne mise en cause', detail: 'Comparution enregistrée' },
    { etape: 'AUDITION', type: 'message', date: '10/05/2026', heure: '14h30', auteur: 'Insp. BIYA',
      texte: "Votre certificat médical a été versé au dossier et votre PV d'audition est joint. La personne mise en cause sera entendue à son tour.",
      pieces: [{ nom: 'PV-audition-2026-00412.pdf', taille: '201 Ko' },
               { nom: 'certificat-medical.pdf',      taille: '344 Ko' }] },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '14/05/2026', heure: '08h00', libelle: 'Enquête ouverte', detail: 'Confrontation des déclarations' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '16/05/2026', heure: '16h00', auteur: 'Insp. BIYA',
      texte: "Les deux versions divergent sur l'origine du différend. J'ai entendu deux voisins comme témoins. Le dossier sera transmis pour décision.",
      pieces: [] },

    { etape: 'DECISION', type: 'statut', date: '20/05/2026', heure: '09h00', libelle: 'Dossier en délibération', detail: 'Analyse des éléments recueillis' }
  ],

  '2026-00398': [
    { etape: 'RECU', type: 'depot',       date: '04/05/2026', heure: '16h45', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '04/05/2026', heure: '16h46', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '04/05/2026', heure: '16h50', libelle: 'Reçue au Commissariat Cité Verte', detail: "En attente d'affectation à un enquêteur" }
  ],

  '2026-00377': [
    { etape: 'RECU', type: 'depot',       date: '28/04/2026', heure: '07h00', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '28/04/2026', heure: '07h01', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '28/04/2026', heure: '07h05', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '29/04/2026', heure: '07h30', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '29/04/2026', heure: '08h00', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 02/05/2026 à 09h00 — par e-mail à a.foko@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '29/04/2026', heure: '08h10', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition', date: '02/05/2026', heure: '09h00', libelle: 'Votre audition',        detail: 'Déclarations recueillies' },
    { etape: 'AUDITION', type: 'pv',       date: '02/05/2026', heure: '10h15', libelle: 'Procès-verbal établi',  detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'message', date: '02/05/2026', heure: '10h30', auteur: 'Insp. KANA',
      texte: "Votre PV d'audition est joint. Merci de me transmettre les photos des dégâts si vous en avez pris, ainsi que la facture d'achat de la moto.",
      pieces: [{ nom: 'PV-audition-2026-00377.pdf', taille: '167 Ko' }] },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '05/05/2026', heure: '08h00', libelle: 'Enquête ouverte', detail: 'Voisinage entendu' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '05/05/2026', heure: '09h00', auteur: 'Insp. KANA',
      texte: "Les voisins entendus n'ont pas pu identifier l'auteur des faits, et aucune caméra ne couvre la ruelle. En l'absence d'élément nouveau, le dossier ne peut être poursuivi en l'état.",
      pieces: [] },

    { etape: 'DECISION', type: 'statut', date: '20/05/2026', heure: '11h00', libelle: 'Dossier en délibération', detail: 'Classement envisagé' },

    { etape: 'CLOTURE', type: 'statut', date: '25/05/2026', heure: '10h00', libelle: 'Dossier clôturé', detail: 'Classé sans suite faute d\'auteur identifié' },
    { etape: 'CLOTURE', type: 'message', date: '25/05/2026', heure: '10h05', auteur: 'Insp. KANA',
      texte: "Votre dossier est clôturé. Si un élément nouveau apparaît — témoin, restitution du bien, aveu — vous pouvez demander sa réouverture en vous présentant au commissariat avec votre numéro de dossier.",
      pieces: [{ nom: 'notification-cloture.pdf', taille: '54 Ko' }] }
  ],

  /* Parcours complet : les quatre etapes sont franchies, le dossier attend
     son issue — transmission au parquet ou classement. */
  '2026-00429': [
    { etape: 'RECU', type: 'depot',       date: '10/05/2026', heure: '19h30', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '10/05/2026', heure: '19h31', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '10/05/2026', heure: '20h00', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '11/05/2026', heure: '08h15', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné — priorité urgente' },

    { etape: 'AUDITION', type: 'convocation', date: '11/05/2026', heure: '09h00', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 14/05/2026 à 09h00 — par e-mail à g.tchoumi@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '11/05/2026', heure: '09h10', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '14/05/2026', heure: '09h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    /* Commentaires rattachés à un acte : ils s'affichent sous lui. */
    { etape: 'AUDITION', type: 'note', date: '14/05/2026', heure: '09h40', auteur: 'Insp. KANA',
      apropos: "Enregistrer l'audition du plaignant",
      texte: "Le plaignant s'est présenté avec une demi-heure de retard, accompagné de son épouse qui n'a pas été entendue.",
      pieces: [] },
    { etape: 'AUDITION', type: 'pv',          date: '14/05/2026', heure: '11h20', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'message', date: '14/05/2026', heure: '11h35', auteur: 'Insp. KANA',
      texte: "Votre procès-verbal d'audition est joint. Le certificat médical que vous avez versé au dossier a été enregistré comme pièce à conviction.",
      pieces: [{ nom: 'PV-audition-2026-00429.pdf', taille: '184 Ko' }] },

    { etape: 'EN_INSTRUCTION', type: 'statut',      date: '18/05/2026', heure: '08h00', libelle: 'Enquête ouverte',
      detail: 'Recherche des auteurs engagée' },
    { etape: 'EN_INSTRUCTION', type: 'note',        date: '20/05/2026', heure: '15h40', libelle: 'Observation interne',
      detail: 'Recoupement avec deux faits similaires signalés à Essos le même mois.' },
    { etape: 'EN_INSTRUCTION', type: 'convocation', date: '21/05/2026', heure: '17h00', libelle: 'Convocation du mis en cause',
      detail: 'ONANA Serge convoqué pour le 22/05/2026 à 10h00' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '22/05/2026', heure: '16h00', auteur: 'Insp. KANA',
      texte: "La personne que vous avez reconnue s'est présentée ce jour et a été entendue. L'enquête se poursuit ; vous serez informé de la suite donnée à votre plainte.",
      pieces: [] },

    { etape: 'DECISION', type: 'statut', date: '28/05/2026', heure: '09h00', libelle: 'Dossier en délibération',
      detail: 'Analyse des éléments recueillis' },
    { etape: 'DECISION', type: 'note', date: '29/05/2026', heure: '14h10', auteur: 'Insp. KANA',
      apropos: 'Transmettre au procureur',
      texte: "Les faits relèvent du parquet : violence avec soustraction. Dossier prêt à transmettre, en attente de l'avis du commissaire.",
      pieces: [] },
    { etape: 'DECISION', type: 'message', date: '30/05/2026', heure: '08h30', auteur: 'Insp. KANA',
      apropos: 'Clôturer le dossier',
      texte: "Votre dossier est complet. Une décision vous sera notifiée prochainement ; vous n'avez aucune démarche à effectuer d'ici là.",
      pieces: [] }
  ],

  /* ── Nouveaux dossiers ────────────────────────────────────── */

  /* Déposée l'avant-veille, pas encore vue par le commissaire. */
  '2026-00473': [
    { etape: 'RECU', type: 'depot',       date: '08/06/2026', heure: '08h50', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '08/06/2026', heure: '08h51', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '08/06/2026', heure: '09h30', libelle: 'Reçue au Commissariat Cité Verte', detail: "En attente d'affectation à un enquêteur" }
  ],

  '2026-00470': [
    { etape: 'RECU', type: 'depot',       date: '03/06/2026', heure: '21h10', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '03/06/2026', heure: '21h11', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '03/06/2026', heure: '22h05', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Signalée en urgence — atteinte aux personnes' }
  ],

  '2026-00468': [
    { etape: 'RECU', type: 'depot',       date: '01/06/2026', heure: '07h25', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '01/06/2026', heure: '07h26', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '01/06/2026', heure: '08h15', libelle: 'Reçue au Commissariat Cité Verte', detail: "En attente d'affectation à un enquêteur" }
  ],

  /* Enquête en cours : le mis en cause a comparu, les vérifications
     bancaires sont engagées. */
  '2026-00455': [
    { etape: 'RECU', type: 'depot',       date: '20/05/2026', heure: '11h40', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '20/05/2026', heure: '11h41', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '20/05/2026', heure: '12h20', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '21/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '21/05/2026', heure: '09h10', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 23/05/2026 à 10h00 — par e-mail à r.meka@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '21/05/2026', heure: '09h20', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '23/05/2026', heure: '10h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '23/05/2026', heure: '11h45', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '24/05/2026', heure: '15h00', libelle: 'Convocation du mis en cause',
      detail: 'AYISSI Léon convoqué pour le 27/05/2026 à 09h00' },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '28/05/2026', heure: '08h30', libelle: 'Enquête ouverte',
      detail: 'Vérifications engagées auprès de l\'opérateur Mobile Money' },
    { etape: 'EN_INSTRUCTION', type: 'note',    date: '29/05/2026', heure: '10h20', libelle: 'Observation interne',
      detail: 'Le numéro ayant reçu les fonds est rattaché à une pièce d\'identité différente de celle déclarée.' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '30/05/2026', heure: '09h00', auteur: 'Insp. BIYA',
      texte: "La personne mise en cause s'est présentée et a été entendue. Une demande de relevé a été adressée à l'opérateur de transfert d'argent ; le dossier suit son cours.",
      pieces: [] }
  ],

  /* Audition en cours : le PV du plaignant reste à signer. */
  '2026-00441': [
    { etape: 'RECU', type: 'depot',       date: '13/05/2026', heure: '06h40', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '13/05/2026', heure: '06h41', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '13/05/2026', heure: '07h30', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '14/05/2026', heure: '08h10', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '14/05/2026', heure: '09h00', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 18/05/2026 à 08h30 — par SMS au +237 677 100 011' },
    { etape: 'AUDITION', type: 'statut',      date: '14/05/2026', heure: '09h10', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '18/05/2026', heure: '08h30', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal en cours de relecture' },
    { etape: 'AUDITION', type: 'message', date: '18/05/2026', heure: '09h50', auteur: 'Insp. BIYA',
      texte: "Merci de nous faire parvenir le devis de réparation des machines ainsi que la facture du bois de commande, afin de chiffrer précisément le préjudice.",
      pieces: [] }
  ],

  /* Clôturé après conciliation : le compte rendu d'entretien décrit ce
     dénouement comme fréquent pour les différends de voisinage. */
  '2026-00405': [
    { etape: 'RECU', type: 'depot',       date: '06/05/2026', heure: '17h55', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '06/05/2026', heure: '17h56', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '06/05/2026', heure: '18h30', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '07/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '07/05/2026', heure: '09h00', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 11/05/2026 à 09h00 — par e-mail à b.manga@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '07/05/2026', heure: '09h10', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '11/05/2026', heure: '09h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '11/05/2026', heure: '10h30', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '12/05/2026', heure: '14h00', libelle: 'Convocation du mis en cause',
      detail: 'ABEGA Cyrille convoqué pour le 15/05/2026 à 09h00' },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '18/05/2026', heure: '08h00', libelle: 'Enquête ouverte',
      detail: 'Relevé d\'appels versé au dossier' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '20/05/2026', heure: '11h00', auteur: 'Insp. BIYA',
      texte: "La personne mise en cause a été entendue et avertie. Elle s'est engagée par écrit à cesser tout contact. Nous vous invitons à signaler immédiatement toute reprise des faits.",
      pieces: [{ nom: 'engagement-ecrit.pdf', taille: '64 Ko' }] },

    { etape: 'DECISION', type: 'statut', date: '26/05/2026', heure: '09h00', libelle: 'Dossier en délibération',
      detail: 'Analyse des éléments recueillis' },
    { etape: 'DECISION', type: 'statut', date: '02/06/2026', heure: '10h00', libelle: 'Dossier clôturé',
      detail: 'Classé après engagement écrit et cessation des faits' },

    { etape: 'CLOTURE', type: 'message', date: '02/06/2026', heure: '10h10', auteur: 'Insp. BIYA',
      texte: "Votre dossier est clôturé. En cas de reprise du harcèlement, présentez-vous au commissariat avec votre numéro de dossier : la procédure sera rouverte sans nouvelle plainte.",
      pieces: [{ nom: 'notification-cloture.pdf', taille: '58 Ko' }] }
  ],

  /* Transmis au parquet : trois convocations restées sans effet. */
  '2026-00389': [
    { etape: 'RECU', type: 'depot',       date: '30/04/2026', heure: '22h30', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '30/04/2026', heure: '22h31', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '30/04/2026', heure: '23h15', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '02/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné — priorité haute' },

    { etape: 'AUDITION', type: 'convocation', date: '02/05/2026', heure: '09h00', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 05/05/2026 à 09h00 — par SMS au +237 677 100 013' },
    { etape: 'AUDITION', type: 'statut',      date: '02/05/2026', heure: '09h10', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '05/05/2026', heure: '09h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '05/05/2026', heure: '11h00', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '06/05/2026', heure: '10h00', libelle: 'Convocation du mis en cause',
      detail: 'NDONGO Alphonse convoqué pour le 11/05/2026 à 09h00' },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '13/05/2026', heure: '08h00', libelle: 'Enquête ouverte',
      detail: 'Recherches engagées au domicile du mis en cause' },
    { etape: 'EN_INSTRUCTION', type: 'note',    date: '19/05/2026', heure: '16h30', libelle: 'Observation interne',
      detail: 'Deuxième absence constatée. Le mis en cause aurait quitté le quartier.' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '26/05/2026', heure: '09h30', auteur: 'Insp. KANA',
      texte: "La personne mise en cause ne s'est présentée à aucune des trois convocations qui lui ont été adressées. Le dossier va être transmis au procureur de la République, qui décidera des suites.",
      pieces: [] },

    { etape: 'DECISION', type: 'statut', date: '28/05/2026', heure: '09h00', libelle: 'Dossier en délibération',
      detail: 'Trois absences constatées — saisine du parquet envisagée' },
    { etape: 'DECISION', type: 'statut', date: '01/06/2026', heure: '11h00', libelle: 'Dossier transmis au procureur',
      detail: 'Trois absences injustifiées du mis en cause' }
  ],

  /* ── Deuxième trimestre ───────────────────────────────────── */

  '2026-00476': [
    { etape: 'RECU', type: 'depot',       date: '09/06/2026', heure: '13h20', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '09/06/2026', heure: '13h21', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '09/06/2026', heure: '14h00', libelle: 'Reçue au Commissariat Cité Verte', detail: "En attente d'affectation à un enquêteur" }
  ],

  '2026-00475': [
    { etape: 'RECU', type: 'depot',       date: '09/06/2026', heure: '06h40', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '09/06/2026', heure: '06h41', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '09/06/2026', heure: '07h30', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Mis en cause identifié — traitement prioritaire' }
  ],

  '2026-00474': [
    { etape: 'RECU', type: 'depot',       date: '08/06/2026', heure: '19h05', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '08/06/2026', heure: '19h06', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '08/06/2026', heure: '20h10', libelle: 'Reçue au Commissariat Cité Verte', detail: "En attente d'affectation à un enquêteur" }
  ],

  /* Audition tenue, procès-verbal signé, mis en cause convoqué. */
  '2026-00466': [
    { etape: 'RECU', type: 'depot',       date: '31/05/2026', heure: '15h30', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '31/05/2026', heure: '15h31', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '31/05/2026', heure: '16h10', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '01/06/2026', heure: '08h05', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '01/06/2026', heure: '09h00', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 04/06/2026 à 09h30 — par e-mail à v.owona@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '01/06/2026', heure: '09h10', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '04/06/2026', heure: '09h30', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '04/06/2026', heure: '11h05', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '05/06/2026', heure: '10h00', libelle: 'Convocation du mis en cause',
      detail: 'TAGNE Fabrice convoqué pour le 10/06/2026 à 09h00' },
    { etape: 'AUDITION', type: 'message', date: '04/06/2026', heure: '11h30', auteur: 'Insp. KANA',
      texte: "Votre procès-verbal est joint. Le bon de commande et le reçu d'acompte suffisent à établir le versement ; le fournisseur est convoqué.",
      pieces: [{ nom: 'PV-audition-2026-00466.pdf', taille: '172 Ko' }] }
  ],

  /* Audition tenue, procès-verbal encore à signer. */
  '2026-00461': [
    { etape: 'RECU', type: 'depot',       date: '28/05/2026', heure: '08h15', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '28/05/2026', heure: '08h16', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '28/05/2026', heure: '09h00', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '29/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '29/05/2026', heure: '08h40', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 02/06/2026 à 08h30 — par SMS au +237 677 100 018' },
    { etape: 'AUDITION', type: 'statut',      date: '29/05/2026', heure: '08h50', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '02/06/2026', heure: '08h30', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal en cours de relecture' },
    { etape: 'AUDITION', type: 'note', date: '02/06/2026', heure: '09h20', libelle: 'Observation interne',
      detail: 'Serrure intacte : la clé a circulé. Liste des détenteurs à établir avec la plaignante.' }
  ],

  '2026-00452': [
    { etape: 'RECU', type: 'depot',       date: '21/05/2026', heure: '04h50', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '21/05/2026', heure: '04h51', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '21/05/2026', heure: '06h00', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Atteinte aux personnes — traitement prioritaire' },
    { etape: 'RECU', type: 'affectation', date: '21/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné — priorité haute' },

    { etape: 'AUDITION', type: 'convocation', date: '21/05/2026', heure: '08h30', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 22/05/2026 à 09h00 — par SMS au +237 677 100 019' },
    { etape: 'AUDITION', type: 'statut',      date: '21/05/2026', heure: '08h40', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '22/05/2026', heure: '09h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '22/05/2026', heure: '10h40', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '26/05/2026', heure: '08h00', libelle: 'Enquête ouverte',
      detail: 'Voisinage entendu, recherche du blouson signalé' },
    { etape: 'EN_INSTRUCTION', type: 'note',    date: '30/05/2026', heure: '14h15', libelle: 'Observation interne',
      detail: 'Mode opératoire proche de deux faits signalés à Etoa-Meki en avril.' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '02/06/2026', heure: '09h00', auteur: 'Insp. BIYA',
      texte: "Les recherches se poursuivent. Si vous revoyez l'individu au blouson dans le quartier, appelez le commissariat sans l'aborder.",
      pieces: [] }
  ],

  '2026-00448': [
    { etape: 'RECU', type: 'depot',       date: '18/05/2026', heure: '10h05', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '18/05/2026', heure: '10h06', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '18/05/2026', heure: '11h00', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '19/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '19/05/2026', heure: '08h45', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 21/05/2026 à 10h00 — par e-mail à s.mballa@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '19/05/2026', heure: '08h55', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '21/05/2026', heure: '10h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '21/05/2026', heure: '11h50', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '22/05/2026', heure: '09h30', libelle: 'Convocation du mis en cause',
      detail: 'NKOUE Guy-Bertrand convoqué pour le 26/05/2026 à 09h00' },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '28/05/2026', heure: '08h30', libelle: 'Enquête ouverte',
      detail: 'Vérification du connaissement auprès du transporteur cité' },
    { etape: 'EN_INSTRUCTION', type: 'note',    date: '01/06/2026', heure: '11h40', libelle: 'Observation interne',
      detail: 'Le transporteur confirme par écrit n\'avoir jamais enregistré cette expédition.' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '03/06/2026', heure: '10h15', auteur: 'Insp. KANA',
      texte: "Le transporteur cité sur vos documents confirme qu'aucune expédition n'a été enregistrée à votre nom. La pièce est versée au dossier ; le mis en cause a été entendu.",
      pieces: [{ nom: 'attestation-transporteur.pdf', taille: '96 Ko' }] }
  ],

  /* Clôturé après restitution : le compte rendu d'entretien cite ce
     dénouement comme le plus satisfaisant pour le plaignant. */
  '2026-00431': [
    { etape: 'RECU', type: 'depot',       date: '11/05/2026', heure: '17h40', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '11/05/2026', heure: '17h41', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '11/05/2026', heure: '18h20', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '12/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. NKOA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '12/05/2026', heure: '08h40', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 14/05/2026 à 09h00 — par SMS au +237 677 100 021' },
    { etape: 'AUDITION', type: 'statut',      date: '12/05/2026', heure: '08h50', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '14/05/2026', heure: '09h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '14/05/2026', heure: '10h20', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '15/05/2026', heure: '09h00', libelle: 'Convocation du mis en cause',
      detail: 'ESSOMBA Rodrigue convoqué pour le 19/05/2026 à 09h00' },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '20/05/2026', heure: '08h00', libelle: 'Enquête ouverte',
      detail: 'Ancien apprenti entendu, matériel recherché' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '23/05/2026', heure: '15h00', auteur: 'Insp. NKOA',
      texte: "La personne entendue a reconnu les faits et restitué la caisse à outils et le compresseur. Vous pouvez les récupérer au commissariat contre décharge.",
      pieces: [{ nom: 'proces-verbal-restitution.pdf', taille: '88 Ko' }] },

    { etape: 'DECISION', type: 'statut', date: '26/05/2026', heure: '09h00', libelle: 'Dossier en délibération',
      detail: 'Restitution effectuée — classement envisagé' },
    { etape: 'DECISION', type: 'statut', date: '29/05/2026', heure: '10h00', libelle: 'Dossier clôturé',
      detail: 'Classé après restitution intégrale du matériel' },

    { etape: 'CLOTURE', type: 'message', date: '29/05/2026', heure: '10h10', auteur: 'Insp. NKOA',
      texte: "Votre dossier est clôturé, le matériel vous ayant été restitué. La notification de clôture est jointe.",
      pieces: [{ nom: 'notification-cloture-2026-00431.pdf', taille: '56 Ko' }] }
  ],

  '2026-00420': [
    { etape: 'RECU', type: 'depot',       date: '04/05/2026', heure: '20h55', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '04/05/2026', heure: '20h56', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '04/05/2026', heure: '21h40', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '05/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. NKOA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '05/05/2026', heure: '08h30', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 07/05/2026 à 09h00 — par e-mail à l.abanda@gmail.com' },
    { etape: 'AUDITION', type: 'statut',      date: '05/05/2026', heure: '08h40', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '07/05/2026', heure: '09h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '07/05/2026', heure: '10h30', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '08/05/2026', heure: '09h00', libelle: 'Convocation du mis en cause',
      detail: 'NGONO Pauline convoquée pour le 12/05/2026 à 09h00' },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '13/05/2026', heure: '08h00', libelle: 'Enquête ouverte',
      detail: 'Les deux parties entendues, témoins du marché recueillis' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '15/05/2026', heure: '11h00', auteur: 'Insp. NKOA',
      texte: "Les deux parties ont été entendues et une conciliation a été signée devant nous, avec engagement de ne plus se disputer l'emplacement. Le certificat médical reste au dossier.",
      pieces: [{ nom: 'proces-verbal-conciliation.pdf', taille: '78 Ko' }] },

    { etape: 'DECISION', type: 'statut', date: '19/05/2026', heure: '09h00', libelle: 'Dossier en délibération',
      detail: 'Conciliation signée — classement envisagé' },
    { etape: 'DECISION', type: 'statut', date: '22/05/2026', heure: '10h00', libelle: 'Dossier clôturé',
      detail: 'Classé après conciliation entre les parties' },

    { etape: 'CLOTURE', type: 'message', date: '22/05/2026', heure: '10h10', auteur: 'Insp. NKOA',
      texte: "Votre dossier est clôturé sur conciliation. En cas de nouvel incident avec la même personne, présentez-vous avec votre numéro de dossier : la procédure sera rouverte.",
      pieces: [{ nom: 'notification-cloture-2026-00420.pdf', taille: '58 Ko' }] }
  ],

  '2026-00402': [
    { etape: 'RECU', type: 'depot',       date: '05/05/2026', heure: '09h30', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '05/05/2026', heure: '09h31', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '05/05/2026', heure: '10h15', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '06/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné — priorité normale' },

    { etape: 'AUDITION', type: 'convocation', date: '06/05/2026', heure: '08h35', libelle: 'Convocation du plaignant',
      detail: 'Audition fixée au 08/05/2026 à 09h00 — par SMS au +237 677 100 015' },
    { etape: 'AUDITION', type: 'statut',      date: '06/05/2026', heure: '08h45', libelle: 'Audition programmée',
      detail: 'Convocation du plaignant émise' },
    { etape: 'AUDITION', type: 'audition',    date: '08/05/2026', heure: '09h00', libelle: 'Votre audition',
      detail: 'Déclarations recueillies — procès-verbal établi' },
    { etape: 'AUDITION', type: 'pv',          date: '08/05/2026', heure: '10h50', libelle: 'Procès-verbal établi',
      detail: "PV d'audition signé" },
    { etape: 'AUDITION', type: 'convocation', date: '11/05/2026', heure: '09h00', libelle: 'Convocation du mis en cause',
      detail: 'MEKONGO Jules convoqué pour le 22/05/2026 à 09h00' },

    { etape: 'EN_INSTRUCTION', type: 'statut',  date: '14/05/2026', heure: '08h00', libelle: 'Enquête ouverte',
      detail: 'Compagnie d\'assurance interrogée sur l\'attestation produite' },
    { etape: 'EN_INSTRUCTION', type: 'note',    date: '18/05/2026', heure: '15h20', libelle: 'Observation interne',
      detail: 'La compagnie confirme par écrit que le numéro de police n\'existe pas. Faux et usage de faux.' },
    { etape: 'EN_INSTRUCTION', type: 'message', date: '25/05/2026', heure: '09h30', auteur: 'Insp. BIYA',
      texte: "La compagnie citée confirme que l'attestation est fausse. Le démarcheur a été interpellé et entendu. Les faits relèvent du faux et usage de faux.",
      pieces: [{ nom: 'reponse-compagnie.pdf', taille: '102 Ko' }] },

    { etape: 'DECISION', type: 'statut', date: '01/06/2026', heure: '09h00', libelle: 'Dossier en délibération',
      detail: 'Qualification des faits en cours — transmission au parquet envisagée' }
  ],

  /* Affecte, rien de plus : l'enqueteur reprend le dossier a son debut. */
  '2026-00462': [
    { etape: 'RECU', type: 'depot',       date: '02/06/2026', heure: '10h15', libelle: 'Plainte déposée en ligne',         detail: 'Enregistrée sur PlainteCam' },
    { etape: 'RECU', type: 'attestation', date: '02/06/2026', heure: '10h16', libelle: 'Attestation envoyée par e-mail',   detail: 'Numéro de dossier transmis' },
    { etape: 'RECU', type: 'reception',   date: '02/06/2026', heure: '10h40', libelle: 'Reçue au Commissariat Cité Verte', detail: 'Prise en charge officielle' },
    { etape: 'RECU', type: 'affectation', date: '02/06/2026', heure: '11h05', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné — priorité normale' }
  ]
};

/* Évènements visibles par le plaignant : tout sauf les notes internes. */
function historiqueCitoyen(numeroDossier) {
  return (HISTORIQUE[numeroDossier] || []).filter(e => e.type !== 'note');
}

/* ============================================================
   CONVOCATIONS

   Le compte rendu d'entretien est formel : lorsque le mis en cause est
   identifié, il est convoqué « au minimum 3 fois ». En cas d'absence
   répétée et injustifiée, le dossier est transmis au procureur.

   D'où le numéro d'ordre — le champ numero_ordre existe déjà dans
   supabase/schema.sql — et les trois états possibles.
   ============================================================ */

const CONVOCATIONS = {
  /* Le mis en cause ne se présente pas : deux absences constatées, la
     troisième convocation est en cours. */
  '2026-00438': [
    { ordre: 1, nom: 'NKOLO Bertrand', date: '22/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour escroquerie." },
    { ordre: 2, nom: 'NKOLO Bertrand', date: '29/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: 'Seconde convocation — absence non justifiée à la première.' },
    { ordre: 3, nom: 'NKOLO Bertrand', date: '05/06/2026', heure: '09h00', statut: 'EN_ATTENTE',
      motif: 'Troisième et dernière convocation avant transmission au procureur.' }
  ],
  '2026-00412': [
    { ordre: 1, nom: 'FOUDA Ernest', date: '13/05/2026', heure: '09h30', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour agression physique." }
  ],
  /* Le mis en cause a comparu : l'instruction a pu aller a son terme. */
  '2026-00429': [
    { ordre: 1, nom: 'ONANA Serge', date: '22/05/2026', heure: '10h00', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour vol avec violence." }
  ],
  '2026-00455': [
    { ordre: 1, nom: 'AYISSI Léon', date: '27/05/2026', heure: '09h00', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour escroquerie." }
  ],
  '2026-00405': [
    { ordre: 1, nom: 'ABEGA Cyrille', date: '15/05/2026', heure: '09h00', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour harcèlement." }
  ],
  /* Trois absences constatees : c'est ce qui a fonde la saisine du
     parquet, conformement au compte rendu d'entretien. */
  '2026-00389': [
    { ordre: 1, nom: 'NDONGO Alphonse', date: '11/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour vol avec violence." },
    { ordre: 2, nom: 'NDONGO Alphonse', date: '19/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: 'Seconde convocation — absence non justifiée à la première.' },
    { ordre: 3, nom: 'NDONGO Alphonse', date: '27/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: 'Troisième et dernière convocation avant transmission au procureur.' }
  ],

  /* ── Deuxième trimestre ───────────────────────────────────── */
  /* Convoqué, la comparution reste attendue. */
  '2026-00466': [
    { ordre: 1, nom: 'TAGNE Fabrice', date: '10/06/2026', heure: '09h00', statut: 'EN_ATTENTE',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour escroquerie." }
  ],
  /* Absent une première fois, une seconde convocation est en cours. */
  '2026-00448': [
    { ordre: 1, nom: 'NKOUE Guy-Bertrand', date: '26/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour escroquerie." },
    { ordre: 2, nom: 'NKOUE Guy-Bertrand', date: '05/06/2026', heure: '09h00', statut: 'EN_ATTENTE',
      motif: 'Seconde convocation — absence non justifiée à la première.' }
  ],
  '2026-00431': [
    { ordre: 1, nom: 'ESSOMBA Rodrigue', date: '19/05/2026', heure: '09h00', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour vol simple." }
  ],
  '2026-00420': [
    { ordre: 1, nom: 'NGONO Pauline', date: '12/05/2026', heure: '09h00', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour agression physique." }
  ],
  '2026-00402': [
    { ordre: 1, nom: 'MEKONGO Jules', date: '22/05/2026', heure: '09h00', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour escroquerie." }
  ]
};

const STATUT_CONVOCATION = {
  EN_ATTENTE: ['badge-orange', 'En attente'],
  COMPARU:    ['badge-green',  'Comparu'],
  ABSENT:     ['badge-red',    'Absent']
};

const ORDINAUX = ['1re', '2e', '3e', '4e', '5e'];

function convocationsDe(numeroDossier) {
  return CONVOCATIONS[numeroDossier] || [];
}

/* Une convocation ne peut être émise que si le mis en cause est identifié :
   sur un vol commis par un inconnu, il n'y a personne à convoquer. */
function misEnCauseIdentifie(dossier) {
  if (!dossier || !dossier.misEnCause) return false;
  /* Un simple signalement physique ne vaut pas identité. */
  return !/^(jeune homme|homme|femme|individu|inconnu)/i.test(dossier.misEnCause.trim());
}

/* Trois absences constatées : le dossier relève du procureur. */
function absencesConstatees(numeroDossier) {
  return convocationsDe(numeroDossier).filter(c => c.statut === 'ABSENT').length;
}
function doitPasserAuProcureur(numeroDossier) {
  return absencesConstatees(numeroDossier) >= 3;
}

const STATUT_LABELS = {
  RECU: ['badge-blue', 'Reçu'],
  AUDITION: ['badge-gold', 'Audition'],
  EN_INSTRUCTION: ['badge-orange', 'Enquête en cours'],
  DECISION: ['badge-orange', 'Décision'],
  TRANSMIS: ['badge-gray', 'Transmis'],
  CLOTURE: ['badge-green', 'Clôturé'],
};

/* ============================================================
   CORRECTIONS DU PROCÈS-VERBAL

   Le §7.4 demande un PV révisable dont « toutes les modifications sont
   tracées ». Le compte rendu d'entretien explique pourquoi : le mis en
   cause refuse parfois de signer en prétextant que le contenu ne reflète
   pas ses déclarations. Sans historique des versions, ce refus est
   invérifiable et fragilise la procédure.

   On ne conserve donc pas seulement le texte corrigé, mais chaque
   révision : qui, quand, l'avant et l'après. Une fois le PV signé, il
   n'est plus modifiable.
   ============================================================ */

const PV_CORRECTIONS = {};

function clePV(numeroDossier, audition) {
  return numeroDossier + '|' + (audition || 'plaignant');
}

/* Texte en vigueur : la dernière correction, ou l'original s'il n'y en a pas. */
function pvTexte(numeroDossier, audition, original) {
  const e = PV_CORRECTIONS[clePV(numeroDossier, audition)];
  return (e && e.texte) ? e.texte : original;
}

function pvRevisions(numeroDossier, audition) {
  const e = PV_CORRECTIONS[clePV(numeroDossier, audition)];
  return e ? e.revisions : [];
}

function pvEstSigne(numeroDossier) {
  return (HISTORIQUE[numeroDossier] || []).some(e => e.type === 'pv');
}

/* Enregistre une correction. Refuse si le PV est déjà signé : un document
   signé ne se réécrit pas. */
function corrigerPV(numeroDossier, audition, nouveauTexte, auteur, original) {
  if (pvEstSigne(numeroDossier)) return false;

  const cle = clePV(numeroDossier, audition);
  const avant = pvTexte(numeroDossier, audition, original);
  if (avant === nouveauTexte) return false;

  if (!PV_CORRECTIONS[cle]) PV_CORRECTIONS[cle] = { texte: null, revisions: [] };

  const m = new Date();
  const dd = n => String(n).padStart(2, '0');
  PV_CORRECTIONS[cle].revisions.push({
    date: dd(m.getDate()) + '/' + dd(m.getMonth() + 1) + '/' + m.getFullYear(),
    heure: dd(m.getHours()) + 'h' + dd(m.getMinutes()),
    auteur: auteur,
    avant: avant,
    apres: nouveauTexte
  });
  PV_CORRECTIONS[cle].texte = nouveauTexte;
  return true;
}
