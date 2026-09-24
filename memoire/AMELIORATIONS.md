# PlainteCam — Améliorations côté mémoire et présentation

État au 28 août 2026 · Mémoire : 61 pages, 0 erreur de compilation ·
Présentation : 30 diapositives.

Sources : **[E1]** remarque écrite de l'encadreur sur les tableaux et figures ·
**[E2]** message vocal de l'encadreur · **[A]** relevé lors de l'audit.

---

## 1. Contradiction à lever avant tout le reste **[E2]**

### La remise de la convocation

L'encadreur affirme :

> « On remet la convocation au plaignant et le plaignant envoie souvent la
> convocation **par voie d'huissier**. C'est vrai aussi que même l'enquêteur
> peut transmettre la convocation. »

Le compte rendu d'entretien dit autre chose :

> « C'est **en principe le plaignant lui-même** qui remet la convocation au mis
> en cause. Un policier ne l'assiste que s'il redoute des représailles. »

Le mémoire a bâti un argument entier sur la seconde version. Si la pratique
passe par un huissier, il n'y a pas d'exposition directe de la victime, et
l'argument s'affaiblit considérablement.

**Passages concernés :**

| Emplacement | Contenu à revoir |
|---|---|
| `chapters/01_diagnostic.tex` §1.2.2 | « Convocation et suivi » — le fait présenté comme déterminant |
| `chapters/01_diagnostic.tex` §1.5 | « **Un problème de sécurité pour le plaignant** » — l'un des quatre problèmes fondamentaux |
| `chapters/01_diagnostic.tex` §1.4 | mention dans les menaces du SWOT rédigé |
| `chapters/03_bilan.tex` | ligne du tableau de résultats : « Remise de la convocation — À la charge du plaignant » |
| `diapositive/soutenance.tex` | **diapositive 9 entière** : « Le constat qui a orienté toute la conception » |

**À faire :** demander l'arbitrage à l'encadreur en citant le compte rendu. Puis
soit préciser dans le mémoire que l'huissier est la voie de droit mais que
l'observation terrain montre une remise directe, soit désamorcer les cinq
passages.

---

## 2. Tableaux et figures **[E1]**

> « On ne peut pas avoir une section ou une sous-section dont le seul contenu
> c'est un tableau et pas de texte, et pourtant tous les tableaux et figures
> doivent être cités, décrits et commentés. Vous devez rédiger des paragraphes. »

### 2.1 Flottants jamais cités par `\ref` — 26 restants

Audit : **26 flottants sur 36** n'ont aucun renvoi dans le texte.

| Fichier | Non cités |
|---|---|
| `chapters/02_realisation.tex` | **11** |
| `chapters/01_diagnostic.tex` | **6** |
| `chapters/05_annexes.tex` | **7** |
| `chapters/00_introduction.tex` | 1 — `tab:objectifs` |
| `chapters/03_bilan.tex` | 1 — `tab:resultats` |

Modèle à suivre : les **sept figures du chapitre 3** sont déjà conformes
(annonce avec renvoi, description, puis interprétation).

Le script d'audit est dans le scratchpad de session (`audit_floats.py`) —
à relancer après correction pour vérifier.

### 2.2 Sections encore sans prose — 3 restantes

| Emplacement | État |
|---|---|
| §1.4 « Analyse SWOT » | ✅ **fait** — tableau supprimé, remplacé par 5 paragraphes avec croisements |
| `02_realisation.tex` §2.3.3.1 « Diagramme de cas d'utilisation » | ❌ figure seule, 0 caractère |
| `05_annexes.tex` Annexe C « Fiches de tests » | ❌ tableau seul |
| `05_annexes.tex` Annexe D « Glossaire technique » | ❌ tableau seul |

**Nuance à défendre pour les annexes :** la convention y est plus faible. Une
annexe est un dépôt de matière brute, et la consigne demande explicitement
« extraits de code, fiches de tests » en annexe. Une phrase d'amorce par annexe
suffit ; un commentaire par tableau serait du remplissage.

### 2.3 Quatre flottants à supprimer plutôt qu'à commenter **[A]**

Test simple : essayer d'écrire ce qu'un logo *démontre*. Si c'est impossible,
le flottant est décoratif.

- `images/react.png` — logo React (ch. 2)
- `images/grok_ai.png` — logo IA (ch. 2)
- `images/flask.png` — logo Flask (ch. 2, bloc `\IfFileExists`)
- `images/localisation.jpg` — carte sans aucun nom d'entreprise (ch. 1)

Gain : 4 commentaires en moins à écrire, et environ 1 page.

---

## 3. Conséquences des remarques sur l'application **[E2]**

### 3.1 Motifs et préjudices cumulés

Le modèle ne permet qu'une seule qualification par plainte
(`type_infraction` est un énuméré simple). À répercuter :

- `chapters/02_realisation.tex` §2.4.3 — tableau des entités
- `diagrammes/classe.puml` — cardinalité entre `Plainte` et l'infraction
- §2.4.1 — description de l'étape 1 du parcours

Tant que le code n'est pas modifié, l'honnêteté commande de le **signaler comme
limite** au chapitre 3 plutôt que de décrire une capacité inexistante.

