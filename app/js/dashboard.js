// ===== DASHBOARD MODULE =====

const Dashboard = {
  charts: {},

  render() {
    const data = DataManager.get();
    this.renderKPIs(data);
    this.renderAlerts(data);
    this.renderCharts(data);
    this.renderHealthMatrix(data);
    this.renderActivityLog(data);
    this.updateGlobalHealth(data);
  },

  renderKPIs(data) {
    const fin = this.calcFinancialSummary(data);
    const okrScore = this.calcOKRScore(data);
    const pipelineTotal = data.pipeline.deals.reduce((sum, d) => sum + d.amount, 0);
    const memberCount = data.team.members.length;
    const teamSat = memberCount > 0 ? data.team.members.reduce((sum, m) => sum + m.satisfaction, 0) / memberCount : 0;
    const riskHigh = data.risks.filter(r => r.impact * r.probability >= 15 && r.status === 'active').length;

    document.getElementById('dashboardKPIGrid').innerHTML = [
      Utils.kpiCard('현금 잔고', Utils.formatWon(fin.currentBalance), `런웨이 ${fin.runway.toFixed(1)}개월`, fin.runway >= 6 ? 'up' : 'down', null, fin.runway >= 6 ? 'success' : fin.runway >= 3 ? 'warning' : 'danger'),
      Utils.kpiCard('월간 Burn Rate', Utils.formatWon(fin.burnRate), '월 평균 지출', 'neutral', null, fin.burnRate <= 850 ? 'success' : 'warning'),
      Utils.kpiCard('OKR 진행률', Utils.formatPercent(okrScore * 100), `점수 ${okrScore.toFixed(2)}`, okrScore >= 0.4 ? 'up' : 'down', null, okrScore >= 0.6 ? 'success' : okrScore >= 0.4 ? 'warning' : 'danger'),
      Utils.kpiCard('파이프라인', Utils.formatWon(pipelineTotal), `${data.pipeline.deals.length}건`, 'neutral', null, pipelineTotal >= 5000 ? 'success' : 'warning'),
      Utils.kpiCard('팀 만족도', `${teamSat.toFixed(1)}/5`, `${memberCount}명`, teamSat >= 4 ? 'up' : 'down', null, teamSat >= 4 ? 'success' : teamSat >= 3 ? 'warning' : 'danger'),
      Utils.kpiCard('심각 리스크', `${riskHigh}건`, riskHigh === 0 ? '안전' : '대응 필요', riskHigh === 0 ? 'up' : 'down', null, riskHigh === 0 ? 'success' : 'danger')
    ].join('');
  },

  renderAlerts(data) {
    const alerts = [];
    const fin = this.calcFinancialSummary(data);
    const settings = data.settings || {};

    if (settings.alertRunway !== false) {
      const dangerThreshold = settings.runwayDanger || 3;
      const warningThreshold = settings.runwayWarning || 6;
      if (fin.runway < dangerThreshold) alerts.push({ type: 'danger', text: `런웨이 ${fin.runway.toFixed(1)}개월 — 즉시 자금 대응 필요` });
      else if (fin.runway < warningThreshold) alerts.push({ type: 'warning', text: `런웨이 ${fin.runway.toFixed(1)}개월 — 비용 절감 또는 매출 가속 검토` });
    }

    if (settings.alertOKR !== false) {
      const okrThreshold = (settings.okrThreshold || 40) / 100;
      const okrScore = this.calcOKRScore(data);
      if (okrScore < okrThreshold) alerts.push({ type: 'warning', text: `OKR 전체 진행률 ${(okrScore*100).toFixed(0)}% — 목표 달성 점검 필요` });
    }

    if (settings.alertRisk !== false) {
      const highRisks = data.risks.filter(r => r.impact * r.probability >= 15 && r.status === 'active');
      highRisks.forEach(r => {
        alerts.push({ type: 'danger', text: `심각 리스크: ${Utils.escapeHtml(r.title)} (점수 ${r.impact * r.probability})` });
      });
    }

    if (alerts.length === 0) {
      alerts.push({ type: 'success', text: '현재 긴급 알림이 없습니다. 정상 운영 중입니다.' });
    }

    document.getElementById('alertBanner').innerHTML = alerts.map(a =>
      `<div class="alert-item ${a.type}">${a.text}</div>`
    ).join('');

    document.getElementById('alertCount').textContent = alerts.filter(a => a.type !== 'success').length;
  },

  renderCharts(data) {
    const months = data.financial.months;
    const balances = this.calcMonthlyBalances(data);
    const labels = months.map(m => Utils.monthShort(m.month));

    this.charts.cash = Utils.destroyChart(this.charts.cash);
    this.charts.cash = new Chart(document.getElementById('cashChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '현금 잔고 (만원)',
          data: balances,
          borderColor: Utils.colors.primary,
          backgroundColor: 'rgba(37,99,235,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4
        }]
      },
      options: {
        ...Utils.chartDefaults(),
        plugins: {
          ...Utils.chartDefaults().plugins,
          annotation: {
            annotations: {
              dangerLine: { type: 'line', yMin: 2500, yMax: 2500, borderColor: Utils.colors.danger, borderDash: [5,5], borderWidth: 1 }
            }
          }
        }
      }
    });

    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    if (quarter && quarter.objectives.length > 0) {
      const objLabels = quarter.objectives.map(o => o.title.length > 15 ? o.title.slice(0, 15) + '...' : o.title);
      const objScores = quarter.objectives.map(o => {
        if (o.keyResults.length === 0) return 0;
        const scores = o.keyResults.map(kr => Utils.calcOKRScore(kr.current, kr.target, kr.inverse));
        return scores.reduce((a, b) => a + b, 0) / scores.length;
      });

      this.charts.okr = Utils.destroyChart(this.charts.okr);
      this.charts.okr = new Chart(document.getElementById('okrChart'), {
        type: 'bar',
        data: {
          labels: objLabels,
          datasets: [{
            label: '달성률',
            data: objScores.map(s => (s * 100).toFixed(1)),
            backgroundColor: objScores.map(s => s >= 0.6 ? Utils.colors.success : s >= 0.4 ? Utils.colors.warning : Utils.colors.danger),
            borderRadius: 6,
            maxBarThickness: 60
          }]
        },
        options: {
          ...Utils.chartDefaults(),
          scales: { ...Utils.chartDefaults().scales, y: { ...Utils.chartDefaults().scales.y, max: 100, ticks: { callback: v => v + '%' } } },
          plugins: { ...Utils.chartDefaults().plugins, legend: { display: false } }
        }
      });
    }

    const projects = data.projects;
    if (projects.length > 0) {
      this.charts.trl = Utils.destroyChart(this.charts.trl);
      this.charts.trl = new Chart(document.getElementById('trlChart'), {
        type: 'bar',
        data: {
          labels: projects.map(p => p.name),
          datasets: [
            { label: '현재 TRL', data: projects.map(p => p.currentTRL), backgroundColor: Utils.colors.primary, borderRadius: 6, maxBarThickness: 40 },
            { label: '목표 TRL', data: projects.map(p => p.targetTRL), backgroundColor: 'rgba(37,99,235,0.2)', borderColor: Utils.colors.primary, borderWidth: 2, borderRadius: 6, maxBarThickness: 40 }
          ]
        },
        options: {
          ...Utils.chartDefaults(),
          scales: { ...Utils.chartDefaults().scales, y: { ...Utils.chartDefaults().scales.y, max: 9, ticks: { stepSize: 1 } } }
        }
      });
    }

    const stageAmounts = data.pipeline.stages.map((stage, i) =>
      data.pipeline.deals.filter(d => d.stage === i).reduce((sum, d) => sum + d.amount, 0)
    );
    this.charts.pipeline = Utils.destroyChart(this.charts.pipeline);
    this.charts.pipeline = new Chart(document.getElementById('pipelineChart'), {
      type: 'bar',
      data: {
        labels: data.pipeline.stages,
        datasets: [{
          label: '금액 (만원)',
          data: stageAmounts,
          backgroundColor: Utils.colors.palette.slice(0, data.pipeline.stages.length),
          borderRadius: 6,
          maxBarThickness: 40
        }]
      },
      options: {
        ...Utils.chartDefaults(),
        indexAxis: 'y',
        plugins: { ...Utils.chartDefaults().plugins, legend: { display: false } }
      }
    });
  },

  renderHealthMatrix(data) {
    const fin = this.calcFinancialSummary(data);
    const okrScore = this.calcOKRScore(data);
    const memberCount = data.team.members.length;
    const teamSat = memberCount > 0 ? data.team.members.reduce((sum, m) => sum + m.satisfaction, 0) / memberCount : 0;
    const projectCount = data.projects.length;

    const finScore = Math.min(100, Math.round((fin.runway / 6) * 50 + (fin.currentBalance > 0 ? 50 : 0)));
    const bizScore = Math.round(okrScore * 60 + (data.pipeline.deals.length > 3 ? 40 : data.pipeline.deals.length * 13));
    const techScore = projectCount > 0 ? Math.round(data.projects.reduce((sum, p) => sum + (p.currentTRL / p.targetTRL), 0) / projectCount * 100) : 0;
    const teamScore = Math.round(teamSat / 5 * 100);

    const areas = [
      { icon: '💰', name: '재무 건강', score: finScore, items: [
        { label: `런웨이 ${fin.runway.toFixed(1)}개월`, dot: Utils.getStatusDot(fin.runway, 6, 3) },
        { label: `잔고 ${Utils.formatWon(fin.currentBalance)}`, dot: fin.currentBalance > 0 ? 'green' : 'red' },
        { label: `Burn ${Utils.formatWon(fin.burnRate)}/월`, dot: Utils.getStatusDot(1000 - fin.burnRate, 200, 0) }
      ]},
      { icon: '📈', name: '사업 성장', score: bizScore, items: [
        { label: `OKR ${(okrScore*100).toFixed(0)}%`, dot: Utils.getStatusDot(okrScore*100, 60, 40) },
        { label: `파이프라인 ${data.pipeline.deals.length}건`, dot: Utils.getStatusDot(data.pipeline.deals.length, 5, 2) },
        { label: `고객 접촉 진행 중`, dot: data.pipeline.deals.some(d => d.stage >= 1) ? 'green' : 'yellow' }
      ]},
      { icon: '🔧', name: '기술 제품', score: techScore, items: [
        ...data.projects.slice(0, 3).map(p => ({
          label: `${p.name} TRL ${p.currentTRL}/${p.targetTRL}`,
          dot: Utils.getStatusDot(p.currentTRL / p.targetTRL * 100, 70, 40)
        }))
      ]},
      { icon: '👥', name: '팀 & 문화', score: teamScore, items: [
        { label: `만족도 ${teamSat.toFixed(1)}/5`, dot: Utils.getStatusDot(teamSat, 4, 3) },
        { label: `${memberCount}명 운영`, dot: 'green' },
        { label: `루틴 도입 중`, dot: 'yellow' }
      ]}
    ];

    document.getElementById('healthMatrix').innerHTML = areas.map(area => {
      const statusColor = area.score >= 70 ? 'var(--success)' : area.score >= 50 ? 'var(--warning)' : 'var(--danger)';
      const statusText = area.score >= 70 ? '양호' : area.score >= 50 ? '주의' : '위험';
      return `
        <div class="health-area">
          <div class="health-area-icon">${area.icon}</div>
          <div class="health-area-name">${Utils.escapeHtml(area.name)}</div>
          <div class="health-area-score" style="color:${statusColor}">${area.score}</div>
          <div class="health-area-status" style="color:${statusColor}">${statusText}</div>
          <div class="health-area-items">
            ${area.items.map(item => `
              <div class="health-indicator">
                <div class="health-dot ${item.dot}"></div>
                <span>${Utils.escapeHtml(item.label)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  activityPage: 0,
  activityPageSize: 10,

  renderActivityLog(data) {
    const allLogs = data.activityLog || [];
    const totalPages = Math.max(1, Math.ceil(allLogs.length / this.activityPageSize));
    this.activityPage = Math.min(this.activityPage, totalPages - 1);
    const start = this.activityPage * this.activityPageSize;
    const logs = allLogs.slice(start, start + this.activityPageSize);

    if (allLogs.length === 0) {
      document.getElementById('activityLog').innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:16px 0">아직 활동 기록이 없습니다.</p>';
      return;
    }

    const logHtml = logs.map(a => `
      <div class="activity-item">
        <div class="activity-icon" style="background:${a.type === 'success' ? 'var(--success-light)' : a.type === 'danger' ? 'var(--danger-light)' : 'var(--primary-light)'}">${a.icon}</div>
        <div class="activity-text">${Utils.escapeHtml(a.text)}</div>
        <div class="activity-time">${Utils.escapeHtml(a.time)}</div>
      </div>
    `).join('');

    const paginationHtml = allLogs.length > this.activityPageSize ? `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light)">
        <span style="font-size:12px;color:var(--text-muted)">${allLogs.length}건 중 ${start + 1}~${Math.min(start + this.activityPageSize, allLogs.length)}</span>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm btn-secondary" onclick="Dashboard.prevActivityPage()" ${this.activityPage === 0 ? 'disabled style="opacity:0.4"' : ''}>◀ 이전</button>
          <span style="font-size:12px;color:var(--text-light);line-height:28px">${this.activityPage + 1} / ${totalPages}</span>
          <button class="btn btn-sm btn-secondary" onclick="Dashboard.nextActivityPage()" ${this.activityPage >= totalPages - 1 ? 'disabled style="opacity:0.4"' : ''}>다음 ▶</button>
        </div>
      </div>
    ` : '';

    document.getElementById('activityLog').innerHTML = logHtml + paginationHtml;
  },

  prevActivityPage() {
    if (this.activityPage > 0) {
      this.activityPage--;
      this.renderActivityLog(DataManager.get());
    }
  },

  nextActivityPage() {
    const data = DataManager.get();
    const totalPages = Math.ceil((data.activityLog || []).length / this.activityPageSize);
    if (this.activityPage < totalPages - 1) {
      this.activityPage++;
      this.renderActivityLog(data);
    }
  },

  updateGlobalHealth(data) {
    const fin = this.calcFinancialSummary(data);
    const okrScore = this.calcOKRScore(data);
    const memberCount = data.team.members.length;
    const teamSat = memberCount > 0 ? data.team.members.reduce((sum, m) => sum + m.satisfaction, 0) / memberCount : 0;
    const projectCount = data.projects.length;
    const techScore = projectCount > 0 ? data.projects.reduce((sum, p) => sum + (p.currentTRL / p.targetTRL), 0) / projectCount : 0;

    const health = Math.round((
      Math.min(100, fin.runway / 6 * 100) * 0.3 +
      okrScore * 100 * 0.25 +
      techScore * 100 * 0.2 +
      teamSat / 5 * 100 * 0.25
    ));

    const bar = document.getElementById('globalHealthBar');
    const score = document.getElementById('globalHealthScore');
    bar.style.width = health + '%';
    bar.style.background = health >= 70 ? 'var(--success)' : health >= 50 ? 'var(--warning)' : 'var(--danger)';
    score.textContent = health + '/100';
    score.style.color = health >= 70 ? 'var(--success)' : health >= 50 ? 'var(--warning)' : 'var(--danger)';
  },

  calcFinancialSummary(data) {
    const balances = this.calcMonthlyBalances(data);
    const months = data.financial.months;
    const currentBalance = balances.length > 0 ? balances[0] : 0;
    const count = Math.max(1, Math.min(3, months.length));
    const burnRate = months.slice(0, count).reduce((sum, m) => sum + Utils.sumValues(m.expense), 0) / count;
    const runway = burnRate > 0 ? currentBalance / burnRate : 99;
    return { currentBalance, burnRate, runway, balances };
  },

  calcMonthlyBalances(data) {
    const months = data.financial.months;
    const balances = [];
    let balance = months[0]?.openingBalance || 0;

    for (const m of months) {
      const income = Utils.sumValues(m.income);
      const expense = Utils.sumValues(m.expense);
      balance = (m.openingBalance !== null ? m.openingBalance : balance) + income - expense;
      balances.push(balance);
    }
    return balances;
  },

  calcOKRScore(data) {
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    if (!quarter || !quarter.objectives.length) return 0;

    let totalScore = 0;
    let totalKRs = 0;

    for (const obj of quarter.objectives) {
      for (const kr of obj.keyResults) {
        totalScore += Utils.calcOKRScore(kr.current, kr.target, kr.inverse);
        totalKRs++;
      }
    }

    return totalKRs > 0 ? totalScore / totalKRs : 0;
  }
};
