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

La plateforme assiste l'usager et l'enquêteur à trois endroits précis : **transcription vocale** de la déclaration puis de la déposition, **questionnaire d'approfondissement** qui réclame les éléments manquants selon la nature de l'infraction, et **génération des documents officiels** (attestation de dépôt, procès-verbal, convocation) à partir des données déjà saisies.

Elle s'adresse à deux catégories d'utilisateurs : les citoyens souhaitant porter plainte, et les agents de police (enquêteurs, commissaires) chargés du traitement des dossiers.

### 1.2 Contexte et domaine d'application

Ce projet s'inscrit à l'intersection de la **sécurité publique** et de la **transformation numérique** de l'administration camerounaise. Il couvre l'intégralité du cycle de vie d'une plainte : dépôt, réception officielle, affectation, instruction, suivi et clôture.

### 1.3 Objectif global du document

Ce cahier des charges définit les exigences fonctionnelles et non fonctionnelles, l'architecture technique, les choix technologiques, la modélisation UML et des données, le planning de réalisation et les livrables attendus. Il décrit une **architecture distribuée** reposant sur une interface **React.js**, trois services applicatifs **Flask**, une base **PostgreSQL** et un stockage objet **MinIO**, l'ensemble étant **conteneurisé avec Docker** et orchestré par Docker Compose.

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

**Efficacité opérationnelle** : produire les documents de procédure à partir des données déjà saisies et structurer l'affectation des dossiers, pour libérer les enquêteurs des tâches de recopie.

**Confiance institutionnelle** : un suivi consultable en permanence, assorti de notifications par SMS et courrier électronique, démontre que la plainte est prise en charge et renforce la légitimité des services de police.

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
| Transcription vocale de la déclaration | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Questionnaire d'approfondissement par type d'infraction | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Suivi étape par étape | ✓ | Partiel | ✗ | ✓ | ✗ | **✓** |
| Notifications SMS | ✗ | ✓ | ✓ | ✗ | ✗ | **✓** |
| Orientation territoriale automatique | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Génération automatique du procès-verbal | ✗ | ✗ | ✗ | ✗ | Partiel | **✓** |
| Back-office enquêteurs et commissaire | Partiel | ✗ | ✗ | ✓ | Partiel | **✓** |
| Adapté au contexte camerounais | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| En français | ✓ | ✗ | ✗ | ✗ | ✗ | **✓** |

### 3.3 Limites des solutions existantes

Aucune solution existante ne prend en charge la déclaration vocale pour les usagers illettrés, n'est adaptée au cadre juridique camerounais, ne produit les documents de procédure, ni ne guide le citoyen vers le commissariat compétent. Toutes sont conçues pour des systèmes policiers et des législations étrangers, ce qui les rend non transposables sans une refonte aussi coûteuse qu'un développement natif.

### 3.4 Justification de la solution développée

La plateforme proposée est la seule à répondre simultanément à l'ensemble des difficultés relevées sur le terrain (§2.3) : accessibilité vocale au dépôt comme à l'audition, approfondissement guidé de la déclaration, orientation territoriale, production automatique des documents, et back-office complet — le tout en français et calé sur l'enchaînement réel de la procédure camerounaise.

---

## 4. Objectifs du projet

### 4.1 Objectif général

Concevoir et déployer une plateforme numérique inclusive permettant à tout citoyen camerounais de déposer une plainte à distance, tout en dotant les commissariats d'outils numériques modernes pour traiter ces plaintes de manière structurée, traçable et efficace.

### 4.2 Objectifs spécifiques

| # | Objectif | Dysfonctionnement adressé |
|---|---|---|
| OS1 | Dépôt de plainte à distance, au clavier ou à la voix | Déplacement obligatoire, exclusion des illettrés |
| OS2 | Questionnaire d'approfondissement par nature d'infraction | Déclarations incomplètes ou incohérentes |
| OS3 | Orientation vers le commissariat territorialement compétent | Méconnaissance des règles de compétence |
| OS4 | Production des documents officiels (attestation, PV, convocation) | Rédaction manuelle chronophage |
| OS5 | Suivi du dossier étape par étape, avec notifications | Opacité totale du processus pour le plaignant |
| OS6 | Back-office complet pour les agents de police | Gestion papier, absence de traçabilité |
| OS7 | Affectation outillée des dossiers | Affectation informelle, charge inégale |
| OS8 | Convocation numérique vérifiable du mis en cause | Risque de représailles lors de la remise physique |
| OS9 | Transcription de la déposition à l'audition | Double travail : prise à la main puis ressaisie |

---

## 5. Périmètre du projet

### 5.1 Ce qui est inclus

- Application web responsive : espace citoyen, espace enquêteur, espace commissaire
- Dépôt de plainte par saisie guidée en 5 écrans, avec déclaration vocale
- Questionnaire d'approfondissement adapté à la nature de l'infraction
- Dépôt de pièces jointes (photos, vidéos, documents), conservées en stockage objet
- Sélection territoriale Région → Département → Arrondissement → Quartier et détermination du commissariat compétent
- Attestation de dépôt, procès-verbal et convocation, générés en PDF
- Convocation porteuse d'un QR code de vérification
- Suivi citoyen en frise, avec les échanges et pièces de chaque étape
- Progression du dossier en étapes et actes ordonnés, côté enquêteur
- Transcription et conservation de l'enregistrement sonore de la déposition
- Révision du procès-verbal avec conservation de chaque version, verrouillage à la signature
- Tableau de bord commissaire, affectation et transfert avec confirmation
- Statistiques et graphiques (dépôts, statuts, types, priorités, rendement)
- Gestion des comptes agents (création, activation/désactivation, dossiers rattachés)
- Journal d'audit filtrable par date, acteur et nature d'acte
- Notifications par SMS et courrier électronique
- Recherche, filtres et pagination sur l'ensemble des tableaux

### 5.2 Ce qui est exclu (hors périmètre v1)

- Transmission électronique officielle au procureur de la République (intégration judiciaire — phase 2)
- Gestion des gardes à vue et procédures post-enquête
- Accès hors ligne par USSD, pour les zones sans Internet (phase 2)
- Support des langues nationales camerounaises (phase 2)
- Reconnaissance biométrique ou faciale
- Migration des archives papier antérieures à la mise en service
- Application mobile native — l'interface web est responsive dès 320 px (phase 2)

---

## 6. Identification des acteurs

### 6.1 Tableau des acteurs

| Acteur | Profil | Niveau d'accès |
|---|---|---|
| **Citoyen / Plaignant** | Toute personne souhaitant déposer une plainte | Ses propres dossiers uniquement |
| **Enquêteur** | Agent de police en charge de l'instruction | Dossiers qui lui sont affectés |
| **Commissaire** | Officier responsable d'un commissariat | Tous les dossiers de son commissariat |
| **Agent d'accueil** | Enregistre au guichet les plaintes déposées sur place | Dépôt et consultation, sans instruction |
| **Administrateur** | Exploitation technique de la plateforme | Comptes, paramétrage, journaux |

### 6.2 Rôles et responsabilités

**Citoyen** : créer un compte, déposer une plainte au texte ou à la voix, répondre au questionnaire d'approfondissement, joindre des preuves, suivre l'avancement étape par étape, lire les messages de l'enquêteur et télécharger l'attestation.

**Enquêteur** : consulter ses dossiers affectés, dérouler la procédure acte par acte, dicter la déposition, réviser puis signer le procès-verbal, émettre des convocations, écrire au plaignant et clore le dossier.

**Commissaire** : superviser la file des plaintes non affectées, affecter et transférer les dossiers, consulter les tableaux de bord statistiques, ouvrir n'importe quel dossier en lecture, annuler une étape franchie à tort, gérer les comptes agents et consulter le journal d'audit.

---

## 7. Besoins fonctionnels

### 7.1 Module authentification

