import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useStore } from '../store/useStore';
import { Delete } from 'lucide-react';

export const Login = () => {
  const login = useStore((state) => state.login); // 스토어의 로그인 함수
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  // 팝업창 상태 관리
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'verify'>('setup');
  const [expectedPin, setExpectedPin] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1단계: 이름/학번 입력 후 다음 버튼 클릭
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId) return alert('이름과 학번을 모두 입력해주세요.');

    // DB에서 사용자 정보 확인
    const { data, error } = await supabase
      .from('evaluators')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (data) {
      // 기존 사용자
      if (data.pin_code) {
        setPinMode('verify');
        setExpectedPin(data.pin_code);
      } else {
        setPinMode('setup'); // 핀번호는 없지만 정보만 있을 경우
      }
    } else {
      // 신규 사용자
      setPinMode('setup');
    }
    
    setEnteredPin('');
    setErrorMsg('');
    setIsPinModalOpen(true); // 팝업창 띄우기
  };

  // 키패드 클릭 핸들러
  const handlePinClick = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);

      // 4자리가 모두 입력되었을 때 자동 검증
      if (newPin.length === 4) {
        verifyOrSetupPin(newPin);
      }
    }
  };

  // 2단계: 핀번호 검증 및 로그인/설정
  const verifyOrSetupPin = async (pin: string) => {
    if (pinMode === 'setup') {
      // 신규 비번 설정 및 로그인
      const { error } = await supabase
        .from('evaluators')
        .upsert({ student_id: studentId, name: name, pin_code: pin });
      
      if (error) return setErrorMsg('비밀번호 설정 중 오류가 발생했습니다.');
      login({ name, studentId }); // 로그인 처리
    } else {
      // 기존 비번 검증
      if (pin === expectedPin) {
        login({ name, studentId }); // 로그인 성공
      } else {
        setErrorMsg('비밀번호가 일치하지 않습니다.');
        setEnteredPin(''); // 초기화
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      {/* 1단계 기본 로그인 폼 (기존 디자인 스타일 적용) */}
      <form onSubmit={handleNext} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">면접관 로그인</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">이름</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              placeholder="이름을 입력하세요" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">학번</label>
            <input 
              type="text" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)} 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              placeholder="학번을 입력하세요" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold transition-colors text-lg mt-4"
          >
            다음
          </button>
        </div>
      </form>

      {/* 2차 비밀번호 팝업창 (기존 테마에 맞춘 차분한 디자인) */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-slate-700 w-full max-w-sm relative">
            <button 
              onClick={() => { setIsPinModalOpen(false); setEnteredPin(''); setErrorMsg(''); }} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
            
            <div className="text-center mb-8 mt-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {pinMode === 'setup' ? '2차 비밀번호 설정' : '2차 비밀번호 입력'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                {pinMode === 'setup' ? '사용할 숫자 4자리를 설정해주세요.' : '설정하신 숫자 4자리를 입력해주세요.'}
              </p>
            </div>

            {/* 입력 표시창 (동그라미) */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-colors ${
                    i < enteredPin.length ? 'bg-blue-500' : 'bg-gray-200 dark:bg-slate-700'
                  }`} 
                />
              ))}
            </div>
            
            {/* 에러 메시지 */}
            {errorMsg && <p className="text-red-500 text-center text-sm mb-6 font-medium">{errorMsg}</p>}

            {/* 2x5 키패드 */}
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinClick(num.toString())}
                  className="py-4 bg-gray-50 dark:bg-slate-900 rounded-2xl text-xl font-bold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors active:scale-95 border border-transparent dark:border-slate-700"
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* 지우기 버튼 */}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setEnteredPin((prev) => prev.slice(0, -1))} 
                className="p-3 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white flex items-center gap-1.5 font-medium transition-colors"
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