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

    const { data } = await supabase
      .from('evaluators')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (data) {
      if (data.pin_code) {
        setPinMode('verify');
        setExpectedPin(data.pin_code);
      } else {
        setPinMode('setup');
      }
    } else {
      setPinMode('setup');
    }
    
    setEnteredPin('');
    setErrorMsg('');
    setIsPinModalOpen(true);
  };

  const handlePinClick = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      if (newPin.length === 4) {
        verifyOrSetupPin(newPin);
      }
    }
  };

  const verifyOrSetupPin = async (pin: string) => {
    if (pinMode === 'setup') {
      const { error } = await supabase
        .from('evaluators')
        .upsert({ student_id: studentId, name: name, pin_code: pin });
      
      if (error) return setErrorMsg('비밀번호 설정 중 오류가 발생했습니다.');
      login({ name, studentId });
    } else {
      if (pin === expectedPin) {
        login({ name, studentId });
      } else {
        setErrorMsg('비밀번호가 일치하지 않습니다.');
        setEnteredPin('');
      }
    }
  };

  return (
    // Background & Centering
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      
      {/* Center Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-blue-500">
          L-INK <span className="text-white font-light">Eval</span>
        </h1>
      </div>

      {/* Login Form */}
      <form onSubmit={handleNext} className="bg-[#1e293b] p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700/50">
        <h2 className="text-xl font-bold text-center mb-8 text-white">면접관 로그인</h2>
        
        <div className="space-y-6">
          {/* Number */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">학번</label>
            <input 
              type="text" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
              placeholder="학번을 입력하세요" 
            />
          </div>
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">이름</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
              placeholder="이름을 입력하세요" 
            />
          </div>

          {/* Blue Button */}
          <button 
            type="submit" 
            className="w-full py-3.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-xl font-bold transition-colors text-base mt-2"
          >
            다음
          </button>
        </div>
      </form>

      {/* PW2 PopUp */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-sm relative">
            <button 
              onClick={() => { setIsPinModalOpen(false); setEnteredPin(''); setErrorMsg(''); }} 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-8 mt-2">
              <h3 className="text-xl font-bold text-white">
                {pinMode === 'setup' ? '2차 비밀번호 설정' : '2차 비밀번호 입력'}
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                {pinMode === 'setup' ? '사용할 숫자 4자리를 설정해주세요.' : '설정하신 숫자 4자리를 입력해주세요.'}
              </p>
            </div>

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
                className="p-2 text-slate-400 hover:text-white flex items-center gap-1.5 font-medium transition-colors"
              >
                <Delete className="w-5 h-5" /> 지우기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};