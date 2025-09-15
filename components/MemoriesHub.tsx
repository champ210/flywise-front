import React, { useState } from 'react';
import { TravelStory, SavedTrip, TripMemory, ItineraryPlan } from '@/types';
import StoryCard from './StoryCard';
import MyMemories from './MyMemories';
import TripMemoryDetail from './TripMemoryDetail';
import { Icon } from '@/components/common/Icon';
import { generateTripMemory } from '@/services/geminiService';
import LoadingOverlay from './common/LoadingOverlay';

interface MemoriesHubProps {
  stories: TravelStory[];
  onOpenCreateModal: () => void;
  savedTrips: SavedTrip[];
  generatedMemories: TripMemory[];
  onMemoryGenerated: (memory: TripMemory) => void;
  onOpenReelModal: (trip: SavedTrip & { data: ItineraryPlan }) => void;
  onUpdateStory: (story: TravelStory) => void;
  onEarnPoints: (points: number, badgeId?: string) => void;
}

const MemoriesHub: React.FC<MemoriesHubProps> = ({ stories, onOpenCreateModal, savedTrips, generatedMemories, onMemoryGenerated, onOpenReelModal, onUpdateStory, onEarnPoints }) => {
  const [activeTab, setActiveTab] = useState<'stories' | 'memories'>('stories');
  const [selectedMemory, setSelectedMemory] = useState<TripMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itineraryTrips = savedTrips.filter(t => t.type === 'itinerary') as (SavedTrip & { data: ItineraryPlan })[];

  const handleGenerateMemory = async (trip: SavedTrip & { data: ItineraryPlan }) => {
    setIsLoading(true);
    setError(null);
    try {
      const memoryData = await generateTripMemory(trip.data);
      const newMemory: TripMemory = {
        ...memoryData,
        tripId: trip.id,
      };
      onMemoryGenerated(newMemory);
      setSelectedMemory(newMemory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate memory.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMemory = (tripId: string) => {
    const memory = generatedMemories.find(m => m.tripId === tripId);
    if (memory) {
      setSelectedMemory(memory);
    }
  };

  if (selectedMemory) {
    return <TripMemoryDetail memory={selectedMemory} onBack={() => setSelectedMemory(null)} />;
  }

  return (
    <>
      {isLoading && <LoadingOverlay message="Composing your travel journal..." />}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in-up">
        {error && (
            <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Error:</strong> {error}
            </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-800">Trip Journals</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Relive your adventures and get inspired by others.
                </p>
            </div>
            {activeTab === 'stories' && (
                 <button
                    onClick={onOpenCreateModal}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 flex-shrink-0 w-full sm:w-auto"
                >
                    <Icon name="plus" className="h-5 w-5 mr-2 -ml-1" />
                    Share Your Story
                </button>
            )}
        </div>

        <div className="mb-6 flex justify-center items-center border-b border-slate-200">
            <button onClick={() => setActiveTab('stories')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeTab === 'stories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                Community Stories
            </button>
            <button onClick={() => setActiveTab('memories')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeTab === 'memories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                My Journals
            </button>
        </div>
        
        {activeTab === 'stories' ? (
             <div className="space-y-8">
                {stories.map(story => (
                <StoryCard key={story.id} story={story} onUpdateStory={onUpdateStory} onEarnPoints={onEarnPoints} />
                ))}
            </div>
        ) : (
            <MyMemories 
                itineraryTrips={itineraryTrips}
                generatedMemories={generatedMemories}
                onGenerate={handleGenerateMemory}
                onView={handleViewMemory}
                onOpenReelModal={onOpenReelModal}
            />
        )}
      </div>
    </>
  );
};

export default MemoriesHub;