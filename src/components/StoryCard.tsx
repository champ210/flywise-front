import React, { useState } from 'react';
import { TravelStory, Comment } from '../../types';
import { Icon } from './Icon';
import { generateStorySummary } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface StoryCardProps {
  story: TravelStory;
  onUpdateStory: (updatedStory: TravelStory) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onUpdateStory, onEarnPoints }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(story.likes);
    const [isSaved, setIsSaved] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>(story.comments || []);
    const [newComment, setNewComment] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // States to prevent awarding points multiple times per interaction
    const [hasLiked, setHasLiked] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [hasCommented, setHasCommented] = useState(false);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateStorySummary(story.title, story.content);
            const updatedStory = {
                ...story,
                aiSummary: result.summary,
                estimatedCost: result.estimatedCost,
                tags: result.tags,
            };
            onUpdateStory(updatedStory);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate summary.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLike = () => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(newIsLiked ? likeCount + 1 : likeCount - 1);
        if (newIsLiked && !hasLiked) {
            onEarnPoints(10, 'appreciator');
            setHasLiked(true);
        }
    };

     const handleSave = () => {
        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved);
        if (newIsSaved && !hasSaved) {
            onEarnPoints(15, 'curator');
            setHasSaved(true);
        }
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % story.images.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + story.images.length) % story.images.length);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const commentToAdd: Comment = {
            id: Date.now().toString(),
            authorName: 'Valued Member', // Mock user
            authorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
            content: newComment.trim(),
            createdAt: new Date().toISOString(),
        };
        setComments(prev => [...prev, commentToAdd]);
        setNewComment('');

        if (!hasCommented) {
            onEarnPoints(25, 'conversation-starter');
            setHasCommented(true);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md transition-shadow duration-300 border border-slate-200">
            {/* Header */}
            <div className="p-4 flex items-center">
                <img src={story.authorAvatarUrl} alt={story.authorName} className="w-10 h-10 rounded-full object-cover mr-3" />
                <div>
                    <p className="font-semibold text-slate-800 text-sm">{story.authorName}</p>
                    <p className="text-xs text-slate-500">{new Date(story.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Image Carousel */}
            {story.images.length > 0 && (
                <div className="relative aspect-square bg-slate-100">
                    <img
                        src={story.images[currentImageIndex]}
                        alt={story.title}
                        className="w-full h-full object-cover"
                    />
                    {story.images.length > 1 && (
                        <>
                            <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white">
                                <Icon name="chevron-left" className="h-5 w-5" />
                            </button>
                            <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white">
                                <Icon name="chevron-right" className="h-5 w-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                                {story.images.map((_, index) => (
                                    <div key={index} className={`h-1.5 w-1.5 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
            
            {/* AI Summary Section */}
            <div className="p-4">
                {story.aiSummary ? (
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-md">
                        <h3 className="text-md font-bold text-slate-800">{story.aiSummary}</h3>
                        {story.estimatedCost && (
                            <p className="text-sm font-semibold text-slate-600">${story.estimatedCost.toLocaleString()} Estimated Budget</p>
                        )}
                    </div>
                ) : (
                    <button onClick={handleGenerateSummary} disabled={isGenerating} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
                        {isGenerating ? <LoadingSpinner/> : <Icon name="sparkles" className="h-5 w-5 mr-2" />}
                        {isGenerating ? 'Generating...' : 'Generate AI Summary & Cost'}
                    </button>
                )}
                 {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
            </div>
            
            {/* Actions */}
            <div className="px-4 pt-2 pb-1 flex justify-between items-center">
                <div className="flex space-x-4">
                    <button onClick={handleLike} className="group focus:outline-none">
                        <Icon name={isLiked ? 'heart-solid' : 'heart'} className={`h-7 w-7 transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-500'}`} />
                    </button>
                    <button onClick={() => setIsCommentsOpen(true)} className="group focus:outline-none">
                        <Icon name="chat-bubble" className="h-7 w-7 text-slate-500 transition-transform group-hover:scale-110 group-active:scale-95" />
                    </button>
                </div>
                <div>
                    <button onClick={handleSave} className="group focus:outline-none">
                        <Icon name={isSaved ? 'bookmark-solid' : 'bookmark'} className={`h-7 w-7 transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${isSaved ? 'text-green-500' : 'text-slate-500'}`} />
                    </button>
                </div>
            </div>
            
            {/* Content & Likes */}
             <div className="px-4 pb-4">
                <p className="text-sm font-semibold text-slate-800">{likeCount.toLocaleString()} likes</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed"><span className="font-bold">{story.authorName}</span> {story.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {(story.tags || []).map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">
                            #{tag}
                        </span>
                    ))}
                </div>
                 {comments.length > 0 && (
                    <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="text-sm text-slate-500 mt-2 hover:underline">
                        {isCommentsOpen ? 'Hide comments' : `View all ${comments.length} comments`}
                    </button>
                )}
            </div>

            {/* Comments */}
            {isCommentsOpen && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {comments.length > 0 ? comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
                                <div className="flex-1 bg-slate-100 rounded-lg p-3">
                                    <p className="font-semibold text-xs text-slate-800">{comment.authorName}</p>
                                    <p className="text-sm text-slate-700">{comment.content}</p>
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

export default StoryCard;
