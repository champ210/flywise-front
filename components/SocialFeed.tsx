import React, { useState, useEffect } from 'react';
import { WandergramPost, UserProfile, AIDiscoveryData } from '../types';
import DiscoveryHub from './DiscoveryHub';
import { getAIDiscoverySuggestions } from '../services/geminiService';
import { Icon } from './Icon';

interface SocialFeedProps {
  posts: WandergramPost[];
  userProfile: UserProfile;
  onUpdatePost: (post: WandergramPost) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onAskAi: (post: WandergramPost) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ posts, userProfile, onUpdatePost, onEarnPoints, onAddComment, onAskAi }) => {
  const [discoveryData, setDiscoveryData] = useState<AIDiscoveryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      setIsLoading(true);
      try {
        const data = await getAIDiscoverySuggestions(posts, userProfile);
        setDiscoveryData(data);
      } catch (error) {
        console.error("Failed to fetch discovery data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (posts.length > 0) {
        fetchDiscoveryData();
    } else {
        setIsLoading(false);
    }
  }, [posts, userProfile]);

  return (
    <div className="py-6 space-y-8">
      <DiscoveryHub 
        posts={posts}
        discoveryData={discoveryData}
        isLoading={isLoading}
        onUpdatePost={onUpdatePost}
        onEarnPoints={onEarnPoints}
        onAddComment={onAddComment}
        onAskAi={onAskAi}
      />
    </div>
  );
};

export default SocialFeed;
