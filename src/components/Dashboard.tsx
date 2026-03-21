import React from 'react';
import { ApplicantProfile } from './ApplicantProfile';
import { EvaluationForm } from './EvaluationForm';
import { HandRaiseQueue } from './HandRaiseQueue';

export const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* 왼쪽: 지원서 확인 및 평가 */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <ApplicantProfile />
        <EvaluationForm />
      </div>

      {/* 오른쪽: 질문 대기열 (고정) */}
      <div className="lg:col-span-1">
        <HandRaiseQueue />
      </div>
    </div>
  );
};