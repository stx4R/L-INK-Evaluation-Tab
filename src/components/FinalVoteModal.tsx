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
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [results, setResults] = useState({ fail: 0, hold: 0, pass: 0 });

  // Live vote status
  useEffect(() => {
    const fetchActiveVote = async () => {
      const { data } = await supabase
        .from('active_votes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data && (data.status === 'voting' || data.status === 'finished')) {
        setCurrentVote(data);
        fetchMyVote(data.id);
        fetchVoteResults(data.id);
      } else {
        setCurrentVote(null);
      }
    };

    fetchActiveVote();

    // 1. Vote main page
    const voteChannel = supabase.channel('active-votes-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_votes' }, (payload) => {
        const newVote = payload.new as ActiveVote;
        if (newVote.status === 'cancelled') {
          setCurrentVote(null);
          setMyVote(null);
        } else {
          setCurrentVote(newVote);
          if (newVote.status === 'finished') fetchVoteResults(newVote.id);
        }
      }).subscribe();

    // 2. voter status
    const resultsChannel = supabase.channel('vote-results-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vote_results' }, (payload) => {
        if (currentVote?.status === 'voting') {
          setVoteCount(prev => prev + 1);
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(voteChannel);
      supabase.removeChannel(resultsChannel);
    };
  }, [currentVote?.status]);

  const fetchMyVote = async (voteId: string) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('vote_results')
      .select('vote')
      .eq('vote_id', voteId)
      .eq('evaluator_id', currentUser.studentId)
      .single();
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

  const adminEndVote = async () => {
    if (!currentVote) return;
    await supabase.from('active_votes').update({ status: 'finished' }).eq('id', currentVote.id);
  };

  const adminCancelVote = async () => {
    if (!currentVote) return;
    await supabase.from('active_votes').update({ status: 'cancelled' }).eq('id', currentVote.id);
    setCurrentVote(null);
    setMyVote(null);
  };

  const closeResult = () => {
    setCurrentVote(null);
    setMyVote(null);
  };

  if (!currentVote) return null;

  const totalVotes = results.fail + results.hold + results.pass || 1;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col items-center p-10 relative">
        
        {/* Close button */}
        {currentVote.status === 'finished' && (
          <button onClick={closeResult} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        )}

        <div className="text-center mb-8">
          <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold tracking-widest mb-4 inline-block">
            최종 평가 투표
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {currentVote.applicant_name} <span className="text-gray-500 text-xl font-medium">({currentVote.applicant_id})</span>
          </h2>
        </div>

        {/* 1. Voting status */}
        {currentVote.status === 'voting' && !myVote && (
          <div className="w-full flex gap-4 mt-4">
            <button onClick={() => castVote('fail')} className="flex-1 py-8 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-sm">
              불합격
            </button>
            <button onClick={() => castVote('hold')} className="flex-1 py-8 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-sm">
              보류
            </button>
            <button onClick={() => castVote('pass')} className="flex-1 py-8 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white border border-green-200 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-sm">
              합격
            </button>
          </div>
        )}

        {/* 2. My vote completed status */}
        {currentVote.status === 'voting' && myVote && (
          <div className="flex flex-col items-center py-10">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">투표 완료</h3>
            <p className="text-gray-500">다른 면접관들의 투표를 기다리고 있습니다...</p>
          </div>
        )}

        {/* 3. Result status */}
        {currentVote.status === 'finished' && (
          <div className="w-full mt-4">
            <h3 className="text-xl font-bold text-center mb-6">투표 결과 (총 {voteCount}명)</h3>
            
            <div className="flex w-full h-12 rounded-full overflow-hidden shadow-inner mb-6">
              <div style={{ width: `${(results.pass / totalVotes) * 100}%` }} className="bg-green-500 transition-all duration-1000 flex items-center justify-center font-bold text-white text-sm" title="합격">
                {results.pass > 0 && `합 ${results.pass}`}
              </div>
              <div style={{ width: `${(results.hold / totalVotes) * 100}%` }} className="bg-amber-400 transition-all duration-1000 flex items-center justify-center font-bold text-white text-sm" title="보류">
                {results.hold > 0 && `보 ${results.hold}`}
              </div>
              <div style={{ width: `${(results.fail / totalVotes) * 100}%` }} className="bg-red-500 transition-all duration-1000 flex items-center justify-center font-bold text-white text-sm" title="불합격">
                {results.fail > 0 && `불 ${results.fail}`}
              </div>
            </div>

            <div className="flex justify-between px-4 text-sm font-semibold text-gray-600">
              <span className="text-green-600">합격: {Math.round((results.pass / totalVotes) * 100)}%</span>
              <span className="text-amber-500">보류: {Math.round((results.hold / totalVotes) * 100)}%</span>
              <span className="text-red-500">불합격: {Math.round((results.fail / totalVotes) * 100)}%</span>
            </div>
          </div>
        )}

        {/* 4. Bottom vote progress information and admin controls */}
        <div className="mt-10 w-full pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="text-gray-500 font-medium">
            현재 투표한 유저: <span className="text-blue-600 font-bold text-lg">{voteCount}</span>명
          </div>
          
          {currentUser?.isAdmin && currentVote.status === 'voting' && (
            <div className="flex gap-2">
              <button onClick={adminCancelVote} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition">
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