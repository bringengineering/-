const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'app-data.json');
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '50mb' }));

// ===== REST API =====

// GET /api/data — Load saved data
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      res.json(JSON.parse(raw));
    } else {
      res.json(null);
    }
  } catch (e) {
    console.error('데이터 로드 오류:', e.message);
    res.json(null);
  }
});

// POST /api/data — Save all data
app.post('/api/data', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    console.error('데이터 저장 오류:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/backup — Create timestamped backup
app.post('/api/backup', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupFile = path.join(DATA_DIR, `backup-${timestamp}.json`);
      fs.copyFileSync(DATA_FILE, backupFile);
      res.json({ ok: true, file: backupFile });
    } else {
      res.json({ ok: false, error: '저장된 데이터가 없습니다.' });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/backups — List backups
app.get('/api/backups', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();
    res.json(files);
  } catch (e) {
    res.json([]);
  }
});

// Serve the main HTML app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '브링엔지니어링_경영관리.html'));
});

// Serve static assets if needed
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║  브링엔지니어링 경영관리 시스템 v2.0     ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  서버: http://localhost:${PORT}              ║`);
  console.log('  ║  데이터: ./data/app-data.json            ║');
  console.log('  ║  종료: Ctrl+C                            ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
