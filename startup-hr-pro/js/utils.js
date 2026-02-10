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
   * 프로페셔널 Toast 알림 표시
   */
  showNotification(message, type = 'info') {
    const container = document.getElementById('toast-container') || this.createToastContainer();

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const colors = {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${colors[type]} animate-slide-in-right`;
    toast.innerHTML = `
      <div class="text-2xl">${icons[type]}</div>
      <div class="flex-1">
        <div class="font-medium text-gray-900">${message}</div>
      </div>
      <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
        <span class="text-xl">×</span>
      </button>
    `;

    container.appendChild(toast);

    // 자동 제거
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slide-in-right 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  },

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
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

/**
 * Photo Manager
 * 프로필 사진 관리 시스템
 */
const PhotoManager = {
  /**
   * 사진 업로드
   */
  uploadPhoto(file, id, type = 'employee') {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('파일이 없습니다.');
        return;
      }

      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        reject('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        reject('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const base64 = e.target.result;

        // LocalStorage에 저장
        const key = `photo_${type}_${id}`;
        try {
          localStorage.setItem(key, base64);
          Utils.showSuccess('사진이 업로드되었습니다.');
          resolve(base64);
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            reject('저장 공간이 부족합니다. 다른 사진을 삭제하거나 더 작은 파일을 사용해주세요.');
          } else {
            reject('사진 저장 중 오류가 발생했습니다.');
          }
        }
      };

      reader.onerror = () => {
        reject('파일 읽기 중 오류가 발생했습니다.');
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * 사진 가져오기
   */
  getPhoto(id, type = 'employee') {
    const key = `photo_${type}_${id}`;
    return localStorage.getItem(key);
  },

  /**
   * 사진 삭제
   */
  deletePhoto(id, type = 'employee') {
    const key = `photo_${type}_${id}`;
    localStorage.removeItem(key);
    Utils.showSuccess('사진이 삭제되었습니다.');
  },

  /**
   * 프로필 사진 HTML 생성
   */
  renderPhoto(id, name, size = 'default', type = 'employee') {
    const photo = this.getPhoto(id, type);
    const sizeClass = size === 'sm' ? 'profile-photo-sm' : size === 'lg' ? 'profile-photo-lg' : '';

    if (photo) {
      return `<img src="${photo}" alt="${name}" class="profile-photo ${sizeClass}">`;
    } else {
      // 이름의 첫 글자로 플레이스홀더 생성
      const initial = name ? name.charAt(0).toUpperCase() : '?';
      return `<div class="profile-photo profile-photo-placeholder ${sizeClass}">${initial}</div>`;
    }
  },

  /**
   * 사진 업로드 UI 생성
   */
  renderPhotoUpload(id, name, type = 'employee') {
    const photo = this.getPhoto(id, type);
    return `
      <div class="profile-photo-upload">
        <input type="file" accept="image/*" onchange="PhotoManager.handlePhotoUpload(this, '${id}', '${type}')">
        ${this.renderPhoto(id, name, 'lg', type)}
      </div>
    `;
  },

  /**
   * 사진 업로드 핸들러
   */
  handlePhotoUpload(input, id, type) {
    const file = input.files[0];
    if (file) {
      this.uploadPhoto(file, id, type)
        .then(() => {
          // 페이지 다시 렌더링
          if (typeof App !== 'undefined' && App.currentPage) {
            App.renderPage(App.currentPage);
          }
        })
        .catch((error) => {
          Utils.showError(error);
        });
    }
  }
};

/**
 * Notification Center
 * 알림 센터 관리
 */
const NotificationCenter = {
  notifications: [],
  isOpen: false,

  /**
   * 초기화
   */
  init() {
    // LocalStorage에서 알림 로드
    const saved = localStorage.getItem('notifications');
    if (saved) {
      this.notifications = JSON.parse(saved);
    }

    // 알림 센터 UI 생성
    this.render();

    // 이벤트 리스너 등록
    this.setupEventListeners();
  },

  /**
   * 알림 추가
   */
  add(notification) {
    const newNotification = {
      id: Utils.randomId(),
      title: notification.title,
      description: notification.description,
      type: notification.type || 'info', // info, success, warning, danger
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.save();
    this.render();

    // Toast 알림도 표시
    if (notification.showToast !== false) {
      Utils.showNotification(notification.title, notification.type);
    }

    return newNotification;
  },

  /**
   * 알림 읽음 처리
   */
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.save();
      this.render();
    }
  },

  /**
   * 모든 알림 읽음 처리
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.save();
    this.render();
  },

  /**
   * 알림 삭제
   */
  delete(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.save();
    this.render();
  },

  /**
   * 모든 알림 삭제
   */
  clearAll() {
    if (Utils.confirm('모든 알림을 삭제하시겠습니까?')) {
      this.notifications = [];
      this.save();
      this.render();
    }
  },

  /**
   * LocalStorage에 저장
   */
  save() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  },

  /**
   * 읽지 않은 알림 개수
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  },

  /**
   * 알림 센터 토글
   */
  toggle() {
    this.isOpen = !this.isOpen;
    const center = document.getElementById('notification-center');
    if (center) {
      center.classList.toggle('active', this.isOpen);
    }
  },

  /**
   * 알림 센터 렌더링
   */
  render() {
    let container = document.getElementById('notification-center');

    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-center';
      container.className = 'notification-center';
      document.body.appendChild(container);
    }

    const unreadCount = this.getUnreadCount();

    container.innerHTML = `
      <div class="notification-center-header">
        <div>
          <div class="font-semibold text-lg">알림</div>
          <div class="text-sm opacity-90">${unreadCount}개의 읽지 않은 알림</div>
        </div>
        <button onclick="NotificationCenter.toggle()" class="text-white text-2xl hover:opacity-80">×</button>
      </div>
      <div class="notification-center-body">
        ${this.notifications.length === 0 ? `
          <div class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">📭</div>
            <div>알림이 없습니다</div>
          </div>
        ` : this.notifications.map(n => `
          <div class="notification-item ${n.read ? '' : 'unread'}"
               onclick="NotificationCenter.markAsRead('${n.id}')">
            <div class="notification-item-title">${n.title}</div>
            <div class="notification-item-description">${n.description}</div>
            <div class="notification-item-time">${Utils.timeAgo(n.timestamp)}</div>
          </div>
        `).join('')}
      </div>
      ${this.notifications.length > 0 ? `
        <div class="p-4 border-t border-gray-200 flex gap-2">
          <button onclick="NotificationCenter.markAllAsRead()"
                  class="flex-1 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">
            모두 읽음
          </button>
          <button onclick="NotificationCenter.clearAll()"
                  class="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
            모두 삭제
          </button>
        </div>
      ` : ''}
    `;

    // 벨 아이콘 업데이트
    this.updateBellIcon();
  },

  /**
   * 벨 아이콘 업데이트
   */
  updateBellIcon() {
    const bellBtn = document.getElementById('notification-bell');
    if (bellBtn) {
      const unreadCount = this.getUnreadCount();
      const existingBadge = bellBtn.querySelector('.notification-badge');

      if (unreadCount > 0) {
        if (!existingBadge) {
          const badge = document.createElement('span');
          badge.className = 'notification-badge';
          badge.textContent = unreadCount;
          bellBtn.style.position = 'relative';
          bellBtn.appendChild(badge);
        } else {
          existingBadge.textContent = unreadCount;
        }
      } else {
        if (existingBadge) {
          existingBadge.remove();
        }
      }
    }
  },

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      const center = document.getElementById('notification-center');
      const bellBtn = document.getElementById('notification-bell');

      if (this.isOpen && center && !center.contains(e.target) && e.target !== bellBtn && !bellBtn?.contains(e.target)) {
        this.toggle();
      }
    });
  },

  /**
   * 자동 알림 생성 (테스트용)
   */
  addTestNotifications() {
    this.add({
      title: '52시간 초과 경고',
      description: '김철수님이 이번 주 52시간을 초과했습니다.',
      type: 'danger'
    });

    this.add({
      title: '계약 만료 예정',
      description: '박영희님의 계약이 7일 후 만료됩니다.',
      type: 'warning'
    });

    this.add({
      title: '신규 직원 등록',
      description: '이민수님이 팀에 합류했습니다.',
      type: 'success'
    });
  }
};

// 전역 사용을 위한 export
window.Utils = Utils;
window.PhotoManager = PhotoManager;
window.NotificationCenter = NotificationCenter;
