// ===== BRING ENGINEERING — MAIN APPLICATION =====

const App = {
  currentPage: 'dashboard',

  init() {
    DataManager.load();
    Modal.init();
    this.setupNavigation();
    this.setupMenuToggle();
    this.setupKeyboardShortcuts();
    this.setupTabSync();
    this.loadTheme();
    this.updateDate();
    this.navigateTo('dashboard');
    this.checkBackupReminder();
  },

  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) {
          this.navigateTo(page);
          const sidebar = document.getElementById('sidebar');
          if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
          }
        }
      });
    });
  },

  setupMenuToggle() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
      document.getElementById('main-content').addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !e.target.closest('#menu-toggle')) {
          sidebar.classList.remove('open');
        }
      });
    }
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = e.target.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // Ctrl+S / Cmd+S — save current page settings
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.currentPage === 'settings') {
          Settings.save();
        } else {
          Utils.toast('데이터가 자동 저장되고 있습니다.', 'info');
        }
        return;
      }

      // Ctrl+E — export data
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        Settings.exportData();
        return;
      }

      if (inInput) return;

      // ? — show shortcuts
      if (e.key === '?') {
        e.preventDefault();
        this.showShortcuts();
        return;
      }

      // D — toggle dark mode
      if (e.key === 'd' || e.key === 'D') {
        this.toggleTheme();
        return;
      }

      // Number keys 1-9 for page navigation
      const pages = ['dashboard', 'operations', 'financial', 'okr', 'team', 'hrpage', 'projects', 'quality', 'pipeline'];
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        this.navigateTo(pages[num - 1]);
        return;
      }
    });
  },

  setupTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        DataManager.load();
        this.renderPage(this.currentPage);
        Utils.toast('다른 탭에서 데이터가 변경되었습니다.', 'info');
      }
    });
  },

  loadTheme() {
    const saved = localStorage.getItem('bring_theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = '☀️';
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const btn = document.getElementById('themeToggle');
    if (current === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('bring_theme', 'light');
      if (btn) btn.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('bring_theme', 'dark');
      if (btn) btn.textContent = '☀️';
    }
  },

  showShortcuts() {
    // Remove existing overlay if present
    const existing = document.querySelector('.shortcut-overlay');
    if (existing) { existing.remove(); return; }

    const overlay = document.createElement('div');
    overlay.className = 'shortcut-overlay';
    overlay.innerHTML = `
      <div class="shortcut-card">
        <h3>키보드 단축키</h3>
        <div class="shortcut-row"><span>대시보드</span><span class="shortcut-key">1</span></div>
        <div class="shortcut-row"><span>재무 관리</span><span class="shortcut-key">2</span></div>
        <div class="shortcut-row"><span>OKR 목표관리</span><span class="shortcut-key">3</span></div>
        <div class="shortcut-row"><span>팀 & 인사</span><span class="shortcut-key">4</span></div>
        <div class="shortcut-row"><span>프로젝트 & 기술</span><span class="shortcut-key">5</span></div>
        <div class="shortcut-row"><span>영업 파이프라인</span><span class="shortcut-key">6</span></div>
        <div class="shortcut-row"><span>리스크 관리</span><span class="shortcut-key">7</span></div>
        <div class="shortcut-row"><span>리포트 & 분석</span><span class="shortcut-key">8</span></div>
        <div class="shortcut-row"><span>설정</span><span class="shortcut-key">9</span></div>
        <div style="border-top:1px solid var(--border);margin:12px 0;padding-top:12px">
          <div class="shortcut-row"><span>다크모드 전환</span><span class="shortcut-key">D</span></div>
          <div class="shortcut-row"><span>데이터 내보내기</span><span class="shortcut-key">Ctrl+E</span></div>
          <div class="shortcut-row"><span>저장</span><span class="shortcut-key">Ctrl+S</span></div>
          <div class="shortcut-row"><span>이 도움말</span><span class="shortcut-key">?</span></div>
        </div>
        <div style="text-align:center;margin-top:16px">
          <button class="btn btn-secondary" onclick="this.closest('.shortcut-overlay').remove()">닫기 (Esc)</button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.addEventListener('keydown', function closeShortcuts(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', closeShortcuts);
      }
    });
    document.body.appendChild(overlay);
  },

  checkBackupReminder() {
    const lastBackup = localStorage.getItem('bring_last_backup');
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (!lastBackup || (now - parseInt(lastBackup)) > weekMs) {
      setTimeout(() => this.showBackupReminder(), 3000);
    }
  },

  showBackupReminder() {
    const existing = document.querySelector('.backup-reminder');
    if (existing) return;
    const div = document.createElement('div');
    div.className = 'backup-reminder';
    div.innerHTML = `
      <div class="backup-reminder-title">💾 데이터 백업 알림</div>
      <p style="font-size:13px;color:var(--text-light)">마지막 백업으로부터 7일이 지났습니다. 데이터를 안전하게 보관하세요.</p>
      <div class="backup-reminder-actions">
        <button class="btn btn-primary btn-sm" onclick="Settings.exportData();localStorage.setItem('bring_last_backup',Date.now());this.closest('.backup-reminder').remove()">지금 백업</button>
        <button class="btn btn-secondary btn-sm" onclick="localStorage.setItem('bring_last_backup',Date.now());this.closest('.backup-reminder').remove()">다음에</button>
      </div>
    `;
    document.body.appendChild(div);
  },

  updateDate() {
    const el = document.getElementById('currentDate');
    if (el) {
      el.textContent = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
      });
    }
  },

  navigateTo(page) {
    this.currentPage = page;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    document.querySelectorAll('.page').forEach(p => {
      p.classList.toggle('active', p.id === 'page-' + page);
    });

    const titles = {
      dashboard: '경영 대시보드',
      operations: '운영 체계',
      financial: '재무 관리',
      okr: 'OKR 목표관리',
      team: '팀 & 인사',
      hrpage: '인사 제도',
      projects: '프로젝트 & 기술',
      quality: '품질 & IP',
      pipeline: '영업 파이프라인',
      risk: '리스크 관리',
      roadmap: '로드맵 & 전략',
      reports: '리포트 & 분석',
      settings: '설정'
    };
    document.getElementById('page-title').textContent = titles[page] || page;

    this.renderPage(page);
    document.getElementById('main-content').scrollTo(0, 0);
  },

  renderPage(page) {
    const modules = {
      dashboard: Dashboard,
      operations: Operations,
      financial: Financial,
      okr: OKR,
      team: Team,
      hrpage: HRPage,
      projects: Projects,
      quality: Quality,
      pipeline: Pipeline,
      risk: Risk,
      roadmap: RoadmapPage,
      reports: null,
      settings: Settings
    };
    const mod = modules[page];
    if (mod && typeof mod.render === 'function') {
      try {
        mod.render();
      } catch (e) {
        console.error(`Error rendering ${page}:`, e);
        Utils.toast('페이지 렌더링 중 오류가 발생했습니다.', 'danger');
      }
    }
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
