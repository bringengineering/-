/**
 * StartupHR Pro - Utility Functions
 * 공통 유틸리티 함수 모음
 */

const Utils = {
  /**
   * 날짜 포맷팅
   */
  formatDate(dateString, format = 'YYYY-MM-DD') {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formats = {
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'YYYY.MM.DD': `${year}.${month}.${day}`,
      'MM/DD': `${month}/${day}`,
      'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
      'HH:mm': `${hours}:${minutes}`
    };

    return formats[format] || formats['YYYY-MM-DD'];
  },

  /**
   * 상대적 시간 표시 (예: "2시간 전")
   */
  timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}일 전`;
    if (diffHour > 0) return `${diffHour}시간 전`;
    if (diffMin > 0) return `${diffMin}분 전`;
    return '방금';
  },

  /**
   * 숫자 포맷팅 (3자리 콤마)
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * 금액 포맷팅
   */
  formatCurrency(amount) {
    return `${this.formatNumber(amount)}원`;
  },

  /**
   * 주간 근무시간 계산
   */
  calculateWeeklyHours(attendance, employeeId, weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return record.employee_id === employeeId &&
             recordDate >= weekStart &&
             recordDate < weekEnd;
    });

    return weekAttendance.reduce((total, record) => {
      return total + (record.work_hours || 0);
    }, 0);
  },

  /**
   * 시급 계산
   */
  calculateHourlyWage(monthlySalary, weeklyHours = 40) {
    const monthlyHours = (weeklyHours * 52) / 12;
    return Math.round(monthlySalary / monthlyHours);
  },

  /**
   * 최저시급 체크 (2026년 기준)
   */
  checkMinimumWage(hourlyWage) {
    const MINIMUM_WAGE_2026 = 10030; // 예상 최저시급
    return {
      isValid: hourlyWage >= MINIMUM_WAGE_2026,
      difference: hourlyWage - MINIMUM_WAGE_2026,
      minimumWage: MINIMUM_WAGE_2026
    };
  },

  /**
   * 52시간 체크
   */
  check52Hours(weeklyHours) {
    let status = 'safe';
    let message = '정상';
    let color = 'green';

    if (weeklyHours >= 52) {
      status = 'danger';
      message = '52시간 초과! 즉시 조치 필요';
      color = 'red';
    } else if (weeklyHours >= 50) {
      status = 'critical';
      message = '52시간 임박 경고';
      color = 'orange';
    } else if (weeklyHours >= 40) {
      status = 'warning';
      message = '연장근로 중';
      color = 'yellow';
    }

    return {
      status,
      message,
      color,
      hours: weeklyHours,
      overtime: Math.max(0, weeklyHours - 40),
      violation: Math.max(0, weeklyHours - 52)
    };
  },

  /**
   * 감정적 표현 감지
   */
  detectEmotionalWords(text) {
    const emotionalWords = {
      critical: ['배신', '이기적', '책임감 없다', '정이 없다', '나가라', '그만둬라'],
      warning: ['서운하다', '실망', '화난다', '짜증', '속상하다'],
      inappropriate: ['바보', '멍청', '한심', '쓰레기']
    };

    const detected = {
      critical: [],
      warning: [],
      inappropriate: [],
      hasCritical: false,
      hasWarning: false,
      hasInappropriate: false
    };

    Object.keys(emotionalWords).forEach(level => {
      emotionalWords[level].forEach(word => {
        if (text.includes(word)) {
          detected[level].push(word);
          detected[`has${level.charAt(0).toUpperCase() + level.slice(1)}`] = true;
        }
      });
    });

    return detected;
  },

  /**
   * 법적 리스크 키워드 감지
   */
  detectLegalRisks(text) {
    const riskKeywords = {
      critical: ['24시간 일하자', '52시간 초과', '주말도 당연히', '돈 안 주면'],
      warning: ['환불 안 하면', '노동청 신고', '고소', '소송'],
      important: ['계약', '급여', '환불', '퇴사', '해고', '교육비']
    };

    const risks = {
      critical: [],
      warning: [],
      important: [],
      riskScore: 0
    };

    Object.keys(riskKeywords).forEach(level => {
      riskKeywords[level].forEach(keyword => {
        if (text.includes(keyword)) {
          risks[level].push(keyword);
          risks.riskScore += level === 'critical' ? 30 : (level === 'warning' ? 15 : 5);
        }
      });
    });

    return risks;
  },

  /**
   * D-day 계산
   */
  getDDay(targetDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'D-Day';
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  },

  /**
   * 리스크 레벨 색상
   */
  getRiskColor(score) {
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    if (score >= 40) return 'yellow';
    return 'green';
  },

  /**
   * 요일 구하기
   */
  getDayOfWeek(dateString) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(dateString);
    return days[date.getDay()];
  },

  /**
   * 주차 시작일 구하기 (월요일 기준)
   */
  getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  },

  /**
   * 난수 생성
   */
  randomId() {
    return Math.random().toString(36).substr(2, 9);
  },

  /**
   * 배열 셔플
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * Deep Clone
   */
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * 텍스트 하이라이트
   */
  highlightText(text, keywords) {
    let highlighted = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      highlighted = highlighted.replace(regex, `<mark class="bg-yellow-200">$&</mark>`);
    });
    return highlighted;
  },

  /**
   * 파일 다운로드
   */
  downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * JSON 다운로드
   */
  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, filename, 'application/json');
  },

  /**
   * 성공 알림
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  },

  /**
   * 에러 알림
   */
  showError(message) {
    this.showNotification(message, 'error');
  },

  /**
   * 알림 표시
   */
  showNotification(message, type = 'info') {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('animate-slide-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  /**
   * 확인 다이얼로그
   */
  confirm(message) {
    return window.confirm(message);
  },

  /**
   * 디바운스
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// 전역 사용을 위한 export
window.Utils = Utils;
