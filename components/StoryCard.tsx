import React, { useState } from 'react';
import { TravelStory, Comment } from '../types';
import { Icon } from './Icon';

interface StoryCardProps {
  story: TravelStory;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likes);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(story.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
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
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-slate-200 animate-fade-in-up">
      {/* Image Carousel */}
      {story.images.length > 0 && (
        <div className="relative h-56 sm:h-64">
          <img
            src={story.images[currentImageIndex]}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          {story.images.length > 1 && (
            <>
              <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white">
                <Icon name="chevron-left" className="h-5 w-5" />
              </button>
              <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white">
                <Icon name="chevron-right" className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                {story.images.map((_, index) => (
                  <div key={index} className={`h-1.5 w-1.5 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <img src={story.authorAvatarUrl} alt={story.authorName} className="w-10 h-10 rounded-full object-cover mr-3" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{story.authorName}</p>
            <p className="text-xs text-slate-500">{new Date(story.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900">{story.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {story.locationTags.map(tag => (
            <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium flex items-center">
              <Icon name="map" className="h-3 w-3 mr-1.5" />
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{story.content}</p>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-start items-center space-x-6">
        <button onClick={handleLike} className="flex items-center space-x-2 text-slate-600 hover:text-red-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLiked ? 'text-red-500' : 'text-slate-400'}`} fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
          <span className="font-semibold text-sm">{likeCount.toLocaleString()}</span>
        </button>
        <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="flex items-center space-x-2 text-slate-600 hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-semibold text-sm">{comments.length}</span>
        </button>
      </div>

      {isCommentsOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 animate-fade-in">
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