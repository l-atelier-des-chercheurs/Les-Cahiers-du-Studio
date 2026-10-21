# Les Cahiers du Studio — v3

> Version alpha, en cours de développement. La v2 vit sur les branches `master` et `develop`.

Les Cahiers du Studio sont un outil de documentation chronologique : prendre des notes et capturer des médias à plusieurs, pendant une expérience en direct.

La v3 est une app légère construite sur [adc-core](https://github.com/l-atelier-des-chercheurs/adc-core), le cœur serveur partagé avec [do•doc](https://github.com/l-atelier-des-chercheurs/dodoc). Elle suit la structure décrite dans le [`docs/FORKING.md`](https://github.com/l-atelier-des-chercheurs/dodoc/blob/next/docs/FORKING.md) de do•doc.

## Installer et lancer

Node.js 24 (voir `.nvmrc`) :

```sh
npm install
npm start
```

## Organisation

```
├── index.js              appelle require("adc-core").start({...})
├── settings_base.json    réglages et schéma (cahiers, authors, chats)
├── content/              contenu par défaut, copié à la création d'un dossier de contenu
├── client-vue3/          client Vue 3 (prototype à venir), build → client-vue3/dist
└── scripts/              nettoyage de ffprobe, certificats HTTPS de développement
```

## Contenus de la v2

La v3 enregistre ses contenus dans `~/Documents/les-cahiers-du-studio`. Les contenus de la v2 (`~/Documents/les-cahiers` par défaut) ne sont pas repris : la v3 refuse de les ouvrir et ne les modifie jamais.

## Licence

GNU AGPL v3.
