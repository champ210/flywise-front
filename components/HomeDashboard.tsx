import React, { useState, useEffect } from 'react';
import { UserProfile, SavedTrip, AIHomeSuggestion, WandergramPost } from '../types';
import { getAIHomeSuggestions } from '../services/geminiService';
import { Icon } from './Icon';
// FIX: The Tab enum is exported from the navigation constants file.
import { Tab } from '../navigation/constants';
import ActiveTripCard from './ActiveTripCard';

interface HomeDashboardProps {
  userProfile: UserProfile;
  savedTrips: SavedTrip[];
  posts: WandergramPost[];
  setActiveTab: (tab: Tab) => void;
  onOpenScanner: () => void;
  onOpenTranslator: () => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ userProfile, savedTrips, posts, setActiveTab, onOpenScanner, onOpenTranslator }) => {
  const [suggestions, setSuggestions] = useState<AIHomeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const activeTrip = savedTrips.find(trip => {
    if (trip.type !== 'itinerary' || !trip.startDate || !trip.endDate) return false;
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return now >= start && now <= end;
  });


  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const result = await getAIHomeSuggestions(userProfile, savedTrips);
        setSuggestions(result);
      } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [userProfile, savedTrips]);

  const handleSuggestionClick = (suggestion: AIHomeSuggestion) => {
    setActiveTab(suggestion.actionTarget.tab as Tab);
  };
  
  return (
    <div className="p-6 sm:p-8 space-y-10 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome to FlyWise.AI</h1>
        <p className="mt-3 text-lg text-slate-600">Your personalized travel dashboard.</p>
      </div>

      {activeTrip && (
        <ActiveTripCard 
          trip={activeTrip}
          onOpenScanner={onOpenScanner}
          onOpenTranslator={onOpenTranslator}
          onAskAi={() => setActiveTab(Tab.Chat)}
        />
      )}

      {/* AI-Powered Next Steps */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Icon name="sparkles" className="h-6 w-6 mr-3 text-blue-500" />
          AI-Powered Next Steps
        </h2>
        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white/60 rounded-xl border border-white/80">
                <div className="h-5 w-3/4 rounded bg-slate-200 animate-shimmer"></div>
                <div className="mt-3 h-4 w-full rounded bg-slate-200 animate-shimmer"></div>
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 animate-shimmer"></div>
                <div className="mt-4 h-5 w-1/3 rounded bg-slate-200 animate-shimmer"></div>
              </div>
              <div className="p-6 bg-white/60 rounded-xl border border-white/80">
                <div className="h-5 w-3/4 rounded bg-slate-200 animate-shimmer"></div>
                <div className="mt-3 h-4 w-full rounded bg-slate-200 animate-shimmer"></div>
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 animate-shimmer"></div>
                <div className="mt-4 h-5 w-1/3 rounded bg-slate-200 animate-shimmer"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((sugg, i) => (
                <div key={i} onClick={() => handleSuggestionClick(sugg)} className="bg-white/60 p-6 rounded-xl shadow-lg border border-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                  <h3 className="font-semibold text-slate-800">{sugg.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{sugg.description}</p>
                  <div className="mt-4 text-sm font-bold text-blue-600 hover:underline">
                    {sugg.actionText} &rarr;
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Community Stories */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Recent Community Stories</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post, i) => (
            <div key={i} onClick={() => setActiveTab(Tab.Wandergram)} className="bg-white p-4 rounded-xl shadow-md border border-slate-200/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-3">
                    <img src={post.user.avatarUrl} alt={post.user.name} className="w-10 h-10 rounded-full"/>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{post.user.name}</p>
                        <p className="text-xs text-slate-500">{post.location}</p>
                    </div>
                </div>
                <h3 className="mt-4 font-semibold text-slate-700 line-clamp-2">{post.caption}</h3>
                <p className="mt-3 text-sm font-bold text-blue-600">Read Story &rarr;</p>
            </div>
          ))}
        </div>
      </div>
       <footer className="text-center text-sm text-slate-500 pt-8">
            Powered by AI. Your ultimate travel planning companion.
        </footer>
    </div>
  );
};

export default HomeDashboard;