# PlainteCam en local

## Demarrage

Prerequis : Node.js 22.5 ou plus recent.

1. Lancez `npm start` a la racine du projet.
2. Ouvrez <http://127.0.0.1:4173>.
3. Le serveur cree la base SQLite et les dossiers de stockage au premier lancement.

Les donnees sont conservees dans `data/plaintecam.sqlite`, les pieces jointes dans `data/uploads/`, et ces chemins sont ignores par Git. Le serveur ecoute uniquement sur `127.0.0.1`.

## Connexion

Le code local **343982** fonctionne avec les comptes citoyens et le personnel, en plus de chaque code personnel. Il est affiche sur les pages de connexion. Les citoyens se connectent avec leur adresse e-mail ; leur code personnel unique est affiche une seule fois apres l'inscription.

Les comptes locaux du personnel sont crees au premier lancement :

- Commissaire : `SN-2018001`
- Enqueteurs : `SN-2021044`, `SN-2020031`, `SN-2022017`, `SN-2019008`
- Accueil : `SN-2023005`

Saisissez seulement le matricule numerique, selectionnez le role correspondant, puis entrez `343982`. Un commissaire peut creer d'autres comptes dans le registre des agents ; le code personnel genere est affiche une seule fois. `npm run create-agent` permet aussi de creer ou reinitialiser un compte depuis le terminal.

## Fonctions disponibles

- Inscription et connexion locales, gestion du profil, sessions de huit heures et deconnexion.
- Depot, consultation et suivi des plaintes dans SQLite ; les citoyens ne peuvent consulter que leurs propres dossiers.
- Enregistrement vocal, transcription Grok, relecture du texte transcrit et conservation de l'audio original comme piece jointe.
- Ajout et telechargement de pieces jointes stockees sur le disque local.
- Gestion des dossiers, affectations, historique, convocations et proces-verbaux dans les espaces du personnel.
- Audition enquêteur : dictée en direct dans Chrome/Edge, relecture/correction du texte, PV généré à partir de la déposition et sauvegardé avec l'historique dans SQLite ; audio local attaché au dossier.
- Assistance enregistree localement, registre d'audit et administration des comptes.
- Analyse locale de la declaration et suggestion redactionnelle Grok facultative.

## Grok, courriel et SMS

Pour activer les suggestions et la retranscription, placez une clé API dans `key.txt` ou `kexy.txt`, à la racine (`key.txt` est lu en premier). Une clé Groq `gsk_` utilise l'API Groq, le modèle `openai/gpt-oss-20b` pour les suggestions et `whisper-large-v3-turbo` pour l'audio. Une clé xAI est routée vers l'API xAI. Ces fichiers sont ignorés par Git et ne sont jamais servis par HTTP. La dictée en direct de l'enquêteur utilise aussi la reconnaissance vocale du navigateur en contexte sécurisé ; elle fonctionne dans les navigateurs Chromium compatibles, même si le service distant est indisponible. Le bouton de retranscription distante transmet explicitement l'audio au fournisseur configuré ; la transcription navigateur reste disponible comme solution de repli. Le texte citoyen n'est transmis que sur demande de suggestion.

Si le fournisseur indique que la clé est incorrecte, régénérez-la dans sa console et remplacez le contenu du fichier local. Révoquez toute clé qui a été partagée dans un chat ou un dépôt.

Sans cle valide, l'application affiche une erreur explicite pour ces fonctions ; le depot, le stockage local et les autres fonctions restent utilisables. Aucun fournisseur de courriel ou de SMS n'est configure : les codes ne sont pas envoyes par ces canaux, et les convocations sont creees pour impression/remise.

## Sauvegarde

Arretez le serveur avant de copier `data/plaintecam.sqlite` et `data/uploads/`. Conservez également le fichier de clé choisi à part si vous voulez restaurer l'intégration IA.
