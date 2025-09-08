
import React, { useState, useCallback } from 'react';
import { UserProfile, LocalProfile, HangoutSuggestion } from '../types';
import { getAILocalMatches } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
// FIX: Corrected import paths to match file names.
import LocalCard from './HostCard';
import LocalDetail from './HostDetail';

interface LocalConnectionsHubProps {
  userProfile: UserProfile;
  onOpenVipModal: () => void;
  onHangoutRequest: (details: {local: LocalProfile, suggestion: HangoutSuggestion}) => void;
}

const LocalConnectionsHub: React.FC<LocalConnectionsHubProps> = ({ userProfile, onOpenVipModal, onHangoutRequest }) => {
  const [activeTab, setActiveTab] = useState<'stay' | 'hangout'>('hangout');
  const [location, setLocation] = useState('');
  const [locals, setLocals] = useState<LocalProfile[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    return <LocalDetail local={selectedLocal} onBack={() => setSelectedLocal(null)} onOpenVipModal={onOpenVipModal} onHangoutRequest={onHangoutRequest} userProfile={userProfile} />;
  }

  const title = activeTab === 'stay' ? 'Local Stays' : 'Local Hangouts';
  const description = activeTab === 'stay'
    ? "Connect with local hosts for authentic travel experiences. Stay for free or a small fee, and see the world through a local's eyes."
    : "Connect with friendly locals for authentic social experiences, guided activities, or casual meetups.";

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 animate-fade-in-up">
      <div className="text-center">
        <Icon name="users" className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Local Connections</h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">{description}</p>
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
                    <LocalCard key={local.id} local={local} onSelect={() => setSelectedLocal(local)} />
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

export default LocalConnectionsHub;