- **Inscription citoyen** : formulaire en 2 étapes — informations personnelles, puis coordonnées et identification (CNI), suivie de la vérification du compte
- **Connexion citoyen** : par code à usage unique à 6 chiffres, envoyé par courrier électronique ou par SMS, sans mot de passe à mémoriser
- **Connexion agent** : par matricule institutionnel et mot de passe, avec sélection du rôle d'accès
- **Second facteur pour les agents** : code à usage unique exigé en complément du mot de passe
- **Réinitialisation** : lien ou code valable 15 minutes, adressé au courriel institutionnel
- **Gestion des sessions** : jeton JWT de courte durée, renouvelé par jeton de rafraîchissement ; expiration après 30 min d'inactivité (citoyen) ou 8 h (agents)
- **Blocage** après 5 tentatives échouées consécutives

### 7.2 Module dépôt de plainte

**Saisie guidée en 5 écrans**, couvrant les sept rubriques exigées d'une plainte :

| Écran | Contenu |
|---|---|
| 1 — Nature de l'infraction | Type d'infraction, date des faits, localisation Région → Département → Arrondissement → Quartier, adresse précise |
| 2 — Votre déclaration | Récit des faits (au clavier **ou à la voix**), nature et montant du préjudice, pièces jointes |
| 3 — Identité du mis en cause | État civil, coordonnées, signalement, ou mention « inconnu » |
| 4 — Questions complémentaires | Questionnaire d'approfondissement propre au type d'infraction (§7.3) |
| 5 — Aperçu de votre déclaration | Récapitulatif intégral avant soumission |

**Déclaration vocale** : l'audio est capté puis transmis au service de transcription ; le texte revient dans un volet dédié, où il est relu et corrigé avant validation. **L'enregistrement original est conservé** en stockage objet et rattaché au dossier comme pièce.

**Brouillon** : une déclaration interrompue est conservée et proposée à la reprise, avec son ancienneté.

**À la soumission** : attribution d'un numéro de dossier au format `2026-NNNNN`, rattachement au commissariat compétent, génération de l'attestation de dépôt et notification du plaignant.

### 7.3 Module d'assistance intelligente

Les traitements d'assistance sont regroupés dans un service applicatif distinct (`service-ia`, §13.2), appelé par le service métier et remplaçable indépendamment de lui.

| Fonction | Réalisation | Cible de qualité |
|---|---|---|
| **Transcription de la parole** | Modèle Whisper large-v3 exécuté localement, en français. L'audio est archivé en stockage objet et reste consultable comme pièce du dossier | Précision ≥ 85 % sur audio de qualité courante |
| **Analyse de la déclaration** | Extraction des entités (personnes, lieux, dates, objets, montants) par spaCy et CamemBERT, qualification du type d'infraction, calcul d'un score de complétude de 0 à 100 | Qualification correcte ≥ 80 % |
| **Questionnaire d'approfondissement** | Banque de questions par type d'infraction (8 types couverts), complétée par les éléments détectés comme absents. Présentation en fil de discussion : réponses fermées, listes ou texte libre. Les réponses sont jointes au dossier et reprises dans le procès-verbal | — |
| **Orientation territoriale** | Arborescence administrative du Cameroun (régions, départements, arrondissements, quartiers) et requête spatiale PostGIS : le lieu des faits désigne le commissariat compétent | — |
| **Établissement des documents** | Le procès-verbal, l'attestation et la convocation sont composés à partir des données du dossier dans les formes institutionnelles, puis rendus en PDF | Génération < 5 s |

**Deux pourcentages distincts, à ne pas confondre.** L'application affiche deux indicateurs exprimés en pourcentage, qui ne mesurent pas la même chose, ne s'adressent pas aux mêmes personnes et ne se calculent pas de la même manière :

| | **Complétude de la déclaration** | **Avancement du dossier** |
|---|---|---|
| **Ce qui est mesuré** | La richesse du récit du plaignant : les éléments attendus pour le type d'infraction sont-ils présents (montant, témoins, identification du suspect, preuves…) | La progression dans la procédure : quelle part des étapes et des actes obligatoires a été accomplie |
| **Qui le voit** | **Le citoyen seul**, pendant la rédaction de sa déclaration | **Le commissaire seul**, dans son espace de supervision |
| **À quoi il sert** | Inciter le déclarant à préciser avant de soumettre : rouge en deçà de 50 %, orange de 50 à 80 %, vert au-delà | Superviser : repérer les dossiers qui n'avancent plus, comparer les charges, décider d'une relance ou d'un transfert |
| **Comment il est calculé** | Par le `service-ia` à partir de l'analyse du texte (§7.3) | **Dérivé des actes réellement enregistrés** : aucun agent ne le saisit, il ne peut donc pas être déclaré à tort |
| **Quand il évolue** | Au fil de la frappe, puis après chaque réponse au questionnaire | À chaque acte de procédure accompli |

Ce cloisonnement est délibéré. La complétude de la déclaration **n'est pas remontée comme note sur le dossier** dans les espaces professionnels : un chiffre synthétique accolé à une affaire orienterait le jugement de l'enquêteur sans qu'aucun de ses termes ne lui soit explicable. L'enquêteur voit à la place le détail des éléments manquants, qui est actionnable, et la frise de sa procédure, qui lui dit quoi faire ensuite. Le pourcentage d'avancement, lui, est un **instrument de supervision** : il n'a de sens que pour qui compare des dossiers entre eux, c'est-à-dire le commissaire.

### 7.4 Module gestion des dossiers (enquêteur)

- Tableau des dossiers affectés, avec recherche plein texte, filtres par statut et par priorité, et pagination
- **Procédure en étapes et actes ordonnés** : chaque étape n'est ouverte qu'une fois la précédente franchie, et chaque acte d'une étape ne se fait qu'après le précédent
- Ordre effectif du cycle de vie, conforme à la pratique relevée au commissariat — le plaignant est convoqué et auditionné **avant** l'ouverture de l'enquête :

  `RECU → AUDITION → EN_INSTRUCTION → DECISION → TRANSMIS | CLOTURE`

