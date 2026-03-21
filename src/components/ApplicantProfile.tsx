import React from 'react';
import { useStore } from '../store/useStore';
import { User, BookOpen } from 'lucide-react';

export const ApplicantProfile: React.FC = () => {
  const { applicants, currentApplicantId } = useStore();
  const applicant = applicants.find(a => a.id === currentApplicantId);

  if (!applicant) return null;

  // 부서별 타원형 배지 색상 전처리 로직
  const getDepartmentStyle = (dept: string) => {
    switch (dept) {
      case '철학부': return { backgroundColor: '#EAD1DC', color: '#374151' };
      case '창업부': return { backgroundColor: '#D9EAD3', color: '#374151' };
      case '정치부': return { backgroundColor: '#F4CCCC', color: '#374151' };
      case '상경부': return { backgroundColor: '#CFE2F3', color: '#374151' };
      default: return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8">
      {/* 상단 프로필 및 인적사항 영역 */}
      <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-slate-700 pb-8">
        
        {/* 좌측: 학번/이름 및 세로 나열된 인적사항 */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 mt-1">
            <User size={36} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {applicant.studentId} {applicant.name}
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full font-bold">지원자</span>
            </h2>
            {/* 세로 줄바꿈 적용된 정보란 */}
            <div className="text-gray-500 dark:text-slate-400 mt-4 font-medium flex flex-col gap-2 text-[15px]">
              <span>진로: <span className="text-gray-700 dark:text-slate-300">{applicant.career}</span></span>
              <span>연락처: <span className="text-gray-700 dark:text-slate-300">{applicant.phone}</span></span>
              <span>학교 이메일: <span className="text-gray-700 dark:text-slate-300">{applicant.schoolEmail}</span></span>
              <span>출신 중학교: <span className="text-gray-700 dark:text-slate-300">{applicant.middleSchool}</span></span>
            </div>
          </div>
        </div>

        {/* 우측 상단: 희망 부서 배지 (타원형 디자인 및 색상 적용) */}
        <div 
          className="px-5 py-2 rounded-full font-extrabold text-sm shadow-sm whitespace-nowrap tracking-wide"
          style={getDepartmentStyle(applicant.department)}
        >
          {applicant.department}
        </div>
      </div>

      {/* 하단: 서술형/논술식 답변 영역 */}
      <div className="space-y-8">
        <Section title="자기소개" content={applicant.introduction} />
        <Section title="동아리 지원 계기" content={applicant.motivation} />
        <Section title="최근 관심 있게 본 이슈 (법·사회·정치 문제)" content={applicant.issue} />
        <Section title="선정한 이슈와 자신의 진로 상관관계" content={applicant.issueRelation} />
        <Section title="자신의 성향" content={applicant.tendency} />
        <Section title="위 질문에 답한 이유 혹은 그 사례" content={applicant.reasonExample} />
        <Section title="동아리에 입부하게 된다면 하고싶은 활동" content={applicant.futureActivity} />
        <Section title="입부 후 다짐" content={applicant.resolution} />
      </div>
    </div>
  );
};

const Section = ({ title, content }: { title: string, content: string }) => (
  <div>
    <h3 className="text-sm font-bold text-blue-500 dark:text-blue-400 flex items-center gap-2 mb-3">
      <BookOpen size={18} /> {title}
    </h3>
    <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-[15px] bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 whitespace-pre-wrap">
      {content || "데이터가 아직 입력되지 않았습니다."}
    </p>
  </div>
);