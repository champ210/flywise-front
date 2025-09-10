import React from 'react';
import { SavedTrip, TripMemory, ItineraryPlan } from '../../types';
import { Icon } from './Icon';

interface MyMemoriesProps {
  itineraryTrips: (SavedTrip & { data: ItineraryPlan })[];
  generatedMemories: TripMemory[];
  onGenerate: (trip: SavedTrip & { data: ItineraryPlan }) => void;
  onView: (tripId: string) => void;
  onOpenReelModal: (trip: SavedTrip & { data: ItineraryPlan }) => void;
}

const MyMemories: React.FC<MyMemoriesProps> = ({ itineraryTrips, generatedMemories, onGenerate, onView, onOpenReelModal }) => {
  if (itineraryTrips.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
        <Icon name="planner" className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">No Itineraries Saved</h3>
        <p className="mt-1 text-sm text-slate-500">Use the Planner or Chat to create an itinerary, then come back here to turn it into a memory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {itineraryTrips.map(trip => {
        const hasMemory = generatedMemories.some(m => m.tripId === trip.id);
        return (
          <div key={trip.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800">{trip.name}</p>
              <p className="text-xs text-slate-500">
                {trip.data.itinerary.length} days, saved on {new Date(trip.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              {hasMemory ? (
                 <button
                  onClick={() => onView(trip.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
                >
                  <Icon name="eye" className="h-5 w-5 mr-2" />
                  View Journal
                </button>
              ) : (
                <button
                  onClick={() => onGenerate(trip)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Icon name="sparkles" className="h-5 w-5 mr-2" />
                  Generate Journal
                </button>
              )}
               <button
                onClick={() => onOpenReelModal(trip)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Icon name="movie" className="h-5 w-5 mr-2" />
                Create Reel
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyMemories;
