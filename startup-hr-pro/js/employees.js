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
  },

  // ===== 고급 기능 =====

  /**
   * 고급 검색 및 필터링
   */
  advancedSearch(filters) {
    let employees = this.getAll();

    // 키워드 검색
    if (filters.keyword) {
      const lower = filters.keyword.toLowerCase();
      employees = employees.filter(e =>
        e.name.toLowerCase().includes(lower) ||
        e.email.toLowerCase().includes(lower) ||
        e.position.toLowerCase().includes(lower) ||
        e.phone.toLowerCase().includes(lower)
      );
    }

    // 상태 필터
    if (filters.status && filters.status !== 'all') {
      employees = employees.filter(e => e.status === filters.status);
    }

    // 계약 타입 필터
    if (filters.contractType && filters.contractType !== 'all') {
      employees = employees.filter(e => e.contract_type === filters.contractType);
    }

    // 직책 필터
    if (filters.position && filters.position !== 'all') {
      employees = employees.filter(e => e.position === filters.position);
    }

    // 입사일 범위
    if (filters.hireDateFrom) {
      employees = employees.filter(e =>
        new Date(e.hire_date) >= new Date(filters.hireDateFrom)
      );
    }

    if (filters.hireDateTo) {
      employees = employees.filter(e =>
        new Date(e.hire_date) <= new Date(filters.hireDateTo)
      );
    }

    // 리스크 필터
    if (filters.riskLevel && filters.riskLevel !== 'all') {
      const riskyEmployees = this.getRiskyEmployees();
      const riskyIds = riskyEmployees
        .filter(r => {
          if (filters.riskLevel === 'high') return r.riskScore >= 60;
          if (filters.riskLevel === 'medium') return r.riskScore >= 30 && r.riskScore < 60;
          if (filters.riskLevel === 'low') return r.riskScore < 30;
          return true;
        })
        .map(r => r.employee.id);

      employees = employees.filter(e => riskyIds.includes(e.id));
    }

    // 정렬
    if (filters.sortBy) {
      employees = this.sortEmployees(employees, filters.sortBy, filters.sortOrder || 'asc');
    }

    return employees;
  },

  /**
   * 직원 정렬
   */
  sortEmployees(employees, sortBy, order = 'asc') {
    const sorted = [...employees].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'hire_date':
          aVal = new Date(a.hire_date);
          bVal = new Date(b.hire_date);
          break;
        case 'position':
          aVal = a.position;
          bVal = b.position;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  },

  /**
   * 고유 값 추출 (필터용)
   */
  getUniqueValues(field) {
    const employees = this.getAll();
    const values = new Set(employees.map(e => e[field]).filter(Boolean));
    return Array.from(values).sort();
  },

  /**
   * 일괄 삭제
   */
  bulkDelete(ids) {
    if (!Utils.confirm(`${ids.length}명의 직원을 삭제하시겠습니까?`)) {
      return false;
    }

    let successCount = 0;
    ids.forEach(id => {
      if (db.delete('employees', id)) {
        successCount++;
      }
    });

    Utils.showSuccess(`${successCount}명의 직원이 삭제되었습니다.`);
    return successCount;
  },

  /**
   * 일괄 상태 변경
   */
  bulkUpdateStatus(ids, status) {
    let successCount = 0;
    ids.forEach(id => {
      if (db.update('employees', id, { status })) {
        successCount++;
      }
    });

    Utils.showSuccess(`${successCount}명의 상태가 업데이트되었습니다.`);
    return successCount;
  },

  /**
   * CSV 내보내기
   */
  exportToCSV(employees = null) {
    const data = employees || this.getAll();

    if (data.length === 0) {
      Utils.showError('내보낼 데이터가 없습니다.');
      return;
    }

    // CSV 헤더
    const headers = ['이름', '이메일', '전화번호', '직책', '입사일', '계약타입', '상태'];
    const rows = data.map(e => [
      e.name,
      e.email,
      e.phone,
      e.position,
      e.hire_date,
      e.contract_type,
      e.status
    ]);

    // CSV 생성
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // UTF-8 BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const filename = `employees-${Utils.formatDate(new Date(), 'YYYY-MM-DD')}.csv`;

    Utils.downloadFile(BOM + csv, filename, 'text/csv;charset=utf-8;');

    NotificationCenter.add({
      title: '직원 데이터 내보내기 완료',
      description: `${data.length}명의 직원 정보가 ${filename}로 저장되었습니다.`,
      type: 'success'
    });
  },

  /**
   * CSV 가져오기
   */
  importFromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());

          if (lines.length < 2) {
            reject('CSV 파일이 비어있습니다.');
            return;
          }

          // 헤더 제거
          const dataLines = lines.slice(1);
          let successCount = 0;

          dataLines.forEach(line => {
            const values = line.split(',').map(v => v.trim());

            if (values.length >= 6) {
              const employeeData = {
                name: values[0],
                email: values[1],
                phone: values[2],
                position: values[3],
                hire_date: values[4],
                contract_type: values[5]
              };

              try {
                this.add(employeeData);
                successCount++;
              } catch (error) {
                console.error('직원 추가 실패:', employeeData, error);
              }
            }
          });

          Utils.showSuccess(`${successCount}명의 직원이 추가되었습니다.`);
          resolve(successCount);
        } catch (error) {
          console.error('CSV 파싱 실패:', error);
          reject('CSV 파일 읽기 중 오류가 발생했습니다.');
        }
      };

      reader.onerror = () => {
        reject('파일 읽기 중 오류가 발생했습니다.');
      };

      reader.readAsText(file);
    });
  },

  /**
   * 저장된 검색 관리
   */
  savedSearches: {
    getAll() {
      const saved = localStorage.getItem('saved_searches');
      return saved ? JSON.parse(saved) : [];
    },

    save(name, filters) {
      const searches = this.getAll();
      searches.push({
        id: Utils.randomId(),
        name,
        filters,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('saved_searches', JSON.stringify(searches));
      Utils.showSuccess(`검색 조건 "${name}"이 저장되었습니다.`);
    },

    delete(id) {
      const searches = this.getAll().filter(s => s.id !== id);
      localStorage.setItem('saved_searches', JSON.stringify(searches));
      Utils.showSuccess('저장된 검색이 삭제되었습니다.');
    },

    apply(id) {
      const searches = this.getAll();
      const search = searches.find(s => s.id === id);
      return search ? search.filters : null;
    }
  },

  /**
   * 프로필 사진 일괄 업로드
   */
  bulkUploadPhotos(files) {
    // files는 {employeeId: file} 형식의 객체
    const promises = Object.entries(files).map(([id, file]) => {
      return PhotoManager.uploadPhoto(file, id, 'employee');
    });

    return Promise.all(promises)
      .then(() => {
        Utils.showSuccess('사진이 모두 업로드되었습니다.');
      })
      .catch((error) => {
        Utils.showError('일부 사진 업로드에 실패했습니다.');
      });
  }
};

window.EmployeeManager = EmployeeManager;
