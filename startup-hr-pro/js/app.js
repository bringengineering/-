/**
 * StartupHR Pro - Main Application
 * SPA 라우팅 및 UI 렌더링
 */

const App = {
  currentPage: 'dashboard',

  init() {
    console.log('🚀 StartupHR Pro 시작');

    // 이벤트 리스너 등록
    this.setupEventListeners();

    // 초기 페이지 렌더링
    this.renderPage('dashboard');

    // 샘플 데이터 추가 (테스트용)
    this.addSampleAttendance();
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
        content.innerHTML = this.renderDashboard();
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
      default:
        content.innerHTML = this.renderDashboard();
    }

    // 페이지별 이벤트 리스너
    this.setupPageEvents(page);
  },

  renderDashboard() {
    const briefing = ChecklistManager.generateDailyBriefing();
    const summary = EmployeeManager.getDashboardSummary();
    const attendance = AttendanceManager.getDashboardSummary();
    const legal = LegalCheckManager.getDashboardSummary();

    return `
      <div class="space-y-6">
        <!-- 헤더 -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">대시보드</h1>
          <p class="text-gray-600 mt-1">${briefing.date} ${briefing.day}요일</p>
        </div>

        <!-- 긴급 알림 -->
        ${briefing.urgent.length > 0 ? `
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm text-gray-600">총 직원</div>
            <div class="text-3xl font-bold text-gray-900">${summary.active}명</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm text-gray-600">평균 근무시간</div>
            <div class="text-3xl font-bold text-gray-900">${attendance.avgHours}h</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm text-gray-600">법적 리스크</div>
            <div class="text-3xl font-bold ${legal.avgScore >= 70 ? 'text-red-600' : legal.avgScore >= 50 ? 'text-yellow-600' : 'text-green-600'}">
              ${legal.avgScore}/100
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm text-gray-600">위험 직원</div>
            <div class="text-3xl font-bold ${summary.risky > 0 ? 'text-red-600' : 'text-green-600'}">
              ${summary.risky}명
            </div>
          </div>
        </div>

        <!-- 이번 주 근무시간 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">이번 주 근무시간</h3>
          <div class="space-y-3">
            ${summary.weeklyStats.map(stat => `
              <div>
                <div class="flex justify-between mb-1">
                  <span class="font-medium">${stat.employee.name}</span>
                  <span class="font-bold ${stat.check.status === 'danger' ? 'text-red-600' : stat.check.status === 'critical' ? 'text-orange-500' : stat.check.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                    ${stat.hours}h
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="h-2 rounded-full ${stat.check.status === 'danger' ? 'bg-red-600' : stat.check.status === 'critical' ? 'bg-orange-500' : stat.check.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}"
                       style="width: ${Math.min(100, (stat.hours / 52) * 100)}%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">${stat.check.message}</div>
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
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">법적 리스크 TOP 3</h3>
          ${legal.topRisks.slice(0, 3).map((risk, idx) => `
            <div class="mb-3 p-3 rounded ${risk.level === 'danger' ? 'bg-red-50' : risk.level === 'warning' ? 'bg-yellow-50' : 'bg-green-50'}">
              <div class="flex justify-between">
                <span class="font-medium">${idx + 1}. ${risk.employee.name}</span>
                <span class="font-bold ${risk.level === 'danger' ? 'text-red-600' : risk.level === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                  ${risk.totalScore}점
                </span>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                ${Object.values(risk.risks).map(r => r.issues[0]).join(', ')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 빠른 작업 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">빠른 작업</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onclick="App.renderPage('employees')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div class="text-2xl mb-2">👥</div>
              <div class="font-medium">직원 관리</div>
            </button>
            <button onclick="App.renderPage('contracts')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div class="text-2xl mb-2">📄</div>
              <div class="font-medium">계약서 생성</div>
            </button>
            <button onclick="App.renderPage('attendance')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div class="text-2xl mb-2">⏰</div>
              <div class="font-medium">근태 기록</div>
            </button>
            <button onclick="App.renderPage('legal')"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div class="text-2xl mb-2">⚖️</div>
              <div class="font-medium">법적 체크</div>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderEmployees() {
    const employees = EmployeeManager.getAll();

    return `
      <div>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">직원 관리</h1>
          <button onclick="App.showAddEmployeeModal()"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + 직원 추가
          </button>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직책</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">입사일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주간 근무</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${employees.map(emp => {
                const detail = EmployeeManager.getDetail(emp.id);
                return `
                  <tr>
                    <td class="px-6 py-4">${emp.name}</td>
                    <td class="px-6 py-4">${emp.position}</td>
                    <td class="px-6 py-4">${Utils.formatDate(emp.hire_date, 'YYYY.MM.DD')}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded text-sm ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${emp.status === 'active' ? '재직' : '퇴사'}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-bold ${detail.hourCheck.status === 'danger' ? 'text-red-600' : 'text-gray-900'}">
                        ${detail.weeklyHours}h
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <button onclick="App.viewEmployeeDetail('${emp.id}')"
                              class="text-blue-600 hover:text-blue-800">
                        상세
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
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

    return `
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">근태 관리</h1>

        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <h3 class="text-lg font-bold mb-4">이번 주 요약 (${summary.weekStart}~)</h3>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-gray-600">전체 직원</div>
              <div class="text-2xl font-bold">${summary.totalEmployees}명</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">평균 근무시간</div>
              <div class="text-2xl font-bold">${summary.avgHours}h</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">52시간 위반</div>
              <div class="text-2xl font-bold ${summary.violators > 0 ? 'text-red-600' : 'text-green-600'}">
                ${summary.violators}명
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">직원별 근무시간</h3>
          <div class="space-y-4">
            ${summary.allStats.map(stat => `
              <div class="border-b pb-4">
                <div class="flex justify-between mb-2">
                  <span class="font-medium">${stat.employee.name}</span>
                  <span class="font-bold ${stat.check.color === 'red' ? 'text-red-600' : stat.check.color === 'orange' ? 'text-orange-500' : stat.check.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}">
                    ${stat.totalHours}h
                  </span>
                </div>
                <div class="text-sm text-gray-600 mb-2">${stat.check.message}</div>
                <div class="text-xs text-gray-500">
                  ${stat.dailyBreakdown.map(day => `${day.day}: ${day.hours}h`).join(' | ')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderLegalCheck() {
    const summary = LegalCheckManager.getDashboardSummary();

    return `
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">법적 리스크 체크</h1>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm text-gray-600">평균 점수</div>
            <div class="text-3xl font-bold ${summary.avgScore >= 70 ? 'text-red-600' : summary.avgScore >= 50 ? 'text-yellow-600' : 'text-green-600'}">
              ${summary.avgScore}/100
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm text-gray-600">위험 직원</div>
            <div class="text-3xl font-bold text-red-600">${summary.dangerCount}명</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm text-gray-600">주의 직원</div>
            <div class="text-3xl font-bold text-yellow-600">${summary.warningCount}명</div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">직원별 리스크 현황</h3>
          <div class="space-y-4">
            ${summary.allResults.map(result => `
              <div class="border-l-4 ${result.level === 'danger' ? 'border-red-500 bg-red-50' : result.level === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'} p-4 rounded">
                <div class="flex justify-between mb-2">
                  <span class="font-bold">${result.employee.name}</span>
                  <span class="font-bold ${result.color === 'red' ? 'text-red-600' : result.color === 'orange' || result.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}">
                    ${result.totalScore}/100
                  </span>
                </div>
                <div class="grid grid-cols-5 gap-2 text-sm">
                  ${Object.values(result.risks).map(risk => `
                    <div>
                      <div class="text-xs text-gray-600">${risk.category}</div>
                      <div class="font-medium ${risk.status === 'danger' ? 'text-red-600' : risk.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}">
                        ${risk.score}점
                      </div>
                    </div>
                  `).join('')}
                </div>
                <div class="mt-2 text-sm text-gray-700">
                  ${Object.values(result.risks).map(risk => risk.issues[0]).join(' | ')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderConversations() {
    return `
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">대화 분석</h1>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">대화 내용 분석</h3>
          <textarea id="conversationInput"
                    class="w-full h-64 p-4 border rounded-lg"
                    placeholder="분석할 대화 내용을 입력하세요..."></textarea>
          <button onclick="App.analyzeConversation()"
                  class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            분석하기
          </button>
          <div id="analysisResult" class="mt-6"></div>
        </div>
      </div>
    `;
  },

  renderChecklist() {
    const briefing = ChecklistManager.generateDailyBriefing();
    const today = Utils.formatDate(new Date());
    const checklist = ChecklistManager.getChecklist(today);

    return `
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">일일 체크리스트</h1>

        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">오늘의 체크리스트</h3>
            <span class="text-sm text-gray-600">완료율: ${checklist.completion_rate}%</span>
          </div>
          <div class="space-y-2">
            ${checklist.items.map(item => `
              <label class="flex items-center p-3 rounded hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" ${item.done ? 'checked' : ''}
                       class="w-5 h-5 text-blue-600 rounded"
                       onchange="App.toggleChecklistItem('${checklist.id}', ${item.id})">
                <span class="ml-3 ${item.done ? 'line-through text-gray-500' : 'text-gray-900'}">
                  ${item.task}
                </span>
                <span class="ml-auto text-xs px-2 py-1 rounded ${item.priority === 'high' ? 'bg-red-100 text-red-800' : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">
                  ${item.priority}
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">빠른 도구</h3>
          <div class="grid grid-cols-2 gap-4">
            <button onclick="ChecklistManager.downloadDailyReport()"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50">
              <div class="text-2xl mb-2">📊</div>
              <div class="font-medium">일일 리포트 다운로드</div>
            </button>
            <button onclick="App.exportAllData()"
                    class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50">
              <div class="text-2xl mb-2">💾</div>
              <div class="font-medium">전체 데이터 백업</div>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  setupPageEvents(page) {
    if (page === 'conversations') {
      // 대화 분석 페이지는 별도 처리 불필요
    }
  },

  analyzeConversation() {
    const text = document.getElementById('conversationInput').value;
    if (!text) {
      Utils.showError('분석할 내용을 입력하세요.');
      return;
    }

    const analysis = ConversationManager.analyze(text);
    const resultDiv = document.getElementById('analysisResult');

    resultDiv.innerHTML = `
      <div class="border-t pt-6">
        <h4 class="font-bold text-lg mb-4">분석 결과</h4>

        <div class="mb-4 p-4 rounded ${analysis.riskScore >= 70 ? 'bg-red-100' : analysis.riskScore >= 50 ? 'bg-yellow-100' : 'bg-green-100'}">
          <div class="text-sm text-gray-600">리스크 점수</div>
          <div class="text-3xl font-bold ${analysis.riskScore >= 70 ? 'text-red-600' : analysis.riskScore >= 50 ? 'text-yellow-600' : 'text-green-600'}">
            ${analysis.riskScore}/100
          </div>
        </div>

        <div class="mb-4">
          <h5 class="font-semibold mb-2">위험 키워드 (${analysis.criticalKeywords.length}개)</h5>
          <div class="flex flex-wrap gap-2">
            ${analysis.criticalKeywords.map(keyword => `
              <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">${keyword}</span>
            `).join('')}
          </div>
        </div>

        <div class="mb-4">
          <h5 class="font-semibold mb-2">주의 키워드 (${analysis.warningKeywords.length}개)</h5>
          <div class="flex flex-wrap gap-2">
            ${analysis.warningKeywords.map(keyword => `
              <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">${keyword}</span>
            `).join('')}
          </div>
        </div>

        <div class="mb-4">
          <h5 class="font-semibold mb-2">권장 조치</h5>
          <ul class="list-disc list-inside space-y-1">
            ${analysis.summary.recommendations.map(rec => `
              <li class="text-gray-700">${rec}</li>
            `).join('')}
          </ul>
        </div>

        <div class="mb-4">
          <h5 class="font-semibold mb-2">주요 이슈</h5>
          <div class="flex flex-wrap gap-2">
            ${analysis.summary.mainIssues.map(issue => `
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">${issue}</span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
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

  showAddEmployeeModal() {
    Utils.showError('직원 추가 기능은 곧 구현됩니다.');
  },

  viewEmployeeDetail(id) {
    Utils.showError('직원 상세 기능은 곧 구현됩니다.');
  }
};

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
