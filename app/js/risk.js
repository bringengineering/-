// ===== RISK MODULE =====

const Risk = {
  charts: {},

  render() {
    const data = DataManager.get();
    this.renderKPIs(data);
    this.renderCharts(data);
    this.renderTable(data);
  },

  _getFilteredRisks(data) {
    let risks = data.risks;
    const searchEl = document.getElementById('riskSearch');
    const statusEl = document.getElementById('riskFilterStatus');
    const catEl = document.getElementById('riskFilterCategory');

    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const statusFilter = statusEl ? statusEl.value : '';
    const catFilter = catEl ? catEl.value : '';

    if (search) {
      risks = risks.filter(r =>
        r.title.toLowerCase().includes(search) ||
        r.owner.toLowerCase().includes(search) ||
        r.mitigation.toLowerCase().includes(search)
      );
    }
    if (statusFilter) {
      risks = risks.filter(r => r.status === statusFilter);
    }
    if (catFilter) {
      risks = risks.filter(r => r.category === catFilter);
    }
    return risks;
  },

  renderKPIs(data) {
    const risks = data.risks.filter(r => r.status === 'active');
    const critical = risks.filter(r => r.impact * r.probability >= 15).length;
    const high = risks.filter(r => r.impact * r.probability >= 8 && r.impact * r.probability < 15).length;
    const avgScore = risks.length > 0 ? risks.reduce((s, r) => s + r.impact * r.probability, 0) / risks.length : 0;

    document.getElementById('riskKPIGrid').innerHTML = [
      Utils.kpiCard('활성 리스크', `${risks.length}건`, '모니터링 중', 'neutral', null, 'info'),
      Utils.kpiCard('심각 리스크', `${critical}건`, critical > 0 ? '즉시 대응' : '안전', critical > 0 ? 'down' : 'up', '점수 15 이상', critical > 0 ? 'danger' : 'success'),
      Utils.kpiCard('주의 리스크', `${high}건`, '관리 필요', high > 0 ? 'down' : 'up', '점수 8~14', high > 0 ? 'warning' : 'success'),
      Utils.kpiCard('평균 리스크 점수', avgScore.toFixed(1), avgScore < 10 ? '관리 가능' : '주의', avgScore < 10 ? 'up' : 'down', '영향×확률', avgScore < 10 ? 'success' : 'warning')
    ].join('');
  },

  renderCharts(data) {
    const risks = data.risks;

    this.charts.heatmap = Utils.destroyChart(this.charts.heatmap);
    this.charts.heatmap = new Chart(document.getElementById('riskHeatmapChart'), {
      type: 'bubble',
      data: {
        datasets: risks.map((r) => ({
          label: r.title.slice(0, 20),
          data: [{ x: r.probability, y: r.impact, r: Math.max(8, r.impact * r.probability / 2) }],
          backgroundColor: r.impact * r.probability >= 15 ? 'rgba(239,68,68,0.6)' : r.impact * r.probability >= 8 ? 'rgba(245,158,11,0.6)' : 'rgba(34,197,94,0.6)',
          borderColor: r.impact * r.probability >= 15 ? Utils.colors.danger : r.impact * r.probability >= 8 ? Utils.colors.warning : Utils.colors.success,
          borderWidth: 2
        }))
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: '발생 확률 →' }, min: 0, max: 6, ticks: { stepSize: 1 } },
          y: { title: { display: true, text: '영향도 →' }, min: 0, max: 6, ticks: { stepSize: 1 } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const r = risks[ctx.datasetIndex];
                return `${r.title} (영향:${r.impact}, 확률:${r.probability}, 점수:${r.impact * r.probability})`;
              }
            }
          }
        }
      }
    });

    const categories = {};
    risks.forEach(r => { categories[r.category] = (categories[r.category] || 0) + 1; });

    this.charts.category = Utils.destroyChart(this.charts.category);
    this.charts.category = new Chart(document.getElementById('riskCategoryChart'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: Utils.colors.palette.slice(0, Object.keys(categories).length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  },

  renderTable(data) {
    const filteredRisks = this._getFilteredRisks(data);
    const table = document.getElementById('riskTable');
    table.querySelector('thead').innerHTML = `<tr>
      <th>상태</th><th>카테고리</th><th>리스크</th><th>영향</th><th>확률</th><th>점수</th><th>담당</th><th>대응방안</th><th>액션</th>
    </tr>`;

    if (filteredRisks.length === 0) {
      table.querySelector('tbody').innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">검색 결과가 없습니다</div></div></td></tr>`;
      return;
    }

    table.querySelector('tbody').innerHTML = filteredRisks.map(r => {
      const score = r.impact * r.probability;
      const badge = score >= 15 ? Utils.badge('심각', 'red') : score >= 8 ? Utils.badge('주의', 'yellow') : Utils.badge('수용', 'green');
      const statusBadge = r.status === 'active' ? Utils.badge('활성', 'blue') : r.status === 'resolved' ? Utils.badge('해결', 'green') : Utils.badge('관찰', 'gray');

      return `<tr>
        <td>${statusBadge}</td>
        <td>${Utils.escapeHtml(r.category)}</td>
        <td style="font-weight:600">${Utils.escapeHtml(r.title)}</td>
        <td style="text-align:center">${r.impact}</td>
        <td style="text-align:center">${r.probability}</td>
        <td style="text-align:center;font-weight:700">${badge} ${score}</td>
        <td>${Utils.escapeHtml(r.owner)}</td>
        <td style="font-size:12px;max-width:200px">${Utils.escapeHtml(r.mitigation)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="Risk.editRisk('${r.id}')">수정</button>
        </td>
      </tr>`;
    }).join('');
  },

  editRisk(riskId) {
    const data = DataManager.get();
    const r = data.risks.find(risk => risk.id === riskId);
    if (!r) return;

    Modal.open(`리스크 수정: ${Utils.escapeHtml(r.title)}`, `
      <div class="form-group"><label>리스크명</label><input type="text" id="editRiskTitle" value="${Utils.escapeHtml(r.title)}"></div>
      <div class="form-row">
        <div class="form-group"><label>카테고리</label><select id="editRiskCat"><option ${r.category==='재무'?'selected':''}>재무</option><option ${r.category==='인력'?'selected':''}>인력</option><option ${r.category==='기술'?'selected':''}>기술</option><option ${r.category==='사업'?'selected':''}>사업</option><option ${r.category==='법무'?'selected':''}>법무</option></select></div>
        <div class="form-group"><label>상태</label><select id="editRiskStatus"><option value="active" ${r.status==='active'?'selected':''}>활성</option><option value="monitoring" ${r.status==='monitoring'?'selected':''}>관찰</option><option value="resolved" ${r.status==='resolved'?'selected':''}>해결</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>영향도 (1~5)</label><input type="number" id="editRiskImpact" min="1" max="5" value="${r.impact}"></div>
        <div class="form-group"><label>발생 확률 (1~5)</label><input type="number" id="editRiskProb" min="1" max="5" value="${r.probability}"></div>
      </div>
      <div class="form-group"><label>담당자</label><select id="editRiskOwner">${data.team.members.map(m => `<option ${r.owner===m.name?'selected':''}>${Utils.escapeHtml(m.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label>대응 방안</label><textarea id="editRiskMit" rows="3">${Utils.escapeHtml(r.mitigation)}</textarea></div>
    `, `
      <button class="btn btn-danger btn-sm" onclick="Risk.deleteRisk('${riskId}')">삭제</button>
      <button class="btn btn-secondary" onclick="Modal.close()">취소</button>
      <button class="btn btn-primary" onclick="Risk.saveRisk('${riskId}')">저장</button>
    `);
  },

  saveRisk(riskId) {
    const data = DataManager.get();
    const r = data.risks.find(risk => risk.id === riskId);
    if (!r) return;

    const impact = Number(document.getElementById('editRiskImpact').value);
    const prob = Number(document.getElementById('editRiskProb').value);
    if (impact < 1 || impact > 5 || prob < 1 || prob > 5) {
      Utils.toast('영향도와 확률은 1~5 사이 값이어야 합니다.', 'warning');
      return;
    }

    r.title = document.getElementById('editRiskTitle').value;
    r.category = document.getElementById('editRiskCat').value;
    r.status = document.getElementById('editRiskStatus').value;
    r.impact = impact;
    r.probability = prob;
    r.owner = document.getElementById('editRiskOwner').value;
    r.mitigation = document.getElementById('editRiskMit').value;

    DataManager.save();
    DataManager.addActivity('⚠️', `리스크 수정: ${r.title}`, 'info');
    Modal.close();
    this.render();
    Dashboard.render();
  },

  deleteRisk(riskId) {
    Modal.confirm('리스크 삭제', '이 리스크를 삭제하시겠습니까?', () => {
      const data = DataManager.get();
      const idx = data.risks.findIndex(r => r.id === riskId);
      if (idx >= 0) {
        data.risks.splice(idx, 1);
        DataManager.save();
        Modal.close();
        Risk.render();
        Dashboard.render();
      }
    });
  },

  openAddRisk() {
    const data = DataManager.get();
    Modal.open('리스크 추가', `
      <div class="form-group"><label>리스크명 <span style="color:var(--danger)">*</span></label><input type="text" id="newRiskTitle" required></div>
      <div class="form-row">
        <div class="form-group"><label>카테고리</label><select id="newRiskCat"><option>재무</option><option>인력</option><option>기술</option><option>사업</option><option>법무</option></select></div>
        <div class="form-group"><label>담당자</label><select id="newRiskOwner">${data.team.members.map(m => `<option>${Utils.escapeHtml(m.name)}</option>`).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>영향도 (1~5)</label><input type="number" id="newRiskImpact" min="1" max="5" value="3"></div>
        <div class="form-group"><label>발생 확률 (1~5)</label><input type="number" id="newRiskProb" min="1" max="5" value="3"></div>
      </div>
      <div class="form-group"><label>대응 방안</label><textarea id="newRiskMit" rows="3"></textarea></div>
    `, `<button class="btn btn-secondary" onclick="Modal.close()">취소</button><button class="btn btn-primary" onclick="Risk.addRisk()">추가</button>`);
  },

  addRisk() {
    const data = DataManager.get();
    const title = document.getElementById('newRiskTitle').value.trim();
    if (!title) {
      Utils.toast('리스크명을 입력해주세요.', 'warning');
      return;
    }

    const impact = Number(document.getElementById('newRiskImpact').value);
    const prob = Number(document.getElementById('newRiskProb').value);
    if (impact < 1 || impact > 5 || prob < 1 || prob > 5) {
      Utils.toast('영향도와 확률은 1~5 사이 값이어야 합니다.', 'warning');
      return;
    }

    data.risks.push({
      id: Utils.generateId(),
      title,
      category: document.getElementById('newRiskCat').value,
      impact,
      probability: prob,
      owner: document.getElementById('newRiskOwner').value,
      mitigation: document.getElementById('newRiskMit').value,
      status: 'active'
    });

    DataManager.save();
    DataManager.addActivity('⚠️', `새 리스크 등록: ${title}`, 'warning');
    Modal.close();
    this.render();
    Dashboard.render();
  },

  exportCSV() {
    const data = DataManager.get();
    const risks = this._getFilteredRisks(data);
    const header = '상태,카테고리,리스크명,영향도,확률,점수,담당자,대응방안';
    const rows = risks.map(r =>
      `${r.status},${r.category},"${r.title.replace(/"/g, '""')}",${r.impact},${r.probability},${r.impact * r.probability},"${r.owner.replace(/"/g, '""')}","${r.mitigation.replace(/"/g, '""')}"`
    );
    Utils.downloadCSV([header, ...rows].join('\n'), `리스크_${new Date().toISOString().slice(0, 10)}.csv`);
    DataManager.addActivity('📤', '리스크 데이터 CSV 내보내기', 'success');
  }
};
