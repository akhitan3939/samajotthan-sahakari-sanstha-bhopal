import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'society-live-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// GET: Retrieve the live society database (shared across all devices & users)
app.get('/api/society-data', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      if (content && content.trim().length > 0) {
        const data = JSON.parse(content);
        return res.json({ success: true, data });
      }
    }
    return res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error reading society database:', error);
    return res.status(500).json({ success: false, error: 'Database read error' });
  }
});

// POST: Save updated live society data (loans, passbook toggles, archive status, etc.)
app.post('/api/society-data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid data payload' });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return res.json({ success: true, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving society database:', error);
    return res.status(500).json({ success: false, error: 'Database write error' });
  }
});

// Explicitly serve public static assets (including logo and uploaded media)
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
