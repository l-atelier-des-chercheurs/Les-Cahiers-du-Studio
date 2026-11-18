# Installer Archives vivantes (Cahiers v3) sur un serveur

Ce tutoriel installe l'application sur un serveur dédié (VPS), avec Node.js et pm2, derrière nginx et un certificat HTTPS gratuit. Il reprend le [tutoriel d'installation de do•doc](https://forum.latelier-des-chercheurs.fr/t/installer-do-doc-en-ligne/210), adapté à cette application : les deux reposent sur le même serveur, adc-core.

*Dernière mise à jour : 17/11/2026, branche `v3`, adc-core 0.2.6.*

> **⚠️ Configurer et maintenir un serveur demande de l'aisance avec le terminal.** Si vous n'avez jamais administré de serveur, familiarisez-vous d'abord avec ces manipulations.

> **⚠️ Version expérimentale.** La branche `v3` est en cours de développement. Le format des contenus peut encore changer.

## 1. Le serveur

Un VPS simple suffit pour quelques dizaines de personnes : 1 cœur, **2 Go de RAM** (1 Go minimum), **40 à 50 Go de disque** (les vidéos prennent vite de la place). Choisissez **Ubuntu 24.04**.

Connectez-vous en SSH avec l'adresse IP et l'utilisateur reçus par mail (le plus souvent `ubuntu` sur les serveurs Ubuntu récents, parfois `root`) :

```bash
ssh ubuntu@XX.XX.XX.XX
```

Mettez le système à jour :

```bash
sudo apt update
sudo apt upgrade
```

Sécurisez le serveur : utilisateur non root, connexion par clé SSH, pare-feu. Pour le pare-feu `ufw`, autorisez **d'abord** SSH, sinon vous risquez de vous enfermer dehors :

```bash
sudo ufw allow OpenSSH
sudo ufw allow 8080   # pour le test de l'étape 5, retiré à l'étape 6
sudo ufw enable
```

Dans la suite, les chemins supposent l'utilisateur `ubuntu` (`/home/ubuntu`) : adaptez-les si le vôtre est différent.

## 2. Les outils

**Fuseau horaire.** Les médias sont placés sur la timeline selon leur date : l'heure du serveur doit être juste.

```bash
date
sudo timedatectl set-timezone Europe/Paris
```

**git et les outils de compilation** (certaines dépendances sont compilées pendant l'installation) :

```bash
sudo apt install git build-essential libssl-dev
```

**nvm**, pour installer la version de Node.js qu'attend l'application :

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
```

**Les dépendances de Puppeteer**, utilisé pour les vignettes et les exports :

```bash
sudo apt install -y libasound2t64 libatk1.0-0t64 libc6 libcairo2 libcups2t64 libdbus-1-3 libexpat1 libfontconfig1 libgcc-s1 libgdk-pixbuf2.0-0 libglib2.0-0t64 libgtk-3-0t64 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget libgbm-dev
```

**Poppler** (facultatif), pour des vignettes de PDF plus rapides :

```bash
sudo apt install poppler-utils
```

## 3. Récupérer et installer l'application

```bash
cd ~
git clone -b v3 https://github.com/l-atelier-des-chercheurs/Les-Cahiers-du-Studio.git archives-vivantes
cd archives-vivantes
```

Installez la version de Node.js indiquée dans `.nvmrc`, puis activez-la :

```bash
nvm install
nvm use
```

Installez les dépendances du serveur (2 à 5 minutes). L'interface est incluse toute prête dans le dépôt (`client-vue3/dist`) : rien à compiler.

```bash
npm install
```

## 4. Les réglages

Ne modifiez pas `settings_base.json` : une mise à jour écraserait vos changements. Créez plutôt un `settings.json`, dont les valeurs ont la priorité :

```bash
cp settings.example.json settings.json
nano settings.json
```

Indiquez-y au moins le dossier des contenus, avec **un chemin absolu dont le nom ne dépend pas du nom du logiciel**. Le logiciel va sans doute être renommé : ainsi, les contenus ne bougeront pas.

```json
{
  "desired_port": 8080,
  "contentPath": "/home/ubuntu/archives-vivantes-contenus"
}
```

Le dossier est créé au premier lancement. Attention à la syntaxe : chaque ligne se termine par une virgule, **sauf la dernière**. Une virgule en trop ou en moins empêche l'application de démarrer.

Quittez nano avec <kbd>Ctrl</kbd> + <kbd>X</kbd>, puis <kbd>Y</kbd> et <kbd>Entrée</kbd> pour enregistrer.

Pour faire tourner plusieurs instances sur le même serveur, donnez à chacune son propre dossier d'installation, son `desired_port` (8081, 8082…), son `contentPath` et son sous-domaine. Si le port demandé est occupé, l'application prend le suivant.

## 5. Lancer l'application

Testez d'abord en mode debug :

```bash
npm run debug
```

Ouvrez `https://XX.XX.XX.XX:8080/` dans un navigateur. Il signale un certificat non reconnu, ce qui est normal à ce stade (l'application utilise un certificat auto-signé) : continuez vers le site. Arrêtez avec <kbd>Ctrl</kbd> + <kbd>C</kbd>.

Pour que l'application reste lancée après la fermeture du terminal, et redémarre avec le serveur, utilisez pm2 :

```bash
npm install -g pm2
pm2 start npm --name "archives-vivantes" -- run start
pm2 save
pm2 startup
```

`pm2 startup` affiche une commande commençant par `sudo env PATH=…` : **copiez-la et lancez-la**, c'est elle qui active le redémarrage automatique.

Si l'application ne répond pas, `pm2 logs archives-vivantes` affiche ses messages d'erreur.

Commandes utiles : `pm2 ls`, `pm2 logs archives-vivantes`, `pm2 restart archives-vivantes`, `pm2 stop archives-vivantes`, `pm2 delete archives-vivantes`.

## 6. Nom de domaine et HTTPS

**DNS.** Chez votre bureau d'enregistrement, créez une entrée **A** qui fait pointer votre domaine ou sous-domaine (par exemple `archives.mon-domaine.fr`) vers l'IP du serveur. La propagation peut prendre quelques heures.

**nginx**, qui reçoit les visiteurs et les transmet à l'application :

```bash
sudo apt install nginx
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 8080
sudo nano /etc/nginx/sites-available/default
```

Les deux commandes `ufw` ouvrent le pare-feu aux visiteurs (ports 80 et 443) et referment le port de test : l'application n'est plus joignable que par nginx.

Ajoutez à la fin du fichier, en remplaçant le domaine :

```nginx
server {
  server_name archives.mon-domaine.fr;
  client_max_body_size 500M;
  location / {
    proxy_pass https://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
  }
}
```

`client_max_body_size` est la taille maximale d'un fichier envoyé. L'application accepte par défaut jusqu'à 10 000 Mo : c'est donc ce réglage de nginx qui fixe la limite en pratique. 500 Mo laisse passer des vidéos de quelques minutes sans saturer le disque. Les délais allongés évitent de couper l'envoi d'une vidéo lourde.

Vérifiez la configuration, puis rechargez nginx :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Certificat HTTPS gratuit** avec Certbot :

```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

Choisissez la redirection de HTTP vers HTTPS. En cas d'erreur, l'entrée A n'est sans doute pas encore propagée : réessayez quelques heures plus tard.

## 7. Après l'installation

**Changez le mot de passe du compte Admin.** Un compte `Admin` est créé au premier lancement, avec le mot de passe par défaut d'adc-core : `dodoc`. N'importe qui peut s'y connecter tant qu'il n'est pas changé.

> ⚠️ L'interface ne permet pas encore de changer ce mot de passe, ni de régler un mot de passe général pour l'instance. C'est à faire avant d'ouvrir l'instance au public.

## 8. Sauvegarder

Tous les contenus sont dans le dossier `contentPath`. Pour les sauvegarder, copiez ce dossier sur votre ordinateur, avec un logiciel SFTP ([FileZilla](https://filezilla-project.org/), [Cyberduck](https://cyberduck.io/)) ou en ligne de commande depuis votre ordinateur :

```bash
rsync -av ubuntu@XX.XX.XX.XX:/home/ubuntu/archives-vivantes-contenus/ ./sauvegarde-archives-vivantes/
```

Pour restaurer, arrêtez l'application (`pm2 stop archives-vivantes`), copiez le dossier dans l'autre sens, puis relancez-la (`pm2 start archives-vivantes`).

## 9. Mettre à jour

```bash
cd ~/archives-vivantes
pm2 delete archives-vivantes
git pull
nvm install
nvm use
npm install
pm2 start npm --name "archives-vivantes" -- run start
pm2 save
```

**Première mise à jour après le 18 novembre 2026** : l'interface compilée est désormais dans le dépôt. Si `git pull` refuse avec `untracked working tree files would be overwritten` et cite des fichiers de `client-vue3/dist`, supprimez l'ancienne compilation, puis relancez `git pull` :

```bash
rm -rf client-vue3/dist
git pull
```

Si `git pull` refuse avec `Your local changes to the following files would be overwritten`, et que seul `package-lock.json` est en cause, revenez à l'état du dépôt avec `git reset --hard`, puis relancez `git pull`. Votre `settings.json` n'est pas suivi par git : il n'est jamais touché.
