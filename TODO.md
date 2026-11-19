# TODO — Les Cahiers v3, objectif court terme

## Objectif

Avoir un client Vue 3 (`client-vue3/`) utilisable sur un VPS pour la boucle de base :

1. créer un cahier ;
2. ajouter des médias avec le bouton **+** et ses options, qui ouvrent une fenêtre d'import ;
3. voir les médias apparaître automatiquement dans la timeline du cahier ;
4. modifier un média dans une fenêtre d'édition.

Tant que cette boucle n'est pas solide, tout le reste attend.

## Hors périmètre (pour l'instant)

- Chats, stopmotion, capture caméra/micro intégrée, journal
- WriteUp collaboratif (ShareDB)
- Vue Tableau (grille) et vue Liste
- Export PDF / vidéo, QR codes
- Filtres, calendrier, raccourcis clavier « boîtier »
- Migration des contenus v2

## Décisions (17/11/2026)

- **Médias texte** : un vrai fichier `.md` avec son `.meta.txt`. adc-core lui donne `$type: "text"` et expose son contenu dans `$content`.
- **Éditeur de texte** : un éditeur Quill basique, comme en v2, qui enregistre du HTML. Les textes en Markdown (premières alphas, fichiers importés) restent affichés comme Markdown.
- **Repère** : un média sans fichier, avec seulement un `.meta.txt` et `$type: "marker"`.
- **Embed** : comme dans dodoc, un fichier `.txt` qui contient l'URL, avec `$type: "url"`. adc-core génère la vignette à partir de l'image `og:image` de la page. Ne pas mettre de champ `url` dans le meta : à l'import, adc-core le prend pour un fichier à télécharger.
- **`date_timeline`** : type `datetime` (adc-core 0.2.5), stocké comme `$date_created` (`2026-11-17T13:32:05.250Z`, en UTC). Le type `date` ne garde que le jour. Le client envoie une date ISO ou un horodatage en millisecondes.
- **Vue Tableau** : elle fera partie de la v3. Ses champs sont réservés dès maintenant dans le schéma des médias, même sans interface.
- **Droits d'écriture** : les contributeurs du cahier, via `$admins` / `$contributors` d'adc-core.
- **Droits de lecture** : chaque cahier est public ou privé, et privé veut dire réservé à ses contributeurs.
- **Statut d'un média** : visible tout de suite après l'import, comme en v2. Cela veut dire qu'on ne garde pas le `$status: "private"` qu'adc-core met par défaut.
- **Bornes de la timeline** : `start` et `end` sont facultatifs. Sans eux, la timeline va du premier au dernier média.
- **`date_timeline` à l'import** : par défaut la date de capture (EXIF, sinon date de modification). Pour chaque fichier, la fenêtre d'import propose aussi la date de modification, la date de l'import ou une date personnalisée.
- **Options du +** : Texte, Repère, Embed/lien, Image, Vidéo, Audio, Fichier, et le glisser-déposer.
- **Apparence** : une nouvelle base sobre et neutre, à affiner plus tard. On ne reprend pas le style v2.
- **Langue** : français seulement, mais tous les textes passent par vue-i18n dès le départ.

## 0. Figer le schéma avant d'installer des VPS

Les VPS installés maintenant ne doivent pas demander de migration v3 → v3'.

- [x] Cahiers : `title`, `description`, `start` et `end` (type `date`, facultatifs). La visibilité passe par le `$status` d'adc-core (`public` ou `private`), donc aucun champ à ajouter.
- [x] Médias : `date_timeline` (`datetime`), `caption`, `keywords`, `color`. Les auteurs passent par `$authors`, géré par adc-core.
- [x] Taille d'un média : `w` et `h` (type `number`), en cases de la grille, comme en v2. Redimensionnée dans la timeline, partagée par les vues à venir (Tableau comprise)
- [x] Vue Tableau : champs réservés `tableau_x`, `tableau_y` (type `number`) pour la position
- [x] Médias sans fichier : rien à ajouter au schéma (voir Décisions)
- [x] Le client doit toujours envoyer `$status` explicitement. adc-core met `private` par défaut, aussi bien sur les dossiers que sur les fichiers. (Cahiers, fichiers importés, textes, repères, liens : vérifié.)
- [ ] Décider des autres champs v2 à reprendre ou à abandonner : `action_on_tile_click`, `url_to_open_in_new_tab`, `collapsed`

### Problèmes d'adc-core

