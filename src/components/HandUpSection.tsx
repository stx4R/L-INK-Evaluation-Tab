import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Hand } from 'lucide-react'; // 아이콘 추가

export const HandUpSection = ({ userName }: { userName: string }) => {
  const [raisedHands, setRaisedHands] = useState<any[]>([]);
  const [myHand, setMyHand] = useState(false);

  useEffect(() => {
    const fetchHands = async () => {
      const { data } = await supabase.from('hands_up').select('*').eq('is_raised', true);
      if (data) {
        setRaisedHands(data);
        // 내가 손을 들고 있는지 확인
        setMyHand(data.some(h => h.evaluator_name === userName));
      }
    };
    fetchHands();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hands_up' }, 
      () => {
        fetchHands();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userName]);

  const toggleHand = async () => {
    const { error } = await supabase
      .from('hands_up')
      .upsert({ evaluator_name: userName, is_raised: !myHand }, { onConflict: 'evaluator_name' });
    
    if (!error) setMyHand(!myHand);
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
            myHand ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
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