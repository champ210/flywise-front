

import React, { useState, useEffect } from 'react';
import { TravelStory, UserProfile, AIDiscoveryData } from '../types';
import StoryCard from './StoryCard';
import DiscoveryHub from './DiscoveryHub';
import { getAIDiscoverySuggestions } from '../services/geminiService';
import { Icon } from './Icon';

interface SocialFeedProps {
  stories: TravelStory[];
  userProfile: UserProfile;
  onUpdateStory: (story: TravelStory) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ stories, userProfile, onUpdateStory, onEarnPoints }) => {
  const [discoveryData, setDiscoveryData] = useState<AIDiscoveryData | null>(null);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true);

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      setIsLoadingDiscovery(true);
      try {
        const data = await getAIDiscoverySuggestions(stories, userProfile);
        setDiscoveryData(data);
      } catch (error) {
        console.error("Failed to fetch discovery data:", error);
      } finally {
        setIsLoadingDiscovery(false);
      }
    };
    
    if (stories.length > 0) {
        fetchDiscoveryData();
    } else {
        setIsLoadingDiscovery(false);
    }
  }, [stories, userProfile]);

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4 space-y-8">
       <div className="text-center">
            <Icon name="sparkles" className="h-12 w-12 text-blue-600 mx-auto" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">AI Discovery Feed</h2>
            <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
                Trending destinations, hidden gems, and stories picked just for you.
            </p>
      </div>
      
      <DiscoveryHub 
        stories={stories}
        discoveryData={discoveryData}
        isLoading={isLoadingDiscovery}
        onUpdateStory={onUpdateStory}
        onEarnPoints={onEarnPoints}
      />
      
      <div className="border-t border-slate-200 pt-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Chronological Feed</h3>
          <div className="space-y-8">
            {stories.map(story => (
                <StoryCard key={story.id} story={story} onUpdateStory={onUpdateStory} onEarnPoints={onEarnPoints} />
            ))}
          </div>
      </div>
    </div>
  );
};

export default SocialFeed;