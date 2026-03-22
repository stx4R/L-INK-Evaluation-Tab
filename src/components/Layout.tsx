import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, LogOut, Bug } from 'lucide-react';
import { BugReportModal } from './BugReportModal';
import { supabase } from '../utils/supabase';
import { FinalVoteModal } from './FinalVoteModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    currentUser, 
    logout, 
    applicants, 
    setCurrentApplicant, 
    currentApplicantId,
    applicantStatuses, 
    setApplicantStatuses
  } = useStore();
  
  const [isDark, setIsDark] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  
  // Kick status
  const [kickMessage, setKickMessage] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchStatuses = async () => {
      const { data } = await supabase.from('applicant_status').select('*');
      if (data) {
        const statusMap: Record<string, string> = {};
        data.forEach((item) => { statusMap[item.applicant_id] = item.status; });
        setApplicantStatuses(statusMap);
      }
    };
    fetchStatuses();

    // 1. Status
    const statusChannel = supabase.channel('applicant-status-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applicant_status' }, () => { fetchStatuses(); })
      .subscribe();

    // 2. Kick
    const kickChannel = supabase.channel('kick-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banned_users' }, (payload) => {
        const newBan = payload.new as any;
        if (newBan && (newBan.student_id === currentUser?.studentId || newBan.student_id === currentUser?.name)) {
          if (newBan.banned_until) {
            const diff = new Date(newBan.banned_until).getTime() - Date.now();
            const seconds = Math.ceil(diff / 1000);
            if (seconds > 0) {
              setKickMessage(`You are kicked out ${seconds} seconds by "Admin".`);
            }
          } else {
            setKickMessage(`You are kicked out by "Admin".`);
          }
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(statusChannel); 
      supabase.removeChannel(kickChannel);
    };
  }, [setApplicantStatuses, currentUser]);

  // Block UI if kicked
  if (kickMessage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-red-600 flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in duration-300">
        <h1 className="text-5xl font-extrabold mb-6 tracking-widest">🚨 KICKED OUT</h1>
        <p className="text-2xl font-bold mb-10 bg-black/20 px-6 py-4 rounded-2xl border border-red-400">
          {kickMessage}
        </p>
        <button 
          onClick={() => { setKickMessage(null); logout(); }} 
          className="px-8 py-4 bg-white text-red-600 font-extrabold rounded-2xl hover:bg-gray-100 transition shadow-xl"
        >
          확인 및 로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors pb-12">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">L-INK Eval</h1>
            <select 
              className="bg-gray-100 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none"
              value={currentApplicantId || ''}
              onChange={(e) => setCurrentApplicant(e.target.value)}
            >
              {applicants.map(app => (
                <option key={app.id} value={app.id}>
                  [{applicantStatuses[app.id] || '면접 대기'}] {app.studentId} {app.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsBugReportOpen(true)} className="p-2.5 rounded-full hover:bg-red-50 text-red-500 dark:hover:bg-red-900/20 transition-colors">
              <Bug size={20} />
            </button>
            <span className={`text-sm font-semibold px-4 py-2 rounded-full hidden sm:block ${currentUser?.isAdmin ? 'bg-amber-100 text-amber-800' : 'text-gray-600 bg-gray-100'}`}>
              {currentUser?.isAdmin ? '👑 어드민' : `${currentUser?.name} 면접관`}
            </span>
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={logout} className="p-2.5 rounded-full hover:bg-red-50 text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {children}
      </main>

      <FinalVoteModal />
      <BugReportModal 
        isOpen={isBugReportOpen} 
        onClose={() => setIsBugReportOpen(false)} 
        userName={currentUser?.name || '알 수 없음'}
        isAdmin={!!currentUser?.isAdmin}
      />
    </div>
  );
};