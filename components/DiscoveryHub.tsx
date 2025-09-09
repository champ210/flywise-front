import React from 'react';
import { TravelStory, AIDiscoveryData, UserProfile } from '../types';
import StoryCard from './StoryCard';
import { Icon } from './Icon';

interface DiscoveryHubProps {
  stories: TravelStory[];
  discoveryData: AIDiscoveryData | null;
  isLoading: boolean;
  onUpdateStory: (story: TravelStory) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
}

const DiscoveryCardSkeleton: React.FC = () => (
    <div className="flex-shrink-0 w-64 h-40 bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex flex-col justify-between animate-shimmer">
        <div>
            <div className="h-4 bg-slate-300 rounded w-3/4"></div>
            <div className="h-3 bg-slate-300 rounded w-1/2 mt-2"></div>
        </div>
        <div className="h-8 bg-slate-300 rounded-full w-24"></div>
    </div>
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

const DiscoveryHub: React.FC<DiscoveryHubProps> = ({ stories, discoveryData, isLoading, onUpdateStory, onEarnPoints }) => {
    
    const hiddenGemsStories = discoveryData?.hiddenGems.map(id => stories.find(s => s.id === id)).filter(Boolean) as TravelStory[];
    const recommendedStories = discoveryData?.recommendations.map(id => stories.find(s => s.id === id)).filter(Boolean) as TravelStory[];

    if (isLoading) {
        return (
            <div className="mb-8 space-y-6">
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
        <div className="mb-8 space-y-8 animate-fade-in-up">
            {/* Trending Destinations */}
            {discoveryData.trendingDestinations.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center"><Icon name="chart-bar" className="h-6 w-6 mr-2 text-blue-500" /> Trending Now</h3>
                    <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                        {discoveryData.trendingDestinations.map((trend, i) => <TrendingCard key={i} trend={trend} />)}
                    </div>
                </div>
            )}
            
            {/* Hidden Gems */}
            {hiddenGemsStories.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><Icon name="sparkles" className="h-6 w-6 mr-2 text-amber-500" /> Hidden Gems</h3>
                    <div className="space-y-6">
                        {hiddenGemsStories.map(story => <StoryCard key={story.id} story={story} onUpdateStory={onUpdateStory} onEarnPoints={onEarnPoints} />)}
                    </div>
                </div>
            )}
            
             {/* For You */}
            {recommendedStories.length > 0 && (
                 <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><Icon name="user" className="h-6 w-6 mr-2 text-indigo-500" /> For You</h3>
                     <div className="space-y-6">
                        {recommendedStories.map(story => <StoryCard key={story.id} story={story} onUpdateStory={onUpdateStory} onEarnPoints={onEarnPoints} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscoveryHub;