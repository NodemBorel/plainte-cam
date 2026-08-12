# COMPTE RENDU D'ENTRETIEN — COMMISSARIAT

**Date de visite :** Mai 2026
**Source :** Agent / Fonctionnaire de police (anonymisé)

---

## Méthodologie de collecte des données

L'entretien a été conduit selon une approche qualitative semi-directive, directement sur le terrain, au sein d'un commissariat de la ville de Yaoundé. La collecte des données s'est déroulée de la manière suivante :

- **Entretien semi-directif** : un guide d'entretien structuré en thématiques a été utilisé pour orienter les échanges tout en laissant l'interlocuteur s'exprimer librement.
- **Observation directe** : observation du flux de travail réel au sein du commissariat (réception des plaignants, circulation des dossiers papier, gestion des parafeurs).
- **Anonymisation** : les informations permettant d'identifier l'agent ont été volontairement omises pour garantir la confidentialité et favoriser la franchise des réponses.
- **Prise de notes et synthèse** : les échanges ont été retranscrits manuellement puis organisés par thématiques pour constituer ce compte rendu.

---

## 1. Réception et enregistrement de la plainte

Lorsqu'un plaignant se présente au commissariat pour déposer une plainte, le document doit obligatoirement contenir les éléments suivants :

- La date
- Le nom et l'adresse du plaignant
- L'objet de la plainte
- L'identité du mis en cause
- La destination (adressée au commissaire ou au procureur)

La plainte est déposée au commissariat compétent, c'est-à-dire celui du secteur où réside le mis en cause ou celui où l'acte a eu lieu. Le secrétariat enregistre la plainte et la transmet au chef d'unité. Une **attestation de dépôt de plainte** est délivrée au plaignant et jointe au dossier comme preuve officielle qu'il a bien porté plainte.

---

## 2. Traitement et affectation du dossier

Après réception, la plainte est **cotée à un enquêteur** par le chef d'unité, qui reçoit un parafeur contenant l'ensemble des plaintes à traiter. L'affectation se fait selon la compétence de l'enquêteur sur le type d'affaire concerné, sans procédure strictement formalisée.

Une fois le dossier affecté :

1. Le plaignant est convoqué et auditionné → un **procès-verbal (PV)** est rédigé
2. Le mis en cause est convoqué à son tour et auditionné → un **PV** est également rédigé

Si le mis en cause est connu et identifié, il est convoqué **au minimum 3 fois**. En cas d'absence répétée et injustifiée, le dossier est transmis au procureur.

En cas d'indisponibilité de l'enquêteur en charge, le dossier est transféré à un autre enquêteur.

---

## 3. Génération du procès-verbal et signature

### 3.1 Rédaction actuelle du PV

La rédaction des procès-verbaux d'audition est aujourd'hui **entièrement manuelle**. L'enquêteur transcrit les déclarations du plaignant ou du mis en cause à la main, en suivant un **template institutionnel** normalisé comprenant :

- L'en-tête (commissariat, date, heure, numéro de dossier)
- L'identité complète de la personne auditionnée
- Le corps de la déclaration (narration des faits)
- Les questions/réponses si applicable
- La clôture et les mentions légales

### 3.2 Génération automatique par IA (solution proposée)

Dans la plateforme numérique, la génération du PV sera automatisée grâce à l'IA selon le processus suivant :

1. **Collecte des données** : le plaignant soumet sa plainte via saisie texte ou vocale. Le module STT (Speech-to-Text) transcrit l'audio en texte brut.
2. **Structuration par le NLP** : le module de traitement du langage naturel extrait les entités clés (date, lieu, mis en cause, nature des faits, préjudice subi) et structure les informations.
3. **Application du template institutionnel** : les données extraites sont injectées automatiquement dans le template officiel de PV utilisé par les commissariats camerounais.
4. **Génération du document** : le PV est généré au format PDF structuré, prêt à être relu et validé par l'enquêteur.
5. **Révision humaine** : l'enquêteur peut modifier, compléter ou corriger le PV généré avant validation finale.

### 3.3 Signature du PV

Le processus de signature du PV soulève plusieurs difficultés dans le contexte actuel :

| Situation | Problème actuel | Solution numérique |
|---|---|---|
| Mis en cause refuse de signer | Contentieux procédural, risque de vice de forme | Signature électronique avec horodatage + mention du refus enregistrée automatiquement |
| Plaignant illettré | Ne peut pas signer en connaissance de cause | Lecture audio du PV + signature par empreinte digitale ou code OTP |
| Avocat conteste le contenu | Procédure longue et manuelle | Historique des modifications traçable dans le système |
| Mineur impliqué | Signature du représentant légal obligatoire | Notification automatique aux parents avec convocation numérique |

La signature électronique sera conforme aux exigences légales en vigueur, avec génération d'un **accusé de réception horodaté** pour chaque partie.

---

## 4. Suivi de la plainte par le plaignant

Il n'existe **aucun système de suivi automatique**. Le plaignant doit se déplacer physiquement au commissariat pour obtenir des informations sur l'évolution de son dossier.

Concernant la convocation du mis en cause : c'est en principe **le plaignant lui-même** qui remet la convocation au mis en cause. Toutefois, si le plaignant craint des représailles (violences, intimidations), un policier l'assiste dans cette démarche.

---

## 5. Difficultés identifiées

| # | Difficulté | Impact |
|---|---|---|
| 1 | Le plaignant ne sait ni lire ni écrire et doit être assisté par une personne de son choix | Ralentissement du processus, dépendance à un tiers |
| 2 | Le plaignant a du mal à s'exprimer clairement et à exposer les faits de façon cohérente | Qualité du dossier insuffisante, PV incomplet |
| 3 | Le mis en cause refuse d'être auditionné en attendant son avocat | Blocage de la procédure, allongement des délais |
| 4 | Le mis en cause refuse de signer le PV d'audition en prétextant que le contenu ne reflète pas ses déclarations | Contentieux procédural, risque de vice de forme |
| 5 | L'avocat présent manque parfois de compétence sur le dossier | Mauvaise défense, auditions prolongées inutilement |
| 6 | En cas de mineur mis en cause ou plaignant, l'audition doit obligatoirement se faire en présence des parents | Délais supplémentaires pour réunir les parents |
| 7 | La rédaction des PV d'audition est une tâche longue et entièrement manuelle | Charge administrative lourde pour les enquêteurs |

---

## 6. Ce que la solution numérique peut résoudre

| Difficulté terrain | Fonctionnalité de l'application |
|---|---|
| Plaignant illettré ou qui s'exprime mal | Saisie vocale + transcription automatique par IA + pré-audition guidée par questions |
| Aucun suivi sans déplacement | Suivi en temps réel du dossier + notifications SMS automatiques |
| Affectation manuelle sans critères formels | Affectation automatique selon compétence de l'enquêteur et type de délit |
| Plaignant ne sait pas à quel commissariat aller | Routage automatique selon le lieu des faits ou du mis en cause |
| Rédaction manuelle et longue des PV | Génération automatique du document de plainte structuré en PDF via template IA |
| Attestation de dépôt délivrée manuellement | Génération et envoi automatique de l'attestation numérique par SMS |
| Remise de convocation risquée pour le plaignant | Envoi numérique sécurisé de la convocation au mis en cause via la plateforme |
| Refus ou litige sur la signature du PV | Signature électronique horodatée + traçabilité des refus et modifications |
