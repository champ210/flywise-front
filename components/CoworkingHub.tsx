
import React, { useState, useCallback } from 'react';
import { UserProfile, CoworkingSpace } from '../types';
import { getCoworkingSpaces } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import CoworkingSpaceCard from './CoworkingSpaceCard';

interface CoworkingHubProps {
  userProfile: UserProfile;
  onBookSpace: (space: CoworkingSpace) => void;
}

const CoworkingHub: React.FC<CoworkingHubProps> = ({ userProfile, onBookSpace }) => {
  const [location, setLocation] = useState('');
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!location.trim()) {
      setError("Please enter a destination to find coworking spaces.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSpaces([]);

    try {
      const results = await getCoworkingSpaces(location, userProfile);
      setSpaces(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while finding spaces.");
    } finally {
      setIsLoading(false);
    }
  }, [location, userProfile]);

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 animate-fade-in-up">
      <div className="text-center">
        <Icon name="briefcase" className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Global Coworking Spaces</h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
          Discover and book your next workspace, anywhere in the world. Powered by AI, accessed with your FlyWise Card.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a city..."
            className="flex-1 block w-full rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-lg p-3"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !location.trim()}
            className="inline-flex items-center justify-center h-12 w-32 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isLoading ? <LoadingSpinner /> : 'Find Spaces'}
          </button>
        </div>
      </form>

      <div className="mt-12">
        {isLoading && (
          <div className="text-center p-10">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">Finding workspaces in {location}...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
            <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-red-800">Could Not Find Spaces</h3>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {spaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map(space => (
              <CoworkingSpaceCard key={space.id} space={space} onBook={() => onBookSpace(space)} />
            ))}
          </div>
        )}
        
        {!isLoading && spaces.length === 0 && !error && (
             <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <Icon name="search" className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Start your search</h3>
                <p className="mt-1 text-sm text-slate-500">Enter a destination above to find available coworking spaces.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default CoworkingHub;
