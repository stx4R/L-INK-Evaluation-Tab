import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Send, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export const ChatSection = ({ userName }: { userName: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert([{ user_name: userName, message: newMessage }]);

    if (error) {
      console.error('메시지 전송 실패:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h2 className="font-bold">실시간 채팅방</h2>
      </div>
      
      {/* Chat Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8fafc]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.user_name === userName ? 'items-end' : 'items-start'}`}>
            {/* User Name */}
            <span className="text-xs text-gray-500 mb-1 px-1">{msg.user_name}</span>
            {/* Text Bubble */}
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

      {/* Typing Section */}
      <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="메시지를 입력하세요..."
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        <button
          onClick={handleSendMessage}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};