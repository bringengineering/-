/**
 * StartupHR Pro - Email Template System
 * 자동화된 HR 이메일 템플릿
 */

const EmailTemplates = {
  /**
   * 이메일 템플릿 정의
   */
  templates: {
    contractExpiry: {
      id: 'contractExpiry',
      name: '계약 만료 알림',
      subject: '[{companyName}] 계약 만료 알림 - {employeeName}님',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">계약 만료 알림</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">안녕하세요, {employeeName}님</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #d97706; font-weight: bold;">⚠️ 계약 만료 예정</p>
              <p style="margin: 10px 0 0 0; color: #374151;">
                현재 계약이 <strong style="color: #ef4444;">{daysLeft}일</strong> 후 만료 예정입니다.
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
                만료일: {endDate}
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              계약 연장 또는 갱신이 필요하신 경우, HR 담당자에게 문의해 주세요.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af;">
                {companyName} HR 팀<br>
                이메일: {companyEmail} | 전화: {companyPhone}
              </p>
            </div>
          </div>
        </div>
      `
    },

    welcome: {
      id: 'welcome',
      name: '신입 환영 이메일',
      subject: '[{companyName}] 환영합니다, {employeeName}님!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 환영합니다!</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">안녕하세요, {employeeName}님</p>

            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              {companyName}의 일원이 되신 것을 진심으로 환영합니다!<br>
              {position}으로서 함께 성장해 나갈 수 있기를 기대합니다.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">📋 입사 정보</h3>
              <ul style="list-style: none; padding: 0; margin: 0; color: #374151;">
                <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                  <strong>입사일:</strong> {startDate}
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                  <strong>부서:</strong> {department}
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                  <strong>직책:</strong> {position}
                </li>
                <li style="padding: 8px 0;">
                  <strong>고용 형태:</strong> {employmentType}
                </li>
              </ul>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">✅ 첫 출근 준비물</h3>
              <ul style="color: #1e3a8a; line-height: 1.8;">
                <li>신분증 사본</li>
                <li>계좌번호 (급여 입금용)</li>
                <li>증명사진 2매</li>
                <li>졸업증명서 (필요시)</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              궁금하신 사항이 있으시면 언제든지 HR 팀으로 연락 주세요.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af;">
                {companyName} HR 팀<br>
                이메일: {companyEmail} | 전화: {companyPhone}
              </p>
            </div>
          </div>
        </div>
      `
    },

    weeklyOvertime: {
      id: 'weeklyOvertime',
      name: '주 52시간 초과 경고',
      subject: '[긴급] 주 52시간 초과 - {employeeName}님',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">⚠️ 긴급: 근로시간 초과</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">안녕하세요, {employeeName}님</p>

            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">🚨 주 52시간 초과</p>
              <p style="margin: 10px 0 0 0; color: #374151;">
                이번 주 총 근무시간: <strong style="color: #ef4444; font-size: 18px;">{weeklyHours}시간</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #dc2626;">
                법정 기준 52시간을 <strong>{overtimeHours}시간</strong> 초과하였습니다.
              </p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">📊 주간 근무 현황</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">항목</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">시간</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">정규 근무</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f3f4f6;">40시간</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">연장 근무</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #f59e0b;">{overtimeHours}시간</td>
                </tr>
                <tr style="font-weight: bold; background: #fef3c7;">
                  <td style="padding: 10px;">총 근무시간</td>
                  <td style="padding: 10px; text-align: right; color: #ef4444;">{weeklyHours}시간</td>
                </tr>
              </table>
            </div>

            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fef3c7;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">⚡ 조치 사항</h3>
              <ul style="color: #78350f; line-height: 1.8; margin: 0;">
                <li>즉시 근무를 중단하고 휴식을 취해 주세요</li>
                <li>이번 주 추가 근무는 금지됩니다</li>
                <li>다음 주 근무시간을 조정할 예정입니다</li>
                <li>근로기준법 준수를 위해 필수적인 조치입니다</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #dc2626; font-weight: bold;">
              ⚠️ 법적 리스크 방지를 위해 즉시 조치가 필요합니다.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af;">
                {companyName} HR 팀<br>
                이메일: {companyEmail} | 전화: {companyPhone}
              </p>
            </div>
          </div>
        </div>
      `
    },

    legalRiskAlert: {
      id: 'legalRiskAlert',
      name: '법적 리스크 알림',
      subject: '[중요] 법적 리스크 감지 - {employeeName}님 관련',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">⚖️ 법적 리스크 알림</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">HR 담당자님께</p>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ 높은 법적 리스크 감지</p>
              <p style="margin: 10px 0 0 0; color: #374151;">
                직원: <strong>{employeeName}</strong> ({position})<br>
                리스크 점수: <strong style="color: #dc2626; font-size: 18px;">{riskScore}/100</strong>
              </p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">🔍 감지된 리스크 항목</h3>
              <div style="color: #374151;">
                {riskItems}
              </div>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">✅ 권장 조치사항</h3>
              <ul style="color: #1e3a8a; line-height: 1.8;">
                <li>법무 담당자와 상담</li>
                <li>근로계약서 재검토</li>
                <li>근무시간 조정 계획 수립</li>
                <li>직원과의 1:1 면담 진행</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #dc2626; font-weight: bold;">
              ⚠️ 조기 대응이 중요합니다. 빠른 조치를 권장합니다.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af;">
                {companyName} HR 시스템<br>
                자동 생성된 알림입니다.
              </p>
            </div>
          </div>
        </div>
      `
    },

    monthlyReport: {
      id: 'monthlyReport',
      name: '월간 HR 리포트',
      subject: '[{companyName}] {month}월 HR 리포트',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">📊 월간 HR 리포트</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">{month}월</p>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">주요 지표</h2>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">{totalEmployees}</div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">총 직원 수</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; font-weight: bold; color: #10b981;">{avgWorkHours}</div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">평균 근무시간</div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">📈 월간 통계</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">신규 입사</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #10b981; font-weight: bold;">{newHires}명</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">퇴사</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #ef4444; font-weight: bold;">{resignations}명</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">계약 갱신</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #3b82f6; font-weight: bold;">{contractRenewals}건</td>
                </tr>
                <tr>
                  <td style="padding: 10px;">법적 이슈</td>
                  <td style="padding: 10px; text-align: right; color: #f59e0b; font-weight: bold;">{legalIssues}건</td>
                </tr>
              </table>
            </div>

            <div style="background: ${'{legalIssues}' > 0 ? '#fef3c7' : '#d1fae5'}; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid ${'{legalIssues}' > 0 ? '#fef3c7' : '#a7f3d0'};">
              <h3 style="margin: 0 0 10px 0; color: ${'{legalIssues}' > 0 ? '#92400e' : '#065f46'};">
                ${'{legalIssues}' > 0 ? '⚠️ 주의사항' : '✅ 우수한 관리 상태'}
              </h3>
              <p style="margin: 0; color: ${'{legalIssues}' > 0 ? '#78350f' : '#047857'}; line-height: 1.6;">
                ${'{legalIssues}' > 0 ? '이번 달 법적 이슈가 발생했습니다. 조속한 대응이 필요합니다.' : '이번 달 법적 이슈가 없었습니다. 현재의 관리 방식을 유지하세요.'}
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af;">
                {companyName} StartupHR Pro<br>
                자동 생성 리포트
              </p>
            </div>
          </div>
        </div>
      `
    }
  },

  /**
   * 템플릿 렌더링 (변수 치환)
   */
  render(templateId, variables) {
    const template = this.templates[templateId];
    if (!template) {
      console.error(`템플릿을 찾을 수 없습니다: ${templateId}`);
      return null;
    }

    let subject = template.subject;
    let body = template.body;

    // 변수 치환
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      subject = subject.replace(regex, variables[key]);
      body = body.replace(regex, variables[key]);
    });

    return {
      subject,
      body
    };
  },

  /**
   * 이메일 미리보기
   */
  preview(templateId, variables) {
    const email = this.render(templateId, variables);
    if (!email) return;

    const html = `
      <div class="email-preview-modal">
        <div class="email-preview-header">
          <h3 class="text-xl font-bold">📧 이메일 미리보기</h3>
          <div class="text-sm text-gray-600 mt-2">
            <strong>제목:</strong> ${email.subject}
          </div>
        </div>
        <div class="email-preview-body">
          ${email.body}
        </div>
        <div class="email-preview-actions">
          <button onclick="EmailTemplates.copyToClipboard('${templateId}', ${JSON.stringify(variables).replace(/"/g, '&quot;')})"
                  class="btn btn-ghost">
            📋 HTML 복사
          </button>
          <button onclick="EmailTemplates.downloadHTML('${templateId}', ${JSON.stringify(variables).replace(/"/g, '&quot;')})"
                  class="btn btn-primary">
            💾 HTML 다운로드
          </button>
        </div>
      </div>
    `;

    App.showModal('이메일 미리보기', html);
  },

  /**
   * HTML 클립보드 복사
   */
  copyToClipboard(templateId, variables) {
    const email = this.render(templateId, variables);
    if (!email) return;

    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${email.subject}</title>
</head>
<body>
  ${email.body}
</body>
</html>
    `;

    navigator.clipboard.writeText(fullHTML).then(() => {
      Utils.showSuccess('HTML이 클립보드에 복사되었습니다!');
    }).catch(err => {
      Utils.showError('복사 실패: ' + err);
    });
  },

  /**
   * HTML 파일 다운로드
   */
  downloadHTML(templateId, variables) {
    const email = this.render(templateId, variables);
    if (!email) return;

    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${email.subject}</title>
</head>
<body>
  ${email.body}
</body>
</html>
    `;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${templateId}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);

    Utils.showSuccess('이메일 HTML 파일이 다운로드되었습니다!');
  },

  /**
   * 자동 이메일 스케줄링
   */
  scheduleAutomatedEmails() {
    // 계약 만료 알림 (7일 전)
    const contracts = db.getAll('contracts');
    const today = new Date();

    contracts.forEach(contract => {
      const endDate = new Date(contract.endDate);
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
        const employee = db.get('employees', contract.employeeId);
        if (employee) {
          this.queueEmail('contractExpiry', {
            companyName: SettingsManager.load().company.name,
            companyEmail: SettingsManager.load().company.email || 'hr@company.com',
            companyPhone: SettingsManager.load().company.phone,
            employeeName: employee.name,
            daysLeft: daysLeft,
            endDate: Utils.formatDate(endDate)
          });
        }
      }
    });

    // 주 52시간 초과 알림
    const weeklyStats = EmployeeManager.getDashboardSummary().weeklyStats;
    weeklyStats.forEach(stat => {
      if (stat.hours > 52) {
        this.queueEmail('weeklyOvertime', {
          companyName: SettingsManager.load().company.name,
          companyEmail: SettingsManager.load().company.email || 'hr@company.com',
          companyPhone: SettingsManager.load().company.phone,
          employeeName: stat.employee.name,
          weeklyHours: stat.hours,
          overtimeHours: stat.hours - 52
        });
      }
    });
  },

  /**
   * 이메일 큐에 추가
   */
  queueEmail(templateId, variables) {
    const queue = JSON.parse(localStorage.getItem('email-queue') || '[]');
    queue.push({
      id: Utils.generateId(),
      templateId,
      variables,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('email-queue', JSON.stringify(queue));

    NotificationCenter.add({
      title: '이메일 대기 중',
      description: `${this.templates[templateId].name} 이메일이 생성되었습니다.`,
      type: 'info'
    });
  },

  /**
   * 이메일 템플릿 페이지 렌더링
   */
  renderTemplatesPage() {
    const queue = JSON.parse(localStorage.getItem('email-queue') || '[]');

    return `
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">📧 이메일 템플릿</h1>
          <p class="text-gray-600 mt-1">자동화된 HR 이메일 관리</p>
        </div>

        <!-- 이메일 템플릿 목록 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${Object.values(this.templates).map(template => `
            <div class="glass-card p-6 hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-bold mb-2">${template.name}</h3>
              <p class="text-sm text-gray-600 mb-4">템플릿 ID: ${template.id}</p>
              <button onclick="EmailTemplates.showTemplatePreview('${template.id}')"
                      class="btn btn-primary w-full">
                👁️ 미리보기
              </button>
            </div>
          `).join('')}
        </div>

        <!-- 이메일 큐 -->
        ${queue.length > 0 ? `
          <div class="glass-card p-6">
            <h2 class="text-xl font-bold mb-4">📬 대기 중인 이메일 (${queue.length})</h2>
            <div class="space-y-3">
              ${queue.slice(0, 10).map(email => `
                <div class="flex items-center justify-between p-3 bg-white bg-opacity-50 rounded-lg">
                  <div>
                    <div class="font-medium">${this.templates[email.templateId].name}</div>
                    <div class="text-xs text-gray-600">${Utils.timeAgo(new Date(email.createdAt))}</div>
                  </div>
                  <div class="flex gap-2">
                    <button onclick="EmailTemplates.viewQueuedEmail('${email.id}')"
                            class="text-sm text-blue-600 hover:text-blue-800">
                      보기
                    </button>
                    <button onclick="EmailTemplates.removeFromQueue('${email.id}')"
                            class="text-sm text-red-600 hover:text-red-800">
                      삭제
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button onclick="EmailTemplates.clearQueue()"
                    class="btn btn-danger mt-4 w-full">
              전체 삭제
            </button>
          </div>
        ` : ''}

        <!-- 자동화 설정 -->
        <div class="glass-card p-6">
          <h2 class="text-xl font-bold mb-4">⚙️ 자동화 설정</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-white bg-opacity-50 rounded-lg">
              <div>
                <div class="font-medium">계약 만료 알림</div>
                <div class="text-xs text-gray-600">만료 7일, 3일, 1일 전 자동 발송</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked disabled>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="flex items-center justify-between p-3 bg-white bg-opacity-50 rounded-lg">
              <div>
                <div class="font-medium">주 52시간 초과 알림</div>
                <div class="text-xs text-gray-600">초과 시 즉시 발송</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked disabled>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="flex items-center justify-between p-3 bg-white bg-opacity-50 rounded-lg">
              <div>
                <div class="font-medium">월간 리포트</div>
                <div class="text-xs text-gray-600">매월 1일 자동 발송</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked disabled>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 템플릿 미리보기 표시
   */
  showTemplatePreview(templateId) {
    // 샘플 데이터
    const sampleData = {
      companyName: SettingsManager.load().company.name || '스타트업',
      companyEmail: 'hr@company.com',
      companyPhone: '02-1234-5678',
      employeeName: '홍길동',
      position: '개발팀 과장',
      department: '개발팀',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      daysLeft: 7,
      employmentType: '정규직',
      weeklyHours: 55,
      overtimeHours: 3,
      riskScore: 75,
      riskItems: '<ul><li>주 52시간 초과 (3회)</li><li>휴게시간 미보장</li><li>연차 미사용</li></ul>',
      month: '12월',
      totalEmployees: 25,
      avgWorkHours: 42,
      newHires: 3,
      resignations: 1,
      contractRenewals: 5,
      legalIssues: 2
    };

    this.preview(templateId, sampleData);
  },

  /**
   * 대기 중인 이메일 보기
   */
  viewQueuedEmail(emailId) {
    const queue = JSON.parse(localStorage.getItem('email-queue') || '[]');
    const email = queue.find(e => e.id === emailId);
    if (email) {
      this.preview(email.templateId, email.variables);
    }
  },

  /**
   * 큐에서 제거
   */
  removeFromQueue(emailId) {
    if (Utils.confirm('이 이메일을 삭제하시겠습니까?')) {
      const queue = JSON.parse(localStorage.getItem('email-queue') || '[]');
      const newQueue = queue.filter(e => e.id !== emailId);
      localStorage.setItem('email-queue', JSON.stringify(newQueue));
      App.renderPage('email-templates');
      Utils.showSuccess('이메일이 삭제되었습니다.');
    }
  },

  /**
   * 큐 전체 삭제
   */
  clearQueue() {
    if (Utils.confirm('모든 대기 중인 이메일을 삭제하시겠습니까?')) {
      localStorage.setItem('email-queue', '[]');
      App.renderPage('email-templates');
      Utils.showSuccess('모든 이메일이 삭제되었습니다.');
    }
  }
};

// 전역 사용을 위한 export
window.EmailTemplates = EmailTemplates;

// 페이지 로드 시 자동 이메일 스케줄링
if (typeof window !== 'undefined') {
  setInterval(() => {
    EmailTemplates.scheduleAutomatedEmails();
  }, 60000 * 60); // 1시간마다 체크
}
