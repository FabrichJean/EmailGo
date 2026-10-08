# EmailDo
https://emailgo.fabrich.site

![A beautiful sunset](/public/image.png)

Outil d'envoi d'emails automatique via Gmail, multi-utilisateur, avec choix de template. Connexion à la plateforme via Google. Connexion des comptes Gmail d'envoi en mode automatique (OAuth Google) ou manuel (mot de passe d'application SMTP).

## Mise en place

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Config par environnement, chargée automatiquement par Next.js selon la commande — pas de copie manuelle de `.env.example` à faire :
   - `.env` — variables partagées (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), déjà en place.
   - `.env.development` — utilisé par `npm run dev`, déjà en place avec une clé de chiffrement générée.
   - `.env.production` — à compléter avant un déploiement (voir les commentaires dans le fichier). Génère une clé **dédiée**, différente de celle du dev :
     ```bash
     openssl rand -base64 32
     ```

   `ENCRYPTION_KEY` chiffre les identifiants Gmail stockés en base (refresh token OAuth, mot de passe d'application) — ne la commit jamais (ces fichiers sont gitignorés) et ne la change pas une fois des comptes connectés dans cet environnement (les secrets déjà chiffrés deviendraient illisibles).

3. Appliquer les migrations Prisma (crée `dev.db`) :

   ```bash
   npx prisma migrate dev
   ```

4. **Connexion à la plateforme (obligatoire)** : crée un projet sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials), configure l'écran de consentement OAuth (externe), crée un identifiant OAuth "Application Web" avec **deux** URI de redirection autorisées :
   - `http://localhost:3000/api/auth/callback` (connexion à la plateforme)
   - `http://localhost:3000/api/gmail/oauth/callback` (connexion automatique d'un compte Gmail d'envoi, étape 6)

   Colle le Client ID / Client Secret dans `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). La première personne à se connecter récupère automatiquement les données déjà présentes en base (comptes Gmail, templates, historique).

5. Lancer le serveur de développement et se connecter :

   ```bash
   npm run dev
   ```

   Ouvrir [http://localhost:3000](http://localhost:3000) → redirection vers `/login` → "Se connecter avec Google".

6. **Connecter un compte Gmail d'envoi** (depuis `/connect`, une fois connecté à la plateforme) :
   - **Manuelle (rapide)** : active la validation en 2 étapes sur le compte Google à connecter, génère un [mot de passe d'application](https://myaccount.google.com/apppasswords), colle-le dans le formulaire.
   - **Automatique (OAuth)** : ajoute ton email comme testeur dans l'écran de consentement OAuth Google Cloud (mode test), puis clique "Se connecter avec Google" sur `/connect`.

## Espace admin

L'adresse définie dans `ADMIN_EMAIL` (`.env`, déjà réglée sur `contact.fabrich@gmail.com`) voit apparaître un lien **Admin** dans la sidebar après connexion — connexion identique au reste de l'app (Google), aucun compte séparé. Cliquer dessus mène à `/admin/unlock`, qui demande une confirmation par mot de passe (`ADMIN_PASSWORD`, propre à chaque environnement, déjà généré dans `.env.development` et `.env.production`) avant de laisser entrer dans `/admin` — un second facteur, propre à la session en cours (à refaire à chaque nouvelle connexion).

Depuis `/admin` :
- **Statistiques globales** : utilisateurs, comptes Gmail actifs, templates, emails envoyés/échoués (total, 24h, 7j, 30j).
- **Par utilisateur** : comptes connectés, templates, emails envoyés (total + 24h), statut.
- **Bannir** un utilisateur — déconnexion immédiate (toutes ses sessions sont révoquées) et connexion bloquée ensuite.
- **Couper l'envoi** d'un utilisateur — il garde accès à l'app (templates, historique...) mais ne peut plus envoyer d'email.
- **Limiter l'envoi** par utilisateur — un nombre max sur une fenêtre glissante de 24h / 7j / 30j (au choix). Dépassement = envois bloqués avec un message clair, jusqu'à ce que la fenêtre se libère.

Le compte admin lui-même est protégé contre ces actions (impossible de se bannir/couper/limiter soi-même, que ce soit par erreur ou via l'API).

## Déploiement

⚠️ **Contrainte importante** : la base de données est un fichier SQLite local (`better-sqlite3`). Ça exclut les hébergeurs purement serverless/edge (Vercel, Netlify Functions...) dont le système de fichiers est éphémère et non partagé entre instances — le fichier serait perdu ou incohérent à chaque déploiement. Il faut un hébergeur avec **disque persistant** et un process qui tourne en continu (`next start`, pas de serverless).

Deux options ci-dessous : un VPS classique (contrôle total, marche partout) ou Fly.io (managé, volume persistant, plus rapide à mettre en place). Adapte, ou utilise ton hébergeur habituel s'il fournit du disque persistant.

### 1. Préparer `.env.production`

Complète le fichier (déjà présent, gitignoré) avec le vrai domaine et une clé de chiffrement dédiée :

```bash
openssl rand -base64 32   # → ENCRYPTION_KEY, différente de celle du dev
```

```env
DATABASE_URL="file:./prod.db"
GOOGLE_REDIRECT_URI=https://ton-domaine.com/api/gmail/oauth/callback
GOOGLE_LOGIN_REDIRECT_URI=https://ton-domaine.com/api/auth/callback
ENCRYPTION_KEY=<clé générée ci-dessus>
NEXT_PUBLIC_APP_URL=https://ton-domaine.com
ADMIN_PASSWORD=<mot de passe dédié à la prod, différent du dev>
```

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `ADMIN_EMAIL` viennent de `.env` (partagés avec le dev, pas besoin d'en recréer).

### 2. Mettre à jour Google Cloud Console

Sur le client OAuth existant ([Credentials](https://console.cloud.google.com/apis/credentials)), ajoute les deux redirect URIs de prod à la liste existante (ne remplace pas celles du dev, les deux environnements peuvent coexister sur le même client) :

- `https://ton-domaine.com/api/gmail/oauth/callback`
- `https://ton-domaine.com/api/auth/callback`

