import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Send, MessageCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export const ChatSection = ({ userName }: { userName: string }) => {
  const { currentUser } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('chat-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Kick command (admin only)
    if (newMessage.startsWith('/kick ') && currentUser?.isAdmin) {
      const parts = newMessage.trim().split(' ');
      const target = parts[1];
      const durationStr = parts[2];
      const duration = durationStr ? parseInt(durationStr, 10) : 0;

      // Block time
      const bannedUntil = duration > 0 
        ? new Date(Date.now() + duration * 1000).toISOString() 
        : null;

      // DB kick info
      await supabase.from('banned_users').upsert({
        student_id: target,
        banned_until: bannedUntil
      });

      setNewMessage('');
      return;
    }

    // Normal message insertion
    await supabase.from('chat_messages').insert([
      { user_name: userName, message: newMessage }
    ]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-gray-800">실시간 채팅</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col mb-4 ${msg.user_name === userName ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1 px-1">{msg.user_name}</span>
            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
              msg.user_name === userName 
                ? 'bg-blue-500 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={currentUser?.isAdmin ? "메시지 입력 또는 /kick [대상] [초]" : "메시지를 입력하세요..."}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};