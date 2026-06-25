-- ============================================================
-- PLAINTECAM — Données de test
-- Executer APRES schema.sql
-- ============================================================

-- ── COMMISSARIATS ────────────────────────────────────────────

INSERT INTO commissariats (id, nom, region, departement, arrondissement, adresse, telephone) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Commissariat Cité Verte',     'Centre',   'Mfoundi',     'Yaoundé 1er',  'Av. Kennedy, Yaoundé',   '+237 222 23 40 10'),
  ('a1000000-0000-0000-0000-000000000002', 'Commissariat Biyem-Assi',     'Centre',   'Mfoundi',     'Yaoundé 6ème', 'Carrefour Biyem-Assi',   '+237 222 31 20 00'),
  ('a1000000-0000-0000-0000-000000000003', 'Commissariat Akwa',           'Littoral', 'Wouri',       'Douala 1er',   'Rue Joss, Douala',        '+237 233 42 10 00'),
  ('a1000000-0000-0000-0000-000000000004', 'Commissariat New Bell',       'Littoral', 'Wouri',       'Douala 5ème',  'Av. New Bell, Douala',    '+237 233 50 00 00'),
  ('a1000000-0000-0000-0000-000000000005', 'Commissariat Bafoussam Centre','Ouest',   'Mifi',        'Bafoussam 1er','Rue du Commerce, BFM',   '+237 233 44 15 00');

-- ── UTILISATEURS (via auth.users simulé) ────────────────────
-- Note : en production, les users sont créés via Supabase Auth.
-- Pour le seed, on insere directement dans profils avec des UUID fixes.
-- Les vrais comptes auth doivent être créés via le dashboard Supabase.

-- Commissaire
INSERT INTO profils (id, role, nom, prenom, telephone, email, matricule, grade, commissariat_id) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'commissaire', 'NGUEMO', 'Nicole', '+237677000010', 'n.nguemo@police.cm', 'SN-2018001', 'Commissaire de Police', 'a1000000-0000-0000-0000-000000000001');

-- Enquêteurs
INSERT INTO profils (id, role, nom, prenom, telephone, email, matricule, grade, specialite, commissariat_id) VALUES
  ('b1000000-0000-0000-0000-000000000002', 'enqueteur', 'KANA',  'Nicole', '+237677000011', 'n.kana@police.cm',  'SN-2021044', 'Inspecteur de Police', 'Escroquerie, Fraude',   'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'enqueteur', 'BIYA',  'Pierre', '+237677000012', 'p.biya@police.cm',  'SN-2020031', 'Inspecteur de Police', 'Generaliste',           'a1000000-0000-0000-0000-000000000001');

-- Citoyens
INSERT INTO profils (id, role, nom, prenom, telephone, email, cni) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'citoyen', 'MBIDA',   'Jean',  '+237677100001', 'j.mbida@gmail.com',    'CM0012345678'),
  ('b1000000-0000-0000-0000-000000000011', 'citoyen', 'ESSOMBA', 'Marie', '+237677100002', 'm.essomba@gmail.com',  'CM0012345679'),
  ('b1000000-0000-0000-0000-000000000012', 'citoyen', 'ATANGANA','Paul',  '+237677100003', 'p.atangana@gmail.com', 'CM0012345680'),
  ('b1000000-0000-0000-0000-000000000013', 'citoyen', 'BELLO',   'Fatima','+237677100004', 'f.bello@gmail.com',    'CM0012345681'),
  ('b1000000-0000-0000-0000-000000000014', 'citoyen', 'FOKO',    'Alain', '+237677100005', 'a.foko@gmail.com',     'CM0012345682');

-- ── PLAINTES ─────────────────────────────────────────────────

