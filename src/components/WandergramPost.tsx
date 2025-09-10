import React, { useState, useCallback } from 'react';
import { WandergramPost } from '../../types';
import { Icon } from './Icon';

interface WandergramPostProps {
  post: WandergramPost;
  onAskAi: (post: WandergramPost) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
}

const WandergramPostComponent: React.FC<WandergramPostProps> = ({ post, onAskAi, onAddComment, onEarnPoints }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isSaved, setIsSaved] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    
    const [hasEarnedLikePoints, setHasEarnedLikePoints] = useState(false);
    const [hasEarnedSavePoints, setHasEarnedSavePoints] = useState(false);

    const handleLike = useCallback(() => {
        setIsLiked(prev => {
            const newIsLiked = !prev;
            setLikeCount(prevCount => newIsLiked ? prevCount + 1 : prevCount - 1);
            if (newIsLiked && !hasEarnedLikePoints) {
                onEarnPoints(10, 'appreciator');
                setHasEarnedLikePoints(true);
            }
            return newIsLiked;
        });
    }, [onEarnPoints, hasEarnedLikePoints]);

    const handleSave = useCallback(() => {
        setIsSaved(prev => {
            const newIsSaved = !prev;
            if (newIsSaved && !hasEarnedSavePoints) {
                onEarnPoints(15, 'curator');
                setHasEarnedSavePoints(true);
            }
            return newIsSaved;
        });
    }, [onEarnPoints, hasEarnedSavePoints]);

    const handleDoubleClick = () => {
        if (!isLiked) {
            handleLike();
        }
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 600);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(post.id, newComment);
        setNewComment('');
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={post.user.avatarUrl} alt={post.user.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-sm">{post.user.name}</p>
                        {post.location && <p className="text-xs text-slate-500">{post.location}</p>}
                    </div>
                </div>
                <button className="p-1"><Icon name="dots-horizontal" className="h-5 w-5 text-slate-600" /></button>
            </div>

            {/* Image */}
            <div className="relative w-full aspect-square bg-slate-100" onDoubleClick={handleDoubleClick}>
                <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
                 {showLikeAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Icon name="heart-solid" className="h-24 w-24 text-white/80 drop-shadow-lg animate-[like-pop_0.6s_ease-out]" />
                         <style>{`
                            @keyframes like-pop {
                                0% { transform: scale(0); opacity: 0; }
                                50% { transform: scale(1.2); opacity: 0.9; }
                                100% { transform: scale(1); opacity: 0; }
                            }
                        `}</style>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleLike} className="group focus:outline-none">
                        <Icon name={isLiked ? 'heart-solid' : 'heart'} className={`h-7 w-7 transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-700'}`} />
                    </button>
                     <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="group focus:outline-none">
                        <Icon name="chat-bubble" className="h-7 w-7 text-slate-700 transition-transform group-hover:scale-110 group-active:scale-95" />
                    </button>
                    <button onClick={() => onAskAi(post)} className="group focus:outline-none" aria-label="Ask AI about this photo">
                        <Icon name="sparkles" className="h-7 w-7 text-slate-700 transition-transform group-hover:scale-110 group-active:scale-95" />
                    </button>
                </div>
                 <button onClick={handleSave} className="group focus:outline-none">
                    <Icon name={isSaved ? 'bookmark-solid' : 'bookmark'} className={`h-7 w-7 transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${isSaved ? 'text-slate-800' : 'text-slate-700'}`} />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 space-y-1">
                <p className="font-semibold text-sm">{likeCount.toLocaleString()} likes</p>
                <p className="text-sm text-slate-800">
                    <span className="font-semibold mr-2">{post.user.name}</span>
                    {post.caption}
                </p>
                {post.comments.length > 0 && (
                    <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="text-sm text-slate-500 pt-1 hover:underline">
                        {isCommentsOpen ? 'Hide comments' : `View all ${post.comments.length} comments`}
                    </button>
                )}
                 <p className="text-xs text-slate-500 uppercase pt-1">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Comments */}
            {isCommentsOpen && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                        {post.comments.length > 0 ? post.comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
                                <div className="flex-1 bg-slate-100 rounded-lg p-3">
                                    <p className="font-semibold text-xs text-slate-800">{comment.user.name}</p>
                                    <p className="text-sm text-slate-700">{comment.text}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 text-center py-4">Be the first to comment!</p>
                        )}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center gap-3">
                        <img src={'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop'} alt="Your avatar" className="w-8 h-8 rounded-full" />
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 block w-full rounded-full border-slate-300 bg-white placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm py-2 px-4"
                        />
                        <button type="submit" className="text-sm font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline" disabled={!newComment.trim()}>
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WandergramPostComponent;