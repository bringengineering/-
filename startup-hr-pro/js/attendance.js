/**
 * StartupHR Pro - Attendance Management Module
 * 근태 관리 시스템 (52시간 체크 포함)
 */

const AttendanceManager = {
  /**
   * 출퇴근 기록 추가
   */
  add(employeeId, date, clockIn, clockOut) {
    // 근무시간 자동 계산
    const workHours = this.calculateWorkHours(clockIn, clockOut);

    // 근무 유형 결정
    const workType = this.getWorkType(date);

    const attendance = db.add('attendance', {
      employee_id: employeeId,
      date,
      clock_in: clockIn,
      clock_out: clockOut,
      work_hours: workHours,
      work_type: workType,
      notes: ''
    });

    // 52시간 체크
    this.check52HoursWarning(employeeId, date);

    Utils.showSuccess('출퇴근 기록이 추가되었습니다.');
    return attendance;
  },

  /**
   * 근무시간 계산
   */
  calculateWorkHours(clockIn, clockOut) {
    if (!clockIn || !clockOut) return 0;

    const start = new Date(`2000-01-01 ${clockIn}`);
    const end = new Date(`2000-01-01 ${clockOut}`);

    let diffMs = end - start;

    // 점심시간 1시간 제외
    if (diffMs > 4 * 60 * 60 * 1000) { // 4시간 이상이면 점심시간 제외
      diffMs -= 60 * 60 * 1000;
    }

    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0, Math.round(hours * 10) / 10);
  },

  /**
   * 근무 유형 결정
   */
  getWorkType(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();

    // 주말
    if (day === 0 || day === 6) {
      return '주말';
    }

    // 공휴일 체크 (간단 버전)
    const holidays = ['2026-01-01', '2026-03-01', '2026-05-05', '2026-06-06', '2026-08-15', '2026-10-03', '2026-10-09', '2026-12-25'];
    if (holidays.includes(dateString)) {
      return '공휴일';
    }

    return '평일';
  },

  /**
   * 주간 근무시간 조회
   */
  getWeeklyHours(employeeId, weekStartDate) {
    const weekStart = weekStartDate ? new Date(weekStartDate) : Utils.getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const attendance = db.find('attendance', a => {
      const recordDate = new Date(a.date);
      return a.employee_id === employeeId &&
             recordDate >= weekStart &&
             recordDate < weekEnd;
    });

    const totalHours = attendance.reduce((sum, a) => sum + (a.work_hours || 0), 0);

    return {
      weekStart: Utils.formatDate(weekStart),
      weekEnd: Utils.formatDate(weekEnd),
      records: attendance,
      totalHours: Math.round(totalHours * 10) / 10,
      check: Utils.check52Hours(totalHours),
      dailyBreakdown: this.getDailyBreakdown(attendance)
    };
  },

  /**
   * 일일 분석
   */
  getDailyBreakdown(attendance) {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const breakdown = [];

    attendance.forEach(record => {
      const day = Utils.getDayOfWeek(record.date);
      breakdown.push({
        date: Utils.formatDate(record.date, 'MM/DD'),
        day,
        hours: record.work_hours,
        clockIn: record.clock_in,
        clockOut: record.clock_out,
        type: record.work_type
      });
    });

    return breakdown.sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * 52시간 경고 체크
   */
  check52HoursWarning(employeeId, date) {
    const weekStart = Utils.getWeekStart(new Date(date));
    const weekly = this.getWeeklyHours(employeeId, weekStart);

    const employee = db.getById('employees', employeeId);
    if (!employee) return;

    if (weekly.check.status === 'danger') {
      // 52시간 초과
      Utils.showError(
        `🚨 ${employee.name}님 주 52시간 초과! (${weekly.totalHours}시간)\n즉시 조치가 필요합니다.`
      );

      // 경고 기록 추가
      db.add('warnings', {
        employee_id: employeeId,
        warning_type: '52시간 초과',
        description: `주 ${weekly.totalHours}시간 근무`,
        severity: 5,
        issued_date: new Date().toISOString(),
        resolved: false
      });

    } else if (weekly.check.status === 'critical') {
      // 52시간 임박
      Utils.showError(
        `⚠️ ${employee.name}님 52시간 임박! (${weekly.totalHours}시간)\n연장근로 중단을 권장합니다.`
      );

    } else if (weekly.check.status === 'warning') {
      // 40시간 초과
      console.log(`ℹ️ ${employee.name}님 연장근로 중 (${weekly.totalHours}시간)`);
    }
  },

  /**
   * 월간 통계
   */
  getMonthlyStats(employeeId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = db.find('attendance', a => {
      const recordDate = new Date(a.date);
      return a.employee_id === employeeId &&
             recordDate >= startDate &&
             recordDate <= endDate;
    });

    const totalDays = attendance.length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.work_hours || 0), 0);
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0;

    // 지각 체크
    const lateCount = attendance.filter(a => {
      if (!a.clock_in) return false;
      const clockIn = new Date(`2000-01-01 ${a.clock_in}`);
      const standard = new Date(`2000-01-01 09:00`);
      return clockIn > standard;
    }).length;

    // 주말 근무
    const weekendCount = attendance.filter(a => a.work_type === '주말').length;

    return {
      year,
      month,
      totalDays,
      totalHours: Math.round(totalHours * 10) / 10,
      avgHours: Math.round(avgHours * 10) / 10,
      lateCount,
      weekendCount,
      records: attendance
    };
  },

  /**
   * 전체 직원 주간 근무시간
   */
  getAllWeeklyHours(weekStartDate) {
    const employees = db.find('employees', e => e.status === 'active');
    const weekStart = weekStartDate ? new Date(weekStartDate) : Utils.getWeekStart();

    return employees.map(emp => {
      const weekly = this.getWeeklyHours(emp.id, weekStart);
      return {
        employee: emp,
        ...weekly
      };
    }).sort((a, b) => b.totalHours - a.totalHours);
  },

  /**
   * 52시간 위반자 찾기
   */
  find52HoursViolators(weekStartDate) {
    const all = this.getAllWeeklyHours(weekStartDate);
    return all.filter(data => data.check.status === 'danger' || data.check.status === 'critical');
  },

  /**
   * 엑셀 데이터 생성 (CSV)
   */
  exportToCSV(employeeId, startDate, endDate) {
    const attendance = db.find('attendance', a => {
      const recordDate = new Date(a.date);
      return a.employee_id === employeeId &&
             recordDate >= new Date(startDate) &&
             recordDate <= new Date(endDate);
    });

    const employee = db.getById('employees', employeeId);
    const csv = this.generateCSV(attendance, employee);
    const filename = `근태기록_${employee.name}_${startDate}_${endDate}.csv`;

    Utils.downloadFile(csv, filename, 'text/csv; charset=utf-8');
    Utils.showSuccess('근태 기록이 다운로드되었습니다.');
  },

  /**
   * CSV 생성
   */
  generateCSV(attendance, employee) {
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `직원명,날짜,요일,출근,퇴근,근무시간,유형,비고\n`;

    attendance.forEach(record => {
      csv += `${employee.name},`;
      csv += `${Utils.formatDate(record.date)},`;
      csv += `${Utils.getDayOfWeek(record.date)},`;
      csv += `${record.clock_in || ''},`;
      csv += `${record.clock_out || ''},`;
      csv += `${record.work_hours || 0},`;
      csv += `${record.work_type},`;
      csv += `${record.notes || ''}\n`;
    });

    return csv;
  },

  /**
   * 지각 체크
   */
  isLate(clockIn) {
    if (!clockIn) return false;
    const time = new Date(`2000-01-01 ${clockIn}`);
    const standard = new Date(`2000-01-01 09:00`);
    return time > standard;
  },

  /**
   * 대시보드 요약
   */
  getDashboardSummary() {
    const weekStart = Utils.getWeekStart();
    const all = this.getAllWeeklyHours(weekStart);
    const violators = this.find52HoursViolators(weekStart);

    // 전체 평균
    const avgHours = all.reduce((sum, data) => sum + data.totalHours, 0) / (all.length || 1);

    return {
      weekStart: Utils.formatDate(weekStart),
      totalEmployees: all.length,
      avgHours: Math.round(avgHours * 10) / 10,
      violators: violators.length,
      violatorDetails: violators,
      allStats: all
    };
  },

  /**
   * 자동 입력 (테스트용)
   */
  addSampleData(employeeId, days = 5) {
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 주말 제외
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const clockIn = '09:00';
      const clockOut = `${18 + Math.floor(Math.random() * 3)}:00`;

      this.add(
        employeeId,
        Utils.formatDate(date),
        clockIn,
        clockOut
      );
    }

    Utils.showSuccess('샘플 근태 데이터가 추가되었습니다.');
  }
};

window.AttendanceManager = AttendanceManager;
