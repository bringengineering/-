// ===== BRING ENGINEERING — QUALITY & IP PAGE =====

const Quality = {
  render() {
    this.renderQMS();
    this.renderIP();
    this.renderTechDebtTypes();
  },

  renderQMS() {
    const items = DataManager.get().quality?.qmsChecklist || [];
    const el = document.getElementById('qmsSection');
    if (!el) return;

    const stages = [...new Set(items.map(i => i.stage))];
    const doneCount = items.filter(i => i.done).length;
    const total = items.length;
    const pct = total > 0 ? Math.round(doneCount / total * 100) : 0;

    el.innerHTML = `
      <div class="qms-progress">
        <div class="qms-bar"><div class="qms-fill" style="width:${pct}%"></div></div>
        <span>${doneCount}/${total} 완료 (${pct}%)</span>
      </div>
    ` + stages.map(stage => {
      const stageItems = items.filter(i => i.stage === stage);
      return `
        <div class="qms-stage">
          <h4>${stage}</h4>
          ${stageItems.map((item, idx) => {
            const globalIdx = items.indexOf(item);
            return `
              <div class="qms-item ${item.done ? 'done' : ''}">
                <label class="qms-check">
                  <input type="checkbox" ${item.done ? 'checked' : ''} onchange="Quality.toggleQMS(${globalIdx})">
                  <strong>${item.item}</strong>
                </label>
                <div class="qms-detail">${item.detail}</div>
                <div class="qms-meta">
                  <span>확인자: ${item.checker}</span>
                  <span>합격 기준: ${item.criteria}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');
  },

  toggleQMS(idx) {
    const data = DataManager.get();
    if (data.quality?.qmsChecklist?.[idx] !== undefined) {
      data.quality.qmsChecklist[idx].done = !data.quality.qmsChecklist[idx].done;
      DataManager.save();
      this.renderQMS();
    }
  },

  renderIP() {
    const items = DataManager.get().quality?.ipPortfolio || [];
    const el = document.getElementById('ipSection');
    if (!el) return;

    const typeColors = { '특허': 'badge-success', '특허(예정)': 'badge-warning', '영업비밀': 'badge-danger', '상표': 'badge-info', '저작권': 'badge-info', '인증': 'badge-success' };

    el.innerHTML = `<table class="data-table"><thead><tr><th>유형</th><th>명칭</th><th>상태</th><th>일자</th><th>관련 제품</th><th>담당</th><th>비고</th></tr></thead><tbody>` +
      items.map(i => `<tr>
        <td><span class="badge ${typeColors[i.type] || 'badge-info'}">${i.type}</span></td>
        <td><strong>${i.name}</strong></td>
        <td>${i.status}</td>
        <td>${i.date}</td>
        <td>${i.product}</td>
        <td>${i.owner}</td>
        <td>${i.note}</td>
      </tr>`).join('') +
      `</tbody></table>`;
  },

  renderTechDebtTypes() {
    const types = DataManager.get().quality?.techDebtTypes || [];
    const el = document.getElementById('techDebtTypesSection');
    if (!el) return;

    el.innerHTML = types.map(t => `
      <div class="tech-debt-type risk-${t.risk === '상' ? 'high' : t.risk === '중' ? 'medium' : 'low'}">
        <div class="debt-header">
          <h4>${t.type}</h4>
          <span class="badge ${t.risk === '상' ? 'badge-danger' : t.risk === '중' ? 'badge-warning' : 'badge-success'}">위험도: ${t.risk}</span>
        </div>
        <p>${t.definition}</p>
        <div class="debt-meta">
          <div><strong>허용 기준:</strong> ${t.allowed}</div>
          <div><strong>해소 방법:</strong> ${t.resolution}</div>
          <div><strong>점검 주기:</strong> ${t.cycle}</div>
        </div>
      </div>
    `).join('');
  }
};
