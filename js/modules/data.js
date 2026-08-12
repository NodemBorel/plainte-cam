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
    enqueteur: 'Insp. NGUEMO', priorite: 'HAUTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Marché Mokolo, Mokolo, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Matériel', montant: '150 000', detail: 'Téléphone Samsung Galaxy noir' },
    declaration: "Le 15 mai 2026 vers 14h00, je me trouvais au Marché Mokolo à Yaoundé. Un individu inconnu, jeune homme d'environ 25 ans, vêtu d'un tee-shirt rouge, a arraché mon téléphone Samsung Galaxy de couleur noire. Il a pris la fuite en courant. Valeur : 150 000 FCFA.",
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
    misEnCause: null
  },
  {
    id: '2026-00412', type: 'Agression', plaignant: 'Paul ATANGANA',
    date: '08/05/2026', heure: '11h20', statut: 'DECISION', score: 91,
    enqueteur: 'Insp. NGUEMO', priorite: 'URGENTE',
    commissariat: 'Commissariat Cité Verte, Yaoundé',
    lieu: 'Nlongkak, Yaoundé 1er, Mfoundi, Centre',
    prejudice: { nature: 'Corporel', montant: '', detail: 'Blessures légères — certificat médical disponible' },
    declaration: "J'ai été agressé physiquement par mon voisin suite à un différend concernant un terrain. Il m'a frappé à plusieurs reprises, causant des blessures légères. Je dispose d'un certificat médical.",
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
    misEnCause: null
  }
];

const STATUT_LABELS = {
  RECU: ['badge-blue', 'Reçu'],
  EN_INSTRUCTION: ['badge-orange', 'En instruction'],
  AUDITION: ['badge-gold', 'Audition'],
  DECISION: ['badge-orange', 'Décision'],
  TRANSMIS: ['badge-gray', 'Transmis'],
  CLOTURE: ['badge-green', 'Clôturé'],
};
