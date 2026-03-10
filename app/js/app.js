// ===== BRING ENGINEERING — MAIN APPLICATION =====

const App = {
  currentPage: 'dashboard',

  init() {
    DataManager.load();
    this.setupNavigation();
    this.setupMenuToggle();
    this.updateDate();
    this.navigateTo('dashboard');
  },

  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) this.navigateTo(page);
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
      // Close sidebar on outside click (mobile)
      document.getElementById('main-content').addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !e.target.closest('#menu-toggle')) {
          sidebar.classList.remove('open');
        }
      });
    }
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

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.toggle('active', p.id === 'page-' + page);
    });

    // Update page title
    const titles = {
      dashboard: '경영 대시보드',
      financial: '재무 관리',
      okr: 'OKR 목표관리',
      team: '팀 & 인사',
      projects: '프로젝트 & 기술',
      pipeline: '영업 파이프라인',
      risk: '리스크 관리',
      reports: '리포트 & 분석',
      settings: '설정'
    };
    document.getElementById('page-title').textContent = titles[page] || page;

    // Render page module
    this.renderPage(page);

    // Scroll to top
    document.getElementById('page-container').scrollTop = 0;
  },

  renderPage(page) {
    const modules = {
      dashboard: Dashboard,
      financial: Financial,
      okr: OKR,
      team: Team,
      projects: Projects,
      pipeline: Pipeline,
      risk: Risk,
      reports: null,
      settings: Settings
    };
    const mod = modules[page];
    if (mod && typeof mod.render === 'function') {
      mod.render();
    }
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
