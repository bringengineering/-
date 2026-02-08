/**
 * StartupHR Pro - Legal Risk Check Module
 * 법적 리스크 자동 체크 시스템
 */

const LegalCheckManager = {
  /**
   * 전체 법적 리스크 체크
   */
  checkAll() {
    const employees = db.find('employees', e => e.status === 'active');
    const results = [];

    employees.forEach(emp => {
      const check = this.checkEmployee(emp.id);
      results.push({
        employee: emp,
        ...check
      });
    });

    // 리스크 점수로 정렬
    return results.sort((a, b) => b.totalScore - a.totalScore);
  },

  /**
   * 직원별 법적 리스크 체크
   */
  checkEmployee(employeeId) {
    const risks = {
      workHours: this.check52Hours(employeeId),
      minimumWage: this.checkMinimumWage(employeeId),
      contract: this.checkContract(employeeId),
      insurance: this.check4대보험(employeeId),
      communication: this.checkCommunication(employeeId)
    };

    // 총점 계산 (100점 만점)
    const scores = Object.values(risks).map(r => r.score);
    const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // 위험 레벨 결정
    let level = 'safe';
    let color = 'green';

    if (totalScore >= 70) {
      level = 'danger';
      color = 'red';
    } else if (totalScore >= 50) {
      level = 'warning';
      color = 'orange';
    } else if (totalScore >= 30) {
      level = 'caution';
      color = 'yellow';
    }

    return {
      totalScore,
      level,
      color,
      risks
    };
  },

  /**
   * 52시간 체크
   */
  check52Hours(employeeId) {
    const weekly = AttendanceManager.getWeeklyHours(employeeId);
    const check = weekly.check;

    let score = 0;
    let issues = [];

    if (check.status === 'danger') {
      score = 100;
      issues.push(`🔴 주 52시간 초과 (${weekly.totalHours}시간)`);
      issues.push('근로기준법 위반으로 과태료 대상');
      issues.push('즉시 근무시간 조정 필요');
    } else if (check.status === 'critical') {
      score = 70;
      issues.push(`🟠 52시간 임박 (${weekly.totalHours}시간)`);
      issues.push('연장근로 중단 권장');
    } else if (check.status === 'warning') {
      score = 30;
      issues.push(`🟡 연장근로 중 (${weekly.totalHours}시간)`);
      issues.push('연장수당 지급 확인 필요');
    } else {
      issues.push('✅ 정상 범위');
    }

    return {
      category: '근로시간',
      score,
      status: check.status,
      details: {
        weeklyHours: weekly.totalHours,
        overtime: check.overtime,
        violation: check.violation
      },
      issues,
      actions: this.getActions52Hours(check.status)
    };
  },

  /**
   * 52시간 조치사항
   */
  getActions52Hours(status) {
    const actions = {
      danger: [
        '즉시 퇴근 조치',
        '초과분에 대한 연장수당 지급',
        '향후 52시간 준수 서면 경고',
        '노무사 상담 권장'
      ],
      critical: [
        '금주 추가 연장근로 금지',
        '다음 주 근무 계획 조정'
      ],
      warning: [
        '연장수당 정확히 계산',
        '주간 근무시간 모니터링'
      ],
      safe: ['현 상태 유지']
    };

    return actions[status] || [];
  },

  /**
   * 최저임금 체크
   */
  checkMinimumWage(employeeId) {
    const contracts = db.find('contracts', c => c.employee_id === employeeId);
    if (contracts.length === 0) {
      return {
        category: '임금',
        score: 50,
        status: 'warning',
        issues: ['⚠️ 계약서 없음'],
        actions: ['계약서 작성 필요']
      };
    }

    const latestContract = contracts.sort((a, b) =>
      new Date(b.start_date) - new Date(a.start_date)
    )[0];

    const hourlyWage = Utils.calculateHourlyWage(
      latestContract.salary,
      latestContract.weekly_hours
    );

    const check = Utils.checkMinimumWage(hourlyWage);

    let score = 0;
    let issues = [];

    if (!check.isValid) {
      score = 100;
      issues.push(`🔴 최저시급 미달`);
      issues.push(`현재 시급: ${Utils.formatCurrency(hourlyWage)}`);
      issues.push(`최저시급: ${Utils.formatCurrency(check.minimumWage)}`);
      issues.push(`부족분: ${Utils.formatCurrency(Math.abs(check.difference))}`);
    } else {
      issues.push('✅ 최저시급 준수');
      issues.push(`현재 시급: ${Utils.formatCurrency(hourlyWage)}`);
    }

    return {
      category: '임금',
      score,
      status: check.isValid ? 'safe' : 'danger',
      details: {
        hourlyWage,
        minimumWage: check.minimumWage,
        difference: check.difference
      },
      issues,
      actions: check.isValid ? [] : ['즉시 급여 인상 필요', '소급 적용 검토']
    };
  },

  /**
   * 계약서 체크
   */
  checkContract(employeeId) {
    const contracts = db.find('contracts', c => c.employee_id === employeeId);

    if (contracts.length === 0) {
      return {
        category: '계약서',
        score: 80,
        status: 'danger',
        issues: ['🔴 계약서 없음', '법적 분쟁 시 불리함'],
        actions: ['즉시 계약서 작성', '소급 서명 검토']
      };
    }

    const latestContract = contracts[contracts.length - 1];
    let score = 0;
    let issues = [];

    // 필수 조항 체크
    const missingClauses = [];

    if (!latestContract.weekly_hours) missingClauses.push('근로시간');
    if (!latestContract.salary) missingClauses.push('급여');
    if (!latestContract.special_terms?.termination_notice) missingClauses.push('해지조건');

    if (missingClauses.length > 0) {
      score = 40;
      issues.push(`🟡 필수 조항 누락: ${missingClauses.join(', ')}`);
    } else {
      issues.push('✅ 필수 조항 포함');
    }

    // 서명 여부
    if (latestContract.status !== 'signed') {
      score += 30;
      issues.push('🟡 미서명 상태');
    }

    return {
      category: '계약서',
      score,
      status: score >= 50 ? 'warning' : 'safe',
      details: {
        contractCount: contracts.length,
        latestStatus: latestContract.status,
        missingClauses
      },
      issues,
      actions: score > 0 ? ['계약서 보완', '재서명 진행'] : []
    };
  },

  /**
   * 4대보험 체크 (간단 버전)
   */
  check4대보험(employeeId) {
    // 실제로는 외부 API 연동 필요
    // 여기서는 계약서 존재 여부로 간단 체크

    const contracts = db.find('contracts', c => c.employee_id === employeeId);

    if (contracts.length === 0) {
      return {
        category: '4대보험',
        score: 50,
        status: 'warning',
        issues: ['⚠️ 계약서 없어 확인 불가'],
        actions: ['계약 체결 후 4대보험 가입']
      };
    }

    return {
      category: '4대보험',
      score: 0,
      status: 'safe',
      issues: ['ℹ️ 별도 확인 필요'],
      actions: ['정기 점검 권장']
    };
  },

  /**
   * 소통 패턴 체크
   */
  checkCommunication(employeeId) {
    const communications = db.find('communications', c => c.employee_id === employeeId);
    const recentComms = communications.slice(-10); // 최근 10건

    let score = 0;
    let issues = [];

    // 소통 회피 패턴
    const avoidCount = recentComms.filter(c =>
      c.content.includes('소통 회피') ||
      c.content.includes('무응답') ||
      c.content.includes('연락 두절')
    ).length;

    if (avoidCount >= 3) {
      score = 60;
      issues.push('🔴 소통 회피 패턴 감지');
      issues.push(`최근 10회 중 ${avoidCount}회 소통 문제`);
    } else if (avoidCount >= 1) {
      score = 30;
      issues.push('🟡 소통 주의 필요');
    } else {
      issues.push('✅ 정상 소통');
    }

    // 경고 기록
    const warnings = db.find('warnings', w => w.employee_id === employeeId);
    if (warnings.length >= 3) {
      score += 40;
      issues.push(`🟠 경고 ${warnings.length}회`);
    }

    return {
      category: '소통',
      score: Math.min(100, score),
      status: score >= 60 ? 'danger' : (score >= 30 ? 'warning' : 'safe'),
      details: {
        totalComms: communications.length,
        avoidCount,
        warningCount: warnings.length
      },
      issues,
      actions: score >= 60 ? ['조기 정리 검토', '모든 소통 서면화'] :
               score >= 30 ? ['면담 진행', '상황 모니터링'] : []
    };
  },

  /**
   * 종합 리포트 생성
   */
  generateReport(employeeId) {
    const employee = db.getById('employees', employeeId);
    const check = this.checkEmployee(employeeId);

    const report = `
========================================
법적 리스크 체크 리포트
========================================

직원명: ${employee.name}
직책: ${employee.position}
입사일: ${Utils.formatDate(employee.hire_date)}
점검일: ${Utils.formatDate(new Date(), 'YYYY-MM-DD HH:mm')}

----------------------------------------
종합 점수: ${check.totalScore}/100
위험 레벨: ${check.level.toUpperCase()}
----------------------------------------

${Object.values(check.risks).map(risk => `
[${risk.category}] ${risk.score}점
상태: ${risk.status}

문제점:
${risk.issues.map(issue => `  - ${issue}`).join('\n')}

조치사항:
${risk.actions.length > 0 ? risk.actions.map(action => `  - ${action}`).join('\n') : '  - 조치 불필요'}
`).join('\n')}

========================================
`.trim();

    return report;
  },

  /**
   * 리포트 다운로드
   */
  downloadReport(employeeId) {
    const report = this.generateReport(employeeId);
    const employee = db.getById('employees', employeeId);
    const filename = `법적리스크체크_${employee.name}_${Utils.formatDate(new Date())}.txt`;

    Utils.downloadFile(report, filename, 'text/plain; charset=utf-8');
    Utils.showSuccess('리포트가 다운로드되었습니다.');
  },

  /**
   * 대시보드 요약
   */
  getDashboardSummary() {
    const results = this.checkAll();

    const dangerCount = results.filter(r => r.level === 'danger').length;
    const warningCount = results.filter(r => r.level === 'warning' || r.level === 'caution').length;
    const avgScore = Math.round(
      results.reduce((sum, r) => sum + r.totalScore, 0) / (results.length || 1)
    );

    return {
      avgScore,
      dangerCount,
      warningCount,
      safeCount: results.length - dangerCount - warningCount,
      topRisks: results.slice(0, 5),
      allResults: results
    };
  }
};

window.LegalCheckManager = LegalCheckManager;
