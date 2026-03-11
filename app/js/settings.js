// ===== SETTINGS MODULE =====

const Settings = {
  render() {
    const data = DataManager.get();
    document.getElementById('settingCompanyName').value = data.company.name || '';
    document.getElementById('settingCEO').value = data.company.ceo || '';
    document.getElementById('settingFoundedDate').value = data.company.founded || '';
    document.getElementById('settingFiscalStart').value = data.company.fiscalStart || 3;

    const s = data.settings || {};
    document.getElementById('settingAlertRunway').checked = s.alertRunway !== false;
    document.getElementById('settingAlertOKR').checked = s.alertOKR !== false;
    document.getElementById('settingAlertRisk').checked = s.alertRisk !== false;
    document.getElementById('settingRunwayDanger').value = s.runwayDanger || 3;
    document.getElementById('settingRunwayWarning').value = s.runwayWarning || 6;
    document.getElementById('settingOKRThreshold').value = s.okrThreshold || 40;
  },

  save() {
    const data = DataManager.get();
    data.company.name = document.getElementById('settingCompanyName').value.trim() || data.company.name;
    data.company.ceo = document.getElementById('settingCEO').value.trim() || data.company.ceo;
    data.company.founded = document.getElementById('settingFoundedDate').value || data.company.founded;
    data.company.fiscalStart = parseInt(document.getElementById('settingFiscalStart').value) || 3;

    data.settings = data.settings || {};
    data.settings.alertRunway = document.getElementById('settingAlertRunway').checked;
    data.settings.alertOKR = document.getElementById('settingAlertOKR').checked;
    data.settings.alertRisk = document.getElementById('settingAlertRisk').checked;
    data.settings.runwayDanger = Utils.clamp(parseInt(document.getElementById('settingRunwayDanger').value) || 3, 1, 12);
    data.settings.runwayWarning = Utils.clamp(parseInt(document.getElementById('settingRunwayWarning').value) || 6, 1, 24);
    data.settings.okrThreshold = Utils.clamp(parseInt(document.getElementById('settingOKRThreshold').value) || 40, 10, 100);

    DataManager.save();
    DataManager.addActivity('⚙️', '회사 설정 저장됨', 'info');
    Utils.toast('설정이 저장되었습니다.', 'success');
  },

  exportData() {
    const data = DataManager.get();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bring_eng_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.setItem('bring_last_backup', Date.now());
    DataManager.addActivity('📤', '데이터 JSON 내보내기 완료', 'success');
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported.company || !imported.financial) {
          Utils.toast('올바른 데이터 파일이 아닙니다.', 'danger');
          return;
        }
        DataManager.import(imported);
        DataManager.addActivity('📥', '데이터 가져오기 완료', 'success');
        Utils.toast('데이터를 성공적으로 가져왔습니다.', 'success');
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        Utils.toast('파일을 읽을 수 없습니다: ' + err.message, 'danger');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  resetData() {
    Modal.confirm('데이터 초기화', '정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.', () => {
      Modal.confirm('최종 확인', '한번 더 확인합니다. 모든 입력 데이터가 삭제됩니다. 계속하시겠습니까?', () => {
        DataManager.reset();
        Utils.toast('데이터가 초기화되었습니다.', 'success');
        setTimeout(() => location.reload(), 1000);
      });
    });
  }
};
