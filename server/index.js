import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 9122;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Example Tool: Text Transform ──────────────────────────────
app.post('/api/tools/transform', (req, res) => {
  const { text, mode } = req.body;
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  let result;
  switch (mode) {
    case 'lower':
      result = text.toLowerCase();
      break;
    case 'reverse':
      result = text.split('').reverse().join('');
      break;
    case 'upper':
    default:
      result = text.toUpperCase();
      break;
  }
  res.json({ result });
});

// ── Example Tool: JSON Formatter ──────────────────────────────
app.post('/api/tools/format-json', (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const parsed = JSON.parse(text);
    res.json({ result: JSON.stringify(parsed, null, 2) });
  } catch (err) {
    res.status(400).json({ error: 'Invalid JSON', result: String(err) });
  }
});

// SPA fallback — serve index.html for any non-API route
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hermes Mini App server running on http://localhost:${PORT}`);
});
