import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export const Login: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const login = useStore((state) => state.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.trim() && name.trim()) {
      login({ studentId, name });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-md p-10 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">L-INK</h1>
          <p className="text-gray-500 dark:text-slate-400">실시간 면접 평가 시스템</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">학번</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all text-lg"
              placeholder="예: 20723"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all text-lg"
              placeholder="예: 유이준"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl transition-colors text-lg shadow-sm"
          >
            접속하기
          </button>
        </form>
      </div>
    </div>
  );
};