-- ============================================================
-- PLAINTECAM — Schema Supabase (PostgreSQL)
-- Executer dans l'editeur SQL de Supabase Dashboard
-- ============================================================

-- ── TYPES ENUM ───────────────────────────────────────────────

CREATE TYPE role_utilisateur AS ENUM ('citoyen', 'enqueteur', 'commissaire', 'admin');
CREATE TYPE statut_plainte AS ENUM ('RECU', 'EN_INSTRUCTION', 'AUDITION', 'DECISION', 'TRANSMIS', 'CLOTURE');
CREATE TYPE priorite_plainte AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');
CREATE TYPE type_infraction AS ENUM (
  'Vol simple',
  'Vol avec violence',
  'Agression physique',
  'Escroquerie / Fraude',
  'Harcelement',
  'Degradation de biens',
  'Accident de la route',
  'Autre'
);
CREATE TYPE statut_convocation AS ENUM ('EN_ATTENTE', 'COMPARU', 'ABSENT');

-- ── TABLES ───────────────────────────────────────────────────

-- Commissariats
CREATE TABLE commissariats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  region TEXT NOT NULL,
  departement TEXT NOT NULL,
  arrondissement TEXT NOT NULL,
  adresse TEXT,
  telephone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profils utilisateurs (etend auth.users de Supabase)
CREATE TABLE profils (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_utilisateur NOT NULL DEFAULT 'citoyen',
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT UNIQUE,
  email TEXT,
  cni TEXT,
  matricule TEXT UNIQUE,
  grade TEXT,
  specialite TEXT,
  commissariat_id UUID REFERENCES commissariats(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Plaintes
CREATE TABLE plaintes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_dossier TEXT UNIQUE NOT NULL,
  plaignant_id UUID NOT NULL REFERENCES profils(id),
  commissariat_id UUID REFERENCES commissariats(id),
  enqueteur_id UUID REFERENCES profils(id),
  type_infraction type_infraction NOT NULL,
  statut statut_plainte NOT NULL DEFAULT 'RECU',
  priorite priorite_plainte NOT NULL DEFAULT 'NORMALE',
  score_ia INTEGER DEFAULT 0,
  date_faits DATE NOT NULL,
  lieu_region TEXT NOT NULL,
  lieu_departement TEXT NOT NULL,
  lieu_arrondissement TEXT NOT NULL,
  lieu_quartier TEXT,
  lieu_adresse TEXT,
  declaration TEXT NOT NULL,
  mis_en_cause_nom TEXT,
  mis_en_cause_prenom TEXT,
  mis_en_cause_adresse TEXT,
  mis_en_cause_telephone TEXT,
  mis_en_cause_description TEXT,
  reponses_questionnaire JSONB DEFAULT '{}',
  date_affectation TIMESTAMPTZ,
  date_cloture TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pieces jointes
CREATE TABLE pieces_jointes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plainte_id UUID NOT NULL REFERENCES plaintes(id) ON DELETE CASCADE,
  nom_fichier TEXT NOT NULL,
  type_mime TEXT NOT NULL,
  taille INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Proces-verbaux
CREATE TABLE proces_verbaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plainte_id UUID NOT NULL REFERENCES plaintes(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  genere_par_ia BOOLEAN DEFAULT true,
  signe BOOLEAN DEFAULT false,
  signe_par UUID REFERENCES profils(id),
  date_signature TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Convocations
CREATE TABLE convocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plainte_id UUID NOT NULL REFERENCES plaintes(id) ON DELETE CASCADE,
  emis_par UUID NOT NULL REFERENCES profils(id),
  nom_convoque TEXT NOT NULL,
  date_convocation DATE NOT NULL,
  heure_convocation TIME NOT NULL,
  motif TEXT NOT NULL,
  numero_ordre INTEGER DEFAULT 1,
  statut statut_convocation DEFAULT 'EN_ATTENTE',
  sms_envoye BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Historique (timeline du dossier)
CREATE TABLE historique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plainte_id UUID NOT NULL REFERENCES plaintes(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  detail TEXT,
  effectue_par UUID REFERENCES profils(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications SMS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinataire_id UUID NOT NULL REFERENCES profils(id),
  plainte_id UUID REFERENCES plaintes(id),
  telephone TEXT NOT NULL,
  message TEXT NOT NULL,
  envoye BOOLEAN DEFAULT false,
  date_envoi TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── INDEX ────────────────────────────────────────────────────

CREATE INDEX idx_plaintes_plaignant ON plaintes(plaignant_id);
CREATE INDEX idx_plaintes_enqueteur ON plaintes(enqueteur_id);
CREATE INDEX idx_plaintes_commissariat ON plaintes(commissariat_id);
CREATE INDEX idx_plaintes_statut ON plaintes(statut);
CREATE INDEX idx_plaintes_numero ON plaintes(numero_dossier);
CREATE INDEX idx_historique_plainte ON historique(plainte_id);
CREATE INDEX idx_convocations_plainte ON convocations(plainte_id);
CREATE INDEX idx_profils_role ON profils(role);
CREATE INDEX idx_profils_commissariat ON profils(commissariat_id);

-- ── RLS (Row Level Security) ─────────────────────────────────

ALTER TABLE profils ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaintes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces_jointes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proces_verbaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE convocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissariats ENABLE ROW LEVEL SECURITY;

-- Commissariats : lecture publique
CREATE POLICY "commissariats_select" ON commissariats
  FOR SELECT USING (true);

-- Profils : chacun voit le sien
CREATE POLICY "profils_select_own" ON profils
  FOR SELECT USING (auth.uid() = id);

-- Profils : les agents voient les profils de leur commissariat
CREATE POLICY "profils_select_agents" ON profils
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profils p
      WHERE p.id = auth.uid()
      AND p.role IN ('enqueteur', 'commissaire')
    )
  );

-- Profils : mise a jour de son propre profil
CREATE POLICY "profils_update_own" ON profils
  FOR UPDATE USING (auth.uid() = id);

-- Plaintes : le citoyen voit ses propres plaintes
CREATE POLICY "plaintes_select_citoyen" ON plaintes
  FOR SELECT USING (plaignant_id = auth.uid());

-- Plaintes : l'enqueteur voit ses dossiers affectes
CREATE POLICY "plaintes_select_enqueteur" ON plaintes
  FOR SELECT USING (enqueteur_id = auth.uid());

-- Plaintes : le commissaire voit tout son commissariat
CREATE POLICY "plaintes_select_commissaire" ON plaintes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profils p
      WHERE p.id = auth.uid()
      AND p.role = 'commissaire'
      AND p.commissariat_id = plaintes.commissariat_id
    )
  );

-- Plaintes : le citoyen peut creer
CREATE POLICY "plaintes_insert_citoyen" ON plaintes
  FOR INSERT WITH CHECK (plaignant_id = auth.uid());

-- Plaintes : les agents peuvent modifier
CREATE POLICY "plaintes_update_agent" ON plaintes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profils p
      WHERE p.id = auth.uid()
      AND p.role IN ('enqueteur', 'commissaire')
    )
  );

