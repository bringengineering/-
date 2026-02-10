/**
 * StartupHR Pro - Main Application
 * SPA 라우팅 및 UI 렌더링
 */

const App = {
  currentPage: 'dashboard',
  charts: {}, // Chart.js 인스턴스 저장

  init() {
    console.log('🚀 StartupHR Pro 시작');

    // 이벤트 리스너 등록
    this.setupEventListeners();

    // 초기 페이지 렌더링
    this.renderPage('dashboard');

    // 샘플 데이터 추가 (테스트용)
    this.addSampleAttendance();

    // 모달 외부 클릭 시 닫기 설정
    this.setupModalCloseOnOutsideClick();
  },

  setupEventListeners() {
    // 네비게이션
    document.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.closest('[data-page]').dataset.page;
        this.renderPage(page);
      });
    });
  },

  setupModalCloseOnOutsideClick() {
    document.addEventListener('click', (e) => {
      const modal = document.querySelector('.modal-overlay');
      if (modal && e.target === modal) {
        this.hideModal();
      }
    });
  },

  renderPage(page) {
    this.currentPage = page;

    // 네비게이션 활성화
    document.querySelectorAll('[data-page]').forEach(btn => {
      if (btn.dataset.page === page) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('text-gray-700', 'hover:bg-gray-100');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('text-gray-700', 'hover:bg-gray-100');
      }
    });

    // 콘텐츠 렌더링
    const content = document.getElementById('content');

    switch (page) {
      case 'dashboard':
        content.innerHTML = DashboardWidgets.renderDashboard();
        DashboardWidgets.initWidgets();
        break;
      case 'employees':
        content.innerHTML = this.renderEmployees();
        break;
      case 'contracts':
        content.innerHTML = this.renderContracts();
        break;
      case 'attendance':
        content.innerHTML = this.renderAttendance();
        break;
      case 'legal':
        content.innerHTML = this.renderLegalCheck();
        break;
      case 'conversations':
        content.innerHTML = this.renderConversations();
        break;
      case 'checklist':
        content.innerHTML = this.renderChecklist();
        break;
      case 'settings':
        content.innerHTML = SettingsManager.renderSettingsPage();
        break;
      case 'email-templates':
        content.innerHTML = EmailTemplates.renderTemplatesPage();
        break;
      default:
        content.innerHTML = DashboardWidgets.renderDashboard();
        DashboardWidgets.initWidgets();
    }

    // 페이지별 이벤트 리스너
    this.setupPageEvents(page);
  },

  renderDashboard() {
    const briefing = ChecklistManager.generateDailyBriefing();
    const summary = EmployeeManager.getDashboardSummary();
    const attendance = AttendanceManager.getDashboardSummary();
    const legal = LegalCheckManager.getDashboardSummary();

    const html = `
      <div class="space-y-6">
        <!-- 헤더 -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">대시보드</h1>
          <p class="text-gray-600 mt-1">${briefing.date} ${briefing.day}요일</p>
        </div>

        <!-- 긴급 알림 -->
        ${briefing.urgent.length > 0 ? `
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md animate-fade-in">
          <h3 class="font-bold text-red-800 mb-2">🚨 긴급 알림 (${briefing.urgent.length})</h3>
          <div class="space-y-2">
            ${briefing.urgent.map(alert => `
              <div class="text-sm">
                <span class="font-semibold">${alert.icon} ${alert.message}</span>
                <p class="text-red-700 ml-6">${alert.action}</p>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- 주요 지표 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">총 직원</div>
                <div class="text-3xl font-bold text-gray-900">${summary.active}명</div>
              </div>
              <div class="text-4xl">👥</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">평균 근무시간</div>
                <div class="text-3xl font-bold text-gray-900">${attendance.avgHours}h</div>
              </div>
              <div class="text-4xl">⏰</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">법적 리스크</div>
                <div class="text-3xl font-bold ${legal.avgScore >= 70 ? 'text-red-600' : legal.avgScore >= 50 ? 'text-yellow-600' : 'text-green-600'}">
                  ${legal.avgScore}/100
                </div>
              </div>
              <div class="text-4xl">⚖️</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">위험 직원</div>
                <div class="text-3xl font-bold ${summary.risky > 0 ? 'text-red-600' : 'text-green-600'}">
                  ${summary.risky}명
                </div>
              </div>
              <div class="text-4xl">${summary.risky > 0 ? '⚠️' : '✅'}</div>
            </div>
          </div>
        </div>

        <!-- 차트 섹션 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 주간 근무시간 차트 -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-bold mb-4">주간 근무시간 추이</h3>
            <canvas id="weeklyHoursChart" style="max-height: 300px;"></canvas>
          </div>

          <!-- 법적 리스크 분포 차트 -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-bold mb-4">법적 리스크 분포</h3>
            <canvas id="riskDistributionChart" style="max-height: 300px;"></canvas>
          </div>
        </div>

        <!-- 이번 주 근무시간 상세 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold mb-4">이번 주 근무시간 상세</h3>
          <div class="space-y-3">
            ${summary.weeklyStats.map(stat => `
              <div class="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex justify-between mb-2">
                  <span class="font-medium">${stat.employee.name}</span>
                  <span class="font-bold ${stat.check.status === 'danger' ? 'text-red-600' : stat.check.status === 'critical' ? 'text-orange-500' : stat.check.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                    ${stat.hours}h / 52h
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div class="h-3 rounded-full transition-all ${stat.check.status === 'danger' ? 'bg-red-600' : stat.check.status === 'critical' ? 'bg-orange-500' : stat.check.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}"
                       style="width: ${Math.min(100, (stat.hours / 52) * 100)}%"></div>
                </div>
                <div class="flex justify-between items-center mt-2">
                  <div class="text-xs text-gray-500">${stat.check.message}</div>
                  <button onclick="App.viewEmployeeDetail('${stat.employee.id}')"
                          class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    상세보기 →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="mt-4 pt-4 border-t">
            <div class="flex justify-between items-center text-sm text-gray-600">
              <span>52시간 기준선</span>
              <span class="text-red-600 font-medium">⚠️ 초과 시 즉시 조치</span>
            </div>
          </div>
        </div>

        <!-- 법적 리스크 TOP 3 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold mb-4">법적 리스크 TOP 3</h3>
          ${legal.topRisks.slice(0, 3).map((risk, idx) => `
            <div class="mb-3 p-4 rounded-lg ${risk.level === 'danger' ? 'bg-red-50 border border-red-200' : risk.level === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'} hover:shadow-md transition-shadow cursor-pointer"
                 onclick="App.viewEmployeeDetail('${risk.employee.id}')">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <span class="font-bold text-lg">${idx + 1}. ${risk.employee.name}</span>
                  <span class="ml-2 text-sm text-gray-600">${risk.employee.position}</span>
                </div>
                <span class="font-bold text-xl ${risk.level === 'danger' ? 'text-red-600' : risk.level === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                  ${risk.totalScore}점
                </span>
              </div>
              <div class="text-sm text-gray-700 mt-2">
                ${Object.values(risk.risks).filter(r => r.issues.length > 0).map(r => `• ${r.issues[0]}`).join('<br>')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 빠른 작업 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold mb-4">빠른 작업</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onclick="App.renderPage('employees')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">👥</div>
              <div class="font-medium">직원 관리</div>
            </button>
            <button onclick="App.renderPage('contracts')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">📄</div>
              <div class="font-medium">계약서 생성</div>
            </button>
            <button onclick="App.renderPage('attendance')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">⏰</div>
              <div class="font-medium">근태 기록</div>
            </button>
            <button onclick="App.renderPage('legal')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">⚖️</div>
              <div class="font-medium">법적 체크</div>
            </button>
          </div>
        </div>
      </div>
    `;

    // 다음 프레임에서 차트 렌더링
    setTimeout(() => {
      this.renderDashboardCharts(summary, legal);
    }, 100);

    return html;
  },

  renderEmployees() {
    const employees = EmployeeManager.getAll();
    const summary = EmployeeManager.getDashboardSummary();

    return `
      <div class="space-y-6">
        <!-- 헤더 -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">직원 관리</h1>
            <p class="text-gray-600 mt-1">총 ${summary.active}명 재직중</p>
          </div>
          <div class="flex gap-3">
            <button onclick="App.exportEmployeesCSV()"
                    class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span>📊</span>
              <span>CSV 내보내기</span>
            </button>
            <button onclick="App.showAddEmployeeModal()"
                    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
              <span class="text-xl">+</span>
              <span class="font-medium">직원 추가</span>
            </button>
          </div>
        </div>

        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="text-sm text-gray-600">재직중</div>
            <div class="text-2xl font-bold text-green-600">${summary.active}명</div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="text-sm text-gray-600">퇴사</div>
            <div class="text-2xl font-bold text-gray-600">${summary.inactive}명</div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="text-sm text-gray-600">평균 근속</div>
            <div class="text-2xl font-bold text-blue-600">${Math.round(summary.avgWorkingDays / 30)}개월</div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <div class="text-sm text-gray-600">위험 직원</div>
            <div class="text-2xl font-bold ${summary.risky > 0 ? 'text-red-600' : 'text-green-600'}">
              ${summary.risky}명
            </div>
          </div>
        </div>

        <!-- 검색 및 필터 -->
        <div class="bg-white p-4 rounded-lg shadow-md">
          <div class="flex gap-3">
            <input type="text" id="employeeSearch" placeholder="이름, 직책으로 검색..."
                   class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   oninput="App.filterEmployees()">
            <select id="employeeFilter" onchange="App.filterEmployees()"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">전체</option>
              <option value="active">재직중</option>
              <option value="inactive">퇴사</option>
              <option value="risky">위험직원</option>
            </select>
          </div>
        </div>

        <!-- 직원 테이블 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full" id="employeeTable">
              <thead class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold">이름</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold">직책</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold">입사일</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold">근속일</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold">상태</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold">주간 근무</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold">리스크</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold">작업</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200" id="employeeTableBody">
                ${employees.map(emp => {
                  const detail = EmployeeManager.getDetail(emp.id);
                  const legalCheck = LegalCheckManager.checkEmployee(emp.id);
                  return `
                    <tr class="hover:bg-gray-50 transition-colors employee-row"
                        data-status="${emp.status}"
                        data-risky="${legalCheck.totalScore >= 70 ? 'true' : 'false'}"
                        data-name="${emp.name.toLowerCase()}"
                        data-position="${emp.position.toLowerCase()}">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                            ${emp.name.charAt(0)}
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">${emp.name}</div>
                            <div class="text-sm text-gray-500">${emp.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">${emp.position}</div>
                        <div class="text-xs text-gray-500">${emp.employment_type}</div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">
                        ${Utils.formatDate(emp.hire_date, 'YYYY.MM.DD')}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">
                        ${detail.workingDays}일
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                          ${emp.status === 'active' ? '재직' : '퇴사'}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <span class="font-bold ${detail.hourCheck.status === 'danger' ? 'text-red-600' : detail.hourCheck.status === 'critical' ? 'text-orange-500' : detail.hourCheck.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                            ${detail.weeklyHours}h
                          </span>
                          ${detail.hourCheck.status === 'danger' ? '<span class="text-red-600">⚠️</span>' : ''}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <span class="font-bold ${legalCheck.color === 'red' ? 'text-red-600' : legalCheck.color === 'yellow' || legalCheck.color === 'orange' ? 'text-yellow-600' : 'text-green-600'}">
                            ${legalCheck.totalScore}
                          </span>
                          ${legalCheck.totalScore >= 70 ? '<span class="text-red-600">🚨</span>' : legalCheck.totalScore >= 50 ? '<span class="text-yellow-600">⚠️</span>' : '<span class="text-green-600">✓</span>'}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button onclick="App.viewEmployeeDetail('${emp.id}')"
                                  class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            상세
                          </button>
                          <button onclick="App.showAddEmployeeModal('${emp.id}')"
                                  class="text-gray-600 hover:text-gray-800 font-medium text-sm">
                            수정
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          ${employees.length === 0 ? `
            <div class="text-center py-12">
              <div class="text-6xl mb-4">👥</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">직원이 없습니다</h3>
              <p class="text-gray-600 mb-4">첫 직원을 추가해보세요!</p>
              <button onclick="App.showAddEmployeeModal()"
                      class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                직원 추가하기
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // 직원 필터링
  filterEmployees() {
    const searchTerm = document.getElementById('employeeSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('employeeFilter')?.value || 'all';
    const rows = document.querySelectorAll('.employee-row');

    rows.forEach(row => {
      const name = row.dataset.name;
      const position = row.dataset.position;
      const status = row.dataset.status;
      const isRisky = row.dataset.risky === 'true';

      let matchesSearch = name.includes(searchTerm) || position.includes(searchTerm);
      let matchesFilter = true;

      if (filter === 'active') matchesFilter = status === 'active';
      else if (filter === 'inactive') matchesFilter = status === 'inactive';
      else if (filter === 'risky') matchesFilter = isRisky;

      row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
    });
  },

  // CSV 내보내기
  exportEmployeesCSV() {
    const employees = EmployeeManager.getAll();
    let csv = 'ID,이름,직책,이메일,전화번호,입사일,근무형태,연봉,상태\n';

    employees.forEach(emp => {
      csv += `${emp.id},"${emp.name}","${emp.position}","${emp.email || ''}","${emp.phone || ''}","${emp.hire_date}","${emp.employment_type}","${emp.salary || ''}","${emp.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `직원목록_${Utils.formatDate(new Date())}.csv`;
    link.click();

    Utils.showSuccess('CSV 파일이 다운로드되었습니다.');
  },

  renderContracts() {
    return `
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">계약서 관리</h1>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-gray-600">계약서 생성 기능은 직원 관리 페이지에서 이용하실 수 있습니다.</p>
          <button onclick="App.renderPage('employees')"
                  class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            직원 관리로 이동
          </button>
        </div>
      </div>
    `;
  },

  renderAttendance() {
    const summary = AttendanceManager.getDashboardSummary();

    const html = `
      <div class="space-y-6">
        <!-- 헤더 -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">근태 관리</h1>
            <p class="text-gray-600 mt-1">이번 주 ${summary.weekStart}~</p>
          </div>
          <div class="flex gap-3">
            <button onclick="App.exportAttendanceReport()"
                    class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span>📊</span>
              <span>보고서 내보내기</span>
            </button>
            <button onclick="App.showAddAttendanceModal()"
                    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
              <span class="text-xl">+</span>
              <span class="font-medium">근태 추가</span>
            </button>
          </div>
        </div>

        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">전체 직원</div>
                <div class="text-3xl font-bold text-gray-900">${summary.totalEmployees}명</div>
              </div>
              <div class="text-4xl">👥</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">평균 근무시간</div>
                <div class="text-3xl font-bold text-blue-600">${summary.avgHours}h</div>
              </div>
              <div class="text-4xl">⏰</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">52시간 위반</div>
                <div class="text-3xl font-bold ${summary.violators > 0 ? 'text-red-600' : 'text-green-600'}">
                  ${summary.violators}명
                </div>
              </div>
              <div class="text-4xl">${summary.violators > 0 ? '⚠️' : '✅'}</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">총 근무시간</div>
                <div class="text-3xl font-bold text-purple-600">
                  ${summary.allStats.reduce((acc, s) => acc + s.totalHours, 0)}h
                </div>
              </div>
              <div class="text-4xl">📈</div>
            </div>
          </div>
        </div>

        <!-- 차트 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold mb-4">주간 근무시간 분석</h3>
          <canvas id="attendanceChart" style="max-height: 300px;"></canvas>
        </div>

        <!-- 직원별 근무시간 상세 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold mb-4">직원별 근무시간 상세</h3>
          <div class="space-y-4">
            ${summary.allStats.map(stat => `
              <div class="border rounded-lg p-4 hover:shadow-md transition-shadow ${stat.check.status === 'danger' ? 'border-red-300 bg-red-50' : stat.check.status === 'critical' ? 'border-orange-300 bg-orange-50' : stat.check.status === 'warning' ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'}">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <div class="font-bold text-lg text-gray-900">${stat.employee.name}</div>
                    <div class="text-sm text-gray-600">${stat.employee.position}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold ${stat.check.color === 'red' ? 'text-red-600' : stat.check.color === 'orange' ? 'text-orange-500' : stat.check.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}">
                      ${stat.totalHours}h
                    </div>
                    <div class="text-sm text-gray-600">/ 52h</div>
                  </div>
                </div>

                <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div class="h-3 rounded-full transition-all ${stat.check.status === 'danger' ? 'bg-red-600' : stat.check.status === 'critical' ? 'bg-orange-500' : stat.check.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}"
                       style="width: ${Math.min(100, (stat.totalHours / 52) * 100)}%"></div>
                </div>

                <div class="flex items-center justify-between mb-3">
                  <div class="text-sm font-medium ${stat.check.color === 'red' ? 'text-red-700' : stat.check.color === 'orange' ? 'text-orange-700' : stat.check.color === 'yellow' ? 'text-yellow-700' : 'text-green-700'}">
                    ${stat.check.message}
                  </div>
                  <button onclick="App.viewEmployeeDetail('${stat.employee.id}')"
                          class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    상세보기 →
                  </button>
                </div>

                <div class="grid grid-cols-7 gap-2 text-xs">
                  ${stat.dailyBreakdown.map(day => `
                    <div class="text-center p-2 rounded ${day.hours > 8 ? 'bg-red-100 text-red-700' : day.hours > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}">
                      <div class="font-semibold">${day.day}</div>
                      <div class="mt-1">${day.hours}h</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 법정 기준 안내 -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 class="font-bold text-lg mb-3 text-gray-900">법정 근로시간 기준</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-white rounded-lg p-4">
              <div class="font-semibold text-gray-900 mb-2">주 52시간 제도</div>
              <p class="text-gray-700">1주 최대 52시간 (법정 40시간 + 연장 12시간)</p>
            </div>
            <div class="bg-white rounded-lg p-4">
              <div class="font-semibold text-gray-900 mb-2">하루 8시간</div>
              <p class="text-gray-700">법정 근로시간은 1일 8시간, 1주 40시간</p>
            </div>
            <div class="bg-white rounded-lg p-4">
              <div class="font-semibold text-gray-900 mb-2">초과 시 처벌</div>
              <p class="text-gray-700">위반 시 2년 이하 징역 또는 2천만원 이하 벌금</p>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.renderAttendanceChart(summary);
    }, 100);

    return html;
  },

  renderAttendanceChart(summary) {
    if (this.charts.attendance) this.charts.attendance.destroy();

    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    this.charts.attendance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: summary.allStats.map(s => s.employee.name),
        datasets: [{
          label: '주간 근무시간',
          data: summary.allStats.map(s => s.totalHours),
          backgroundColor: summary.allStats.map(s => {
            if (s.check.status === 'danger') return 'rgba(220, 38, 38, 0.8)';
            if (s.check.status === 'critical') return 'rgba(249, 115, 22, 0.8)';
            if (s.check.status === 'warning') return 'rgba(234, 179, 8, 0.8)';
            return 'rgba(34, 197, 94, 0.8)';
          }),
          borderColor: summary.allStats.map(s => {
            if (s.check.status === 'danger') return 'rgb(220, 38, 38)';
            if (s.check.status === 'critical') return 'rgb(249, 115, 22)';
            if (s.check.status === 'warning') return 'rgb(234, 179, 8)';
            return 'rgb(34, 197, 94)';
          }),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const stat = summary.allStats[context.dataIndex];
                return stat.check.message;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 60,
            ticks: {
              callback: (value) => value + 'h'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  },

  showAddAttendanceModal() {
    const employees = EmployeeManager.getAll();

    const content = `
      <form id="attendanceForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">직원 선택 *</label>
          <select name="employee_id" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">직원을 선택하세요</option>
            ${employees.filter(e => e.status === 'active').map(e => `
              <option value="${e.id}">${e.name} - ${e.position}</option>
            `).join('')}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">날짜 *</label>
          <input type="date" name="date" required value="${Utils.formatDate(new Date())}"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">출근 시간 *</label>
            <input type="time" name="clock_in" required value="09:00"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">퇴근 시간 *</label>
            <input type="time" name="clock_out" required value="18:00"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">메모</label>
          <textarea name="note" rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="근무 관련 메모를 입력하세요..."></textarea>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">
            <strong>TIP:</strong> 근무시간은 자동으로 계산됩니다. 점심시간 1시간은 자동으로 제외됩니다.
          </p>
        </div>
      </form>
    `;

    const footer = `
      <button type="button" onclick="App.hideModal()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        취소
      </button>
      <button type="button" onclick="App.saveAttendance()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        추가하기
      </button>
    `;

    this.showModal('근태 기록 추가', content, { footer });
  },

  saveAttendance() {
    const form = document.getElementById('attendanceForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const clockIn = formData.get('clock_in');
    const clockOut = formData.get('clock_out');

    // 근무시간 계산 (점심시간 1시간 제외)
    const [inHour, inMin] = clockIn.split(':').map(Number);
    const [outHour, outMin] = clockOut.split(':').map(Number);
    const hours = (outHour * 60 + outMin - inHour * 60 - inMin) / 60 - 1; // 점심시간 1시간 제외

    if (hours <= 0) {
      Utils.showError('퇴근 시간이 출근 시간보다 빠릅니다.');
      return;
    }

    const data = {
      employee_id: formData.get('employee_id'),
      date: formData.get('date'),
      clock_in: clockIn,
      clock_out: clockOut,
      hours: Math.round(hours * 10) / 10,
      note: formData.get('note') || ''
    };

    AttendanceManager.create(data);
    Utils.showSuccess('근태 기록이 추가되었습니다.');

    this.hideModal();
    this.renderPage('attendance');
  },

  exportAttendanceReport() {
    const summary = AttendanceManager.getDashboardSummary();
    let report = `근태 관리 보고서\n`;
    report += `작성일: ${Utils.formatDate(new Date())}\n`;
    report += `기간: ${summary.weekStart} ~ 이번 주\n\n`;
    report += `=== 요약 ===\n`;
    report += `전체 직원: ${summary.totalEmployees}명\n`;
    report += `평균 근무시간: ${summary.avgHours}시간\n`;
    report += `52시간 위반: ${summary.violators}명\n\n`;
    report += `=== 직원별 상세 ===\n`;

    summary.allStats.forEach(stat => {
      report += `\n${stat.employee.name} (${stat.employee.position})\n`;
      report += `  총 근무시간: ${stat.totalHours}시간\n`;
      report += `  상태: ${stat.check.message}\n`;
      report += `  일별: ${stat.dailyBreakdown.map(d => `${d.day}:${d.hours}h`).join(', ')}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `근태보고서_${Utils.formatDate(new Date())}.txt`;
    link.click();

    Utils.showSuccess('보고서가 다운로드되었습니다.');
  },

  renderLegalCheck() {
    const summary = LegalCheckManager.getDashboardSummary();

    const html = `
      <div class="space-y-6">
        <!-- 헤더 -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">법적 리스크 체크</h1>
            <p class="text-gray-600 mt-1">근로기준법 준수 현황 분석</p>
          </div>
          <button onclick="App.exportLegalReport()"
                  class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
            <span>📋</span>
            <span class="font-medium">리포트 다운로드</span>
          </button>
        </div>

        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">평균 리스크</div>
                <div class="text-3xl font-bold ${summary.avgScore >= 70 ? 'text-red-600' : summary.avgScore >= 50 ? 'text-yellow-600' : 'text-green-600'}">
                  ${summary.avgScore}
                </div>
              </div>
              <div class="text-4xl">⚖️</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">안전</div>
                <div class="text-3xl font-bold text-green-600">${summary.safeCount}명</div>
              </div>
              <div class="text-4xl">✅</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">주의</div>
                <div class="text-3xl font-bold text-yellow-600">${summary.warningCount}명</div>
              </div>
              <div class="text-4xl">⚠️</div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600 mb-1">위험</div>
                <div class="text-3xl font-bold text-red-600">${summary.dangerCount}명</div>
              </div>
              <div class="text-4xl">🚨</div>
            </div>
          </div>
        </div>

        <!-- 차트 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-bold mb-4">리스크 분포</h3>
            <canvas id="legalRiskChart" style="max-height: 250px;"></canvas>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-bold mb-4">카테고리별 평균 점수</h3>
            <canvas id="categoryScoreChart" style="max-height: 250px;"></canvas>
          </div>
        </div>

        <!-- 직원별 리스크 현황 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold mb-4">직원별 리스크 상세 분석</h3>
          <div class="space-y-4">
            ${summary.allResults.sort((a, b) => b.totalScore - a.totalScore).map((result, idx) => `
              <div class="border-l-4 ${result.level === 'danger' ? 'border-red-500 bg-red-50' : result.level === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'} rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                   onclick="App.viewEmployeeDetail('${result.employee.id}')">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xl font-bold">${idx + 1}.</span>
                      <span class="text-lg font-bold text-gray-900">${result.employee.name}</span>
                      <span class="text-sm text-gray-600">${result.employee.position}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold ${result.color === 'red' ? 'text-red-600' : result.color === 'orange' || result.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}">
                      ${result.totalScore}
                    </div>
                    <div class="text-sm text-gray-600">/ 100</div>
                  </div>
                </div>

                <div class="grid grid-cols-5 gap-3 mb-3">
                  ${Object.values(result.risks).map(risk => `
                    <div class="text-center p-2 rounded ${risk.status === 'danger' ? 'bg-red-100' : risk.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}">
                      <div class="text-xs text-gray-600 mb-1">${risk.category}</div>
                      <div class="text-lg font-bold ${risk.status === 'danger' ? 'text-red-600' : risk.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                        ${risk.score}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div class="space-y-1">
                  ${Object.values(result.risks).filter(risk => risk.issues.length > 0).map(risk => `
                    <div class="text-sm text-gray-700 flex items-start">
                      <span class="mr-2 ${risk.status === 'danger' ? 'text-red-600' : risk.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                        ${risk.status === 'danger' ? '🚨' : risk.status === 'warning' ? '⚠️' : '✓'}
                      </span>
                      <span><strong>${risk.category}:</strong> ${risk.issues.join(', ')}</span>
                    </div>
                  `).join('')}
                </div>

                <div class="mt-3 pt-3 border-t flex justify-end">
                  <span class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    상세보기 →
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 법적 기준 안내 -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 class="font-bold text-lg mb-4 text-gray-900">리스크 점수 기준</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">✅</span>
                <span class="font-semibold text-green-700">안전 (0-49점)</span>
              </div>
              <p class="text-sm text-gray-700">법적 리스크가 낮은 안전한 상태입니다.</p>
            </div>
            <div class="bg-white rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">⚠️</span>
                <span class="font-semibold text-yellow-700">주의 (50-69점)</span>
              </div>
              <p class="text-sm text-gray-700">일부 개선이 필요한 항목이 있습니다.</p>
            </div>
            <div class="bg-white rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">🚨</span>
                <span class="font-semibold text-red-700">위험 (70-100점)</span>
              </div>
              <p class="text-sm text-gray-700">즉시 조치가 필요한 위험한 상태입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.renderLegalCharts(summary);
    }, 100);

    return html;
  },

  renderLegalCharts(summary) {
    if (this.charts.legalRisk) this.charts.legalRisk.destroy();
    if (this.charts.categoryScore) this.charts.categoryScore.destroy();

    // 리스크 분포 차트
    const riskCtx = document.getElementById('legalRiskChart');
    if (riskCtx) {
      this.charts.legalRisk = new Chart(riskCtx, {
        type: 'doughnut',
        data: {
          labels: ['안전', '주의', '위험'],
          datasets: [{
            data: [summary.safeCount, summary.warningCount, summary.dangerCount],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(220, 38, 38, 0.8)'
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(234, 179, 8)',
              'rgb(220, 38, 38)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.parsed;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${context.label}: ${value}명 (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // 카테고리별 평균 점수 차트
    const categoryCtx = document.getElementById('categoryScoreChart');
    if (categoryCtx) {
      const categories = ['근로계약', '근로시간', '임금', '휴게휴가', '기타'];
      const avgScores = categories.map(cat => {
        const scores = summary.allResults.map(r => {
          const risk = Object.values(r.risks).find(risk => risk.category === cat);
          return risk ? risk.score : 0;
        });
        return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      });

      this.charts.categoryScore = new Chart(categoryCtx, {
        type: 'radar',
        data: {
          labels: categories,
          datasets: [{
            label: '평균 리스크 점수',
            data: avgScores,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(59, 130, 246)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  },

  exportLegalReport() {
    const summary = LegalCheckManager.getDashboardSummary();
    let report = `법적 리스크 분석 보고서\n`;
    report += `작성일: ${Utils.formatDate(new Date())}\n\n`;
    report += `=== 요약 ===\n`;
    report += `평균 리스크 점수: ${summary.avgScore}/100\n`;
    report += `안전: ${summary.safeCount}명\n`;
    report += `주의: ${summary.warningCount}명\n`;
    report += `위험: ${summary.dangerCount}명\n\n`;
    report += `=== 직원별 상세 ===\n`;

    summary.allResults.sort((a, b) => b.totalScore - a.totalScore).forEach((result, idx) => {
      report += `\n${idx + 1}. ${result.employee.name} (${result.employee.position})\n`;
      report += `   총점: ${result.totalScore}/100 [${result.level}]\n`;
      Object.values(result.risks).forEach(risk => {
        report += `   - ${risk.category}: ${risk.score}점\n`;
        risk.issues.forEach(issue => {
          report += `     • ${issue}\n`;
        });
      });
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `법적리스크보고서_${Utils.formatDate(new Date())}.txt`;
    link.click();

    Utils.showSuccess('보고서가 다운로드되었습니다.');
  },

  renderConversations() {
    return `
      <div class="space-y-6">
        <!-- 헤더 -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">대화 분석</h1>
          <p class="text-gray-600 mt-1">직원과의 대화에서 법적 리스크를 자동으로 감지합니다</p>
        </div>

        <!-- 안내 카드 -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 class="font-bold text-lg mb-3 text-gray-900">AI 대화 분석</h3>
          <p class="text-gray-700 mb-4">
            채팅, 이메일, 구두 대화 등을 입력하면 AI가 법적 리스크를 자동으로 분석합니다.
            퇴사, 임금, 근로시간, 부당 대우 등의 키워드를 감지하여 위험도를 평가합니다.
          </p>
          <div class="grid grid-cols-3 gap-3 text-sm">
            <div class="bg-white rounded-lg p-3">
              <div class="font-semibold text-red-700 mb-1">🚨 위험 키워드</div>
              <div class="text-gray-600">퇴사, 고소, 노동청, 부당해고</div>
            </div>
            <div class="bg-white rounded-lg p-3">
              <div class="font-semibold text-yellow-700 mb-1">⚠️ 주의 키워드</div>
              <div class="text-gray-600">불만, 야근, 임금, 휴가</div>
            </div>
            <div class="bg-white rounded-lg p-3">
              <div class="font-semibold text-blue-700 mb-1">ℹ️ 일반 키워드</div>
              <div class="text-gray-600">회의, 업무, 보고, 프로젝트</div>
            </div>
          </div>
        </div>

        <!-- 분석 입력 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h3 class="text-xl font-bold">대화 내용 입력</h3>
          </div>
          <div class="p-6">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">직원 선택 (선택사항)</label>
              <select id="conversationEmployee"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">선택 안함</option>
                ${EmployeeManager.getAll().filter(e => e.status === 'active').map(e => `
                  <option value="${e.id}">${e.name} - ${e.position}</option>
                `).join('')}
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">대화 내용</label>
              <textarea id="conversationInput"
                        class="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="예시:
직원: 요즘 야근이 너무 많아요. 주 52시간을 넘는 것 같은데...
대표: 스타트업이라 어쩔 수 없어. 조금만 참아줘.
직원: 하지만 법적으로 문제가 있는 거 아닌가요?
대표: 나중에 보상해줄게. 지금은 회사가 중요해.

위와 같이 실제 대화 내용을 입력하세요."></textarea>
            </div>

            <div class="flex justify-between items-center">
              <button onclick="App.clearConversationInput()"
                      class="text-gray-600 hover:text-gray-800 font-medium">
                초기화
              </button>
              <button onclick="App.analyzeConversation()"
                      class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium">
                <span>🔍</span>
                <span>AI 분석 시작</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 분석 결과 -->
        <div id="analysisResult"></div>
      </div>
    `;
  },

  clearConversationInput() {
    document.getElementById('conversationInput').value = '';
    document.getElementById('analysisResult').innerHTML = '';
  },

  renderChecklist() {
    const briefing = ChecklistManager.generateDailyBriefing();
    const today = Utils.formatDate(new Date());
    const checklist = ChecklistManager.getChecklist(today);

    return `
      <div class="space-y-6">
        <!-- 헤더 -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">일일 체크리스트</h1>
            <p class="text-gray-600 mt-1">${briefing.date} ${briefing.day}요일</p>
          </div>
          <div class="flex gap-3">
            <button onclick="App.addCustomChecklistItem()"
                    class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span>+</span>
              <span>항목 추가</span>
            </button>
            <button onclick="ChecklistManager.downloadDailyReport()"
                    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
              <span>📊</span>
              <span class="font-medium">일일 리포트</span>
            </button>
          </div>
        </div>

        <!-- 진행률 카드 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div class="flex items-center justify-between text-white">
              <div>
                <div class="text-sm opacity-90 mb-1">오늘의 완료율</div>
                <div class="text-4xl font-bold">${checklist.completion_rate}%</div>
              </div>
              <div class="text-6xl">
                ${checklist.completion_rate === 100 ? '🎉' : checklist.completion_rate >= 70 ? '💪' : checklist.completion_rate >= 40 ? '📝' : '⏰'}
              </div>
            </div>
            <div class="mt-4 bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
              <div class="bg-white h-3 rounded-full transition-all duration-500"
                   style="width: ${checklist.completion_rate}%"></div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-gray-900">${checklist.items.length}</div>
                <div class="text-sm text-gray-600">전체 항목</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">${checklist.items.filter(i => i.done).length}</div>
                <div class="text-sm text-gray-600">완료</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-blue-600">${checklist.items.filter(i => !i.done).length}</div>
                <div class="text-sm text-gray-600">남은 항목</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 체크리스트 항목들 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>오늘의 체크리스트</span>
          </h3>

          ${checklist.items.length === 0 ? `
            <div class="text-center py-12">
              <div class="text-6xl mb-4">📋</div>
              <h4 class="text-xl font-bold text-gray-900 mb-2">체크리스트가 비어있습니다</h4>
              <p class="text-gray-600 mb-4">새로운 항목을 추가해보세요!</p>
              <button onclick="App.addCustomChecklistItem()"
                      class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                항목 추가하기
              </button>
            </div>
          ` : `
            <div class="space-y-2">
              ${checklist.items.map(item => `
                <label class="flex items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border ${item.done ? 'border-green-200 bg-green-50' : 'border-gray-200'}">
                  <input type="checkbox" ${item.done ? 'checked' : ''}
                         class="w-6 h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                         onchange="App.toggleChecklistItem('${checklist.id}', ${item.id})">
                  <span class="ml-4 flex-1 ${item.done ? 'line-through text-gray-500' : 'text-gray-900 font-medium'}">
                    ${item.task}
                  </span>
                  <span class="ml-auto flex items-center gap-2">
                    <span class="text-xs px-3 py-1 rounded-full font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }">
                      ${item.priority === 'high' ? '높음' : item.priority === 'medium' ? '중간' : '낮음'}
                    </span>
                    ${item.done ? '<span class="text-2xl">✓</span>' : ''}
                  </span>
                </label>
              `).join('')}
            </div>
          `}
        </div>

        <!-- 알림 요약 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${briefing.urgent.length > 0 ? `
            <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h4 class="font-bold text-red-800 mb-3 flex items-center gap-2">
                <span>🚨</span>
                <span>긴급 (${briefing.urgent.length})</span>
              </h4>
              <div class="space-y-2">
                ${briefing.urgent.slice(0, 3).map(alert => `
                  <div class="text-sm text-red-700">
                    ${alert.icon} ${alert.message}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${briefing.important.length > 0 ? `
            <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h4 class="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>중요 (${briefing.important.length})</span>
              </h4>
              <div class="space-y-2">
                ${briefing.important.slice(0, 3).map(alert => `
                  <div class="text-sm text-yellow-700">
                    ${alert.icon} ${alert.message}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${briefing.normal.length > 0 ? `
            <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 class="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                <span>일반 (${briefing.normal.length})</span>
              </h4>
              <div class="space-y-2">
                ${briefing.normal.slice(0, 3).map(alert => `
                  <div class="text-sm text-blue-700">
                    ${alert.icon} ${alert.message}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 빠른 도구 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🛠️</span>
            <span>빠른 도구</span>
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onclick="ChecklistManager.downloadDailyReport()"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">📊</div>
              <div class="font-medium text-sm">일일 리포트</div>
            </button>
            <button onclick="App.exportAllData()"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">💾</div>
              <div class="font-medium text-sm">데이터 백업</div>
            </button>
            <button onclick="App.renderPage('legal')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">⚖️</div>
              <div class="font-medium text-sm">법적 체크</div>
            </button>
            <button onclick="App.renderPage('attendance')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md">
              <div class="text-3xl mb-2">⏰</div>
              <div class="font-medium text-sm">근태 관리</div>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  addCustomChecklistItem() {
    const content = `
      <form id="checklistItemForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">할 일 *</label>
          <input type="text" name="task" required
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="예: 직원 면담 진행">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">우선순위 *</label>
          <select name="priority" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="high">높음 - 긴급</option>
            <option value="medium" selected>중간 - 보통</option>
            <option value="low">낮음 - 여유</option>
          </select>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">
            <strong>TIP:</strong> 체크리스트는 매일 자동으로 생성되며, 완료된 항목은 다음날 초기화됩니다.
          </p>
        </div>
      </form>
    `;

    const footer = `
      <button type="button" onclick="App.hideModal()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        취소
      </button>
      <button type="button" onclick="App.saveChecklistItem()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        추가하기
      </button>
    `;

    this.showModal('체크리스트 항목 추가', content, { footer });
  },

  saveChecklistItem() {
    const form = document.getElementById('checklistItemForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const today = Utils.formatDate(new Date());
    const checklist = ChecklistManager.getChecklist(today);

    const newItem = {
      id: checklist.items.length + 1,
      task: formData.get('task'),
      priority: formData.get('priority'),
      done: false
    };

    checklist.items.push(newItem);
    db.update('checklists', checklist.id, checklist);

    Utils.showSuccess('체크리스트 항목이 추가되었습니다.');
    this.hideModal();
    this.renderPage('checklist');
  },

  setupPageEvents(page) {
    if (page === 'conversations') {
      // 대화 분석 페이지는 별도 처리 불필요
    }

    if (page === 'settings') {
      // 설정 탭 전환
      document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          const targetTab = e.target.dataset.tab;

          // 모든 탭 비활성화
          document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.settings-tab-content').forEach(c => c.style.display = 'none');

          // 선택된 탭 활성화
          e.target.classList.add('active');
          const content = document.getElementById(`tab-${targetTab}`);
          if (content) {
            content.style.display = 'block';
          }
        });
      });
    }
  },

  analyzeConversation() {
    const text = document.getElementById('conversationInput').value;
    if (!text.trim()) {
      Utils.showError('분석할 내용을 입력하세요.');
      return;
    }

    const employeeId = document.getElementById('conversationEmployee').value;
    const analysis = ConversationManager.analyze(text);
    const resultDiv = document.getElementById('analysisResult');

    let employeeInfo = '';
    if (employeeId) {
      const employee = EmployeeManager.get(employeeId);
      if (employee) {
        employeeInfo = `
          <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                ${employee.name.charAt(0)}
              </div>
              <div>
                <div class="font-bold text-gray-900">${employee.name}</div>
                <div class="text-sm text-gray-600">${employee.position}</div>
              </div>
              <button onclick="App.viewEmployeeDetail('${employee.id}')"
                      class="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium">
                직원 정보 보기 →
              </button>
            </div>
          </div>
        `;
      }
    }

    resultDiv.innerHTML = `
      <div class="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <span>🤖</span>
            <span>AI 분석 결과</span>
          </h3>
        </div>

        <div class="p-6 space-y-6">
          ${employeeInfo}

          <!-- 리스크 점수 -->
          <div class="text-center p-6 rounded-lg ${analysis.riskScore >= 70 ? 'bg-red-50 border-2 border-red-300' : analysis.riskScore >= 50 ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-green-50 border-2 border-green-300'}">
            <div class="text-sm font-medium text-gray-600 mb-2">전체 리스크 점수</div>
            <div class="text-6xl font-bold mb-2 ${analysis.riskScore >= 70 ? 'text-red-600' : analysis.riskScore >= 50 ? 'text-yellow-600' : 'text-green-600'}">
              ${analysis.riskScore}
            </div>
            <div class="text-gray-600">/ 100</div>
            <div class="mt-3 inline-block px-4 py-2 rounded-full ${analysis.riskScore >= 70 ? 'bg-red-200 text-red-800' : analysis.riskScore >= 50 ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'} font-semibold">
              ${analysis.riskScore >= 70 ? '🚨 즉시 조치 필요' : analysis.riskScore >= 50 ? '⚠️ 주의 요망' : '✅ 안전'}
            </div>
          </div>

          <!-- 키워드 분석 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border rounded-lg p-4">
              <h5 class="font-bold mb-3 flex items-center gap-2">
                <span class="text-red-600">🚨</span>
                <span>위험 키워드 (${analysis.criticalKeywords.length}개)</span>
              </h5>
              ${analysis.criticalKeywords.length > 0 ? `
                <div class="flex flex-wrap gap-2">
                  ${analysis.criticalKeywords.map(keyword => `
                    <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">${keyword}</span>
                  `).join('')}
                </div>
              ` : `
                <p class="text-gray-500 text-sm">감지된 위험 키워드가 없습니다.</p>
              `}
            </div>

            <div class="border rounded-lg p-4">
              <h5 class="font-bold mb-3 flex items-center gap-2">
                <span class="text-yellow-600">⚠️</span>
                <span>주의 키워드 (${analysis.warningKeywords.length}개)</span>
              </h5>
              ${analysis.warningKeywords.length > 0 ? `
                <div class="flex flex-wrap gap-2">
                  ${analysis.warningKeywords.map(keyword => `
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">${keyword}</span>
                  `).join('')}
                </div>
              ` : `
                <p class="text-gray-500 text-sm">감지된 주의 키워드가 없습니다.</p>
              `}
            </div>
          </div>

          <!-- 주요 이슈 -->
          <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h5 class="font-bold mb-3 flex items-center gap-2">
              <span>📌</span>
              <span>주요 이슈</span>
            </h5>
            <div class="space-y-2">
              ${analysis.summary.mainIssues.map(issue => `
                <div class="flex items-start gap-2">
                  <span class="text-blue-600 mt-1">•</span>
                  <span class="text-gray-700">${issue}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 권장 조치 -->
          <div class="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h5 class="font-bold mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>권장 조치 사항</span>
            </h5>
            <div class="space-y-2">
              ${analysis.summary.recommendations.map((rec, idx) => `
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                    ${idx + 1}
                  </span>
                  <span class="text-gray-700 flex-1">${rec}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex gap-3 pt-4 border-t">
            <button onclick="App.saveConversationAnalysis('${employeeId}', ${analysis.riskScore})"
                    class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              분석 결과 저장
            </button>
            <button onclick="App.downloadConversationReport('${employeeId}')"
                    class="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              보고서 다운로드
            </button>
          </div>
        </div>
      </div>
    `;

    // 결과로 스크롤
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  saveConversationAnalysis(employeeId, riskScore) {
    // 실제로는 DB에 저장해야 하지만, 여기서는 알림만 표시
    Utils.showSuccess('대화 분석 결과가 저장되었습니다.');
  },

  downloadConversationReport(employeeId) {
    const text = document.getElementById('conversationInput').value;
    const analysis = ConversationManager.analyze(text);

    let report = `대화 분석 보고서\n`;
    report += `작성일: ${Utils.formatDate(new Date())}\n\n`;

    if (employeeId) {
      const employee = EmployeeManager.get(employeeId);
      if (employee) {
        report += `직원: ${employee.name} (${employee.position})\n\n`;
      }
    }

    report += `=== 분석 결과 ===\n`;
    report += `리스크 점수: ${analysis.riskScore}/100\n`;
    report += `위험도: ${analysis.riskScore >= 70 ? '높음' : analysis.riskScore >= 50 ? '중간' : '낮음'}\n\n`;

    report += `위험 키워드 (${analysis.criticalKeywords.length}개):\n`;
    analysis.criticalKeywords.forEach(k => report += `  - ${k}\n`);
    report += `\n`;

    report += `주의 키워드 (${analysis.warningKeywords.length}개):\n`;
    analysis.warningKeywords.forEach(k => report += `  - ${k}\n`);
    report += `\n`;

    report += `주요 이슈:\n`;
    analysis.summary.mainIssues.forEach(i => report += `  - ${i}\n`);
    report += `\n`;

    report += `권장 조치:\n`;
    analysis.summary.recommendations.forEach((r, idx) => report += `  ${idx + 1}. ${r}\n`);
    report += `\n`;

    report += `=== 원본 대화 ===\n`;
    report += text;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `대화분석_${Utils.formatDate(new Date())}.txt`;
    link.click();

    Utils.showSuccess('보고서가 다운로드되었습니다.');
  },

  toggleChecklistItem(checklistId, itemId) {
    ChecklistManager.toggleItem(checklistId, itemId);
    this.renderPage('checklist');
  },

  exportAllData() {
    const data = db.exportAll();
    Utils.downloadJSON(data, `StartupHR_백업_${Utils.formatDate(new Date())}.json`);
  },

  addSampleAttendance() {
    // 샘플 근태 데이터 추가 (첫 실행 시)
    const attendance = db.getAll('attendance');
    if (attendance.length === 0) {
      const employees = db.getAll('employees');
      employees.forEach(emp => {
        AttendanceManager.addSampleData(emp.id, 5);
      });
    }
  },

  // ===== 차트 렌더링 =====
  renderDashboardCharts(summary, legal) {
    // 기존 차트 제거
    if (this.charts.weeklyHours) this.charts.weeklyHours.destroy();
    if (this.charts.riskDistribution) this.charts.riskDistribution.destroy();

    // 주간 근무시간 차트
    const weeklyCtx = document.getElementById('weeklyHoursChart');
    if (weeklyCtx) {
      this.charts.weeklyHours = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
          labels: summary.weeklyStats.map(s => s.employee.name),
          datasets: [{
            label: '주간 근무시간',
            data: summary.weeklyStats.map(s => s.hours),
            backgroundColor: summary.weeklyStats.map(s => {
              if (s.check.status === 'danger') return 'rgba(220, 38, 38, 0.8)';
              if (s.check.status === 'critical') return 'rgba(249, 115, 22, 0.8)';
              if (s.check.status === 'warning') return 'rgba(234, 179, 8, 0.8)';
              return 'rgba(34, 197, 94, 0.8)';
            }),
            borderColor: summary.weeklyStats.map(s => {
              if (s.check.status === 'danger') return 'rgb(220, 38, 38)';
              if (s.check.status === 'critical') return 'rgb(249, 115, 22)';
              if (s.check.status === 'warning') return 'rgb(234, 179, 8)';
              return 'rgb(34, 197, 94)';
            }),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const stat = summary.weeklyStats[context.dataIndex];
                  return [
                    `근무시간: ${stat.hours}시간`,
                    `상태: ${stat.check.message}`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 60,
              ticks: {
                callback: (value) => value + 'h'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: 52,
                  yMax: 52,
                  borderColor: 'rgb(220, 38, 38)',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    content: '법정 한계 (52시간)',
                    enabled: true,
                    position: 'end'
                  }
                }
              }
            }
          }
        }
      });
    }

    // 법적 리스크 분포 차트
    const riskCtx = document.getElementById('riskDistributionChart');
    if (riskCtx) {
      const riskLevels = { safe: 0, warning: 0, danger: 0 };
      legal.allResults.forEach(result => {
        if (result.totalScore < 50) riskLevels.safe++;
        else if (result.totalScore < 70) riskLevels.warning++;
        else riskLevels.danger++;
      });

      this.charts.riskDistribution = new Chart(riskCtx, {
        type: 'doughnut',
        data: {
          labels: ['안전', '주의', '위험'],
          datasets: [{
            data: [riskLevels.safe, riskLevels.warning, riskLevels.danger],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(220, 38, 38, 0.8)'
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(234, 179, 8)',
              'rgb(220, 38, 38)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.parsed;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value}명 (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  },

  // ===== 모달 시스템 =====
  showModal(title, content, options = {}) {
    const modalHTML = `
      <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="modal-content bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
          <div class="modal-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
            <h2 class="text-2xl font-bold">${title}</h2>
            <button onclick="App.hideModal()" class="text-white hover:text-gray-200 text-3xl leading-none">
              &times;
            </button>
          </div>
          <div class="modal-body p-6 overflow-y-auto" style="max-height: calc(90vh - 180px);">
            ${content}
          </div>
          ${options.footer ? `
            <div class="modal-footer border-t p-4 flex justify-end gap-2">
              ${options.footer}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const container = document.getElementById('modal-container');
    container.innerHTML = modalHTML;

    // ESC 키로 닫기
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  },

  hideModal() {
    const container = document.getElementById('modal-container');
    const modal = container.querySelector('.modal-overlay');

    if (modal) {
      modal.style.animation = 'fadeOut 0.2s ease-out';
      setTimeout(() => {
        container.innerHTML = '';
      }, 200);
    }
  },

  // ===== 직원 추가 모달 =====
  showAddEmployeeModal(employeeId = null) {
    const employee = employeeId ? EmployeeManager.get(employeeId) : null;
    const isEdit = !!employee;

    const content = `
      <form id="employeeForm" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
            <input type="text" name="name" value="${employee?.name || ''}" required
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="홍길동">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">직책 *</label>
            <input type="text" name="position" value="${employee?.position || ''}" required
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="개발자">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input type="email" name="email" value="${employee?.email || ''}"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="example@company.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
            <input type="tel" name="phone" value="${employee?.phone || ''}"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="010-1234-5678">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">입사일 *</label>
            <input type="date" name="hire_date" value="${employee?.hire_date || ''}" required
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">근무 형태 *</label>
            <select name="employment_type" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="full-time" ${employee?.employment_type === 'full-time' ? 'selected' : ''}>정규직</option>
              <option value="part-time" ${employee?.employment_type === 'part-time' ? 'selected' : ''}>파트타임</option>
              <option value="contract" ${employee?.employment_type === 'contract' ? 'selected' : ''}>계약직</option>
              <option value="intern" ${employee?.employment_type === 'intern' ? 'selected' : ''}>인턴</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">연봉 (만원)</label>
          <input type="number" name="salary" value="${employee?.salary || ''}"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="5000">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">상태</label>
          <select name="status"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="active" ${!employee || employee?.status === 'active' ? 'selected' : ''}>재직</option>
            <option value="inactive" ${employee?.status === 'inactive' ? 'selected' : ''}>퇴사</option>
          </select>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">
            <strong>주의:</strong> 입사일과 근무 형태는 법적 문서 생성에 중요한 정보입니다.
          </p>
        </div>
      </form>
    `;

    const footer = `
      <button type="button" onclick="App.hideModal()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        취소
      </button>
      <button type="button" onclick="App.saveEmployee('${employeeId || ''}')"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        ${isEdit ? '수정하기' : '추가하기'}
      </button>
    `;

    this.showModal(isEdit ? '직원 정보 수정' : '직원 추가', content, { footer });
  },

  saveEmployee(employeeId) {
    const form = document.getElementById('employeeForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      position: formData.get('position'),
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      hire_date: formData.get('hire_date'),
      employment_type: formData.get('employment_type'),
      salary: parseInt(formData.get('salary')) || 0,
      status: formData.get('status')
    };

    if (employeeId) {
      // 수정
      EmployeeManager.update(employeeId, data);
      Utils.showSuccess(`${data.name}님의 정보가 수정되었습니다.`);
    } else {
      // 추가
      EmployeeManager.create(data);
      Utils.showSuccess(`${data.name}님이 추가되었습니다.`);
    }

    this.hideModal();
    this.renderPage('employees');
  },

  // ===== 직원 상세보기 =====
  viewEmployeeDetail(id) {
    const employee = EmployeeManager.get(id);
    if (!employee) {
      Utils.showError('직원 정보를 찾을 수 없습니다.');
      return;
    }

    const detail = EmployeeManager.getDetail(id);
    const legalCheck = LegalCheckManager.checkEmployee(id);

    const content = `
      <div class="space-y-6">
        <!-- 기본 정보 -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">${employee.name}</h3>
              <p class="text-gray-600 mt-1">${employee.position}</p>
            </div>
            <span class="px-4 py-2 rounded-lg text-sm font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
              ${employee.status === 'active' ? '재직중' : '퇴사'}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div class="text-sm text-gray-600">이메일</div>
              <div class="font-medium">${employee.email || '-'}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">전화번호</div>
              <div class="font-medium">${employee.phone || '-'}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">입사일</div>
              <div class="font-medium">${Utils.formatDate(employee.hire_date, 'YYYY.MM.DD')}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">근무 기간</div>
              <div class="font-medium">${detail.workingDays}일</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">근무 형태</div>
              <div class="font-medium">${employee.employment_type}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">연봉</div>
              <div class="font-medium">${employee.salary ? employee.salary.toLocaleString() + '만원' : '-'}</div>
            </div>
          </div>
        </div>

        <!-- 근태 정보 -->
        <div>
          <h4 class="font-bold text-lg mb-3">이번 주 근무시간</h4>
          <div class="bg-white border rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <span class="text-2xl font-bold ${detail.hourCheck.color === 'red' ? 'text-red-600' : detail.hourCheck.color === 'orange' ? 'text-orange-500' : detail.hourCheck.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}">
                ${detail.weeklyHours}시간
              </span>
              <span class="text-sm text-gray-600">/ 52시간</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div class="h-3 rounded-full ${detail.hourCheck.status === 'danger' ? 'bg-red-600' : detail.hourCheck.status === 'critical' ? 'bg-orange-500' : detail.hourCheck.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}"
                   style="width: ${Math.min(100, (detail.weeklyHours / 52) * 100)}%"></div>
            </div>
            <div class="text-sm ${detail.hourCheck.color === 'red' ? 'text-red-600' : detail.hourCheck.color === 'orange' ? 'text-orange-500' : detail.hourCheck.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'}">
              ${detail.hourCheck.message}
            </div>
          </div>
        </div>

        <!-- 법적 리스크 -->
        <div>
          <h4 class="font-bold text-lg mb-3">법적 리스크 분석</h4>
          <div class="bg-white border rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-bold">총 점수</span>
              <span class="text-3xl font-bold ${legalCheck.color === 'red' ? 'text-red-600' : legalCheck.color === 'yellow' || legalCheck.color === 'orange' ? 'text-yellow-600' : 'text-green-600'}">
                ${legalCheck.totalScore}/100
              </span>
            </div>

            <div class="space-y-3">
              ${Object.values(legalCheck.risks).map(risk => `
                <div class="border-l-4 ${risk.status === 'danger' ? 'border-red-500 bg-red-50' : risk.status === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'} p-3 rounded">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-medium">${risk.category}</span>
                    <span class="font-bold ${risk.status === 'danger' ? 'text-red-600' : risk.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                      ${risk.score}점
                    </span>
                  </div>
                  <div class="text-sm text-gray-700">
                    ${risk.issues.join('<br>')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 계약서 정보 -->
        <div>
          <h4 class="font-bold text-lg mb-3">계약서</h4>
          <div class="bg-white border rounded-lg p-4">
            ${detail.hasContract ? `
              <div class="flex items-center text-green-600 mb-2">
                <span class="text-xl mr-2">✓</span>
                <span class="font-medium">근로계약서 작성 완료</span>
              </div>
              <button onclick="ContractManager.download('${id}')"
                      class="mt-2 text-sm text-blue-600 hover:text-blue-800">
                계약서 다운로드 →
              </button>
            ` : `
              <div class="flex items-center text-red-600 mb-2">
                <span class="text-xl mr-2">⚠</span>
                <span class="font-medium">근로계약서 미작성</span>
              </div>
              <button onclick="App.hideModal(); App.renderPage('contracts'); setTimeout(() => ContractManager.generate('${id}'), 300)"
                      class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                계약서 생성하기 →
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    const footer = `
      <button type="button" onclick="App.showAddEmployeeModal('${id}')"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        정보 수정
      </button>
      <button type="button" onclick="App.hideModal()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        닫기
      </button>
    `;

    this.showModal('직원 상세 정보', content, { footer });
  },

  // ===== 알림 시스템 =====
  showNotifications() {
    const briefing = ChecklistManager.generateDailyBriefing();
    const allAlerts = [...briefing.urgent, ...briefing.important, ...briefing.normal];

    if (allAlerts.length === 0) {
      Utils.showSuccess('알림이 없습니다!');
      return;
    }

    const content = `
      <div class="space-y-3">
        ${allAlerts.map((alert, idx) => `
          <div class="p-4 rounded-lg ${alert.priority === 'urgent' ? 'bg-red-50 border border-red-200' : alert.priority === 'important' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}">
            <div class="flex items-start">
              <span class="text-2xl mr-3">${alert.icon}</span>
              <div class="flex-1">
                <h5 class="font-bold ${alert.priority === 'urgent' ? 'text-red-800' : alert.priority === 'important' ? 'text-yellow-800' : 'text-blue-800'}">
                  ${alert.message}
                </h5>
                <p class="text-sm text-gray-700 mt-1">${alert.action}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const footer = `
      <button type="button" onclick="App.hideModal()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        확인
      </button>
    `;

    this.showModal(`알림 (${allAlerts.length}개)`, content, { footer });
  },

  // ===== 데이터 Import 기능 =====
  importData() {
    const content = `
      <div class="space-y-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-800">
            <strong>주의:</strong> 데이터를 불러오면 기존 데이터가 덮어씌워집니다.
            계속하기 전에 현재 데이터를 백업하는 것을 권장합니다.
          </p>
        </div>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input type="file" id="importFileInput" accept=".json" class="hidden">
          <button onclick="document.getElementById('importFileInput').click()"
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            JSON 파일 선택
          </button>
          <p class="text-sm text-gray-600 mt-3">
            .json 파일을 선택하세요
          </p>
        </div>

        <div id="importPreview" class="hidden">
          <h4 class="font-bold mb-2">미리보기</h4>
          <div id="importStats" class="bg-gray-50 rounded-lg p-4 text-sm"></div>
        </div>
      </div>
    `;

    const footer = `
      <button type="button" onclick="App.hideModal()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        취소
      </button>
      <button type="button" id="confirmImportBtn" onclick="App.confirmImport()" disabled
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        불러오기
      </button>
    `;

    this.showModal('데이터 불러오기', content, { footer });

    // 파일 선택 이벤트
    setTimeout(() => {
      const fileInput = document.getElementById('importFileInput');
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              this.previewImportData(data);
            } catch (error) {
              Utils.showError('유효하지 않은 JSON 파일입니다.');
            }
          };
          reader.readAsText(file);
        }
      });
    }, 100);
  },

  previewImportData(data) {
    const preview = document.getElementById('importPreview');
    const stats = document.getElementById('importStats');
    const confirmBtn = document.getElementById('confirmImportBtn');

    let statsHTML = '<div class="space-y-2">';
    let totalItems = 0;

    for (const [table, items] of Object.entries(data)) {
      if (Array.isArray(items)) {
        statsHTML += `<div class="flex justify-between"><span>${table}:</span><span class="font-bold">${items.length}개</span></div>`;
        totalItems += items.length;
      }
    }
    statsHTML += `<div class="border-t pt-2 mt-2 flex justify-between"><span class="font-bold">총계:</span><span class="font-bold text-blue-600">${totalItems}개</span></div>`;
    statsHTML += '</div>';

    stats.innerHTML = statsHTML;
    preview.classList.remove('hidden');
    confirmBtn.disabled = false;

    // 데이터 임시 저장
    this._importData = data;
  },

  confirmImport() {
    if (!this._importData) {
      Utils.showError('불러올 데이터가 없습니다.');
      return;
    }

    if (!confirm('정말 데이터를 불러오시겠습니까? 기존 데이터는 덮어씌워집니다.')) {
      return;
    }

    try {
      db.importAll(this._importData);
      Utils.showSuccess('데이터를 성공적으로 불러왔습니다!');
      this.hideModal();

      // 페이지 새로고침하여 새 데이터 반영
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      Utils.showError('데이터 불러오기 실패: ' + error.message);
    }
  }
};

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
