// src/components/FinalVoteModal.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

interface ActiveVote {
  id: string;
  applicant_id: string;
  applicant_name: string;
  status: 'voting' | 'finished' | 'cancelled';
}

export const FinalVoteModal = () => {
  const { currentUser } = useStore();
  const [currentVote, setCurrentVote] = useState<ActiveVote | null>(null);
  const [showModal, setShowModal] = useState(false); // 팝업 표시 여부 독립 관리
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [results, setResults] = useState({ fail: 0, hold: 0, pass: 0 });

  useEffect(() => {
    // 1. 초기 데이터 로드
    const fetchActiveVote = async () => {
      const { data } = await supabase
        .from('active_votes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data && (data.status === 'voting' || data.status === 'finished')) {
        setCurrentVote(data);
        setShowModal(true); // 데이터가 있으면 팝업 열기
        fetchMyVote(data.id);
        fetchVoteResults(data.id);
      }
    };

    fetchActiveVote();

    // 2. 투표 상태 실시간 구독
    const voteChannel = supabase.channel('active-votes-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'active_votes' }, (payload) => {
        const newVote = payload.new as ActiveVote;
        setCurrentVote(newVote);
        setShowModal(true); // 새 투표 시작 시 팝업 열기
        setMyVote(null);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'active_votes' }, (payload) => {
        const updatedVote = payload.new as ActiveVote;
        
        if (updatedVote.status === 'cancelled') {
          setCurrentVote(null);
          setShowModal(false);
          setMyVote(null);
        } else {
          // 이전 상태를 체크하여 status가 voting -> finished로 변할 때만 팝업을 다시 강제로 띄움
          setCurrentVote(prev => {
            if (prev?.status === 'voting' && updatedVote.status === 'finished') {
              setShowModal(true);
            }
            return updatedVote;
          });

          if (updatedVote.status === 'finished') {
            fetchVoteResults(updatedVote.id);
          }
        }
      }).subscribe();

    // 3. 투표 결과 실시간 카운트
    const resultsChannel = supabase.channel('vote-results-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vote_results' }, (payload) => {
        // 결과가 추가될 때 데이터만 갱신하고, 팝업 상태(showModal)는 건드리지 않음
        setVoteCount(prev => prev + 1);
      }).subscribe();

    return () => {
      supabase.removeChannel(voteChannel);
      supabase.removeChannel(resultsChannel);
    };
  }, []); // 의존성 배열을 비워 무한 루프 방지

  const fetchMyVote = async (voteId: string) => {
    if (!currentUser) return;
    const { data } = await supabase.from('vote_results').select('vote').eq('vote_id', voteId).eq('evaluator_id', currentUser.studentId).single();
    if (data) setMyVote(data.vote);
  };

  const fetchVoteResults = async (voteId: string) => {
    const { data } = await supabase.from('vote_results').select('vote').eq('vote_id', voteId);
    if (data) {
      setVoteCount(data.length);
      const counts = { fail: 0, hold: 0, pass: 0 };
      data.forEach(row => {
        if (row.vote === 'fail') counts.fail++;
        if (row.vote === 'hold') counts.hold++;
        if (row.vote === 'pass') counts.pass++;
      });
      setResults(counts);
    }
  };

  const castVote = async (voteType: string) => {
    if (!currentVote || !currentUser) return;
    await supabase.from('vote_results').insert({
      vote_id: currentVote.id,
      evaluator_id: currentUser.studentId,
      evaluator_name: currentUser.name,
      vote: voteType
    });
    setMyVote(voteType);
  };

  // 팝업 닫기 함수
  const handleClose = () => {
    setShowModal(false);
    // currentVote를 null로 만들지 않음 (useEffect 재실행 방지)
  };

  const adminEndVote = async () => {
    if (!currentVote) return;
    await supabase.from('active_votes').update({ status: 'finished' }).eq('id', currentVote.id);
  };

  const adminCancelVote = async () => {
    if (!currentVote) return;
    await supabase.from('active_votes').update({ status: 'cancelled' }).eq('id', currentVote.id);
  };

  // 렌더링 조건: 데이터가 있고, showModal이 true일 때만 표시
  if (!currentVote || !showModal) return null;

  const totalVotes = results.fail + results.hold + results.pass || 1;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col items-center p-10 relative">
        
        {/* 투표 종료 상태에서만 노출되는 닫기 버튼 */}
        {currentVote.status === 'finished' && (
          <button 
            onClick={handleClose} 
            className="absolute top-6 right-6 p-2 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-slate-700 rounded-full transition"
          >
            <X size={24} />
          </button>
        )}

        <div className="text-center mb-8">
          <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold tracking-widest mb-4 inline-block">
            최종 평가 투표
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {currentVote.applicant_name} <span className="text-gray-500 dark:text-slate-400 text-xl font-medium">({currentVote.applicant_id})</span>
          </h2>
        </div>

        {/* 투표 진행 중 (Breathing LED 버튼) */}
        {currentVote.status === 'voting' && !myVote && (
          <div className="w-full flex gap-4 mt-4">
            <div className="flex-1 flex flex-col items-center gap-4">
              <button onClick={() => castVote('fail')} className="w-full py-8 bg-red-50 dark:bg-red-900/20 hover:bg-red-500 dark:hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-800/30 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-sm">
                불합격
              </button>
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            </div>
            
            <div className="flex-1 flex flex-col items-center gap-4">
              <button onClick={() => castVote('hold')} className="w-full py-8 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-500 dark:hover:bg-amber-600 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-200 dark:border-amber-800/30 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-sm">
                보류
              </button>
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>

            <div className="flex-1 flex flex-col items-center gap-4">
              <button onClick={() => castVote('pass')} className="w-full py-8 bg-green-50 dark:bg-green-900/20 hover:bg-green-500 dark:hover:bg-green-600 text-green-600 dark:text-green-400 hover:text-white border border-green-200 dark:border-green-800/30 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-sm">
                합격
              </button>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
          </div>
        )}

        {/* 내 투표 완료 후 대기 */}
        {currentVote.status === 'voting' && myVote && (
          <div className="flex flex-col items-center py-10">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">투표 완료</h3>
            <p className="text-gray-500 dark:text-slate-400">다른 면접관들의 투표를 기다리고 있습니다...</p>
          </div>
        )}

        {/* 투표 결과 보기 */}
        {currentVote.status === 'finished' && (
          <div className="w-full mt-4">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">투표 결과 (총 {voteCount}명)</h3>
            
            <div className="flex w-full h-12 rounded-full overflow-hidden shadow-inner mb-6 bg-gray-100 dark:bg-slate-700">
              <div style={{ width: `${(results.pass / totalVotes) * 100}%` }} className="bg-green-500 flex items-center justify-center font-bold text-white text-sm transition-all duration-500">
                {results.pass > 0 && `합 ${results.pass}`}
              </div>
              <div style={{ width: `${(results.hold / totalVotes) * 100}%` }} className="bg-amber-400 flex items-center justify-center font-bold text-white text-sm transition-all duration-500">
                {results.hold > 0 && `보 ${results.hold}`}
              </div>
              <div style={{ width: `${(results.fail / totalVotes) * 100}%` }} className="bg-red-500 flex items-center justify-center font-bold text-white text-sm transition-all duration-500">
                {results.fail > 0 && `불 ${results.fail}`}
              </div>
            </div>

            <div className="flex justify-between px-4 text-sm font-bold">
              <span className="text-green-600 dark:text-green-400">합격: {Math.round((results.pass / totalVotes) * 100)}%</span>
              <span className="text-amber-500 dark:text-amber-400">보류: {Math.round((results.hold / totalVotes) * 100)}%</span>
              <span className="text-red-500 dark:text-red-400">불합격: {Math.round((results.fail / totalVotes) * 100)}%</span>
            </div>
          </div>
        )}

        {/* 어드민 컨트롤 */}
        <div className="mt-10 w-full pt-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div className="text-gray-500 dark:text-slate-400 font-medium">
            현재 투표한 유저: <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{voteCount}</span>명
          </div>
          
          {currentUser?.isAdmin && currentVote.status === 'voting' && (
            <div className="flex gap-2">
              <button onClick={adminCancelVote} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition">
                강제 종료
              </button>
              <button onClick={adminEndVote} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md">
                투표 마감 및 결과 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};