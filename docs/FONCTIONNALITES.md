# Les Cahiers du Studio v3 — fonctionnalités

État au 18 novembre 2026 (branche `v3`, client `client-vue3/`).
Référence pour écrire la documentation : ce que l'on voit et ce que l'on peut faire, écran par écran. La dernière partie liste ce qui n'est pas encore fait.

## Général

- Application en français. Tous les textes passent par la traduction, pour pouvoir ajouter d'autres langues plus tard.
- **Avertissement à l'ouverture** : à chaque visite, une fenêtre « En préparation » indique que l'application est en cours de préparation. Elle donne une adresse de contact et se ferme avec « Compris ».
- **Connexion perdue** : si le serveur ne répond plus, un bandeau rouge en haut de l'écran indique que les contenus ne sont pas modifiables. Le bouton **+** est alors désactivé.
- **Temps réel** : ce que les autres ajoutent, modifient ou suppriment (cahiers, médias, dates) apparaît sans recharger la page.

## Comptes et droits

- **Se connecter** : choisir son nom dans la liste des auteurs, puis saisir son mot de passe. La connexion est gardée entre deux visites (30 jours par défaut).
- **Se déconnecter** : depuis la page d'accueil, sous « Connecté avec le compte : … ».
- **Créer des cahiers** : réservé aux administrateurs de l'instance.
- **Modifier un cahier, y ajouter des médias** : réservé à ses administrateurs et à ses contributeurs. La personne qui crée un cahier en devient administratrice.
- **Cahier public** : visible par tous les visiteurs, connectés ou non.
- **Cahier privé** : visible seulement par ses contributeurs. Il n'apparaît pas dans la liste pour les autres. Il s'ouvre dès qu'un contributeur se connecte.

## Page d'accueil

- **Nom et présentation** de l'instance (sinon, la présentation par défaut des Cahiers du Studio).
- **« Plus d'informations »** : déplie la présentation complète, les partenaires de la v3, et les liens vers la documentation et le contact.
- **Liste des cahiers**, les plus récents en premier. Chaque cahier affiche :
  - son titre ;
  - la mention « privé » s'il l'est ;
  - sa date de création et sa dernière modification ;
  - un bouton « Ouvrir ».
- **Recherche par nom** : ne tient compte ni des majuscules ni des accents (« elise » trouve « Élise »).
- **Créer un cahier** (administrateurs) : fenêtre avec le titre et une case « Privé ».
  - Deux cahiers ne peuvent pas avoir le même titre.
  - Certains titres sont réservés.
  - Après la création, le cahier s'ouvre.

## Page d'un cahier

