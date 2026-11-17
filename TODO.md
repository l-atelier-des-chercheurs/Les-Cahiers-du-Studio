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
- **Éditeur de texte** : Markdown brut, c'est-à-dire un textarea avec un rendu Markdown.
- **Repère** : un média sans fichier, avec seulement un `.meta.txt` et `$type: "marker"`.
- **Embed** : comme dans dodoc, un fichier `.txt` qui contient l'URL, avec `$type: "url"`. adc-core génère la vignette à partir de l'image `og:image` de la page. Ne pas mettre de champ `url` dans le meta : à l'import, adc-core le prend pour un fichier à télécharger.
- **`date_timeline`** : type `datetime` (adc-core 0.2.5), stocké comme `$date_created` (`2026-11-17T13:32:05.250Z`, en UTC). Le type `date` ne garde que le jour. Le client envoie une date ISO ou un horodatage en millisecondes.
- **Vue Tableau** : elle fera partie de la v3. Ses champs sont réservés dès maintenant dans le schéma des médias, même sans interface.
- **Droits d'écriture** : les contributeurs du cahier, via `$admins` / `$contributors` d'adc-core.
- **Droits de lecture** : chaque cahier est public ou privé, et privé veut dire réservé à ses contributeurs.
- **Statut d'un média** : visible tout de suite après l'import, comme en v2. Cela veut dire qu'on ne garde pas le `$status: "private"` qu'adc-core met par défaut.
- **Bornes de la timeline** : `start` et `end` sont facultatifs. Sans eux, la timeline va du premier au dernier média.
- **`date_timeline` à l'import** : la fenêtre d'import propose de choisir entre la date de l'import et la date du fichier (EXIF, sinon date de modification).
- **Options du +** : Texte, Repère, Embed/lien, Image, Vidéo, Audio, Fichier, et le glisser-déposer.
- **Apparence** : une nouvelle base sobre et neutre, à affiner plus tard. On ne reprend pas le style v2.
- **Langue** : français seulement, mais tous les textes passent par vue-i18n dès le départ.

## 0. Figer le schéma avant d'installer des VPS

Les VPS installés maintenant ne doivent pas demander de migration v3 → v3'.

- [x] Cahiers : `title`, `description`, `start` et `end` (type `date`, facultatifs). La visibilité passe par le `$status` d'adc-core (`public` ou `private`), donc aucun champ à ajouter.
- [x] Médias : `date_timeline` (`datetime`), `caption`, `keywords`, `color`. Les auteurs passent par `$authors`, géré par adc-core.
- [x] Vue Tableau : champs réservés `tableau_x`, `tableau_y`, `tableau_w`, `tableau_h` (type `number`)
- [x] Médias sans fichier : rien à ajouter au schéma (voir Décisions)
- [ ] Le client doit toujours envoyer `$status` explicitement. adc-core met `private` par défaut, aussi bien sur les dossiers que sur les fichiers.
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
- [ ] Gérer les contributeurs d'un cahier
- [ ] Ouvrir un cahier (route `/cahiers/:slug`)
- [x] Connexion minimale : choix d'un auteur et mot de passe
- [ ] Création d'auteur, et saisie du mot de passe général quand l'instance en a un

## 2. Bouton + et import

Reprendre le bouton + de la v2 (`ImportMedias.vue`) : un bouton rond qui déplie ses options.

- [ ] Option **Texte** : crée directement un média texte et ouvre la fenêtre d'édition
- [ ] Option **Repère** : crée un média vide daté à maintenant
- [ ] Option **Embed** : URL externe
- [ ] Options **Image / Vidéo / Audio / Fichier** : sélecteur de fichiers (`accept` et `capture` adaptés, sélection multiple)
- [ ] Glisser-déposer des fichiers sur le bouton +
- [ ] Fenêtre d'import (reprendre `UploadFileModal.vue`) :
  - [ ] Liste des fichiers sélectionnés, avec aperçu
  - [ ] Progression de l'envoi pour chaque fichier
  - [ ] Bouton « Importer tous les fichiers »
  - [ ] Gestion des erreurs (taille maximale, type refusé)
- [ ] Choix de `date_timeline` dans la fenêtre d'import : date de l'import ou date du fichier (EXIF, sinon date de modification)

## 3. Timeline

- [ ] Afficher les médias du cahier triés par `date_timeline`, entre `start` et `end`, ou du premier au dernier média si ces dates sont absentes
- [ ] Graduations des jours et des heures, et repère « maintenant »
- [ ] Vignettes avec `thumbURL()`, rendu adapté à chaque type (image, vidéo, audio, texte, repère, embed, fichier)
- [ ] Mise à jour en temps réel par socket (ajout, modification, suppression), sans recharger la page
- [ ] Faire défiler jusqu'à un média qu'on vient d'ajouter
- [ ] Cliquer sur un média ouvre la fenêtre d'édition

## 4. Fenêtre d'édition d'un média

Reprendre `EditMedia.vue`, réduit à :

- [ ] Aperçu du média : image zoomable, lecteur vidéo ou audio, éditeur Markdown pour les textes, URL pour les embeds
- [ ] `date_timeline` : date et heure
- [ ] `caption`
- [ ] `keywords`
- [ ] `color`
- [ ] Auteurs
- [ ] Supprimer le média (avec confirmation intégrée à la page)
- [ ] À voir plus tard : `public`, options de tuile (`action_on_tile_click`, lien externe), découpe et optimisation vidéo

## 5. Mise en ligne

- [ ] `npm run build` dans `client-vue3/` produit `dist/`, servi par adc-core
- [ ] Procédure d'installation sur un VPS (Node, `settings.json`, contentPath, HTTPS / reverse proxy)
- [ ] Tester sur un VPS réel avec quelques utilisateurs

## Questions ouvertes

-
