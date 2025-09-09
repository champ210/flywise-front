
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UserProfile, LocalProfile, HangoutSuggestion } from '../types';
import { getAILocalMatches } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import HostCard from './HostCard';
import HostDetail from './HostDetail';
import HostDashboard from './HostDashboard';

interface HomeShareProps {
  userProfile: UserProfile;
  onOpenVipModal: () => void;
  onHangoutRequest: (details: {local: LocalProfile, suggestion: HangoutSuggestion}) => void;
}

const HomeShare: React.FC<HomeShareProps> = ({ userProfile, onOpenVipModal, onHangoutRequest }) => {
  const [mode, setMode] = useState<'finding' | 'hosting'>('finding');
  const [activeTab, setActiveTab] = useState<'stay' | 'hangout'>('hangout');
  const [location, setLocation] = useState('');
  const [locals, setLocals] = useState<LocalProfile[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<LocalProfile | null>(null);
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
        setError("Please enter a destination.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setLocals([]);
    setSelectedLocal(null);

    try {
        const results = await getAILocalMatches(location, userProfile, activeTab);
        setLocals(results);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsLoading(false);
    }
  }, [location, userProfile, activeTab]);

  if (selectedLocal) {
    return <HostDetail local={selectedLocal} onBack={() => setSelectedLocal(null)} onOpenVipModal={onOpenVipModal} onHangoutRequest={onHangoutRequest} userProfile={userProfile} />;
  }

  if (mode === 'hosting') {
    return <HostDashboard onSwitchToFinding={() => setMode('finding')} />;
  }

  const description = activeTab === 'stay'
    ? "Connect with local hosts for authentic travel experiences. Stay for free or a small fee, and see the world through a local's eyes."
    : "Connect with friendly locals for authentic social experiences, guided activities, or casual meetups.";

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 animate-fade-in-up">
       <div className="flex justify-between items-start mb-4">
        <div className="text-left">
            <Icon name="users" className="h-12 w-12 text-blue-600 mb-2" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Local Connections</h2>
             <p className="mt-1 text-md text-slate-600 max-w-2xl">{description}</p>
        </div>
         <div ref={dropdownRef} className="relative flex-shrink-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            {mode === 'finding' ? 'Finding Connections' : 'Host Dashboard'}
            <Icon name="chevron-down" className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('finding'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">Find Connections</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('hosting'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">Become a Host</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center items-center border-b border-slate-200">
          <button onClick={() => setActiveTab('hangout')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeTab === 'hangout' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Icon name="chat" className="h-5 w-5" /> Hangouts
          </button>
          <button onClick={() => setActiveTab('stay')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeTab === 'stay' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Icon name="home" className="h-5 w-5" /> Local Stays
          </button>
      </div>


      <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
            <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a city or neighborhood..."
            className="flex-1 block w-full rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-lg p-3"
            disabled={isLoading}
            />
            <button
            type="submit"
            disabled={isLoading || !location.trim()}
            className="inline-flex items-center justify-center h-12 w-28 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
            {isLoading ? <LoadingSpinner /> : 'Find Locals'}
            </button>
        </div>
      </form>

      <div className="mt-12">
        {error && (
            <div className="text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
                <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-red-800">Could Not Find Locals</h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
        )}

        {locals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locals.map(local => (
                    <HostCard key={local.id} local={local} onSelect={() => setSelectedLocal(local)} />
                ))}
            </div>
        )}
        
        {!isLoading && locals.length === 0 && !error && (
             <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <Icon name="users" className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Start your search</h3>
                <p className="mt-1 text-sm text-slate-500">Enter a destination above to find compatible locals.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default HomeShare;
