// ===== BRING ENGINEERING — DATA LAYER =====
// All data persisted in localStorage

const STORAGE_KEY = 'bring_eng_data';

const DEFAULT_DATA = {
  company: {
    name: '브링엔지니어링',
    ceo: '서창환',
    founded: '2025-01-01',
    fiscalStart: 3,
    mission: '물리 인프라의 보이지 않는 위험을 기술로 가시화하여,\n도로 위의 모든 사람이 안전하게 귀가하는 세상을 만든다.',
    vision: '2030년, 대한민국 인프라 안전 진단 분야의 기술 표준을 만드는 기업',
    visionSteps: [
      { year: '2026', goal: 'VisiScan 첫 유료계약 체결, 내부 운영체계 가동', keyword: '생존 확인' },
      { year: '2027', goal: 'B2G 레퍼런스 5건, Shadow AI v2 출시, 매출 3억', keyword: '시장 진입' },
      { year: '2028', goal: 'KOLAS 인증 획득, 정기 모니터링 고객 10건', keyword: '신뢰 확보' },
      { year: '2030', goal: '국내 터널 시인성 측정 점유율 20%, 해외 PoC 착수', keyword: '시장 선도' },
      { year: '2035', goal: '물리 인프라 AI 진단 플랫폼 기업, 매출 100억+', keyword: '플랫폼 완성' }
    ],
    coreValues: [
      { name: '정직한 측정', definition: '데이터는 조작하지 않는다. 결과가 나쁘면 나쁜 대로 보고한다.', reason: '기술적 정직성이 곧 시장 신뢰이자 B2G 사업의 근간', rule: '측정 결과 임의 수정 금지 / SOP 미준수 측정 불인정' },
      { name: '즉시 공유', definition: '문제는 발견 즉시 공유한다. 혼자 안고 있지 않는다.', reason: '소규모 팀에서 정보 비대칭은 치명적 리스크', rule: '이슈 발생 30분 내 슬랙 공유 / 주간보고에 반드시 포함' },
      { name: '작게, 빠르게', definition: '완벽하게 준비하기보다 작은 단위로 실행하고 검증한다.', reason: '스타트업 생존의 핵심은 속도. 실패해도 빨리 실패하기', rule: 'MVP 우선 접근 / 2주 단위 스프린트' },
      { name: '배움의 의무', definition: '모르는 것을 모른다고 말하고, 매주 한 가지는 새로 배운다.', reason: '기술 기업에서 학습 정체는 곧 경쟁력 상실', rule: '주 4시간 자기개발 보장 / 월 1회 기술 공유' },
      { name: '팀이 먼저', definition: '개인 성과보다 팀 목표 달성이 우선이다. 동료의 성장을 돕는다.', reason: '3~5명 팀에서 한 명의 이탈은 전체 역량의 25~33% 손실', rule: '1:1 체크인 월 1회 / 역할 확장 트리거 제도' }
    ],
    behaviorRules: [
      { situation: '문제 발생 시', doThis: '즉시 슬랙에 공유 → 대응 방안 제시', dontThis: '혼자 해결하려고 시간 낭비' },
      { situation: '마감 못 지킬 때', doThis: 'D-3에 미리 보고 → 일정 재조정 제안', dontThis: '마감일 당일에 "못했습니다"' },
      { situation: '모르는 기술', doThis: '"모릅니다" 먼저 말하고 → 학습 계획 제출', dontThis: '아는 척 → 나중에 더 큰 문제' },
      { situation: '의견 충돌 시', doThis: '데이터·근거 기반으로 토론', dontThis: '감정적 대응, 뒷담화' },
      { situation: '외부 미팅 후', doThis: '당일 내 회의록 작성 → 슬랙 공유', dontThis: '기억에만 의존, 기록 누락' },
      { situation: '실수했을 때', doThis: '원인 분석 → 재발 방지책 공유', dontThis: '숨기기, 남 탓하기' }
    ]
  },

  // ===== 운영체계 (01_경영기반) =====
  operations: {
    rhythm: [
      { cycle: '매일 09:00', name: '데일리 스탠드업', purpose: '오늘 할 일 3가지, 어제 완료 사항, 블로커 공유 (토론 아님, 5분 초과 금지)', participants: '전원', duration: '5분', output: '슬랙 #standup 메시지', owner: '각자', tool: '슬랙' },
      { cycle: '매주 월 10:00', name: '주간 킥오프', purpose: '이번 주 OKR 기반 핵심 업무 확정, 지난 주 미완료 사항 이월 여부 결정', participants: '전원', duration: '30분', output: '주간 목표 확정서', owner: '대표', tool: '화상/대면' },
      { cycle: '매주 금 16:00', name: '주간 리뷰·보고', purpose: '주간 목표 대비 달성률 점검, KPI 수치 업데이트, 다음 주 예고', participants: '전원 → 대표', duration: '30분', output: '주간보고서(양식)', owner: '팀장급', tool: '노션/엑셀' },
      { cycle: '격주 수 14:00', name: '기술 싱크', purpose: '기술 이슈·아키텍처 토론, 코드 리뷰, 기술 부채 점검', participants: '기술팀', duration: '1시간', output: '기술 이슈 로그', owner: '기술 리드', tool: '화상/대면' },
      { cycle: '매월 첫째주 월', name: '월간 경영 리뷰', purpose: '월간 KPI 대시보드 점검, 재무 현황, 영업 파이프라인, 리스크 점검', participants: '대표+핵심', duration: '1시간', output: '경영 대시보드', owner: '대표', tool: '대면 필수' },
      { cycle: '매월', name: '1:1 체크인', purpose: '팀원 적응도·어려움·성장 가능성 확인 (업무 추적이 아닌 사람 중심 대화)', participants: '대표↔팀원', duration: '30분/명', output: '체크인 기록(양식)', owner: '대표', tool: '대면' },
      { cycle: '분기 첫째주', name: 'OKR 리뷰 & 재설정', purpose: '전 분기 OKR 점수(0~1.0) 평가, 다음 분기 O/KR 설정, 우선순위 재조정', participants: '전원', duration: '반나절', output: 'OKR 점수표+신규 OKR', owner: '대표', tool: '워크숍' },
      { cycle: '반기', name: '성과 평가', purpose: '개인별 OKR 달성률 + 핵심가치 체화도 평가, 역할 확장 트리거 점검, 보상 연동', participants: '대표', duration: '1일', output: '개인 평가서', owner: '대표', tool: '면담' },
      { cycle: '연 1회 (12월)', name: '전략 워크숍', purpose: '연간 회고 + 차년도 전략 수립, 비전 재확인, 신규 OKR 방향 설정', participants: '전원', duration: '1~2일', output: '연간 사업계획', owner: '대표', tool: '오프사이트' }
    ],
    decisionFramework: [
      { level: 'L1', name: '자율 실행', criteria: '본인 업무 범위 내, 비용 0원, 타인 영향 없음', decider: '담당자 본인', report: '보고 불필요 (주간보고에 포함)', examples: '코드 구조 변경, 문서 작성, 개인 학습 주제 선택', time: '즉시' },
      { level: 'L2', name: '공유 후 실행', criteria: '본인 업무 범위 내, 다른 팀원 1명 이상 영향', decider: '담당자 → 관련자 공유', report: '관련자 공유 (반대 없으면 실행)', examples: 'API 인터페이스 변경, 공유 문서 구조 수정, 일정 1~2일 조정', time: '공유 후 24시간' },
      { level: 'L3', name: '합의 결정', criteria: '2명 이상 영향, 비용 50만 원 미만', decider: '관련자 합의 → 대표 보고', report: '대표 보고 (거부권 보유)', examples: '외주 발주 (50만원 미만), 장비·소프트웨어 구매, 회의 일정 변경', time: '48시간 이내' },
      { level: 'L4', name: '대표 승인', criteria: '비용 50만 원 이상, 대외 계약, 채용, 전략 변경', decider: '대표 최종 승인', report: '이사회/자문단 (해당 시)', examples: '채용·해고 결정, 계약 체결·변경, 투자·대출 결정, 사업 방향 전환', time: '대표 판단' }
    ],
    raciMatrix: [
      { area: '전략·방향', task: '사업 방향 결정', ceo: 'R/A', techLead: 'C', planner: 'I', level: 'L4' },
      { area: '전략·방향', task: 'OKR 설정', ceo: 'A', techLead: 'R', planner: 'R', level: 'L3' },
      { area: '전략·방향', task: '지원사업 신청', ceo: 'A', techLead: 'R', planner: 'R', level: 'L4' },
      { area: '기술·개발', task: '아키텍처 설계', ceo: 'C', techLead: 'R/A', planner: 'I', level: 'L2' },
      { area: '기술·개발', task: '코드 리뷰·배포', ceo: 'I', techLead: 'R/A', planner: 'I', level: 'L1~L2' },
      { area: '기술·개발', task: '외주 발주 (50만↓)', ceo: 'A', techLead: 'R', planner: 'C', level: 'L3' },
      { area: '기술·개발', task: '장비 구매', ceo: 'A', techLead: 'R', planner: 'C', level: 'L4' },
      { area: '영업·사업', task: '고객 접촉·미팅', ceo: 'R/A', techLead: 'C', planner: 'R', level: 'L2' },
      { area: '영업·사업', task: '계약 체결', ceo: 'R/A', techLead: 'C', planner: 'I', level: 'L4' },
      { area: '영업·사업', task: '제안서 작성', ceo: 'A', techLead: 'R', planner: 'R', level: 'L3' },
      { area: '인사·조직', task: '채용 결정', ceo: 'R/A', techLead: 'C', planner: 'C', level: 'L4' },
      { area: '인사·조직', task: '팀원 평가', ceo: 'R/A', techLead: 'C', planner: 'I', level: 'L4' },
      { area: '재무·행정', task: '예산 집행 (50만↓)', ceo: 'A', techLead: 'R', planner: 'R', level: 'L3' },
      { area: '재무·행정', task: '예산 집행 (50만↑)', ceo: 'R/A', techLead: 'C', planner: 'I', level: 'L4' },
      { area: '홍보·브랜드', task: 'SNS 콘텐츠 게시', ceo: 'C', techLead: 'I', planner: 'R/A', level: 'L2' },
      { area: '홍보·브랜드', task: '언론 보도 대응', ceo: 'R/A', techLead: 'C', planner: 'R', level: 'L4' }
    ],
    emergencyProcess: [
      { urgency: '🔴 즉시', examples: '서버 다운, 고객 클레임, 안전 사고', ceoContact: '즉시 연락 시도', proxy: '기술리드(기술) / 최고참(기타)', postReport: '결정 후 1시간 내' },
      { urgency: '🟡 당일', examples: '일정 변경, 외부 미팅 취소, 장비 고장', ceoContact: '당일 연락', proxy: '담당자 판단 후 실행', postReport: '당일 슬랙 보고' },
      { urgency: '🟢 차주', examples: '프로세스 개선, 문서 수정, 학습 계획', ceoContact: '주간보고 포함', proxy: '각자 실행', postReport: '주간보고에 포함' }
    ],
    commProtocol: [
      { channel: '슬랙 #general', usage: '전사 공지, 중요 알림', responseTime: '확인 이모지 필수', format: '단문, 핵심만', forbidden: '잡담, 개인 대화' },
      { channel: '슬랙 #standup', usage: '데일리 스탠드업', responseTime: '매일 09:00까지', format: '오늘 할 일/어제 완료/블로커', forbidden: '토론, 질문' },
      { channel: '슬랙 #project-*', usage: '프로젝트별 소통', responseTime: '4시간 이내', format: '이슈 기반', forbidden: '프로젝트 무관 내용' },
      { channel: '슬랙 DM', usage: '개인 간 빠른 확인', responseTime: '2시간 이내', format: '질문-답변', forbidden: '중요 결정 (기록 안 남음)' },
      { channel: '전화/통화', usage: '긴급 사항 only', responseTime: '즉시', format: '용건만', forbidden: '비긴급 사항' },
      { channel: '이메일', usage: '외부 소통, 공식 기록', responseTime: '24시간 이내', format: '공식 문서체', forbidden: '내부 소통 용도' },
      { channel: '노션/문서', usage: '체계적 기록·보고', responseTime: '작업 완료 시', format: '양식 준수', forbidden: '구두로만 전달' },
      { channel: '대면 미팅', usage: '복잡한 토론, 의사결정', responseTime: '스케줄 필요', format: '안건 사전 공유 필수', forbidden: '안건 없는 미팅' }
    ],
    escalation: [
      { priority: 'P1 (Critical)', definition: '서비스 중단, 고객 계약 위반, 안전 사고, 법적 리스크', channel: '전화 → 슬랙', deadline: '발생 즉시 (30분 내)', target: '대표 직보', followup: '1시간 내 대응 회의 소집' },
      { priority: 'P2 (High)', definition: '주요 마일스톤 지연, 핵심 장비 고장, 인력 이탈', channel: '슬랙 DM → 채널', deadline: '발생 2시간 이내', target: '대표 + 관련자', followup: '당일 내 대응 방안 수립' },
      { priority: 'P3 (Medium)', definition: '일정 소폭 지연, 품질 이슈, 외부 일정 변경', channel: '슬랙 프로젝트 채널', deadline: '발생 당일', target: '관련자 → 대표(주간보고)', followup: '주간 내 해결' },
      { priority: 'P4 (Low)', definition: '프로세스 개선 필요, 문서 업데이트 필요', channel: '주간보고 포함', deadline: '주간보고 시', target: '팀 전체', followup: '분기 내 반영' }
    ],
    orgStructure: {
      current: [
        { position: '대표이사/CEO', name: '서창환', rnr: '전략·의사결정·영업·재무, 외부 네트워킹·IR', projects: '전체 총괄', backup: '없음 ★위험', note: '핵심 병목' },
        { position: 'AI/데이터 엔지니어', name: '배정환', rnr: 'AI 모델 개발·데이터 파이프라인, LangGraph·Shadow AI 핵심 개발', projects: 'Shadow AI, VisiScan(AI)', backup: '노광민(일부)', note: '' },
        { position: 'SW 엔지니어', name: '노광민', rnr: 'SW 모듈 개발·외주 관리, 시스템 통합·테스트', projects: 'VisiScan(SW), Lux-Guard(SW)', backup: '배정환(일부)', note: '' },
        { position: '비즈니스 플래너', name: '김현서', rnr: '사업기획·제안서·홍보, 정부과제 서류·브랜드 관리', projects: '전체 사업지원', backup: '대표(일부)', note: '' }
      ],
      growthRoadmap: [
        { phase: 'Phase 0 (현재)', period: '2026.Q1', headcount: '4명', newRoles: '현행 유지', structure: '대표 직보 구조 (Flat)', trigger: '—' },
        { phase: 'Phase 1 (첫 매출)', period: '2026.Q3~', headcount: '5~6명', newRoles: '현장 측정 기사 1명, 영업 담당 1명', structure: '대표 직보 유지, 프로젝트 리드제 도입', trigger: 'VisiScan 첫 계약, 월 매출 500만↑' },
        { phase: 'Phase 2 (성장)', period: '2027~', headcount: '8~10명', newRoles: '기술리드(CTO급), PM 1명, 마케터 1명', structure: '2개 팀 분리 (기술팀/사업팀)', trigger: '계약 5건↑, 월 매출 2,000만↑' },
        { phase: 'Phase 3 (확장)', period: '2028~', headcount: '15~20명', newRoles: 'HR담당, 재무담당, 해외사업 담당', structure: '3개 본부 체제 (기술/사업/경영지원)', trigger: '연매출 5억↑, 해외 PoC 착수' },
        { phase: 'Phase 4 (안정)', period: '2030~', headcount: '30명+', newRoles: '각 본부 팀장, 법무, IR 담당', structure: '사업부제 (제품별 BU)', trigger: '연매출 20억↑, 제품 3개↑ 상용화' }
      ],
      keyPersonRisk: [
        { person: '대표 (서창환)', impact: '전략·의사결정·영업 마비, 회사 존속 위험', scope: '전 사업', currentMeasure: '의사결정 프레임워크 문서화, 운영 리듬 자동화', needed: '위임 범위 확대, No.2 육성', risk: '★★★' },
        { person: '배정환', impact: 'AI 핵심 기술 공백, Shadow AI 개발 중단', scope: 'Shadow AI, VisiScan AI', currentMeasure: '개인가이드북 작성, AI모듈마스터 문서화', needed: '코드 리뷰 의무화, 기술 문서화 강화', risk: '★★★' },
        { person: '노광민', impact: 'SW 시스템 공백, 외주 관리 중단', scope: 'VisiScan SW, Lux-Guard SW', currentMeasure: '개인가이드북 작성, SW모듈마스터 문서화', needed: '코드 리뷰 교차, 외주 연락처 공유', risk: '★★☆' },
        { person: '김현서', impact: '사업기획·홍보 공백, 정부과제 서류 지연', scope: '전체 사업지원', currentMeasure: '역할 가이드북 작성', needed: '제안서 템플릿 표준화, 대표 백업 체계', risk: '★★☆' }
      ]
    },
    meetingRules: [
      { rule: '안건 없으면 취소', detail: '회의 24시간 전까지 안건 공유 없으면 자동 취소', reason: '안건 없는 회의는 시간 낭비' },
      { rule: '시간 엄수', detail: '시작·종료 시간 칼같이 준수 (±0분)', reason: '스타트업의 시간은 자본' },
      { rule: '기록 필수', detail: '모든 회의는 회의록 작성 (담당: 막내 or 로테이션)', reason: '기록 없는 결정은 결정이 아님' },
      { rule: 'Action Item 명확화', detail: '"누가, 언제까지, 무엇을" 반드시 명시', reason: '모호한 결론은 실행 안 됨' },
      { rule: '발언 시간 배분', detail: '1인 5분 이내, 전체 토론 시간의 30%는 질문·피드백', reason: '특정인 독점 방지' }
    ]
  },

  // ===== 인사조직 체계 (02) =====
  hr: {
    onboarding: {
      phase1: { title: 'Phase 1: 첫 30일 — "이해하기"', items: [
        { period: 'Day 1~3', area: '환경 셋업', task: 'PC·계정·슬랙·노션·Git 세팅, 폴더 구조 이해', output: '환경 세팅 완료 체크리스트', mentor: '대표/멘토', done: false },
        { period: 'Day 1~3', area: '회사 이해', task: '미션·비전·핵심가치 선언문 읽기, 운영 리듬·커뮤니케이션 프로토콜 숙지', output: '핵심가치 1줄 소감 작성', mentor: '대표', done: false },
        { period: 'Week 1', area: '사업 이해', task: '4개 프로젝트 브리핑 (각 30분), 전략 포지셔닝·경쟁사 분석 읽기', output: '사업 이해도 퀴즈 (10문항)', mentor: '대표/플래너', done: false },
        { period: 'Week 1', area: '팀 이해', task: '팀원 전원 1:1 커피챗 (15분씩), 각자 R&R·현재 진행 업무 파악', output: '팀 구조 정리 메모', mentor: '본인', done: false },
        { period: 'Week 2', area: '역할 이해', task: '본인 R&R 상세 설명, 개인 가이드북 초안 작성 시작', output: 'R&R 이해 확인서', mentor: '직속 멘토', done: false },
        { period: 'Week 2~3', area: '기술 온보딩', task: '담당 기술 스택 학습, 기존 코드/문서 리뷰', output: '기술 스택 자가진단표', mentor: '기술 멘토', done: false },
        { period: 'Week 3~4', area: '첫 업무', task: '작은 단위 업무 1건 직접 수행, 주간보고 첫 작성', output: '첫 업무 완료 + 주간보고 제출', mentor: '멘토', done: false },
        { period: 'Day 30', area: '30일 리뷰', task: '대표와 1:1 면담 (30분), 적응도·어려움·기대 확인', output: '30일 리뷰 기록', mentor: '대표', done: false }
      ]},
      phase2: { title: 'Phase 2: 31~60일 — "기여하기"', items: [
        { period: 'Week 5~6', area: '독립 업무', task: '담당 업무 독립 수행 시작, 주간보고 자율 작성', output: '주간보고 2회 이상 제출', mentor: '멘토(지원)', done: false },
        { period: 'Week 7~8', area: '프로젝트 참여', task: '핵심 프로젝트 기여, 코드 리뷰 참여', output: '프로젝트 기여 기록', mentor: '프로젝트 리드', done: false },
        { period: 'Day 60', area: '60일 리뷰', task: '대표 + 멘토 3자 면담, 성과·적응도 종합 점검', output: '60일 리뷰 기록', mentor: '대표', done: false }
      ]},
      phase3: { title: 'Phase 3: 61~90일 — "주도하기"', items: [
        { period: 'Week 9~12', area: '업무 주도', task: '담당 영역 자율 운영, 개선 제안 1건 이상', output: '개선 제안서', mentor: '자율', done: false },
        { period: 'Day 90', area: '90일 리뷰', task: '종합 평가, 정규 전환 결정, OKR 설정', output: '90일 종합 평가서', mentor: '대표', done: false }
      ]}
    },
    performanceEval: {
      structure: [
        { axis: 'OKR 달성률', weight: '60%', method: '분기 OKR 핵심결과 점수 (0.0 ~ 1.0 스케일)', cycle: '분기 1회', evaluator: '대표 + 자기평가', standard: '0.7 이상 = 성공, 0.4 미만 = 부진' },
        { axis: '핵심가치 체화도', weight: '40%', method: '5개 핵심가치별 행동 평가 (1~5점 척도)', cycle: '반기 1회', evaluator: '대표 + 동료평가', standard: '평균 3.5 이상 = 양호' }
      ],
      behaviorRubric: [
        { value: '정직한 측정', score1: '데이터 조작 또는 결과 왜곡', score3: 'SOP 대로 수행, 결과 그대로 보고', score5: '문제 발견 시 즉시 공유, 개선안까지 제시' },
        { value: '즉시 공유', score1: '이슈를 혼자 안고 나중에 더 큰 문제', score3: '이슈 발생 시 당일 내 공유', score5: '발생 30분 내 공유 + 해결안 함께 제시' },
        { value: '작게, 빠르게', score1: '완벽 추구로 실행 지연', score3: '계획대로 실행, 마감 준수', score5: 'MVP 선제안, 빠른 피드백 루프 구축' },
        { value: '배움의 의무', score1: '학습 계획 없음, 정체 상태', score3: '월 1회 학습, 기록 작성', score5: '주 1회 이상 학습, 팀 공유 적극 참여' },
        { value: '팀이 먼저', score1: '개인 성과만 추구, 동료 무관심', score3: '팀 목표 인지, 기본 협업 수행', score5: '동료 성장 적극 지원, 팀 목표 우선 행동' }
      ]
    },
    compensation: [
      { phase: 'Phase 0 (매출 前)', revenue: '0원', monetary: '기본급만', nonMonetary: '역할 확장, 공식 인정, 학습 시간', incentive: '없음', stockOption: '검토 단계' },
      { phase: 'Phase 1 (첫 매출)', revenue: '~500만/월', monetary: '기본급 + 소액 성과금', nonMonetary: '역할 확장 + 타이틀 부여', incentive: 'OKR 70%↑ 시 소정 보너스', stockOption: '핵심 인력 부여 검토' },
      { phase: 'Phase 2 (성장)', revenue: '~2,000만/월', monetary: '기본급 인상 + 분기 성과급', nonMonetary: '컨퍼런스 참가, 교육비 지원', incentive: 'OKR 기반 성과급', stockOption: '핵심 인력 부여' },
      { phase: 'Phase 3+ (확장)', revenue: '5,000만↑/월', monetary: '시장 수준 급여 + 연간 인센티브', nonMonetary: '리더십 기회, 해외 출장', incentive: '영업이익 연동 인센티브', stockOption: '전 직원 대상 확대' }
    ],
    resignationProtocol: [
      { timing: 'D-30', phase: '퇴직 의사 접수', activities: '대표 면담, 잔류 가능성 협의, 퇴직 사유 파악', owner: '대표', output: '퇴직 면담 기록' },
      { timing: 'D-30~D-14', phase: '인수인계 시작', activities: '담당 업무 목록 작성, 후임자 지정, 문서화 시작', owner: '퇴직자+후임', output: '인수인계 체크리스트' },
      { timing: 'D-14~D-7', phase: '핵심 이관', activities: '코드/문서/계정 권한 이관, 진행 중 프로젝트 상태 공유', owner: '퇴직자', output: '이관 완료 보고서' },
      { timing: 'D-7~D-Day', phase: '최종 정리', activities: '장비 반납, 계정 비활성화, 최종 인수인계 확인', owner: '대표', output: '퇴직 처리 완료' },
      { timing: 'D+7', phase: '사후 점검', activities: '후임자 업무 수행 확인, 누락 사항 체크', owner: '대표', output: '사후 점검 기록' }
    ]
  },

  // ===== 품질/지재권 (04) =====
  quality: {
    qmsChecklist: [
      { stage: '1. 측정 전', item: '장비 캘리브레이션', detail: '측정장비(LMK6/CM-700d) 교정 상태 확인, 교정 유효기간 내 여부', checker: '기술담당', criteria: '교정 유효기간 내, 교정 성적서 보유', done: false },
      { stage: '1. 측정 전', item: 'SOP 준비', detail: 'CIE 88 기준 측정 SOP 최신본 확인, 측정 조건(4조건) 사전 계획', checker: '기술담당', criteria: 'SOP 확인, 측정 계획서 작성', done: false },
      { stage: '1. 측정 전', item: '현장 사전 조사', detail: '측정 대상 현장 사전 답사, 접근성·안전·날씨 확인', checker: '현장담당', criteria: '사전조사 보고서, 안전 체크리스트', done: false },
      { stage: '2. 측정 중', item: '측정 조건 준수', detail: 'CIE 88 4조건 측정 (맑은날 주간/야간, 흐린날 주간/야간)', checker: '기술담당', criteria: '4조건 모두 측정, 조건별 데이터 확보', done: false },
      { stage: '2. 측정 중', item: '데이터 기록', detail: '측정값 실시간 기록, GPS 좌표, 시간, 기상 조건 포함', checker: '기술담당', criteria: '데이터 무결성 확인, 누락 없음', done: false },
      { stage: '2. 측정 중', item: '이상값 처리', detail: '측정 중 이상값 발생 시 즉시 재측정, 이상값 원인 기록', checker: '기술담당', criteria: '이상값 기준: ±3σ 초과', done: false },
      { stage: '3. 분석', item: '데이터 분석', detail: 'AI 분석 파이프라인 실행, 수동 검증 교차 확인', checker: 'AI담당', criteria: '분석 결과 vs 수동 검증 오차 5% 이내', done: false },
      { stage: '3. 분석', item: '보고서 작성', detail: '측정보고서 양식 준수, 그래프·표·결론·권고안 포함', checker: '기술담당', criteria: '보고서 양식 준수, 필수 항목 전체 포함', done: false },
      { stage: '4. 검증', item: '내부 검증', detail: '담당자 외 1인이 보고서 교차 검증, 수치·그래프·결론 일관성 확인', checker: '검증자(담당자 外)', criteria: '검증 서명 완료, 수정 사항 0건', done: false },
      { stage: '4. 검증', item: '대표 최종 승인', detail: '최종 보고서 대표 검토, 고객 제출 전 최종 승인', checker: '대표', criteria: '대표 승인 서명, 날짜 기입', done: false },
      { stage: '5. 납품', item: '고객 제출', detail: '보고서+데이터+분석결과 패키지, 납품 확인서 수령', checker: '대표/영업', criteria: '납품 확인서 수령, 고객 서명', done: false },
      { stage: '5. 납품', item: '사후 관리', detail: '납품 후 2주 내 고객 피드백 수집, 개선 사항 반영 여부 확인', checker: '영업담당', criteria: '피드백 기록, 개선 조치 이행', done: false }
    ],
    ipPortfolio: [
      { type: '특허', name: '특허 1번 (Shadow AI 관련)', status: '출원 중', date: '2025', product: 'Shadow AI', owner: '대표', note: '등록 예상 시기 확인' },
      { type: '특허', name: '특허 2번 (Lux-Guard 관련)', status: '출원 중', date: '2025', product: 'Lux-Guard', owner: '대표', note: '등록 예상 시기 확인' },
      { type: '특허(예정)', name: '터널 시인성 AI 분석 방법', status: '출원 준비', date: '2026 목표', product: 'Shadow AI v2', owner: '기술리드', note: '선행기술 조사 필요' },
      { type: '특허(예정)', name: '차량탑재형 이동측정 시스템', status: '출원 준비', date: '2026~27', product: 'VisiScan 이동측정', owner: '기술리드', note: '' },
      { type: '영업비밀', name: 'Shadow AI 학습 데이터셋', status: '보유 중', date: '—', product: 'Shadow AI', owner: '기술리드', note: '접근 권한 제한 필수' },
      { type: '영업비밀', name: 'CIE 88 측정 SOP', status: '보유 중', date: '—', product: 'VisiScan', owner: '대표', note: '대외 공개 금지' },
      { type: '영업비밀', name: '고객 데이터·측정결과', status: '보유 중', date: '—', product: '전체', owner: '대표', note: '개인정보보호법 준수' },
      { type: '상표', name: '브링엔지니어링', status: '확인 필요', date: '—', product: '회사명', owner: '대표', note: '상표 등록 여부 확인' },
      { type: '상표', name: 'VisiScan', status: '미등록', date: '—', product: '제품명', owner: '대표', note: '상표 등록 검토' },
      { type: '상표', name: 'Shadow AI', status: '미등록', date: '—', product: '제품명', owner: '대표', note: '상표 등록 검토' },
      { type: '저작권', name: '소프트웨어 소스코드', status: '자동 발생', date: '—', product: '전체 SW', owner: '기술리드', note: '저작권 등록 검토' },
      { type: '인증', name: 'TRL 5 (Shadow AI)', status: '인증 완료', date: '2025', product: 'Shadow AI', owner: '대표', note: 'IR·사업계획서 활용' }
    ],
    techDebtTypes: [
      { type: '전략적 부채', definition: '의도적으로 속도를 위해 발생시킨 부채', risk: '중', allowed: 'MVP 단계에서 허용, 반드시 백로그 등록', resolution: '분기 1회 정리 스프린트', cycle: '분기' },
      { type: '무모한 부채', definition: '모르고/급해서 발생한 부채', risk: '상', allowed: '허용 안 됨', resolution: '발견 즉시 이슈 등록, 2주 내 해소', cycle: '즉시' },
      { type: '불가피한 부채', definition: '외부 요인으로 어쩔 수 없이 발생', risk: '중', allowed: '사유 기록 필수', resolution: '월간 기술 리뷰에서 논의', cycle: '월간' },
      { type: '무지한 부채', definition: '나중에 알게 된 더 나은 방법', risk: '하', allowed: '학습 과정의 자연스러운 결과', resolution: '학습 후 개선 계획 수립', cycle: '수시' }
    ]
  },

  // ===== 12주 실행 로드맵 (05) =====
  roadmap: {
    weeks: [
      { week: 'W1', phase: 'Phase 1', items: [
        { task: '데일리 스탠드업 시작', goal: '매일 09:00 슬랙 #standup, 5일 연속 실행', owner: '전원', done: false },
        { task: '주간 킥오프 첫 실행', goal: '월요일 10:00, 30분, 이번 주 목표 3개 확정', owner: '전원', done: false }
      ]},
      { week: 'W2', phase: 'Phase 1', items: [
        { task: '주간보고 첫 제출', goal: '금요일 16:00 양식 준수, 목표 대비 달성률 포함', owner: '전원', done: false },
        { task: '커뮤니케이션 프로토콜 공유', goal: '전원 읽고 서명, 슬랙 채널 구조 정리', owner: '대표', done: false }
      ]},
      { week: 'W3', phase: 'Phase 2', items: [
        { task: '의사결정 권한표 공유', goal: 'L1~L4 전원 이해, 실제 1건 적용 테스트', owner: '대표', done: false },
        { task: '미션·비전·핵심가치 워크숍', goal: '전원 참여 1시간, 행동원칙 합의', owner: '대표', done: false }
      ]},
      { week: 'W4', phase: 'Phase 2', items: [
        { task: '1:1 체크인 첫 실행', goal: '전원 30분씩, 체크인 기록 작성', owner: '대표', done: false },
        { task: '캐시플로우 첫 입력', goal: '12개월 모델에 실제 숫자, 잔여 운영 개월수 확인', owner: '대표', done: false }
      ]},
      { week: 'W5', phase: 'Phase 3', items: [
        { task: 'OKR 점검 (4주 차)', goal: '전원 현재 OKR 점수 갱신, 0.3 미만 항목 대응', owner: '전원', done: false }
      ]},
      { week: 'W6', phase: 'Phase 3', items: [
        { task: '기술 싱크 첫 실행', goal: '격주 수요일 1시간, 기술부채 백로그 작성', owner: '기술팀', done: false }
      ]},
      { week: 'W7', phase: 'Phase 3', items: [
        { task: '온보딩 프로그램 확정', goal: '30-60-90 최종본 리뷰, 다음 채용 시 즉시 적용 가능', owner: '대표', done: false }
      ]},
      { week: 'W8', phase: 'Phase 3', items: [
        { task: '성과평가 기준 공유', goal: '전원 읽고 질문·합의, 다음 분기부터 적용 예고', owner: '대표', done: false }
      ]},
      { week: 'W9', phase: 'Phase 4', items: [
        { task: '월간 경영 리뷰 첫 실행', goal: '대시보드 실제 채워서 리뷰, 1시간, 대면 필수', owner: '대표', done: false }
      ]},
      { week: 'W10', phase: 'Phase 4', items: [
        { task: 'QMS 체크리스트 테스트', goal: 'VisiScan 모의 납품 1회, 체크리스트 전항목 적용', owner: '기술팀', done: false }
      ]},
      { week: 'W11', phase: 'Phase 4', items: [
        { task: 'IP 관리 대장 점검', goal: '특허·상표·영업비밀 현황, 보호 조치 이행 확인', owner: '대표', done: false }
      ]},
      { week: 'W12', phase: 'Phase 4', items: [
        { task: '전체 체계 회고 워크숍', goal: '12주 회고: 뭐가 됐고 뭐가 안 됐나, 다음 분기 개선 방향', owner: '전원', done: false }
      ]}
    ],
    fdiSchedule: [
      { stage: '1단계', trl: 'TRL 3', task: '3D 시뮬레이션 및 구조 응력 검증', months: [1,1,0,0,0,0,0,0,0] },
      { stage: '1단계', trl: 'TRL 3', task: '3D 프린터 목업 제작 및 실물 적합성 확인', months: [0,1,0,0,0,0,0,0,0] },
      { stage: '1단계', trl: 'TRL 3', task: '계절별 분사 매체 비교 실험 및 선정', months: [1,1,0,0,0,0,0,0,0] },
      { stage: '2단계', trl: 'TRL 4', task: '경계석 실물(3~5개) 제작', months: [0,0,1,1,0,0,0,0,0] },
      { stage: '2단계', trl: 'TRL 4', task: '테스트베드 구축 및 오염 조건 재현', months: [0,0,0,1,1,0,0,0,0] },
      { stage: '2단계', trl: 'TRL 4', task: '미끄럼저항계수(BPN 40↑) 정량 검증', months: [0,0,0,1,1,0,0,0,0] },
      { stage: '2단계', trl: 'TRL 4', task: '탁도 제거율(70%↑) 및 매체 전환 검증', months: [0,0,0,0,1,0,0,0,0] },
      { stage: '3단계', trl: 'TRL 4.5', task: '센서(온도·습윤·탁도) 구성 및 MCU 연동', months: [0,0,0,0,0,1,0,0,0] },
      { stage: '3단계', trl: 'TRL 4.5', task: '자동 분사 제어 프로토타입 구현', months: [0,0,0,0,0,1,1,0,0] },
      { stage: '3단계', trl: 'TRL 4.5', task: '응답시간(5초 이내) 및 감지 정확도 검증', months: [0,0,0,0,0,0,1,0,0] },
      { stage: '3단계', trl: 'TRL 4.5', task: 'Edge AI 고도화 방향 설정', months: [0,0,0,0,0,0,1,0,0] },
      { stage: '4단계', trl: 'TRL 5', task: '자체 성능 측정 종합 보고서 작성', months: [0,0,0,0,0,0,0,1,1] },
      { stage: '4단계', trl: 'TRL 5', task: '공인시험기관 시험 신청용 기초 자료 확보', months: [0,0,0,0,0,0,0,1,1] },
      { stage: '4단계', trl: 'TRL 5', task: '파일럿 실증 제안서 작성', months: [0,0,0,0,0,0,0,0,1] }
    ],
    fdiMonths: ['4월','5월','6월','7월','8월','9월','10월','11월','12월']
  },

  // ===== 사업전략 (B) =====
  strategy: {
    competitors: [
      { item: '핵심 기술', bring: 'AI 광학분석+측정SOP', compA: '조도계측 위주', compB: '재귀반사 측정', overseas: '하드웨어 중심', academia: '연구용, 상용화無' },
      { item: '이동 측정', bring: '차량탑재형 (개발중)', compA: '고정 측정', compB: '고정 측정', overseas: '일부 가능', academia: '불가' },
      { item: 'CIE 88 준수', bring: '준수 예정 (SOP 개발)', compA: '부분 적용', compB: '미확인', overseas: '준수', academia: '해당없음' },
      { item: 'AI 분석 리포트', bring: '개발중', compA: '없음', compB: '없음', overseas: '일부', academia: '없음' },
      { item: '하드웨어 패키지', bring: 'Lux-Guard 연계', compA: '없음', compB: '없음', overseas: '있음', academia: '없음' },
      { item: 'B2G 레퍼런스', bring: '구축중 (첫 계약 목표)', compA: '다수 보유', compB: '일부 보유', overseas: '국내 少', academia: '없음' },
      { item: '가격 경쟁력', bring: '중간', compA: '중간', compB: '높음', overseas: '낮음(고가)', academia: '없음' }
    ],
    brandAssets: [
      { type: '수상', content: 'DeXplore Global 대상', org: 'DeXplore', date: '2025', usage: 'IR·사업계획서' },
      { type: '수상', content: '기타 8개 수상 (총 9개)', org: '각 기관', date: '2025', usage: 'IR·홍보' },
      { type: '인증', content: 'TRL 5 인증', org: '평가기관', date: '2025', usage: '기술력 증빙 (Shadow AI)' },
      { type: '성과', content: '터널 PoC — 직사광 51.91% 저감', org: '현장', date: '2025', usage: '레퍼런스 (진주 폐터널)' },
      { type: '선정', content: '정부지원사업 6개 선정', org: '각 기관', date: '2025~', usage: 'IR·홍보' },
      { type: '지재권', content: '특허 2건 출원', org: '특허청', date: '2025', usage: '기술보호' },
      { type: 'MOU', content: '3개 기관 체결', org: '각 기관', date: '2025~', usage: '파트너십' }
    ]
  },

  // ===== 개발 준비 계획 =====
  devPlans: {
    노광민: {
      role: 'SW Developer',
      period: '3/9 ~ 4/15',
      weeks: [
        { week: '1주차 (3/9~3/15)', title: '환경 구성·팀 세팅', tasks: [
          { id: 1, area: '개발 환경', task: 'Python 환경 통일', detail: 'Python 3.11 + venv 팀 전체 표준화, requirements.txt 초안', due: '3/11', status: '⬜' },
          { id: 2, area: '개발 환경', task: 'Git 저장소 구조 설계 및 세팅', detail: 'GitHub 조직 저장소 생성, 브랜치 전략 확정 (main/dev/feature)', due: '3/12', status: '⬜' },
          { id: 3, area: '개발 환경', task: 'Jetson 개발 환경 점검', detail: 'Jetson 기종·JetPack 버전 확인, CUDA·OpenCV 설치 현황', due: '3/13', status: '⬜' },
          { id: 4, area: '팀 세팅', task: '학부생 역량 1:1 파악', detail: 'Python 기초, OpenCV, Serial 통신, SQL 사용 경험 확인', due: '3/14', status: '⬜' },
          { id: 5, area: '팀 세팅', task: '배정환과 모듈 경계 합의', detail: '센서 드라이버, 위치 연산, 광학 영상 처리, 조명공학 연산 엔진 담당', due: '3/15', status: '⬜' }
        ]},
        { week: '2주차 (3/16~3/22)', title: '아키텍처 설계·RFP 착수', tasks: [
          { id: 6, area: '아키텍처', task: '전체 SW 모듈 내부/외주 분류 확정', detail: '내부/외주/보류 분류, 담당자·기술스택·완료기준 명시', due: '3/18', status: '⬜' },
          { id: 7, area: '아키텍처', task: '데이터 흐름도 (DFD) 작성', detail: '센서 입력 → 수집 → 위치 연산 → 광학 처리 → 조명공학 엔진 → 출력', due: '3/19', status: '⬜' },
          { id: 8, area: '아키텍처', task: '모듈 간 인터페이스 명세', detail: '각 모듈의 입력·출력 데이터 타입 문서화', due: '3/20', status: '⬜' }
        ]}
      ]
    },
    배정환: {
      role: 'AI Developer',
      period: '3/9 ~ 4/15',
      weeks: [
        { week: '1주차 (3/9~3/15)', title: '환경 구성·노광민과 인터페이스 합의', tasks: [
          { id: 1, area: '개발 환경', task: 'AI 개발 환경 구성', detail: 'Python 3.11 + venv, LangGraph, PyTorch, YOLOv8, MLflow', due: '3/11', status: '⬜' },
          { id: 2, area: '개발 환경', task: 'Git 브랜치 세팅', detail: 'AI 영역 폴더 추가 (/ai_vision, /langgraph, /data_pipeline)', due: '3/12', status: '⬜' },
          { id: 3, area: '인터페이스', task: '노광민 모듈 출력 인터페이스 수신 확인', detail: 'frame_id, utc_ms, lat, lon, luminance_map, risk_score_raw 등', due: '3/13', status: '⬜' },
          { id: 4, area: '인터페이스', task: 'LangGraph 입력 데이터 스키마 정의', detail: 'State = {tunnel_meta, measurement_result, risk_score, violation_list, report_draft}', due: '3/14', status: '⬜' },
          { id: 5, area: '팀 세팅', task: '노광민과 모듈 경계 최종 합의', detail: 'LangGraph, YOLOv8, AI Hub 데이터, MLflow, Claude API 연동 담당', due: '3/15', status: '⬜' }
        ]},
        { week: '2주차 (3/16~3/22)', title: 'LangGraph 구조 설계·데이터 파이프라인 설계', tasks: [
          { id: 6, area: 'LangGraph', task: 'State Graph 노드 구조 설계', detail: '입력 수신 → 위반 탐지 → 원인 분석 → 경제성 요약 → 리포트 생성 → Grader → PDF', due: '3/18', status: '⬜' },
          { id: 7, area: 'LangGraph', task: '조건부 분기 로직 설계', detail: 'RiskScore 기반 위험/주의/양호 리포트 경로 분기', due: '3/19', status: '⬜' },
          { id: 8, area: 'Claude API', task: 'JSON Schema 출력 강제 설계', detail: 'Claude API structured output, Grader 루프 최대 3회', due: '3/20', status: '⬜' }
        ]}
      ]
    }
  },

  // ===== 세무/회계 (03) =====
  taxCalendar: [
    { month: '1월', task: '연말정산 (근로소득)', detail: '전년도 근로소득 정산, 원천징수 영수증 발급', deadline: '1/10', owner: '대표/세무사' },
    { month: '1월', task: '부가가치세 확정신고', detail: '전년 하반기 부가세 신고·납부', deadline: '1/25', owner: '세무사' },
    { month: '3월', task: '법인세 신고', detail: '전년도 법인세 신고·납부', deadline: '3/31', owner: '세무사' },
    { month: '4월', task: '4대보험 보수총액 신고', detail: '전년도 보수총액 신고, 정산', deadline: '4/15', owner: '대표/노무사' },
    { month: '5월', task: '종합소득세 신고', detail: '대표 종합소득세 (개인사업자 해당 시)', deadline: '5/31', owner: '세무사' },
    { month: '7월', task: '부가가치세 확정신고', detail: '상반기 부가세 신고·납부', deadline: '7/25', owner: '세무사' },
    { month: '10월', task: '부가가치세 예정신고', detail: '3분기 부가세 예정 신고', deadline: '10/25', owner: '세무사' },
    { month: '12월', task: '연말정산 준비', detail: '다음해 연말정산 자료 수집 안내', deadline: '12/31', owner: '대표' }
  ],

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
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        Utils.toast('저장 공간이 부족합니다. 오래된 활동 로그를 정리합니다.', 'warning');
        this._data.activityLog = this._data.activityLog.slice(0, 10);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
        } catch (retryErr) {
          console.error('Data save error after trimming:', retryErr);
        }
      } else {
        console.error('Data save error:', e);
      }
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
