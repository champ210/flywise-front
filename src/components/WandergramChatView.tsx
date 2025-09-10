import React, { useState, useRef, useEffect } from 'react';
import { WandergramConversation, WandergramChatMessage } from '../../types';
import { Icon } from './Icon';

interface WandergramChatViewProps {
  conversation: WandergramConversation;
  onSendMessage: (conversationId: string, text: string) => void;
  onBack: () => void;
}

const WandergramChatView: React.FC<WandergramChatViewProps> = ({ conversation, onSendMessage, onBack }) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [conversation.messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(conversation.id, input.trim());
        setInput('');
    };

    return (
        <div className="h-[calc(100vh - 160px)] sm:h-[calc(95vh-150px)] flex flex-col bg-white">
            <header className="flex-shrink-0 p-3 border-b border-slate-200/80 flex items-center gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200/60">
                    <Icon name="chevron-left" className="h-6 w-6 text-slate-700" />
                </button>
                <img src={conversation.user.avatarUrl} alt={conversation.user.name} className="w-9 h-9 rounded-full object-cover" />
                <h2 className="text-base font-bold text-slate-800">{conversation.user.name}</h2>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                 {conversation.messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === 'currentUser' ? 'justify-end' : 'justify-start'}`} >
                       <p className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 text-sm break-words ${msg.senderId === 'currentUser' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                           {msg.text}
                       </p>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </main>

            <footer className="flex-shrink-0 p-3 border-t border-slate-200/80 bg-white">
                 <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 w-full rounded-full border-transparent bg-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm py-2.5 px-4"
                    />
                    <button type="submit" disabled={!input.trim()} className="px-4 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed">
                        Send
                    </button>
                 </form>
            </footer>
        </div>
    );
};

export default WandergramChatView;