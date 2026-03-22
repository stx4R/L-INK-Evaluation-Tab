import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useStore } from '../store/useStore';
import { Delete, LogIn, UserCheck } from 'lucide-react';

export const Login = () => {
  const login = useStore((state) => state.login);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'verify'>('setup');
  const [expectedPin, setExpectedPin] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Scroll lock
  useEffect(() => {
    if (isPinModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
    };
  }, [isPinModalOpen]);

  // First entery
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim()) return alert('학번과 이름을 모두 입력해주세요.');

    // Kick status check
    const { data: banData } = await supabase
      .from('banned_users')
      .select('*')
      .eq('student_id', studentId.trim())
      .single();

    if (banData) {
      alert('관리자에 의해 퇴장되어 다시 입장할 수 없습니다.');
      return;
    }

    // Register check
    const { data } = await supabase
      .from('evaluators')
      .select('*')
      .eq('student_id', studentId.trim())
      .single();

    if (data) {
      if (data.name !== name.trim()) {
        alert('이미 등록된 학번이지만, 이름이 일치하지 않습니다.');
        return;
      }
      setExpectedPin(data.pin);
      setPinMode('verify');
    } else {
      setPinMode('setup');
    }

    setEnteredPin('');
    setErrorMsg('');
    setIsPinModalOpen(true);
  };

  // Pin pad click
  const handlePinClick = (digit: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + digit;
      setEnteredPin(newPin);

      if (newPin.length === 4) {
        setTimeout(() => handlePinSubmit(newPin), 150);
      }
    }
  };

  // Login access
  const handlePinSubmit = async (pinToSubmit: string) => {
    const isAdmin = studentId.trim() === 'admin' || studentId.trim() === '00000';

    if (pinMode === 'setup') {
      // New pin
      const { error } = await supabase
        .from('evaluators')
        .upsert({
          student_id: studentId.trim(),
          name: name.trim(),
          pin: pinToSubmit,
          is_admin: isAdmin
        }, { onConflict: 'student_id' });

      if (error) {
        setErrorMsg('PIN 등록 중 오류가 발생했습니다.');
        setEnteredPin('');
        return;
      }
      
      setIsPinModalOpen(false);
      login({ studentId: studentId.trim(), name: name.trim(), ...(isAdmin && { isAdmin: true }) } as any);

    } else {
      // Last pin
      if (pinToSubmit === expectedPin) {
        setIsPinModalOpen(false);
        login({ studentId: studentId.trim(), name: name.trim(), ...(isAdmin && { isAdmin: true }) } as any);
      } else {
        setErrorMsg('PIN 번호가 일치하지 않습니다.');
        setEnteredPin('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f6] dark:bg-slate-900 flex flex-col transition-colors relative">
      
      {/* Upper */}
      <div className="flex-1"></div>

      {/* Main */}
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-[480px] bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-5 text-blue-600 dark:text-blue-400 shadow-sm">
              <UserCheck size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">면접관 로그인</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">L-INK 실시간 면접 평가 시스템</p>
          </div>

          <form onSubmit={handleNext} className="flex flex-col">
            {/* Number */}
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-slate-300 mb-2.5">
                학번 (또는 아이디)
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white text-lg font-medium placeholder-gray-400"
                placeholder="예 : 20723"
                autoFocus
              />
            </div>

            {/* Name */}
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-800 dark:text-slate-300 mb-2.5">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white text-lg font-medium placeholder-gray-400"
                placeholder="예 : 유이준"
              />
            </div>

            {/* Enter */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all mt-8 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 text-lg"
            >
              <LogIn size={22} />
              입장하기
            </button>
          </form>
        </div>
      </div>

      {/* Lower */}
      <div className="flex-1"></div>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-sm text-gray-400 dark:text-slate-500 border-t border-gray-200 dark:border-slate-800 font-medium bg-transparent">
        <p>© 2026 L-INK. All rights reserved.</p>
        <p className="mt-1.5">
          Developed by{' '}
          <a href="https://github.com/stx4R" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
            st4R
          </a>
        </p>
      </footer>

      {/* 2. Pin enter */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-[400px] bg-white dark:bg-slate-800 rounded-t-[2rem] sm:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 border border-gray-100 dark:border-slate-700">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                {pinMode === 'setup' ? '새 PIN 번호 설정' : 'PIN 번호 입력'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                {pinMode === 'setup' ? '앞으로 사용할 4자리 숫자를 입력하세요.' : '등록하신 4자리 숫자를 입력하세요.'}
              </p>
            </div>

            {/* Pin indicators */}
            <div className="flex justify-center gap-5 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < enteredPin.length ? 'bg-blue-600 scale-110 shadow-md' : 'bg-gray-200 dark:bg-slate-700'
                  }`} 
                />
              ))}
            </div>
            
            {/* Error message area */}
            <div className="h-6 mb-4 flex items-center justify-center">
              {errorMsg && <p className="text-red-500 text-sm font-bold animate-pulse">{errorMsg}</p>}
            </div>

            {/* 2 x 5 */}
            <div className="grid grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinClick(num.toString())}
                  className="py-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-2xl text-xl font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* Delete */}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setEnteredPin((prev) => prev.slice(0, -1))} 
                className="p-3.5 flex items-center justify-center text-gray-500 dark:text-slate-400 bg-gray-50 hover:bg-red-50 dark:bg-slate-700/50 dark:hover:bg-red-900/30 hover:text-red-500 rounded-2xl border border-gray-100 dark:border-slate-600 active:scale-95 transition-all"
                title="지우기"
              >
                <Delete size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Cancel */}
            <button 
              onClick={() => {
                setIsPinModalOpen(false);
                setEnteredPin('');
                setErrorMsg('');
              }}
              className="w-full mt-6 py-4 rounded-xl text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white font-bold bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-700/50 transition-colors"
            >
              로그인 취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};