# PlainteCam — Améliorations côté application

État au 28 août 2026. Sources indiquées pour chaque point :
**[E]** remarque de l'encadreur · **[A]** relevé lors de l'audit du code.

---

## 1. Urgent — sécurité

### 1.1 Clé d'API Groq exposée **[A]**

`key.txt` contient une clé en clair (`gsk_…`) et le fichier est **versionné dans git**.
Toute personne ayant accès au dépôt peut consommer le quota, et l'historique
git conserve la clé même après suppression du fichier.

- Révoquer la clé depuis la console Groq.
- Retirer `key.txt` du dépôt et l'ajouter à `.gitignore`.
- Lire la clé depuis une variable d'environnement, jamais depuis un fichier suivi.

### 1.2 Authentification agent sans vérification du mot de passe **[A]**

`auth/agent.html` (fonction `handleLogin`, ~l.187-211) valide le **format** du
matricule, puis redirige vers l'espace correspondant. Le mot de passe saisi
n'est jamais contrôlé. N'importe quelle valeur ouvre l'espace commissaire ou
enquêteur.

Le mémoire annonce par ailleurs un test de sécurité « accès non autorisé →
refusé » : il n'est pas vérifiable dans cet état.

---

## 2. Documents formels — apparence professionnelle **[E]**

> « Si quelqu'un voit une convocation sortie de la plateforme, que ça ait
> vraiment l'air d'une convocation. […] Ce sont ces détails qui montrent la
> qualité de sérieux. »

Documents concernés : **récépissé / attestation de dépôt**, **convocation**,
**procès-verbal d'audition**.

| À faire | État |
|---|---|
| En-tête officielle avec logo et mentions (République, Ministère, commissariat, n° de dossier) | à compléter |
| Cachet simulé, incrusté sur le document | **à créer** |
| Emplacement et bloc de signature | partiel |
| QR code d'identification unique | **déjà fait** — `js/modules/qrcode.js` + `documents.js` |

### Le cachet : point juridique important

Ne **jamais** reproduire un cachet réel de la police — ce serait un faux.
Créer un cachet explicitement identifié comme tel, par exemple
« CACHET DES SERVICES NUMÉRIQUES », et le rendre **configurable** pour la
démonstration.

### Le QR code existe déjà

Cette partie de la demande est satisfaite mais n'a pas été montrée en démo.
À présenter plutôt qu'à redévelopper.

---

## 3. Modèle de données — cumuls impossibles **[E]**

### 3.1 Motifs de plainte cumulés

> « On peut porter plainte à la fois pour escroquerie et abus de confiance en
> même temps. »

`supabase/schema.sql` l.63 déclare :

```sql
type_infraction type_infraction NOT NULL
```

Un **énuméré simple** : une plainte ne peut porter qu'une seule qualification.
Correction structurelle nécessaire — table de liaison `plainte_infractions`,
ou colonne `type_infraction[]`.

Impact : schéma, formulaire de l'étape 1, affichage côté agents, et le
diagramme de classes du mémoire.

### 3.2 Préjudices multiples

> « Quelqu'un peut avoir à la fois un préjudice financier, moral et un autre. »

`citoyen/index.html` l.258 propose un `select` avec une option
« Plusieurs de ces préjudices ». On peut donc **déclarer** la pluralité sans
dire **lesquels**.

Remplacer par des cases à cocher. Le stockage peut passer par `JSONB`, comme
`reponses_questionnaire` le fait déjà — pas de changement de schéma nécessaire.

---

## 4. Saisie — assister sans bloquer **[E]**

> « Il ne faut pas forcément bloquer. Parfois les gens ne connaissent pas tout
> ce qu'ils doivent mettre dedans, c'est après l'audition qu'on le fait. »

Principe à retenir : le dépôt du citoyen est un **premier récit**, pas un acte
juridique abouti. La plainte formelle est rédigée par l'enquêteur après
l'audition, avec les qualifications légales.

