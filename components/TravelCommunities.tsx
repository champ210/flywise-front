
import React, { useState, useMemo } from 'react';
import { Community, CommunityMember } from '../types';
import CommunityCard from './CommunityCard';
import CommunityDetail from './CommunityDetail';
import { Icon } from './Icon';
import CreateCommunityModal from './CreateCommunityModal';

const mockMembers: { [key: string]: CommunityMember } = {
  user1: { id: 'u1', name: 'Liam Gallagher', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop', role: 'admin' },
  user2: { id: 'u2', name: 'Sophia Chen', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', role: 'member' },
  user3: { id: 'u3', name: 'Ben Carter', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', role: 'member' },
};

const initialCommunities: Community[] = [
  {
    id: '1',
    name: 'Backpackers in Thailand',
    description: 'A group for sharing tips, hidden gems, and stories from your adventures in Thailand. All are welcome!',
    coverImageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800&auto=format&fit=crop',
    memberCount: 12500,
    type: 'public',
    category: 'destination',
    posts: [
        { id: 'p1', author: mockMembers.user1, content: "Just arrived in Chiang Mai! Any recommendations for the best street food market? 🍜", createdAt: "2024-07-15T10:00:00.000Z", isPinned: true },
        { id: 'p2', author: mockMembers.user2, content: "Has anyone taken the sleeper train from Bangkok to Chiang Mai recently? Wondering about the new carriages.", createdAt: "2024-07-14T18:30:00.000Z" },
    ],
    questions: [
        {
            id: 'q1',
            author: mockMembers.user2,
            question: "What's the best way to get from Suvarnabhumi Airport (BKK) to the city center in Bangkok?",
            createdAt: "2024-07-15T12:00:00.000Z",
            answers: [
                { id: 'a1', author: mockMembers.user1, content: "The Airport Rail Link is the cheapest and fastest, takes you right to Phaya Thai station.", createdAt: "2024-07-15T12:05:00.000Z" },
                { id: 'a2', author: mockMembers.user3, content: "I usually just grab a taxi from the official taxi stand on the ground floor. It's more convenient if you have a lot of luggage, but make sure they use the meter!", createdAt: "2024-07-15T12:10:00.000Z" },
            ]
        }
    ]
  },
  {
    id: '2',
    name: 'Solo Female Travelers',
    description: 'A safe and supportive community for women traveling the world solo. Share advice, safety tips, and empower each other.',
    coverImageUrl: 'https://images.unsplash.com/photo-1532347922424-27903a4c6443?q=80&w=800&auto=format&fit=crop',
    memberCount: 89000,
    type: 'private',
    category: 'interest',
    posts: [
        { id: 'p3', author: mockMembers.user2, content: "What are your go-to safety gadgets when traveling alone? Looking for new ideas!", createdAt: "2024-07-15T11:20:00.000Z" },
    ],
  },
  {
    id: '3',
    name: 'European City Breaks',
    description: 'From Rome to Prague, share your favorite weekend getaways, city guides, and travel hacks for exploring Europe.',
    coverImageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop',
    memberCount: 45000,
    type: 'public',
    category: 'destination',
    posts: [
        { id: 'p4', author: mockMembers.user3, content: "Just got back from Lisbon and I'm obsessed! The pastéis de nata are worth the trip alone.", createdAt: "2024-07-13T14:00:00.000Z" },
    ],
  },
   {
    id: '4',
    name: 'Adventure Seekers & Thrill Chasers',
    description: 'For those who live for the adrenaline rush. Share your stories of skydiving, bungee jumping, and mountain climbing.',
    coverImageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop',
    memberCount: 22000,
    type: 'public',
    category: 'interest',
    posts: [],
  },
];

const TravelCommunities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'destination' | 'interest'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community);
  };

  const handleBackToList = () => {
    setSelectedCommunity(null);
  };

  const handleCreateCommunity = (newCommunity: Community) => {
    setCommunities([newCommunity, ...communities]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCommunities.map(community => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              onClick={() => handleSelectCommunity(community)}
            />
          ))}
        </div>
       {filteredCommunities.length === 0 && (
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