- **Adresse** : le cahier est à la racine du site, par exemple `https://…/rencontres`.
- **En-tête** : retour à l'accueil, titre du cahier, choix de l'affichage, Timeline ou Grille, par deux pictogrammes (leur nom s'affiche au survol).
- Le choix d'affichage fait partie de l'adresse. La grille est à `?vue=grille`, ce qui permet de partager un lien vers l'une ou l'autre vue.

### Timeline (affichage par défaut)

- **Sens de lecture** : les jours se suivent de gauche à droite. La molette de la souris fait défiler horizontalement.
- **Ouverture** : la timeline s'ouvre sur les médias les plus récents, à droite.
- **Étendue** : du premier au dernier média. Si le cahier a des dates de début et de fin, la timeline les couvre aussi.
- **Chaque jour** commence par sa date écrite verticalement sur un filet gris. Une pastille noire donne le nombre de médias du jour.
- **Médias** : placés en colonnes, de haut en bas puis de gauche à droite, sur des lignes de portée grises. Le nombre de médias par colonne s'adapte à la hauteur de la fenêtre.
- **Repères** : ils découpent la journée en parties. Chacun est une étiquette verticale avec son heure et sa légende, dans sa couleur s'il en a une.
- **Jours vides** : une vague grise, un demi-cercle par jour vide. Au-delà de 7 jours, la vague s'arrête à 7 et l'écart est écrit à côté : « 2 semaines plus tard… », « 3 mois plus tard… », « 2 ans plus tard… ». Au survol, le nombre de jours écoulés jusqu'au jour suivant (« 11 jours »).
- **Replier un jour** : un clic sur la date du jour cache ses médias.
  - Le jour replié devient une étiquette entourée de noir, sur un filet noir, avec la mention « Déplier » en petit et en gris.
  - Un nouveau clic le déplie.
  - Sur un jour déplié, « Replier » apparaît au survol (pas sur écran tactile : il suffit de toucher la date).
  - Les jours repliés sont gardés dans le navigateur, pour chaque cahier : ils restent repliés à la visite suivante.

### Grille

- Tous les médias, du plus ancien au plus récent, groupés par jour.
- Le titre de chaque jour reste visible en haut pendant le défilement, avec le nombre de médias.
- Le nombre de colonnes s'adapte à la largeur de l'écran.

### Vignettes des médias (dans les deux vues)

- **Image, PDF, lien** : la vignette (pour un lien, l'image d'aperçu de la page).
- **Vidéo** : la première image, avec un symbole de lecture.
- **Son** : la forme d'onde.
- **Texte** : le début du texte, qui s'estompe en bas (« Texte vide » s'il n'y a rien).
- **Repère** : un rond (dans la grille ; dans la timeline, voir plus haut).
- **Autre fichier** : son extension.
- **En haut à gauche** : une pastille de la couleur de l'auteur, puis la légende s'il y en a une (pour un lien, le nom du site). La couleur vient du nom de l'auteur : chaque auteur a toujours la même.
- **Au survol** : une ombre, et une bulle avec l'heure, le type, l'auteur et la légende.

## Fenêtre d'un média

- S'ouvre en cliquant sur un média, dans la timeline ou la grille, ou sur un repère de la timeline. Au clavier : Tab jusqu'au média, puis Entrée.
- **À gauche, le média en grand** :
  - **image** : entière ; un clic l'affiche à sa taille réelle (on peut alors la faire défiler), un autre clic la réduit ;
  - **vidéo, son** : lecteur, avec la forme d'onde pour un son ;
  - **texte** : écrit en Markdown à gauche, rendu à droite (titres, gras, italique, listes, liens) ;
  - **lien** : l'image d'aperçu de la page, et « Ouvrir le lien » dans un nouvel onglet ;
  - **PDF** : affiché dans la fenêtre ;
  - **repère** : son rond et son étiquette ;
  - **autre fichier** : son nom et son extension.
- **Flèches ← et →** (sur les bords du média, ou au clavier) : média précédent ou suivant, dans l'ordre de la timeline.
- **À droite, ses informations** (modifiables par les contributeurs du cahier, en lecture seule pour les autres) :
  - nom du fichier ;
  - adresse, pour un lien ;
  - légende (« Étiquette » pour un repère) ;
  - date sur la timeline, avec des raccourcis : « Capturé/créé le » (ou « Date du fichier »), « Date de l'import », « Maintenant » ;
  - mots-clés, avec des suggestions tirées des mots-clés déjà utilisés dans le cahier (Entrée ou virgule pour ajouter) ;
  - couleur, parmi 8 couleurs claires (la couleur d'un repère colore son étiquette dans la timeline) ;
  - auteurs, avec leur pastille de couleur.
- **Télécharger** le fichier, **Supprimer** le média (avec une confirmation dans la fenêtre).
- **Enregistrer et fermer** : enregistre les modifications. Si on ferme ou change de média sans enregistrer, la fenêtre propose d'enregistrer, de ne pas enregistrer ou d'annuler.
- Ouvrir un média le compte comme vu (il perd son contour vert).
- Un texte créé avec le bouton + ouvre directement sa fenêtre, pour l'écrire.

## Ajouter des médias : le bouton +

- Un bouton rond **+** en bas à droite. Il n'apparaît que pour les contributeurs du cahier.
- Il déplie 7 options, dont le nom s'affiche au survol (toujours visible sur écran tactile) :
  - **Texte** : crée un texte vide et ouvre sa fenêtre pour l'écrire.
  - **Repère** : crée un repère daté de maintenant.
  - **Lien** : demande une adresse web. Le lien est ajouté au cahier avec l'image d'aperçu de la page.
  - **Image**, **Vidéo**, **Audio**, **Fichier** : ouvrent le sélecteur de fichiers, avec plusieurs fichiers possibles. Sur téléphone, le sélecteur propose aussi l'appareil photo ou le micro.
- **Glisser-déposer** : quand on fait glisser des fichiers sur la page, le bouton + s'agrandit (« Déposez vos fichiers ici »).
- Le menu se ferme avec Échap ou un clic ailleurs.
- **Après création** : un texte, un repère ou un lien apparaît aussitôt, et l'affichage défile jusqu'à lui.
- **Nouveaux médias en évidence** : tout média ajouté depuis ce navigateur (texte, repère, lien, fichier importé) est entouré de vert tant qu'il n'a pas été vu.
  - Il compte comme vu quand on le survole ou le touche, ou après 2 secondes à l'écran. Pendant ces 2 secondes, le contour s'efface progressivement ; s'il quitte l'écran avant, le contour revient.
  - Le décompte attend tant que l'onglet est en arrière-plan ou qu'une fenêtre est ouverte par-dessus.
  - Un jour replié qui contient des médias pas encore vus a un anneau vert autour de son nombre de médias.
  - La liste des médias pas encore vus est gardée dans le navigateur, pour chaque cahier.
- **Auteur** : chaque média ajouté est attribué à la personne connectée. Il est visible tout de suite par les visiteurs du cahier.

## Fenêtre d'import des fichiers

- S'ouvre au centre de l'écran dès que des fichiers sont choisis ou déposés.
- **Envoi** : les fichiers partent un par un, automatiquement.
  - Chaque fichier affiche un aperçu, son nom, son poids, son état (en attente, envoi en %, importé, échec) et une barre de progression.
  - L'en-tête compte les fichiers importés (« 3 / 7 »).
- **En cas d'échec** : bouton « Réessayer ». Si le fichier est trop lourd, la taille maximale est indiquée.
- **Métadonnées** : une fois le fichier envoyé, le bouton « Métadonnées » affiche ce que le serveur a lu dans le fichier :
  - type, dimensions, durée, poids ;
  - lieu (coordonnées GPS) ;
  - date de capture ou du fichier, date d'import ;
  - auteurs.
- **Date sur la timeline**, à choisir pour chaque fichier :
  - **Capturé/créé le** (« Date du fichier » pour les documents) : choisi par défaut. C'est la date de prise de vue ou d'enregistrement quand le fichier la contient, sinon sa date de modification.
  - **Date de modification** : proposée quand elle diffère de la date de capture.
  - **Date de l'import**.
  - **Date personnalisée** : ouvre un champ date et heure.
  - Le choix est enregistré tout de suite, et la timeline se met à jour.
- **Terminer** : ferme la fenêtre une fois tous les envois finis. L'affichage défile jusqu'au plus ancien des médias importés (et déplie son jour s'il était replié).
- **Fermer pendant un envoi** : la fenêtre demande de « Continuer l'import » ou d'« Arrêter les envois ».

## Pas encore fait

- Fenêtre d'un média : changer l'adresse d'un lien ne met pas encore son aperçu à jour.
- Modifier ou supprimer un cahier. Description, début et fin à la création.
- Gérer les contributeurs d'un cahier.
- Créer un compte. Saisir le mot de passe général de l'instance.
- Afficher les dates et la couverture des cahiers dans la liste d'accueil.
- Dans la timeline : graduations des heures, repère « maintenant ».
- Refus d'un type de fichier dans la fenêtre d'import.
- Hors périmètre pour l'instant : chats, stop motion, capture caméra et micro intégrée, journal, écriture collaborative, vue Tableau, export PDF ou vidéo, filtres, calendrier, raccourcis clavier, migration des contenus v2.
