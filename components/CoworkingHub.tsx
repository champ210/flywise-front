
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { UserProfile, CoworkingSpace } from '../types';
import { getCoworkingSpaces } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import CoworkingSpaceCard from './CoworkingSpaceCard';
import ProviderDashboard from './ProviderDashboard';
import CoworkingMapView from './CoworkingMapView';

interface CoworkingHubProps {
  userProfile: UserProfile;
  onBookSpace: (space: CoworkingSpace) => void;
}

const CoworkingHub: React.FC<CoworkingHubProps> = ({ userProfile, onBookSpace }) => {
  const [mode, setMode] = useState<'finding' | 'providing'>('finding');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [location, setLocation] = useState('');
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  
  const spacesWithCoords = useMemo(() => {
    return spaces.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number') as (CoworkingSpace & { lat: number, lng: number })[];
  }, [spaces]);


  if (mode === 'providing') {
    return <ProviderDashboard onSwitchToFinding={() => setMode('finding')} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-4">
        <div className="text-center sm:text-left">
            <Icon name="briefcase" className="h-12 w-12 text-blue-600 mx-auto sm:mx-0" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Global Coworking Spaces</h2>
            <p className="mt-2 text-md text-slate-600 max-w-2xl">
            Discover your next workspace, anywhere in the world.
            </p>
        </div>
        <div ref={dropdownRef} className="relative flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            {mode === 'finding' ? 'Finding Spaces' : 'Provider Dashboard'}
            <Icon name="chevron-down" className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('finding'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">Find Spaces</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('providing'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">List Your Workspace</a>
              </div>
            </div>
          )}
        </div>
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

      <div className="mt-8 flex justify-center space-x-2 bg-slate-100 p-1 rounded-full w-min mx-auto">
        <button 
          onClick={() => setView('list')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 flex items-center ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          <Icon name="checklist" className="h-5 w-5 mr-2" />
          List View
        </button>
        <button 
          onClick={() => setView('map')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 flex items-center ${view === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          <Icon name="map" className="h-5 w-5 mr-2" />
          Map View
        </button>
      </div>

      <div className="mt-6">
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
        
        {spaces.length > 0 && view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map(space => (
              <CoworkingSpaceCard key={space.id} space={space} onBook={() => onBookSpace(space)} />
            ))}
          </div>
        )}

        {spaces.length > 0 && view === 'map' && (
            <div>
                {spacesWithCoords.length > 0 ? (
                    <CoworkingMapView spaces={spacesWithCoords} onBookSpace={onBookSpace} />
                ) : (
                    <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-500">None of the found spaces have map coordinates available to display.</p>
                    </div>
                )}
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
