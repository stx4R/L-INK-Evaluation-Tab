import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useStore } from '../store/useStore';
import { ShieldCheck, Delete } from 'lucide-react';

export const Login = () => {
  const login = useStore((state) => state.login); // 스토어 로그인 함수 (zustand 설정에 맞게 변경)
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

      // 4자리가 모두 입력되었을 때
      if (newPin.length === 4) {
        verifyOrSetupPin(newPin);
      }
    }
  };

  // 핀번호 지우기
  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
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
        setErrorMsg('비밀번호가 틀렸습니다.');
        setEnteredPin(''); // 초기화
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 1단계 기본 폼 */}
      <form onSubmit={handleNext} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">면접관 로그인</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="홍길동" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학번</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="20240001" />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
            다음 단계
          </button>
        </div>
      </form>

      {/* 2차 비밀번호 팝업창 */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm relative">
            <button onClick={() => setIsPinModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
            <div className="text-center mb-6">
              <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">
                {pinMode === 'setup' ? '2차 비밀번호 설정' : '2차 비밀번호 입력'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {pinMode === 'setup' ? '앞으로 사용할 숫자 4자리를 설정하세요.' : '설정하신 숫자 4자리를 입력하세요.'}
              </p>
            </div>

            {/* 입력 표시창 */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${i < enteredPin.length ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
            </div>
            
            {/* 에러 메시지 */}
            {errorMsg && <p className="text-red-500 text-center text-sm mb-4 font-bold">{errorMsg}</p>}

            {/* 2x5 키패드 */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinClick(num.toString())}
                  className="py-4 bg-gray-50 rounded-xl text-xl font-bold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition active:scale-95"
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* 지우기 버튼 */}
            <div className="mt-2 flex justify-end">
              <button onClick={handleDelete} className="p-3 text-gray-500 hover:text-red-500 flex items-center gap-1 font-medium">
                <Delete className="w-5 h-5" /> 지우기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};