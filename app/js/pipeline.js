// ===== PIPELINE MODULE =====

const Pipeline = {
  charts: {},

  render() {
    const data = DataManager.get();
    this.renderKPIs(data);
    this.renderCharts(data);
    this.renderBoard(data);
  },

  renderKPIs(data) {
    const deals = data.pipeline.deals;
    const totalAmount = deals.reduce((s, d) => s + d.amount, 0);
    const weightedAmounts = [0.1, 0.2, 0.4, 0.6, 0.8, 0.95, 1.0];
    const weightedTotal = deals.reduce((s, d) => s + d.amount * (weightedAmounts[d.stage] || 0.1), 0);
    const contractedDeals = deals.filter(d => d.stage >= 5);
    const contractedAmount = contractedDeals.reduce((s, d) => s + d.amount, 0);
    const avgDealSize = deals.length > 0 ? totalAmount / deals.length : 0;

    document.getElementById('pipelineKPIGrid').innerHTML = [
      Utils.kpiCard('파이프라인 총액', Utils.formatWon(totalAmount), `${deals.length}건`, 'neutral', null, 'info'),
      Utils.kpiCard('가중 금액', Utils.formatWon(weightedTotal), '전환 확률 반영', 'neutral', '실질 기대 매출', 'info'),
      Utils.kpiCard('계약 완료', Utils.formatWon(contractedAmount), `${contractedDeals.length}건`, contractedDeals.length > 0 ? 'up' : 'neutral', null, contractedDeals.length > 0 ? 'success' : 'warning'),
      Utils.kpiCard('평균 딜 규모', Utils.formatWon(avgDealSize), '건당 평균', 'neutral', null, 'info')
    ].join('');
  },

  renderCharts(data) {
    const stages = data.pipeline.stages;
    const deals = data.pipeline.deals;

    // Funnel chart
    const stageCounts = stages.map((_, i) => deals.filter(d => d.stage === i).length);
    const stageAmounts = stages.map((_, i) => deals.filter(d => d.stage === i).reduce((s, d) => s + d.amount, 0));

    this.charts.funnel = Utils.destroyChart(this.charts.funnel);
    this.charts.funnel = new Chart(document.getElementById('pipelineFunnelChart'), {
      type: 'bar',
      data: {
        labels: stages,
        datasets: [{
          label: '금액 (만원)',
          data: stageAmounts,
          backgroundColor: Utils.colors.palette.slice(0, stages.length),
          borderRadius: 6,
          maxBarThickness: 40
        }]
      },
      options: {
        ...Utils.chartDefaults(),
        indexAxis: 'y',
        plugins: {
          ...Utils.chartDefaults().plugins,
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${Utils.formatNumber(ctx.raw)}만원 (${stageCounts[ctx.dataIndex]}건)`
            }
          }
        }
      }
    });

    // Revenue forecast
    const quarters = ['Q2', 'Q3', 'Q4'];
    const quarterAmounts = quarters.map((q, i) => {
      const qStr = `2026-${q}`;
      return deals.filter(d => d.expectedDate === qStr).reduce((s, d) => s + d.amount, 0);
    });

    this.charts.forecast = Utils.destroyChart(this.charts.forecast);
    this.charts.forecast = new Chart(document.getElementById('revenueForecastChart'), {
      type: 'bar',
      data: {
        labels: quarters.map(q => '2026 ' + q),
        datasets: [
          { label: '예상 매출 (만원)', data: quarterAmounts, backgroundColor: Utils.colors.primary, borderRadius: 6, maxBarThickness: 50 },
          { label: '가중 매출', data: quarterAmounts.map(a => Math.round(a * 0.3)), backgroundColor: 'rgba(37,99,235,0.3)', borderRadius: 6, maxBarThickness: 50 }
        ]
      },
      options: { ...Utils.chartDefaults(), scales: { ...Utils.chartDefaults().scales, y: { ...Utils.chartDefaults().scales.y, ticks: { callback: v => v + '만' } } } }
    });
  },

  _getFilteredDeals(data) {
    let deals = data.pipeline.deals;
    const searchEl = document.getElementById('pipelineSearch');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    if (search) {
      deals = deals.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.product.toLowerCase().includes(search) ||
        (d.note && d.note.toLowerCase().includes(search))
      );
    }
    return deals;
  },

  renderBoard(data) {
    const stages = data.pipeline.stages;
    const deals = this._getFilteredDeals(data);

    document.getElementById('pipelineBoard').innerHTML = stages.map((stage, si) => {
      const stageDeals = deals.filter(d => d.stage === si);
      const stageTotal = stageDeals.reduce((s, d) => s + d.amount, 0);

      return `
        <div class="pipeline-column">
          <div class="pipeline-column-header">
            <span>${stage} (${stageDeals.length})</span>
            <span class="pipeline-column-total">${Utils.formatNumber(stageTotal)}만</span>
          </div>
          ${stageDeals.map(d => `
            <div class="pipeline-deal" onclick="Pipeline.editDeal('${d.id}')">
              <div class="pipeline-deal-name">${Utils.escapeHtml(d.name)}</div>
              <div class="pipeline-deal-amount">${Utils.formatNumber(d.amount)}만원</div>
              <div class="pipeline-deal-product">${Utils.escapeHtml(d.product)} · ${Utils.escapeHtml(d.expectedDate)}</div>
              ${d.note ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">${Utils.escapeHtml(d.note)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
  },

  editDeal(dealId) {
    const data = DataManager.get();
    const deal = data.pipeline.deals.find(d => d.id === dealId);
    if (!deal) return;

    Modal.open(`딜 수정: ${Utils.escapeHtml(deal.name)}`, `
      <div class="form-group"><label>고객명</label><input type="text" id="editDealName" value="${Utils.escapeHtml(deal.name)}"></div>
      <div class="form-row">
        <div class="form-group"><label>제품</label><input type="text" id="editDealProduct" value="${Utils.escapeHtml(deal.product)}"></div>
        <div class="form-group"><label>금액 (만원)</label><input type="number" id="editDealAmount" value="${deal.amount}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>단계</label><select id="editDealStage">${data.pipeline.stages.map((s, i) => `<option value="${i}" ${deal.stage === i ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="form-group"><label>예상 시기</label><input type="text" id="editDealExpected" value="${Utils.escapeHtml(deal.expectedDate)}" placeholder="예: 2026-Q3"></div>
      </div>
      <div class="form-group"><label>비고</label><textarea id="editDealNote" rows="2">${Utils.escapeHtml(deal.note || '')}</textarea></div>
    `, `
      <button class="btn btn-danger btn-sm" onclick="Pipeline.deleteDeal('${dealId}')">삭제</button>
      <button class="btn btn-secondary" onclick="Modal.close()">취소</button>
      <button class="btn btn-primary" onclick="Pipeline.saveDeal('${dealId}')">저장</button>
    `);
  },

  saveDeal(dealId) {
    const data = DataManager.get();
    const deal = data.pipeline.deals.find(d => d.id === dealId);
    if (!deal) return;

    const oldStage = deal.stage;
    deal.name = document.getElementById('editDealName').value;
    deal.product = document.getElementById('editDealProduct').value;
    deal.amount = Number(document.getElementById('editDealAmount').value);
    deal.stage = Number(document.getElementById('editDealStage').value);
    deal.expectedDate = document.getElementById('editDealExpected').value;
    deal.note = document.getElementById('editDealNote').value;

    DataManager.save();
    if (deal.stage !== oldStage) {
      DataManager.addActivity('📈', `${deal.name} → ${data.pipeline.stages[deal.stage]}으로 이동`, deal.stage > oldStage ? 'success' : 'info');
    }
    Modal.close();
    this.render();
    Dashboard.render();
  },

  deleteDeal(dealId) {
    Modal.confirm('딜 삭제', '이 딜을 삭제하시겠습니까?', () => {
      const data = DataManager.get();
      const idx = data.pipeline.deals.findIndex(d => d.id === dealId);
      if (idx >= 0) {
        const name = data.pipeline.deals[idx].name;
        data.pipeline.deals.splice(idx, 1);
        DataManager.save();
        DataManager.addActivity('📈', `딜 삭제: ${name}`, 'info');
        Modal.close();
        Pipeline.render();
        Dashboard.render();
      }
    });
  },

  openAddDeal() {
    Modal.open('딜 추가', `
      <div class="form-group"><label>고객명</label><input type="text" id="newDealName"></div>
      <div class="form-row">
        <div class="form-group"><label>제품</label><select id="newDealProduct">${DataManager.get().projects.map(p => `<option>${Utils.escapeHtml(p.name)}</option>`).join('')}<option>공동연구</option><option>기타</option></select></div>
        <div class="form-group"><label>금액 (만원)</label><input type="number" id="newDealAmount"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>단계</label><select id="newDealStage">${DataManager.get().pipeline.stages.map((s, i) => `<option value="${i}">${s}</option>`).join('')}</select></div>
        <div class="form-group"><label>예상 시기</label><input type="text" id="newDealExpected" placeholder="예: 2026-Q3"></div>
      </div>
      <div class="form-group"><label>비고</label><textarea id="newDealNote" rows="2"></textarea></div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Pipeline.addDeal()">추가</button>`);
  },

  addDeal() {
    const data = DataManager.get();
    const name = document.getElementById('newDealName').value.trim();
    if (!name) { Utils.toast('고객명을 입력해주세요.', 'warning'); return; }
    const amount = Number(document.getElementById('newDealAmount').value) || 0;
    if (amount <= 0) { Utils.toast('금액을 입력해주세요.', 'warning'); return; }

    data.pipeline.deals.push({
      id: Utils.generateId(),
      name,
      product: document.getElementById('newDealProduct').value,
      amount: Number(document.getElementById('newDealAmount').value) || 0,
      stage: Number(document.getElementById('newDealStage').value),
      expectedDate: document.getElementById('newDealExpected').value,
      note: document.getElementById('newDealNote').value
    });

    DataManager.save();
    DataManager.addActivity('📈', `새 딜 추가: ${name}`, 'success');
    Modal.close();
    this.render();
    Dashboard.render();
  }
};