- [x] **Droits trop larges** (corrigé en 0.2.3) : avec `$can_be_created_by: "logged-in"`, `_canContributeToFolder` laisse passer tout auteur connecté sur les routes des fichiers *dans* un cahier. `makePathFromReq` remplit aussi `path_to_type` pour ces routes. N'importe quel auteur connecté peut donc envoyer, modifier et supprimer des médias dans tous les cahiers, et lire les cahiers privés. Dans dodoc, `authors` (`everyone`) et `chats` (`logged-in`) sont concernés de la même façon.
- [ ] **Liste qui laisse voir les cahiers privés** : `GET /_api2/cahiers` renvoie tous les cahiers, privés compris (titre, description, couverture). Voir le `// todo` dans `_getFolders`. Ouvrir un cahier privé, lui, est bien protégé par `_restrictIfPrivate`.
- [x] **Type `datetime`** (ajouté en 0.2.5) : stocké comme `$date_created`, en UTC avec les millisecondes. Cahiers dépend maintenant d'adc-core `^0.2.5`.

## 1. Cahiers

- [x] Page d'accueil : liste des cahiers, mise à jour par la room `cahiers`. Les cahiers privés ne sont montrés qu'à leurs contributeurs.
- [ ] Afficher les dates et la couverture dans la liste
- [x] Bouton « Créer un cahier » et fenêtre de création (titre, case Privé)
- [ ] Ajouter à la création : description, début et fin facultatifs
- [ ] Modifier et supprimer un cahier
- [x] Cahier ouvert à tous (`$contributors: "everyone"`), à la création : contributions sans compte, avec un nom facultatif (`$credits`) retenu par le navigateur
- [ ] Gérer les contributeurs d'un cahier
- [x] Ouvrir un cahier (à la racine : `/<slug>`, comme en v2)
- [x] Connexion minimale : choix d'un auteur et mot de passe
- [ ] Création d'auteur, et saisie du mot de passe général quand l'instance en a un

## 2. Bouton + et import

Reprendre le bouton + de la v2 (`ImportMedias.vue`) : un bouton rond qui déplie ses options.

- [x] Option **Texte** : crée directement un média texte et ouvre sa fenêtre
- [x] Option **Repère** : crée un média vide daté à maintenant
- [x] Option **Embed** : URL externe, saisie dans une petite fenêtre
- [x] Options **Image / Vidéo / Audio / Fichier** : sélecteur de fichiers (`accept` adapté, sélection multiple). Pas de `capture` : sur téléphone, il ouvrirait seulement l'appareil photo, sans proposer les fichiers existants.
- [x] Glisser-déposer des fichiers sur le bouton +
- [x] Fenêtre d'import (`UploadFilesModal.vue`, d'après `UploadFile.vue` v2) :
  - [x] Liste des fichiers sélectionnés, avec aperçu
  - [x] Progression de l'envoi pour chaque fichier, envois un par un
  - [x] Métadonnées lues par adc-core affichées dès l'envoi (type, dimensions, durée, poids, lieu, dates, auteurs)
  - [x] Envoi automatique de tous les fichiers à l'ouverture (comme en v2), « Réessayer » en cas d'échec
  - [ ] Gestion des erreurs (taille maximale : fait ; type refusé)
- [x] Choix de `date_timeline` dans la fenêtre d'import : par défaut la date de capture (EXIF, sinon date de modification), sinon date de modification, date de l'import ou date personnalisée, fichier par fichier

## 3. Timeline

- [x] Deux vues, au choix dans l'en-tête du cahier : Timeline (par défaut) et Grille (`?vue=grille`)
- [x] Timeline (`MediaTimeline.vue`, d'après `TimelineView.vue` v2) : jours de gauche à droite, médias en colonnes, repères qui découpent la journée, jours vides regroupés à partir de 3
- [x] Grille (`MediaGrid.vue`) : médias dans l'ordre de `date_timeline`, groupés par jour
- [x] Afficher les médias du cahier triés par `date_timeline`, entre `start` et `end`, ou du premier au dernier média si ces dates sont absentes
- [ ] Graduations des jours (fait) et des heures, et repère « maintenant »
- [x] Vignettes avec `thumbURL()`, rendu adapté à chaque type (image, vidéo, audio, texte, repère, embed, fichier)
- [x] Mise à jour en temps réel par socket (ajout, modification, suppression), sans recharger la page
- [x] Faire défiler jusqu'à un média qu'on vient d'ajouter (Texte, Repère, Lien, et fichiers importés à la fermeture de la fenêtre d'import)
- [x] Médias ajoutés depuis ce navigateur entourés de vert jusqu'à ce qu'on les ouvre
- [x] Cliquer sur un média (ou un repère) ouvre sa fenêtre

