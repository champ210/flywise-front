import React from 'react';
import { CommunityPost } from '../types';
import { Icon } from './Icon';

interface CommunityPostCardProps {
  post: CommunityPost;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post }) => {

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${post.isPinned ? 'border-blue-300' : 'border-slate-200'}`}>
      {post.isPinned && (
        <div className="px-4 py-1 bg-blue-50 text-blue-700 text-xs font-semibold flex items-center border-b border-blue-200">
          <Icon name="bookmark" className="h-4 w-4 mr-2" />
          Pinned Post
        </div>
      )}
      <div className="p-4 flex items-start gap-4">
        <img 
          src={post.author.avatarUrl}
          alt={post.author.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <p className="font-semibold text-sm text-slate-800">{post.author.name}</p>
            <p className="text-xs text-slate-500">{timeSince(post.createdAt)}</p>
          </div>
          <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
