/**
 * StartupHR Pro - Employee Management Module
 * 직원 관리 시스템
 */

const EmployeeManager = {
  /**
   * 모든 직원 조회
   */
  getAll() {
    return db.getAll('employees');
  },

  /**
   * 직원 추가
   */
  add(employeeData) {
    const employee = db.add('employees', {
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      hire_date: employeeData.hire_date,
      position: employeeData.position,
      status: 'active',
      contract_type: employeeData.contract_type || '정규직'
    });

    Utils.showSuccess(`${employee.name}님이 추가되었습니다.`);
    return employee;
  },

  /**
   * 직원 정보 업데이트
   */
  update(id, updates) {
    const updated = db.update('employees', id, updates);
    if (updated) {
      Utils.showSuccess('직원 정보가 업데이트되었습니다.');
    }
    return updated;
  },

  /**
   * 직원 삭제
   */
  delete(id) {
    if (Utils.confirm('정말 삭제하시겠습니까?')) {
      const success = db.delete('employees', id);
      if (success) {
        Utils.showSuccess('직원이 삭제되었습니다.');
      }
      return success;
    }
    return false;
  },

  /**
   * 직원 상세 정보
   */
  getDetail(id) {
    const employee = db.getById('employees', id);
    if (!employee) return null;

    // 관련 데이터 통합
    const contracts = db.find('contracts', c => c.employee_id === id);
    const attendance = db.find('attendance', a => a.employee_id === id);
    const warnings = db.find('warnings', w => w.employee_id === id);
    const communications = db.find('communications', c => c.employee_id === id);

    // 이번 주 근무시간 계산
    const weekStart = Utils.getWeekStart();
    const weeklyHours = Utils.calculateWeeklyHours(attendance, id, weekStart);
    const hourCheck = Utils.check52Hours(weeklyHours);

    return {
      ...employee,
      contracts,
      attendance,
      warnings,
      communications,
      weeklyHours,
      hourCheck,
      stats: this.calculateStats(id)
    };
  },

  /**
   * 직원 통계 계산
   */
  calculateStats(id) {
    const attendance = db.find('attendance', a => a.employee_id === id);
    const warnings = db.find('warnings', w => w.employee_id === id);

    // 총 근무일수
    const totalDays = attendance.length;

    // 평균 근무시간
    const totalHours = attendance.reduce((sum, a) => sum + (a.work_hours || 0), 0);
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

    // 경고 횟수
    const warningCount = warnings.length;

    // 지각 횟수
    const lateCount = attendance.filter(a => {
      if (!a.clock_in) return false;
      const clockIn = new Date(`2000-01-01 ${a.clock_in}`);
      const standard = new Date(`2000-01-01 09:00`);
      return clockIn > standard;
    }).length;

    return {
      totalDays,
      totalHours: totalHours.toFixed(1),
      avgHours,
      warningCount,
      lateCount
    };
  },

  /**
   * 활성 직원만 조회
   */
  getActive() {
    return db.find('employees', e => e.status === 'active');
  },

  /**
   * 퇴사자 조회
   */
  getInactive() {
    return db.find('employees', e => e.status === 'inactive');
  },

  /**
   * 직원 검색
   */
  search(keyword) {
    const lower = keyword.toLowerCase();
    return db.find('employees', e =>
      e.name.toLowerCase().includes(lower) ||
      e.email.toLowerCase().includes(lower) ||
      e.position.toLowerCase().includes(lower)
    );
  },

  /**
   * 리스크 있는 직원 찾기
   */
  getRiskyEmployees() {
    const employees = this.getActive();
    const risky = [];

    employees.forEach(emp => {
      const detail = this.getDetail(emp.id);
      const risks = [];

      // 52시간 초과
      if (detail.hourCheck.status === 'danger') {
        risks.push({
          type: 'critical',
          message: `52시간 초과 (${detail.weeklyHours}시간)`
        });
      }

      // 경고 3회 이상
      if (detail.stats.warningCount >= 3) {
        risks.push({
          type: 'warning',
          message: `경고 ${detail.stats.warningCount}회`
        });
      }

      // 지각 5회 이상
      if (detail.stats.lateCount >= 5) {
        risks.push({
          type: 'warning',
          message: `지각 ${detail.stats.lateCount}회`
        });
      }

      // 소통 회피 패턴 감지
      const recentComms = detail.communications.slice(-10);
      const missedComms = recentComms.filter(c => c.comm_type === '소통회피').length;
      if (missedComms >= 3) {
        risks.push({
          type: 'critical',
          message: '소통 회피 패턴 감지'
        });
      }

      if (risks.length > 0) {
        risky.push({
          employee: emp,
          risks,
          riskScore: risks.filter(r => r.type === 'critical').length * 30 +
                     risks.filter(r => r.type === 'warning').length * 15
        });
      }
    });

    return risky.sort((a, b) => b.riskScore - a.riskScore);
  },

  /**
   * 계약 만료 임박 직원
   */
  getExpiringContracts(days = 30) {
    const employees = this.getActive();
    const expiring = [];

    employees.forEach(emp => {
      const contracts = db.find('contracts', c =>
        c.employee_id === emp.id && c.end_date
      );

      contracts.forEach(contract => {
        const daysUntil = Math.ceil(
          (new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil > 0 && daysUntil <= days) {
          expiring.push({
            employee: emp,
            contract,
            daysUntil,
            dDay: Utils.getDDay(contract.end_date)
          });
        }
      });
    });

    return expiring.sort((a, b) => a.daysUntil - b.daysUntil);
  },

  /**
   * 퇴사 처리
   */
  terminate(id, reason, exitDate) {
    const employee = db.getById('employees', id);
    if (!employee) return null;

    // 상태 업데이트
    this.update(id, {
      status: 'inactive',
      exit_date: exitDate,
      exit_reason: reason
    });

    // 퇴사 기록 추가
    db.add('communications', {
      employee_id: id,
      comm_type: '퇴사',
      subject: '퇴사 처리',
      content: reason,
      date: exitDate
    });

    Utils.showSuccess(`${employee.name}님의 퇴사가 처리되었습니다.`);
    return true;
  },

  /**
   * 대시보드 요약 데이터
   */
  getDashboardSummary() {
    const all = this.getAll();
    const active = this.getActive();
    const risky = this.getRiskyEmployees();
    const expiring = this.getExpiringContracts();

    // 이번 주 전체 근무시간
    const weekStart = Utils.getWeekStart();
    const attendance = db.getAll('attendance');

    const weeklyStats = active.map(emp => {
      const hours = Utils.calculateWeeklyHours(attendance, emp.id, weekStart);
      return {
        employee: emp,
        hours,
        check: Utils.check52Hours(hours)
      };
    });

    return {
      total: all.length,
      active: active.length,
      inactive: all.length - active.length,
      risky: risky.length,
      expiring: expiring.length,
      weeklyStats,
      riskyEmployees: risky,
      expiringContracts: expiring
    };
  }
};

window.EmployeeManager = EmployeeManager;
