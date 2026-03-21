import React from 'react';
import { ApplicantProfile } from './ApplicantProfile';
import { EvaluationForm } from './EvaluationForm';
import { HandUpSection } from './HandUpSection'; 
import { ChatSection } from './ChatSection';
import { useStore } from '../store/useStore'; 

export const Dashboard: React.FC = () => {
  const currentUser = useStore((state) => state.currentUser);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <ApplicantProfile />
        <EvaluationForm />
      </div>

      {/* Right */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <HandUpSection userName={currentUser?.name || '면접관'} />
        <ChatSection userName={currentUser?.name || '면접관'} />
      </div>
    </div>
  );
};