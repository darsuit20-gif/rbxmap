# RBXMAP

Site vitrine avec envoi sécurisé vers Discord via un backend.

## Sécurité

Le webhook Discord est stocké **uniquement** dans le fichier `.env` côté serveur. Il n'apparaît jamais dans le code visible par les visiteurs.

## Installation

```bash
npm install
```

Copie `.env.example` vers `.env` et mets ton webhook Discord :

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
PORT=3000
```

## Lancer

```bash
npm start
```

Ouvre http://localhost:3000

## Déploiement

Déploie sur un hébergeur Node.js (Render, Railway, VPS...) et configure la variable d'environnement `DISCORD_WEBHOOK_URL` dans le panel de l'hébergeur — **ne commit jamais** le fichier `.env`.
