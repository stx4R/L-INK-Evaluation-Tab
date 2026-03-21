import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Users, Search, Download } from 'lucide-react';

// DB에서 불러올 데이터의 타입 정의
interface Evaluation {
  id: string;
  evaluator_name: string;
  evaluator_id: string;
  applicant_name: string;
  score: number;
  comment: string;
  created_at: string;
}

export default function AdminPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 페이지가 열릴 때 DB에서 모든 데이터를 불러옵니다.
  useEffect(() => {
    const fetchAllEvaluations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        // 지원자 이름순으로 먼저 정렬하고, 그 다음 최신 작성순으로 정렬합니다.
        .order('applicant_name', { ascending: true }) 
        .order('created_at', { ascending: false });

      if (error) {
        alert('데이터를 불러오는데 실패했습니다: ' + error.message);
      } else if (data) {
        setEvaluations(data);
      }
      setIsLoading(false);
    };

    fetchAllEvaluations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">최종 면접 평가 결과 (Admin)</h1>
              <p className="text-sm text-gray-500">모든 면접관의 평가 데이터를 실시간으로 수합합니다.</p>
            </div>
          </div>
          
          <div className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            총 <span className="text-blue-600 font-bold">{evaluations.length}</span>건의 평가 데이터
          </div>
        </div>

        {/* 데이터 테이블 영역 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-4 font-semibold">지원자 이름</th>
                  <th className="p-4 font-semibold">면접관</th>
                  <th className="p-4 font-semibold">평가 점수</th>
                  <th className="p-4 font-semibold w-1/2">종합 코멘트</th>
                  <th className="p-4 font-semibold">제출 시간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      아직 제출된 평가 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  evaluations.map((evalData) => (
                    <tr key={evalData.id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">{evalData.applicant_name}</td>
                      <td className="p-4">
                        <span className="text-gray-800 font-medium">{evalData.evaluator_name}</span>
                        <span className="text-gray-500 text-sm block">({evalData.evaluator_id})</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                          {evalData.score}점
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm whitespace-pre-wrap">
                        {evalData.comment}
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {new Date(evalData.created_at).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}