import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Hand, CheckCircle2 } from 'lucide-react';
// import { supabase } from '../utils/supabase'; // 실제 연동 시 주석 해제

export const HandRaiseQueue: React.FC = () => {
  const { currentUser, queue, updateQueue } = useStore();

  // 실제 Supabase 실시간 구독 뼈대
  useEffect(() => {
    /*
    const channel = supabase.channel('queue_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, payload => {
        // 서버에서 큐 리스트를 다시 불러오거나 업데이트
        // fetchQueue(); 
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    */
  }, []);

  const handleRaiseHand = () => {
    if (!currentUser) return;
    const isAlreadyInQueue = queue.some(q => q.interviewerId === currentUser.studentId);
    if (isAlreadyInQueue) return;

    const newItem = {
      id: crypto.randomUUID(),
      interviewerId: currentUser.studentId,
      interviewerName: currentUser.name,
      timestamp: Date.now(),
    };
    
    // DB INSERT 로직 작성 위치
    updateQueue([...queue, newItem]);
  };

  const handleComplete = (queueId: string) => {
    // DB DELETE 로직 작성 위치
    updateQueue(queue.filter(q => q.id !== queueId));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col h-full sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Hand className="text-blue-500" /> 질문 대기열
        </h3>
        <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
          {queue.length}명 대기
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-6 min-h-[300px]">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
            <Hand size={32} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">대기 중인 면접관이 없습니다</p>
          </div>
        ) : (
          queue.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                index === 0 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' 
                  : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                }`}>
                  {index + 1}
                </div>
                <span className={`font-bold ${index === 0 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-slate-200'}`}>
                  {item.interviewerName}
                </span>
              </div>
              
              {(item.interviewerId === currentUser?.studentId || index === 0) && (
                <button 
                  onClick={() => handleComplete(item.id)}
                  className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
                  title="질문 완료"
                >
                  <CheckCircle2 size={22} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleRaiseHand}
        disabled={queue.some(q => q.interviewerId === currentUser?.studentId)}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm text-lg"
      >
        <Hand size={20} /> 
        {queue.some(q => q.interviewerId === currentUser?.studentId) ? '대기 중' : '질문하기'}
      </button>
    </div>
  );
};