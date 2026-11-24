# TODO — fin novembre 2026 : ouvrir l'instance pilote à d'autres

## Objectif

Des personnes ont demandé à utiliser la timeline pour leurs propres projets. On les accueille sur l'instance pilote, https://apcp.latelier-des-chercheurs.fr/, à partir de la semaine du 23 novembre. C'est une instance pilote : elles savent que les choses vont bouger.

Pour cela, chacun doit pouvoir :

1. créer son compte ;
2. créer ses cahiers ;
3. choisir qui peut les voir et y contribuer, et changer ces réglages ensuite ;
4. retrouver l'accès à son compte en cas d'oubli du mot de passe.

Un cahier privé ne doit montrer à personne d'autre ni son titre ni son contenu, ni dans l'API, ni par socket.

## 1. Cahiers privés vraiment privés (adc-core)

Il y a deux fuites aujourd'hui :

- `GET /_api2/cahiers` liste tous les cahiers, y compris les privés (titre, description, couverture). Voir le `// todo` dans `_getFolders`.
- `joinRoom` ne vérifie rien (le `// todo` dans `server/sockets.js`). N'importe qui peut rejoindre la room `cahiers/<slug>` d'un cahier privé et recevoir ses `fileCreated`, `fileUpdated`…

Le client cache déjà ces cahiers (`canSeeFolder`), mais c'est seulement de l'affichage.

### Proposition

Reprise dans `adc-core/TODO.md` (« Private folders », 24/11), avec la vérification du `signup_password` côté serveur (voir le point 2).

On filtre par socket, sur le modèle de la présence (`sendPresence` / `getPresenceFor`), qui envoie déjà à chacun ce qu'il a le droit de voir. Chaque socket a déjà son `token_path`, vérifié à la connexion, et le client se reconnecte (`reconnect()`) quand on se connecte à un compte ou qu'on s'en déconnecte.

