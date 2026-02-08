/**
 * StartupHR Pro - Conversation Analysis Module
 * 대화 분석 및 녹취록 관리
 */

const ConversationManager = {
  /**
   * 대화 기록 추가
   */
  add(employeeId, transcript) {
    const analysis = this.analyze(transcript);

    const conversation = db.add('conversations', {
      employee_id: employeeId,
      date: new Date().toISOString(),
      duration: analysis.estimatedMinutes,
      transcript_text: transcript,
      risk_score: analysis.riskScore,
      critical_count: analysis.criticalKeywords.length,
      warning_count: analysis.warningKeywords.length,
      summary: analysis.summary,
      keywords_detected: analysis.allKeywords
    });

    // 하이라이트 저장
    analysis.highlights.forEach(highlight => {
      db.add('conversation_highlights', {
        conversation_id: conversation.id,
        text_snippet: highlight.text,
        risk_level: highlight.level,
        keyword: highlight.keyword,
        recommendation: highlight.recommendation
      });
    });

    if (analysis.riskScore >= 70) {
      Utils.showError('🚨 고위험 대화 패턴 감지! 즉시 조치가 필요합니다.');
    }

    Utils.showSuccess('대화가 분석되었습니다.');
    return conversation;
  },

  /**
   * 대화 내용 분석
   */
  analyze(text) {
    // 감정적 표현 감지
    const emotional = Utils.detectEmotionalWords(text);

    // 법적 리스크 키워드 감지
    const legal = Utils.detectLegalRisks(text);

    // 모든 키워드
    const allKeywords = [
      ...emotional.critical,
      ...emotional.warning,
      ...emotional.inappropriate,
      ...legal.critical,
      ...legal.warning,
      ...legal.important
    ];

    // 리스크 점수 계산
    const emotionalScore = emotional.critical.length * 20 +
                          emotional.warning.length * 10 +
                          emotional.inappropriate.length * 25;

    const riskScore = Math.min(100, emotionalScore + legal.riskScore);

    // 하이라이트 생성
    const highlights = [];

    emotional.critical.forEach(keyword => {
      highlights.push({
        text: this.extractContext(text, keyword),
        level: 'critical',
        keyword,
        recommendation: '감정적 표현 대신 객관적 사실로 전환 필요'
      });
    });

    legal.critical.forEach(keyword => {
      highlights.push({
        text: this.extractContext(text, keyword),
        level: 'critical',
        keyword,
        recommendation: '법적 리스크 - 즉시 정정 및 서면 정리 필요'
      });
    });

    // 대화 길이 추정 (300자 = 1분 가정)
    const estimatedMinutes = Math.ceil(text.length / 300);

    // 요약 생성
    const summary = this.generateSummary(text, allKeywords, riskScore);

    return {
      estimatedMinutes,
      riskScore,
      criticalKeywords: [...emotional.critical, ...legal.critical],
      warningKeywords: [...emotional.warning, ...legal.warning],
      allKeywords,
      highlights,
      summary,
      emotional,
      legal
    };
  },

  /**
   * 키워드 문맥 추출
   */
  extractContext(text, keyword, contextLength = 50) {
    const index = text.indexOf(keyword);
    if (index === -1) return keyword;

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + keyword.length + contextLength);

    let snippet = text.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  },

  /**
   * 요약 생성
   */
  generateSummary(text, keywords, riskScore) {
    return {
      wordCount: text.length,
      keywordCount: keywords.length,
      riskLevel: riskScore >= 70 ? 'critical' :
                 riskScore >= 50 ? 'high' :
                 riskScore >= 30 ? 'medium' : 'low',
      mainIssues: this.extractMainIssues(keywords),
      recommendations: this.getRecommendations(riskScore, keywords)
    };
  },

  /**
   * 주요 이슈 추출
   */
  extractMainIssues(keywords) {
    const issues = [];

    if (keywords.some(k => k.includes('52시간') || k.includes('주말'))) {
      issues.push('근로시간 관련 논의');
    }

    if (keywords.some(k => k.includes('환불') || k.includes('교육비'))) {
      issues.push('교육비 환불 문제');
    }

    if (keywords.some(k => k.includes('퇴사') || k.includes('해고'))) {
      issues.push('퇴사 관련 논의');
    }

    if (keywords.some(k => ['배신', '서운', '이기적'].includes(k))) {
      issues.push('감정적 갈등');
    }

    return issues.length > 0 ? issues : ['일반 대화'];
  },

  /**
   * 권장사항 생성
   */
  getRecommendations(riskScore, keywords) {
    const recommendations = [];

    if (riskScore >= 70) {
      recommendations.push('❌ 즉시 대화 중단');
      recommendations.push('✅ 내용을 서면으로 정리하여 발송');
      recommendations.push('✅ 노무사 긴급 상담');
      recommendations.push('✅ 증거 패키지 준비');
    } else if (riskScore >= 50) {
      recommendations.push('⚠️ 대화 내용 서면화');
      recommendations.push('✅ 감정적 표현 자제');
      recommendations.push('✅ 객관적 사실만 전달');
    } else if (riskScore >= 30) {
      recommendations.push('ℹ️ 대화 기록 보관');
      recommendations.push('✅ 필요시 서면 보충');
    } else {
      recommendations.push('✅ 정상 범위의 대화');
    }

    return recommendations;
  },

  /**
   * 10분 룰 체크
   */
  check10MinuteRule(startTime) {
    const now = new Date();
    const start = new Date(startTime);
    const diffMinutes = (now - start) / (1000 * 60);

    if (diffMinutes >= 10) {
      return {
        exceeded: true,
        minutes: Math.round(diffMinutes),
        warning: '⏱️ 10분이 경과했습니다. 대화를 종료하고 서면으로 정리하시겠습니까?'
      };
    }

    return {
      exceeded: false,
      minutes: Math.round(diffMinutes),
      remaining: 10 - Math.round(diffMinutes)
    };
  },

  /**
   * 직원별 대화 기록 조회
   */
  getByEmployee(employeeId) {
    return db.find('conversations', c => c.employee_id === employeeId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * 대화 상세
   */
  getDetail(conversationId) {
    const conversation = db.getById('conversations', conversationId);
    if (!conversation) return null;

    const employee = db.getById('employees', conversation.employee_id);
    const highlights = db.find('conversation_highlights', h =>
      h.conversation_id === conversationId
    );

    return {
      ...conversation,
      employee,
      highlights
    };
  },

  /**
   * 증거 패키지 생성
   */
  generateEvidencePackage(employeeId) {
    const employee = db.getById('employees', employeeId);
    const conversations = this.getByEmployee(employeeId);
    const attendance = db.find('attendance', a => a.employee_id === employeeId);
    const contracts = db.find('contracts', c => c.employee_id === employeeId);
    const warnings = db.find('warnings', w => w.employee_id === employeeId);
    const communications = db.find('communications', c => c.employee_id === employeeId);

    const package = `
========================================
법적 증거 패키지
========================================

직원명: ${employee.name}
직책: ${employee.position}
입사일: ${Utils.formatDate(employee.hire_date)}
생성일: ${Utils.formatDate(new Date(), 'YYYY-MM-DD HH:mm')}

========================================
1. 대화 녹취 기록 (${conversations.length}건)
========================================

${conversations.map((conv, idx) => `
[${idx + 1}] ${Utils.formatDate(conv.date, 'YYYY-MM-DD HH:mm')}
길이: ${conv.duration}분
리스크 점수: ${conv.risk_score}/100
주요 이슈: ${conv.summary.mainIssues.join(', ')}

전문:
${conv.transcript_text}

분석 결과:
- 위험 키워드: ${conv.critical_count}개
- 주의 키워드: ${conv.warning_count}개

권장조치:
${conv.summary.recommendations.map(r => `  - ${r}`).join('\n')}

${'='.repeat(40)}
`).join('\n')}

========================================
2. 근태 기록 (${attendance.length}건)
========================================

${attendance.map(a => `${Utils.formatDate(a.date)} | ${a.clock_in} ~ ${a.clock_out} | ${a.work_hours}시간 | ${a.work_type}`).join('\n')}

========================================
3. 계약서 (${contracts.length}건)
========================================

${contracts.map((c, idx) => `[${idx + 1}] ${c.contract_type} | ${Utils.formatDate(c.start_date)} ~ ${c.end_date || '무기한'} | ${Utils.formatCurrency(c.salary)}`).join('\n')}

========================================
4. 경고 기록 (${warnings.length}건)
========================================

${warnings.map(w => `[${Utils.formatDate(w.issued_date)}] ${w.warning_type} - ${w.description}`).join('\n')}

========================================
5. 소통 기록 (${communications.length}건)
========================================

${communications.map(c => `[${Utils.formatDate(c.date)}] ${c.comm_type} - ${c.subject}`).join('\n')}

========================================
종합 의견
========================================

${this.generateFinalOpinion(employee, conversations, attendance, warnings)}

========================================
`.trim();

    return package;
  },

  /**
   * 종합 의견 생성
   */
  generateFinalOpinion(employee, conversations, attendance, warnings) {
    const totalRiskScore = conversations.reduce((sum, c) => sum + c.risk_score, 0) /
                           (conversations.length || 1);

    const weeklyHours = AttendanceManager.getWeeklyHours(employee.id);

    let opinion = `직원 ${employee.name}님에 대한 종합 분석 결과:\n\n`;

    if (totalRiskScore >= 70) {
      opinion += '🔴 고위험 상태\n';
      opinion += '- 대화 내용에서 심각한 법적 리스크 발견\n';
      opinion += '- 조기 정리 또는 노무사 상담 강력 권장\n\n';
    }

    if (weeklyHours.check.status === 'danger') {
      opinion += '🔴 52시간 위반\n';
      opinion += `- 주 ${weeklyHours.totalHours}시간 근무\n`;
      opinion += '- 근로기준법 위반 상태\n\n';
    }

    if (warnings.length >= 3) {
      opinion += `🟠 경고 ${warnings.length}회 누적\n`;
      opinion += '- 개선 의지 확인 필요\n\n';
    }

    opinion += '권장 조치:\n';
    opinion += '1. 모든 향후 소통은 서면으로만 진행\n';
    opinion += '2. 감정적 표현 일체 배제\n';
    opinion += '3. 필요시 노무사 동석 하 면담\n';
    opinion += '4. 법적 절차 대비 증거 자료 지속 수집\n';

    return opinion;
  },

  /**
   * 증거 패키지 다운로드
   */
  downloadEvidencePackage(employeeId) {
    const package = this.generateEvidencePackage(employeeId);
    const employee = db.getById('employees', employeeId);
    const filename = `증거패키지_${employee.name}_${Utils.formatDate(new Date())}.txt`;

    Utils.downloadFile(package, filename, 'text/plain; charset=utf-8');
    Utils.showSuccess('증거 패키지가 다운로드되었습니다.');
  }
};

window.ConversationManager = ConversationManager;
