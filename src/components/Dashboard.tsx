import React from 'react';
import { ApplicantProfile } from './ApplicantProfile';
import { EvaluationForm } from './EvaluationForm';
import { HandUpSection } from './HandUpSection'; 
import { ChatSection } from './ChatSection'; // ✨ 채팅 컴포넌트 추가
import { useStore } from '../store/useStore'; 

export const Dashboard: React.FC = () => {
  const currentUser = useStore((state) => state.currentUser);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* 왼쪽: 지원서 확인 및 평가 */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <ApplicantProfile />
        <EvaluationForm />
      </div>

      {/* 오른쪽: 실시간 손들기 & 실시간 채팅방 */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <HandUpSection userName={currentUser?.name || '면접관'} />
        <ChatSection userName={currentUser?.name || '면접관'} />
      </div>
    </div>
  );
};