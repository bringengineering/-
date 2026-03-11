const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from app directory
app.use(express.static(path.join(__dirname, 'app')));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`브링엔지니어링 경영관리 시스템 실행 중: http://localhost:${PORT}`);
});
