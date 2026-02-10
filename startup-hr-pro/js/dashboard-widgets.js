/**
 * StartupHR Pro - Dashboard Widget System
 * 드래그앤드롭 가능한 위젯 시스템
 */

const DashboardWidgets = {
  /**
   * 사용 가능한 위젯 정의
   */
  availableWidgets: {
    stats: {
      id: 'stats',
      title: '📊 주요 통계',
      size: 'large',
      render: function() {
        const summary = EmployeeManager.getDashboardSummary();
        const attendance = AttendanceManager.getDashboardSummary();
        const legal = LegalCheckManager.getDashboardSummary();

        return `
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat-card">
              <div class="stat-value">${summary.active}명</div>
              <div class="stat-label">총 직원</div>
              <div class="stat-icon">👥</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${attendance.avgHours}h</div>
              <div class="stat-label">평균 근무시간</div>
              <div class="stat-icon">⏰</div>
            </div>
            <div class="stat-card">
              <div class="stat-value ${legal.avgScore >= 70 ? 'text-red-600' : 'text-green-600'}">${legal.avgScore}/100</div>
              <div class="stat-label">법적 리스크</div>
              <div class="stat-icon">⚖️</div>
            </div>
            <div class="stat-card">
              <div class="stat-value ${summary.risky > 0 ? 'text-red-600' : 'text-green-600'}">${summary.risky}명</div>
              <div class="stat-label">위험 직원</div>
              <div class="stat-icon">${summary.risky > 0 ? '⚠️' : '✅'}</div>
            </div>
          </div>
        `;
      }
    },

    weeklyChart: {
      id: 'weeklyChart',
      title: '📈 주간 근무시간',
      size: 'medium',
      render: function() {
        return `
          <div class="chart-container">
            <canvas id="widget-weeklyChart" class="widget-chart"></canvas>
          </div>
        `;
      },
      afterRender: function() {
        const summary = EmployeeManager.getDashboardSummary();
        const ctx = document.getElementById('widget-weeklyChart');
        if (ctx && typeof Chart !== 'undefined') {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: summary.weeklyStats.map(s => s.employee.name),
              datasets: [{
                label: '주간 근무시간',
                data: summary.weeklyStats.map(s => s.hours),
                backgroundColor: summary.weeklyStats.map(s =>
                  s.hours > 52 ? 'rgba(239, 68, 68, 0.6)' :
                  s.hours > 48 ? 'rgba(251, 191, 36, 0.6)' :
                  'rgba(16, 185, 129, 0.6)'
                )
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 60
                }
              }
            }
          });
        }
      }
    },

    riskGauge: {
      id: 'riskGauge',
      title: '⚖️ 법적 리스크 현황',
      size: 'medium',
      render: function() {
        const legal = LegalCheckManager.getDashboardSummary();
        const percentage = legal.avgScore;
        const color = percentage >= 70 ? '#ef4444' : percentage >= 50 ? '#f59e0b' : '#10b981';

        return `
          <div class="risk-gauge-container">
            <svg class="risk-gauge" viewBox="0 0 200 120">
              <path d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none" stroke="#e5e7eb" stroke-width="20" stroke-linecap="round"/>
              <path d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round"
                    stroke-dasharray="${percentage * 2.51} 251.2"
                    class="risk-gauge-fill"/>
              <text x="100" y="90" text-anchor="middle" class="risk-gauge-value">${percentage}</text>
              <text x="100" y="110" text-anchor="middle" class="risk-gauge-label">리스크 점수</text>
            </svg>
            <div class="risk-status" style="color: ${color}">
              ${percentage >= 70 ? '⚠️ 높은 리스크' : percentage >= 50 ? '⚡ 주의 필요' : '✅ 양호'}
            </div>
          </div>
        `;
      }
    },

    recentActivity: {
      id: 'recentActivity',
      title: '🕐 최근 활동',
      size: 'medium',
      render: function() {
        const activities = this.getRecentActivities();

        return `
          <div class="activity-list">
            ${activities.map(activity => `
              <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                  <div class="activity-title">${activity.title}</div>
                  <div class="activity-time">${activity.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      },
      getRecentActivities: function() {
        // 최근 활동 로그 생성
        const activities = [];
        const employees = db.getAll('employees');
        const contracts = db.getAll('contracts');
        const attendance = db.getAll('attendance');

        // 최근 직원 추가
        employees.slice(-3).reverse().forEach(emp => {
          activities.push({
            icon: '👤',
            title: `${emp.name} 직원 등록`,
            time: Utils.timeAgo(new Date(emp.createdAt))
          });
        });

        // 최근 계약서
        contracts.slice(-2).reverse().forEach(contract => {
          const emp = employees.find(e => e.id === contract.employeeId);
          activities.push({
            icon: '📄',
            title: `${emp?.name || '직원'} 계약서 생성`,
            time: Utils.timeAgo(new Date(contract.createdAt))
          });
        });

        return activities.slice(0, 5);
      }
    },

    upcomingTasks: {
      id: 'upcomingTasks',
      title: '✅ 다가오는 작업',
      size: 'small',
      render: function() {
        const tasks = ChecklistManager.getUpcomingTasks();

        return `
          <div class="task-list">
            ${tasks.length > 0 ? tasks.map(task => `
              <div class="task-item">
                <input type="checkbox" ${task.completed ? 'checked' : ''}
                       onchange="ChecklistManager.toggleTask('${task.id}'); DashboardWidgets.refreshWidget('upcomingTasks');">
                <span class="${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</span>
                ${task.urgent ? '<span class="urgent-badge">긴급</span>' : ''}
              </div>
            `).join('') : '<div class="empty-state">완료된 작업이 없습니다</div>'}
          </div>
        `;
      }
    },

    contractExpiry: {
      id: 'contractExpiry',
      title: '📄 계약 만료 예정',
      size: 'small',
      render: function() {
        const expiringContracts = ContractManager.getExpiringContracts(30);

        return `
          <div class="contract-expiry-list">
            ${expiringContracts.length > 0 ? expiringContracts.slice(0, 5).map(contract => {
              const daysLeft = Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24));
              return `
                <div class="contract-expiry-item ${daysLeft <= 7 ? 'urgent' : ''}">
                  <div class="employee-name">${contract.employeeName}</div>
                  <div class="days-left ${daysLeft <= 7 ? 'text-red-600' : 'text-yellow-600'}">
                    ${daysLeft}일 남음
                  </div>
                </div>
              `;
            }).join('') : '<div class="empty-state">만료 예정 계약 없음</div>'}
          </div>
        `;
      }
    },

    quickActions: {
      id: 'quickActions',
      title: '⚡ 빠른 작업',
      size: 'small',
      render: function() {
        return `
          <div class="quick-actions-grid">
            <button onclick="App.renderPage('employees')" class="quick-action-btn">
              <span class="action-icon">👥</span>
              <span class="action-label">직원 관리</span>
            </button>
            <button onclick="App.renderPage('contracts')" class="quick-action-btn">
              <span class="action-icon">📄</span>
              <span class="action-label">계약서</span>
            </button>
            <button onclick="App.renderPage('attendance')" class="quick-action-btn">
              <span class="action-icon">⏰</span>
              <span class="action-label">근태 기록</span>
            </button>
            <button onclick="App.renderPage('legal')" class="quick-action-btn">
              <span class="action-icon">⚖️</span>
              <span class="action-label">법적 체크</span>
            </button>
          </div>
        `;
      }
    }
  },

  /**
   * 위젯 레이아웃 로드
   */
  loadLayout() {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('레이아웃 로드 실패:', e);
      }
    }

    // 기본 레이아웃
    return ['stats', 'weeklyChart', 'riskGauge', 'recentActivity', 'upcomingTasks'];
  },

  /**
   * 위젯 레이아웃 저장
   */
  saveLayout(layout) {
    localStorage.setItem('dashboard-layout', JSON.stringify(layout));
    Utils.showSuccess('대시보드 레이아웃이 저장되었습니다.');
  },

  /**
   * 대시보드 렌더링
   */
  renderDashboard() {
    const layout = this.loadLayout();
    const editMode = localStorage.getItem('dashboard-edit-mode') === 'true';

    let html = `
      <div class="dashboard-header">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">📊 대시보드</h1>
          <p class="text-gray-600 mt-1">${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
        <div class="flex gap-3">
          <button onclick="DashboardWidgets.toggleEditMode()"
                  class="btn ${editMode ? 'btn-primary' : 'btn-ghost'}">
            ${editMode ? '✅ 편집 완료' : '⚙️ 레이아웃 편집'}
          </button>
          <button onclick="DashboardWidgets.addWidget()"
                  class="btn btn-ghost"
                  ${editMode ? '' : 'style="display:none"'}>
            ➕ 위젯 추가
          </button>
        </div>
      </div>

      <div id="dashboard-widgets" class="dashboard-widgets-grid ${editMode ? 'edit-mode' : ''}">
    `;

    layout.forEach((widgetId, index) => {
      const widget = this.availableWidgets[widgetId];
      if (widget) {
        html += this.renderWidget(widget, index, editMode);
      }
    });

    html += `</div>`;

    return html;
  },

  /**
   * 개별 위젯 렌더링
   */
  renderWidget(widget, index, editMode) {
    return `
      <div class="dashboard-widget widget-${widget.size}"
           data-widget-id="${widget.id}"
           data-index="${index}"
           draggable="${editMode}">
        <div class="widget-header">
          <h3 class="widget-title">${widget.title}</h3>
          <div class="widget-actions">
            ${editMode ? `
              <button onclick="DashboardWidgets.removeWidget('${widget.id}')"
                      class="widget-action-btn" title="삭제">
                ✕
              </button>
              <button class="widget-drag-handle" title="드래그하여 이동">
                ⋮⋮
              </button>
            ` : ''}
          </div>
        </div>
        <div class="widget-content">
          ${widget.render()}
        </div>
      </div>
    `;
  },

  /**
   * 편집 모드 토글
   */
  toggleEditMode() {
    const currentMode = localStorage.getItem('dashboard-edit-mode') === 'true';
    localStorage.setItem('dashboard-edit-mode', (!currentMode).toString());
    App.renderPage('dashboard');

    if (!currentMode) {
      Utils.showInfo('위젯을 드래그하여 위치를 변경하거나 ✕를 눌러 삭제할 수 있습니다.');
      this.enableDragAndDrop();
    }
  },

  /**
   * 드래그앤드롭 활성화
   */
  enableDragAndDrop() {
    const container = document.getElementById('dashboard-widgets');
    if (!container) return;

    let draggedElement = null;

    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('dashboard-widget')) {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
      }
    });

    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('dashboard-widget')) {
        e.target.style.opacity = '1';
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(container, e.clientY);
      if (afterElement == null) {
        container.appendChild(draggedElement);
      } else {
        container.insertBefore(draggedElement, afterElement);
      }
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      this.saveCurrentLayout();
    });
  },

  /**
   * 드래그 위치 계산
   */
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.dashboard-widget:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  },

  /**
   * 현재 레이아웃 저장
   */
  saveCurrentLayout() {
    const widgets = document.querySelectorAll('.dashboard-widget');
    const layout = Array.from(widgets).map(w => w.dataset.widgetId);
    this.saveLayout(layout);
  },

  /**
   * 위젯 추가
   */
  addWidget() {
    const currentLayout = this.loadLayout();
    const availableToAdd = Object.keys(this.availableWidgets).filter(id => !currentLayout.includes(id));

    if (availableToAdd.length === 0) {
      Utils.showInfo('모든 위젯이 이미 추가되었습니다.');
      return;
    }

    const html = `
      <div class="widget-selector-modal">
        <h3 class="text-xl font-bold mb-4">위젯 추가</h3>
        <div class="widget-selector-grid">
          ${availableToAdd.map(id => {
            const widget = this.availableWidgets[id];
            return `
              <div class="widget-selector-item" onclick="DashboardWidgets.confirmAddWidget('${id}')">
                <div class="text-2xl mb-2">${widget.title.split(' ')[0]}</div>
                <div class="font-medium">${widget.title}</div>
                <div class="text-xs text-gray-500 mt-1">${widget.size}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    App.showModal('위젯 추가', html);
  },

  /**
   * 위젯 추가 확인
   */
  confirmAddWidget(widgetId) {
    const layout = this.loadLayout();
    layout.push(widgetId);
    this.saveLayout(layout);
    App.hideModal();
    App.renderPage('dashboard');
  },

  /**
   * 위젯 제거
   */
  removeWidget(widgetId) {
    if (Utils.confirm('이 위젯을 제거하시겠습니까?')) {
      const layout = this.loadLayout();
      const newLayout = layout.filter(id => id !== widgetId);
      this.saveLayout(newLayout);
      App.renderPage('dashboard');
    }
  },

  /**
   * 위젯 새로고침
   */
  refreshWidget(widgetId) {
    const widget = this.availableWidgets[widgetId];
    if (!widget) return;

    const element = document.querySelector(`[data-widget-id="${widgetId}"] .widget-content`);
    if (element) {
      element.innerHTML = widget.render();
      if (widget.afterRender) {
        setTimeout(() => widget.afterRender(), 100);
      }
    }
  },

  /**
   * 초기화 - 모든 위젯의 afterRender 실행
   */
  initWidgets() {
    setTimeout(() => {
      const layout = this.loadLayout();
      layout.forEach(widgetId => {
        const widget = this.availableWidgets[widgetId];
        if (widget && widget.afterRender) {
          widget.afterRender();
        }
      });

      // 편집 모드라면 드래그앤드롭 활성화
      if (localStorage.getItem('dashboard-edit-mode') === 'true') {
        this.enableDragAndDrop();
      }
    }, 100);
  }
};

// 전역 사용을 위한 export
window.DashboardWidgets = DashboardWidgets;