- Le taux de complétude doit rester **indicatif** — ne jamais conditionner la
  soumission. *(conforme aujourd'hui : aucun verrou sur le score)*
- `pvExiste()` exige déjà que l'audition ait eu lieu avant qu'un PV existe —
  cohérent avec cette logique, à conserver.
- **Seul verrou à revoir** : quartier hors ressort couvert. Le transformer en
  **réorientation** vers le commissariat compétent le plus proche, plutôt qu'en
  refus de dépôt.

### Ne pas faire ressaisir ce qui est connu **[E]**

> « Tout ce qui est déjà connu dans la base ne doit plus être saisi. Il faut
> toujours que le système fasse des sélections. »

Partiellement acquis : le questionnaire de l'étape 4 écarte les questions déjà
couvertes par le récit. À étendre aux données de profil du plaignant.

---

## 5. Convocation — acheminement **[E]**

L'envoi par courriel ou SMS est jugé pertinent, avec une réserve : le numéro ou
l'adresse ne sont pas toujours disponibles.

- `js/config.js` porte `SMS_ENABLED: false` — aucun envoi n'est effectif.
- Prévoir un mode de repli quand ni téléphone ni courriel ne sont connus.

**Point à clarifier avec l'encadreur** avant de coder : il indique que la
convocation est remise au plaignant qui la transmet *par voie d'huissier*,
alors que le compte rendu d'entretien dit que le plaignant la remet
lui-même. Les deux versions n'ont pas les mêmes conséquences.

---

## 6. Extensibilité — gendarmerie et autres corps **[E]**

> « Le système de plainte n'est pas seulement propre à la police, la
> gendarmerie aussi en a un. […] Le format de certains documents peut changer. »

Consigne : rester concentré sur la police, mais **concevoir en prévision**.

- Rendre le format des documents produits paramétrable selon le corps
  (en-tête, intitulés, mentions légales).
- Ne pas coder « commissariat » en dur dans les libellés des documents.

---

## 7. Dette technique relevée à l'audit **[A]**

### 7.1 Les pages n'utilisent pas Supabase

`js/modules/data.js` (96 Ko) est un jeu de **données fictives** codé en dur, et
c'est de là que lisent toutes les pages. Le schéma (`schema.sql`, 401 lignes,
RLS par rôle) et le seed sont écrits et cohérents, mais les trois fichiers de
`js/services/` ne sont appelés par **aucune page** — code mort.

### 7.2 Champ `score` devenu inutilisé côté agents

Depuis la distinction entre *complétude de la déclaration* (citoyen) et
*avancement du dossier* (commissariat), le champ `score` des dossiers de
démonstration n'est plus lu par les espaces agents. C'est voulu, mais la donnée
reste dans le jeu de test sans usage.

---

## 8. Ce que demande l'encadreur et qui ne dépend pas du code

### Validation extérieure **[E]**

> « Je serais beaucoup plus rassuré si cette application avait eu une
> validation extérieure du point de vue des personnes qui travaillent dans le
> domaine. »

À lancer **sans attendre**, c'est le point qui demande le plus de délai : faire
relire la plateforme par un personnel d'un des deux commissariats visités
(Ngoa-Ekélé ou Mimboman) et obtenir une note écrite, même brève.

---

## Ordre de traitement suggéré

| Priorité | Point | Effort |
|---|---|---|
| 1 | Révoquer la clé Groq (§1.1) | minutes |
| 2 | Lancer la demande de validation extérieure (§8) | à lancer aujourd'hui |
| 3 | En-têtes, cachet, signature des documents (§2) | 1 à 2 jours, fort effet en démo |
| 4 | Préjudices en cases à cocher (§3.2) | quelques heures |
| 5 | Vérification du mot de passe agent (§1.2) | quelques heures |
| 6 | Réorientation au lieu du blocage (§4) | quelques heures |
| 7 | Motifs cumulés (§3.1) | changement de schéma, 1 jour |
| 8 | Paramétrage par corps (§6) | à esquisser seulement |
