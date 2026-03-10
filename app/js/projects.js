// ===== PROJECTS MODULE =====

const Projects = {
  charts: {},

  render() {
    const data = DataManager.get();
    this.renderKPIs(data);
    this.renderCharts(data);
    this.renderProjects(data);
    this.renderTechDebt(data);
  },

  renderKPIs(data) {
    const projects = data.projects;
    const avgTRLProgress = projects.reduce((s, p) => s + p.currentTRL / p.targetTRL, 0) / projects.length * 100;
    const totalMilestones = projects.reduce((s, p) => s + p.milestones.length, 0);
    const completedMilestones = projects.reduce((s, p) => s + p.milestones.filter(m => m.status === 'done').length, 0);
    const totalDebt = projects.reduce((s, p) => s + p.techDebt.high + p.techDebt.medium + p.techDebt.low, 0);
    const highDebt = projects.reduce((s, p) => s + p.techDebt.high, 0);

    document.getElementById('projectsKPIGrid').innerHTML = [
      Utils.kpiCard('프로젝트', `${projects.length}개`, '동시 진행', 'neutral', null, 'info'),
      Utils.kpiCard('TRL 평균 달성률', Utils.formatPercent(avgTRLProgress), avgTRLProgress >= 50 ? '순조로움' : '점검 필요', avgTRLProgress >= 50 ? 'up' : 'down', null, avgTRLProgress >= 50 ? 'success' : 'warning'),
      Utils.kpiCard('마일스톤', `${completedMilestones}/${totalMilestones}`, Utils.formatPercent(totalMilestones > 0 ? completedMilestones / totalMilestones * 100 : 0), completedMilestones > 0 ? 'up' : 'neutral', null, 'info'),
      Utils.kpiCard('기술 부채', `${totalDebt}건`, highDebt > 0 ? `심각 ${highDebt}건` : '심각 없음', highDebt > 0 ? 'down' : 'up', null, highDebt > 0 ? 'danger' : 'success')
    ].join('');
  },

  renderCharts(data) {
    const projects = data.projects;

    this.charts.trlRoadmap = Utils.destroyChart(this.charts.trlRoadmap);
    this.charts.trlRoadmap = new Chart(document.getElementById('trlRoadmapChart'), {
      type: 'bar',
      data: {
        labels: projects.map(p => p.name),
        datasets: [
          {
            label: '현재 TRL',
            data: projects.map(p => p.currentTRL),
            backgroundColor: projects.map(p => {
              const ratio = p.currentTRL / p.targetTRL;
              return ratio >= 0.7 ? Utils.colors.success : ratio >= 0.4 ? Utils.colors.warning : Utils.colors.danger;
            }),
            borderRadius: 6,
            maxBarThickness: 50
          },
          {
            label: '목표 TRL',
            data: projects.map(p => p.targetTRL),
            backgroundColor: 'rgba(100,116,139,0.15)',
            borderColor: 'rgba(100,116,139,0.5)',
            borderWidth: 2,
            borderRadius: 6,
            maxBarThickness: 50
          }
        ]
      },
      options: {
        ...Utils.chartDefaults(),
        scales: {
          ...Utils.chartDefaults().scales,
          y: { ...Utils.chartDefaults().scales.y, max: 9, ticks: { stepSize: 1, callback: v => 'TRL ' + v } }
        }
      }
    });
  },

  renderProjects(data) {
    const priorityLabels = ['', '⭐', '⭐⭐', '⭐⭐⭐'];

    document.getElementById('projectsList').innerHTML = data.projects.map((p, pi) => {
      const trlPct = (p.currentTRL / 9 * 100).toFixed(0);
      const targetPct = (p.targetTRL / 9 * 100).toFixed(0);
      const completedMs = p.milestones.filter(m => m.status === 'done').length;
      const totalMs = p.milestones.length;

      return `
        <div class="project-card">
          <div class="project-header">
            <div>
              <span class="project-name">${p.name}</span>
              <span style="font-size:13px;color:var(--text-light);margin-left:8px">${p.description}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:13px">${priorityLabels[p.priority] || ''}</span>
              <span class="trl-badge">TRL ${p.currentTRL} → ${p.targetTRL}</span>
            </div>
          </div>

          <div class="project-trl-bar">
            <div class="project-trl-fill" style="width:${trlPct}%"></div>
            <div class="project-trl-target" style="left:${targetPct}%" title="목표 TRL ${p.targetTRL}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)">
            <span>TRL 1</span>
            <span>현재: TRL ${p.currentTRL} (${(p.currentTRL / p.targetTRL * 100).toFixed(0)}%)</span>
            <span>TRL 9</span>
          </div>

          <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">
            <h4 style="font-size:14px;font-weight:600">마일스톤 (${completedMs}/${totalMs})</h4>
            <div style="display:flex;gap:8px">
              <input type="number" min="1" max="9" value="${p.currentTRL}" style="width:60px;padding:4px;font-size:13px;border:1px solid var(--border);border-radius:4px"
                onchange="Projects.updateTRL(${pi}, this.value)" title="현재 TRL 변경">
              <button class="btn btn-sm btn-secondary" onclick="Projects.addMilestone(${pi})">+ 마일스톤</button>
            </div>
          </div>

          <div class="project-milestones">
            ${p.milestones.map((ms, mi) => `
              <div class="milestone ${ms.status}" onclick="Projects.toggleMilestone(${pi}, ${mi})" style="cursor:pointer">
                <span>${ms.status === 'done' ? '✅' : ms.status === 'in-progress' ? '🔄' : '⬜'}</span>
                <span>${ms.title}</span>
                <span style="font-size:11px;color:var(--text-muted)">${Utils.formatDate(ms.dueDate)}</span>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:12px;font-size:12px;color:var(--text-light)">
            기술 부채: <span style="color:var(--danger);font-weight:700">${p.techDebt.high} 심각</span> /
            <span style="color:var(--warning);font-weight:700">${p.techDebt.medium} 중간</span> /
            <span style="color:var(--text-muted);font-weight:700">${p.techDebt.low} 낮음</span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderTechDebt(data) {
    const container = document.getElementById('techDebtSection');
    const totalDebt = data.projects.reduce((s, p) => s + p.techDebt.high + p.techDebt.medium + p.techDebt.low, 0);

    container.innerHTML = data.projects.map(p => {
      const total = p.techDebt.high + p.techDebt.medium + p.techDebt.low;
      if (total === 0) return '';
      const hPct = total > 0 ? p.techDebt.high / total * 100 : 0;
      const mPct = total > 0 ? p.techDebt.medium / total * 100 : 0;
      const lPct = total > 0 ? p.techDebt.low / total * 100 : 0;

      return `
        <div class="tech-debt-bar">
          <span class="tech-debt-label">${p.name}</span>
          <div class="tech-debt-progress">
            <div class="tech-debt-segment" style="width:${hPct}%;background:var(--danger)"></div>
            <div class="tech-debt-segment" style="width:${mPct}%;background:var(--warning)"></div>
            <div class="tech-debt-segment" style="width:${lPct}%;background:var(--text-muted)"></div>
          </div>
          <span style="font-size:12px;font-weight:700;width:40px;text-align:right">${total}건</span>
        </div>
      `;
    }).join('') || '<p style="color:var(--text-muted);font-size:14px">등록된 기술 부채가 없습니다.</p>';
  },

  updateTRL(projectIdx, value) {
    const data = DataManager.get();
    data.projects[projectIdx].currentTRL = Math.min(9, Math.max(1, Number(value)));
    DataManager.save();
    DataManager.addActivity('🔧', `${data.projects[projectIdx].name} TRL ${value}로 업데이트`, 'info');
    this.render();
    Dashboard.render();
  },

  toggleMilestone(projectIdx, milestoneIdx) {
    const data = DataManager.get();
    const ms = data.projects[projectIdx].milestones[milestoneIdx];
    const states = ['pending', 'in-progress', 'done'];
    const currentIdx = states.indexOf(ms.status);
    ms.status = states[(currentIdx + 1) % 3];
    DataManager.save();
    if (ms.status === 'done') {
      DataManager.addActivity('✅', `마일스톤 완료: ${ms.title} (${data.projects[projectIdx].name})`, 'success');
    }
    this.render();
    Dashboard.render();
  },

  addMilestone(projectIdx) {
    Modal.open('마일스톤 추가', `
      <div class="form-group"><label>마일스톤 제목</label><input type="text" id="newMsTitle"></div>
      <div class="form-group"><label>목표일</label><input type="date" id="newMsDue"></div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Projects.saveMilestone(${projectIdx})">추가</button>`);
  },

  saveMilestone(projectIdx) {
    const data = DataManager.get();
    const title = document.getElementById('newMsTitle').value;
    const dueDate = document.getElementById('newMsDue').value;
    if (!title) return;

    data.projects[projectIdx].milestones.push({ title, status: 'pending', dueDate });
    DataManager.save();
    Modal.close();
    this.render();
  },

  openAddProject() {
    Modal.open('프로젝트 추가', `
      <div class="form-group"><label>프로젝트명</label><input type="text" id="newProjName"></div>
      <div class="form-group"><label>설명</label><input type="text" id="newProjDesc"></div>
      <div class="form-row">
        <div class="form-group"><label>현재 TRL</label><input type="number" id="newProjTRL" min="1" max="9" value="3"></div>
        <div class="form-group"><label>목표 TRL</label><input type="number" id="newProjTargetTRL" min="1" max="9" value="6"></div>
      </div>
      <div class="form-group"><label>우선순위</label><select id="newProjPriority"><option value="3">⭐⭐⭐ 최우선</option><option value="2">⭐⭐ 중요</option><option value="1">⭐ 일반</option></select></div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Projects.addProject()">추가</button>`);
  },

  addProject() {
    const data = DataManager.get();
    data.projects.push({
      id: Utils.generateId(),
      name: document.getElementById('newProjName').value,
      description: document.getElementById('newProjDesc').value,
      currentTRL: Number(document.getElementById('newProjTRL').value),
      targetTRL: Number(document.getElementById('newProjTargetTRL').value),
      priority: Number(document.getElementById('newProjPriority').value),
      milestones: [],
      techDebt: { high: 0, medium: 0, low: 0 }
    });
    DataManager.save();
    DataManager.addActivity('🔧', `새 프로젝트 추가: ${document.getElementById('newProjName').value}`, 'info');
    Modal.close();
    this.render();
    Dashboard.render();
  }
};
