/**
 * StartupHR Pro - Contract Management Module
 * 계약서 자동 생성 및 관리
 */

const ContractManager = {
  /**
   * 계약서 생성
   */
  create(contractData) {
    // 법적 리스크 자동 체크
    const risks = this.checkRisks(contractData);

    if (risks.critical.length > 0) {
      const proceed = Utils.confirm(
        `⚠️ 심각한 법적 리스크가 발견되었습니다:\n${risks.critical.join('\n')}\n\n계속하시겠습니까?`
      );
      if (!proceed) return null;
    }

    const contract = db.add('contracts', {
      employee_id: contractData.employee_id,
      contract_type: contractData.contract_type,
      start_date: contractData.start_date,
      end_date: contractData.end_date || null,
      weekly_hours: parseInt(contractData.weekly_hours),
      salary: parseInt(contractData.salary),
      special_terms: contractData.special_terms || {},
      status: 'draft',
      risks: risks
    });

    Utils.showSuccess('계약서가 생성되었습니다.');
    return contract;
  },

  /**
   * 법적 리스크 체크
   */
  checkRisks(data) {
    const risks = {
      critical: [],
      warning: [],
      info: []
    };

    // 1. 52시간 체크
    if (data.weekly_hours > 52) {
      risks.critical.push('❌ 주 52시간 초과 계약 (근로기준법 위반)');
    } else if (data.weekly_hours > 40) {
      risks.warning.push('⚠️ 연장근로 포함 계약 (합의 필요)');
    }

    // 2. 최저시급 체크
    const hourlyWage = Utils.calculateHourlyWage(data.salary, data.weekly_hours);
    const wageCheck = Utils.checkMinimumWage(hourlyWage);

    if (!wageCheck.isValid) {
      risks.critical.push(
        `❌ 최저시급 미달 (시급: ${Utils.formatCurrency(hourlyWage)}, 최저: ${Utils.formatCurrency(wageCheck.minimumWage)})`
      );
    }

    // 3. 주말 근무 체크
    if (data.special_terms.weekend_required && !data.special_terms.weekend_agreed) {
      risks.critical.push('❌ 주말 근무 의무화 (직원 동의 필요)');
    }

    // 4. 교육비 반환 조항 체크
    if (data.special_terms.education_support && !data.special_terms.refund_policy) {
      risks.warning.push('⚠️ 교육비 반환 조항 누락 (명확히 명시 필요)');
    }

    // 5. 해지 조건 체크
    if (!data.special_terms.termination_notice) {
      risks.info.push('ℹ️ 해지 통보 기간 미명시 (30일 권장)');
    }

    return risks;
  },

  /**
   * 계약서 템플릿 생성
   */
  generateTemplate(contractId) {
    const contract = db.getById('contracts', contractId);
    if (!contract) return null;

    const employee = db.getById('employees', contract.employee_id);
    const hourlyWage = Utils.calculateHourlyWage(contract.salary, contract.weekly_hours);

    return `
근로계약서

갑(사용자): [회사명]
을(근로자): ${employee.name}

제1조 (근로계약 기간)
- 시작일: ${Utils.formatDate(contract.start_date, 'YYYY.MM.DD')}
${contract.end_date ? `- 종료일: ${Utils.formatDate(contract.end_date, 'YYYY.MM.DD')}` : '- 기간의 정함 없음 (정규직)'}

제2조 (근무 장소 및 업무)
- 근무지: [회사 주소]
- 담당업무: ${employee.position}

제3조 (근로시간)
1. 근로일: 월요일 ~ 금요일
2. 근로시간: 09:00 ~ 18:00 (주 ${contract.weekly_hours}시간)
3. 휴게시간: 12:00 ~ 13:00 (1시간)

★ 주말/공휴일 근로는 을(근로자)의 자발적 선택사항이며,
   갑(사용자)은 이를 강요할 수 없습니다.
${contract.special_terms.weekend_agreed ? '   주말 근무 시 사전 합의 및 별도 수당을 지급합니다.' : ''}

제4조 (임금)
1. 월 급여: ${Utils.formatCurrency(contract.salary)}
2. 시급 환산: ${Utils.formatCurrency(hourlyWage)}
3. 지급일: 매월 25일
4. 지급방법: 을의 계좌로 입금

제5조 (연장근로)
1. 연장근로는 을의 동의 하에만 가능합니다.
2. 주 12시간을 초과할 수 없습니다. (근로기준법 준수)
3. 연장수당: 통상임금의 1.5배 지급
4. 주 52시간 초과 시 을은 거부할 권리가 있습니다.

제6조 (업무 보고 및 소통)
1. 을은 다음 사항을 사전 보고해야 합니다:
   - 결근/지각/조퇴 (당일 09:00까지)
   - 업무상 중요 결정
   - 장기 휴가 (1주일 전)

2. 다음은 보고 의무가 없습니다:
   - 개인 사생활
   - 업무 외 시간 활동
   - 구체적 사유 (참/불참 여부만 공유)

${this.generateEducationClause(contract)}

제${contract.special_terms.education_support ? '8' : '7'}조 (계약 해지)
1. 갑 또는 을은 ${contract.special_terms.termination_notice || 30}일 전 서면 통보로 계약을 해지할 수 있습니다.
2. 즉시 해지 가능 사유:
   - 무단결근 3회 이상
   - 중대한 규칙 위반
   - 범죄 행위

3. 을의 권리:
   - 부당해고 시 노동위원회 구제 신청 가능
   - 해고사유서 서면 교부 요구 가능

제${contract.special_terms.education_support ? '9' : '8'}조 (4대보험)
갑은 을을 4대보험(국민연금, 건강보험, 고용보험, 산재보험)에 가입합니다.

제${contract.special_terms.education_support ? '10' : '9'}조 (기밀유지)
을은 재직 중 및 퇴직 후에도 업무상 알게 된 회사의 기밀을 누설하지 않습니다.

제${contract.special_terms.education_support ? '11' : '10'}조 (분쟁 해결)
1. 본 계약 관련 분쟁은 상호 협의로 해결합니다.
2. 협의 불가 시 관할 노동위원회 또는 법원에 의합니다.
3. 모든 중요 합의는 서면으로 작성하며, 구두 약속은 효력이 없습니다.

본 계약을 증명하기 위하여 계약서 2통을 작성하고
갑과 을이 서명 날인 후 각 1통씩 보관합니다.

${Utils.formatDate(new Date(), 'YYYY년 MM월 DD일')}

갑(사용자): [회사명]
          대표: _________________ (인)

을(근로자): ${employee.name}
          서명: _________________ (인)
    `.trim();
  },

  /**
   * 교육비 조항 생성
   */
  generateEducationClause(contract) {
    if (!contract.special_terms.education_support) return '';

    const edu = contract.special_terms.education_support;

    return `
제7조 (교육 지원 및 반환)
1. 갑이 을에게 제공하는 교육:
   - 교육명: ${edu.name || '[교육명]'}
   - 기관: ${edu.institution || '[교육기관]'}
   - 금액: ${Utils.formatCurrency(edu.amount || 0)}
   - 기간: ${edu.period || '[기간]'}

2. 반환 조건:
   - 을이 교육 완료 후 ${edu.refund_period || 6}개월 이내 퇴사 시
   - 반환 비율: 잔여 기간 비례 (예: 2개월 근무 후 퇴사 = 4/6 = 66% 반환)

3. 반환 면제:
   - 갑의 귀책사유로 퇴사
   - 부당해고
   - ${edu.refund_period || 6}개월 이상 근무

★ 본 조항은 을의 자발적 동의 하에 작성되었으며,
   을은 충분히 이해하고 서명합니다.
`;
  },

  /**
   * PDF 생성 (간단 버전)
   */
  generatePDF(contractId) {
    const template = this.generateTemplate(contractId);
    if (!template) return;

    // 간단한 텍스트 파일로 다운로드 (실제 PDF는 jsPDF 라이브러리 필요)
    const contract = db.getById('contracts', contractId);
    const employee = db.getById('employees', contract.employee_id);
    const filename = `계약서_${employee.name}_${Utils.formatDate(new Date())}.txt`;

    Utils.downloadFile(template, filename, 'text/plain; charset=utf-8');
    Utils.showSuccess('계약서가 다운로드되었습니다.');
  },

  /**
   * 계약서 상태 업데이트
   */
  updateStatus(contractId, status) {
    db.update('contracts', contractId, { status });

    if (status === 'signed') {
      db.update('contracts', contractId, {
        signed_at: new Date().toISOString()
      });
      Utils.showSuccess('계약서가 서명되었습니다.');
    }
  },

  /**
   * 직원별 계약서 조회
   */
  getByEmployee(employeeId) {
    return db.find('contracts', c => c.employee_id === employeeId);
  },

  /**
   * 전체 계약서 조회
   */
  getAll() {
    return db.getAll('contracts');
  },

  /**
   * 계약서 상세
   */
  getDetail(contractId) {
    const contract = db.getById('contracts', contractId);
    if (!contract) return null;

    const employee = db.getById('employees', contract.employee_id);
    const template = this.generateTemplate(contractId);

    return {
      ...contract,
      employee,
      template,
      hourlyWage: Utils.calculateHourlyWage(contract.salary, contract.weekly_hours)
    };
  }
};

window.ContractManager = ContractManager;