- [ ] **Une seule règle**, `canSeeFolder(meta, token_path)` côté serveur : le dossier est public, ou bien `token_path` est admin du dossier, contributeur du dossier, ou admin de l'instance. Elle sert pour la liste, les rooms et les événements.
- [ ] **Liste** : `_getFolders` ne renvoie que les dossiers que le demandeur peut voir.
- [ ] **Rooms** : `joinRoom` refuse la room d'un dossier privé à qui ne peut pas le voir.
- [ ] **Événements de la room du type** (`cahiers`), envoyés socket par socket. Pour chaque socket, on compare ce qu'il voyait avant la modification et ce qu'il voit après :
  - il le voyait et le voit encore → `folderUpdated` (`changed_data`), comme aujourd'hui ;
  - il ne le voyait pas et le voit maintenant (cahier devenu public, ou il vient d'être ajouté comme contributeur) → `folderCreated` avec la meta complète. C'est ce qui manquait : le client n'a pas besoin d'avoir la meta à l'avance, le serveur la lui envoie au moment où il gagne le droit de la voir ;
  - il le voyait et ne le voit plus → `folderRemoved` ;
  - il ne le voyait pas et ne le voit toujours pas → rien.

  Pour savoir ce qu'il voyait avant, la route PATCH lit `$status`, `$admins` et `$contributors` avant de modifier le dossier (la meta est en cache). `folderCreated` et `folderRemoved` suivent la même règle : un cahier créé privé n'est annoncé qu'à ceux qui peuvent le voir.
- [ ] **Room du dossier** : quand quelqu'un perd l'accès (cahier devenu privé, contributeur retiré), son socket sort de la room (`socketsLeave`) et reçoit `folderRemoved`. Le client affiche alors « Ce cahier est privé » au lieu de la timeline.
- [ ] Tests adc-core : liste filtrée, room refusée, les quatre cas de transition.
- [ ] Les autres apps (dodoc) profitent du même correctif : c'est une version mineure d'adc-core, sans changement d'API.

## 2. Création de compte

- [x] Formulaire d'inscription dans `LoginModal` (lien « Créer un compte ») : nom, e-mail, mot de passe (deux fois, 6 caractères au moins) (24/11).
- [x] Code d'invitation : le `signup_password` de l'instance. Le champ n'apparaît que si l'instance en a un. **Vérifié seulement dans le navigateur** tant qu'adc-core ne le vérifie pas (`adc-core/TODO.md`, « Signup password checked on the server ») : il décourage, il ne protège pas.
- [x] E-mail obligatoire si l'instance a `require_mail_to_signup: true` (à mettre dans le `settings.json` du VPS, avec `signup_password`). Enregistré en minuscules. Les e-mails sont encore renvoyés à tout visiteur par `GET /_api2/authors` (`adc-core/TODO.md`).
- [x] Connecté automatiquement après l'inscription ; parti de « Créer un cahier », la fenêtre de création s'ouvre ensuite.
- [ ] Tester sur le serveur : inscription avec et sans code, nom et e-mail déjà pris, compte créé puis cahier créé.
- [ ] Saisie du mot de passe général, quand l'instance en a un (déjà dans le TODO principal). Pas d'interface du tout pour l'instant : une instance avec un mot de passe général ne marche pas avec les Cahiers v3.

## 3. Créer un cahier avec un compte

- [x] Tout auteur connecté, plus seulement les admins de l'instance. Le serveur l'accepte déjà (`$can_be_created_by: "logged-in"`).
- [x] Sans compte : le bouton « Créer un cahier » est affiché et demande de se connecter (puis ouvre la fenêtre). Proposer aussi de créer un compte, une fois l'inscription faite.
- [ ] Le créateur devient admin du cahier : c'est déjà le cas (`CreateCahierModal`).

## 4. Réglages d'un cahier

`CahierSettingsModal.vue`, ouverte par un crayon à côté du titre, pour les admins du cahier (24/11). Écrite sans reprendre la fenêtre de la v2.

- [x] Titre et description
- [x] Début et fin de la timeline, facultatifs
- [x] Visibilité : public / privé / ouvert aux contributions sans compte (les deux cases de la création)
- [x] Admins et contributeurices, choisis parmi les comptes : ajouter et retirer. Toujours au moins un admin ; se retirer soi-même est signalé avant d'enregistrer.
- [x] Supprimer le cahier, avec une confirmation dans la fenêtre (il va dans la corbeille d'adc-core)
- [x] Renommer ne change pas l'adresse (`/<slug>`) : les liens déjà partagés continuent de marcher
- [ ] Mise à jour en direct chez les autres (titre, droits), avec les événements du point 1
- [ ] Un autre admin supprime le cahier pendant qu'on le regarde : la page reste sur « Chargement… » au lieu de le dire

## 5. Mot de passe oublié

adc-core sait le faire (`_recoverPassword`, `_resetPassword`). Il faut un mailer dans `settings.json` et un e-mail dans le compte.

- [ ] « Mot de passe oublié ? » dans `LoginModal` : envoie le lien à l'e-mail du compte.
- [ ] Page `/reset-password?token=…&path=…` (le lien qu'envoie adc-core) : nouveau mot de passe, puis connexion. Ajouter `reset-password` à `RESERVED_SLUGS`, puisque les cahiers sont à la racine.
- [ ] Mailer de l'instance pilote : voir « Mailer » plus bas.
- [ ] En attendant, ou si le mail échoue : un admin de l'instance peut redéfinir le mot de passe d'un compte.
- [ ] Le mail d'adc-core est générique et bilingue (signé `${productName}`) : à vérifier qu'il se lit bien pour les Cahiers.

## Mailer

- [ ] Choisir l'adresse d'envoi. Le plus cohérent avec l'instance (`apcp.latelier-des-chercheurs.fr`) est `info@latelier-des-chercheurs.fr`, s'il y a un accès SMTP. Sinon, `contact@dodoc.fr` (Infomaniak) fonctionne, en changeant le nom affiché : `"from": "Les Cahiers du Studio <contact@dodoc.fr>"`. L'adresse elle-même doit rester celle du compte SMTP.
- [ ] Vérifier la connexion SMTP depuis le VPS, puis envoyer un vrai mail de test (récupération de mot de passe sur un compte de test).
- [ ] `contactmail_of_instance` dans `meta.txt`, pour recevoir aussi les retours par e-mail.
- [ ] Ne jamais versionner le mot de passe SMTP : il reste dans le `settings.json` du serveur.

## Ensuite (pas bloquant pour l'ouverture)

- [ ] Connexion en tapant son nom ou son e-mail, au lieu de choisir dans la liste de tous les comptes. La liste expose tous les noms et devient longue.
- [ ] Accueil : « Mes cahiers » en haut, puis les cahiers publics des autres.
- [ ] Modifier son compte : nom, e-mail, mot de passe.
- [ ] Place disque : taille maximale par fichier (déjà `upload_max_file_size_in_mo`) ; quota par personne ou par cahier à voir.
- [ ] Page « À propos / données » minimale : qui héberge, quelles données sont gardées, qui contacter, comment supprimer son compte. C'est nécessaire dès qu'on accueille des personnes extérieures (RGPD).
- [ ] Sauvegardes du dossier des contenus sur le VPS (à vérifier).

## Ordre proposé

1. Cahiers privés (adc-core), car l'ouverture en dépend
2. Création de compte, puis création de cahier
3. Réglages du cahier
4. Mailer et mot de passe oublié
