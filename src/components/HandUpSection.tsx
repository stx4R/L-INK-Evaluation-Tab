import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Hand } from 'lucide-react'; 

export const HandUpSection = ({ userName }: { userName: string }) => {
  const [raisedHands, setRaisedHands] = useState<any[]>([]);
  const [myHand, setMyHand] = useState(false);

  useEffect(() => {
    const fetchHands = async () => {
      const { data, error } = await supabase.from('hands_up').select('*').eq('is_raised', true);
      if (data) {
        setRaisedHands(data);
        setMyHand(data.some(h => h.evaluator_name === userName));
      }
    };
    fetchHands();

    const channel = supabase.channel('hands-up-channel').on(
      'postgres_changes', { event: '*', schema: 'public', table: 'hands_up' }, () => { fetchHands(); }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userName]);

  const toggleHand = async () => {
    const newState = !myHand;
    setMyHand(newState);
    const { error } = await supabase.from('hands_up').upsert({ evaluator_name: userName, is_raised: newState }, { onConflict: 'evaluator_name' });
    if (error) {
      setMyHand(!newState);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-5 bg-slate-50 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <Hand className="w-5 h-5 text-blue-500" />
          실시간 손들기 현황
        </h2>
        <button 
          onClick={toggleHand}
          className={`px-4 py-2 rounded-xl font-bold transition shadow-sm ${
            myHand ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          {myHand ? '손 내리기' : '손 들기'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {raisedHands.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium">현재 손을 든 면접관이 없습니다.</p>
        ) : (
          raisedHands.map((hand) => (
            <span 
              key={hand.id} 
              className="px-3 py-1.5 bg-yellow-100/80 text-yellow-800 rounded-full text-sm font-bold border border-yellow-200"
            >
              ✋ {hand.evaluator_name}
            </span>
          ))
        )}
      </div>
    </div>
  );
};