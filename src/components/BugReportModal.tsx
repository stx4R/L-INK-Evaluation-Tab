import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Bug, X, CheckCircle2, Trash2 } from 'lucide-react';
import type { BugReport } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  isAdmin: boolean;
}

export const BugReportModal: React.FC<Props> = ({ isOpen, onClose, userName, isAdmin }) => {
  const [content, setContent] = useState('');
  const [reports, setReports] = useState<BugReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchReports();
    }
  }, [isOpen, isAdmin]);

  const fetchReports = async () => {
    const { data } = await supabase.from('bug_reports').select('*').order('created_at', { ascending: false });
    if (data) setReports(data);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    await supabase.from('bug_reports').insert([{ author_name: userName, content }]);
    setIsSubmitting(false);
    setContent('');
    alert('건의사항이 제출되었습니다. 감사합니다!');
    onClose();
  };

  const updateStatus = async (id: string, status: 'pending' | 'resolved') => {
    await supabase.from('bug_reports').update({ status }).eq('id', id);
    fetchReports();
  };

  const deleteReport = async (id: string) => {
    if (confirm('정말로 이 건의사항을 삭제하시겠습니까?')) {
      await supabase.from('bug_reports').delete().eq('id', id);
      fetchReports();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Bug className="text-red-500" />
            {isAdmin ? '건의사항 관리 (Admin)' : '버그 및 건의사항 제출'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {isAdmin ? (
            // Admin view
            <div className="space-y-4">
              {reports.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-slate-400 py-4">접수된 건의사항이 없습니다.</p>
              ) : (
                reports.map(report => (
                  <div key={report.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{report.author_name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {report.status === 'resolved' ? '완료' : '대기중'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{report.content}</p>
                    <div className="flex gap-2 justify-end">
                      {report.status === 'pending' && (
                        <button onClick={() => updateStatus(report.id, 'resolved')} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md">
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button onClick={() => deleteReport(report.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Normal user view
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-slate-400">시스템 이용 중 불편한 점이나 버그를 발견하셨다면 알려주세요.</p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="여기에 내용을 작성해주세요..."
                className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !content.trim()}
                className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold transition-colors"
              >
                {isSubmitting ? '제출 중...' : '제출하기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};