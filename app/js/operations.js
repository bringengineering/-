// ===== BRING ENGINEERING — OPERATIONS PAGE =====

const Operations = {
  render() {
    this.renderMissionVision();
    this.renderCoreValues();
    this.renderBehaviorRules();
    this.renderRhythm();
    this.renderDecisionFramework();
    this.renderRACIMatrix();
    this.renderEmergencyProcess();
    this.renderCommProtocol();
    this.renderEscalation();
    this.renderOrgStructure();
    this.renderGrowthRoadmap();
    this.renderKeyPersonRisk();
    this.renderMeetingRules();
  },

  renderMissionVision() {
    const d = DataManager.get().company;
    const el = document.getElementById('missionVisionSection');
    if (!el) return;
    const stepsHtml = (d.visionSteps || []).map(s => `
      <div class="vision-step">
        <div class="vision-year">${s.year}</div>
        <div class="vision-goal">${s.goal}</div>
        <span class="badge badge-info">${s.keyword}</span>
      </div>
    `).join('');
    el.innerHTML = `
      <div class="mission-card">
        <h4>미션 (Mission) — 왜 존재하는가</h4>
        <p class="mission-text">${(d.mission || '').replace(/\n/g, '<br>')}</p>
      </div>
      <div class="mission-card" style="margin-top:16px">
        <h4>비전 (Vision) — 어디까지 갈 것인가</h4>
        <p class="mission-text" style="margin-bottom:16px">${d.vision || ''}</p>
        <div class="vision-timeline">${stepsHtml}</div>
      </div>
    `;
  },

  renderCoreValues() {
    const values = DataManager.get().company.coreValues || [];
    const el = document.getElementById('coreValuesSection');
    if (!el) return;
    el.innerHTML = values.map((v, i) => `
      <div class="value-card">
        <div class="value-header">
          <span class="value-number">Value ${i + 1}</span>
          <h4>${v.name}</h4>
        </div>
        <p class="value-def">${v.definition}</p>
        <div class="value-detail">
          <div><strong>왜 중요한가:</strong> ${v.reason}</div>
          <div><strong>실행 기준:</strong> ${v.rule}</div>
        </div>
      </div>
    `).join('');
  },

  renderBehaviorRules() {
    const rules = DataManager.get().company.behaviorRules || [];
    const el = document.getElementById('behaviorRulesSection');
    if (!el) return;
    el.innerHTML = `<table class="data-table"><thead><tr><th>상황</th><th style="color:var(--success)">DO ✅</th><th style="color:var(--danger)">DON'T ❌</th></tr></thead><tbody>` +
      rules.map(r => `<tr><td><strong>${r.situation}</strong></td><td>${r.doThis}</td><td>${r.dontThis}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderRhythm() {
    const rhythm = DataManager.get().operations?.rhythm || [];
    const el = document.getElementById('rhythmSection');
    if (!el) return;
    el.innerHTML = `<table class="data-table"><thead><tr><th>주기</th><th>활동명</th><th>목적·내용</th><th>참여자</th><th>소요시간</th><th>산출물</th><th>책임자</th></tr></thead><tbody>` +
      rhythm.map(r => `<tr><td><strong>${r.cycle}</strong></td><td>${r.name}</td><td class="wrap-cell">${r.purpose}</td><td>${r.participants}</td><td>${r.duration}</td><td>${r.output}</td><td>${r.owner}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderDecisionFramework() {
    const df = DataManager.get().operations?.decisionFramework || [];
    const el = document.getElementById('decisionSection');
    if (!el) return;
    el.innerHTML = df.map(d => `
      <div class="decision-card level-${d.level.toLowerCase()}">
        <div class="decision-header">
          <span class="decision-level">${d.level}</span>
          <h4>${d.name}</h4>
          <span class="decision-time">${d.time}</span>
        </div>
        <div class="decision-body">
          <div><strong>기준:</strong> ${d.criteria}</div>
          <div><strong>결정자:</strong> ${d.decider}</div>
          <div><strong>보고:</strong> ${d.report}</div>
          <div><strong>예시:</strong> ${d.examples}</div>
        </div>
      </div>
    `).join('');
  },

  renderRACIMatrix() {
    const raci = DataManager.get().operations?.raciMatrix || [];
    const el = document.getElementById('raciSection');
    if (!el) return;
    el.innerHTML = `<p style="font-size:13px;color:var(--text-light);margin-bottom:12px">R=Responsible(실행), A=Accountable(최종책임), C=Consulted(자문), I=Informed(통보)</p>
    <table class="data-table"><thead><tr><th>영역</th><th>업무</th><th>대표</th><th>기술리드</th><th>플래너</th><th>Level</th></tr></thead><tbody>` +
      raci.map(r => `<tr><td>${r.area}</td><td>${r.task}</td><td class="raci-cell">${r.ceo}</td><td class="raci-cell">${r.techLead}</td><td class="raci-cell">${r.planner}</td><td><span class="badge badge-info">${r.level}</span></td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderEmergencyProcess() {
    const ep = DataManager.get().operations?.emergencyProcess || [];
    const el = document.getElementById('emergencySection');
    if (!el) return;
    el.innerHTML = `<table class="data-table"><thead><tr><th>긴급도</th><th>상황 예시</th><th>대표 연락</th><th>대리 결정자</th><th>사후 보고</th></tr></thead><tbody>` +
      ep.map(e => `<tr><td><strong>${e.urgency}</strong></td><td>${e.examples}</td><td>${e.ceoContact}</td><td>${e.proxy}</td><td>${e.postReport}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderCommProtocol() {
    const cp = DataManager.get().operations?.commProtocol || [];
    const el = document.getElementById('commProtocolSection');
    if (!el) return;
    el.innerHTML = `<table class="data-table"><thead><tr><th>채널</th><th>용도</th><th>응답 기준</th><th>형식</th><th>금지 사항</th></tr></thead><tbody>` +
      cp.map(c => `<tr><td><strong>${c.channel}</strong></td><td>${c.usage}</td><td>${c.responseTime}</td><td>${c.format}</td><td style="color:var(--danger)">${c.forbidden}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderEscalation() {
    const esc = DataManager.get().operations?.escalation || [];
    const el = document.getElementById('escalationSection');
    if (!el) return;
    el.innerHTML = `<table class="data-table"><thead><tr><th>우선순위</th><th>정의</th><th>보고 채널</th><th>보고 시한</th><th>보고 대상</th><th>후속 조치</th></tr></thead><tbody>` +
      esc.map(e => `<tr><td><strong>${e.priority}</strong></td><td>${e.definition}</td><td>${e.channel}</td><td>${e.deadline}</td><td>${e.target}</td><td>${e.followup}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderOrgStructure() {
    const org = DataManager.get().operations?.orgStructure?.current || [];
    const el = document.getElementById('orgStructureSection');
    if (!el) return;
    el.innerHTML = `<table class="data-table"><thead><tr><th>포지션</th><th>담당자</th><th>핵심 R&R</th><th>담당 프로젝트</th><th>백업 인력</th><th>비고</th></tr></thead><tbody>` +
      org.map(o => `<tr><td><strong>${o.position}</strong></td><td>${o.name}</td><td class="wrap-cell">${o.rnr}</td><td>${o.projects}</td><td>${o.backup}</td><td>${o.note ? '<span class="badge badge-danger">' + o.note + '</span>' : ''}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderGrowthRoadmap() {
    const gr = DataManager.get().operations?.orgStructure?.growthRoadmap || [];
    const el = document.getElementById('growthRoadmapSection');
    if (!el) return;
    el.innerHTML = gr.map((g, i) => `
      <div class="growth-phase ${i === 0 ? 'current' : ''}">
        <div class="phase-header">
          <h4>${g.phase}</h4>
          <span class="badge ${i === 0 ? 'badge-success' : 'badge-info'}">${g.period}</span>
          <span class="phase-headcount">${g.headcount}</span>
        </div>
        <div class="phase-body">
          <div><strong>추가 필요 역할:</strong> ${g.newRoles}</div>
          <div><strong>조직 구조:</strong> ${g.structure}</div>
          ${g.trigger !== '—' ? '<div><strong>트리거:</strong> ' + g.trigger + '</div>' : ''}
        </div>
      </div>
    `).join('');
  },

  renderKeyPersonRisk() {
    const kpr = DataManager.get().operations?.orgStructure?.keyPersonRisk || [];
    const el = document.getElementById('keyPersonRiskSection');
    if (!el) return;
    el.innerHTML = `<table class="data-table"><thead><tr><th>핵심 인력</th><th>이탈 시 영향</th><th>영향 범위</th><th>현재 대비</th><th>추가 필요</th><th>위험도</th></tr></thead><tbody>` +
      kpr.map(k => `<tr><td><strong>${k.person}</strong></td><td>${k.impact}</td><td>${k.scope}</td><td>${k.currentMeasure}</td><td>${k.needed}</td><td>${k.risk}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderMeetingRules() {
    const mr = DataManager.get().operations?.meetingRules || [];
    const el = document.getElementById('meetingRulesSection');
    if (!el) return;
    el.innerHTML = mr.map(m => `
      <div class="meeting-rule">
        <strong>${m.rule}</strong>
        <p>${m.detail}</p>
        <small>${m.reason}</small>
      </div>
    `).join('');
  }
};
