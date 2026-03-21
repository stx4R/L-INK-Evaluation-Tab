import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Users, Search, Calculator } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllEvaluations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('applicant_name', { ascending: true }) 
        .order('created_at', { ascending: false });

      if (data) setEvaluations(data);
      setIsLoading(false);
    };

    fetchAllEvaluations();
  }, []);

  const filteredEvaluations = evaluations.filter((evalData) => 
    evalData.applicant_name.includes(searchTerm) || 
    evalData.evaluator_id.includes(searchTerm)
  );

  const averageScore = filteredEvaluations.length > 0 
    ? (filteredEvaluations.reduce((sum, curr) => sum + curr.score, 0) / filteredEvaluations.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header*/}
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
          
          {/* Average Score Cards */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <span className="text-sm text-gray-500 font-medium">조회된 평가</span>
              <span className="text-blue-600 font-bold">{filteredEvaluations.length}건</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl shadow-sm border border-blue-100">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">평균 점수</span>
              <span className="text-blue-700 font-extrabold">{averageScore}점</span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="학번, 이름, 또는 면접관 ID로 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* DataTable Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-4 font-semibold">지원자(학번)</th>
                  <th className="p-4 font-semibold">면접관</th>
                  <th className="p-4 font-semibold">평가 점수</th>
                  <th className="p-4 font-semibold w-1/2">종합 코멘트</th>
                  <th className="p-4 font-semibold">제출 시간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">데이터를 불러오는 중입니다...</td>
                  </tr>
                ) : filteredEvaluations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">검색 결과가 없습니다.</td>
                  </tr>
                ) : (
                  filteredEvaluations.map((evalData) => (
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
                      <td className="p-4 text-gray-600 text-sm whitespace-pre-wrap">{evalData.comment}</td>
                      <td className="p-4 text-gray-400 text-xs">{new Date(evalData.created_at).toLocaleString('ko-KR')}</td>
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