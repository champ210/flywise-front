
import React, { useState } from 'react';
import { Community } from '../types';
import { Icon } from './Icon';
import CommunityPostCard from './CommunityPostCard';
import CommunityQandA from './CommunityQandA';

interface CommunityDetailProps {
  community: Community;
  onBack: () => void;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({ community, onBack }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'qa'>('posts');

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <Icon name="chevron-left" className="h-5 w-5 mr-1" />
        Back to Communities
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="h-48 relative">
           <img 
            src={community.coverImageUrl} 
            alt={`${community.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-3xl font-bold">{community.name}</h2>
            <div className="flex items-center text-sm mt-1">
                <Icon name="users" className="h-4 w-4 mr-2" />
                <span>{community.memberCount.toLocaleString()} members</span>
            </div>
          </div>
        </div>
        <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <p className="text-sm text-slate-700">{community.description}</p>
                 <button className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    Join Community
                 </button>
            </div>
        </div>
      </div>

      {/* Feed */}
      <div className="mt-6">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('posts')}
              className={`${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`${
                activeTab === 'qa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Q&A
            </button>
          </nav>
        </div>
        
        <div className="mt-6">
          {activeTab === 'posts' && (
            <>
              {/* Create Post Input */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" alt="Your avatar" className="w-9 h-9 rounded-full" />
                  <input 
                      type="text"
                      placeholder="Share your thoughts or ask a question..."
                      className="w-full bg-slate-100 rounded-full border-transparent focus:ring-2 focus:ring-blue-500 px-4 py-2 text-sm"
                  />
              </div>

              {/* Posts */}
              <div className="mt-4 space-y-4">
                  {community.posts.length > 0 ? (
                      community.posts.map(post => <CommunityPostCard key={post.id} post={post} />)
                  ) : (
                      <div className="text-center p-10 bg-white rounded-lg border border-slate-200">
                          <Icon name="chat" className="mx-auto h-12 w-12 text-slate-400" />
                          <h3 className="mt-2 text-sm font-medium text-slate-900">No posts yet</h3>
                          <p className="mt-1 text-sm text-slate-500">Be the first to share something in this community!</p>
                      </div>
                  )}
              </div>
            </>
          )}

          {activeTab === 'qa' && (
            <>
              {community.questions && community.questions.length > 0 ? (
                <CommunityQandA questions={community.questions} />
              ) : (
                <div className="text-center p-10 bg-white rounded-lg border border-slate-200">
                  <Icon name="question-mark-circle" className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No Questions Asked Yet</h3>
                  <p className="mt-1 text-sm text-slate-500">Have a question? Be the first to ask the community!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;