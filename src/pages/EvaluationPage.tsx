import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { HandUpSection } from '../components/HandUpSection'; 
import { Save, LogOut, User, ClipboardList, KeyRound, Delete } from 'lucide-react';

// 로그인 시 전달받은 유저 정보 타입
interface UserInfo {
  name: string;
  studentId: string;
}

export default function EvaluationPage({ user, onLogout }: { user: UserInfo, onLogout: () => void }) {
  const [applicantName, setApplicantName] = useState('');
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2차 비번 변경 관련 상태
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  // 페이지 접속 시 해당 면접관이 이전에 썼던 데이터가 있는지 불러오기
  useEffect(() => {
    const loadExistingData = async () => {
      if (!applicantName) return; 
      
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('evaluator_id', user.studentId)
        .eq('applicant_name', applicantName)
        .single();

      if (data) {
        setScore(data.score);
        setComment(data.comment);
      } else {
        setScore(0);
        setComment('');
      }
    };
    loadExistingData();
  }, [applicantName, user.studentId]);

  // 평가 내용 DB 저장 함수
  const handleSave = async () => {
    if (!applicantName) return alert('지원자 이름을 입력해주세요.');
    
    setIsLoading(true);
    const { error } = await supabase
      .from('evaluations')
      .upsert({
        evaluator_id: user.studentId,
        evaluator_name: user.name,
        applicant_name: applicantName,
        score: score,
        comment: comment,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'evaluator_id, applicant_name' });

    setIsLoading(false);

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      alert('데이터베이스에 안전하게 저장되었습니다.');
    }
  };

  // 2차 비번 변경 로직: 키패드 클릭
  const handlePinClick = (num: string) => {
    if (newPin.length < 4) {
      const updatedPin = newPin + num;
      setNewPin(updatedPin);
      
      // 4자리 모두 입력 시 자동 변경 시도
      if (updatedPin.length === 4) {
        handleChangePin(updatedPin);
      }
    }
  };

  // 2차 비번 DB 업데이트 함수
  const handleChangePin = async (pin: string) => {
    const { error } = await supabase
      .from('evaluators')
      .update({ pin_code: pin })
      .eq('student_id', user.studentId);
      
    if (!error) {
      setPinMessage('✅ 비밀번호가 성공적으로 변경되었습니다!');
      // 1.5초 뒤 팝업 닫기 및 초기화
      setTimeout(() => { 
        setIsChangePinOpen(false); 
        setNewPin(''); 
        setPinMessage(''); 
      }, 1500);
    } else {
      setPinMessage('❌ 변경 실패. 다시 시도해주세요.');
      setNewPin(''); // 틀렸을 시 다시 입력하도록 비움
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* 2차 비밀번호 변경 모달 팝업 */}
      {isChangePinOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm relative border border-gray-200">
            {/* 닫기 버튼 */}
            <button 
              onClick={() => { setIsChangePinOpen(false); setNewPin(''); setPinMessage(''); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <KeyRound className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">2차 비밀번호 변경</h3>
              <p className="text-sm text-gray-500 mt-1">새로 사용할 숫자 4자리를 입력하세요.</p>
            </div>
            
            {/* 핀 번호 입력 표시창 (동그라미) */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full ${i < newPin.length ? 'bg-yellow-500' : 'bg-gray-200'}`} 
                />
              ))}
            </div>
            
            {/* 결과 메시지 */}
            {pinMessage && <p className="text-center text-sm mb-4 font-bold text-blue-600">{pinMessage}</p>}

            {/* 숫자 키패드 (2x5 배열) */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num} 
                  onClick={() => handlePinClick(num.toString())}
                  className="py-4 bg-gray-50 rounded-xl text-xl font-bold text-gray-800 hover:bg-yellow-50 hover:text-yellow-600 transition active:scale-95"
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* 지우기 버튼 */}
            <button 
              onClick={() => setNewPin(newPin.slice(0, -1))} 
              className="w-full mt-4 p-3 text-gray-500 flex justify-center items-center gap-2 hover:bg-gray-100 rounded-lg transition font-medium"
            >
              <Delete className="w-5 h-5" /> 마지막 입력 지우기
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* 상단 헤더 영역 */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">면접관</p>
              <p className="font-bold text-gray-800">{user.name} ({user.studentId})</p>
            </div>
          </div>
          
          {/* 우측 버튼 그룹: 2차 비번 변경 & 로그아웃 */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsChangePinOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-xl text-xs md:text-sm font-bold transition border border-yellow-200"
            >
              <KeyRound className="w-4 h-4" />
              <span className="hidden sm:inline">2차 비번 변경</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition text-sm font-medium"
            >
              <LogOut className="w-5 h-5" /> 
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>

        {/* 실시간 손들기 섹션 */}
        <div className="mb-8">
          <HandUpSection userName={user.name} />
        </div>

        {/* 평가 입력 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 p-4 text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            <h2 className="font-semibold">면접 평가 작성</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* 지원자 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지원자 이름</label>
              <input 
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="지원자 이름을 입력하면 이전 기록을 불러옵니다."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 점수 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">평가 점수 (0~100)</label>
              <input 
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* 코멘트 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종합 의견</label>
              <textarea 
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="지원자에 대한 상세한 피드백을 적어주세요."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* 저장 버튼 (DB로 데이터 전송) */}
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
              }`}
            >
              <Save className="w-5 h-5" />
              {isLoading ? '저장 중...' : '평가 내용 데이터베이스에 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}