-- Historique : visible par les parties prenantes
CREATE POLICY "historique_select" ON historique
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plaintes pl
      WHERE pl.id = historique.plainte_id
      AND (
        pl.plaignant_id = auth.uid()
        OR pl.enqueteur_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profils p
          WHERE p.id = auth.uid()
          AND p.role = 'commissaire'
          AND p.commissariat_id = pl.commissariat_id
        )
      )
    )
  );

-- PV : visible par enqueteur et commissaire
CREATE POLICY "pv_select" ON proces_verbaux
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plaintes pl
      WHERE pl.id = proces_verbaux.plainte_id
      AND (
        pl.enqueteur_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profils p
          WHERE p.id = auth.uid()
          AND p.role = 'commissaire'
          AND p.commissariat_id = pl.commissariat_id
        )
      )
    )
  );

-- Convocations : visible par agents
CREATE POLICY "convocations_select" ON convocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profils p
      WHERE p.id = auth.uid()
      AND p.role IN ('enqueteur', 'commissaire')
    )
  );

-- Convocations : insertion par agents
CREATE POLICY "convocations_insert" ON convocations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profils p
      WHERE p.id = auth.uid()
      AND p.role IN ('enqueteur', 'commissaire')
    )
  );

-- Pieces jointes : visible par parties prenantes
CREATE POLICY "pj_select" ON pieces_jointes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plaintes pl
      WHERE pl.id = pieces_jointes.plainte_id
      AND (
        pl.plaignant_id = auth.uid()
        OR pl.enqueteur_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profils p
          WHERE p.id = auth.uid()
          AND p.role = 'commissaire'
          AND p.commissariat_id = pl.commissariat_id
        )
      )
    )
  );

-- Notifications : chacun voit les siennes
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (destinataire_id = auth.uid());

-- ── FONCTIONS ────────────────────────────────────────────────

-- Generation automatique du numero de dossier
CREATE OR REPLACE FUNCTION generer_numero_dossier()
RETURNS TRIGGER AS $$
DECLARE
  annee TEXT;
  seq INTEGER;
BEGIN
  annee := TO_CHAR(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(numero_dossier, '-', 2) AS INTEGER)
  ), 0) + 1
  INTO seq
  FROM plaintes
  WHERE numero_dossier LIKE annee || '-%';

  NEW.numero_dossier := annee || '-' || LPAD(seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_numero_dossier
  BEFORE INSERT ON plaintes
  FOR EACH ROW
  WHEN (NEW.numero_dossier IS NULL OR NEW.numero_dossier = '')
  EXECUTE FUNCTION generer_numero_dossier();

-- Ajout automatique dans l'historique lors d'un changement de statut
CREATE OR REPLACE FUNCTION log_changement_statut()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    INSERT INTO historique (plainte_id, action, detail)
    VALUES (
      NEW.id,
      'Changement de statut',
      'Statut passe de ' || OLD.statut || ' a ' || NEW.statut
    );
  END IF;

  IF OLD.enqueteur_id IS DISTINCT FROM NEW.enqueteur_id AND NEW.enqueteur_id IS NOT NULL THEN
    INSERT INTO historique (plainte_id, action, detail, effectue_par)
    VALUES (
      NEW.id,
      'Affectation enqueteur',
      'Dossier affecte a un enqueteur',
      NEW.enqueteur_id
    );
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_statut
  BEFORE UPDATE ON plaintes
  FOR EACH ROW
  EXECUTE FUNCTION log_changement_statut();

-- Historique automatique a la creation
CREATE OR REPLACE FUNCTION log_creation_plainte()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO historique (plainte_id, action, detail, effectue_par)
  VALUES (
    NEW.id,
    'Plainte deposee',
    'Plainte enregistree - ' || NEW.type_infraction,
    NEW.plaignant_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_creation
  AFTER INSERT ON plaintes
  FOR EACH ROW
  EXECUTE FUNCTION log_creation_plainte();

-- ── STORAGE BUCKET ───────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('pieces-jointes', 'pieces-jointes', false);

CREATE POLICY "pj_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pieces-jointes'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "pj_download" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pieces-jointes'
    AND auth.role() = 'authenticated'
  );
