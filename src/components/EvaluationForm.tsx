import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Save } from 'lucide-react';

export const EvaluationForm: React.FC = () => {
  const { currentUser, currentApplicantId, evaluations, saveEvaluation } = useStore();
  
  const evalKey = `${currentApplicantId}-${currentUser?.studentId}`;
  const existingData = evaluations[evalKey] || { score: 5, comment: '' };

  const [score, setScore] = useState(existingData.score);
  const [comment, setComment] = useState(existingData.comment);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setScore(existingData.score);
    setComment(existingData.comment);
  }, [currentApplicantId]);

  useEffect(() => {
    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      if (currentUser && currentApplicantId) {
        saveEvaluation({
          applicantId: currentApplicantId,
          interviewerId: currentUser.studentId,
          score,
          comment,
        });
      }
      setIsSaving(false);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [score, comment, currentApplicantId, currentUser, saveEvaluation]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">면접 평가</h3>
        <div className={`text-sm flex items-center gap-1.5 font-medium ${isSaving ? 'text-gray-400 dark:text-slate-500' : 'text-blue-500 dark:text-blue-400'}`}>
          <Save size={16} /> {isSaving ? '저장 중...' : '자동 저장됨'}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">종합 점수 (1~10)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1" max="10"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-500"
            />
            <span className="w-12 text-center text-xl font-bold text-blue-500 bg-blue-50 dark:bg-slate-900 dark:text-blue-400 py-2 rounded-xl">
              {score}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">면접 코멘트</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
            placeholder="지원자의 답변 내용, 태도, 특이사항 등을 상세히 기록해주세요."
          />
        </div>
      </div>
    </div>
  );
};