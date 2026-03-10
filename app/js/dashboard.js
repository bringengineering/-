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
    const teamSat = data.team.members.reduce((sum, m) => sum + m.satisfaction, 0) / data.team.members.length;
    const riskHigh = data.risks.filter(r => r.impact * r.probability >= 15 && r.status === 'active').length;

    document.getElementById('dashboardKPIGrid').innerHTML = [
      Utils.kpiCard('현금 잔고', Utils.formatWon(fin.currentBalance), `런웨이 ${fin.runway.toFixed(1)}개월`, fin.runway >= 6 ? 'up' : 'down', null, fin.runway >= 6 ? 'success' : fin.runway >= 3 ? 'warning' : 'danger'),
      Utils.kpiCard('월간 Burn Rate', Utils.formatWon(fin.burnRate), '월 평균 지출', 'neutral', null, fin.burnRate <= 850 ? 'success' : 'warning'),
      Utils.kpiCard('OKR 진행률', Utils.formatPercent(okrScore * 100), `점수 ${okrScore.toFixed(2)}`, okrScore >= 0.4 ? 'up' : 'down', null, okrScore >= 0.6 ? 'success' : okrScore >= 0.4 ? 'warning' : 'danger'),
      Utils.kpiCard('파이프라인', Utils.formatWon(pipelineTotal), `${data.pipeline.deals.length}건`, 'neutral', null, pipelineTotal >= 5000 ? 'success' : 'warning'),
      Utils.kpiCard('팀 만족도', `${teamSat.toFixed(1)}/5`, `${data.team.members.length}명`, teamSat >= 4 ? 'up' : 'down', null, teamSat >= 4 ? 'success' : teamSat >= 3 ? 'warning' : 'danger'),
      Utils.kpiCard('심각 리스크', `${riskHigh}건`, riskHigh === 0 ? '안전' : '대응 필요', riskHigh === 0 ? 'up' : 'down', null, riskHigh === 0 ? 'success' : 'danger')
    ].join('');
  },

  renderAlerts(data) {
    const alerts = [];
    const fin = this.calcFinancialSummary(data);

    if (fin.runway < 3) alerts.push({ type: 'danger', text: `🔴 런웨이 ${fin.runway.toFixed(1)}개월 — 즉시 자금 대응 필요` });
    else if (fin.runway < 6) alerts.push({ type: 'warning', text: `🟡 런웨이 ${fin.runway.toFixed(1)}개월 — 비용 절감 또는 매출 가속 검토` });

    const okrScore = this.calcOKRScore(data);
    if (okrScore < 0.4) alerts.push({ type: 'warning', text: `🟡 OKR 전체 진행률 ${(okrScore*100).toFixed(0)}% — 목표 달성 점검 필요` });

    const highRisks = data.risks.filter(r => r.impact * r.probability >= 15 && r.status === 'active');
    highRisks.forEach(r => {
      alerts.push({ type: 'danger', text: `🔴 심각 리스크: ${r.title} (점수 ${r.impact * r.probability})` });
    });

    if (alerts.length === 0) {
      alerts.push({ type: 'success', text: '✅ 현재 긴급 알림이 없습니다. 정상 운영 중입니다.' });
    }

    document.getElementById('alertBanner').innerHTML = alerts.map(a =>
      `<div class="alert-item ${a.type}">${a.text}</div>`
    ).join('');

    document.getElementById('alertCount').textContent = alerts.filter(a => a.type !== 'success').length;
  },

  renderCharts(data) {
    // Cash chart
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

    // OKR chart
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    if (quarter) {
      const objLabels = quarter.objectives.map(o => o.title.length > 15 ? o.title.slice(0, 15) + '...' : o.title);
      const objScores = quarter.objectives.map(o => {
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

    // TRL chart
    const projects = data.projects;
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

    // Pipeline chart
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
    const teamSat = data.team.members.reduce((sum, m) => sum + m.satisfaction, 0) / data.team.members.length;

    const finScore = Math.min(100, Math.round((fin.runway / 6) * 50 + (fin.currentBalance > 0 ? 50 : 0)));
    const bizScore = Math.round(okrScore * 60 + (data.pipeline.deals.length > 3 ? 40 : data.pipeline.deals.length * 13));
    const techScore = Math.round(data.projects.reduce((sum, p) => sum + (p.currentTRL / p.targetTRL), 0) / data.projects.length * 100);
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
        { label: `${data.team.members.length}명 운영`, dot: 'green' },
        { label: `루틴 도입 중`, dot: 'yellow' }
      ]}
    ];

    document.getElementById('healthMatrix').innerHTML = areas.map(area => {
      const statusColor = area.score >= 70 ? 'var(--success)' : area.score >= 50 ? 'var(--warning)' : 'var(--danger)';
      const statusText = area.score >= 70 ? '양호' : area.score >= 50 ? '주의' : '위험';
      return `
        <div class="health-area">
          <div class="health-area-icon">${area.icon}</div>
          <div class="health-area-name">${area.name}</div>
          <div class="health-area-score" style="color:${statusColor}">${area.score}</div>
          <div class="health-area-status" style="color:${statusColor}">${statusText}</div>
          <div class="health-area-items">
            ${area.items.map(item => `
              <div class="health-indicator">
                <div class="health-dot ${item.dot}"></div>
                <span>${item.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  renderActivityLog(data) {
    document.getElementById('activityLog').innerHTML = data.activityLog.slice(0, 10).map(a => `
      <div class="activity-item">
        <div class="activity-icon" style="background:${a.type === 'success' ? 'var(--success-light)' : a.type === 'danger' ? 'var(--danger-light)' : 'var(--primary-light)'}">${a.icon}</div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    `).join('');
  },

  updateGlobalHealth(data) {
    const fin = this.calcFinancialSummary(data);
    const okrScore = this.calcOKRScore(data);
    const teamSat = data.team.members.reduce((sum, m) => sum + m.satisfaction, 0) / data.team.members.length;
    const techScore = data.projects.reduce((sum, p) => sum + (p.currentTRL / p.targetTRL), 0) / data.projects.length;

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

  // Calculation helpers
  calcFinancialSummary(data) {
    const balances = this.calcMonthlyBalances(data);
    const months = data.financial.months;
    const currentBalance = balances[0] || 0;
    const burnRate = months.slice(0, 3).reduce((sum, m) => sum + Utils.sumValues(m.expense), 0) / 3;
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
