import { create } from 'zustand';
import type { Interviewer, Applicant, QueueItem, Evaluation } from '../types/index';
const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 'app-10204',
    studentId: '10204',
    name: '김민준',
    career: '사회 분야',
    phone: '010-3219-4683',
    schoolEmail: '26_kmj1121@dshs.kr',
    middleSchool: '대전대성중학교',
    department: '철학부',
    introduction: '저는 사회에서 일어나는 다양한 문제에 늘 관심을 가져왔습니다. 뉴스를 보는 데서 그치지 않고, 여러 자료를 직접 찾아 읽으며 각기 다른 시각으로 문제를 바라보려고 합니다. 이로 인해 원인과 결과, 그리고 해결책까지 좀 더 깊이 있게 살펴보려는 습관이 자연스럽게 생겼습니다.',
    motivation: '사회쪽에 다양한 관심이 있고 다양한 문제를 함께 탐구하고 싶습니다.',
    issue: '현대의 정치적 양극화(민주당을 극좌로 부르고 국민의힘을 극우로 부르는 등)',
    issueRelation: '이러한 현상이 사회 상에서 나타나는 이유를 파악하고 구체적인 해결책을 제시한다.',
    tendency: '팔로워',
    reasonExample: '리더가 되기에는 그만한 통솔력이 없지만, 팔로워에서는 동등한 팀원들과 함께 협동할 수 있습니다.',
    futureActivity: '선배님, 그리고 앞으로 들어올 후배님들과 함께 동아리 활동을 하고 싶습니다.',
    resolution: '사회에 대한 안목을 더 넓히게 열심히 노력하겠습니다.'
  },
  {
    id: 'app-10206',
    studentId: '10206',
    name: '김영일',
    career: '철학과', 
    phone: '010-2104-8249', 
    schoolEmail: '26_0728kyi@dshs.kr', 
    middleSchool: '대전정림중학교', 
    department: '철학부',
    introduction: '추상적인 개념과 상징을 잘 다루는 사람', 
    motivation: '철학에 대한 흥미와 선생님의 추천', 
    issue: '사회 문제', 
    issueRelation: '우리나라의 많은 사회문제(배금주의, 자살 등)들 중 많은 부분이 삶의 이유를 찾지 못해서 일어난다고 생각합니다', 
    tendency: '리더',
    reasonExample: '애매한데 나서길 꺼리는데 답답하거나 아무도 안 나서면 나섭니다', 
    futureActivity: '토론 활동', 
    resolution: '검토하려 했는데 잘못해서 두 번 보내졌을 수도 있을 것 같습니다 그래도 잘 부탁 드립니다'
  },
  {
    id: 'app-10214',
    studentId: '10214',
    name: '송범준',
    career: '', 
    phone: '', schoolEmail: '', middleSchool: '', department: '철학부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10236',
    studentId: '10236',
    name: '황연우',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '철학부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10722',
    studentId: '10722',
    name: '이선민',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '철학부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10102',
    studentId: '10102',
    name: '길려훈',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '창업부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10218',
    studentId: '10218',
    name: '이장범',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10325',
    studentId: '10325',
    name: '이태군',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10405',
    studentId: '10405',
    name: '김정윤',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10614',
    studentId: '10614',
    name: '배준용',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '창업부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10627',
    studentId: '10627',
    name: '정준철',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '창업부',
    introduction: '', motivation: '', issue: '' , issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10804',
    studentId: '10804',
    name: '김동언',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '창업부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10835',
    studentId: '10835',
    name: '홍산들',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '창업부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10908',
    studentId: '10908',
    name: '김현우',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '창업부',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-10635',
    studentId: '10635',
    name: '황진석',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-11012',
    studentId: '11012',
    name: '박세범',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  },
  {
    id: 'app-11024',
    studentId: '11024',
    name: '윤민준',
    career: '', phone: '', schoolEmail: '', middleSchool: '', department: '',
    introduction: '', motivation: '', issue: '', issueRelation: '', tendency: '리더', reasonExample: '', futureActivity: '', resolution: ''
  }
];

interface StoreState {
  currentUser: Interviewer | null;
  applicants: Applicant[];
  currentApplicantId: string | null;
  queue: QueueItem[];
  evaluations: Record<string, Evaluation>;
  
  login: (user: Interviewer) => void;
  logout: () => void;
  setCurrentApplicant: (id: string) => void;
  updateQueue: (queue: QueueItem[]) => void;
  saveEvaluation: (evaluation: Evaluation) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentUser: null,
  applicants: MOCK_APPLICANTS,
  currentApplicantId: MOCK_APPLICANTS[0].id,
  queue: [],
  evaluations: {},

  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  setCurrentApplicant: (id) => set({ currentApplicantId: id }),
  updateQueue: (newQueue) => set({ queue: newQueue }),
  saveEvaluation: (evaluation) => 
    set((state) => ({
      evaluations: {
        ...state.evaluations,
        [`${evaluation.applicantId}-${evaluation.interviewerId}`]: evaluation
      }
    })),
}));