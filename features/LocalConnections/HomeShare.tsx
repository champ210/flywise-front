
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UserProfile, LocalProfile, HangoutSuggestion, Experience, ExperienceCategory } from '@/types';
// FIX: Moved getAILocalMatches import from xanoService to geminiService.
import { getExperiences } from '@/services/xanoService';
import { getAILocalMatches } from '@/services/geminiService';
import { Icon } from '@/components/common/Icon';
import HostCard from '@/components/HostCard';
import HostDetail from '@/components/HostDetail';
import HostDashboard from '@/components/HostDashboard';
import HostCardSkeleton from '@/components/skeletons/HostCardSkeleton';
import ExperienceCard from '@/features/Experiences/ExperienceCard';

interface HomeShareProps {
  userProfile: UserProfile;
  onOpenVipModal: () => void;
  onHangoutRequest: (details: {local: LocalProfile, suggestion: HangoutSuggestion}) => void;
  onSelectExperience: (experience: Experience) => void;
  t: (key: string) => string;
}

const HomeShare: React.FC<HomeShareProps> = ({ userProfile, onOpenVipModal, onHangoutRequest, onSelectExperience, t }) => {
  const [mode, setMode] = useState<'finding' | 'hosting'>('finding');
  const [activeTab, setActiveTab] = useState<'stay' | 'hangout' | 'experience'>('experience');
  const [location, setLocation] = useState('');
  const [locals, setLocals] = useState<LocalProfile[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [experienceFilter, setExperienceFilter] = useState<ExperienceCategory | 'All'>('All');
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
  
  useEffect(() => {
    if (activeTab === 'experience') {
        const fetchExperiences = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const results = await getExperiences();
                setExperiences(results);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load experiences.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchExperiences();
    }
  }, [activeTab]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!location.trim()) {
        setError("Please enter a destination.");
        return;
    }
    if (activeTab === 'experience') return; // Search is for hosts only for now
    
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

  const filteredExperiences = experiences.filter(exp => experienceFilter === 'All' || exp.category === experienceFilter);

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 animate-fade-in-up">
       <div className="flex justify-between items-start mb-4">
        <div className="text-left">
            <Icon className="h-12 w-12 mb-2" name="users" color="#2563eb" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Local Connections</h2>
             <p className="mt-1 text-md text-slate-600 max-w-2xl">Connect with locals for authentic travel experiences.</p>
        </div>
         <div ref={dropdownRef} className="relative flex-shrink-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
          >
            {mode === 'finding' ? 'Finding Connections' : 'Host Dashboard'}
            <Icon name="chevron-down" className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
              <div className="py-1">
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('finding'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Find Connections</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('hosting'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Become a Host</a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center items-center border-b border-slate-200">
          <button onClick={() => setActiveTab('experience')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeTab === 'experience' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Icon className="h-5 w-5" name="sparkles" /> Experiences
          </button>
          <button onClick={() => setActiveTab('hangout')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeTab === 'hangout' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Icon className="h-5 w-5" name="chat" /> Hangouts
          </button>
          <button onClick={() => setActiveTab('stay')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeTab === 'stay' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Icon className="h-5 w-5" name="home" /> Local Stays
          </button>
      </div>

      {activeTab !== 'experience' ? (
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
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Find Locals'}
                </button>
            </div>
        </form>
      ) : (
        <div className="my-6 flex justify-center flex-wrap gap-2">
            {(['All', 'Food', 'Adventure', 'Culture', 'Wellness'] as const).map(cat => (
                <button key={cat} onClick={() => setExperienceFilter(cat)} className={`px-4 py-2 text-sm font-medium rounded-full border-2 ${experienceFilter === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                    {cat}
                </button>
            ))}
        </div>
      )}

      <div className="mt-12">
        {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <HostCardSkeleton key={i} />)}
            </div>
        )}
        
        {error && (
            <div className="text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
                <Icon className="h-12 w-12" name="error" color="#ef4444" />
                <h3 className="mt-4 text-lg font-semibold text-red-800">Could Not Find Results</h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
        )}

        {activeTab !== 'experience' && locals.length > 0 && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locals.map(local => (
                    <HostCard key={local.id} local={local} onSelect={() => setSelectedLocal(local)} />
                ))}
            </div>
        )}

        {activeTab === 'experience' && filteredExperiences.length > 0 && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map(exp => (
                    <ExperienceCard key={exp.id} experience={exp} onClick={() => onSelectExperience(exp)} />
                ))}
            </div>
        )}
        
        {!isLoading && locals.length === 0 && experiences.length === 0 && !error && (
             <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <Icon className="h-12 w-12" name="search" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Start your search</h3>
                <p className="mt-1 text-sm text-slate-500">Enter a destination above to find compatible locals.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default HomeShare;
