/* ============================================================
   Données fictives partagées entre les espaces

   Les champs lieu, declaration, misEnCause et commissariat sont reprisd
   de supabase/seed.sql, afin que le document de plainte téléchargeable
   depuis le suivi porte le contenu réel du dossier et non un texte
   générique.
   ============================================================ */

const DOSSIERS = [
  {
    id: '2026-00451', type: 'Vol simple', plaignant: 'Jean MBIDA',
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
    id: '2026-00438', type: 'Escroquerie', plaignant: 'Marie ESSOMBA',
    date: '12/05/2026', heure: '09h15', statut: 'AUDITION', score: 67,
    enqueteur: 'Insp. KANA', priorite: 'NORMALE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Biyem-Assi, Yaoundé 6ème, Mfoundi, Centre',
    prejudice: { nature: 'Financier', montant: '200 000', detail: 'Virement Mobile Money non remboursé' },
    declaration: "Un individu s'est présenté comme agent d'une société de micro-finance. Il m'a soutiré un virement de 200 000 FCFA en promettant un remboursement avec intérêts. Depuis lors, il est injoignable.",
    contact: { email: 'm.essomba@gmail.com',  telephone: '+237 677 100 002' },
    contactMisEnCause: null,
    pieces: [{ nom: 'recu-mobile-money.jpg',        taille: '740 Ko' },
              { nom: 'captures-conversation.pdf',   taille: '2,1 Mo' }],
    misEnCause: null
  },
  {
    id: '2026-00412', type: 'Agression', plaignant: 'Paul ATANGANA',
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
    id: '2026-00398', type: 'Harcèlement', plaignant: 'Fatima BELLO',
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
    id: '2026-00377', type: 'Dégradation', plaignant: 'Alain FOKO',
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

    { etape: 'AUDITION', type: 'statut',      date: '18/05/2026', heure: '11h00', libelle: 'Audition programmée', detail: 'Convocation des parties' },
    { etape: 'AUDITION', type: 'convocation', date: '18/05/2026', heure: '11h10', libelle: 'Convocation émise',   detail: 'Personne mise en cause convoquée' },
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
    { etape: 'RECU', type: 'affectation', date: '09/05/2026', heure: '08h00', libelle: 'Dossier affecté',                  detail: 'Insp. BIYA désigné' },

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
    { etape: 'RECU', type: 'affectation', date: '29/04/2026', heure: '07h30', libelle: 'Dossier affecté',                  detail: 'Insp. KANA désigné' },

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
    { ordre: 1, nom: 'Suspect non identifié — société de micro-finance', date: '22/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour escroquerie." },
    { ordre: 2, nom: 'Suspect non identifié — société de micro-finance', date: '29/05/2026', heure: '09h00', statut: 'ABSENT',
      motif: 'Seconde convocation — absence non justifiée à la première.' },
    { ordre: 3, nom: 'Suspect non identifié — société de micro-finance', date: '05/06/2026', heure: '09h00', statut: 'EN_ATTENTE',
      motif: 'Troisième et dernière convocation avant transmission au procureur.' }
  ],
  '2026-00412': [
    { ordre: 1, nom: 'FOUDA Ernest', date: '13/05/2026', heure: '09h30', statut: 'COMPARU',
      motif: "Audition dans le cadre de l'instruction d'une plainte pour agression physique." }
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
