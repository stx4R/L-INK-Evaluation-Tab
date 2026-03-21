import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { HandUpSection } from '../components/HandUpSection'; // 방금 만든 컴포넌트
import { Save, LogOut, User, ClipboardList } from 'lucide-react';

// 로그인 시 전달받은 유저 정보 타입 (프로젝트에 맞게 수정 가능)
interface UserInfo {
  name: string;
  studentId: string;
}

export default function EvaluationPage({ user, onLogout }: { user: UserInfo, onLogout: () => void }) {
  const [applicantName, setApplicantName] = useState('');
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 문제 2 해결: 페이지 접속 시 해당 면접관이 이전에 썼던 데이터가 있는지 불러오기
  useEffect(() => {
    const loadExistingData = async () => {
      if (!applicantName) return; // 지원자 이름을 입력했을 때 해당 데이터 검색
      
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
        // 데이터가 없으면 초기화
        setScore(0);
        setComment('');
      }
    };
    loadExistingData();
  }, [applicantName, user.studentId]);

  // 문제 2 해결: 데이터 저장 함수
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 상단 헤더 */}
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
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>

        {/* 문제 1 해결: 실시간 손들기 섹션 */}
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

            {/* 저장 버튼 */}
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