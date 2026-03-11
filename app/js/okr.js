// ===== OKR MODULE =====

const OKR = {
  charts: {},

  render() {
    const data = DataManager.get();
    this.renderKPIs(data);
    this.renderCharts(data);
    this.renderObjectives(data);
  },

  renderKPIs(data) {
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    if (!quarter) return;

    const objectives = quarter.objectives;
    const totalKRs = objectives.reduce((sum, o) => sum + o.keyResults.length, 0);
    const avgScore = Dashboard.calcOKRScore(data);
    const completedKRs = objectives.reduce((sum, o) => sum + o.keyResults.filter(kr => Utils.calcOKRScore(kr.current, kr.target, kr.inverse) >= 0.9).length, 0);

    // Find best & worst performing
    let best = { score: 0, title: '-' };
    let worst = { score: 1, title: '-' };
    objectives.forEach(o => {
      const scores = o.keyResults.map(kr => Utils.calcOKRScore(kr.current, kr.target, kr.inverse));
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > best.score) best = { score: avg, title: o.title };
      if (avg < worst.score) worst = { score: avg, title: o.title };
    });

    document.getElementById('okrKPIGrid').innerHTML = [
      Utils.kpiCard('전체 OKR 점수', avgScore.toFixed(2), `${Utils.formatPercent(avgScore * 100)} 달성`, avgScore >= 0.6 ? 'up' : 'down', '0.6~0.7이 건강한 목표', avgScore >= 0.6 ? 'success' : avgScore >= 0.4 ? 'warning' : 'danger'),
      Utils.kpiCard('Objective', `${objectives.length}개`, `KR ${totalKRs}개`, 'neutral', null, 'info'),
      Utils.kpiCard('달성 완료 KR', `${completedKRs}/${totalKRs}`, Utils.formatPercent(totalKRs > 0 ? completedKRs / totalKRs * 100 : 0), completedKRs > 0 ? 'up' : 'neutral', null, completedKRs > 0 ? 'success' : 'info'),
      Utils.kpiCard('최우수 Objective', best.title.slice(0, 15) + (best.title.length > 15 ? '...' : ''), `점수 ${best.score.toFixed(2)}`, 'up', null, 'success')
    ].join('');
  },

  renderCharts(data) {
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    if (!quarter) return;

    // OKR Progress bar chart
    const objData = quarter.objectives.map(o => {
      const scores = o.keyResults.map(kr => Utils.calcOKRScore(kr.current, kr.target, kr.inverse));
      return { title: o.title.slice(0, 20), score: scores.reduce((a, b) => a + b, 0) / scores.length };
    });

    this.charts.progress = Utils.destroyChart(this.charts.progress);
    this.charts.progress = new Chart(document.getElementById('okrProgressChart'), {
      type: 'bar',
      data: {
        labels: objData.map(o => o.title),
        datasets: [{
          label: '달성률 (%)',
          data: objData.map(o => (o.score * 100).toFixed(1)),
          backgroundColor: objData.map(o => o.score >= 0.6 ? Utils.colors.success : o.score >= 0.4 ? Utils.colors.warning : Utils.colors.danger),
          borderRadius: 6,
          maxBarThickness: 50
        }]
      },
      options: {
        ...Utils.chartDefaults(),
        indexAxis: 'y',
        scales: { x: { max: 100, ticks: { callback: v => v + '%' } }, y: { grid: { display: false } } },
        plugins: { legend: { display: false } }
      }
    });

    // Current score chart per objective
    const currentScores = quarter.objectives.map(o => {
      const scores = o.keyResults.map(kr => Utils.calcOKRScore(kr.current, kr.target, kr.inverse));
      return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
    });

    this.charts.trend = Utils.destroyChart(this.charts.trend);
    this.charts.trend = new Chart(document.getElementById('okrTrendChart'), {
      type: 'bar',
      data: {
        labels: ['현재'],
        datasets: quarter.objectives.map((o, i) => ({
          label: o.title.slice(0, 15),
          data: [currentScores[i]],
          backgroundColor: Utils.colors.palette[i],
          borderRadius: 6,
          maxBarThickness: 50
        }))
      },
      options: {
        ...Utils.chartDefaults(),
        scales: { ...Utils.chartDefaults().scales, y: { ...Utils.chartDefaults().scales.y, max: 100, ticks: { callback: v => v + '%' } } }
      }
    });
  },

  renderObjectives(data) {
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    if (!quarter) return;

    document.getElementById('okrObjectivesList').innerHTML = quarter.objectives.map((obj, oi) => {
      const scores = obj.keyResults.map(kr => Utils.calcOKRScore(kr.current, kr.target, kr.inverse));
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const scoreColor = Utils.okrScoreColor(avgScore);

      return `
        <div class="okr-objective">
          <div class="okr-objective-header">
            <div>
              <div class="okr-objective-title">O${oi + 1}: ${Utils.escapeHtml(obj.title)}</div>
              <div style="font-size:12px;color:var(--text-light);margin-top:4px">담당: ${Utils.escapeHtml(obj.owner)}</div>
            </div>
            <div class="okr-score" style="color:${scoreColor}">${avgScore.toFixed(2)}</div>
          </div>
          <div class="okr-kr-list">
            ${obj.keyResults.map((kr, ki) => {
              const score = Utils.calcOKRScore(kr.current, kr.target, kr.inverse);
              const pct = Math.round(score * 100);
              const fillColor = Utils.okrScoreColor(score);
              return `
                <div class="okr-kr">
                  <div class="okr-kr-title">
                    <span style="color:var(--text-light);font-size:12px">KR${ki + 1}</span>
                    ${kr.title}
                    <span style="font-size:12px;color:var(--text-muted)">(${kr.current}/${kr.target}${kr.unit})</span>
                  </div>
                  <div>
                    <input type="range" min="0" max="${kr.target * (kr.inverse ? 2 : 1.5)}" step="${kr.target > 10 ? 1 : 0.1}" value="${kr.current}"
                      onchange="OKR.updateKR('${obj.id}','${kr.id}',this.value)">
                  </div>
                  <div class="okr-kr-percent" style="color:${fillColor}">${pct}%</div>
                  <div class="okr-kr-score" style="color:${fillColor}">${score.toFixed(2)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  updateKR(objId, krId, value) {
    const data = DataManager.get();
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    const obj = quarter.objectives.find(o => o.id === objId);
    if (obj) {
      const kr = obj.keyResults.find(k => k.id === krId);
      if (kr) {
        kr.current = Number(value);
        DataManager.save();
        this.render();
        Dashboard.render();
      }
    }
  },

  switchQuarter(q) {
    const data = DataManager.get();
    data.okrs.currentQuarter = q;
    if (!data.okrs.quarters[q]) {
      data.okrs.quarters[q] = { objectives: [], weeklyCheckins: [] };
    }
    DataManager.save();
    this.render();
  },

  openAddObjective() {
    Modal.open('Objective 추가', `
      <div class="form-group"><label>Objective 제목</label><input type="text" id="newObjTitle" placeholder="예: VisiScan 첫 유료 계약 체결"></div>
      <div class="form-group"><label>담당자</label><select id="newObjOwner">${DataManager.get().team.members.map(m => `<option value="${Utils.escapeHtml(m.name)}">${Utils.escapeHtml(m.name)}</option>`).join('')}</select></div>
      <div id="newKRList">
        <h4 style="margin:16px 0 8px">Key Results</h4>
        <div class="form-row">
          <div class="form-group"><label>KR1 제목</label><input type="text" id="newKR1Title"></div>
          <div class="form-group"><label>목표값</label><input type="number" id="newKR1Target"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>KR2 제목</label><input type="text" id="newKR2Title"></div>
          <div class="form-group"><label>목표값</label><input type="number" id="newKR2Target"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>KR3 제목</label><input type="text" id="newKR3Title"></div>
          <div class="form-group"><label>목표값</label><input type="number" id="newKR3Target"></div>
        </div>
      </div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="OKR.addObjective()">추가</button>`);
  },

  addObjective() {
    const data = DataManager.get();
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    const title = document.getElementById('newObjTitle').value;
    const owner = document.getElementById('newObjOwner').value;

    if (!title) return;

    const krs = [];
    for (let i = 1; i <= 3; i++) {
      const t = document.getElementById(`newKR${i}Title`).value;
      const target = Number(document.getElementById(`newKR${i}Target`).value);
      if (t && target > 0) {
        krs.push({ id: Utils.generateId(), title: t, target, current: 0, unit: '' });
      }
    }

    quarter.objectives.push({ id: Utils.generateId(), title, owner, keyResults: krs });
    DataManager.save();
    DataManager.addActivity('🎯', `새 Objective 추가: ${title}`, 'info');
    Modal.close();
    this.render();
    Dashboard.render();
  }
};
