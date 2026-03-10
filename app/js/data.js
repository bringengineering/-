// ===== BRING ENGINEERING — DATA LAYER =====
// All data persisted in localStorage

const STORAGE_KEY = 'bring_eng_data';

const DEFAULT_DATA = {
  company: {
    name: '브링엔지니어링',
    ceo: '서창환',
    founded: '2025-01-01',
    fiscalStart: 3,
    mission: '물리적 인프라의 보이지 않는 위험을, 기술로 가시화하여 사람을 지킨다',
    vision: '2030년, 대한민국 인프라 안전 진단 분야의 기술 표준을 만드는 기업'
  },

  financial: {
    months: [
      { month: '2026-03', income: { govProject: 2000, additionalGov: 0, sales: 0, other: 0 }, expense: { salary: 400, cloud: 30, equipment: 200, travel: 20, office: 50, outsource: 0, misc: 50 }, openingBalance: 500 },
      { month: '2026-04', income: { govProject: 800, additionalGov: 0, sales: 0, other: 0 }, expense: { salary: 600, cloud: 50, equipment: 50, travel: 30, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2026-05', income: { govProject: 800, additionalGov: 0, sales: 0, other: 0 }, expense: { salary: 600, cloud: 50, equipment: 30, travel: 30, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2026-06', income: { govProject: 800, additionalGov: 500, sales: 0, other: 0 }, expense: { salary: 600, cloud: 50, equipment: 30, travel: 30, office: 50, outsource: 200, misc: 50 }, openingBalance: null },
      { month: '2026-07', income: { govProject: 800, additionalGov: 500, sales: 0, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 50, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2026-08', income: { govProject: 800, additionalGov: 500, sales: 500, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 30, office: 50, outsource: 200, misc: 50 }, openingBalance: null },
      { month: '2026-09', income: { govProject: 800, additionalGov: 500, sales: 0, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 50, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2026-10', income: { govProject: 800, additionalGov: 500, sales: 500, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 30, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2026-11', income: { govProject: 800, additionalGov: 500, sales: 0, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 30, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2026-12', income: { govProject: 800, additionalGov: 500, sales: 0, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 20, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2027-01', income: { govProject: 0, additionalGov: 0, sales: 0, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 20, office: 50, outsource: 0, misc: 50 }, openingBalance: null },
      { month: '2027-02', income: { govProject: 0, additionalGov: 0, sales: 0, other: 0 }, expense: { salary: 600, cloud: 80, equipment: 30, travel: 20, office: 50, outsource: 0, misc: 50 }, openingBalance: null }
    ],
    govBudgets: [
      { name: '청년창업사관학교', totalBudget: 10000, spent: 750, period: '2026.03 ~ 2026.12' }
    ]
  },

  okrs: {
    currentQuarter: '2026-Q2',
    quarters: {
      '2026-Q2': {
        objectives: [
          {
            id: 'o1', title: 'VisiScan 첫 유료 계약 체결', owner: '서창환',
            keyResults: [
              { id: 'kr1', title: '파일럿 테스트 2건 완료', target: 2, current: 0, unit: '건' },
              { id: 'kr2', title: '제안서 3곳 이상 발송', target: 3, current: 0, unit: '곳' },
              { id: 'kr3', title: '유료 계약 1건 이상 체결', target: 1, current: 0, unit: '건' }
            ]
          },
          {
            id: 'o2', title: 'Shadow AI 기술 고도화 (TRL 5→7)', owner: '배정환',
            keyResults: [
              { id: 'kr4', title: '터널 조도 측정 정확도 95%+', target: 95, current: 72, unit: '%' },
              { id: 'kr5', title: '실시간 처리 속도 1초 이내', target: 1, current: 3.2, unit: '초', inverse: true },
              { id: 'kr6', title: '실제 터널 현장 테스트 1회', target: 1, current: 0, unit: '회' }
            ]
          },
          {
            id: 'o3', title: '정부지원사업 2건 이상 선정', owner: '서창환',
            keyResults: [
              { id: 'kr7', title: '지원사업 3건 이상 지원', target: 3, current: 1, unit: '건' },
              { id: 'kr8', title: '2건 이상 선정', target: 2, current: 1, unit: '건' },
              { id: 'kr9', title: '기 수행 과제 중간 점검 통과', target: 1, current: 0, unit: '건' }
            ]
          },
          {
            id: 'o4', title: '팀 운영 체계 안착', owner: '서창환',
            keyResults: [
              { id: 'kr10', title: '주간 킥오프/리뷰 8주 연속 실행', target: 8, current: 1, unit: '주' },
              { id: 'kr11', title: '팀원 온보딩 완료', target: 3, current: 0, unit: '명' },
              { id: 'kr12', title: '월간 경영 대시보드 3회 작성', target: 3, current: 0, unit: '회' }
            ]
          }
        ],
        weeklyCheckins: []
      }
    }
  },

  team: {
    members: [
      {
        id: 'm1', name: '서창환', role: '대표 / 경영총괄', avatar: '서',
        skills: { leadership: 4, business: 4, technical: 2, communication: 4, problemSolving: 4 },
        level: 4, joinDate: '2025-01-01', satisfaction: 4,
        okrScore: 0, routineScore: 80
      },
      {
        id: 'm2', name: '노광민', role: 'SW Developer', avatar: '노',
        skills: { leadership: 2, business: 1, technical: 3, communication: 3, problemSolving: 3 },
        level: 2, joinDate: '2026-03-09', satisfaction: 4,
        okrScore: 0, routineScore: 0
      },
      {
        id: 'm3', name: '배정환', role: 'AI Developer', avatar: '배',
        skills: { leadership: 2, business: 1, technical: 3, communication: 3, problemSolving: 3 },
        level: 2, joinDate: '2026-03-09', satisfaction: 4,
        okrScore: 0, routineScore: 0
      },
      {
        id: 'm4', name: '김현서', role: '(역할 확인 필요)', avatar: '김',
        skills: { leadership: 2, business: 2, technical: 2, communication: 3, problemSolving: 2 },
        level: 1, joinDate: '2026-03-09', satisfaction: 4,
        okrScore: 0, routineScore: 0
      }
    ],
    satisfactionHistory: [
      { month: '2026-03', score: 4.0 }
    ],
    routines: {
      dailyStandup: { name: '데일리 스탠드업', weeks: [true, false, false, false, false, false, false, false] },
      weeklyKickoff: { name: '주간 킥오프 (월)', weeks: [true, false, false, false, false, false, false, false] },
      weeklyReview: { name: '주간 리뷰 (금)', weeks: [true, false, false, false, false, false, false, false] },
      techSync: { name: '기술 싱크 (격주)', weeks: [false, false, false, false, false, false, false, false] },
      monthlyReview: { name: '월간 경영 리뷰', weeks: [false, false, false, false, false, false, false, false] },
      oneOnOne: { name: '1:1 체크인', weeks: [false, false, false, false, false, false, false, false] }
    }
  },

  projects: [
    {
      id: 'p1', name: 'Shadow AI', description: '터널 조도 AI 분석 솔루션',
      currentTRL: 5, targetTRL: 7, priority: 3,
      milestones: [
        { title: 'AI 모델 v2.0', status: 'in-progress', dueDate: '2026-04-30' },
        { title: '실시간 추론 최적화', status: 'pending', dueDate: '2026-06-30' },
        { title: '현장 1차 테스트', status: 'pending', dueDate: '2026-08-31' },
        { title: '정확도 95% 달성', status: 'pending', dueDate: '2026-10-31' },
        { title: 'TRL 7 달성', status: 'pending', dueDate: '2026-12-31' }
      ],
      techDebt: { high: 0, medium: 1, low: 2 }
    },
    {
      id: 'p2', name: 'VisiScan', description: '인프라 가시성 측정 서비스',
      currentTRL: 4, targetTRL: 6, priority: 3,
      milestones: [
        { title: 'API 서버 v1.0', status: 'in-progress', dueDate: '2026-04-30' },
        { title: '시제품 완성', status: 'pending', dueDate: '2026-06-30' },
        { title: '파일럿 서비스 1건', status: 'pending', dueDate: '2026-08-31' },
        { title: '서비스 v2.0', status: 'pending', dueDate: '2026-10-31' },
        { title: 'SaaS 런칭 준비', status: 'pending', dueDate: '2026-12-31' }
      ],
      techDebt: { high: 0, medium: 0, low: 1 }
    },
    {
      id: 'p3', name: 'Lux-Guard', description: '눈부심 저감 하드웨어',
      currentTRL: 3, targetTRL: 5, priority: 2,
      milestones: [
        { title: '하드웨어 프로토타입', status: 'pending', dueDate: '2026-06-30' },
        { title: '현장 테스트', status: 'pending', dueDate: '2026-09-30' },
        { title: 'TRL 5 달성', status: 'pending', dueDate: '2026-12-31' }
      ],
      techDebt: { high: 0, medium: 0, low: 0 }
    },
    {
      id: 'p4', name: 'FDInnovation', description: 'IoT 제설/세척 보도블록',
      currentTRL: 3, targetTRL: 5, priority: 1,
      milestones: [
        { title: '3D 시뮬레이션', status: 'in-progress', dueDate: '2026-05-31' },
        { title: '실물 보도블록 제작', status: 'pending', dueDate: '2026-08-31' },
        { title: 'IoT 센서 통합', status: 'pending', dueDate: '2026-10-31' },
        { title: 'TRL 5 달성', status: 'pending', dueDate: '2026-12-31' }
      ],
      techDebt: { high: 0, medium: 0, low: 0 }
    }
  ],

  pipeline: {
    stages: ['리드 발굴', '접촉/미팅', '니즈 파악', '제안서', '협상', '계약', '납품'],
    deals: [
      { id: 'd1', name: '한국도로공사 (강원)', product: 'VisiScan', stage: 0, amount: 3000, expectedDate: '2026-Q3', note: '터널 조도 측정' },
      { id: 'd2', name: '강원도청', product: 'VisiScan', stage: 0, amount: 2000, expectedDate: '2026-Q3', note: '도로 안전 진단' },
      { id: 'd3', name: '원주시', product: 'VisiScan', stage: 0, amount: 1500, expectedDate: '2026-Q3', note: '시범 사업' },
      { id: 'd4', name: '진주시', product: 'Shadow AI', stage: 0, amount: 2000, expectedDate: '2026-Q4', note: '' },
      { id: 'd5', name: '상지대학교', product: '공동연구', stage: 1, amount: 500, expectedDate: '2026-Q2', note: '산학협력' }
    ]
  },

  risks: [
    { id: 'r1', category: '재무', title: '캐시플로우 고갈', impact: 5, probability: 3, mitigation: '월간 모니터링, 런웨이 3개월 이상 유지', status: 'active', owner: '서창환' },
    { id: 'r2', category: '인력', title: '핵심 인력 이탈', impact: 5, probability: 3, mitigation: '동기부여 체계, 지식 문서화, 인수인계 프로토콜', status: 'active', owner: '서창환' },
    { id: 'r3', category: '인력', title: '번아웃', impact: 3, probability: 4, mitigation: '코어타임제, 휴식 보장, 업무량 모니터링', status: 'active', owner: '서창환' },
    { id: 'r4', category: '기술', title: '핵심 기술 개발 실패', impact: 5, probability: 2, mitigation: 'TRL 단계적 검증, 피봇 가능 구조', status: 'active', owner: '배정환' },
    { id: 'r5', category: '기술', title: '기술 부채 누적', impact: 3, probability: 4, mitigation: '격주 기술 리뷰, 리팩토링 시간 확보', status: 'active', owner: '노광민' },
    { id: 'r6', category: '사업', title: '첫 매출 미발생 (연내)', impact: 4, probability: 3, mitigation: '영업 파이프라인 확대, 파일럿 적극 제안', status: 'active', owner: '서창환' },
    { id: 'r7', category: '재무', title: '정부과제 탈락/중단', impact: 5, probability: 2, mitigation: '다수 과제 지원으로 분산', status: 'active', owner: '서창환' },
    { id: 'r8', category: '기술', title: '데이터 유출/보안 사고', impact: 4, probability: 2, mitigation: '보안 가이드, 접근 권한 관리', status: 'active', owner: '노광민' },
    { id: 'r9', category: '인력', title: '팀 갈등/분열', impact: 4, probability: 2, mitigation: '정기 1:1, 갈등 해결 프로토콜', status: 'active', owner: '서창환' },
    { id: 'r10', category: '사업', title: '경쟁사 시장 선점', impact: 3, probability: 2, mitigation: '차별화 강화, 속도 우선', status: 'monitoring', owner: '서창환' }
  ],

  activityLog: [
    { time: '2026-03-10 15:00', icon: '🏗️', text: '경영관리 시스템 구축 시작', type: 'info' },
    { time: '2026-03-10 15:30', icon: '📄', text: '운영체계 문서 35개 작성 완료', type: 'success' },
    { time: '2026-03-10 10:00', icon: '👥', text: '노광민, 배정환 준비 계획 수립', type: 'info' },
    { time: '2026-03-09 14:00', icon: '🎯', text: 'Q2 OKR 초안 설정', type: 'info' },
    { time: '2026-03-09 10:00', icon: '💰', text: '청년창업사관학교 1차 입금 확인', type: 'success' }
  ],

  settings: {
    alertRunway: true,
    alertOKR: true,
    alertRisk: true
  }
};

// Data Manager
const DataManager = {
  _data: null,

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this._data = JSON.parse(stored);
        // Merge missing fields from defaults
        this._data = this._deepMerge(DEFAULT_DATA, this._data);
      } else {
        this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
    } catch (e) {
      console.error('Data load error:', e);
      this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    return this._data;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.error('Data save error:', e);
    }
  },

  get() {
    if (!this._data) this.load();
    return this._data;
  },

  reset() {
    this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save();
  },

  export() {
    return JSON.stringify(this._data, null, 2);
  },

  import(data) {
    try {
      this._data = typeof data === 'string' ? JSON.parse(data) : data;
      this.save();
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },

  addActivity(icon, text, type = 'info') {
    const now = new Date();
    const time = now.toISOString().slice(0, 16).replace('T', ' ');
    this._data.activityLog.unshift({ time, icon, text, type });
    if (this._data.activityLog.length > 50) this._data.activityLog.pop();
    this.save();
  },

  _deepMerge(defaults, overrides) {
    const result = { ...defaults };
    for (const key in overrides) {
      if (overrides[key] && typeof overrides[key] === 'object' && !Array.isArray(overrides[key]) && defaults[key]) {
        result[key] = this._deepMerge(defaults[key], overrides[key]);
      } else {
        result[key] = overrides[key];
      }
    }
    return result;
  }
};