- [ ] **Déplacer un média par glisser-déposer** : le déplacer change sa `date_timeline` (pas d'ordre manuel séparé ; le placement libre relève de la vue Tableau, `tableau_x` / `tableau_y`).
  - Étape 1, souris : seuil de quelques pixels pour ne pas gêner le clic, copie semi-transparente de la tuile, ligne d'insertion, les voisins s'écartent (animation existante). Lâché entre deux médias : date entre les leurs ; sur le libellé d'un autre jour : même heure, ce jour-là. Défilement automatique de la timeline près des bords. Enregistrement optimiste, annulé avec notification en cas d'échec (comme la taille).
  - Étape 2, tactile : appui long pour commencer, sans gêner le défilement.
  - À tester sur un vrai cahier : avec des tailles mêlées, le remplissage des trous (dense) peut rendre l'ordre affiché différent de l'ordre des dates, et la ligne d'insertion sauter.

- [ ] **Nouveautés des autres** : le contour vert signale les contributions des autres que l'on n'a pas encore vues (plus les siennes). Après la conférence, pas avant.
  - Point de départ : est nouveau ce qui a été ajouté depuis la première visite du cahier ; tout ce qui existait avant compte comme vu, sinon un cahier de 300 médias serait entièrement entouré.
  - Ses propres contributions ne sont jamais nouvelles (son compte dans `$authors`, ou ajoutées depuis ce navigateur). Le défilement jusqu'à elles après un ajout reste.
  - Un média devient vu quand on l'ouvre dans sa fenêtre, ou par le compteur (ci-dessous).
  - « Tout marquer comme vu », pour le cahier ou pour un jour (à côté de son libellé), pour ne pas laisser s'accumuler les contours.
  - Compteur « 12 nouveaux » dans la barre du haut. Un clic va au nouveau média ajouté le moins récemment, le compte comme vu (sans avoir à l'ouvrir), et le compteur passe à « 11 nouveaux » ; un nouveau clic va au suivant, et ainsi de suite.
  - Sans compte : dans le navigateur, comme aujourd'hui. Avec un compte : dans un champ de l'auteur, pour le retrouver sur tous ses appareils ; ce que le navigateur avait vu est fusionné à la connexion.
  - Format, par cahier : la date de la première visite (ou du dernier « Tout marquer comme vu »), et la liste des médias ouverts depuis. Plus petit qu'une liste de tout ce qui a été vu.
  - À vérifier dans adc-core avant de stocker dans le compte : les champs d'un auteur sont-ils lisibles par les autres ? Si oui, il faut un champ visible par son seul propriétaire (sinon la liste montre ce que chacun a ouvert, et quand).
  - Nouveau champ d'auteur ajouté au schéma (sans migration). Deux appareils à la fois : fusionner avec la dernière version du serveur avant d'enregistrer.
  - Ordre : point de départ et exclusion de ses propres contributions (navigateur seul), puis « Tout marquer comme vu » et le compteur, puis le stockage dans le compte.

## 4. Fenêtre d'édition d'un média

Reprendre `EditMedia.vue`, réduit à (`MediaModal.vue`) :

- [x] Aperçu du média : image zoomable, lecteur vidéo ou audio, éditeur Quill pour les textes (HTML nettoyé à l'affichage), URL pour les embeds, PDF intégré
- [ ] **Textes en `.html`** : le HTML de l'éditeur est enregistré dans un fichier `texte.md`, comme en v2. Il faudrait un vrai `.html`. Il faut d'abord qu'adc-core reconnaisse `.html` comme `$type: "text"` et en expose le contenu dans `$content` (la liste des extensions est dans `server/file.js`). Ensuite, voir s'il faut renommer les textes déjà créés, ou laisser `renderText()` reconnaître le HTML d'après le contenu.
- [x] `date_timeline` : date et heure, avec raccourcis (capture, import, maintenant)
- [x] `caption` (« Étiquette » pour un repère)
- [x] `keywords`, avec suggestions tirées du cahier
- [ ] `color` : champ retiré de la fenêtre pour l'instant (les couleurs déjà enregistrées colorent toujours les repères de la timeline)
- [x] Auteurs
- [x] Supprimer le média (avec confirmation intégrée à la page)
- [x] Télécharger, médias précédent / suivant (flèches et clavier), avertissement si modifications non enregistrées
- [x] Un texte créé avec le + ouvre directement sa fenêtre
- [ ] Changer l'URL d'un lien ne régénère pas encore son aperçu (route `_regenerateThumbs` d'adc-core)
- [ ] À voir plus tard : `public`, options de tuile (`action_on_tile_click`, lien externe), découpe et optimisation vidéo

## 5. Mise en ligne

- [x] `npm run build` dans `client-vue3/` produit `dist/`, servi par adc-core. Compilé et versionné par `npm version` (preversion), comme dodoc
- [x] Procédure d'installation sur un VPS (Node, `settings.json`, contentPath, HTTPS / reverse proxy) : `docs/INSTALL-VPS.md`
- [ ] Tester sur un VPS réel avec quelques utilisateurs

## Questions ouvertes

-
