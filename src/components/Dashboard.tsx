import React from 'react';
import { ApplicantProfile } from './ApplicantProfile';
import { EvaluationForm } from './EvaluationForm';
// 기존 HandRaiseQueue 대신 우리가 만든 HandUpSection을 불러옵니다!
import { HandUpSection } from './HandUpSection'; 
import { useStore } from '../store/useStore'; // 로그인한 유저 정보 가져오기 위해 추가

export const Dashboard: React.FC = () => {
  // 현재 로그인한 유저 정보를 가져옵니다.
  const currentUser = useStore((state) => state.currentUser);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* 왼쪽: 지원서 확인 및 평가 */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <ApplicantProfile />
        <EvaluationForm /> 
      </div>

      {/* 오른쪽: 질문 대기열 (고정) */}
      <div className="lg:col-span-1">
        {/* 예전 코드를 지우고 방금 만든 실시간 손들기 컴포넌트를 넣습니다! */}
        <HandUpSection userName={currentUser?.name || '면접관'} />
      </div>
    </div>
  );
};