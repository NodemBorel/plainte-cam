/* ============================================================
   Données fictives partagées entre les espaces
   ============================================================ */

const DOSSIERS = [
  { id: '2026-00451', type: 'Vol simple', plaignant: 'Jean MBIDA', date: '15/05/2026', statut: 'EN_INSTRUCTION', score: 82, enqueteur: 'Insp. NGUEMO', priorite: 'HAUTE' },
  { id: '2026-00438', type: 'Escroquerie', plaignant: 'Marie ESSOMBA', date: '12/05/2026', statut: 'AUDITION', score: 67, enqueteur: 'Insp. KANA', priorite: 'NORMALE' },
  { id: '2026-00412', type: 'Agression', plaignant: 'Paul ATANGANA', date: '08/05/2026', statut: 'DECISION', score: 91, enqueteur: 'Insp. NGUEMO', priorite: 'URGENTE' },
  { id: '2026-00398', type: 'Harcèlement', plaignant: 'Fatima BELLO', date: '04/05/2026', statut: 'RECU', score: 45, enqueteur: null, priorite: 'NORMALE' },
  { id: '2026-00377', type: 'Dégradation', plaignant: 'Alain FOKO', date: '28/04/2026', statut: 'CLOTURE', score: 88, enqueteur: 'Insp. KANA', priorite: 'NORMALE' },
];

const STATUT_LABELS = {
  RECU: ['badge-blue', 'Recu'],
  EN_INSTRUCTION: ['badge-orange', 'En instruction'],
  AUDITION: ['badge-purple', 'Audition'],
  DECISION: ['badge-orange', 'Decision'],
  TRANSMIS: ['badge-gray', 'Transmis'],
  CLOTURE: ['badge-green', 'Cloture'],
};