INSERT INTO plaintes (
  id, numero_dossier, plaignant_id, commissariat_id, enqueteur_id,
  type_infraction, statut, priorite, score_ia,
  date_faits, lieu_region, lieu_departement, lieu_arrondissement, lieu_quartier, lieu_adresse,
  declaration, mis_en_cause_description,
  reponses_questionnaire, date_affectation, created_at
) VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    '2026-00451',
    'b1000000-0000-0000-0000-000000000010',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Vol simple', 'EN_INSTRUCTION', 'HAUTE', 82,
    '2026-05-15', 'Centre', 'Mfoundi', 'Yaoundé 1er', 'Mokolo', 'Marché Mokolo, face entrée principale',
    'Le 15 mai 2026 vers 14h00, je me trouvais au Marché Mokolo à Yaoundé. Un individu inconnu, jeune homme d''environ 25 ans, vêtu d''un tee-shirt rouge, a arraché mon téléphone Samsung Galaxy de couleur noire. Il a pris la fuite en courant. Valeur : 150 000 FCFA.',
    'Jeune homme, environ 25 ans, taille moyenne, tee-shirt rouge, jean bleu.',
    '{"Q1": "Téléphone Samsung Galaxy noir, 150 000 FCFA", "Q2": "Après-midi (12h-18h)", "Q3": "Je l''ai aperçu brièvement", "Q4": "Oui"}',
    '2026-05-16 09:00:00+00',
    '2026-05-15 14:32:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    '2026-00438',
    'b1000000-0000-0000-0000-000000000011',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Escroquerie / Fraude', 'AUDITION', 'NORMALE', 67,
    '2026-05-12', 'Centre', 'Mfoundi', 'Yaoundé 6ème', 'Biyem-Assi', NULL,
    'Un individu s''est présenté comme agent d''une société de micro-finance. Il m''a soutenu un virement de 200 000 FCFA promettant un remboursement avec intérêts. Depuis lors, il est injoignable.',
    NULL,
    '{"Q1": "Par téléphone", "Q2": "200 000 FCFA", "Q3": "Oui", "Q4": "Nom et numéro de téléphone"}',
    '2026-05-13 10:00:00+00',
    '2026-05-12 09:15:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    '2026-00412',
    'b1000000-0000-0000-0000-000000000012',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000003',
    'Agression physique', 'DECISION', 'URGENTE', 91,
    '2026-05-08', 'Centre', 'Mfoundi', 'Yaoundé 1er', 'Nlongkak', NULL,
    'J''ai été agressé physiquement par mon voisin suite à un différend concernant un terrain. Il m''a frappé à plusieurs reprises causant des blessures légères. J''ai un certificat médical.',
    'FOUDA Ernest, voisin direct, 40 ans environ.',
    '{"Q1": "Oui, c''est une personne de mon entourage", "Q2": "Ce n''est pas la première fois", "Q3": "Oui, certificat médical"}',
    '2026-05-09 08:00:00+00',
    '2026-05-08 11:20:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    '2026-00398',
    'b1000000-0000-0000-0000-000000000013',
    'a1000000-0000-0000-0000-000000000001',
    NULL,
    'Harcelement', 'RECU', 'NORMALE', 45,
    '2026-05-04', 'Centre', 'Mfoundi', 'Yaoundé 6ème', 'Mendong', NULL,
    'Je suis victime de harcèlement répété de la part d''un collègue de bureau depuis plusieurs semaines. Il m''envoie des messages menaçants et me surveille.',
    NULL,
    '{}',
    NULL,
    '2026-05-04 16:45:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000005',
    '2026-00377',
    'b1000000-0000-0000-0000-000000000014',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Degradation de biens', 'CLOTURE', 'NORMALE', 88,
    '2026-04-28', 'Centre', 'Mfoundi', 'Yaoundé 1er', 'Obili', NULL,
    'Ma moto a été délibérément endommagée dans la nuit du 28 avril. Les retroviseurs et le phare avant ont été brisés. Des voisins ont entendu du bruit mais n''ont pas vu l''auteur.',
    NULL,
    '{"Q1": "Moto Yamaha 125, 450 000 FCFA", "Q3": "Je le soupçonne", "Q4": "Non"}',
    '2026-04-29 07:30:00+00',
    '2026-04-28 07:00:00+00'
  );

-- ── PROCES-VERBAUX ───────────────────────────────────────────

INSERT INTO proces_verbaux (plainte_id, contenu, genere_par_ia, signe, signe_par, date_signature) VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    E'PROCÈS-VERBAL D''AUDITION N° PV-2026-00451\n\nLe quinze mai deux mille vingt-six à quatorze heures trente-deux minutes,\nNous, Inspecteur N. KANA, officier de police judiciaire,\navons procédé à l''audition de :\n\nM. Jean MBIDA, demeurant à Yaoundé, porteur de la CNI N° CM0012345678.\n\nLequel nous a déclaré : "Le 15 mai 2026 vers 14h00, je me trouvais au Marché Mokolo. Un individu inconnu m''a arraché mon téléphone Samsung Galaxy d''une valeur de 150 000 FCFA et a pris la fuite."\n\nLecture faite, le comparant déclare que le présent procès-verbal est fidèle à ses déclarations.',
    true, false, NULL, NULL
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    E'PROCÈS-VERBAL D''AUDITION N° PV-2026-00412\n\nLe huit mai deux mille vingt-six,\nNous, Inspecteur P. BIYA, officier de police judiciaire,\navons procédé à l''audition de :\n\nM. Paul ATANGANA, demeurant à Yaoundé.\n\nLequel nous a déclaré avoir été victime d''une agression physique par son voisin M. FOUDA Ernest. Le comparant présente un certificat médical attestant de blessures légères.',
    true, true, 'b1000000-0000-0000-0000-000000000003', '2026-05-10 14:00:00+00'
  );

