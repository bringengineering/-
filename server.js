const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'app-data.json');
const AUTH_FILE = path.join(__dirname, 'data', 'auth.json');
const DOCS_DIR = path.join(__dirname, 'data', 'documents');
const DATA_DIR = path.join(__dirname, 'data');

// Ensure directories exist
[DATA_DIR, DOCS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Middleware
app.use(express.json({ limit: '50mb' }));

// ===== AUTH (세션 기반 간단 인증) =====
const sessions = new Map();

function getAuth() {
  try {
    if (fs.existsSync(AUTH_FILE)) return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  } catch (e) {}
  return null;
}

function hashPw(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

function authMiddleware(req, res, next) {
  const auth = getAuth();
  if (!auth || !auth.passwordHash) return next(); // no password set → open
  const token = req.headers['x-auth-token'] || req.query.token;
  if (token && sessions.has(token)) return next();
  res.status(401).json({ error: 'unauthorized' });
}

// POST /api/login
app.post('/api/login', (req, res) => {
  const auth = getAuth();
  if (!auth || !auth.passwordHash) return res.json({ ok: true, token: 'open' });
  if (hashPw(req.body.password) === auth.passwordHash) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { created: Date.now() });
    return res.json({ ok: true, token });
  }
  res.status(401).json({ ok: false, error: '비밀번호가 틀렸습니다.' });
});

// POST /api/set-password
app.post('/api/set-password', authMiddleware, (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 4) return res.status(400).json({ ok: false, error: '4자 이상' });
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ passwordHash: hashPw(password) }), 'utf8');
  sessions.clear();
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { created: Date.now() });
  res.json({ ok: true, token });
});

// POST /api/remove-password
app.post('/api/remove-password', authMiddleware, (req, res) => {
  if (fs.existsSync(AUTH_FILE)) fs.unlinkSync(AUTH_FILE);
  sessions.clear();
  res.json({ ok: true });
});

// GET /api/auth-status
app.get('/api/auth-status', (req, res) => {
  const auth = getAuth();
  const hasPassword = !!(auth && auth.passwordHash);
  const token = req.headers['x-auth-token'] || req.query.token;
  const loggedIn = !hasPassword || (token && sessions.has(token));
  res.json({ hasPassword, loggedIn });
});

// ===== DATA API (인증 필요) =====

app.get('/api/data', authMiddleware, (req, res) => {
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

app.post('/api/data', authMiddleware, (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    console.error('데이터 저장 오류:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/backup', authMiddleware, (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupFile = path.join(DATA_DIR, `backup-${timestamp}.json`);
      fs.copyFileSync(DATA_FILE, backupFile);
      res.json({ ok: true, file: `backup-${timestamp}.json` });
    } else {
      res.json({ ok: false, error: '저장된 데이터가 없습니다.' });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/backups', authMiddleware, (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort().reverse();
    res.json(files);
  } catch (e) {
    res.json([]);
  }
});

// ===== DOCUMENT UPLOAD API =====

app.post('/api/documents/upload', authMiddleware, (req, res) => {
  try {
    const { filename, data } = req.body; // data = base64
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')}`;
    const filePath = path.join(DOCS_DIR, safeName);
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, buffer);
    res.json({ ok: true, storedName: safeName, size: buffer.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/documents/:name', authMiddleware, (req, res) => {
  const filePath = path.join(DOCS_DIR, req.params.name);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: '파일 없음' });
  }
});

app.get('/api/documents', authMiddleware, (req, res) => {
  try {
    const files = fs.readdirSync(DOCS_DIR).map(f => ({
      name: f,
      size: fs.statSync(path.join(DOCS_DIR, f)).size
    }));
    res.json(files);
  } catch (e) {
    res.json([]);
  }
});

// ===== SERVE APP =====

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '브링엔지니어링_경영관리.html'));
});

app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  const auth = getAuth();
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║  브링엔지니어링 경영관리 시스템 v3.0         ║');
  console.log('  ╠══════════════════════════════════════════════╣');
  console.log(`  ║  서버: http://localhost:${PORT}                  ║`);
  console.log('  ║  데이터: ./data/app-data.json                ║');
  console.log('  ║  문서: ./data/documents/                     ║');
  console.log(`  ║  잠금: ${auth?.passwordHash ? '비밀번호 설정됨 🔒' : '비밀번호 미설정 🔓'}             ║`);
  console.log('  ║  종료: Ctrl+C                                ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
