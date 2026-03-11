// ===== BRING ENGINEERING — HR PAGE =====

const HRPage = {
  render() {
    this.renderOnboarding();
    this.renderPerformanceEval();
    this.renderCompensation();
    this.renderResignation();
    this.renderDevPlans();
    this.renderTaxCalendar();
  },

  renderOnboarding() {
    const ob = DataManager.get().hr?.onboarding;
    const el = document.getElementById('onboardingSection');
    if (!el || !ob) return;

    const renderPhase = (phase) => {
      if (!phase) return '';
      return `
        <div class="onboarding-phase">
          <h4>${phase.title}</h4>
          <div class="onboarding-items">
            ${phase.items.map((item, idx) => `
              <div class="onboarding-item ${item.done ? 'done' : ''}">
                <div class="ob-period">${item.period}</div>
                <div class="ob-content">
                  <div class="ob-area"><span class="badge badge-info">${item.area}</span></div>
                  <div class="ob-task">${item.task}</div>
                  <div class="ob-output">산출물: ${item.output}</div>
                  <div class="ob-mentor">멘토: ${item.mentor}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    el.innerHTML = renderPhase(ob.phase1) + renderPhase(ob.phase2) + renderPhase(ob.phase3);
  },

  renderPerformanceEval() {
    const pe = DataManager.get().hr?.performanceEval;
    const el = document.getElementById('perfEvalSection');
    if (!el || !pe) return;

    el.innerHTML = `
      <h4>평가 구조 — 2축 평가 (성과 60% + 핵심가치 40%)</h4>
      <table class="data-table" style="margin-bottom:20px"><thead><tr><th>평가 축</th><th>비중</th><th>측정 방법</th><th>주기</th><th>평가자</th><th>기준</th></tr></thead><tbody>
      ${(pe.structure || []).map(s => `<tr><td><strong>${s.axis}</strong></td><td>${s.weight}</td><td>${s.method}</td><td>${s.cycle}</td><td>${s.evaluator}</td><td>${s.standard}</td></tr>`).join('')}
      </tbody></table>

      <h4>핵심가치 행동 평가표 (1~5점)</h4>
      <table class="data-table"><thead><tr><th>핵심가치</th><th style="color:var(--danger)">1점 (미흡)</th><th>3점 (보통)</th><th style="color:var(--success)">5점 (탁월)</th></tr></thead><tbody>
      ${(pe.behaviorRubric || []).map(b => `<tr><td><strong>${b.value}</strong></td><td>${b.score1}</td><td>${b.score3}</td><td>${b.score5}</td></tr>`).join('')}
      </tbody></table>
    `;
  },

  renderCompensation() {
    const comp = DataManager.get().hr?.compensation || [];
    const el = document.getElementById('compensationSection');
    if (!el) return;

    el.innerHTML = `<table class="data-table"><thead><tr><th>단계</th><th>매출 수준</th><th>금전 보상</th><th>비금전 보상</th><th>인센티브</th><th>스톡옵션</th></tr></thead><tbody>` +
      comp.map((c, i) => `<tr class="${i === 0 ? 'current-phase' : ''}"><td><strong>${c.phase}</strong></td><td>${c.revenue}</td><td>${c.monetary}</td><td>${c.nonMonetary}</td><td>${c.incentive}</td><td>${c.stockOption}</td></tr>`).join('') +
      `</tbody></table>`;
  },

  renderResignation() {
    const rp = DataManager.get().hr?.resignationProtocol || [];
    const el = document.getElementById('resignationSection');
    if (!el) return;

    el.innerHTML = `<div class="resignation-timeline">` +
      rp.map(r => `
        <div class="resign-step">
          <div class="resign-timing">${r.timing}</div>
          <div class="resign-content">
            <h4>${r.phase}</h4>
            <p>${r.activities}</p>
            <div class="resign-meta"><span>담당: ${r.owner}</span><span>산출물: ${r.output}</span></div>
          </div>
        </div>
      `).join('') +
      `</div>`;
  },

  renderDevPlans() {
    const plans = DataManager.get().devPlans;
    const el = document.getElementById('devPlansSection');
    if (!el || !plans) return;

    el.innerHTML = Object.entries(plans).map(([name, plan]) => `
      <div class="dev-plan-card">
        <div class="dev-plan-header">
          <h4>${name} <span class="badge badge-info">${plan.role}</span></h4>
          <span>${plan.period}</span>
        </div>
        ${plan.weeks.map(w => `
          <div class="dev-week">
            <h5>${w.week} — ${w.title}</h5>
            <table class="data-table compact"><thead><tr><th>#</th><th>영역</th><th>과제</th><th>상세</th><th>마감</th><th>상태</th></tr></thead><tbody>
            ${w.tasks.map(t => `<tr><td>${t.id}</td><td><span class="badge badge-info">${t.area}</span></td><td><strong>${t.task}</strong></td><td class="wrap-cell">${t.detail}</td><td>${t.due}</td><td>${t.status}</td></tr>`).join('')}
            </tbody></table>
          </div>
        `).join('')}
      </div>
    `).join('');
  },

  renderTaxCalendar() {
    const tc = DataManager.get().taxCalendar || [];
    const el = document.getElementById('taxCalendarSection');
    if (!el) return;

    el.innerHTML = `<table class="data-table"><thead><tr><th>월</th><th>세무/회계 업무</th><th>세부 내용</th><th>마감일</th><th>담당</th></tr></thead><tbody>` +
      tc.map(t => `<tr><td><strong>${t.month}</strong></td><td>${t.task}</td><td>${t.detail}</td><td>${t.deadline}</td><td>${t.owner}</td></tr>`).join('') +
      `</tbody></table>`;
  }
};