-- ── HISTORIQUE ───────────────────────────────────────────────

INSERT INTO historique (plainte_id, action, detail, effectue_par, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Plainte deposee',       'Plainte enregistrée - Vol simple',                              'b1000000-0000-0000-0000-000000000010', '2026-05-15 14:32:00+00'),
  ('c1000000-0000-0000-0000-000000000001', 'Attestation envoyee',   'Attestation de dépôt envoyée par SMS',                          NULL,                                   '2026-05-15 14:33:00+00'),
  ('c1000000-0000-0000-0000-000000000001', 'Reçue au commissariat', 'Dossier réceptionné au Commissariat Cité Verte',                NULL,                                   '2026-05-15 14:35:00+00'),
  ('c1000000-0000-0000-0000-000000000001', 'Affectation enqueteur', 'Dossier affecté à Insp. KANA',                                  'b1000000-0000-0000-0000-000000000001', '2026-05-16 09:00:00+00'),
  ('c1000000-0000-0000-0000-000000000001', 'Changement de statut',  'Statut passé de RECU à EN_INSTRUCTION',                         'b1000000-0000-0000-0000-000000000001', '2026-05-16 09:01:00+00'),

  ('c1000000-0000-0000-0000-000000000002', 'Plainte deposee',       'Plainte enregistrée - Escroquerie / Fraude',                    'b1000000-0000-0000-0000-000000000011', '2026-05-12 09:15:00+00'),
  ('c1000000-0000-0000-0000-000000000002', 'Affectation enqueteur', 'Dossier affecté à Insp. KANA',                                  'b1000000-0000-0000-0000-000000000001', '2026-05-13 10:00:00+00'),
  ('c1000000-0000-0000-0000-000000000002', 'Changement de statut',  'Statut passé de EN_INSTRUCTION à AUDITION',                    'b1000000-0000-0000-0000-000000000002', '2026-05-18 11:00:00+00'),

  ('c1000000-0000-0000-0000-000000000003', 'Plainte deposee',       'Plainte enregistrée - Agression physique',                      'b1000000-0000-0000-0000-000000000012', '2026-05-08 11:20:00+00'),
  ('c1000000-0000-0000-0000-000000000003', 'Affectation enqueteur', 'Dossier affecté à Insp. BIYA',                                  'b1000000-0000-0000-0000-000000000001', '2026-05-09 08:00:00+00'),
  ('c1000000-0000-0000-0000-000000000003', 'PV signe',              'PV signé électroniquement par Insp. BIYA',                     'b1000000-0000-0000-0000-000000000003', '2026-05-10 14:00:00+00'),
  ('c1000000-0000-0000-0000-000000000003', 'Changement de statut',  'Statut passé de AUDITION à DECISION',                          'b1000000-0000-0000-0000-000000000003', '2026-05-20 09:00:00+00'),

  ('c1000000-0000-0000-0000-000000000005', 'Plainte deposee',       'Plainte enregistrée - Degradation de biens',                    'b1000000-0000-0000-0000-000000000014', '2026-04-28 07:00:00+00'),
  ('c1000000-0000-0000-0000-000000000005', 'Changement de statut',  'Statut passé de DECISION à CLOTURE',                           'b1000000-0000-0000-0000-000000000001', '2026-05-25 10:00:00+00');

-- ── CONVOCATIONS ─────────────────────────────────────────────

INSERT INTO convocations (plainte_id, emis_par, nom_convoque, date_convocation, heure_convocation, motif, numero_ordre, statut, sms_envoye) VALUES
  (
    'c1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    'Suspect FOUDA Ernest',
    '2026-05-22', '09:00',
    'Audition dans le cadre de l''affaire N° 2026-00438 - Escroquerie / Fraude',
    1, 'EN_ATTENTE', true
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000003',
    'FOUDA Ernest',
    '2026-05-10', '10:00',
    'Audition dans le cadre de l''affaire N° 2026-00412 - Agression physique',
    1, 'COMPARU', true
  );
