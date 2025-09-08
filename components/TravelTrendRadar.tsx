
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, TravelTrend } from '../types';
import { getTravelTrends } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import TrendCard from './TrendCard';

interface TravelTrendRadarProps {
  userProfile: UserProfile;
}

type TrendCategory = 'all' | TravelTrend['category'];

const TravelTrendRadar: React.FC<TravelTrendRadarProps> = ({ userProfile }) => {
  const [trends, setTrends] = useState<TravelTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TrendCategory>('all');

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await getTravelTrends(userProfile);
        setTrends(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, [userProfile]);

  const filteredTrends = useMemo(() => {
    if (filter === 'all') {
      return trends;
    }
    return trends.filter(trend => trend.category === filter);
  }, [filter, trends]);

  const categories: TrendCategory[] = ['all', 'Adventure', 'City Break', 'Relaxation', 'Cultural', 'Hidden Gem'];

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 animate-fade-in-up">
      <div className="text-center">
        <Icon name="chart-bar" className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Travel Trend Radar</h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
          Discover what's hot in the travel world right now. Our AI analyzes trends to bring you personalized, up-and-coming destinations.
        </p>
      </div>

      {/* Filters */}
      <div className="my-8 flex justify-center flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border-2 ${
              filter === category
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            {category === 'all' ? 'All Trends' : category}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
            <LoadingSpinner />
            <p className="mt-4 text-lg font-semibold text-slate-700">Scanning the globe for the latest trends...</p>
          </div>
        ) : error ? (
          <div className="text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
            <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-red-800">Could Not Load Trends</h3>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        ) : filteredTrends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrends.map(trend => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-lg">
            <Icon name="search" className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No trends found</h3>
            <p className="mt-1 text-sm text-slate-500">No trending destinations match your current filter. Try selecting 'All Trends'.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelTrendRadar;
