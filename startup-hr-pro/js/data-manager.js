/**
 * StartupHR Pro - Data Manager
 * LocalStorage 기반 데이터 관리 시스템
 */

class DataManager {
  constructor() {
    this.storagePrefix = 'startuphr_';
    this.initializeStorage();
  }

  /**
   * 초기 데이터 구조 설정
   */
  initializeStorage() {
    const tables = [
      'employees',
      'contracts',
      'attendance',
      'education_support',
      'warnings',
      'communications',
      'conversations',
      'legal_checks',
      'daily_checklists',
      'case_studies',
      'settings'
    ];

    tables.forEach(table => {
      if (!this.getAll(table)) {
        this.setTable(table, []);
      }
    });

    // 샘플 데이터 초기화 (첫 실행 시)
    if (this.getAll('employees').length === 0) {
      this.loadSampleData();
    }
  }

  /**
   * 테이블 키 생성
   */
  getKey(table) {
    return `${this.storagePrefix}${table}`;
  }

  /**
   * 전체 데이터 조회
   */
  getAll(table) {
    const data = localStorage.getItem(this.getKey(table));
    return data ? JSON.parse(data) : null;
  }

  /**
   * 테이블 설정
   */
  setTable(table, data) {
    localStorage.setItem(this.getKey(table), JSON.stringify(data));
  }

  /**
   * ID로 단일 항목 조회
   */
  getById(table, id) {
    const data = this.getAll(table);
    return data.find(item => item.id === id);
  }

  /**
   * 조건으로 검색
   */
  find(table, predicate) {
    const data = this.getAll(table);
    return data.filter(predicate);
  }

  /**
   * 항목 추가
   */
  add(table, item) {
    const data = this.getAll(table);
    const newItem = {
      ...item,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    data.push(newItem);
    this.setTable(table, data);
    return newItem;
  }

  /**
   * 항목 업데이트
   */
  update(table, id, updates) {
    const data = this.getAll(table);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.setTable(table, data);
      return data[index];
    }
    return null;
  }

  /**
   * 항목 삭제
   */
  delete(table, id) {
    const data = this.getAll(table);
    const filtered = data.filter(item => item.id !== id);
    this.setTable(table, filtered);
    return filtered.length < data.length;
  }

  /**
   * 고유 ID 생성
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 전체 데이터 내보내기 (백업)
   */
  exportAll() {
    const allData = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        const tableName = key.replace(this.storagePrefix, '');
        allData[tableName] = JSON.parse(localStorage.getItem(key));
      }
    });
    return allData;
  }

  /**
   * 데이터 가져오기 (복원)
   */
  importAll(data) {
    Object.keys(data).forEach(table => {
      this.setTable(table, data[table]);
    });
  }

  /**
   * 전체 데이터 초기화
   */
  clearAll() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
    this.initializeStorage();
  }

  /**
   * 샘플 데이터 로드
   */
  loadSampleData() {
    // 샘플 직원 데이터
    const sampleEmployees = [
      {
        name: '김승용',
        email: 'seungyong@example.com',
        phone: '010-1234-5678',
        hire_date: '2026-01-01',
        position: '현장 관리',
        status: 'active',
        contract_type: '정규직'
      },
      {
        name: '이광민',
        email: 'gwangmin@example.com',
        phone: '010-2345-6789',
        hire_date: '2025-08-15',
        position: 'BIM 설계',
        status: 'active',
        contract_type: '계약직'
      },
      {
        name: '박현서',
        email: 'hyunseo@example.com',
        phone: '010-3456-7890',
        hire_date: '2025-11-01',
        position: '프로젝트 매니저',
        status: 'active',
        contract_type: '정규직'
      }
    ];

    sampleEmployees.forEach(emp => this.add('employees', emp));

    // 샘플 케이스 스터디
    const caseStudy = {
      title: '초기 열정 → 급격한 의욕 저하 케이스',
      category: '퇴사',
      warning_signs: [
        '초기 과도한 약속',
        '이중 잣대 (돈 필요할 때 vs 불필요할 때)',
        '소통 회피',
        '책임 전가',
        '극단적 제안'
      ],
      올바른대응: [
        '초기: 과도한 약속 받지 않기',
        '중기: 모든 조건 변경 서면화',
        '신호 감지: 3회 소통 회피 시 경고',
        '감정 소모전: 10분 넘어가면 종료',
        '환불 제안: 거절 후 깔끔하게 정리'
      ],
      outcome: '조기 정리 권장, 3개월 끌지 말 것'
    };

    this.add('case_studies', caseStudy);

    console.log('✅ 샘플 데이터 로드 완료');
  }
}

// 전역 인스턴스 생성
const db = new DataManager();
