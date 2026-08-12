# CAHIER DES CHARGES
## Plateforme numérique de dépôt et de traitement des plaintes policières au Cameroun

---

## SOMMAIRE

1. [Introduction](#1-introduction)
2. [Contexte et problématique](#2-contexte-et-problématique)
3. [Étude et revue de l'existant](#3-étude-et-revue-de-lexistant)
4. [Objectifs du projet](#4-objectifs-du-projet)
5. [Périmètre du projet](#5-périmètre-du-projet)
6. [Identification des acteurs](#6-identification-des-acteurs)
7. [Besoins fonctionnels](#7-besoins-fonctionnels)
8. [Besoins non fonctionnels](#8-besoins-non-fonctionnels)
9. [Maquettes des principales fonctionnalités](#9-maquettes-des-principales-fonctionnalités)
10. [Architecture des fonctionnalités](#10-architecture-des-fonctionnalités)
11. [Modélisation UML](#11-modélisation-uml)
12. [Modélisation des données](#12-modélisation-des-données)
13. [Architecture technique](#13-architecture-technique)
14. [Technologies utilisées](#14-technologies-utilisées)
15. [Planning du projet](#15-planning-du-projet)
16. [Livrables](#16-livrables)
17. [Conclusion](#17-conclusion)

---

## 1. Introduction

### 1.1 Présentation générale du projet

Le présent document constitue le cahier des charges de la plateforme **PlainteCam**, une application web permettant à tout citoyen camerounais de déposer une plainte auprès des services de police de manière entièrement dématérialisée, depuis n'importe quel appareil disposant d'une connexion Internet.

La plateforme intègre des modules d'intelligence artificielle à plusieurs niveaux : transcription vocale pour les citoyens illettrés, questionnaire adaptatif pour compléter les déclarations incomplètes, et génération automatique de documents officiels (attestation de dépôt, procès-verbal).

Elle s'adresse à deux catégories d'utilisateurs : les citoyens souhaitant porter plainte, et les agents de police (enquêteurs, commissaires) chargés du traitement des dossiers.

### 1.2 Contexte et domaine d'application

Ce projet s'inscrit à l'intersection de la **sécurité publique** et de la **transformation numérique** de l'administration camerounaise. Il couvre l'intégralité du cycle de vie d'une plainte : dépôt, réception officielle, affectation, instruction, suivi et clôture.

### 1.3 Objectif global du document

Ce cahier des charges définit les exigences fonctionnelles et non fonctionnelles, l'architecture technique, les choix technologiques, la modélisation UML et des données, le planning de réalisation et les livrables attendus.

---

## 2. Contexte et problématique

### 2.1 Présentation de l'environnement

Au Cameroun, le dépôt de plainte est aujourd'hui un processus exclusivement physique et manuel. Le citoyen doit obligatoirement se déplacer dans un commissariat, souvent sans savoir lequel est territorialement compétent pour son affaire. Les commissariats fonctionnent dans un environnement de ressources contraintes, avec une absence quasi totale d'outils numériques.

Facteurs aggravants :
- **Analphabétisme** : une part non négligeable de la population, notamment rurale, ne sait ni lire ni écrire
- **Inégalités géographiques** : les commissariats sont concentrés en zones urbaines ; les habitants ruraux parcourent parfois plusieurs dizaines de kilomètres
- **Absence de suivi** : le plaignant ne dispose d'aucun moyen de connaître l'état de son dossier sans se déplacer
- **Charge administrative** : la rédaction manuelle des PV d'audition mobilise un temps considérable des enquêteurs

### 2.2 Description du processus actuel

*Source : Entretien avec un agent de police en service — Commissariat, Mai 2026*

**Contenu obligatoire d'une plainte** : date de dépôt, nom et adresse du plaignant, objet de la plainte, identité du mis en cause, destination (commissaire divisionnaire ou procureur).

**Déroulement :**
1. **Réception** : enregistrement dans un registre papier, attribution d'un numéro, délivrance d'une attestation de dépôt
2. **Affectation** : cotation à un enquêteur via parafeur, selon décision informelle du chef d'unité
3. **Audition du plaignant** : retranscription manuelle des déclarations dans un PV normalisé, signé page par page
4. **Convocation du mis en cause** : minimum trois tentatives ; à défaut, transmission au procureur
5. **Remise de convocation** : généralement effectuée par le plaignant lui-même, l'exposant à des représailles
6. **Clôture** : transmission au procureur ou classement sans suite

### 2.3 Problèmes et limites identifiés

| # | Difficulté | Impact |
|---|---|---|
| 1 | Plaignant illettré, doit être assisté | Dépendance à un tiers, risque de déformation des faits |
| 2 | Déclaration incohérente ou incomplète | PV de mauvaise qualité, dossier fragilisé |
| 3 | Mis en cause refuse d'être auditionné | Blocage de procédure, allongement des délais |
| 4 | Mis en cause refuse de signer le PV | Contentieux procédural, vice de forme possible |
| 5 | Rédaction manuelle des PV | Charge chronophage, erreurs de retranscription |
| 6 | Aucun suivi automatique pour le plaignant | Méfiance, déplacements répétés inutiles |
| 7 | Convocation remise par le plaignant | Risque de confrontation et représailles |

### 2.4 Motivation du projet

**Accessibilité universelle** : permettre à tout citoyen — illettré, éloigné, exposé à des risques — de déposer une plainte à distance depuis un smartphone, par saisie vocale.

**Efficacité opérationnelle** : automatiser la rédaction des PV et l'affectation des dossiers pour libérer les enquêteurs des tâches administratives de faible valeur ajoutée.

**Confiance institutionnelle** : un suivi en temps réel avec notifications SMS démontre que la plainte est prise en charge, renforçant la légitimité des services de police.

---

## 3. Étude et revue de l'existant

### 3.1 Solutions existantes analysées

| Solution | Pays | Description succincte |
|---|---|---|
| **THESEE** | France | Signalement en ligne de cybercriminalité, intégré aux systèmes policiers nationaux |
| **eCitizen** | Kenya | Portail multicanal (web, mobile, USSD) centralisant 200+ services publics |
| **iReport** | Nigeria | App mobile de signalement géolocalisé d'incidents |
| **Police.uk** | Royaume-Uni | Signalement en ligne avec suivi par email, statistiques criminelles par zone |
| **e-FIR** | Inde | Dépôt électronique officiel d'un First Information Report (valeur légale) |

### 3.2 Tableau comparatif

| Critère | THESEE | eCitizen | iReport | Police.uk | e-FIR | **Notre solution** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Saisie vocale pour illettrés | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Assistance IA (NLP, questionnaire) | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Suivi en temps réel | ✓ | Partiel | ✗ | ✓ | ✗ | **✓** |
| Notifications SMS | ✗ | ✓ | ✓ | ✗ | ✗ | **✓** |
| Routage automatique | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Génération automatique de PV | ✗ | ✗ | ✗ | ✗ | Partiel | **✓** |
| Back-office enquêteurs | Partiel | ✗ | ✗ | ✓ | Partiel | **✓** |
| Adapté au contexte camerounais | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| En français | ✓ | ✗ | ✗ | ✗ | ✗ | **✓** |

### 3.3 Limites des solutions existantes

Aucune solution existante ne prend en charge la saisie vocale pour illettrés, n'est adaptée au cadre juridique camerounais, ne génère automatiquement des PV, ni ne guide le citoyen vers le commissariat compétent. Toutes sont conçues pour des systèmes policiers et des législations étrangers, ce qui les rend non transposables sans une refonte aussi coûteuse qu'un développement natif.

### 3.4 Justification de la solution développée

La plateforme proposée est la seule à répondre simultanément à l'ensemble des problèmes identifiés sur le terrain : accessibilité vocale, assistance IA, routage géographique, génération automatique de documents, et back-office complet — le tout en français et conforme aux procédures légales camerounaises.

---

## 4. Objectifs du projet

### 4.1 Objectif général

Concevoir et déployer une plateforme numérique inclusive permettant à tout citoyen camerounais de déposer une plainte à distance, tout en dotant les commissariats d'outils numériques modernes pour traiter ces plaintes de manière structurée, traçable et efficace.

### 4.2 Objectifs spécifiques

| # | Objectif | Dysfonctionnement adressé |
|---|---|---|
| OS1 | Dépôt de plainte à distance, texte et vocal | Déplacement obligatoire, exclusion des illettrés |
| OS2 | Assistance intelligente (questionnaire adaptatif IA) | Déclarations incomplètes ou incohérentes |
| OS3 | Routage automatique vers le commissariat compétent | Méconnaissance des règles de compétence territoriale |
| OS4 | Génération automatique des documents officiels (attestation, PV) | Rédaction manuelle chronophage |
| OS5 | Suivi en temps réel du dossier avec notifications SMS | Opacité totale du processus pour le plaignant |
| OS6 | Back-office complet pour les agents de police | Gestion papier, absence de traçabilité |
| OS7 | Affectation rationnelle des dossiers | Affectation informelle, charge inégale entre enquêteurs |
| OS8 | Convocation numérique sécurisée du mis en cause | Risque de représailles lors de la remise physique |

---

## 5. Périmètre du projet

### 5.1 Ce qui est inclus

- Application web responsive (citoyen + back-office police)
- Dépôt de plainte par saisie texte guidée et saisie vocale (STT)
- Questionnaire de pré-audition adaptatif (IA)
- Upload de pièces jointes (photos, vidéos, documents)
- Routage automatique vers le commissariat compétent
- Génération automatique de l'attestation de dépôt (PDF) et du brouillon de PV
- Tableau de bord et gestion complète des dossiers (enquêteurs, commissaire)
- Affectation manuelle et assistée des dossiers
- Émission de convocations numériques
- Suivi en temps réel avec notifications SMS et email
- Journalisation complète des actions (audit log)
- Gestion des rôles et des droits d'accès (RBAC)

### 5.2 Ce qui est exclu (hors périmètre v1)

- Transmission électronique officielle au procureur de la République (intégration judiciaire — phase 2)
- Gestion des gardes à vue et procédures post-enquête
- Accès hors ligne par USSD (zones sans Internet — phase 2)
- Support des langues nationales camerounaises (phase 2)
- Reconnaissance biométrique ou faciale
- Migration des archives papier antérieures à la mise en service

---

## 6. Identification des acteurs

### 6.1 Tableau des acteurs

| Acteur | Profil | Niveau d'accès |
|---|---|---|
| **Citoyen / Plaignant** | Toute personne souhaitant déposer une plainte | Ses propres dossiers uniquement |
| **Enquêteur** | Agent de police en charge de l'instruction | Dossiers qui lui sont affectés |
| **Commissaire** | Officier responsable d'un commissariat | Tous les dossiers de son commissariat |

### 6.2 Rôles et responsabilités

**Citoyen** : créer un compte (vérification OTP SMS), déposer une plainte, répondre au questionnaire IA, joindre des preuves, suivre son dossier, télécharger l'attestation.

**Enquêteur** : consulter ses dossiers affectés, accéder au détail complet, réviser et signer électroniquement le PV, émettre des convocations, mettre à jour les statuts.

**Commissaire** : superviser la file d'attente des nouvelles plaintes, affecter les dossiers aux enquêteurs, consulter le tableau de bord statistique, valider la transmission au procureur, gérer les comptes agents de son commissariat.

---

## 7. Besoins fonctionnels

### 7.1 Module authentification

- **Inscription citoyen** : formulaire en 2 étapes (informations personnelles + vérification OTP SMS). Le compte est activé uniquement après saisie du code.
- **Connexion citoyen** : par numéro de téléphone + mot de passe, ou par OTP SMS (sans mot de passe).
- **Connexion agent** : par identifiant institutionnel + mot de passe, avec 2FA obligatoire (OTP SMS).
- **Réinitialisation** : lien valable 15 minutes envoyé par SMS ou email.
- **Gestion des sessions** : expiration après 30 min d'inactivité (citoyen) ou 8h (agents).

### 7.2 Module dépôt de plainte

**Saisie textuelle guidée** (7 étapes séquentielles) :
1. Nature de l'infraction (liste + description libre)
2. Date et lieu des faits (avec option carte)
3. Description des faits (zone libre)
4. Identité du mis en cause (ou case "inconnu")
5. Préjudice subi
6. Pièces jointes (JPG, PNG, PDF, MP4 — 20 Mo max/fichier)
7. Récapitulatif et soumission

**Saisie vocale** : enregistrement audio avec transcription en temps réel, correction manuelle possible, audio original conservé comme preuve.

**À la soumission** : attribution d'un numéro de dossier unique, routage vers le commissariat compétent, génération de l'attestation PDF, envoi SMS + email au plaignant.

### 7.3 Module intelligence artificielle

- **STT** : transcription audio français → texte, précision cible ≥ 85 %
- **NLP** : extraction des entités (personnes, lieux, dates, objets, montants), qualification du type d'infraction, calcul d'un score de complétude (0–100)
- **Questionnaire adaptatif** : génération de questions ciblées pour combler les informations manquantes, selon le type d'infraction détecté
- **Routage géographique** : identification du commissariat compétent à partir du lieu des faits / domicile du mis en cause
- **Génération de PV** : injection des données dans le template institutionnel camerounais, export PDF

### 7.4 Module gestion des dossiers (enquêteur)

- Tableau de bord trié par urgence : numéro, nature, statut, score de complétude
- Consultation du dossier complet en onglets : déclaration, entités IA, PV éditable, pièces jointes, historique
- Révision et signature électronique horodatée du PV (toutes modifications tracées)
- Mise à jour des statuts : `REÇU → EN_INSTRUCTION → AUDITION → DÉCISION → TRANSMIS/CLOS`
- Émission de convocations numériques (pré-remplies, envoyées par SMS, accusé de réception enregistré)
- Transfert de dossier à un collègue (avec validation du commissaire)

### 7.5 Module back-office commissariat

- File d'attente en temps réel des plaintes non affectées (alerte si > 48h sans affectation)
- Affectation des dossiers avec visualisation de la charge de chaque enquêteur
- Suggestion automatique de l'enquêteur le plus approprié (type d'infraction / compétences)
- Tableau de bord statistique : volumes, délais moyens, répartition par type, charge par enquêteur
- Gestion des comptes agents (création, désactivation, attribution des spécialités)

### 7.6 Module suivi et notifications

- **Espace citoyen** : frise chronologique du dossier avec horodatage de chaque étape
- **SMS automatiques** : envoyés à chaque changement de statut significatif, rédigés en français accessible
- **Email** : récapitulatif plus détaillé avec lien direct vers le dossier
- **Audit log immuable** : toutes les actions enregistrées (qui, quoi, quand, IP), conservées 5 ans minimum

---

## 8. Besoins non fonctionnels

### 8.1 Performance

| Indicateur | Cible |
|---|---|
| Temps de réponse API (95 % des requêtes) | < 2 secondes |
| Transcription STT (2 min d'audio) | < 10 secondes |
| Génération PDF | < 5 secondes |
| Utilisateurs simultanés sans dégradation | 500 minimum |
| Chargement initial sur 3G (1 Mbps) | < 5 secondes |

### 8.2 Sécurité

- HTTPS obligatoire avec TLS 1.3 ; redirection automatique depuis HTTP
- Données sensibles chiffrées en base (AES-256) et fichiers chiffrés au repos
- 2FA obligatoire pour tous les agents ; blocage après 5 tentatives échouées
- RBAC strict : chaque utilisateur n'accède qu'aux données de son périmètre
- Protection contre SQL injection, XSS, CSRF, force brute (rate limiting)
- Conformité à la législation camerounaise sur la protection des données personnelles

### 8.3 Disponibilité

- Disponibilité cible : **99,5 %** mensuel (≤ 3,6 h d'indisponibilité/mois)
- Sauvegardes complètes quotidiennes + incrémentielles toutes les 6 heures
- RTO < 4h, RPO < 6h en cas d'incident majeur
- Monitoring 24h/24 avec alertes automatiques

### 8.4 Accessibilité et ergonomie

- Interface 100 % en français, vocabulaire adapté au niveau collège
- Design responsive (mobile dès 320px, boutons tactiles ≥ 44×44px)
- Saisie vocale fonctionnelle sur Android 8+ et iOS 14+, sans installation d'app tierce
- Compatibilité Chrome, Firefox, Edge, Safari récents
- Conformité WCAG 2.1 niveau AA

### 8.5 Maintenabilité

- Code source versionné sur Git (stratégie main / develop / feature/*)
- Architecture en modules faiblement couplés ; remplacement d'un composant sans impact global
- Couverture de tests automatisés ≥ 70 % du code métier
- Pipeline CI/CD (GitHub Actions) : tests → build → déploiement staging automatique
- Documentation technique maintenue en parallèle du code

---

## 9. Maquettes des principales fonctionnalités

### 9.1 Inscription et connexion (citoyen)

Formulaire en 2 étapes : informations personnelles puis sécurisation (mot de passe + OTP SMS). La page de connexion propose deux onglets distincts : connexion par mot de passe et connexion par code SMS. Un indicateur de progression guide l'utilisateur à chaque étape.

### 9.2 Dépôt de plainte

Écran de choix initial entre saisie texte et saisie vocale. En mode texte : barre de progression, un seul sujet par écran, exemples de rédaction en grisé. En mode vocal : bouton d'enregistrement central, animation de niveau sonore, transcription temps réel dans un volet inférieur, zone d'édition de la transcription avant validation.

### 9.3 Questionnaire IA (pré-audition)

Interface de type messagerie : questions de l'IA en bulles grises, réponses du plaignant en bulles bleues. Boutons de réponse rapide (Oui / Non / Je ne sais pas), listes déroulantes pour les choix multiples, zone de saisie libre avec option microphone. Jauge de complétude en haut de l'écran (rouge < 50 %, orange 50–80 %, vert > 80 %).

### 9.4 Suivi du dossier (citoyen)

Page "Mes dossiers" : liste des plaintes avec badge de statut coloré. Vue détail : frise chronologique verticale avec horodatage des étapes franchies (coche verte), étape en cours (pulsation), étapes futures (grisées). Accès au téléchargement de l'attestation PDF et à l'historique des SMS reçus.

### 9.5 Tableau de bord back-office (commissaire)

En-tête avec 4 KPIs du jour (plaintes non affectées, en cours, en attente d'audition, traitées ce mois). Tableau des plaintes à affecter avec panneau latéral de sélection d'enquêteur affichant leur charge actuelle. Deux graphiques : histogramme journalier des plaintes reçues et camembert par type d'infraction.

### 9.6 Gestion des dossiers (enquêteur)

Bandeau de filtres (statut, type, période). Liste des dossiers en cards avec indicateur d'urgence. Vue détail en onglets : Déclaration (entités surlignées par couleur), Procès-Verbal (éditeur riche avec sections pré-remplies, bouton "Signer"), Pièces jointes, Historique. Barre d'actions fixe en bas : mettre à jour le statut, émettre une convocation, transférer, ajouter une note.

---

## 10. Architecture des fonctionnalités

### 10.1 Architecture globale

```
┌──────────────────────────────────────────────────────────────┐
│                  COUCHE PRÉSENTATION (React.js)              │
│  ┌───────────────┐  ┌─────────────────────┐  ┌────────────┐  │
│  │ Espace Citoyen│  │ Espace Police        │  │ Espace     │  │
│  │ • Inscription │  │ (Enquêteur /         │  │ Admin      │  │
│  │ • Dépôt       │  │  Commissaire)        │  │            │  │
│  │ • Vocal / IA  │  │ • Tableau de bord    │  │ • Comptes  │  │
│  │ • Suivi       │  │ • Dossiers / PV      │  │ • Routage  │  │
│  └───────┬───────┘  │ • Convocations       │  │ • Logs     │  │
│          │          └──────────┬────────────┘  └─────┬──────┘  │
└──────────┼────────────────────┼───────────────────────┼────────┘
           │       HTTPS / REST │                       │
           ▼                    ▼                       ▼
┌──────────────────────────────────────────────────────────────┐
│              API GATEWAY — Spring Cloud Gateway               │
│         (routage, rate limiting, auth JWT, SSL termination)  │
└─────────────────────────────┬────────────────────────────────┘
                              │
              ┌───────────────┼───────────────────┐
              ▼               ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ API Backend     │  │ Microservices IA │  │ Service Notifs   │
│ Spring Boot 3   │  │ Python/FastAPI   │  │ SMS / Email      │
│ /auth           │  │ /stt            │  └──────────────────┘
│ /plaintes       │◄─│ /nlp            │
│ /dossiers       │  │ /routage        │
│ /documents      │  │ /generate-pv    │
│ /stats          │  └─────────────────┘
└────────┬────────┘
         │
    ┌────┼────────────┐
    ▼    ▼            ▼
┌──────┐ ┌──────┐ ┌──────┐
│ Post │ │Redis │ │MinIO │
│ greSQL│ │Cache │ │Files │
└──────┘ └──────┘ └──────┘
```

### 10.2 Flux de traitement principal (dépôt de plainte)

1. Citoyen enregistre sa déclaration vocale → API Gateway → Spring Boot → Service STT
2. Texte transcrit → Service NLP → entités extraites + score de complétude
3. Questions adaptatives générées → citoyen répond → dossier complété
4. Service Routage identifie le commissariat compétent
5. Spring Boot persiste la plainte en PostgreSQL, génère l'attestation PDF (MinIO)
6. Service Notifications publie un événement → SMS envoyé au plaignant

---

## 11. Modélisation UML

### 11.1 Diagramme de cas d'utilisation

**Citoyen** : s'inscrire, se connecter, déposer une plainte (texte/vocal), répondre au questionnaire IA, joindre des preuves, suivre son dossier, télécharger l'attestation.

**Enquêteur** : se connecter (2FA), consulter ses dossiers, réviser et signer le PV, émettre une convocation, mettre à jour les statuts, transférer un dossier.

**Commissaire** : superviser la file d'attente, affecter les dossiers, consulter les statistiques, valider la transmission au procureur, gérer les comptes agents, configurer les règles de routage.

**Relations notables** :
- "Déposer par vocal" *inclut* "Transcrire (STT)"
- "Déposer une plainte" *inclut* "Générer questionnaire IA" et "Router vers commissariat"
- "Valider le PV" *étend* "Consulter le dossier"

### 11.2 Diagramme de séquence — Dépôt de plainte vocal

```
Citoyen   React   Gateway   Spring Boot   STT   NLP   Routage   DB   SMS
  |         |         |          |          |     |       |      |     |
  |─enreg.─►|─audio──►|─────────►|─POST────►|     |       |      |     |
  |         |         |          |◄─texte───|     |       |      |     |
  |         |         |          |─POST NLP──────►|       |      |     |
  |         |         |          |◄─entités+score─|       |      |     |
  |◄─questions───────────────────|                |       |      |     |
  |─réponses►         |          |─POST routage──────────►|      |     |
  |         |         |          |◄─commissariat──────────|      |     |
  |         |         |          |─INSERT dossier────────────────►|     |
  |         |         |          |─génère PDF─────────────────────►|     |
  |         |         |          |─send SMS───────────────────────────►|
  |◄─SMS + confirmation──────────────────────────────────────────────|
```

### 11.3 Diagramme d'activités — Cycle de vie d'une plainte

```
[Dépôt citoyen] → [STT si vocal] → [NLP : entités + score]
    → [Score < 80% ?] → Oui → [Questionnaire adaptatif]
                      → Non →
    → [Validation récapitulatif] → [Soumission officielle]
    → [Routage commissariat] → [Génération attestation + SMS]
    → [Commissaire affecte] → [Enquêteur instruit]
    → [Auditions + révision PV] → [Signature électronique]
    → [Décision : transmission procureur OU classement sans suite]
    → [SMS clôture au citoyen] → [Archivage]
```

### 11.4 Diagramme de classes (principaux attributs)

```
Utilisateur                     Plainte
───────────                     ───────
id : UUID                       id : UUID
nom, prenom : String            numeroDossier : String
telephone : String [UNIQUE]     idPlaignant → Utilisateur
email : String                  dateDepot : DateTime
role : Enum                     modeDepot : Enum {TEXTE, VOCAL}
  {CITOYEN, ENQUETEUR,          natureInfraction : String
   COMMISSAIRE, ADMIN}          description : Text
cni : String                    lieuFaits : String
idCommissariat → Commissariat   scoreCompletude : Decimal
actif : Boolean                 entitesExtraites : JSON
                                statut : Enum
                                idCommissariatCible → Commissariat

Dossier                         ProcesVerbal
───────                         ────────────
id : UUID                       id : UUID
idPlainte → Plainte [1:1]       idDossier → Dossier [1:1]
idEnqueteur → Utilisateur       contenuGenereIA : Text
idCommissariat → Commissariat   contenuFinal : Text
statut : Enum                   dateGeneration : DateTime
  {RECU, EN_INSTRUCTION,        idValidateur → Utilisateur
   AUDITION, DECISION,          signatureElectronique : Blob
   TRANSMIS, CLOS}              dateSignature : DateTime
priorite : Enum
dateAffectation : DateTime      Convocation
                                ───────────
Commissariat                    id : UUID
────────────                    idDossier → Dossier
id : UUID                       destinataireNom : String
nom : String                    dateConvocation : DateTime
ville : String                  numeroOrdre : Integer
zonesCompetence : String[]      statut : Enum {EMISE, REMISE, IGNOREE}
```

---

## 12. Modélisation des données

### 12.1 Dictionnaire de données (tables principales)

**Table : profils** (utilisateurs Supabase Auth)

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant unique |
| nom, prenom | VARCHAR(100) | NOT NULL | État civil |
| telephone | VARCHAR(20) | UNIQUE NOT NULL | Identifiant principal |
| email | VARCHAR(150) | UNIQUE | Optionnel (citoyens) |
| role | ENUM | NOT NULL | CITOYEN / ENQUETEUR / COMMISSAIRE / ADMIN |
| id_commissariat | UUID | FK | Pour les agents |
| specialites | TEXT[] | — | Types d'infractions (agents) |
| actif | BOOLEAN | DEFAULT true | Compte actif |

**Table : plaintes**

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant |
| numero_dossier | VARCHAR(20) | UNIQUE NOT NULL | Format 2026-NNNNN |
| id_plaignant | UUID | FK profils | Citoyen déposant |
| mode_depot | ENUM | NOT NULL | TEXTE / VOCAL |
| nature_infraction | VARCHAR(150) | NOT NULL | Qualifié par l'IA |
| description | TEXT | NOT NULL | Déclaration complète |
| audio_url | VARCHAR | — | URL MinIO si vocal |
| lieu_faits | VARCHAR | NOT NULL | Adresse textuelle |
| score_completude | DECIMAL(5,2) | NOT NULL | Score IA 0–100 |
| entites_extraites | JSONB | — | Entités NLP |
| statut | ENUM | DEFAULT 'SOUMISE' | Cycle de vie |
| id_commissariat_cible | UUID | FK | Après routage |

**Table : dossiers**

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant |
| id_plainte | UUID | FK UNIQUE | Relation 1:1 |
| id_enqueteur | UUID | FK | Enquêteur affecté |
| id_commissariat | UUID | FK | Commissariat traitant |
| statut | ENUM | NOT NULL | Avancement |
| priorite | ENUM | DEFAULT 'NORMALE' | NORMALE / HAUTE / URGENTE |
| date_affectation | TIMESTAMPTZ | — | Date d'affectation |
| date_cloture | TIMESTAMPTZ | — | Date de clôture |

**Table : proces_verbaux**

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| id_dossier | UUID FK UNIQUE | Relation 1:1 avec dossier |
| contenu_genere_ia | TEXT | PV original généré |
| contenu_final | TEXT | Après révision enquêteur |
| date_signature | TIMESTAMPTZ | Horodatage signature |
| signature_electronique | BYTEA | Signature sérialisée |

**Table : convocations**

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| id_dossier | UUID FK | Dossier associé |
| destinataire_nom | VARCHAR | Personne convoquée |
| date_convocation | DATE | Date de comparution |
| numero_ordre | INTEGER | 1ère, 2ème, 3ème tentative |
| statut | ENUM | EMISE / REMISE / REFUSEE / IGNOREE |
| token_acces | VARCHAR UNIQUE | Lien sécurisé d'accès |

**Table : notifications**

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| id_utilisateur | UUID FK | Destinataire |
| canal | ENUM | SMS / EMAIL / IN_APP |
| message | TEXT | Contenu envoyé |
| statut_livraison | ENUM | EN_ATTENTE / ENVOYE / LIVRE / ECHEC |

**Table : audit_logs**

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| id_utilisateur | UUID FK | Auteur de l'action |
| action | VARCHAR | Description de l'action |
| entite_type | VARCHAR | Type concerné (Dossier, PV…) |
| entite_id | UUID | ID de l'entité |
| donnees_avant / apres | JSONB | État avant/après modification |
| adresse_ip | VARCHAR | IP de l'auteur |

### 12.2 Relations principales

- `Utilisateur` (1) ──< (N) `Plainte`
- `Plainte` (1) ──── (1) `Dossier`
- `Dossier` (1) ──── (1) `ProcesVerbal`
- `Dossier` (1) ──< (N) `Convocation`
- `Commissariat` (1) ──< (N) `Dossier`
- `Commissariat` (1) ──< (N) `Utilisateur`

---

## 13. Architecture technique

### 13.1 Architecture distribuée

La plateforme repose sur une **architecture distribuée à 3 tiers** avec des microservices IA indépendants.

**Tier 1 — Frontend**
SPA React.js servie par Nginx. Communique uniquement avec l'API Gateway via REST/HTTPS.

**Tier 2 — Backend distribué**
- **Spring Cloud Gateway** : point d'entrée unique, authentification JWT, rate limiting, routage vers les services
- **Spring Boot 3 (Java 21)** : API REST principale, logique métier, orchestration des appels aux microservices IA
- **Microservices IA (Python / FastAPI)** : services indépendants déployés séparément (STT, NLP, routage, génération PV)

**Tier 3 — Données**
- **PostgreSQL 16** : données métier structurées, avec Spring Data JPA / Hibernate
- **Redis** : cache de sessions, file de messages asynchrone pour les notifications
- **MinIO** : stockage objet (audio, PDF, pièces jointes)

### 13.2 Architecture des microservices IA

| Service | Technologie | Rôle |
|---|---|---|
| STT | Python + Whisper large-v3 | Audio → texte français (exécution locale, sans API cloud) |
| NLP | Python + SpaCy + CamemBERT | Extraction d'entités, qualification, score de complétude |
| Routage | Python + PostGIS | Identification du commissariat compétent par géolocalisation |
| Génération PV | Python + python-docx + LibreOffice | Template DOCX → PDF institutionnel |

Chaque microservice expose une API REST indépendante. Le Spring Boot les orchestre en appelant les endpoints correspondants.

### 13.3 Sécurité de l'architecture

- **JWT** : tokens émis par Spring Security, validés par l'API Gateway à chaque requête
- **RLS PostgreSQL** : règles de sécurité au niveau ligne pour isoler les données par rôle
- **TLS 1.3** : chiffrement de bout en bout sur toutes les communications
- **RBAC** : chaque rôle n'accède qu'à ses ressources autorisées

---

## 14. Technologies utilisées

### 14.1 Tableau des technologies

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | **React.js 18** | SPA responsive, interface citoyen et back-office |
| State management | Zustand | Gestion de l'état global côté client |
| API Gateway | **Spring Cloud Gateway** | Point d'entrée unique, sécurité, routage |
| Backend API | **Spring Boot 3 (Java 21)** | API REST, logique métier, orchestration |
| ORM | Spring Data JPA / Hibernate | Accès base de données typé |
| Sécurité | Spring Security + JWT | Authentification, autorisation RBAC |
| Microservices IA | **Python 3.11 + FastAPI** | Services STT, NLP, routage, génération PV |
| STT | **OpenAI Whisper large-v3** | Transcription vocale français (local, open source) |
| NLP | **SpaCy + CamemBERT** | Extraction d'entités, classification d'infractions |
| Base de données | **PostgreSQL 16** | Stockage relationnel principal, JSONB, PostGIS |
| Cache / queues | **Redis 7** | Sessions, file de messages notifications |
| Stockage fichiers | **MinIO** | Stockage objet S3-compatible (audio, PDF, pièces jointes) |
| Génération PDF | LibreOffice Headless + python-docx | DOCX → PDF pour documents officiels |
| Notifications SMS | Twilio / Orange API CM | SMS aux citoyens et mis en cause |
| Notifications email | Spring Mail | Emails transactionnels |
| Reverse proxy | **Nginx** | Compression, cache statique, headers sécurité |
| Conteneurisation | **Docker + Docker Compose** | Isolation des services, déploiement reproductible |
| CI/CD | GitHub Actions | Tests → build → déploiement staging automatique |
| Tests backend | JUnit 5 + Mockito | Tests unitaires et d'intégration Spring Boot |
| Tests IA | Pytest | Tests microservices Python |
| Monitoring | Prometheus + Grafana | Métriques système et applicatives |
| Logs | Loki + Grafana | Centralisation et visualisation des logs |

### 14.2 Justification des choix principaux

**Spring Boot** : framework Java mature et robuste, idéal pour les API REST d'entreprise nécessitant une sécurité rigoureuse. Spring Security offre une gestion native des rôles (RBAC), de l'authentification JWT et de la protection contre les vulnérabilités communes. L'écosystème Spring Cloud facilite la mise en place de l'architecture distribuée (Gateway, Config Server, etc.).

**React.js** : bibliothèque frontend la plus adoptée, composants réutilisables, Virtual DOM performant sur appareils mobiles d'entrée de gamme, large communauté. Partage de code possible avec React Native pour la future version mobile.

**Microservices Python pour l'IA** : Python est l'écosystème de référence pour le machine learning. Séparer les services IA du backend Spring Boot permet de les mettre à jour ou remplacer indépendamment, et de les scaler séparément selon la charge de traitement.

**OpenAI Whisper** : meilleure précision en open source pour le français (WER < 5 % sur audio de qualité), exécution entièrement locale — confidentialité des données audio garantie, pas de coût variable d'API cloud.

**PostgreSQL** : SGBD le plus avancé en open source, ACID, JSONB pour les entités NLP, PostGIS pour le routage géographique. Support commercial disponible si nécessaire.

**Architecture distribuée** : séparation claire des responsabilités, déploiement et mise à l'échelle indépendants de chaque composant, résilience accrue (panne d'un microservice n'affecte pas les autres).

---

## 15. Planning du projet

### 15.1 Phases

| Phase | Intitulé | Durée | Période |
|---|---|---|---|
| 1 | Analyse des besoins et cahier des charges | 2 semaines | S1–S2 |
| 2 | Conception (UML, maquettes, architecture) | 2 semaines | S3–S4 |
| 3 | Développement backend Spring Boot + API | 4 semaines | S5–S8 |
| 4 | Développement microservices IA (Python) | 3 semaines | S6–S8 |
| 5 | Développement frontend React.js | 3 semaines | S9–S11 |
| 6 | Intégration, tests fonctionnels et de charge | 2 semaines | S12–S13 |
| 7 | Déploiement, recette et documentation finale | 1 semaine | S14 |

Les phases 3 et 4 sont partiellement parallèles à partir de la semaine 6.

### 15.2 Diagramme de Gantt

```
                    S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12 S13 S14
────────────────────────────────────────────────────────────────────────────
Phase 1 — Analyse   ██  ██
Phase 2 — Conception          ██  ██
Phase 3 — Backend                     ██  ██  ██  ██
Phase 4 — IA                              ██  ██  ██
Phase 5 — Frontend                                    ██  ██  ██
Phase 6 — Tests                                                   ██  ██
Phase 7 — Déploiement                                                     ██
────────────────────────────────────────────────────────────────────────────
Jalons :
  ▲ S2  : Cahier des charges validé
  ▲ S4  : Conception et maquettes validées
  ▲ S8  : Backend + IA intégrés, tests unitaires OK
  ▲ S11 : Frontend intégré à l'API, parcours utilisateurs fonctionnels
  ▲ S13 : Tests terminés, anomalies corrigées
  ▲ S14 : Déploiement final, recette validée
```

---

## 16. Livrables

| # | Livrable | Format | Échéance | Critère d'acceptation |
|---|---|---|---|---|
| L1 | Cahier des charges | PDF | Fin S2 | Validé par toutes les parties prenantes |
| L2 | Maquettes des interfaces | Figma + PDF | Fin S4 | Validation par un utilisateur test non technique |
| L3 | Diagrammes UML | PNG + PlantUML | Fin S4 | Cohérence avec le cahier des charges |
| L4 | Schéma de base de données | SQL + PNG | Fin S4 | Exécutable sans erreur sur PostgreSQL 16 |
| L5 | Code source Spring Boot (API REST) | Dépôt Git | Fin S8 | Couverture tests ≥ 70 %, tous les tests passent |
| L6 | Code source microservices IA (Python) | Dépôt Git | Fin S8 | STT ≥ 85 % précision, NLP qualification ≥ 80 % |
| L7 | Code source frontend React.js | Dépôt Git | Fin S11 | Parcours utilisateurs fonctionnels, responsive validé |
| L8 | Documentation API (Swagger / OpenAPI) | Swagger UI | Fin S11 | Couverture 100 % des endpoints |
| L9 | Rapport de tests | PDF | Fin S13 | Tests de charge validés à 500 utilisateurs simultanés |
| L10 | Application déployée | URL | Fin S14 | Disponibilité ≥ 99,5 % la première semaine |
| L11 | Documentation technique | Markdown / PDF | Fin S14 | Déploiement réussi sur environnement vierge |
| L12 | Présentation de soutenance | PowerPoint / PDF | Soutenance | Démo fonctionnelle sur les scénarios principaux |

---

## 17. Conclusion

Ce cahier des charges définit les exigences fonctionnelles, techniques et organisationnelles de la plateforme PlainteCam, dont la conception repose sur une analyse terrain rigoureuse du processus de dépôt de plainte au Cameroun.

**Différenciation technologique** : la plateforme est la seule à combiner saisie vocale (STT Whisper), assistance IA adaptive (NLP CamemBERT), génération automatique de PV institutionnel, et routage géographique intelligent — répondant directement aux dysfonctionnements documentés sur le terrain.

**Architecture adaptée** : le choix d'une architecture distribuée Spring Boot + React + microservices Python garantit la séparation des responsabilités, la scalabilité indépendante de chaque composant, et la robustesse nécessaire à un service public critique.

**Périmètre maîtrisé** : la version 1 est délibérément cadrée pour une livraison en 14 semaines. Les fonctionnalités exclues (USSD, multilinguisme, intégration judiciaire) sont planifiées en phase 2 selon les retours utilisateurs.

La mise en service de PlainteCam est susceptible de produire des effets mesurables : réduction des barrières d'accès à la justice pour les citoyens, gain de temps administratif significatif pour les enquêteurs, et renforcement de la confiance dans les institutions de sécurité par la transparence du suivi des dossiers.
