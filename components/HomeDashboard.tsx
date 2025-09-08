
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, SavedTrip, TravelStory, WeatherForecast, AIHomeSuggestion, ItineraryPlan } from '../types';
import { getAIHomeSuggestions, getWeatherForecast } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import WeatherDisplay from './WeatherDisplay';
import { Tab } from '../App';

interface HomeDashboardProps {
  userProfile: UserProfile;
  savedTrips: SavedTrip[];
  stories: TravelStory[];
  setActiveTab: (tab: Tab) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ userProfile, savedTrips, stories, setActiveTab }) => {
  const [suggestions, setSuggestions] = useState<AIHomeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  
  const upcomingTrip = useMemo(() => {
    const itineraryTrips = savedTrips
      .filter(trip => trip.type === 'itinerary' && (trip.data as ItineraryPlan).itinerary.length > 0)
      .map(trip => ({...trip, data: trip.data as ItineraryPlan}))
      .sort((a, b) => new Date(a.data.itinerary[0].day).getTime() - new Date(b.data.itinerary[0].day).getTime()); // This needs a real date field

    // For now, just find the first itinerary
    return itineraryTrips[0] || null;
  }, [savedTrips]);
  
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
  
  useEffect(() => {
    if (upcomingTrip) {
      const fetchWeather = async () => {
        setIsWeatherLoading(true);
        try {
          const forecast = await getWeatherForecast(upcomingTrip.data.destination, 5);
          setWeather(forecast);
        } catch (error) {
          console.error("Failed to fetch weather:", error);
        } finally {
          setIsWeatherLoading(false);
        }
      };
      fetchWeather();
    }
  }, [upcomingTrip]);
  
  const handleSuggestionClick = (suggestion: AIHomeSuggestion) => {
    // A more robust implementation would handle passing queries
    setActiveTab(suggestion.actionTarget.tab as Tab);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome to FlyWise.AI</h1>
        <p className="mt-2 text-md text-slate-600">Your personalized travel dashboard.</p>
      </div>

      {/* Upcoming Trip Section */}
      {upcomingTrip && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-bold text-slate-800">Your Upcoming Trip</h2>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-blue-600">{upcomingTrip.name}</h3>
            {isWeatherLoading ? (
              <div className="h-24 flex items-center justify-center"><LoadingSpinner/></div>
            ) : weather ? (
              <div className="mt-2 -mx-4">
                <WeatherDisplay forecast={weather}/>
              </div>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setActiveTab(Tab.MyTrips)} className="flex-1 text-sm text-center py-2 bg-blue-100 text-blue-800 font-semibold rounded-md hover:bg-blue-200">View Itinerary</button>
              <button onClick={() => setActiveTab(Tab.Checklist)} className="flex-1 text-sm text-center py-2 bg-blue-100 text-blue-800 font-semibold rounded-md hover:bg-blue-200">Packing List</button>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Next Steps */}
      <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Icon name="sparkles" className="h-6 w-6 mr-3 text-indigo-500" />
          AI-Powered Next Steps
        </h2>
        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-white/50 rounded-lg animate-shimmer"></div>
              <div className="h-24 bg-white/50 rounded-lg animate-shimmer"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((sugg, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-slate-800">{sugg.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{sugg.description}</p>
                  <button onClick={() => handleSuggestionClick(sugg)} className="mt-3 text-sm font-bold text-blue-600 hover:underline">
                    {sugg.actionText} &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="text-xl font-bold text-slate-800">Recent Community Stories</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {stories.slice(0, 3).map(story => (
            <div key={story.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <img src={story.authorAvatarUrl} alt={story.authorName} className="w-8 h-8 rounded-full"/>
                <div>
                  <p className="text-xs font-semibold">{story.authorName}</p>
                  <p className="text-xs text-slate-500">{story.locationTags[0]}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-2 line-clamp-2">{story.title}</p>
              <button onClick={() => setActiveTab(Tab.Stories)} className="mt-2 text-xs font-bold text-blue-600 hover:underline">Read Story &rarr;</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
