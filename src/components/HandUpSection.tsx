import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Hand } from 'lucide-react'; // 아이콘

export const HandUpSection = ({ userName }: { userName: string }) => {
  const [raisedHands, setRaisedHands] = useState<any[]>([]);
  const [myHand, setMyHand] = useState(false);

  useEffect(() => {
    // 1. 현재 손 든 사람들 목록 가져오기
    const fetchHands = async () => {
      const { data, error } = await supabase
        .from('hands_up')
        .select('*')
        .eq('is_raised', true);

      if (error) {
        console.error('데이터 불러오기 에러:', error);
        return;
      }

      if (data) {
        setRaisedHands(data);
        setMyHand(data.some(h => h.evaluator_name === userName));
      }
    };
    
    // 컴포넌트 마운트 시 최초 1회 실행
    fetchHands();

    // 2. 실시간 감지 채널 설정
    const channel = supabase
      .channel('hands-up-channel') // 채널 이름 구체화
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'hands_up' }, 
        (payload) => {
          console.log('🔥 [실시간 감지됨!] 누군가 상태를 바꿨습니다:', payload);
          fetchHands(); // 변화가 감지되면 서버에서 최신 목록 다시 긁어오기
        }
      )
      .subscribe((status) => {
        // 실시간 연결이 제대로 되었는지 확인하는 로그
        console.log('📡 [실시간 연결 상태]:', status); 
      });

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [userName]);

  // 손들기 버튼 클릭 함수
  const toggleHand = async () => {
    const newState = !myHand; // 변경될 상태
    setMyHand(newState); // 내 화면 즉시 반영 (반응속도 향상)

    const { error } = await supabase
      .from('hands_up')
      .upsert(
        { evaluator_name: userName, is_raised: newState }, 
        { onConflict: 'evaluator_name' }
      );
    
    if (error) {
      console.error('상태 업데이트 실패:', error);
      setMyHand(!newState); // 실패 시 원래대로 복구
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Hand className="w-5 h-5 text-blue-500" />
          실시간 손들기 현황
        </h2>
        <button 
          onClick={toggleHand}
          className={`px-4 py-2 rounded-md font-medium transition ${
            myHand ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {myHand ? '손 내리기' : '손 들기'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {raisedHands.length === 0 ? (
          <p className="text-gray-400 text-sm">현재 손을 든 면접관이 없습니다.</p>
        ) : (
          raisedHands.map((hand) => (
            <span 
              key={hand.id} 
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold border border-yellow-200 shadow-sm"
            >
              ✋ {hand.evaluator_name}
            </span>
          ))
        )}
      </div>
    </div>
  );
};