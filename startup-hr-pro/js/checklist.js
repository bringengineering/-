/**
 * StartupHR Pro - Daily Checklist Module
 * 일일 체크리스트 및 브리핑 시스템
 */

const ChecklistManager = {
  /**
   * 일일 브리핑 생성
   */
  generateDailyBriefing() {
    const today = Utils.formatDate(new Date());
    const summary = EmployeeManager.getDashboardSummary();
    const attendance = AttendanceManager.getDashboardSummary();
    const legal = LegalCheckManager.getDashboardSummary();

    // 긴급 알림
    const urgent = [];

    // 52시간 초과자
    summary.weeklyStats.forEach(stat => {
      if (stat.check.status === 'danger') {
        urgent.push({
          type: 'critical',
          icon: '🔴',
          message: `${stat.employee.name}님 주 52시간 초과 (${stat.hours}시간)`,
          action: '즉시 퇴근 조치 필요'
        });
      }
    });

    // 계약 만료 임박
    summary.expiringContracts.forEach(exp => {
      if (exp.daysUntil <= 7) {
        urgent.push({
          type: 'critical',
          icon: '🔴',
          message: `${exp.employee.name}님 계약 만료 ${exp.dDay}`,
          action: '계약 갱신 여부 즉시 결정'
        });
      } else if (exp.daysUntil <= 30) {
        urgent.push({
          type: 'warning',
          icon: '🟡',
          message: `${exp.employee.name}님 계약 만료 ${exp.dDay}`,
          action: '갱신 검토 필요'
        });
      }
    });

    // 법적 리스크 고위험
    legal.topRisks.slice(0, 3).forEach(risk => {
      if (risk.level === 'danger') {
        urgent.push({
          type: 'critical',
          icon: '🔴',
          message: `${risk.employee.name}님 법적 리스크 ${risk.totalScore}점`,
          action: '노무사 상담 권장'
        });
      }
    });

    return {
      date: today,
      day: Utils.getDayOfWeek(today),
      urgent,
      metrics: {
        totalEmployees: summary.active,
        avgWeeklyHours: attendance.avgHours,
        riskScore: legal.avgScore,
        pendingTasks: this.getPendingTasksCount()
      },
      summary: {
        active: summary.active,
        risky: summary.risky,
        expiring: summary.expiring,
        legalDanger: legal.dangerCount,
        legalWarning: legal.warningCount
      }
    };
  },

  /**
   * 일일 체크리스트 생성
   */
  createDailyChecklist() {
    const today = Utils.formatDate(new Date());

    const checklist = {
      date: today,
      type: 'daily',
      items: [
        {
          id: 1,
          category: 'morning',
          task: '긴급 알림 확인',
          priority: 'high',
          done: false
        },
        {
          id: 2,
          category: 'morning',
          task: '오늘 면담/미팅 준비',
          priority: 'high',
          done: false
        },
        {
          id: 3,
          category: 'morning',
          task: '직원 출근 현황 확인',
          priority: 'medium',
          done: false
        },
        {
          id: 4,
          category: 'morning',
          task: '어제 미처리 건 검토',
          priority: 'medium',
          done: false
        },
        {
          id: 5,
          category: 'afternoon',
          task: '업무 진행 상황 체크',
          priority: 'medium',
          done: false
        },
        {
          id: 6,
          category: 'afternoon',
          task: '직원 질문/요청 응답',
          priority: 'high',
          done: false
        },
        {
          id: 7,
          category: 'afternoon',
          task: '오늘 발생한 이슈 기록',
          priority: 'high',
          done: false
        },
        {
          id: 8,
          category: 'evening',
          task: '직원 퇴근 시간 확인',
          priority: 'medium',
          done: false
        },
        {
          id: 9,
          category: 'evening',
          task: '오늘 근무시간 기록 확인',
          priority: 'high',
          done: false
        },
        {
          id: 10,
          category: 'evening',
          task: '내일 할 일 정리',
          priority: 'low',
          done: false
        }
      ],
      completion_rate: 0
    };

    // 저장
    const existing = db.find('daily_checklists', c => c.date === today && c.type === 'daily');
    if (existing.length === 0) {
      db.add('daily_checklists', checklist);
    }

    return checklist;
  },

  /**
   * 주간 체크리스트 생성
   */
  createWeeklyChecklist() {
    const weekStart = Utils.formatDate(Utils.getWeekStart());

    return {
      date: weekStart,
      type: 'weekly',
      items: [
        { task: '지난주 근무시간 총계 확인', deadline: '월요일', done: false },
        { task: '52시간 초과자 체크', deadline: '월요일', done: false },
        { task: '이번 주 일정 공유', deadline: '월요일', done: false },
        { task: '직원별 업무 배정 확인', deadline: '화요일', done: false },
        { task: '주간 팀 미팅', deadline: '수요일', done: false },
        { task: '법적 리스크 점검', deadline: '목요일', done: false },
        { task: '다음주 준비 사항 정리', deadline: '금요일', done: false }
      ],
      completion_rate: 0
    };
  },

  /**
   * 체크리스트 조회
   */
  getChecklist(date, type = 'daily') {
    const checklists = db.find('daily_checklists', c =>
      c.date === date && c.type === type
    );

    if (checklists.length > 0) {
      return checklists[0];
    }

    // 없으면 새로 생성
    return type === 'daily' ?
           this.createDailyChecklist() :
           this.createWeeklyChecklist();
  },

  /**
   * 체크리스트 항목 토글
   */
  toggleItem(checklistId, itemId) {
    const checklist = db.getById('daily_checklists', checklistId);
    if (!checklist) return null;

    const itemIndex = checklist.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return null;

    checklist.items[itemIndex].done = !checklist.items[itemIndex].done;

    // 완료율 계산
    const doneCount = checklist.items.filter(item => item.done).length;
    checklist.completion_rate = Math.round((doneCount / checklist.items.length) * 100);

    db.update('daily_checklists', checklistId, {
      items: checklist.items,
      completion_rate: checklist.completion_rate
    });

    return checklist;
  },

  /**
   * 미완료 작업 개수
   */
  getPendingTasksCount() {
    const today = Utils.formatDate(new Date());
    const checklist = this.getChecklist(today);

    return checklist.items.filter(item => !item.done).length;
  },

  /**
   * 일일 리포트 생성
   */
  generateDailyReport() {
    const today = Utils.formatDate(new Date());
    const yesterday = Utils.formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const checklist = this.getChecklist(today);
    const completed = checklist.items.filter(item => item.done);
    const pending = checklist.items.filter(item => !item.done);

    // 어제 활동
    const yesterdayComms = db.find('communications', c =>
      Utils.formatDate(c.date).startsWith(yesterday)
    );

    const report = {
      date: today,
      checklist: {
        total: checklist.items.length,
        completed: completed.length,
        pending: pending.length,
        completionRate: checklist.completion_rate
      },
      completed: completed.map(item => ({
        task: item.task,
        category: item.category
      })),
      pending: pending.map(item => ({
        task: item.task,
        priority: item.priority,
        category: item.category
      })),
      yesterday: {
        activities: yesterdayComms.length,
        summary: yesterdayComms.slice(0, 5).map(c => ({
          type: c.comm_type,
          subject: c.subject,
          time: Utils.formatDate(c.date, 'HH:mm')
        }))
      },
      risks: LegalCheckManager.getDashboardSummary()
    };

    db.add('daily_reports', report);

    return report;
  },

  /**
   * 리포트 다운로드
   */
  downloadDailyReport() {
    const report = this.generateDailyReport();

    const text = `
========================================
일일 리포트
========================================

날짜: ${report.date}

----------------------------------------
체크리스트 완료율: ${report.checklist.completionRate}%
----------------------------------------
완료: ${report.checklist.completed}개
미완료: ${report.checklist.pending}개

완료한 작업:
${report.completed.map((item, idx) => `${idx + 1}. ${item.task}`).join('\n')}

미완료 작업:
${report.pending.map((item, idx) => `${idx + 1}. [${item.priority}] ${item.task}`).join('\n')}

----------------------------------------
어제 활동
----------------------------------------
${report.yesterday.summary.map(a => `[${a.time}] ${a.type} - ${a.subject}`).join('\n')}

----------------------------------------
법적 리스크 현황
----------------------------------------
평균 점수: ${report.risks.avgScore}/100
위험: ${report.risks.dangerCount}명
주의: ${report.risks.warningCount}명

========================================
`.trim();

    const filename = `일일리포트_${report.date}.txt`;
    Utils.downloadFile(text, filename, 'text/plain; charset=utf-8');
    Utils.showSuccess('일일 리포트가 다운로드되었습니다.');
  },

  /**
   * 상황별 가이드 검색
   */
  getSituationGuide(situation) {
    const guides = {
      '직원이 갑자기 그만두겠다고 함': {
        immediate: [
          '❌ 감정적 반응 금지',
          '✅ "알겠습니다. 생각 정리 후 내일 다시 얘기합시다"',
          '✅ 이 대화 즉시 문자로 요약 전송'
        ],
        within24h: [
          '노무사 긴급 상담',
          '퇴사 체크리스트 확인',
          '법적 증거 패키지 준비'
        ]
      },
      '직원이 주말 근무 거부': {
        check: [
          '❓ 계약서에 주말 근무 명시되어 있나?',
          '❓ 주말 급여 지급하고 있나?',
          '❓ 다른 직원들도 같은 조건인가?'
        ],
        action: [
          '✅ 계약서 미명시 → 강제 불가',
          '✅ "참여 여부만 금요일에 알려달라" 요청',
          '❌ "당연히 나와야지" 압박 금지'
        ]
      },
      '직원이 노동청 신고하겠다고 위협': {
        immediate: [
          '🚨 즉시 노무사 연락',
          '❌ 절대 협박/회유 금지',
          '✅ "알겠습니다" 답변만'
        ],
        within3h: [
          '52시간 초과 여부 긴급 확인',
          '급여 체불 여부 확인',
          '4대보험 정상 가입 확인',
          '증거 자료 백업'
        ]
      },
      '직원과 42분 통화 중': {
        realtime: [
          '⏱️ 10분 경과 → 서면 정리 제안',
          '⏱️ 20분 경과 → 통화 종료 후 문자',
          '⏱️ 30분 경과 → 강제 종료 필요',
          '❌ 감정적 표현 절대 금지',
          '✅ 녹음 시작 (합법적 범위)'
        ]
      }
    };

    return guides[situation] || {
      info: '해당 상황에 대한 가이드가 없습니다.',
      action: ['노무사 상담 권장']
    };
  }
};

window.ChecklistManager = ChecklistManager;
