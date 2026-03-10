// ===== UTILITY FUNCTIONS =====

const Utils = {
  // Format number with commas (Korean style)
  formatNumber(num) {
    if (num === null || num === undefined) return '-';
    return Math.round(num).toLocaleString('ko-KR');
  },

  // Format as Korean Won
  formatWon(num) {
    if (num === null || num === undefined) return '-';
    if (Math.abs(num) >= 10000) {
      return (num / 10000).toFixed(1) + '억';
    }
    return this.formatNumber(num) + '만원';
  },

  // Format percentage
  formatPercent(num) {
    if (num === null || num === undefined) return '-';
    return Math.round(num) + '%';
  },

  // Get status color based on value and thresholds
  getStatus(value, greenMin, yellowMin) {
    if (value >= greenMin) return 'success';
    if (value >= yellowMin) return 'warning';
    return 'danger';
  },

  // Get status dot color
  getStatusDot(value, greenMin, yellowMin) {
    if (value >= greenMin) return 'green';
    if (value >= yellowMin) return 'yellow';
    return 'red';
  },

  // Get badge HTML
  badge(text, color) {
    return `<span class="badge badge-${color}">${text}</span>`;
  },

  // Calculate OKR score (0.0 - 1.0)
  calcOKRScore(current, target, inverse = false) {
    if (target === 0) return 0;
    if (inverse) {
      // For metrics where lower is better (e.g., response time)
      if (current <= target) return 1.0;
      return Math.max(0, 1 - (current - target) / target);
    }
    return Math.min(1.0, current / target);
  },

  // Get OKR score color
  okrScoreColor(score) {
    if (score >= 0.7) return 'var(--success)';
    if (score >= 0.4) return 'var(--warning)';
    return 'var(--danger)';
  },

  // Generate unique ID
  generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  },

  // Format month label
  formatMonth(monthStr) {
    if (!monthStr) return '-';
    const parts = monthStr.split('-');
    return `${parts[0]}.${parts[1]}`;
  },

  // Month short label
  monthShort(monthStr) {
    if (!monthStr) return '-';
    return monthStr.split('-')[1] + '월';
  },

  // Sum object values
  sumValues(obj) {
    return Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);
  },

  // Create KPI card HTML
  kpiCard(label, value, change, changeDir, sub, statusClass) {
    const changeClass = changeDir === 'up' ? 'up' : changeDir === 'down' ? 'down' : 'neutral';
    const changeIcon = changeDir === 'up' ? '↑' : changeDir === 'down' ? '↓' : '';
    return `
      <div class="kpi-card ${statusClass || ''}">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value}</div>
        ${change !== undefined ? `<div class="kpi-change ${changeClass}">${changeIcon} ${change}</div>` : ''}
        ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
      </div>
    `;
  },

  // Chart default options
  chartDefaults() {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12, family: "'Noto Sans KR', sans-serif" }, padding: 16 }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
      }
    };
  },

  // Chart colors
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    palette: ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b']
  },

  // Destroy chart if exists
  destroyChart(chartInstance) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    return null;
  }
};
