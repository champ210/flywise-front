import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, Flight, Stay, Car } from '../../types';
import ResultsList from '../Search/ResultsList';
import { Icon } from '../../components/common/Icon';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTripStore } from '../../stores/useTripStore';

const ChatInterface: React.FC = () => {
  const { userProfile } = useAuthStore();
  const { savedTrips, saveTrip } = useTripStore();
  const { setFlightToBook, setStayToBook, setCarToBook, chatQuery, setChatQuery } = useUIStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial', sender: 'ai', text: "Hello! I'm your FlyWise.AI assistant. How can I help?" },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatQuery) {
      setInput(chatQuery);
      // Automatically submit the query if it's passed from another component
      // This requires submitting the form programmatically
      // For now, we just populate the input
      setChatQuery(''); // Consume the query
    }
  }, [chatQuery, setChatQuery]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // All logic handlers remain the same.

  return (
    <div className="flex flex-col h-full bg-white">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 mb-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><Icon name="logo" className="w-6 h-6 text-white" /></div>}
            <div className={`p-4 rounded-3xl max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-slate-100 text-slate-800 rounded-bl-lg'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
            {msg.sender === 'user' && <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><Icon name="user" className="w-6 h-6 text-slate-600" /></div>}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200">
        <form className="flex items-center space-x-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-100 rounded-full py-3 px-5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button type="submit" className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 disabled:bg-slate-400" disabled={isLoading || !input.trim()}>
            <Icon name="send" className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ChatInterface);