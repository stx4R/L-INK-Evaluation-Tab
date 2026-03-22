import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useStore } from '../store/useStore';
import { Delete } from 'lucide-react';

export const Login = () => {
  const login = useStore((state) => state.login);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'verify'>('setup');
  const [expectedPin, setExpectedPin] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId) return alert('학번과 이름을 모두 입력해주세요.');

    // Login flow
    const { data: banData } = await supabase
      .from('banned_users')
      .select('*')
      .in('student_id', [studentId, name]);

    if (banData && banData.length > 0) {
      // Ban record
      const activeBan = banData.find(b => b.banned_until && new Date(b.banned_until).getTime() > Date.now());
      if (activeBan) {
        const diff = new Date(activeBan.banned_until).getTime() - Date.now();
        const secs = Math.ceil(diff / 1000);
        return alert(`🚨 접속이 제한된 계정입니다. (${secs}초 후 다시 시도해주세요.)`);
      }
    }

    // Pin check
    const { data } = await supabase
      .from('evaluators')
      .select('*')
      .eq('student_id', studentId)
      .eq('name', name)
      .single();

    if (data && data.pin) {
      setPinMode('verify');
      setExpectedPin(data.pin);
      setIsPinModalOpen(true);
    } else {
      setPinMode('setup');
      setExpectedPin(null);
      setIsPinModalOpen(true);
    }
  };

  const handlePinClick = (num: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin((prev) => prev + num);
      setErrorMsg('');
    }
  };

  useEffect(() => {
    if (enteredPin.length === 4) {
      setTimeout(() => submitPin(), 200);
    }
  }, [enteredPin]);

  const submitPin = async () => {
    if (pinMode === 'setup') {
      const { error } = await supabase.from('evaluators').upsert({
        student_id: studentId,
        name: name,
        pin: enteredPin
      }, { onConflict: 'student_id' });

      if (error) {
        setErrorMsg('PIN 등록 중 오류가 발생했습니다.');
        setEnteredPin('');
      } else {
        login({ studentId, name });
        setIsPinModalOpen(false);
      }
    } else {
      if (enteredPin === expectedPin) {
        login({ studentId, name });
        setIsPinModalOpen(false);
      } else {
        setErrorMsg('PIN 코드가 일치하지 않습니다.');
        setEnteredPin('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f6] flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">L-INK 면접 시스템</h1>
          <p className="text-gray-500 text-sm">면접관 정보를 입력해주세요.</p>
        </div>
        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">학번 (예: 10204)</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="학번을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">이름 (예: 홍길동)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이름을 입력하세요"
            />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition mt-4">
            다음으로
          </button>
        </form>
      </div>

      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-8 rounded-[32px] shadow-2xl w-[320px] animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white text-center mb-2">
              {pinMode === 'setup' ? '새 PIN 코드 설정' : 'PIN 코드 입력'}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              {pinMode === 'setup' ? '앞으로 사용할 4자리 숫자를 입력하세요.' : '등록된 4자리 숫자를 입력하세요.'}
            </p>
            
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-colors ${
                    i < enteredPin.length ? 'bg-blue-500' : 'bg-[#0f172a] border border-slate-600'
                  }`} 
                />
              ))}
            </div>
            
            {errorMsg && <p className="text-red-400 text-center text-sm mb-6 font-medium">{errorMsg}</p>}

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinClick(num.toString())}
                  className="py-4 bg-[#0f172a] rounded-xl text-xl font-bold text-white hover:bg-slate-700 active:scale-95 transition-all border border-slate-700"
                >
                  {num}
                </button>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setEnteredPin((prev) => prev.slice(0, -1))} 
                className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 active:scale-95 transition-all"
              >
                <Delete size={24} />
              </button>
            </div>
            <button 
              onClick={() => setIsPinModalOpen(false)} 
              className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};