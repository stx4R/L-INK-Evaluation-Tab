// src/components/ApplicantProfile.tsx
import React from 'react';
import { useStore } from '../store/useStore';
import { User, BookOpen, Vote } from 'lucide-react';
import { supabase } from '../utils/supabase';

export const ApplicantProfile: React.FC = () => {
  const { applicants, currentApplicantId, currentUser, applicantStatuses } = useStore();
  const applicant = applicants.find(a => a.id === currentApplicantId);

  if (!applicant) return null;

  // current status
  const currentStatus = applicantStatuses[applicant.id] || '면접 대기';

  // Admin status change
  const handleStatusClick = async () => {
    if (!currentUser?.isAdmin) return;

    let nextStatus = '면접 대기';
    if (currentStatus === '면접 대기') nextStatus = '면접중';
    else if (currentStatus === '면접중') nextStatus = '면접 완료';
    
    await supabase.from('applicant_status').upsert({
      applicant_id: applicant.id,
      status: nextStatus
    }, { onConflict: 'applicant_id' });
  };

  // Admin vote start
  const startVote = async () => {
    if (!window.confirm(`[${applicant.name}] 지원자에 대한 최종 투표를 시작하시겠습니까?`)) return;
    
    await supabase.from('active_votes').insert({
      applicant_id: applicant.studentId,
      applicant_name: applicant.name,
      status: 'voting'
    });
  };

  // Status badge styles
  const getStatusStyle = () => {
    switch(currentStatus) {
      case '면접 대기': 
        return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', led: 'bg-red-500' };
      case '면접중': 
        return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', led: 'bg-yellow-500' };
      case '면접 완료': 
        return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', led: 'bg-green-500' };
      default: 
        return { bg: 'bg-gray-50', text: 'text-gray-600', led: 'bg-gray-500' };
    }
  };

  const statusStyle = getStatusStyle();

  // Department badge
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
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-slate-700 pb-8">
        <div className="flex gap-6 items-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-inner">
            <User size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {applicant.studentId} {applicant.name}
              </h2>
              <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-sm font-bold rounded-lg">
                지원자
              </span>

              {/* Live status letterbox */}
              <div 
                onClick={handleStatusClick}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold transition-all ${statusStyle.bg} ${statusStyle.text} ${currentUser?.isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
                title={currentUser?.isAdmin ? "클릭하여 면접 상태 변경" : ""}
              >
                <div className={`w-2 h-2 rounded-full ${statusStyle.led} animate-pulse`} />
                {currentStatus}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 dark:text-slate-400">
              <span>{applicant.career}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{applicant.phone}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{applicant.schoolEmail}</span>
            </div>
          </div>
        </div>

        {/* Right Badge */}
        <div className="flex flex-col items-end gap-3">
          <div 
            className="px-5 py-2 rounded-full font-extrabold text-sm shadow-sm whitespace-nowrap tracking-wide"
            style={getDepartmentStyle(applicant.department)}
          >
            {applicant.department}
          </div>
          
          {/* Admin Only */}
          {currentUser?.isAdmin && (
            <button 
              onClick={startVote}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors animate-pulse"
            >
              <Vote size={18} />
              최종 투표 열기
            </button>
          )}
        </div>
      </div>

      {/* Downer */}
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
      <BookOpen size={18} />
      {title}
    </h3>
    <div className="p-5 bg-gray-50 dark:bg-slate-900 rounded-2xl text-gray-700 dark:text-slate-300 leading-relaxed text-[15px] border border-gray-100 dark:border-slate-700">
      {content}
    </div>
  </div>
);