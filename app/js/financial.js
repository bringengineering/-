// ===== FINANCIAL MODULE =====

const Financial = {
  charts: {},

  render() {
    const data = DataManager.get();
    this.renderKPIs(data);
    this.renderCharts(data);
    this.renderCashflowTable(data);
    this.renderGovBudget(data);
  },

  renderKPIs(data) {
    const months = data.financial.months;
    const balances = Dashboard.calcMonthlyBalances(data);
    const summary = Dashboard.calcFinancialSummary(data);

    const totalIncome = months.reduce((sum, m) => sum + Utils.sumValues(m.income), 0);
    const totalExpense = months.reduce((sum, m) => sum + Utils.sumValues(m.expense), 0);
    const currentMonthExpense = Utils.sumValues(months[0]?.expense || {});

    document.getElementById('financialKPIGrid').innerHTML = [
      Utils.kpiCard('현금 잔고', Utils.formatWon(summary.currentBalance), `전월 대비`, summary.currentBalance > 0 ? 'up' : 'down', null, summary.currentBalance > 0 ? 'success' : 'danger'),
      Utils.kpiCard('런웨이', `${summary.runway.toFixed(1)}개월`, summary.runway >= 6 ? '안전' : '주의', summary.runway >= 6 ? 'up' : 'down', '월 평균 지출 기준', summary.runway >= 6 ? 'success' : summary.runway >= 3 ? 'warning' : 'danger'),
      Utils.kpiCard('월간 Burn Rate', Utils.formatWon(summary.burnRate), '3개월 평균', 'neutral', null, summary.burnRate <= 850 ? 'success' : 'warning'),
      Utils.kpiCard('12개월 총 수입', Utils.formatWon(totalIncome), '예측 합계', 'neutral', null, 'info'),
      Utils.kpiCard('12개월 총 지출', Utils.formatWon(totalExpense), '예측 합계', 'neutral', null, 'info'),
      Utils.kpiCard('순이익(예측)', Utils.formatWon(totalIncome - totalExpense), totalIncome >= totalExpense ? '흑자' : '적자', totalIncome >= totalExpense ? 'up' : 'down', null, totalIncome >= totalExpense ? 'success' : 'danger')
    ].join('');
  },

  renderCharts(data) {
    const months = data.financial.months;
    const labels = months.map(m => Utils.monthShort(m.month));
    const incomeData = months.map(m => Utils.sumValues(m.income));
    const expenseData = months.map(m => Utils.sumValues(m.expense));
    const balances = Dashboard.calcMonthlyBalances(data);

    // Income vs Expense
    this.charts.incomeExpense = Utils.destroyChart(this.charts.incomeExpense);
    this.charts.incomeExpense = new Chart(document.getElementById('incomeExpenseChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: '수입', data: incomeData, backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4, maxBarThickness: 30 },
          { label: '지출', data: expenseData, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4, maxBarThickness: 30 }
        ]
      },
      options: { ...Utils.chartDefaults(), scales: { ...Utils.chartDefaults().scales, y: { ...Utils.chartDefaults().scales.y, ticks: { callback: v => v + '만' } } } }
    });

    // Expense Pie
    const expenseCategories = { 인건비: 0, '클라우드/서버': 0, '장비/소프트웨어': 0, '출장/교통': 0, '사무실/관리': 0, '외주/위탁': 0, '기타/예비': 0 };
    const keys = ['salary', 'cloud', 'equipment', 'travel', 'office', 'outsource', 'misc'];
    const catNames = Object.keys(expenseCategories);

    months.forEach(m => {
      keys.forEach((k, i) => { expenseCategories[catNames[i]] += (m.expense[k] || 0); });
    });

    this.charts.expensePie = Utils.destroyChart(this.charts.expensePie);
    this.charts.expensePie = new Chart(document.getElementById('expensePieChart'), {
      type: 'doughnut',
      data: {
        labels: catNames,
        datasets: [{
          data: Object.values(expenseCategories),
          backgroundColor: Utils.colors.palette,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }
    });

    // Runway chart
    const burnRates = months.map(m => Utils.sumValues(m.expense));
    const runways = balances.map((b, i) => burnRates[i] > 0 ? b / burnRates[i] : 0);

    this.charts.runway = Utils.destroyChart(this.charts.runway);
    this.charts.runway = new Chart(document.getElementById('runwayChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: '현금 잔고 (만원)', data: balances, borderColor: Utils.colors.primary, backgroundColor: 'rgba(37,99,235,0.1)', fill: true, tension: 0.3, yAxisID: 'y' },
          { label: '런웨이 (개월)', data: runways.map(r => r.toFixed(1)), borderColor: Utils.colors.warning, borderDash: [5, 5], tension: 0.3, yAxisID: 'y1' }
        ]
      },
      options: {
        ...Utils.chartDefaults(),
        scales: {
          x: Utils.chartDefaults().scales.x,
          y: { ...Utils.chartDefaults().scales.y, position: 'left', ticks: { callback: v => v + '만' } },
          y1: { position: 'right', grid: { display: false }, ticks: { callback: v => v + '개월' } }
        }
      }
    });
  },

  renderCashflowTable(data) {
    const months = data.financial.months;
    const table = document.getElementById('cashflowTable');
    const incomeKeys = [['govProject', '정부과제'], ['additionalGov', '추가 과제'], ['sales', '매출'], ['other', '기타']];
    const expenseKeys = [['salary', '인건비'], ['cloud', '클라우드'], ['equipment', '장비'], ['travel', '출장'], ['office', '사무실'], ['outsource', '외주'], ['misc', '기타']];
    const balances = Dashboard.calcMonthlyBalances(data);

    let headerHtml = '<tr><th>항목</th>' + months.map(m => `<th>${Utils.monthShort(m.month)}</th>`).join('') + '<th>합계</th></tr>';
    table.querySelector('thead').innerHTML = headerHtml;

    let rows = '';

    // Income section
    rows += `<tr style="background:var(--success-light);font-weight:700"><td>📥 수입</td>${months.map(m => `<td style="text-align:right">${Utils.formatNumber(Utils.sumValues(m.income))}</td>`).join('')}<td style="text-align:right;font-weight:800">${Utils.formatNumber(months.reduce((s, m) => s + Utils.sumValues(m.income), 0))}</td></tr>`;

    incomeKeys.forEach(([key, label]) => {
      rows += `<tr><td>&nbsp;&nbsp;${label}</td>${months.map((m, i) => `<td><input type="number" value="${m.income[key]||0}" onchange="Financial.updateValue(${i},'income','${key}',this.value)" style="width:70px"></td>`).join('')}<td style="text-align:right">${Utils.formatNumber(months.reduce((s, m) => s + (m.income[key]||0), 0))}</td></tr>`;
    });

    // Expense section
    rows += `<tr style="background:var(--danger-light);font-weight:700"><td>📤 지출</td>${months.map(m => `<td style="text-align:right">${Utils.formatNumber(Utils.sumValues(m.expense))}</td>`).join('')}<td style="text-align:right;font-weight:800">${Utils.formatNumber(months.reduce((s, m) => s + Utils.sumValues(m.expense), 0))}</td></tr>`;

    expenseKeys.forEach(([key, label]) => {
      rows += `<tr><td>&nbsp;&nbsp;${label}</td>${months.map((m, i) => `<td><input type="number" value="${m.expense[key]||0}" onchange="Financial.updateValue(${i},'expense','${key}',this.value)" style="width:70px"></td>`).join('')}<td style="text-align:right">${Utils.formatNumber(months.reduce((s, m) => s + (m.expense[key]||0), 0))}</td></tr>`;
    });

    // Summary rows
    rows += `<tr style="background:var(--primary-light);font-weight:700"><td>💵 월말 잔고</td>${balances.map(b => `<td style="text-align:right;font-weight:800">${Utils.formatNumber(b)}</td>`).join('')}<td></td></tr>`;

    const burnRates = months.map(m => Utils.sumValues(m.expense));
    const runways = balances.map((b, i) => burnRates[i] > 0 ? (b / burnRates[i]).toFixed(1) : '-');
    rows += `<tr style="font-weight:600"><td>📊 런웨이</td>${runways.map(r => {
      const v = parseFloat(r);
      const color = v >= 6 ? 'var(--success)' : v >= 3 ? 'var(--warning)' : 'var(--danger)';
      return `<td style="text-align:right;color:${color};font-weight:700">${r}개월</td>`;
    }).join('')}<td></td></tr>`;

    table.querySelector('tbody').innerHTML = rows;
  },

  renderGovBudget(data) {
    const container = document.getElementById('govBudgetSection');
    container.innerHTML = data.financial.govBudgets.map((gb, i) => {
      const pct = gb.totalBudget > 0 ? (gb.spent / gb.totalBudget * 100).toFixed(1) : 0;
      const color = pct > 90 ? Utils.colors.success : pct > 50 ? Utils.colors.primary : Utils.colors.warning;
      return `
        <div class="budget-progress-container">
          <div class="budget-progress-header">
            <span>${Utils.escapeHtml(gb.name)} (${gb.period})</span>
            <span>${Utils.formatNumber(gb.spent)}만 / ${Utils.formatNumber(gb.totalBudget)}만</span>
          </div>
          <div class="budget-bar">
            <div class="budget-fill" style="width:${pct}%;background:${color}">${pct}%</div>
          </div>
          <div style="margin-top:8px;display:flex;gap:16px;font-size:12px;color:var(--text-light)">
            <span>집행률: <strong>${pct}%</strong></span>
            <span>잔액: <strong>${Utils.formatNumber(gb.totalBudget - gb.spent)}만원</strong></span>
            <input type="number" placeholder="집행액 수정" value="${gb.spent}" style="width:100px;padding:2px 6px;font-size:12px;border:1px solid var(--border);border-radius:4px" onchange="Financial.updateGovSpent(${i},this.value)">
          </div>
        </div>
      `;
    }).join('');
  },

  updateValue(monthIdx, type, key, value) {
    const data = DataManager.get();
    data.financial.months[monthIdx][type][key] = Number(value) || 0;
    DataManager.save();
    this.render();
    Dashboard.render();
  },

  updateGovSpent(idx, value) {
    const data = DataManager.get();
    data.financial.govBudgets[idx].spent = Number(value) || 0;
    DataManager.save();
    this.renderGovBudget(data);
  },

  recalculate() {
    this.render();
    Dashboard.render();
    DataManager.addActivity('💰', '재무 데이터 재계산 완료', 'info');
  },

  openAddModal() {
    Modal.open('거래 추가', `
      <div class="form-row">
        <div class="form-group"><label>월</label><select id="addTxMonth">${DataManager.get().financial.months.map(m => `<option value="${m.month}">${Utils.formatMonth(m.month)}</option>`).join('')}</select></div>
        <div class="form-group"><label>유형</label><select id="addTxType"><option value="income">수입</option><option value="expense">지출</option></select></div>
      </div>
      <div class="form-group"><label>항목</label><select id="addTxCategory">
        <optgroup label="수입"><option value="govProject">정부과제</option><option value="additionalGov">추가과제</option><option value="sales">매출</option><option value="other">기타</option></optgroup>
        <optgroup label="지출"><option value="salary">인건비</option><option value="cloud">클라우드</option><option value="equipment">장비</option><option value="travel">출장</option><option value="office">사무실</option><option value="outsource">외주</option><option value="misc">기타</option></optgroup>
      </select></div>
      <div class="form-group"><label>금액 (만원)</label><input type="number" id="addTxAmount" placeholder="0"></div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Financial.addTransaction()">추가</button>`);
  },

  addTransaction() {
    const data = DataManager.get();
    const month = document.getElementById('addTxMonth').value;
    const type = document.getElementById('addTxType').value;
    const category = document.getElementById('addTxCategory').value;
    const amount = Number(document.getElementById('addTxAmount').value) || 0;

    if (amount <= 0) {
      Utils.toast('금액을 입력해주세요.', 'warning');
      return;
    }

    const monthData = data.financial.months.find(m => m.month === month);
    if (monthData && monthData[type] && category in monthData[type]) {
      monthData[type][category] += amount;
      DataManager.save();
      DataManager.addActivity('💰', `${type === 'income' ? '수입' : '지출'} ${amount}만원 추가 (${Utils.formatMonth(month)})`, 'info');
      Modal.close();
      this.render();
      Dashboard.render();
    }
  }
};
