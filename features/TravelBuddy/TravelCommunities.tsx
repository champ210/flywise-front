import React, { useState, useMemo, useEffect } from 'react';
import { Community } from '@/types';
import CommunityCard from '@/components/CommunityCard';
import CommunityDetail from '@/components/CommunityDetail';
import { Icon } from '@/components/common/Icon';
import CreateCommunityModal from '@/components/CreateCommunityModal';
import * as xanoService from '@/services/xanoService';
import CommunityCardSkeleton from '@/components/skeletons/CommunityCardSkeleton';

const TravelCommunities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'destination' | 'interest'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchCommunities = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCommunities = await xanoService.getCommunities();
            setCommunities(fetchedCommunities);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load communities.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchCommunities();
  }, []);

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community);
  };

  const handleBackToList = () => {
    setSelectedCommunity(null);
  };

  const handleCreateCommunity = async (newCommunityData: Omit<Community, 'id' | 'memberCount' | 'posts' | 'questions'>) => {
    try {
        const newCommunity = await xanoService.createCommunity(newCommunityData);
        setCommunities([newCommunity, ...communities]);
    } catch(err) {
        alert(err instanceof Error ? err.message : "Failed to create community.");
    }
  };

  const filteredCommunities = useMemo(() => {
    return communities.filter(community => {
      const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || community.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filter, communities]);

  if (selectedCommunity) {
    return <CommunityDetail community={selectedCommunity} onBack={handleBackToList} />;
  }

  return (
    <>
      {isModalOpen && <CreateCommunityModal onClose={() => setIsModalOpen(false)} onCreateCommunity={handleCreateCommunity} />}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Travel Communities</h2>
            <p className="mt-2 text-sm text-slate-600">
              Find your tribe. Connect with travelers who share your passions and destinations.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 flex-shrink-0 w-full sm:w-auto">
              <Icon name="plus" className="h-5 w-5 mr-2 -ml-1" />
              Create Community
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for a community..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2 bg-slate-200 p-1 rounded-md">
              <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-medium rounded ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>All</button>
              <button onClick={() => setFilter('destination')} className={`px-3 py-1 text-sm font-medium rounded ${filter === 'destination' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>Destinations</button>
              <button onClick={() => setFilter('interest')} className={`px-3 py-1 text-sm font-medium rounded ${filter === 'interest' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>Interests</button>
            </div>
          </div>
        </div>

        {/* Community List */}
        {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <CommunityCardSkeleton key={i} />)}
             </div>
        ) : error ? (
            <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCommunities.map(community => (
                    <CommunityCard 
                    key={community.id} 
                    community={community} 
                    onClick={() => handleSelectCommunity(community)}
                    />
                ))}
            </div>
        )}
       {filteredCommunities.length === 0 && !isLoading && (
          <div className="md:col-span-2 text-center p-10">
            <Icon name="search" className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No communities found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TravelCommunities;