- **Transcription de la déposition** à l'audition, avec conservation de l'enregistrement sonore
- Révision du procès-verbal : chaque correction conserve l'état antérieur, son auteur et son horodatage ; la signature électronique horodatée verrouille définitivement le document
- Émission de convocations pré-remplies, numérotées par ordre de tentative (jusqu'à trois), porteuses d'un QR code de vérification, acheminées par SMS avec accusé
- Commentaire possible sur chaque acte, qu'il soit fait, en cours ou en attente ; les écrits restent affichés dans le détail de l'acte
- Transfert du dossier à un collègue, soumis à la validation du commissaire
- Clôture proposée en tête de dossier, et **conditionnée au franchissement de toutes les étapes**

### 7.5 Module back-office commissariat

- File des plaintes non affectées, avec ancienneté d'attente signalée et alerte au-delà de 48 h
- **Affectation** et **transfert** : l'enquêteur se choisit d'abord dans une liste indiquant sa charge courante, puis l'opération demande une confirmation explicite. Aucun enquêteur n'est imposé par défaut
- L'enquêteur détenant déjà le dossier reste visible dans la liste de transfert, mais non sélectionnable, et la raison en est donnée
- **Consultation de n'importe quel dossier** dans la même vue que l'enquêteur, en lecture seule — à une exception près : le commissaire peut **annuler une étape franchie à tort**
- **Taux d'avancement du dossier**, exprimé en pourcentage, affiché en colonne des tableaux et en moyenne parmi les indicateurs du tableau de bord. Il est **calculé à partir des actes de procédure enregistrés**, non saisi par un agent, et **n'est visible que du commissaire** : ni le citoyen ni l'enquêteur n'y ont accès (§7.3)
- Repérage des dossiers qui n'avancent plus : un faible taux d'avancement conjugué à une forte ancienneté désigne les affaires à relancer ou à transférer
- Tableau de bord statistique : volumes, délais moyens, répartition par statut, par type et par priorité, rendement par enquêteur. Le détail par plainte s'ouvre au clic sur un enquêteur
- Les indicateurs de la « Vue d'ensemble » et ceux des « Statistiques » ne se recouvrent pas
- **Gestion des comptes agents** : création, modification, activation et désactivation avec motif, attribution des spécialités, consultation des dossiers rattachés à un agent
- Suggestion de l'enquêteur le plus approprié selon ses spécialités et sa charge
- Recherche, filtres et pagination sur les trois tableaux (file d'attente, tous les dossiers, charge détaillée)

### 7.6 Module suivi et notifications

- **Espace citoyen** : frise chronologique du dossier, chaque étape dépliable sur les actes qui la composent, les messages de l'enquêteur et les pièces jointes
- **SMS automatiques** à chaque changement d'étape significatif, rédigés en français accessible
- **Courrier électronique** : accusé de dépôt avec le numéro de dossier et l'attestation, puis avis détaillés avec lien direct vers le dossier
- **File d'attente durable** : chaque notification est inscrite en base avec son état d'acheminement, puis prise en charge par le service de notification, qui la rejoue en cas d'échec de la passerelle opérateur
- **Journal d'audit** : chaque acte de procédure est enregistré avec son auteur, sa nature, son horodatage, l'adresse IP et le dossier concerné. Le journal se filtre par période, par acteur et par nature d'acte, et se parcourt page par page. Le numéro de dossier y est cliquable et ouvre le dossier
- Rétention réglementaire du journal : cinq ans minimum

---

## 8. Besoins non fonctionnels

### 8.1 Performance

| Indicateur | Cible |
|---|---|
| Temps de réponse des API (95 % des requêtes) | < 2 s |
| Transcription d'un audio de 2 minutes | < 10 s |
| Génération d'un document PDF | < 5 s |
| Affichage d'un écran après interaction locale | < 200 ms |
| Chargement initial d'un espace sur 3G (1 Mbps) | < 5 s |
| Utilisateurs simultanés sans dégradation | 500 minimum |

La montée en charge s'obtient en dupliquant les services concernés : le `service-ia`, coûteux en calcul, se dimensionne indépendamment du service métier (§13.1).

### 8.2 Sécurité

- HTTPS obligatoire avec TLS 1.3, redirection automatique depuis HTTP
- Mots de passe hachés en argon2 ; aucun mot de passe stocké en clair ni journalisé
- Second facteur obligatoire pour tous les agents ; blocage après 5 tentatives échouées
- **Sécurité au niveau ligne (RLS) dans PostgreSQL** : le citoyen ne lit que ses plaintes, l'enquêteur celles qui lui sont affectées, le commissaire celles de son commissariat. La règle s'applique à la ligne, quelle que soit l'origine de la requête
- RBAC appliqué à chaque route par décorateur, en complément et non en substitution de la RLS
- Requêtes paramétrées de bout en bout (aucune concaténation SQL), protection XSS et CSRF, limitation de débit
- Données sensibles chiffrées en base ; pièces jointes chiffrées au repos et servies par URL présignée à durée limitée
- Traçabilité de tous les actes de procédure et de toutes les corrections de PV
- Conformité à la législation camerounaise sur la protection des données personnelles

### 8.3 Disponibilité

- Disponibilité cible : **99,5 %** mensuel (≤ 3,6 h d'indisponibilité par mois)
- Sauvegardes complètes quotidiennes et incrémentielles toutes les 6 heures ; RTO < 4 h, RPO < 6 h
- Supervision 24 h/24 avec alertes automatiques sur les trois services
- **Redémarrage automatique** : chaque conteneur déclare une sonde d'état et une politique de relance ; un service qui cesse de répondre est relevé sans intervention humaine (§13.5)
- **Dégradation partielle plutôt que panne totale** : l'indisponibilité du `service-ia` laisse le dépôt au clavier opérationnel ; celle du `service-notifs` diffère les envois sans bloquer l'instruction

### 8.4 Accessibilité et ergonomie

- Interface intégralement en français, vocabulaire adapté au niveau collège
- Responsive dès 320 px, cibles tactiles ≥ 44 × 44 px
- Déclaration vocale utilisable sur Android 8+ et iOS 14+, sans installation d'application tierce
- Repli clavier annoncé lorsque le microphone est indisponible ou refusé
- Compatibilité Chrome, Firefox, Edge et Safari récents
- Lisibilité des graphiques vérifiée pour les déficiences de la vision des couleurs
- Conformité WCAG 2.1 niveau AA

### 8.5 Maintenabilité

- Code source versionné sur Git (stratégie `main` / `develop` / `feature/*`)
- **Trois services faiblement couplés**, communiquant par contrats REST explicites : un service se remplace sans toucher aux autres
- Migrations de schéma versionnées et réversibles (Alembic)
- Documentation d'API générée depuis le code (OpenAPI / Swagger UI), couvrant 100 % des points d'entrée
- Couverture de tests automatisés ≥ 70 % du code métier
- Chaîne d'intégration continue (GitHub Actions) : tests → construction des images Docker → déploiement de préproduction
- **Déploiement reproductible** : `docker compose up` monte un environnement complet — services, base, stockage objet, supervision — sur une machine vierge, sans installation manuelle de dépendance (§13.5)
- **Parité des environnements** : la même image est exécutée en développement, en préproduction et en production ; seules les variables d'environnement changent

---

## 9. Maquettes des principales fonctionnalités

### 9.1 Inscription et connexion (citoyen)

Formulaire en 2 étapes : informations personnelles, puis coordonnées et identification. Un indicateur de progression accompagne l'utilisateur. La connexion s'effectue par code à usage unique à 6 chiffres, saisi dans six cases distinctes ; la page d'authentification des agents est séparée et demande un matricule préfixé.

### 9.2 Dépôt de plainte

Barre de progression sur cinq écrans, un sujet par écran, exemples de rédaction en grisé. La déclaration se saisit au clavier ou à la voix : un bouton d'enregistrement central, un minuteur, la transcription qui s'écrit au fil de la parole dans un volet inférieur, et une zone d'édition libre avant validation.

### 9.3 Questionnaire d'approfondissement

Interface en fil de discussion : questions en bulles claires, réponses du plaignant en bulles colorées. Boutons de réponse rapide, listes pour les choix multiples, saisie libre lorsque la question l'appelle. Jauge de complétude en haut de l'écran, avec trois seuils : rouge en deçà de 50 %, orange de 50 à 80 %, vert au-delà.

### 9.4 Suivi du dossier (citoyen)

Page « Mes dossiers » : liste des plaintes avec badge de statut coloré. Vue détail : frise chronologique verticale, étapes franchies marquées, étape en cours mise en avant, étapes à venir en retrait. Chaque étape se déplie sur les actes qui la composent, les messages de l'enquêteur et les pièces jointes, procès-verbaux compris. Attestation téléchargeable et historique des notifications reçues.

### 9.5 Tableau de bord back-office (commissaire)

En-tête de quatre indicateurs : plaintes en attente d'affectation, dossiers en enquête, comparutions attendues, enquêteurs actifs, complétés par le **taux d'avancement moyen** des dossiers de l'unité. En dessous, la file des plaintes à affecter — numéro, plaignant, type, priorité, ancienneté d'attente — paginée, chaque ligne ouvrant le choix d'un enquêteur avec sa charge courante, puis une confirmation. Le tableau de tous les dossiers porte une colonne **Avancement** en pourcentage, qui n'apparaît que dans cet espace.

Deux graphiques : **plaintes reçues** sur une période réglable (7 jours, 14 jours, 30 jours, 3 mois) et **répartition par statut** en barres horizontales. Une section de charge par enquêteur complète l'ensemble.

### 9.6 Gestion des dossiers (enquêteur)

Bandeau de recherche et de filtres (statut, priorité), liste paginée, indicateur d'urgence. Vue détail organisée en **progression par étapes** plutôt qu'en onglets juxtaposés : la frise commande l'affichage, et l'étape ouverte présente ses actes dans l'ordre, chacun avec son bouton d'action, son bouton de commentaire, ses écrits antérieurs et ses documents. Le procès-verbal s'affiche en place, éditable tant qu'il n'est pas signé. La clôture figure en tête du dossier, et ne devient possible qu'une fois toutes les étapes franchies.

*Choix d'organisation : une présentation en onglets juxtaposés (Déclaration, PV, Pièces, Historique) doublée d'une liste de tâches ferait apparaître un même acte à deux endroits et laisserait accomplir les actes dans le désordre. La progression unique par étapes contraint l'ordre de la procédure au lieu de le confier à la discipline de l'agent.*

---

## 10. Architecture des fonctionnalités

### 10.1 Architecture globale

```
┌───────────────────────────────────────────────────────────────┐
│               COUCHE PRÉSENTATION — React.js 18               │
│  ┌────────────────┐ ┌────────────────────┐ ┌───────────────┐  │
│  │ Espace Citoyen │ │ Espace Police      │ │ Espace Admin  │  │
│  │ • Inscription  │ │ (Enquêteur /       │ │ • Comptes     │  │
│  │ • Dépôt 5 écr. │ │  Commissaire)      │ │ • Routage     │  │
│  │ • Vocal / IA   │ │ • Tableau de bord  │ │ • Journaux    │  │
│  │ • Suivi        │ │ • Dossiers / PV    │ │               │  │
│  └────────────────┘ └────────────────────┘ └───────────────┘  │
└───────────────────────────────┬───────────────────────────────┘
                                │  HTTPS / REST (JSON + JWT)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│        service-coeur — Flask 3   (seul service exposé)        │
│   /auth · /plaintes · /dossiers · /documents · /stats         │
│   émission et vérification des JWT · RBAC · limitation de     │
│   débit · service du bundle React · en-têtes de sécurité      │
└────────┬──────────────────────────────────────────┬───────────┘
         │   réseau privé de conteneurs             │
         ▼                                          │
┌──────────────────────┐   ┌────────────────────┐   │
│   service-ia         │   │ service-notifs     │   │
│   Flask 3            │   │ Flask 3            │   │
│   /stt               │   │ SMS (Twilio /      │   │
│   /analyse           │   │      Orange CM)    │   │
│   /questionnaire     │   │ Courriel (SMTP)    │   │
│   /routage · /pv     │   │ relances auto      │   │
└──────────┬───────────┘   └─────────┬──────────┘   │
           │                         │              │
           └────────────┬────────────┴──────────────┘
                        ▼
   ┌────────────────────────────┐   ┌────────────────────────┐
   │ PostgreSQL 16 + PostGIS    │   │ MinIO (S3-compatible)  │
   │ données métier · JSONB ·   │   │ audio · PDF ·          │
   │ file d'attente notifs      │   │ pièces jointes         │
   └────────────────────────────┘   └────────────────────────┘
```

**Un seul service est joignable depuis Internet.** Le `service-coeur` sert le bundle React et l'API ; le `service-ia` et le `service-notifs` n'écoutent que sur le réseau privé des conteneurs et ne sont donc atteignables ni par le navigateur, ni depuis l'extérieur. Cette exposition unique remplace la passerelle d'un déploiement classique : le point de contrôle des jetons, des rôles et du débit est le service qui détient déjà la logique métier, ce qui évite d'entretenir une configuration de routage séparée du code qu'elle protège.

Les trois services sont **déployés et mis à l'échelle indépendamment** : un conteneur chacun, plusieurs *workers* Gunicorn par conteneur. Ils ne partagent aucun état en mémoire — toute coordination passe par PostgreSQL, MinIO ou un appel REST explicite. La panne du `service-ia` n'empêche donc pas le dépôt d'une plainte au clavier, et celle du `service-notifs` diffère l'envoi des SMS sans bloquer l'instruction des dossiers.

### 10.2 Flux de traitement principal (dépôt de plainte)

1. Le citoyen enregistre sa déclaration vocale → `service-coeur`, qui dépose l'audio dans MinIO puis appelle `service-ia` `/stt`
2. Texte transcrit → `service-ia` `/analyse` → entités extraites et score de complétude
3. `service-ia` `/questionnaire` produit les questions ciblant les éléments manquants ; le citoyen répond, le dossier se complète
4. `service-ia` `/routage` identifie le commissariat territorialement compétent (PostGIS)
5. `service-coeur` persiste la plainte en PostgreSQL — le numéro `2026-NNNNN` est attribué par la base — fait composer l'attestation par `service-ia` `/pv` et archive le PDF dans MinIO
6. `service-coeur` inscrit la notification dans la file en base ; `service-notifs` la consomme et adresse le SMS et le courriel au plaignant
7. La plainte entre au statut `RECU` dans la file du commissaire, qui l'affecte à un enquêteur

---

## 11. Modélisation UML

### 11.1 Diagramme de cas d'utilisation

**Citoyen** : s'inscrire, se connecter, déposer une plainte (texte ou vocal), répondre au questionnaire d'approfondissement, joindre des preuves, suivre son dossier étape par étape, lire les messages de l'enquêteur, télécharger l'attestation.

**Enquêteur** : se connecter (second facteur), consulter ses dossiers, accomplir les actes de chaque étape dans l'ordre, dicter la déposition, réviser et signer le PV, émettre une convocation, écrire au plaignant, clore le dossier.

**Commissaire** : superviser la file d'attente, affecter et transférer les dossiers, consulter les statistiques, ouvrir un dossier en lecture, annuler une étape, gérer les comptes agents, consulter le journal d'audit.

**Relations notables** :
- « Déposer une plainte » *inclut* « Situer les faits » et *peut inclure* « Transcrire la déclaration »
- « Déposer une plainte » *inclut* « Générer le questionnaire » et « Orienter vers le commissariat »
- « Franchir une étape » *inclut* « Accomplir tous les actes de l'étape »
- « Clore le dossier » *inclut* « Franchir toutes les étapes »
- « Signer le PV » *étend* « Réviser le PV » et le rend définitif

### 11.2 Diagramme de séquence — Dépôt de plainte vocal

```
Citoyen  React       coeur(Flask)      ia(Flask)  PostgreSQL/MinIO  notifs
   |       |              |                |              |            |
   |─audio►|              |                |              |            |
   |       |─POST /dépôt─►|                |              |            |
   |       |              |─PUT audio (MinIO)────────────►|            |
   |       |              |─POST /ia/stt──►|              |            |
   |       |              |◄──texte────────|              |            |
   |       |              |─POST /analyse─►|              |            |
   |       |              |◄entités + score|              |            |
   |◄─questions ciblées───|                |              |            |
   |─réponses────────────►|                |              |            |
   |       |              |─POST /routage─►|              |            |
   |       |              |◄─commissariat──|              |            |
   |       |              |─INSERT plainte + n° dossier──►|            |
   |       |              |─POST /pv──────►|              |            |
   |       |              |─PUT attestation.pdf──────────►|            |
   |       |              |─INSERT notification (file)───►|            |
   |◄─n° dossier + PDF────|                |              |            |
   |       |              |                |              |◄──SELECT───|
   |◄─SMS de confirmation──────────────────────────────────────────────|
```

Le `service-notifs` ne reçoit aucun appel du `service-coeur` : il consulte la file `notifications` en base. L'envoi reste ainsi rejouable après une panne de la passerelle opérateur, sans jamais bloquer le dépôt.

### 11.3 Diagramme d'activités — Cycle de vie d'une plainte

```
[Dépôt citoyen] → [Transcription si vocal] → [Analyse : entités + score]
    → [Complétude < 80 % ?] → Oui → [Questions complémentaires]
                            → Non ↓
    → [Aperçu et soumission] → [Orientation vers le commissariat]
    → [Attestation + notification]                                  ⟨RECU⟩
    → [Le commissaire affecte un enquêteur]
    → [Convocation et audition du plaignant] → [Dictée de la déposition]
    → [Établissement puis signature du PV]                          ⟨AUDITION⟩
    → [Convocation du mis en cause — jusqu'à 3 tentatives]
    → [Vérifications et recherche d'éléments]                ⟨EN_INSTRUCTION⟩
    → [Qualification des faits]                                  ⟨DECISION⟩
    → [Transmission au parquet ⟨TRANSMIS⟩ OU classement sans suite]
    → [Toutes les étapes franchies ?] → Oui → [Clôture]           ⟨CLOTURE⟩
    → [Notification au citoyen]
```

### 11.4 Diagramme de classes (principaux attributs)

```
Utilisateur                     Plainte
───────────                     ───────
id : UUID                       id : UUID
role : Enum                     numeroDossier : String [UNIQUE]
  {citoyen, enqueteur,          plaignant → Utilisateur
   commissaire, accueil,        commissariat → Commissariat
   admin}                       enqueteur → Utilisateur
nom, prenom : String            typeInfraction : Enum
telephone : String [UNIQUE]     statut : Enum
email, cni : String             priorite : Enum
motDePasseHash : String         dateFaits : Date
matricule : String [UNIQUE]     lieu : Region/Dept/Arrond/Quartier
grade, specialite : String      declaration : Text
commissariat → Commissariat     audioDeclaration : String (MinIO)
actif : Boolean                 scoreCompletude : Integer
                                entitesExtraites : JSONB
Commissariat                    misEnCause : nom, prenom, adresse,
────────────                                 telephone, description
id : UUID                       reponsesQuestionnaire : JSONB
nom : String                    dateAffectation, dateCloture
region, departement,
arrondissement : String         ProcesVerbal
adresse, telephone : String     ────────────
zoneCompetence : Geometry       id : UUID
                                plainte → Plainte
Convocation                     contenu : Text
───────────                     genereParIA : Boolean
id : UUID                       signe : Boolean
plainte → Plainte               signePar → Utilisateur
emisPar → Utilisateur           dateSignature : DateTime
nomConvoque : String
dateConvocation : Date          Historique          PieceJointe
heureConvocation : Time         ──────────          ───────────
motif : Text                    id : UUID           id : UUID
numeroOrdre : Integer           plainte → Plainte   plainte → Plainte
statut : Enum                   action : Text       nomFichier : String
  {EN_ATTENTE,                  detail : Text       typeMime : String
   COMPARU, ABSENT}             effectuePar→Utilis. taille : Integer
smsEnvoye : Boolean             adresseIp : String  cheminMinio : String

Notification
────────────
id : UUID · destinataire → Utilisateur · plainte → Plainte
canal : Enum {SMS, EMAIL} · message : Text
statutLivraison : Enum {EN_ATTENTE, ENVOYE, LIVRE, ECHEC} · dateEnvoi
```

*Note de modélisation : `Plainte` et `Dossier` ne forment qu'une seule entité en relation 1:1 dans une première rédaction — les dédoubler n'apportait rien. La table `plaintes` porte donc elle-même l'affectation, le statut et la priorité. Les énumérations suivent l'ordre réel de la procédure (§7.4).*

---

## 12. Modélisation des données

Le schéma comporte **8 tables, 5 types énumérés, 9 index et 15 politiques de sécurité au niveau ligne**. Il est géré par migrations versionnées (Alembic) et déployé sur PostgreSQL 16 avec l'extension PostGIS.

### 12.1 Types énumérés

| Type | Valeurs |
|---|---|
| `role_utilisateur` | `citoyen`, `enqueteur`, `commissaire`, `accueil`, `admin` |
| `statut_plainte` | `RECU`, `AUDITION`, `EN_INSTRUCTION`, `DECISION`, `TRANSMIS`, `CLOTURE` |
| `priorite_plainte` | `BASSE`, `NORMALE`, `HAUTE`, `URGENTE` |
| `type_infraction` | Vol simple, Vol avec violence, Agression physique, Escroquerie / Fraude, Harcèlement, Dégradation de biens, Accident de la route, Autre |
| `statut_convocation` | `EN_ATTENTE`, `COMPARU`, `ABSENT` |

### 12.2 Dictionnaire de données

**Table : `commissariats`**

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant |
| nom | TEXT | NOT NULL | Dénomination de l'unité |
| region, departement, arrondissement | TEXT | NOT NULL | Ressort territorial |
| zone_competence | GEOMETRY | — | Emprise géographique (PostGIS) |
| adresse, telephone | TEXT | — | Coordonnées |

**Table : `utilisateurs`**

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant |
| role | `role_utilisateur` | NOT NULL, défaut `citoyen` | Habilitation |
| nom, prenom | TEXT | NOT NULL | État civil |
| telephone | TEXT | UNIQUE | Contact |
| email, cni | TEXT | — | Courriel, pièce d'identité |
| mot_de_passe_hash | TEXT | — | Argon2 ; agents uniquement |
| matricule | TEXT | UNIQUE | Agents uniquement |
| grade, specialite | TEXT | — | Agents uniquement |
| commissariat_id | UUID | FK | Unité de rattachement |
| actif | BOOLEAN | défaut `true` | Compte actif |

**Table : `plaintes`** — entité centrale

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant |
| numero_dossier | TEXT | UNIQUE NOT NULL | Format `2026-NNNNN`, attribué par déclencheur |
| plaignant_id | UUID | FK utilisateurs NOT NULL | Déposant |
| commissariat_id | UUID | FK | Unité compétente |
| enqueteur_id | UUID | FK utilisateurs | Enquêteur affecté |
| type_infraction | `type_infraction` | NOT NULL | Qualification |
| statut | `statut_plainte` | NOT NULL, défaut `RECU` | Avancement |
| priorite | `priorite_plainte` | NOT NULL, défaut `NORMALE` | Urgence |
| date_faits | DATE | NOT NULL | Date des faits |
| lieu_region … lieu_adresse | TEXT | region/dept/arrond NOT NULL | Localisation |
| declaration | TEXT | NOT NULL | Récit du plaignant |
| audio_declaration | TEXT | — | Chemin MinIO de l'enregistrement |
| score_completude | INTEGER | défaut 0 | **Complétude de la déclaration** (0 à 100), calculée par le `service-ia` et destinée au seul citoyen — à ne pas confondre avec le taux d'avancement du dossier, qui n'est pas stocké ici (§7.3, §12.5) |
| entites_extraites | JSONB | défaut `{}` | Sortie du service d'analyse |
| mis_en_cause_* | TEXT | — | Nom, prénom, adresse, téléphone, signalement |
| reponses_questionnaire | JSONB | défaut `{}` | Réponses d'approfondissement |
| date_affectation, date_cloture | TIMESTAMPTZ | — | Jalons |

**Table : `proces_verbaux`**

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| plainte_id | UUID FK | Dossier concerné |
| contenu | TEXT | Corps du procès-verbal |
| genere_par_ia | BOOLEAN | Origine de la première version |
| signe | BOOLEAN | Verrouille toute modification ultérieure |
| signe_par | UUID FK utilisateurs | Signataire |
| date_signature | TIMESTAMPTZ | Horodatage de la signature |

**Table : `convocations`**

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| plainte_id | UUID FK | Dossier associé |
| emis_par | UUID FK utilisateurs | Agent émetteur |
| nom_convoque | TEXT | Personne convoquée |
| date_convocation, heure_convocation | DATE, TIME | Comparution |
| motif | TEXT | Objet de la convocation |
| numero_ordre | INTEGER | 1ʳᵉ, 2ᵉ, 3ᵉ tentative |
| statut | `statut_convocation` | EN_ATTENTE / COMPARU / ABSENT |
| token_acces | TEXT UNIQUE | Jeton de vérification porté par le QR code |
| sms_envoye | BOOLEAN | Suivi d'acheminement |

**Table : `historique`** — journal d'audit

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| plainte_id | UUID FK | Dossier concerné |
| action | TEXT NOT NULL | Nature de l'acte |
| detail | TEXT | Circonstances |
| effectue_par | UUID FK utilisateurs | Auteur |
| adresse_ip | TEXT | Origine de l'action |
| created_at | TIMESTAMPTZ | Horodatage |

**Table : `pieces_jointes`**

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| plainte_id | UUID FK | Dossier |
| nom_fichier, type_mime | TEXT | Nom d'origine, type MIME |
| taille | INTEGER | Octets |
| chemin_minio | TEXT | Emplacement dans le stockage objet |

**Table : `notifications`** — file d'attente d'acheminement

| Attribut | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| destinataire_id | UUID FK utilisateurs | Destinataire |
| plainte_id | UUID FK | Dossier concerné |
| canal | ENUM | SMS / EMAIL |
| telephone, email | TEXT | Adresse d'acheminement |
| message | TEXT | Contenu |
| statut_livraison | ENUM | EN_ATTENTE / ENVOYE / LIVRE / ECHEC |
| tentatives | INTEGER | Nombre de relances effectuées |
| date_envoi | TIMESTAMPTZ | Horodatage du dernier envoi |

### 12.3 Relations principales

- `Commissariat` (1) ──< (N) `Utilisateur`
- `Commissariat` (1) ──< (N) `Plainte`
- `Utilisateur` (1) ──< (N) `Plainte` — en qualité de plaignant
- `Utilisateur` (1) ──< (N) `Plainte` — en qualité d'enquêteur affecté
- `Plainte` (1) ──< (N) `ProcesVerbal` — un par audition
- `Plainte` (1) ──< (N) `Convocation`, `Historique`, `PieceJointe`
- `Utilisateur` (1) ──< (N) `Notification`

### 12.4 Politiques de sécurité au niveau ligne

Le cloisonnement n'est pas confié au seul code applicatif : il est déclaré dans la base. Chaque service ouvre sa transaction sous un rôle applicatif et y déclare l'identité de l'appelant (`SET LOCAL app.utilisateur_id`), que les politiques exploitent. Une requête forgée, ou un défaut de contrôle dans un service, ne franchit donc pas la barrière.

| Table | Règle de lecture |
|---|---|
| `plaintes` | Le citoyen ne voit que celles qu'il a déposées ; l'enquêteur celles qui lui sont affectées ; le commissaire celles de son commissariat |
| `utilisateurs` | Chacun lit son propre profil ; les agents lisent les profils de leur unité |
| `historique`, `proces_verbaux`, `convocations`, `pieces_jointes` | Accès dérivé du droit d'accès à la plainte rattachée |
| `notifications` | Le destinataire seul |
| `v_avancement_dossier` (vue) | **Le commissaire seul**, et pour son commissariat uniquement : la restriction du taux d'avancement (§7.3) est déclarée dans la base, non laissée au masquage d'une colonne par l'interface |

### 12.5 Automatismes en base

- **Attribution du numéro de dossier** : déclencheur `BEFORE INSERT` sur `plaintes`, format `AAAA-NNNNN`, séquence par année — le numéro ne peut donc pas être dupliqué par deux dépôts simultanés
- **Journalisation automatique** : tout changement de statut ou d'affectation inscrit une ligne dans `historique`, sans dépendre du code appelant
- **Horodatage** : `updated_at` mis à jour par déclencheur
- **Taux d'avancement** : exposé par une **vue calculée** à partir des actes enregistrés dans `historique` et de l'étape courante — aucune colonne stockée, donc aucun risque de divergence entre le chiffre affiché au commissaire et la procédure réelle (§7.3). À distinguer de `plaintes.score_completude`, qui porte la complétude de la déclaration et n'est destinée qu'au citoyen

### 12.6 Jeu d'amorçage

Un jeu de données cohérent accompagne le schéma : **24 plaintes** couvrant les six statuts, **21 citoyens**, **6 agents** (1 commissaire, 4 enquêteurs dont un désactivé, 1 agent d'accueil), les convocations et l'historique correspondants — soit 221 actes de procédure. Il permet de monter un environnement de démonstration ou de recette en une commande.

---

## 13. Architecture technique

### 13.1 Architecture distribuée

La plateforme repose sur une **architecture distribuée à 3 tiers**, dont le tier applicatif est éclaté en trois services Flask autonomes.

**Tier 1 — Présentation**
SPA **React.js 18** compilée en fichiers statiques, servis par le `service-coeur`. Elle ne dialogue qu'avec ce seul service, en REST/HTTPS, et ne détient aucun secret : le jeton JWT est le seul élément d'authentification qu'elle conserve.

**Tier 2 — Services applicatifs distribués (Python 3.11 / Flask 3)**
- **`service-coeur`** — *seul service exposé sur Internet* : terminaison TLS, service du bundle React, authentification et émission des JWT, contrôle des rôles, limitation de débit, en-têtes de sécurité ; plaintes, dossiers, procès-verbaux, convocations, documents, statistiques. Orchestre les appels au `service-ia`
- **`service-ia`** : transcription vocale, analyse de la déclaration, questionnaire d'approfondissement, orientation territoriale, composition des documents officiels
- **`service-notifs`** : consommation de la file `notifications`, envoi des SMS et courriels, relances en cas d'échec

Chaque service est un conteneur distinct exécuté par **Gunicorn** (plusieurs *workers* par conteneur), sans état en mémoire : il peut être redémarré, dupliqué ou remplacé sans coordination avec les autres.

**Tier 3 — Données**
- **PostgreSQL 16 + PostGIS** : données métier structurées, accès par SQLAlchemy, migrations Alembic ; JSONB pour les entités extraites et les réponses au questionnaire ; PostGIS pour la compétence territoriale ; table `notifications` employée comme file d'attente durable
- **MinIO** : stockage objet S3-compatible pour les audios de déclaration, les pièces jointes et les PDF générés

### 13.2 Découpage fonctionnel du `service-ia`

| Point d'entrée | Technologie | Rôle |
|---|---|---|
| `POST /ia/stt` | Whisper large-v3 | Audio → texte français, exécution locale, sans service tiers |
| `POST /ia/analyse` | spaCy + CamemBERT | Extraction d'entités, qualification de l'infraction, score de complétude |
| `POST /ia/questionnaire` | Banque de questions + éléments manquants détectés | Questions ciblant ce qui manque, par type d'infraction |
| `POST /ia/routage` | PostGIS | Identification du commissariat territorialement compétent |
| `POST /ia/pv` | Jinja2 + WeasyPrint | Gabarit institutionnel → PDF (attestation, procès-verbal, convocation) |

Le regroupement de ces traitements dans un service unique — plutôt qu'un service par modèle — évite de charger plusieurs fois les mêmes dépendances Python lourdes en mémoire, tout en gardant l'ensemble déployable indépendamment du `service-coeur`.

### 13.3 Communication entre services

- **Contrats REST/JSON explicites**, versionnés par préfixe d'URL ; aucun service ne lit la base d'un autre service en dehors des tables dont il est responsable
- **Délais et repli** : tout appel au `service-ia` est borné dans le temps ; à l'expiration, le parcours se poursuit sans assistance plutôt que d'échouer
- **Idempotence** des écritures sensibles (dépôt, envoi de notification), afin qu'une reprise après incident ne produise pas de doublon
- **Découplage de la notification** : le `service-coeur` écrit en base, le `service-notifs` lit — les deux ne sont jamais indisponibles ensemble du point de vue de l'utilisateur

### 13.4 Sécurité de l'architecture

- **JWT** : jetons signés émis et vérifiés par le `service-coeur`, puis revalidés par le `service-ia` sur chaque appel interne — aucun service ne fait confiance à son appelant, même sur le réseau privé
- **Surface d'exposition réduite** : `service-ia`, `service-notifs`, PostgreSQL et MinIO ne publient aucun port hors du réseau de conteneurs ; seul le `service-coeur` est joignable
- **RLS PostgreSQL** : la règle d'accès s'applique à la ligne, quelle que soit l'origine de la requête (§12.4)
- **RBAC** appliqué par décorateur sur chaque route Flask
- **TLS 1.3** de bout en bout ; les services internes ne sont pas exposés hors du réseau privé de conteneurs
- **MinIO** : *buckets* privés, fichiers délivrés par URL présignée à durée limitée, sans transiter par les services applicatifs
- **Aucun secret dans l'interface** : clés, identifiants de passerelle et paramètres de connexion résident côté serveur, injectés par variables d'environnement
- **Cloisonnement par conteneur** : chaque service s'exécute sous un utilisateur non privilégié, en système de fichiers minimal, et ne voit que les services déclarés sur son réseau (§13.5)

### 13.5 Conteneurisation et déploiement

L'ensemble de la plateforme est décrit par un fichier `docker-compose.yml` : **six conteneurs**, deux réseaux, trois volumes persistants. Un environnement complet se monte par une seule commande, ce qui rend l'installation identique sur le poste du développeur, en préproduction et en production.

```
┌─────────────────────── réseau  public ────────────────────────┐
│  service-coeur          image plaintecam/coeur:1.0            │
│  Flask + Gunicorn       port 443 publié · bundle React servi   │
└───────────────┬───────────────────────────────────────────────┘
                │
┌───────────────┴─────── réseau  interne (non publié) ──────────┐
│  service-ia             image plaintecam/ia:1.0               │
│                         modèles Whisper + CamemBERT embarqués  │
│  service-notifs         image plaintecam/notifs:1.0           │
│                         passerelle SMS · SMTP                  │
│  postgres               image postgis/postgis:16-3.4          │
│                         volume  pgdata                         │
│  minio                  image minio/minio                     │
│                         volume  objets                         │
│  prometheus + grafana   supervision · volume  metrics          │
└───────────────────────────────────────────────────────────────┘
```

| Aspect | Mise en œuvre |
|---|---|
| **Images applicatives** | Construction en deux étapes (*multi-stage*) : dépendances compilées dans une image de construction, seul le résultat est copié dans l'image d'exécution. Le frontend React est bâti puis ses fichiers statiques sont intégrés à l'image du `service-coeur` |
| **Isolation réseau** | Deux réseaux Docker : le `service-coeur` appartient aux deux, les autres conteneurs au seul réseau interne. Aucun port de PostgreSQL, MinIO, `service-ia` ou `service-notifs` n'est publié sur l'hôte |
| **Persistance** | Volumes nommés pour les données PostgreSQL, les objets MinIO et les métriques : la suppression d'un conteneur ne détruit aucune donnée |
| **Configuration** | Aucun paramètre en dur dans les images : URL de base, secrets JWT, identifiants de passerelle SMS et de MinIO sont injectés par variables d'environnement, lues d'un fichier `.env` exclu du dépôt |
| **Surveillance de l'état** | `healthcheck` par service et politique `restart: unless-stopped` : un service qui ne répond plus est redémarré sans intervention |
| **Ordre de démarrage** | `depends_on` conditionné à l'état de santé : les services applicatifs n'acceptent de trafic qu'une fois la base prête et les migrations appliquées |
| **Mise à l'échelle** | `docker compose up --scale service-ia=3` duplique le service coûteux en calcul sans toucher aux autres — c'est la traduction opérationnelle du découpage décrit au §13.1 |
| **Reproductibilité** | Images étiquetées par version et construites par l'intégration continue ; un déploiement se ramène à changer une étiquette, un retour arrière à remettre la précédente |

---

## 14. Technologies utilisées

### 14.1 Tableau des technologies

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | **React.js 18** (Vite) | SPA responsive, espaces citoyen et back-office |
| Routage / état client | React Router + Context API | Navigation, session, état global |
| Appels réseau | Axios | Client HTTP, intercepteurs JWT |
| Graphiques | Chart.js 4 (`react-chartjs-2`) | Barres, barres horizontales, anneaux, courbes |
| Point d'entrée unique | **`service-coeur`** (Flask) | Sert le bundle React et l'API ; seul service exposé |
| Limitation de débit | Flask-Limiter | Protection contre la force brute et les rafales |
| Certificat TLS | Let's Encrypt (renouvellement automatique) | Chiffrement en transit |
| Services applicatifs | **Python 3.11 + Flask 3** | `service-coeur`, `service-ia`, `service-notifs` |
| Serveur d'application | Gunicorn | Exécution multi-*workers* de chaque service |
| ORM / migrations | SQLAlchemy + Alembic (Flask-Migrate) | Accès aux données, évolution versionnée du schéma |
| Validation / sérialisation | Marshmallow | Schémas d'entrée et de sortie des API |
| Sécurité | Flask-JWT-Extended + argon2 | Authentification JWT, hachage des mots de passe, RBAC |
| Transcription vocale | **OpenAI Whisper large-v3** | Audio → texte français, exécution locale |
| Traitement de la langue | **spaCy + CamemBERT** | Entités, qualification d'infraction, score de complétude |
| Base de données | **PostgreSQL 16 + PostGIS** | Données métier, JSONB, compétence territoriale, RLS |
| Stockage de fichiers | **MinIO** | Objets S3-compatibles : audio, PDF, pièces jointes |
| Documents PDF | Jinja2 + WeasyPrint | Gabarit HTML institutionnel → PDF |
| QR code | Bibliothèque `qrcode` (Python) | Jeton de vérification des convocations |
| Notifications SMS | Twilio / Orange API CM | SMS aux citoyens et mis en cause |
| Notifications courriel | Flask-Mail (SMTP) | Courriels transactionnels |
| Conteneurisation | **Docker** (images *multi-stage*) | Une image versionnée par service, exécution identique partout |
| Orchestration | **Docker Compose** | Six conteneurs, deux réseaux, trois volumes, un fichier de description |
| Documentation d'API | OpenAPI / Swagger UI | Contrat des trois services, généré depuis le code |
| CI/CD | GitHub Actions | Tests → construction des images → préproduction |
| Tests services | Pytest + pytest-flask | Tests unitaires et d'intégration |
| Tests frontend | Vitest + React Testing Library | Composants et parcours |
| Supervision | Prometheus + Grafana | Métriques système et applicatives |
| Journaux | Loki + Grafana | Centralisation et exploration des logs |

### 14.2 Justification des choix principaux

**Flask.** Micro-cadriciel Python volontairement minimal, dont on n'embarque que les extensions nécessaires (JWT, SQLAlchemy, Marshmallow, Mail). Ce faible périmètre est ce qui rend le découpage en trois services soutenable : chaque service reste petit, démarre vite et se lit d'un bloc, là où un cadriciel à conventions lourdes imposerait la même infrastructure trois fois. Surtout, il place l'API métier et les traitements d'assistance dans **un seul langage** : les modèles Whisper et CamemBERT s'appellent directement, sans passerelle ni sérialisation supplémentaire entre deux écosystèmes.

**React.js.** Bibliothèque frontend la plus adoptée, composants réutilisables, DOM virtuel performant sur les appareils mobiles d'entrée de gamme, large communauté. Le découpage en composants sert directement l'application : la vue de dossier construite pour l'enquêteur est réemployée en lecture seule par le commissaire. Un partage de code avec React Native reste ouvert pour la future version mobile.

**PostgreSQL.** SGBD le plus avancé en open source : ACID, JSONB pour les entités extraites, PostGIS pour la compétence territoriale, et surtout **sécurité au niveau ligne**, qui permet d'exprimer les règles de visibilité là où elles ne peuvent être contournées. Sa robustesse transactionnelle permet en outre d'utiliser la table `notifications` comme file d'attente durable, sans introduire de courtier de messages supplémentaire à administrer.

**MinIO.** Les audios de déclaration, les pièces jointes et les PDF n'ont pas leur place dans la base — ils l'alourdiraient et compliqueraient les sauvegardes. MinIO expose une API S3 standard, s'auto-héberge (les données restent sur le territoire national) et délivre les fichiers par URL présignée à durée limitée, donc sans les faire transiter par les services applicatifs.

**OpenAI Whisper.** Meilleure précision disponible en open source pour le français (WER < 5 % sur audio de qualité), exécution entièrement locale : la voix d'un plaignant ne quitte pas l'infrastructure, et aucun coût variable d'API cloud ne pèse sur l'exploitation.

**Docker.** Trois services écrits en Python, une base avec extension spatiale, un stockage objet et une pile de supervision : installer tout cela à la main sur une machine, puis recommencer à l'identique sur une autre, est une source de panne bien plus probable que le code lui-même. La conteneurisation ramène ce montage à un fichier versionné, aux côtés du code qu'il déploie. Elle apporte aussi trois choses que l'architecture distribuée exige : un **réseau privé** qui rend les services internes réellement injoignables de l'extérieur, une **mise à l'échelle sélective** du seul service coûteux en calcul, et un **retour arrière immédiat** en remettant l'étiquette d'image précédente. Docker Compose suffit au périmètre v1 ; un orchestrateur de type Kubernetes ne se justifierait qu'à l'échelle de plusieurs commissariats déployés en parallèle.

**Architecture distribuée.** Séparation claire des responsabilités, déploiement et mise à l'échelle indépendants, résilience accrue. Le dimensionnement le justifie concrètement : le `service-ia` est gourmand en mémoire et en CPU (modèles chargés en RAM) alors que le `service-coeur` traite de nombreuses requêtes courtes — les héberger ensemble obligerait à dimensionner l'ensemble sur le plus exigeant des deux. Le découplage a aussi une conséquence fonctionnelle directe : la panne d'un service dégrade une fonction, elle n'arrête pas le service public.

---

## 15. Planning du projet

### 15.1 Phases

| Phase | Intitulé | Durée | Période |
|---|---|---|---|
| 1 | Analyse des besoins, entretien de terrain, cahier des charges | 2 semaines | S1–S2 |
| 2 | Conception : modèle de données, maquettes, parcours, contrats d'API | 2 semaines | S3–S4 |
| 3 | `service-coeur` : authentification, plaintes, dossiers, documents, statistiques | 4 semaines | S5–S8 |
| 4 | `service-ia` et `service-notifs` : transcription, analyse, orientation, PDF, SMS | 3 semaines | S6–S8 |
| 5 | Frontend React : espace citoyen, espace enquêteur, espace commissaire | 4 semaines | S8–S11 |
| 6 | Intégration, tests fonctionnels et tests de charge | 2 semaines | S12–S13 |
| 7 | Conteneurisation, déploiement, recette, documentation et soutenance | 1 semaine | S14 |

Les phases 3 et 4 se recouvrent à partir de la semaine 6 : les contrats d'API étant figés en phase 2, le service d'assistance se développe contre des doublures et non contre le service métier réel. La phase 5 démarre dès que les points d'entrée du `service-coeur` sont disponibles en préproduction.

### 15.2 Diagramme de Gantt

```
                        S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12 S13 S14
────────────────────────────────────────────────────────────────────────────────
P1 — Analyse            ██  ██
P2 — Conception                 ██  ██
P3 — service-coeur                      ██  ██  ██  ██
P4 — service-ia/notifs                      ██  ██  ██
P5 — Frontend React                                 ██  ██  ██  ██
P6 — Intégration/tests                                          ██  ██
P7 — Déploiement                                                        ██
────────────────────────────────────────────────────────────────────────────────
Jalons :
  ▲ S2  : Cahier des charges validé, entretien de terrain exploité
  ▲ S4  : Modèle de données, maquettes et contrats d'API validés
  ▲ S8  : Services Flask intégrés, schéma déployé, tests unitaires au vert
  ▲ S11 : Trois espaces React raccordés aux API, parcours complets
  ▲ S13 : Tests fonctionnels et de charge terminés, anomalies corrigées
  ▲ S14 : Déploiement final, recette validée, démonstration prête
```

---

## 16. Livrables

| # | Livrable | Format | Échéance | Critère d'acceptation |
|---|---|---|---|---|
| L1 | Cahier des charges | Markdown / PDF | Fin S2 | Validé par les parties prenantes |
| L2 | Compte rendu d'entretien de terrain | Markdown | Fin S2 | Validé par l'agent interviewé |
| L3 | Maquettes des interfaces | Figma / HTML navigable | Fin S4 | Parcourues par un utilisateur non technique |
| L4 | Diagrammes UML | Intégrés au §11 | Fin S4 | Cohérents avec le code livré |
| L5 | Schéma de base de données et migrations | SQL + Alembic | Fin S5 | S'exécute sans erreur sur PostgreSQL 16 |
| L6 | Jeu d'amorçage | SQL | Fin S5 | 24 plaintes couvrant les six statuts |
| L7 | Code source `service-coeur` | Dépôt Git | Fin S8 | Couverture de tests ≥ 70 %, tests au vert |
| L8 | Code source `service-ia` et `service-notifs` | Dépôt Git | Fin S8 | Transcription ≥ 85 %, qualification ≥ 80 % |
| L9 | Code source frontend React | Dépôt Git | Fin S11 | Parcours complets, responsive dès 320 px |
| L10 | Documentation d'API | OpenAPI / Swagger UI | Fin S11 | 100 % des points d'entrée décrits |
| L11 | Rapport de tests | PDF | Fin S13 | Charge validée à 500 utilisateurs simultanés |
| L12 | Fichiers de conteneurisation | `Dockerfile` × 3 + `docker-compose.yml` | Fin S13 | `docker compose up` démarre les six conteneurs sur une machine vierge |
| L13 | Application déployée | URL publique | Fin S14 | Disponibilité ≥ 99,5 % la première semaine |
| L14 | Documentation technique et de déploiement | Markdown | Fin S14 | Un tiers monte la plateforme sur un environnement vierge |
| L15 | Présentation de soutenance | PDF | Soutenance | Démonstration des scénarios principaux |

---

## 17. Conclusion

Ce cahier des charges définit les exigences fonctionnelles, techniques et organisationnelles de la plateforme PlainteCam, dont la conception repose sur une analyse de terrain du processus de dépôt de plainte au Cameroun.

**Fidélité à la procédure réelle.** L'apport principal n'est pas technologique mais procédural : l'application reproduit l'enchaînement effectivement suivi au commissariat — le plaignant est convoqué et auditionné avant l'ouverture de l'enquête, le mis en cause est convoqué jusqu'à trois fois, un dossier ne se clôt qu'une fois toutes ses étapes franchies, un procès-verbal signé ne se modifie plus. Ces règles sont contraintes par l'application, non laissées à la discipline de l'agent.

**Architecture adaptée à la nature des traitements.** Le choix d'une architecture distribuée — interface React, trois services Flask, PostgreSQL et MinIO — répond à un besoin concret et non à un effet de mode : les traitements d'assistance vocale et linguistique n'ont ni le profil de charge, ni le rythme de mise à jour, ni les besoins matériels de l'API métier. Les séparer permet de les dimensionner et de les faire évoluer séparément, et fait qu'une défaillance de l'un dégrade une fonction sans interrompre le service.

**Sécurité déclarée au plus près des données.** Les règles de visibilité sont exprimées dans PostgreSQL sous forme de politiques au niveau ligne, en plus des contrôles portés par les services. Un défaut dans une route applicative ne suffit donc pas à exposer le dossier d'un justiciable.

**Assistance explicable.** Les mécanismes d'aide — transcription, analyse de la déclaration, approfondissement, orientation territoriale, composition des documents — restent au service de l'agent et du citoyen. Les deux pourcentages affichés par la plateforme sont d'ailleurs strictement séparés (§7.3) : la **complétude de la déclaration** est montrée au citoyen pendant qu'il rédige, parce qu'elle l'aide à préciser, et n'est pas reportée comme note sur le dossier — un chiffre non explicable orienterait le jugement d'un enquêteur sur une affaire judiciaire ; le **taux d'avancement du dossier**, réservé au commissaire, ne juge pas la plainte mais la procédure, et se déduit des actes réellement accomplis.

**Périmètre maîtrisé.** La version 1 est délibérément cadrée pour une livraison en 14 semaines. Les fonctionnalités exclues — accès USSD, langues nationales, transmission électronique au parquet — sont planifiées en phase 2 selon les retours du terrain.

La mise en service de PlainteCam est susceptible de produire des effets mesurables : réduction des barrières d'accès à la justice pour les citoyens, gain de temps administratif pour les enquêteurs, et renforcement de la confiance dans les institutions de sécurité par la transparence du suivi des dossiers.
