// ===== BRING ENGINEERING — ROADMAP PAGE =====

const RoadmapPage = {
  render() {
    this.renderWeeklyRoadmap();
    this.renderFDISchedule();
    this.renderCompetitors();
    this.renderBrandAssets();
  },

  renderWeeklyRoadmap() {
    const rm = DataManager.get().roadmap;
    const el = document.getElementById('weeklyRoadmapSection');
    if (!el || !rm) return;

    const weeks = rm.weeks || [];
    const totalTasks = weeks.reduce((sum, w) => sum + w.items.length, 0);
    const doneTasks = weeks.reduce((sum, w) => sum + w.items.filter(i => i.done).length, 0);
    const pct = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;

    const phaseColors = { 'Phase 1': '#22c55e', 'Phase 2': '#3b82f6', 'Phase 3': '#f59e0b', 'Phase 4': '#ef4444' };

    el.innerHTML = `
      <div class="roadmap-progress">
        <div class="roadmap-bar"><div class="roadmap-fill" style="width:${pct}%"></div></div>
        <span>${doneTasks}/${totalTasks} 완료 (${pct}%)</span>
      </div>
      <div class="roadmap-grid">
        ${weeks.map(w => `
          <div class="roadmap-week" style="border-left: 4px solid ${phaseColors[w.phase] || '#666'}">
            <div class="week-header">
              <strong>${w.week}</strong>
              <span class="badge" style="background:${phaseColors[w.phase] || '#666'};color:#fff">${w.phase}</span>
            </div>
            ${w.items.map((item, idx) => {
              const weekIdx = weeks.indexOf(w);
              return `
                <div class="roadmap-item ${item.done ? 'done' : ''}">
                  <label>
                    <input type="checkbox" ${item.done ? 'checked' : ''} onchange="RoadmapPage.toggleItem(${weekIdx}, ${idx})">
                    <strong>${item.task}</strong>
                  </label>
                  <div class="roadmap-goal">${item.goal}</div>
                  <div class="roadmap-owner">담당: ${item.owner}</div>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `;
  },

  toggleItem(weekIdx, itemIdx) {
    const data = DataManager.get();
    const item = data.roadmap?.weeks?.[weekIdx]?.items?.[itemIdx];
    if (item !== undefined) {
      item.done = !item.done;
      DataManager.save();
      this.renderWeeklyRoadmap();
    }
  },

  renderFDISchedule() {
    const rm = DataManager.get().roadmap;
    const el = document.getElementById('fdiScheduleSection');
    if (!el || !rm) return;

    const items = rm.fdiSchedule || [];
    const months = rm.fdiMonths || [];

    el.innerHTML = `
      <table class="data-table gantt-table">
        <thead><tr><th>단계</th><th>TRL</th><th>세부 내용</th>${months.map(m => `<th class="gantt-month">${m}</th>`).join('')}</tr></thead>
        <tbody>
          ${items.map(item => `<tr>
            <td><strong>${item.stage}</strong></td>
            <td><span class="badge badge-info">${item.trl}</span></td>
            <td>${item.task}</td>
            ${item.months.map(m => `<td class="gantt-cell">${m ? '<div class="gantt-bar"></div>' : ''}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    `;
  },

  renderCompetitors() {
    const comp = DataManager.get().strategy?.competitors || [];
    const el = document.getElementById('competitorSection');
    if (!el) return;

    el.innerHTML = `<table class="data-table"><thead><tr><th>비교 항목</th><th style="color:var(--primary)">브링엔지니어링</th><th>국내 업체 A</th><th>국내 업체 B</th><th>해외 솔루션</th><th>대학·연구기관</th></tr></thead><tbody>` +
      comp.map(c => `<tr><td><strong>${c.item}</strong></td><td class="highlight-cell">${c.bring}</td><td>${c.compA}</td><td>${c.compB}</td><td>${c.overseas}</td><td>${c.academia}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderBrandAssets() {
    const assets = DataManager.get().strategy?.brandAssets || [];
    const el = document.getElementById('brandAssetsSection');
    if (!el) return;

    const typeIcons = { '수상': '🏆', '인증': '✅', '성과': '📊', '선정': '🎯', '지재권': '📜', 'MOU': '🤝' };

    el.innerHTML = `<div class="brand-grid">` +
      assets.map(a => `
        <div class="brand-card">
          <div class="brand-icon">${typeIcons[a.type] || '📌'}</div>
          <div class="brand-content">
            <span class="badge badge-info">${a.type}</span>
            <h4>${a.content}</h4>
            <div class="brand-meta">${a.org} · ${a.date}</div>
            <div class="brand-usage">활용: ${a.usage}</div>
          </div>
        </div>
      `).join('') +
      `</div>`;
  }
};
