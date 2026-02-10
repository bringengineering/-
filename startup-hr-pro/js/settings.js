/**
 * StartupHR Pro - Settings Manager
 * 설정 관리 시스템
 */

const SettingsManager = {
  /**
   * 기본 설정값
   */
  defaults: {
    company: {
      name: 'StartupHR Pro',
      logo: null,
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      address: '',
      phone: '',
      businessNumber: ''
    },
    user: {
      name: '대표님',
      email: '',
      phone: '',
      photo: null,
      position: '대표이사'
    },
    notifications: {
      email: true,
      push: true,
      weekly52h: true,
      contractExpiry: true,
      legalRisk: true,
      dailyBriefing: true
    },
    dashboard: {
      widgets: ['stats', 'charts', 'alerts', 'recent'],
      layout: 'default',
      theme: 'light'
    },
    system: {
      language: 'ko',
      timezone: 'Asia/Seoul',
      dateFormat: 'YYYY-MM-DD',
      autoSave: true,
      autoBackup: false
    }
  },

  /**
   * 설정 로드
   */
  load() {
    const saved = localStorage.getItem('settings');
    if (saved) {
      try {
        return { ...this.defaults, ...JSON.parse(saved) };
      } catch (e) {
        console.error('설정 로드 실패:', e);
        return this.defaults;
      }
    }
    return this.defaults;
  },

  /**
   * 설정 저장
   */
  save(settings) {
    try {
      localStorage.setItem('settings', JSON.stringify(settings));
      Utils.showSuccess('설정이 저장되었습니다.');
      return true;
    } catch (e) {
      console.error('설정 저장 실패:', e);
      Utils.showError('설정 저장에 실패했습니다.');
      return false;
    }
  },

  /**
   * 회사 정보 업데이트
   */
  updateCompany(data) {
    const settings = this.load();
    settings.company = { ...settings.company, ...data };
    return this.save(settings);
  },

  /**
   * 사용자 정보 업데이트
   */
  updateUser(data) {
    const settings = this.load();
    settings.user = { ...settings.user, ...data };
    return this.save(settings);
  },

  /**
   * 알림 설정 업데이트
   */
  updateNotifications(data) {
    const settings = this.load();
    settings.notifications = { ...settings.notifications, ...data };
    return this.save(settings);
  },

  /**
   * 대시보드 설정 업데이트
   */
  updateDashboard(data) {
    const settings = this.load();
    settings.dashboard = { ...settings.dashboard, ...data };
    return this.save(settings);
  },

  /**
   * 시스템 설정 업데이트
   */
  updateSystem(data) {
    const settings = this.load();
    settings.system = { ...settings.system, ...data };
    return this.save(settings);
  },

  /**
   * 로고 업로드
   */
  uploadLogo(file) {
    return PhotoManager.uploadPhoto(file, 'company', 'logo')
      .then(base64 => {
        return this.updateCompany({ logo: base64 });
      });
  },

  /**
   * 색상 업데이트
   */
  updateColors(primary, secondary) {
    const success = this.updateCompany({
      primaryColor: primary,
      secondaryColor: secondary
    });

    if (success) {
      // CSS 변수 업데이트
      document.documentElement.style.setProperty('--primary-500', primary);
      document.documentElement.style.setProperty('--secondary-500', secondary);
    }

    return success;
  },

  /**
   * 테마 변경
   */
  updateTheme(theme) {
    const success = this.updateDashboard({ theme });

    if (success) {
      document.documentElement.setAttribute('data-theme', theme);
    }

    return success;
  },

  /**
   * 모든 데이터 내보내기
   */
  exportAllData() {
    const data = {
      settings: this.load(),
      employees: db.getAll('employees'),
      contracts: db.getAll('contracts'),
      attendance: db.getAll('attendance'),
      communications: db.getAll('communications'),
      warnings: db.getAll('warnings'),
      checklist: db.getAll('checklist'),
      exportDate: new Date().toISOString(),
      version: '3.0'
    };

    const filename = `startuphr-backup-${Utils.formatDate(new Date(), 'YYYY-MM-DD')}.json`;
    Utils.downloadJSON(data, filename);

    NotificationCenter.add({
      title: '데이터 내보내기 완료',
      description: `${filename} 파일로 저장되었습니다.`,
      type: 'success'
    });
  },

  /**
   * 데이터 가져오기
   */
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // 데이터 유효성 검사
          if (!data.version || !data.exportDate) {
            reject('올바른 백업 파일이 아닙니다.');
            return;
          }

          // 확인
          if (!Utils.confirm('기존 데이터를 모두 덮어쓰시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            reject('사용자가 취소했습니다.');
            return;
          }

          // 데이터 복원
          if (data.settings) {
            this.save(data.settings);
          }

          if (data.employees) {
            localStorage.setItem('employees', JSON.stringify(data.employees));
          }

          if (data.contracts) {
            localStorage.setItem('contracts', JSON.stringify(data.contracts));
          }

          if (data.attendance) {
            localStorage.setItem('attendance', JSON.stringify(data.attendance));
          }

          if (data.communications) {
            localStorage.setItem('communications', JSON.stringify(data.communications));
          }

          if (data.warnings) {
            localStorage.setItem('warnings', JSON.stringify(data.warnings));
          }

          if (data.checklist) {
            localStorage.setItem('checklist', JSON.stringify(data.checklist));
          }

          Utils.showSuccess('데이터를 성공적으로 가져왔습니다. 페이지를 새로고침합니다.');

          NotificationCenter.add({
            title: '데이터 가져오기 완료',
            description: '모든 데이터가 복원되었습니다.',
            type: 'success'
          });

          // 페이지 새로고침
          setTimeout(() => {
            window.location.reload();
          }, 2000);

          resolve(data);
        } catch (error) {
          console.error('데이터 가져오기 실패:', error);
          reject('파일 읽기 중 오류가 발생했습니다.');
        }
      };

      reader.onerror = () => {
        reject('파일 읽기 중 오류가 발생했습니다.');
      };

      reader.readAsText(file);
    });
  },

  /**
   * 설정 초기화
   */
  resetToDefault() {
    if (Utils.confirm('모든 설정을 초기화하시겠습니까? 데이터는 유지됩니다.')) {
      this.save(this.defaults);
      Utils.showSuccess('설정이 초기화되었습니다. 페이지를 새로고침합니다.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  },

  /**
   * 모든 데이터 삭제
   */
  deleteAllData() {
    const confirmText = '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.\n\n계속하려면 "DELETE"를 입력하세요.';
    const userInput = prompt(confirmText);

    if (userInput === 'DELETE') {
      // 모든 데이터 삭제
      localStorage.clear();

      Utils.showSuccess('모든 데이터가 삭제되었습니다. 페이지를 새로고침합니다.');

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else if (userInput !== null) {
      Utils.showError('입력이 올바르지 않습니다.');
    }
  },

  /**
   * 설정 페이지 렌더링
   */
  renderSettingsPage() {
    const settings = this.load();

    return `
      <div class="settings-container">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">⚙️ 설정</h1>
          <p class="text-gray-600">StartupHR Pro 설정을 관리하세요</p>
        </div>

        <!-- 설정 탭 -->
        <div class="settings-tabs">
          <button class="settings-tab active" data-tab="company">
            🏢 회사 정보
          </button>
          <button class="settings-tab" data-tab="user">
            👤 내 프로필
          </button>
          <button class="settings-tab" data-tab="notifications">
            🔔 알림 설정
          </button>
          <button class="settings-tab" data-tab="dashboard">
            📊 대시보드
          </button>
          <button class="settings-tab" data-tab="data">
            💾 데이터 관리
          </button>
          <button class="settings-tab" data-tab="system">
            🔧 시스템
          </button>
        </div>

        <!-- 회사 정보 -->
        <div id="tab-company" class="settings-tab-content">
          ${this.renderCompanySettings(settings.company)}
        </div>

        <!-- 사용자 프로필 -->
        <div id="tab-user" class="settings-tab-content" style="display: none;">
          ${this.renderUserSettings(settings.user)}
        </div>

        <!-- 알림 설정 -->
        <div id="tab-notifications" class="settings-tab-content" style="display: none;">
          ${this.renderNotificationSettings(settings.notifications)}
        </div>

        <!-- 대시보드 설정 -->
        <div id="tab-dashboard" class="settings-tab-content" style="display: none;">
          ${this.renderDashboardSettings(settings.dashboard)}
        </div>

        <!-- 데이터 관리 -->
        <div id="tab-data" class="settings-tab-content" style="display: none;">
          ${this.renderDataManagement()}
        </div>

        <!-- 시스템 설정 -->
        <div id="tab-system" class="settings-tab-content" style="display: none;">
          ${this.renderSystemSettings(settings.system)}
        </div>
      </div>
    `;
  },

  /**
   * 회사 정보 설정 렌더링
   */
  renderCompanySettings(company) {
    const logo = company.logo || PhotoManager.getPhoto('company', 'logo');

    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <div>
            <div class="settings-section-title">회사 정보</div>
            <div class="settings-section-description">회사의 기본 정보를 설정하세요</div>
          </div>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">회사 로고</label>
          <div class="logo-upload-area ${logo ? 'has-image' : ''}" onclick="document.getElementById('logoUpload').click()">
            <input type="file" id="logoUpload" accept="image/*" style="display: none;"
                   onchange="SettingsManager.handleLogoUpload(this)">
            ${logo ? `<img src="${logo}" class="logo-preview" alt="Company Logo">` : `
              <div class="logo-upload-text">
                <div class="text-4xl mb-2">🖼️</div>
                <div class="font-medium">클릭하여 로고 업로드</div>
                <div class="text-xs text-gray-500 mt-1">PNG, JPG (최대 5MB)</div>
              </div>
            `}
          </div>
          ${logo ? `<button class="btn btn-ghost mt-2" onclick="SettingsManager.removeLogo()">로고 삭제</button>` : ''}
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">회사명</label>
          <input type="text" id="companyName" class="settings-form-input"
                 value="${company.name}" placeholder="회사명을 입력하세요">
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">사업자등록번호</label>
          <input type="text" id="businessNumber" class="settings-form-input"
                 value="${company.businessNumber || ''}" placeholder="000-00-00000">
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">주소</label>
          <input type="text" id="companyAddress" class="settings-form-input"
                 value="${company.address || ''}" placeholder="회사 주소를 입력하세요">
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">전화번호</label>
          <input type="tel" id="companyPhone" class="settings-form-input"
                 value="${company.phone || ''}" placeholder="02-0000-0000">
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">브랜드 색상</label>
          <div class="color-picker-group">
            <div>
              <label class="text-sm text-gray-600">Primary Color</label>
              <div class="color-picker">
                <input type="color" id="primaryColor" class="color-preview"
                       value="${company.primaryColor}"
                       onchange="SettingsManager.updateColorPreview('primary', this.value)">
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-600">Secondary Color</label>
              <div class="color-picker">
                <input type="color" id="secondaryColor" class="color-preview"
                       value="${company.secondaryColor}"
                       onchange="SettingsManager.updateColorPreview('secondary', this.value)">
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button class="btn btn-primary" onclick="SettingsManager.saveCompanySettings()">
            💾 저장
          </button>
          <button class="btn btn-ghost" onclick="App.renderPage('dashboard')">
            취소
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 사용자 설정 렌더링
   */
  renderUserSettings(user) {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <div>
            <div class="settings-section-title">내 프로필</div>
            <div class="settings-section-description">사용자 정보를 관리하세요</div>
          </div>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">프로필 사진</label>
          <div class="flex items-center gap-4">
            ${PhotoManager.renderPhotoUpload('user', user.name, 'user')}
            <div class="text-sm text-gray-600">
              <div class="font-medium mb-1">사진을 클릭하여 변경</div>
              <div class="text-xs">JPG, PNG (최대 5MB)</div>
            </div>
          </div>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">이름</label>
          <input type="text" id="userName" class="settings-form-input"
                 value="${user.name}" placeholder="이름을 입력하세요">
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">직책</label>
          <input type="text" id="userPosition" class="settings-form-input"
                 value="${user.position}" placeholder="직책을 입력하세요">
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">이메일</label>
          <input type="email" id="userEmail" class="settings-form-input"
                 value="${user.email || ''}" placeholder="email@example.com">
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">전화번호</label>
          <input type="tel" id="userPhone" class="settings-form-input"
                 value="${user.phone || ''}" placeholder="010-0000-0000">
        </div>

        <div class="flex gap-3 mt-6">
          <button class="btn btn-primary" onclick="SettingsManager.saveUserSettings()">
            💾 저장
          </button>
          <button class="btn btn-ghost" onclick="App.renderPage('dashboard')">
            취소
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 알림 설정 렌더링
   */
  renderNotificationSettings(notifications) {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <div>
            <div class="settings-section-title">알림 설정</div>
            <div class="settings-section-description">받을 알림을 선택하세요</div>
          </div>
        </div>

        ${this.renderToggleSetting('email', '이메일 알림', '중요한 알림을 이메일로 받습니다', notifications.email)}
        ${this.renderToggleSetting('push', '푸시 알림', '브라우저 푸시 알림을 받습니다', notifications.push)}
        ${this.renderToggleSetting('weekly52h', '52시간 초과 알림', '주 52시간 초과 시 즉시 알림', notifications.weekly52h)}
        ${this.renderToggleSetting('contractExpiry', '계약 만료 알림', '계약 만료 7일 전 알림', notifications.contractExpiry)}
        ${this.renderToggleSetting('legalRisk', '법적 리스크 알림', '높은 법적 리스크 감지 시 알림', notifications.legalRisk)}
        ${this.renderToggleSetting('dailyBriefing', '일일 브리핑', '매일 오전 HR 브리핑 수신', notifications.dailyBriefing)}

        <div class="flex gap-3 mt-6">
          <button class="btn btn-primary" onclick="SettingsManager.saveNotificationSettings()">
            💾 저장
          </button>
          <button class="btn btn-ghost" onclick="App.renderPage('dashboard')">
            취소
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 대시보드 설정 렌더링
   */
  renderDashboardSettings(dashboard) {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <div>
            <div class="settings-section-title">대시보드 설정</div>
            <div class="settings-section-description">대시보드를 개인화하세요</div>
          </div>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">테마</label>
          <div class="flex gap-3">
            <button class="btn ${dashboard.theme === 'light' ? 'btn-primary' : 'btn-ghost'}"
                    onclick="SettingsManager.updateTheme('light')">
              ☀️ 라이트 모드
            </button>
            <button class="btn ${dashboard.theme === 'dark' ? 'btn-primary' : 'btn-ghost'}"
                    onclick="SettingsManager.updateTheme('dark')">
              🌙 다크 모드
            </button>
          </div>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">위젯 표시</label>
          <div class="space-y-2">
            ${this.renderCheckboxSetting('stats', '📊 통계 카드', dashboard.widgets.includes('stats'))}
            ${this.renderCheckboxSetting('charts', '📈 차트', dashboard.widgets.includes('charts'))}
            ${this.renderCheckboxSetting('alerts', '⚠️ 알림', dashboard.widgets.includes('alerts'))}
            ${this.renderCheckboxSetting('recent', '🕐 최근 활동', dashboard.widgets.includes('recent'))}
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button class="btn btn-primary" onclick="SettingsManager.saveDashboardSettings()">
            💾 저장
          </button>
          <button class="btn btn-ghost" onclick="App.renderPage('dashboard')">
            취소
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 데이터 관리 렌더링
   */
  renderDataManagement() {
    const stats = {
      employees: db.getAll('employees').length,
      contracts: db.getAll('contracts').length,
      attendance: db.getAll('attendance').length,
      total: 0
    };
    stats.total = stats.employees + stats.contracts + stats.attendance;

    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <div>
            <div class="settings-section-title">데이터 관리</div>
            <div class="settings-section-description">데이터를 백업하고 복원하세요</div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="font-semibold text-blue-900 mb-2">📊 현재 데이터 현황</div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div class="text-2xl font-bold text-blue-600">${stats.employees}</div>
              <div class="text-sm text-blue-800">직원</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">${stats.contracts}</div>
              <div class="text-sm text-blue-800">계약서</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">${stats.attendance}</div>
              <div class="text-sm text-blue-800">근태 기록</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">${stats.total}</div>
              <div class="text-sm text-blue-800">전체</div>
            </div>
          </div>
        </div>

        <div class="import-export-area">
          <div class="export-box" onclick="SettingsManager.exportAllData()">
            <div class="export-icon">💾</div>
            <div class="font-semibold text-lg mb-2">데이터 내보내기</div>
            <div class="text-sm text-gray-600">
              모든 데이터를 JSON 파일로 저장합니다
            </div>
          </div>

          <div class="import-box" onclick="document.getElementById('importFile').click()">
            <input type="file" id="importFile" accept=".json" style="display: none;"
                   onchange="SettingsManager.handleImport(this)">
            <div class="import-icon">📥</div>
            <div class="font-semibold text-lg mb-2">데이터 가져오기</div>
            <div class="text-sm text-gray-600">
              백업 파일에서 데이터를 복원합니다
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div class="font-semibold text-yellow-900 mb-2">⚠️ 위험 구역</div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-yellow-900">설정 초기화</div>
                <div class="text-sm text-yellow-800">설정을 기본값으로 되돌립니다 (데이터 유지)</div>
              </div>
              <button class="btn btn-warning" onclick="SettingsManager.resetToDefault()">
                초기화
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-red-900">모든 데이터 삭제</div>
                <div class="text-sm text-red-800">⚠️ 복구 불가능! 모든 데이터가 영구 삭제됩니다</div>
              </div>
              <button class="btn btn-danger" onclick="SettingsManager.deleteAllData()">
                전체 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 시스템 설정 렌더링
   */
  renderSystemSettings(system) {
    return `
      <div class="settings-section">
        <div class="settings-section-header">
          <div>
            <div class="settings-section-title">시스템 설정</div>
            <div class="settings-section-description">시스템 기본 설정을 관리하세요</div>
          </div>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">언어</label>
          <select id="systemLanguage" class="settings-form-input">
            <option value="ko" ${system.language === 'ko' ? 'selected' : ''}>한국어</option>
            <option value="en" ${system.language === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">시간대</label>
          <select id="systemTimezone" class="settings-form-input">
            <option value="Asia/Seoul" ${system.timezone === 'Asia/Seoul' ? 'selected' : ''}>Asia/Seoul (KST)</option>
            <option value="UTC" ${system.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
          </select>
        </div>

        <div class="settings-form-group">
          <label class="settings-form-label">날짜 형식</label>
          <select id="systemDateFormat" class="settings-form-input">
            <option value="YYYY-MM-DD" ${system.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
            <option value="YYYY.MM.DD" ${system.dateFormat === 'YYYY.MM.DD' ? 'selected' : ''}>YYYY.MM.DD</option>
            <option value="MM/DD/YYYY" ${system.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
          </select>
        </div>

        ${this.renderToggleSetting('autoSave', '자동 저장', '변경사항을 자동으로 저장합니다', system.autoSave)}
        ${this.renderToggleSetting('autoBackup', '자동 백업', '매일 자동으로 데이터를 백업합니다', system.autoBackup)}

        <div class="flex gap-3 mt-6">
          <button class="btn btn-primary" onclick="SettingsManager.saveSystemSettings()">
            💾 저장
          </button>
          <button class="btn btn-ghost" onclick="App.renderPage('dashboard')">
            취소
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 토글 설정 렌더링 헬퍼
   */
  renderToggleSetting(id, title, description, checked) {
    return `
      <div class="flex items-center justify-between py-3 border-b border-gray-200">
        <div>
          <div class="font-medium text-gray-900">${title}</div>
          <div class="text-sm text-gray-600">${description}</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    `;
  },

  /**
   * 체크박스 설정 렌더링 헬퍼
   */
  renderCheckboxSetting(id, label, checked) {
    return `
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" id="widget-${id}" class="action-checkbox" ${checked ? 'checked' : ''}>
        <span class="text-gray-700">${label}</span>
      </label>
    `;
  },

  // ===== 이벤트 핸들러 =====

  handleLogoUpload(input) {
    const file = input.files[0];
    if (file) {
      this.uploadLogo(file)
        .then(() => {
          App.renderPage('settings');
        })
        .catch((error) => {
          Utils.showError(error);
        });
    }
  },

  removeLogo() {
    if (Utils.confirm('로고를 삭제하시겠습니까?')) {
      PhotoManager.deletePhoto('company', 'logo');
      this.updateCompany({ logo: null });
      App.renderPage('settings');
    }
  },

  updateColorPreview(type, value) {
    // 실시간 미리보기
    if (type === 'primary') {
      document.documentElement.style.setProperty('--primary-500', value);
    } else if (type === 'secondary') {
      document.documentElement.style.setProperty('--secondary-500', value);
    }
  },

  handleImport(input) {
    const file = input.files[0];
    if (file) {
      this.importData(file)
        .catch((error) => {
          Utils.showError(error);
        });
    }
  },

  // ===== 저장 함수들 =====

  saveCompanySettings() {
    const data = {
      name: document.getElementById('companyName').value,
      businessNumber: document.getElementById('businessNumber').value,
      address: document.getElementById('companyAddress').value,
      phone: document.getElementById('companyPhone').value,
      primaryColor: document.getElementById('primaryColor').value,
      secondaryColor: document.getElementById('secondaryColor').value
    };

    if (this.updateCompany(data)) {
      this.updateColors(data.primaryColor, data.secondaryColor);
    }
  },

  saveUserSettings() {
    const data = {
      name: document.getElementById('userName').value,
      position: document.getElementById('userPosition').value,
      email: document.getElementById('userEmail').value,
      phone: document.getElementById('userPhone').value
    };

    this.updateUser(data);
  },

  saveNotificationSettings() {
    const data = {
      email: document.getElementById('email').checked,
      push: document.getElementById('push').checked,
      weekly52h: document.getElementById('weekly52h').checked,
      contractExpiry: document.getElementById('contractExpiry').checked,
      legalRisk: document.getElementById('legalRisk').checked,
      dailyBriefing: document.getElementById('dailyBriefing').checked
    };

    this.updateNotifications(data);
  },

  saveDashboardSettings() {
    const widgets = [];
    ['stats', 'charts', 'alerts', 'recent'].forEach(widget => {
      if (document.getElementById(`widget-${widget}`)?.checked) {
        widgets.push(widget);
      }
    });

    const settings = this.load();
    this.updateDashboard({
      ...settings.dashboard,
      widgets
    });
  },

  saveSystemSettings() {
    const data = {
      language: document.getElementById('systemLanguage').value,
      timezone: document.getElementById('systemTimezone').value,
      dateFormat: document.getElementById('systemDateFormat').value,
      autoSave: document.getElementById('autoSave').checked,
      autoBackup: document.getElementById('autoBackup').checked
    };

    this.updateSystem(data);
  }
};

// 전역 사용을 위한 export
window.SettingsManager = SettingsManager;
