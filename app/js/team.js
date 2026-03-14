// ===== TEAM MODULE =====

const Team = {
  charts: {},

  render() {
    const data = DataManager.get();
    this.renderKPIs(data);
    this.renderCharts(data);
    this.renderMembers(data);
    this.renderRoutineTracker(data);
  },

  renderKPIs(data) {
    const members = data.team.members;
    const avgSat = members.length > 0 ? members.reduce((s, m) => s + m.satisfaction, 0) / members.length : 0;
    const avgLevel = members.length > 0 ? members.reduce((s, m) => s + m.level, 0) / members.length : 0;
    const routines = data.team.routines;
    const routineNames = Object.keys(routines);
    const totalWeeks = routines[routineNames[0]]?.weeks.length || 8;
    const routineRate = routineNames.length > 0 ? routineNames.reduce((sum, rn) => {
      const done = routines[rn].weeks.filter(w => w).length;
      return sum + done / totalWeeks;
    }, 0) / routineNames.length * 100 : 0;

    document.getElementById('teamKPIGrid').innerHTML = [
      Utils.kpiCard('팀 규모', `${members.length}명`, '현재 인원', 'neutral', null, 'info'),
      Utils.kpiCard('팀 만족도', `${avgSat.toFixed(1)}/5`, avgSat >= 4 ? '양호' : '주의', avgSat >= 4 ? 'up' : 'down', null, avgSat >= 4 ? 'success' : 'warning'),
      Utils.kpiCard('평균 스킬 레벨', `Lv.${avgLevel.toFixed(1)}`, '전원 평균', 'neutral', '5단계 기준', 'info'),
      Utils.kpiCard('루틴 실행률', Utils.formatPercent(routineRate), routineRate >= 70 ? '양호' : '개선 필요', routineRate >= 70 ? 'up' : 'down', '주간 기준', routineRate >= 70 ? 'success' : 'warning')
    ].join('');
  },

  renderCharts(data) {
    const members = data.team.members;
    const skillLabels = ['리더십', '비즈니스', '기술', '소통', '문제해결'];
    const skillKeys = ['leadership', 'business', 'technical', 'communication', 'problemSolving'];

    // Radar chart
    this.charts.radar = Utils.destroyChart(this.charts.radar);
    this.charts.radar = new Chart(document.getElementById('skillRadarChart'), {
      type: 'radar',
      data: {
        labels: skillLabels,
        datasets: members.map((m, i) => ({
          label: m.name,
          data: skillKeys.map(k => m.skills[k]),
          borderColor: Utils.colors.palette[i],
          backgroundColor: Utils.colors.palette[i] + '20',
          pointBackgroundColor: Utils.colors.palette[i],
          borderWidth: 2
        }))
      },
      options: {
        responsive: true,
        scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
        plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } }
      }
    });

    // Satisfaction trend
    const satHistory = data.team.satisfactionHistory || [];
    this.charts.satisfaction = Utils.destroyChart(this.charts.satisfaction);
    this.charts.satisfaction = new Chart(document.getElementById('satisfactionChart'), {
      type: 'line',
      data: {
        labels: satHistory.map(h => Utils.formatMonth(h.month)),
        datasets: [{
          label: '팀 만족도',
          data: satHistory.map(h => h.score),
          borderColor: Utils.colors.success,
          backgroundColor: 'rgba(34,197,94,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 6
        }]
      },
      options: {
        ...Utils.chartDefaults(),
        scales: { ...Utils.chartDefaults().scales, y: { min: 1, max: 5, ticks: { stepSize: 1 } } }
      }
    });
  },

  renderMembers(data) {
    const levelNames = ['', '학습자', '실행자', '숙련자', '전문가', '마스터'];
    const levelColors = ['', 'gray', 'blue', 'green', 'purple', 'yellow'];

    if (data.team.members.length === 0) {
      document.getElementById('teamMemberGrid').innerHTML = `<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">등록된 팀원이 없습니다</div><div class="empty-state-sub">"+ 멤버 추가" 버튼으로 팀원을 등록하세요</div></div>`;
      return;
    }

    document.getElementById('teamMemberGrid').innerHTML = data.team.members.map(m => {
      const skillKeys = ['leadership', 'business', 'technical', 'communication', 'problemSolving'];
      const skillNames = ['리더십', '비즈니스', '기술', '소통', '문제해결'];

      return `
        <div class="team-card">
          <div class="team-card-header">
            <div class="team-avatar" style="background:${Utils.colors.palette[data.team.members.indexOf(m)]}">${m.avatar}</div>
            <div>
              <div class="team-name">${Utils.escapeHtml(m.name)}</div>
              <div class="team-role">${Utils.escapeHtml(m.role)}</div>
              <div style="margin-top:4px">${Utils.badge('Lv.' + m.level + ' ' + levelNames[m.level], levelColors[m.level])}</div>
            </div>
          </div>
          <div class="team-stats">
            <div class="team-stat">
              <div class="team-stat-value" style="color:${m.satisfaction >= 4 ? 'var(--success)' : 'var(--warning)'}">${m.satisfaction}/5</div>
              <div class="team-stat-label">만족도</div>
            </div>
            <div class="team-stat">
              <div class="team-stat-value">${m.level}/5</div>
              <div class="team-stat-label">스킬 레벨</div>
            </div>
            <div class="team-stat">
              <div class="team-stat-value">${Utils.formatDate(m.joinDate).slice(5)}</div>
              <div class="team-stat-label">합류일</div>
            </div>
          </div>
          <div class="skill-bar-container">
            ${skillKeys.map((k, i) => `
              <div class="skill-bar-item">
                <span class="skill-bar-label">${skillNames[i]}</span>
                <div class="skill-bar">
                  <div class="skill-bar-fill" style="width:${m.skills[k] / 5 * 100}%;background:${Utils.colors.palette[i]}"></div>
                </div>
                <span style="font-size:11px;font-weight:700;width:20px;text-align:right">${m.skills[k]}</span>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-sm btn-secondary" onclick="Team.editMember('${m.id}')">수정</button>
            <button class="btn btn-sm btn-secondary" onclick="Team.updateSatisfaction('${m.id}')">만족도</button>
            <button class="btn btn-sm btn-danger" onclick="Team.deleteMember('${m.id}')">삭제</button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderRoutineTracker(data) {
    const routines = data.team.routines;
    const container = document.getElementById('routineTracker');

    container.innerHTML = `
      <div class="routine-grid">
        ${Object.entries(routines).map(([key, routine]) => `
          <div class="routine-item">
            <div>
              <div class="routine-name">${routine.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">${routine.weeks.filter(w => w).length}/${routine.weeks.length}주 실행</div>
            </div>
            <div class="routine-streak">
              ${routine.weeks.map((done, wi) => `
                <div class="routine-dot ${done ? 'done' : ''}" style="cursor:pointer" onclick="Team.toggleRoutine('${key}',${wi})" title="Week ${wi + 1}"></div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  toggleRoutine(routineKey, weekIdx) {
    const data = DataManager.get();
    data.team.routines[routineKey].weeks[weekIdx] = !data.team.routines[routineKey].weeks[weekIdx];
    DataManager.save();
    this.render();
    Dashboard.render();
  },

  updateSatisfaction(memberId) {
    Modal.open('만족도 업데이트', `
      <div class="form-group">
        <label>만족도 (1~5)</label>
        <input type="range" id="satRange" min="1" max="5" step="0.5" value="${DataManager.get().team.members.find(m=>m.id===memberId)?.satisfaction || 4}" oninput="document.getElementById('satValue').textContent=this.value">
        <div style="text-align:center;font-size:24px;font-weight:700;margin-top:8px" id="satValue">${DataManager.get().team.members.find(m=>m.id===memberId)?.satisfaction || 4}</div>
      </div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Team.saveSatisfaction('${memberId}')">저장</button>`);
  },

  saveSatisfaction(memberId) {
    const data = DataManager.get();
    const member = data.team.members.find(m => m.id === memberId);
    if (member) {
      member.satisfaction = Number(document.getElementById('satRange').value);

      // Auto-track satisfaction history
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (!data.team.satisfactionHistory) data.team.satisfactionHistory = [];
      const avgSat = data.team.members.reduce((s, m) => s + m.satisfaction, 0) / data.team.members.length;
      const existing = data.team.satisfactionHistory.find(h => h.month === currentMonth);
      if (existing) {
        existing.score = Math.round(avgSat * 10) / 10;
      } else {
        data.team.satisfactionHistory.push({ month: currentMonth, score: Math.round(avgSat * 10) / 10 });
        // Keep last 12 months
        if (data.team.satisfactionHistory.length > 12) {
          data.team.satisfactionHistory = data.team.satisfactionHistory.slice(-12);
        }
      }

      DataManager.save();
      DataManager.addActivity('👥', `${member.name} 만족도 업데이트: ${member.satisfaction}/5`, 'info');
      Modal.close();
      this.render();
      Dashboard.render();
    }
  },

  editMember(memberId) {
    const data = DataManager.get();
    const m = data.team.members.find(mem => mem.id === memberId);
    if (!m) return;

    Modal.open(`${Utils.escapeHtml(m.name)} 정보 수정`, `
      <div class="form-row">
        <div class="form-group"><label>이름</label><input type="text" id="editName" value="${Utils.escapeHtml(m.name)}"></div>
        <div class="form-group"><label>역할</label><input type="text" id="editRole" value="${Utils.escapeHtml(m.role)}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>스킬 레벨 (1~5)</label><input type="number" id="editLevel" min="1" max="5" value="${m.level}"></div>
        <div class="form-group"><label>만족도 (1~5)</label><input type="number" id="editSat" min="1" max="5" step="0.5" value="${m.satisfaction}"></div>
      </div>
      <h4 style="margin:16px 0 8px">스킬 점수 (1~5)</h4>
      <div class="form-row">
        <div class="form-group"><label>리더십</label><input type="number" id="editSkillLeadership" min="1" max="5" value="${m.skills.leadership}"></div>
        <div class="form-group"><label>비즈니스</label><input type="number" id="editSkillBusiness" min="1" max="5" value="${m.skills.business}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>기술</label><input type="number" id="editSkillTechnical" min="1" max="5" value="${m.skills.technical}"></div>
        <div class="form-group"><label>소통</label><input type="number" id="editSkillComm" min="1" max="5" value="${m.skills.communication}"></div>
      </div>
      <div class="form-group"><label>문제해결</label><input type="number" id="editSkillProblem" min="1" max="5" value="${m.skills.problemSolving}"></div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Team.saveEdit('${memberId}')">저장</button>`);
  },

  saveEdit(memberId) {
    const data = DataManager.get();
    const m = data.team.members.find(mem => mem.id === memberId);
    if (!m) return;

    m.name = document.getElementById('editName').value;
    m.role = document.getElementById('editRole').value;
    m.level = Number(document.getElementById('editLevel').value);
    m.satisfaction = Number(document.getElementById('editSat').value);
    m.skills.leadership = Number(document.getElementById('editSkillLeadership').value);
    m.skills.business = Number(document.getElementById('editSkillBusiness').value);
    m.skills.technical = Number(document.getElementById('editSkillTechnical').value);
    m.skills.communication = Number(document.getElementById('editSkillComm').value);
    m.skills.problemSolving = Number(document.getElementById('editSkillProblem').value);

    DataManager.save();
    DataManager.addActivity('👥', `${m.name} 정보 수정 완료`, 'info');
    Modal.close();
    this.render();
    Dashboard.render();
  },

  openAddMember() {
    Modal.open('멤버 추가', `
      <div class="form-row">
        <div class="form-group"><label>이름</label><input type="text" id="addMemName"></div>
        <div class="form-group"><label>역할</label><input type="text" id="addMemRole"></div>
      </div>
      <div class="form-group"><label>합류일</label><input type="date" id="addMemDate"></div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Team.addMember()">추가</button>`);
  },

  addMember() {
    const data = DataManager.get();
    const name = document.getElementById('addMemName').value.trim();
    const role = document.getElementById('addMemRole').value.trim();
    const joinDate = document.getElementById('addMemDate').value;

    if (!name) { Utils.toast('이름을 입력해주세요.', 'warning'); return; }
    if (!role) { Utils.toast('역할을 입력해주세요.', 'warning'); return; }

    data.team.members.push({
      id: Utils.generateId(), name, role, avatar: name[0],
      skills: { leadership: 1, business: 1, technical: 1, communication: 1, problemSolving: 1 },
      level: 1, joinDate: joinDate || new Date().toISOString().slice(0, 10), satisfaction: 4,
      okrScore: 0, routineScore: 0
    });

    DataManager.save();
    DataManager.addActivity('👥', `새 멤버 추가: ${name} (${role})`, 'success');
    Modal.close();
    this.render();
    Dashboard.render();
  },

  exportCSV() {
    const data = DataManager.get();
    const header = '이름,역할,스킬레벨,만족도,합류일,리더십,비즈니스,기술,소통,문제해결';
    const rows = data.team.members.map(m =>
      `"${m.name.replace(/"/g, '""')}","${m.role.replace(/"/g, '""')}",${m.level},${m.satisfaction},${m.joinDate},${m.skills.leadership},${m.skills.business},${m.skills.technical},${m.skills.communication},${m.skills.problemSolving}`
    );
    Utils.downloadCSV([header, ...rows].join('\n'), `팀원_${new Date().toISOString().slice(0, 10)}.csv`);
    DataManager.addActivity('📤', '팀 데이터 CSV 내보내기', 'success');
  },

  deleteMember(memberId) {
    const data = DataManager.get();
    const member = data.team.members.find(m => m.id === memberId);
    if (!member) return;

    // Check for orphan references
    const warnings = [];
    const riskRefs = (data.risks || []).filter(r => r.owner === member.name);
    if (riskRefs.length > 0) warnings.push(`리스크 담당 ${riskRefs.length}건`);
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    const okrRefs = quarter ? quarter.objectives.filter(o => o.owner === member.name) : [];
    if (okrRefs.length > 0) warnings.push(`OKR 담당 ${okrRefs.length}건`);

    const warningText = warnings.length > 0 ? `\n\n⚠️ 이 멤버가 담당 중인 항목: ${warnings.join(', ')}.\n삭제 시 해당 담당이 "미지정"으로 변경됩니다.` : '';

    Modal.confirm('멤버 삭제', `${member.name}을(를) 삭제하시겠습니까?${warningText}`, () => {
      const idx = data.team.members.findIndex(m => m.id === memberId);
      if (idx >= 0) {
        // Clean up orphan references
        (data.risks || []).forEach(r => { if (r.owner === member.name) r.owner = '미지정'; });
        if (quarter) {
          quarter.objectives.forEach(o => { if (o.owner === member.name) o.owner = '미지정'; });
        }

        data.team.members.splice(idx, 1);
        DataManager.save();
        DataManager.addActivity('👥', `멤버 삭제: ${member.name}`, 'info');
        Modal.close();
        Team.render();
        Dashboard.render();
      }
    });
  }
};