### 3.2 Le test T-03 annonce un blocage

`chapters/05_annexes.tex`, Annexe C : « Sélection d'un quartier hors ressort
couvert → **dépôt bloqué** ». C'est le seul verrou documenté, et il contredit le
principe posé par l'encadreur (« assister sans bloquer »). À reformuler en
**réorientation** vers le commissariat compétent.

### 3.3 Perspectives — gendarmerie et autres corps

> « Ton application peut être étendue à d'autres corps de métier. […] Ça montre
> que tu as suffisamment pensé ton travail, que tu te projettes. »

- `chapters/04_conclusion.tex` — ajouter aux perspectives
- `chapters/02_realisation.tex` — une phrase indiquant que le format des
  documents est conçu pour être paramétrable selon le corps

### 3.4 Validation extérieure

Une note écrite d'un des commissariats visités transformerait le chapitre 3, où
toutes les mesures sont aujourd'hui issues de la **recette** et non de
l'exploitation. C'est la faiblesse la plus exposée du mémoire.

---

## 4. Images restant à produire **[A]**

### 4.1 Encore des schémas d'un autre projet

| Fichier | Problème |
|---|---|
| `images/technique.png` | schéma **HARMONI / Camunda**, sans rapport avec le sujet — utilisé au §2.3.1 comme figure d'architecture |
| `images/problematique_flux.png` | à produire — flux de la procédure papier, idéalement en BPMN |

*(`architecture.png`, `usecase.png`, `classe.png`, `sequence.png` et
`organigramme_klivar.png` sont des diagrammes PlantUML corrects.)*

### 4.2 Douze captures encore occupées par des bouche-trous

Chapitre 3 (7) : `dashboard`, `modelisation`, `configuration`, `task`,
`notification`, `historique`, `avancee`.

Annexe A (5) : `ecran_depot_nature`, `ecran_depot_apercu`, `ecran_suivi`,
`ecran_cotation`, `ecran_pv`.

⚠️ **Tant qu'elles ne sont pas remplacées, le mémoire affiche des écrans
portant le nom « HARMONI » en toutes lettres.**

### 4.3 Diagramme de classes à régénérer

`diagrammes/classe.puml` contient la note sur Supabase Storage, mais le PNG date
d'avant — le fichier était verrouillé par une visionneuse lors de la
régénération. Fermer l'aperçu, puis :

```
cd diagrammes
java -jar plantuml.jar -tpng -charset UTF-8 classe.puml
```

---

## 5. Volume — arbitrage à faire **[A]**

| | |
|---|---|
| État actuel | **61 pages** |
| Cible visée | 55 pages |
| Effet des corrections §2 | **+4 à +6 pages** |
| Effet des suppressions §2.3 | −1 à −1,5 page |
| Projection | **≈ 65 pages** |

Les deux exigences sont incompatibles. À ta place je choisirais celle de
l'encadreur : c'est lui qui note. Si le volume devient un problème, les
gisements identifiés sont, par ordre de rendement :

1. Chapitre 3 — les 7 sous-sections de captures suivent le même moule (**−1 p**)
2. §1.5.1 — reformule le tableau des difficultés du §1.2.3 (**−0,4 p**)
3. §1.1.5 — la liste des 6 rôles redit l'organigramme placé juste dessous (**−0,3 p**)
4. Introduction §Méthodologie — annonce ce que le ch. 2 développe (**−0,3 p**)
5. §1.1.1 à §1.1.3 — prose de plaquette, sans fait vérifiable (**−0,5 p**)

---

## 6. Points de rédaction mineurs **[A]**

- **`full-stack`** — anglicisme employé 3 fois. Pas une faute, mais l'italique
  ou « développement complet » serait plus sûr devant un jury.
- **§1.3 « Ce qui existe ailleurs »** — le paragraphe des « trois enseignements »
  paraphrase la troisième colonne du tableau au lieu de la dépasser. Le tableau
  porte déjà les jugements ; un benchmark gagnerait à rester factuel et à
  laisser l'interprétation au texte. *(laissé en l'état sur ta demande)*
- **`consigne.md` / `consigne.txt`** — doublon dans le dossier, un seul suffit.

---

## 7. À garder en tête

La pile décrite dans le mémoire — **React, Flask, PostgreSQL, Llama 3.1 via
Groq** — ne correspond pas au dépôt `app/`, qui est en **HTML/JS + Supabase**,
sans backend. C'est une décision assumée, prise en connaissance de cause. Mais
si le jury demande à voir le code, l'écart sera visible.

---

## Vérification après chaque série de corrections

```
cd memoire
latexmk -gg -pdf -interaction=nonstopmode -halt-on-error main.tex
```

Contrôler dans `main.log` : `^!` (erreurs), `Overfull` (débordements),
`Reference .* undefined` (renvois cassés). Puis `latexmk -c` pour nettoyer.

Le correcteur orthographique **LanguageTool** est installé
(`language_tool_python`, français, hors ligne). Le script `ortho2.py` du
scratchpad de session extrait la prose des sources LaTeX et localise chaque
remarque au fichier et à la ligne.