Si l'écran de consentement est encore en mode "Testing", publie-le en production (**Audience** → **Publish app**) ou ajoute chaque utilisateur autorisé comme testeur — sinon seuls les testeurs déclarés pourront se connecter.

### 3. Choisir un hébergeur — Option A : VPS (Ubuntu/Debian, Hetzner/DigitalOcean/etc.)

```bash
# Sur le serveur
git clone <ton-repo-url> emailgo
cd emailgo
npm ci   # régénère aussi le client Prisma (hook postinstall) — pas d'étape séparée requise
```

⚠️ `.env.production` est gitignoré donc pas présent après le clone — recrée-le sur le serveur avec les valeurs préparées à l'étape 1. La CLI Prisma (`migrate deploy`) ne le charge pas automatiquement comme le fait Next.js pour l'app elle-même, donc exporte-le explicitement avant :

```bash
set -a; source .env.production; set +a
npx prisma migrate deploy   # applique les migrations sans prompt interactif
npm run build
```

Lance l'app en continu avec [pm2](https://pm2.keymetrics.io/) (ou un service systemd équivalent) :

```bash
npm install -g pm2
pm2 start npm --name emailgo -- start
pm2 save
pm2 startup   # relance automatique au reboot du serveur
```

Mets un reverse proxy devant (nginx) pour le TLS et le domaine :

```nginx
server {
    listen 80;
    server_name ton-domaine.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Puis active le HTTPS avec [Certbot](https://certbot.eff.org/) (`certbot --nginx -d ton-domaine.com`).

Pour un futur déploiement (mise à jour du code) :

```bash
git pull
npm ci
set -a; source .env.production; set +a
npx prisma migrate deploy
npm run build
pm2 restart emailgo
```

### 3. Choisir un hébergeur — Option B : Fly.io (managé, volume persistant)

```bash
fly launch --no-deploy        # génère un fly.toml, choisis une région proche
fly volumes create data --size 1   # 1 Go pour le fichier SQLite
```

Dans `fly.toml`, monte le volume et pointe `DATABASE_URL` dessus :

```toml
[mounts]
  source = "data"
  destination = "/data"
```

```bash
fly secrets set \
  GOOGLE_CLIENT_ID=... \
  GOOGLE_CLIENT_SECRET=... \
  GOOGLE_REDIRECT_URI=https://ton-app.fly.dev/api/gmail/oauth/callback \
  GOOGLE_LOGIN_REDIRECT_URI=https://ton-app.fly.dev/api/auth/callback \
  ENCRYPTION_KEY=... \
  NEXT_PUBLIC_APP_URL=https://ton-app.fly.dev \
  ADMIN_EMAIL=xxxx@gmail.com \
  ADMIN_PASSWORD=... \
  DATABASE_URL="file:/data/prod.db"

fly deploy
```

Sur Fly, `npx prisma migrate deploy` doit tourner **après** le montage du volume — ajoute-le comme `release_command` dans `fly.toml`, ou connecte-toi une fois (`fly ssh console`) pour l'exécuter manuellement au premier déploiement.

### Vérifications post-déploiement

- `https://ton-domaine.com/login` redirige bien et "Se connecter avec Google" fonctionne sans `redirect_uri_mismatch`.
- Un redémarrage du process (`pm2 restart` / `fly deploy` suivant) ne fait pas perdre les comptes Gmail ni les templates → le disque est bien persistant.
- **Sauvegardes** : le fichier SQLite (`prod.db`) contient toutes les données de tous les utilisateurs. Programme une sauvegarde régulière (`cp`/rsync vers un stockage externe, ou snapshot du volume côté hébergeur) — il n'y a pas de réplication automatique.

## Fonctionnement

- **`/login`** — connexion à la plateforme via Google (inscription libre : un compte est créé automatiquement à la première connexion).
- **`/connect`** — connecter/déconnecter des comptes Gmail d'envoi (OAuth ou mot de passe d'application), propres à chaque utilisateur.
- **`/templates`** — créer des templates d'email avec variables `{{prenom}}`, `{{entreprise}}`, etc. (détectées automatiquement).
- **`/send`** — envoyer à un destinataire unique, en masse via import CSV, ou via une liste d'adresses collées.
- **`/history`** — historique des envois (succès/échec) avec filtre par statut.

Chaque utilisateur ne voit que ses propres comptes Gmail, templates et historique.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + SQLite (via l'adaptateur `@prisma/adapter-better-sqlite3`), `googleapis` pour l'OAuth Google, `nodemailer` pour l'envoi (SMTP et OAuth2), `papaparse` pour le parsing CSV, `@tiptap/react` pour l'éditeur de template.

Les secrets (refresh token OAuth, mot de passe d'application) sont chiffrés en AES-256-GCM avant stockage (`lib/crypto.ts`). L'authentification à la plateforme repose sur des sessions maison (cookie httpOnly + token haché en base, `lib/auth/session.ts`), distinctes de la connexion des comptes Gmail d'envoi.
