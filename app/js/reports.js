// ===== REPORTS MODULE =====

const Reports = {
  generate() {
    const data = DataManager.get();
    const fin = Dashboard.calcFinancialSummary(data);
    const okrScore = Dashboard.calcOKRScore(data);
    const quarter = data.okrs.quarters[data.okrs.currentQuarter];
    const pipelineTotal = data.pipeline.deals.reduce((s, d) => s + d.amount, 0);
    const teamSat = data.team.members.reduce((s, m) => s + m.satisfaction, 0) / data.team.members.length;
    const criticalRisks = data.risks.filter(r => r.impact * r.probability >= 15 && r.status === 'active');

    const now = new Date();
    const monthStr = document.getElementById('reportMonth').value;

    document.getElementById('reportContent').innerHTML = `
      <h1>📊 ${data.company.name} — 월간 경영 리포트</h1>
      <p style="color:var(--text-light)">보고 기간: ${monthStr} | 생성일: ${now.toLocaleDateString('ko-KR')} | 대표: ${data.company.ceo}</p>

      <h2>1. Executive Summary (경영 요약)</h2>
      <table>
        <tr><th>지표</th><th>현재</th><th>상태</th><th>비고</th></tr>
        <tr>
          <td>현금 잔고</td>
          <td style="font-weight:700">${Utils.formatWon(fin.currentBalance)}</td>
          <td>${fin.currentBalance > 0 ? '🟢' : '🔴'}</td>
          <td>런웨이 ${fin.runway.toFixed(1)}개월</td>
        </tr>
        <tr>
          <td>월간 Burn Rate</td>
          <td style="font-weight:700">${Utils.formatWon(fin.burnRate)}</td>
          <td>${fin.burnRate <= 850 ? '🟢' : '🟡'}</td>
          <td>3개월 평균</td>
        </tr>
        <tr>
          <td>OKR 진행률</td>
          <td style="font-weight:700">${(okrScore * 100).toFixed(0)}%</td>
          <td>${okrScore >= 0.6 ? '🟢' : okrScore >= 0.4 ? '🟡' : '🔴'}</td>
          <td>점수 ${okrScore.toFixed(2)}</td>
        </tr>
        <tr>
          <td>파이프라인</td>
          <td style="font-weight:700">${Utils.formatWon(pipelineTotal)}</td>
          <td>${pipelineTotal >= 5000 ? '🟢' : '🟡'}</td>
          <td>${data.pipeline.deals.length}건</td>
        </tr>
        <tr>
          <td>팀 만족도</td>
          <td style="font-weight:700">${teamSat.toFixed(1)}/5</td>
          <td>${teamSat >= 4 ? '🟢' : '🟡'}</td>
          <td>${data.team.members.length}명</td>
        </tr>
        <tr>
          <td>심각 리스크</td>
          <td style="font-weight:700">${criticalRisks.length}건</td>
          <td>${criticalRisks.length === 0 ? '🟢' : '🔴'}</td>
          <td>${criticalRisks.length > 0 ? criticalRisks.map(r => r.title).join(', ') : '없음'}</td>
        </tr>
      </table>

      <h2>2. 재무 현황</h2>
      <table>
        <tr><th>항목</th><th>금액</th></tr>
        <tr><td>현금 잔고</td><td>${Utils.formatWon(fin.currentBalance)}</td></tr>
        <tr><td>월간 Burn Rate (3개월 평균)</td><td>${Utils.formatWon(fin.burnRate)}</td></tr>
        <tr><td>런웨이</td><td style="font-weight:700;color:${fin.runway >= 6 ? 'var(--success)' : 'var(--danger)'}">${fin.runway.toFixed(1)}개월</td></tr>
      </table>
      <p><strong>정부과제 집행률:</strong></p>
      ${data.financial.govBudgets.map(gb => {
        const pct = (gb.spent / gb.totalBudget * 100).toFixed(1);
        return `<p>• ${gb.name}: ${Utils.formatNumber(gb.spent)}만 / ${Utils.formatNumber(gb.totalBudget)}만 (${pct}%)</p>`;
      }).join('')}

      <h2>3. OKR 진행 상황 (${data.okrs.currentQuarter})</h2>
      ${quarter ? quarter.objectives.map((obj, i) => {
        const scores = obj.keyResults.map(kr => Utils.calcOKRScore(kr.current, kr.target, kr.inverse));
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        return `
          <h3 style="font-size:15px;margin:16px 0 8px">O${i+1}: ${obj.title} <span style="color:${Utils.okrScoreColor(avgScore)}">(${avgScore.toFixed(2)})</span></h3>
          <table>
            <tr><th>Key Result</th><th>현재</th><th>목표</th><th>달성률</th></tr>
            ${obj.keyResults.map(kr => {
              const s = Utils.calcOKRScore(kr.current, kr.target, kr.inverse);
              return `<tr><td>${kr.title}</td><td>${kr.current}${kr.unit}</td><td>${kr.target}${kr.unit}</td><td style="color:${Utils.okrScoreColor(s)};font-weight:700">${(s*100).toFixed(0)}%</td></tr>`;
            }).join('')}
          </table>
        `;
      }).join('') : '<p>OKR 데이터 없음</p>'}

      <h2>4. 제품/기술 현황</h2>
      <table>
        <tr><th>제품</th><th>현재 TRL</th><th>목표 TRL</th><th>달성률</th><th>기술부채</th></tr>
        ${data.projects.map(p => {
          const pct = (p.currentTRL / p.targetTRL * 100).toFixed(0);
          const debt = p.techDebt.high + p.techDebt.medium + p.techDebt.low;
          return `<tr><td>${p.name}</td><td>TRL ${p.currentTRL}</td><td>TRL ${p.targetTRL}</td><td style="font-weight:700">${pct}%</td><td>${debt}건</td></tr>`;
        }).join('')}
      </table>

      <h2>5. 영업 파이프라인</h2>
      <table>
        <tr><th>고객</th><th>제품</th><th>단계</th><th>금액</th><th>예상시기</th></tr>
        ${data.pipeline.deals.map(d => `<tr><td>${d.name}</td><td>${d.product}</td><td>${data.pipeline.stages[d.stage]}</td><td>${Utils.formatNumber(d.amount)}만원</td><td>${d.expectedDate}</td></tr>`).join('')}
      </table>
      <p><strong>총 파이프라인:</strong> ${Utils.formatWon(pipelineTotal)} (${data.pipeline.deals.length}건)</p>

      <h2>6. 팀 현황</h2>
      <table>
        <tr><th>이름</th><th>역할</th><th>스킬레벨</th><th>만족도</th></tr>
        ${data.team.members.map(m => `<tr><td>${m.name}</td><td>${m.role}</td><td>Lv.${m.level}</td><td>${m.satisfaction}/5</td></tr>`).join('')}
      </table>

      <h2>7. 리스크 현황</h2>
      <table>
        <tr><th>리스크</th><th>카테고리</th><th>점수</th><th>등급</th><th>담당</th></tr>
        ${data.risks.filter(r => r.status === 'active').sort((a,b) => b.impact*b.probability - a.impact*a.probability).map(r => {
          const score = r.impact * r.probability;
          const grade = score >= 15 ? '🔴 심각' : score >= 8 ? '🟡 주의' : '🟢 수용';
          return `<tr><td>${r.title}</td><td>${r.category}</td><td style="font-weight:700">${score}</td><td>${grade}</td><td>${r.owner}</td></tr>`;
        }).join('')}
      </table>

      <h2>8. 종합 건강도</h2>
      <div style="text-align:center;padding:20px">
        <div style="font-size:48px;font-weight:800;color:${this._calcOverallHealth(data) >= 70 ? 'var(--success)' : this._calcOverallHealth(data) >= 50 ? 'var(--warning)' : 'var(--danger)'}">${this._calcOverallHealth(data)}/100</div>
        <div style="font-size:16px;color:var(--text-light)">전체 경영 건강도</div>
      </div>

      <hr style="margin:24px 0">
      <p style="font-size:12px;color:var(--text-muted);text-align:center">
        본 리포트는 ${data.company.name} 경영관리 시스템에 의해 자동 생성되었습니다.<br>
        데이터 기준: ${now.toLocaleDateString('ko-KR')} | 문의: ${data.company.ceo} (대표)
      </p>
    `;

    DataManager.addActivity('📋', `월간 경영 리포트 생성 (${monthStr})`, 'success');
  },

  _calcOverallHealth(data) {
    const fin = Dashboard.calcFinancialSummary(data);
    const okrScore = Dashboard.calcOKRScore(data);
    const teamSat = data.team.members.reduce((s, m) => s + m.satisfaction, 0) / data.team.members.length;
    const techScore = data.projects.reduce((s, p) => s + p.currentTRL / p.targetTRL, 0) / data.projects.length;

    return Math.round(
      Math.min(100, fin.runway / 6 * 100) * 0.3 +
      okrScore * 100 * 0.25 +
      techScore * 100 * 0.2 +
      teamSat / 5 * 100 * 0.25
    );
  },

  exportPDF() {
    window.print();
  }
};
