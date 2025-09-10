import React from 'react';
import { WandergramPost, AIDiscoveryData } from '../../types';
import WandergramPostComponent from './WandergramPost';
import { Icon } from './Icon';

interface DiscoveryHubProps {
  posts: WandergramPost[];
  discoveryData: AIDiscoveryData | null;
  isLoading: boolean;
  onUpdatePost: (post: WandergramPost) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onAskAi: (post: WandergramPost) => void;
}

const DiscoveryCardSkeleton: React.FC = () => (
    <div className="flex-shrink-0 w-64 h-40 bg-slate-200 rounded-lg animate-shimmer"></div>
);

const TrendingCard: React.FC<{ trend: AIDiscoveryData['trendingDestinations'][0] }> = ({ trend }) => (
    <div className="flex-shrink-0 w-64 h-40 rounded-lg overflow-hidden relative group cursor-pointer shadow-md">
        <img src={trend.image} alt={trend.destination} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 text-white">
            <h4 className="font-bold">{trend.destination}</h4>
            <p className="text-xs">{trend.reason}</p>
        </div>
    </div>
);

const DiscoveryHub: React.FC<DiscoveryHubProps> = ({ posts, discoveryData, isLoading, onEarnPoints, onAddComment, onAskAi }) => {
    
    const hiddenGemsPosts = discoveryData?.hiddenGems.map(id => posts.find(p => p.id === id)).filter(Boolean) as WandergramPost[];
    const recommendedPosts = discoveryData?.recommendations.map(id => posts.find(p => p.id === id)).filter(Boolean) as WandergramPost[];

    if (isLoading) {
        return (
            <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center"><Icon name="chart-bar" className="h-6 w-6 mr-2 text-blue-500" /> Trending Now</h3>
                    <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                        {[...Array(3)].map((_, i) => <DiscoveryCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }
    
    if (!discoveryData) return null;

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Trending Destinations */}
            {discoveryData.trendingDestinations.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center"><Icon name="chart-bar" className="h-6 w-6 mr-2 text-blue-500" /> Trending Now</h3>
                    <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4">
                        {discoveryData.trendingDestinations.map((trend, i) => <TrendingCard key={i} trend={trend} />)}
                    </div>
                </div>
            )}
            
            {/* Hidden Gems */}
            {hiddenGemsPosts.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><Icon name="sparkles" className="h-6 w-6 mr-2 text-amber-500" /> Hidden Gems</h3>
                    <div className="space-y-6">
                        {hiddenGemsPosts.map(post => <WandergramPostComponent key={post.id} post={post} onAskAi={onAskAi} onAddComment={onAddComment} onEarnPoints={onEarnPoints} />)}
                    </div>
                </div>
            )}
            
             {/* For You */}
            {recommendedPosts.length > 0 && (
                 <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><Icon name="user" className="h-6 w-6 mr-2 text-indigo-500" /> For You</h3>
                     <div className="space-y-6">
                        {recommendedPosts.map(post => <WandergramPostComponent key={post.id} post={post} onAskAi={onAskAi} onAddComment={onAddComment} onEarnPoints={onEarnPoints} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscoveryHub;
