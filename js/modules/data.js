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
    misEnCause: "NKOLO Bertrand, se présentant comme agent de micro-finance.",
    contact: { email: 'm.essomba@gmail.com',  telephone: '+237 677 100 002' },
    /* Identifie en cours d'enquete a partir du numero utilise pour le
       virement : la convocation peut donc lui etre adressee. */
    contactMisEnCause: { email: null, telephone: '+237 655 803 217' },
    pieces: [{ nom: 'recu-mobile-money.jpg',        taille: '740 Ko' },
              { nom: 'captures-conversation.pdf',   taille: '2,1 Mo' }]
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
  },
  /* Dossier affecte mais pas encore convoque : c'est le seul etat ou
     « Fixer la date d'audition » est proposee. Il permet de derouler la
     chaine complete — convocation, audition tenue, proces-verbal — sans
     rien avoir a preparer. */
  {
    id: '2026-00462', type: 'Escroquerie', plaignant: 'Sylvie NANA',
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
    id: '2026-00429', type: 'Vol avec violence', plaignant: 'Georges TCHOUMI',
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
