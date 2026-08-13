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
  ('b1000000-0000-0000-0000-000000000014', 'citoyen', 'FOKO',    'Alain', '+237677100005', 'a.foko@gmail.com',     'CM0012345682'),
  ('b1000000-0000-0000-0000-000000000015', 'citoyen', 'NANA',    'Sylvie','+237677100006', 's.nana@gmail.com',     'CM0012345683'),
  ('b1000000-0000-0000-0000-000000000016', 'citoyen', 'TCHOUMI', 'Georges','+237677100007','g.tchoumi@gmail.com',  'CM0012345684'),
  ('b1000000-0000-0000-0000-000000000017', 'citoyen', 'ONANA',   'Clarisse','+237677100008','c.onana@gmail.com',   'CM0012345685'),
  ('b1000000-0000-0000-0000-000000000018', 'citoyen', 'NJOYA',   'Emmanuel','+237677100009','e.njoya@gmail.com',   'CM0012345686'),
  ('b1000000-0000-0000-0000-000000000019', 'citoyen', 'MEKA',    'Rachel', '+237677100010','r.meka@gmail.com',     'CM0012345687'),
  ('b1000000-0000-0000-0000-00000000001a', 'citoyen', 'TALLA',   'Hervé',  '+237677100011','h.talla@gmail.com',    'CM0012345688'),
  ('b1000000-0000-0000-0000-00000000001b', 'citoyen', 'MANGA',   'Brigitte','+237677100012','b.manga@gmail.com',   'CM0012345689'),
  ('b1000000-0000-0000-0000-00000000001c', 'citoyen', 'EYENGA',  'Serge',  '+237677100013','s.eyenga@gmail.com',   'CM0012345690');

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
  ),
  -- Affectee mais pas encore convoquee : c'est l'etat de depart d'une
  -- instruction, celui qui permet de derouler la procedure entiere.
  (
    'c1000000-0000-0000-0000-000000000006',
    '2026-00462',
    'b1000000-0000-0000-0000-000000000015',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Escroquerie / Fraude', 'RECU', 'NORMALE', 79,
    '2026-06-02', 'Centre', 'Mfoundi', 'Yaoundé 7ème', 'Nkolbisson', NULL,
    'J''ai versé 320 000 FCFA à un commerçant pour une commande de marchandises qui ne m''a jamais été livrée. Il ne répond plus à mes appels depuis trois semaines. J''ai conservé le reçu de versement et nos échanges.',
    'MBALA Joseph, commerçant au marché Mokolo, boutique B-42.',
    '{"Q1": "320 000 FCFA", "Q2": "Oui, je connais son nom et sa boutique", "Q3": "Oui, reçu de versement", "Q4": "Nom, téléphone et adresse de la boutique"}',
    '2026-06-02 11:05:00+00',
    '2026-06-02 10:15:00+00'
  ),
  -- Instruction menee a son terme : le dossier attend son issue.
  (
    'c1000000-0000-0000-0000-000000000007',
    '2026-00429',
    'b1000000-0000-0000-0000-000000000016',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Vol avec violence', 'DECISION', 'URGENTE', 85,
    '2026-05-10', 'Centre', 'Mfoundi', 'Yaoundé 4ème', 'Essos', NULL,
    'En rentrant du travail le 10 mai vers 19h30, deux individus à moto m''ont barré la route à Essos. L''un d''eux m''a saisi le bras et arraché ma sacoche contenant 180 000 FCFA avant de prendre la fuite. J''ai été légèrement blessé au bras.',
    'ONANA Serge, interpellé le 21 mai, reconnu par le plaignant.',
    '{"Q1": "Sacoche contenant 180 000 FCFA", "Q2": "Soirée (18h-22h)", "Q3": "Oui, je l''ai reconnu", "Q4": "Oui, certificat médical"}',
    '2026-05-11 08:15:00+00',
    '2026-05-10 19:30:00+00'
  ),

  -- ── Le reste de l'activité du commissariat ────────────────
  -- Quatre plaintes attendent une affectation, deux enquêteurs se
  -- partagent le reste, et tous les statuts sont représentés.
  (
    'c1000000-0000-0000-0000-000000000008', '2026-00473',
    'b1000000-0000-0000-0000-000000000010',
    'a1000000-0000-0000-0000-000000000001', NULL,
    'Escroquerie / Fraude', 'RECU', 'NORMALE', 71,
    '2026-06-08', 'Centre', 'Mfoundi', 'Yaoundé 4ème', 'Mvog-Ada', NULL,
    'J''ai commandé un téléphone sur une page de vente en ligne et versé 95 000 FCFA par Mobile Money à un vendeur qui s''est engagé à livrer sous deux jours. La livraison n''a jamais eu lieu et le vendeur a bloqué mon numéro.',
    'Vendeur en ligne se présentant sous le nom « Tech Deals 237 ».',
    '{"Q1": "95 000 FCFA", "Q2": "Par Mobile Money", "Q3": "Oui, reçu de transfert", "Q4": "Un numéro de téléphone et un pseudonyme"}',
    NULL, '2026-06-08 08:50:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000009', '2026-00470',
    'b1000000-0000-0000-0000-000000000017',
    'a1000000-0000-0000-0000-000000000001', NULL,
    'Vol avec violence', 'RECU', 'URGENTE', 88,
    '2026-06-03', 'Centre', 'Mfoundi', 'Yaoundé 3ème', 'Ngoa-Ekelle', NULL,
    'Le 3 juin vers 21h00, en rentrant du campus, deux individus m''ont bousculée à hauteur du carrefour Ngoa-Ekelle et arraché mon sac à dos contenant mon ordinateur portable. J''ai été tirée au sol et me suis blessée au poignet.',
    'Deux individus à pied, non identifiés.',
    '{"Q1": "Sac à dos et ordinateur portable, 240 000 FCFA", "Q2": "Soirée (18h-22h)", "Q3": "Non, il faisait sombre", "Q4": "Oui, certificat médical"}',
    NULL, '2026-06-03 21:10:00+00'
  ),
  (
    'c1000000-0000-0000-0000-00000000000a', '2026-00468',
    'b1000000-0000-0000-0000-000000000018',
    'a1000000-0000-0000-0000-000000000001', NULL,
    'Accident de la route', 'RECU', 'NORMALE', 64,
    '2026-06-01', 'Centre', 'Mfoundi', 'Yaoundé 3ème', 'Mvan', NULL,
    'Le 1er juin au matin, un véhicule a grillé le feu au carrefour Mvan et heurté l''avant gauche du mien. Le conducteur a refusé le constat amiable et a quitté les lieux. J''ai relevé sa plaque d''immatriculation.',
    'Conducteur d''un véhicule immatriculé LT 745 AB, non identifié à ce jour.',
    '{"Q1": "Aile avant et portière gauche, 380 000 FCFA", "Q2": "Matin (6h-12h)", "Q3": "Non, mais j''ai la plaque", "Q4": "Photos des dégâts"}',
    NULL, '2026-06-01 07:25:00+00'
  ),
  (
    'c1000000-0000-0000-0000-00000000000b', '2026-00455',
    'b1000000-0000-0000-0000-000000000019',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000003',
    'Escroquerie / Fraude', 'EN_INSTRUCTION', 'NORMALE', 76,
    '2026-05-20', 'Centre', 'Mfoundi', 'Yaoundé 1er', 'Emana', NULL,
    'Une personne se présentant comme agent de recrutement d''un hôpital privé m''a réclamé 450 000 FCFA de frais de dossier pour un poste d''infirmière. Après le versement, elle a cessé de répondre et l''établissement m''a confirmé qu''aucun recrutement n''était ouvert.',
    'AYISSI Léon, se présentant comme agent de recrutement.',
    '{"Q1": "450 000 FCFA", "Q2": "Par Mobile Money", "Q3": "Oui, reçu de versement", "Q4": "Nom, numéro et adresse e-mail"}',
    '2026-05-21 08:00:00+00', '2026-05-20 11:40:00+00'
  ),
  (
    'c1000000-0000-0000-0000-00000000000c', '2026-00441',
    'b1000000-0000-0000-0000-00000000001a',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000003',
    'Degradation de biens', 'AUDITION', 'NORMALE', 69,
    '2026-05-13', 'Centre', 'Mfoundi', 'Yaoundé 1er', 'Etoudi', NULL,
    'Dans la nuit du 12 au 13 mai, la porte de mon atelier de menuiserie a été forcée et deux machines ont été détériorées. Du bois de commande a été répandu et rendu inutilisable. Un différend m''oppose depuis des mois à un voisin au sujet de la mitoyenneté.',
    'MBALLA Didier, voisin mitoyen de l''atelier.',
    '{"Q1": "Machines et stock de bois, 620 000 FCFA", "Q2": "Nuit (22h-6h)", "Q3": "Je le soupçonne", "Q4": "Oui, devis de réparation"}',
    '2026-05-14 08:10:00+00', '2026-05-13 06:40:00+00'
  ),
  (
    'c1000000-0000-0000-0000-00000000000d', '2026-00405',
    'b1000000-0000-0000-0000-00000000001b',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000003',
    'Harcelement', 'CLOTURE', 'NORMALE', 58,
    '2026-05-06', 'Centre', 'Mfoundi', 'Yaoundé 4ème', 'Mimboman', NULL,
    'Depuis mars, je reçois des appels et des messages répétés d''un ancien collègue, parfois en pleine nuit. Il se présente devant mon domicile et attend mon retour. J''ai changé de numéro sans que cela cesse.',
    'ABEGA Cyrille, ancien collègue de la plaignante.',
    '{"Q1": "Préjudice moral", "Q2": "Oui, c''est une personne de mon entourage", "Q3": "Oui, relevé d''appels", "Q4": "Nom et numéro de téléphone"}',
    '2026-05-07 08:00:00+00', '2026-05-06 17:55:00+00'
  ),
  (
    'c1000000-0000-0000-0000-00000000000e', '2026-00389',
    'b1000000-0000-0000-0000-00000000001c',
    'a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Vol avec violence', 'TRANSMIS', 'HAUTE', 84,
    '2026-04-30', 'Centre', 'Mfoundi', 'Yaoundé 4ème', 'Nkoldongo', NULL,
    'En quittant mon poste de garde le 30 avril vers 22h30, un individu que je connais de vue m''a menacé puis frappé à la tête avant d''emporter mon téléphone et la recette de la journée. J''ai été soigné à l''hôpital de district.',
    'NDONGO Alphonse, connu du plaignant, domicilié au quartier Nkoldongo.',
    '{"Q1": "Téléphone et recette, 310 000 FCFA", "Q2": "Nuit (22h-6h)", "Q3": "Oui, je le connais de vue", "Q4": "Oui, certificat médical"}',
    '2026-05-02 08:00:00+00', '2026-04-30 22:30:00+00'
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
  ('c1000000-0000-0000-0000-000000000005', 'Changement de statut',  'Statut passé de DECISION à CLOTURE',                           'b1000000-0000-0000-0000-000000000001', '2026-05-25 10:00:00+00'),

  ('c1000000-0000-0000-0000-000000000006', 'Plainte deposee',       'Plainte enregistrée - Escroquerie / Fraude',                    'b1000000-0000-0000-0000-000000000015', '2026-06-02 10:15:00+00'),
  ('c1000000-0000-0000-0000-000000000006', 'Attestation envoyee',   'Attestation de dépôt envoyée par e-mail',                       NULL,                                   '2026-06-02 10:16:00+00'),
  ('c1000000-0000-0000-0000-000000000006', 'Reçue au commissariat', 'Dossier réceptionné au Commissariat Cité Verte',                NULL,                                   '2026-06-02 10:40:00+00'),
  ('c1000000-0000-0000-0000-000000000006', 'Affectation enqueteur', 'Dossier affecté à Insp. KANA - priorité normale',               'b1000000-0000-0000-0000-000000000001', '2026-06-02 11:05:00+00'),

  ('c1000000-0000-0000-0000-000000000007', 'Plainte deposee',       'Plainte enregistrée - Vol avec violence',                        'b1000000-0000-0000-0000-000000000016', '2026-05-10 19:30:00+00'),
  ('c1000000-0000-0000-0000-000000000007', 'Affectation enqueteur', 'Dossier affecté à Insp. KANA - priorité urgente',                'b1000000-0000-0000-0000-000000000001', '2026-05-11 08:15:00+00'),
  ('c1000000-0000-0000-0000-000000000007', 'PV signe',              'PV signé électroniquement par Insp. KANA',                      'b1000000-0000-0000-0000-000000000002', '2026-05-14 11:20:00+00'),
  ('c1000000-0000-0000-0000-000000000007', 'Changement de statut',  'Statut passé de AUDITION à EN_INSTRUCTION',                     'b1000000-0000-0000-0000-000000000002', '2026-05-18 08:00:00+00'),
  ('c1000000-0000-0000-0000-000000000007', 'Changement de statut',  'Statut passé de EN_INSTRUCTION à DECISION',                     'b1000000-0000-0000-0000-000000000002', '2026-05-28 09:00:00+00');

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
  ),
  (
    'c1000000-0000-0000-0000-000000000007',
    'b1000000-0000-0000-0000-000000000002',
    'ONANA Serge',
    '2026-05-22', '10:00',
    'Audition dans le cadre de l''affaire N° 2026-00429 - Vol avec violence',
    1, 'COMPARU', true
  );
