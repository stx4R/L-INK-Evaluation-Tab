import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, applicants, setCurrentApplicant, currentApplicantId } = useStore();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors pb-12">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-extrabold text-blue-500 tracking-tight">L-INK Eval</h1>
            <select 
              className="bg-gray-100 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none"
              value={currentApplicantId || ''}
              onChange={(e) => setCurrentApplicant(e.target.value)}
            >
              {applicants.map(app => (
                <option key={app.id} value={app.id}>[면접중] {app.studentId} {app.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-full hidden sm:block">
              {currentUser?.name} 면접관
            </span>
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={logout} className="p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {children}
      </main>
    </div>
  );
};