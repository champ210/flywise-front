import React from 'react';
import { WandergramConversation } from '../types';
import { Icon } from './Icon';

interface WandergramChatListProps {
  conversations: WandergramConversation[];
  onSelectConversation: (conversationId: string) => void;
  onBack: () => void;
}

const WandergramChatList: React.FC<WandergramChatListProps> = ({ conversations, onSelectConversation, onBack }) => {
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}y`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}mo`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}m`;
        return `${Math.floor(seconds)}s`;
    };

    return (
        <div className="max-w-xl mx-auto animate-fade-in-up">
            <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-3 border-b border-slate-200/80 flex items-center">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200/60">
                    <Icon name="chevron-left" className="h-6 w-6 text-slate-700" />
                </button>
                <h2 className="text-lg font-bold text-slate-800 mx-auto">Messages</h2>
                 <div className="w-10"></div> {/* Spacer */}
            </header>
            <div className="divide-y divide-slate-100">
                {conversations.map(convo => {
                    const lastMessage = convo.messages[convo.messages.length - 1];
                    return (
                        <button key={convo.id} onClick={() => onSelectConversation(convo.id)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-slate-100/70 transition-colors">
                            <img src={convo.user.avatarUrl} alt={convo.user.name} className="w-14 h-14 rounded-full object-cover" />
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold text-slate-800">{convo.user.name}</p>
                                <p className="text-sm text-slate-500 truncate">
                                    {lastMessage.senderId === 'currentUser' && 'You: '}{lastMessage.text}
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 self-start">{timeSince(lastMessage.createdAt)}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default WandergramChatList;