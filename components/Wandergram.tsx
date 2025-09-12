import React, { useState } from 'react';
import { WandergramPost, WandergramStory, WandergramConversation, UserProfile } from '../types';
import WandergramStories from './WandergramStories';
import WandergramPostComponent from './WandergramPost';
import WandergramChatList from './WandergramChatList';
import WandergramChatView from './WandergramChatView';
import SocialFeed from './SocialFeed';
import { Icon } from './Icon';

interface WandergramProps {
    stories: WandergramStory[];
    posts: WandergramPost[];
    userProfile: UserProfile;
    onOpenCreateModal: () => void;
    onAskAi: (post: WandergramPost) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onEarnPoints: (points: number, badgeId?: string) => void;
    onPlanTrip: (post: WandergramPost) => void;
    // Chat props
    conversations: WandergramConversation[];
    activeView: 'feed' | 'chatList' | 'chat';
    activeConversationId: string | null;
    onNavigate: (view: 'feed' | 'chatList') => void;
    onSelectConversation: (conversationId: string) => void;
    onSendMessage: (conversationId: string, text: string) => void;
}

const Wandergram: React.FC<WandergramProps> = ({ 
    stories, 
    posts,
    userProfile,
    onOpenCreateModal, 
    onAskAi, 
    onAddComment,
    onEarnPoints,
    onPlanTrip,
    conversations,
    activeView,
    activeConversationId,
    onNavigate,
    onSelectConversation,
    onSendMessage
}) => {
    const [activeFeedTab, setActiveFeedTab] = useState<'following' | 'discovery'>('following');

    const handleUpdatePost = (updatedPost: WandergramPost) => {
        // This is a placeholder. In a real app with a global state manager (like Redux or Zustand),
        // you would dispatch an action here to update the post in the central store.
        // For this component structure, we assume the parent `App.tsx` handles state updates.
        console.log("Post updated:", updatedPost);
    };
    
    const renderFeed = () => (
        <>
            <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-slate-200/80 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">Wandergram</h1>
                <div className="flex items-center gap-2">
                    <button onClick={onOpenCreateModal} className="p-2 rounded-full hover:bg-slate-200/60" aria-label="Create new post">
                        <Icon name="plus" className="h-6 w-6 text-slate-700" />
                    </button>
                    <button onClick={() => onNavigate('chatList')} className="p-2 rounded-full hover:bg-slate-200/60" aria-label="View messages">
                        <Icon name="send" className="h-6 w-6 text-slate-700" />
                    </button>
                </div>
            </header>
            <WandergramStories stories={stories} />
            <div className="flex justify-center border-b border-slate-200/80">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveFeedTab('following')} className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${activeFeedTab === 'following' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        Following
                    </button>
                    <button onClick={() => setActiveFeedTab('discovery')} className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${activeFeedTab === 'discovery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        <Icon name="sparkles" className="h-5 w-5" /> Discovery
                    </button>
                </nav>
            </div>
            
            {activeFeedTab === 'following' ? (
                 <div className="py-6 space-y-6">
                    {posts.map(post => (
                        <WandergramPostComponent key={post.id} post={post} onAskAi={onAskAi} onAddComment={onAddComment} onEarnPoints={onEarnPoints} onPlanTrip={onPlanTrip} />
                    ))}
                </div>
            ) : (
                <SocialFeed
                    posts={posts}
                    userProfile={userProfile}
                    onUpdatePost={handleUpdatePost}
                    onEarnPoints={onEarnPoints}
                    onAddComment={onAddComment}
                    onAskAi={onAskAi}
                    onPlanTrip={onPlanTrip}
                />
            )}
        </>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'chatList':
                return <WandergramChatList conversations={conversations} onSelectConversation={onSelectConversation} onBack={() => onNavigate('feed')} />;
            case 'chat':
                const activeConversation = conversations.find(c => c.id === activeConversationId);
                if (!activeConversation) {
                    return <WandergramChatList conversations={conversations} onSelectConversation={onSelectConversation} onBack={() => onNavigate('feed')} />;
                }
                return <WandergramChatView conversation={activeConversation} onSendMessage={onSendMessage} onBack={() => onNavigate('chatList')} />;
            case 'feed':
            default:
                return renderFeed();
        }
    }

    return (
        <div className="max-w-xl mx-auto">
           {renderContent()}
        </div>
    );
}

export default Wandergram;