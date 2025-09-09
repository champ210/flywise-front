

import React, { useState, useRef } from 'react';
import { SavedTrip, Checklist, ItineraryPlan, TravelInsuranceQuote } from '../types';
import { Icon } from './Icon';
import ComparisonView from './ComparisonView';
import ChecklistModal from './ChecklistModal';
import InsuranceModal from './InsuranceModal';
import { getTravelChecklist, getInsuranceQuotes } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface MyTripsProps {
  savedTrips: SavedTrip[];
  onDeleteTrip: (tripId: string) => void;
  isOffline: boolean;
}

const MyTrips: React.FC<MyTripsProps> = ({ savedTrips, onDeleteTrip, isOffline }) => {
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<{ type: 'checklist' | 'insurance', tripId: string } | null>(null);
  const [modalData, setModalData] = useState<{ trip: SavedTrip, checklist: Checklist } | null>(null);
  const [insuranceModalData, setInsuranceModalData] = useState<{ trip: SavedTrip; quotes: TravelInsuranceQuote[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const handleToggleSelect = (tripId: string) => {
    setSelectedTripIds(prev =>
      prev.includes(tripId)
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const handleGenerateChecklist = async (trip: SavedTrip) => {
    if (trip.type !== 'itinerary') return;
    setIsGenerating({ type: 'checklist', tripId: trip.id });
    setError(null);
    try {
      const checklist = await getTravelChecklist(trip.data as ItineraryPlan);
      setModalData({ trip, checklist });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGetInsurance = async (trip: SavedTrip) => {
    if (trip.type !== 'itinerary') return;
    setIsGenerating({ type: 'insurance', tripId: trip.id });
    setError(null);
    try {
      const quotes = await getInsuranceQuotes(trip.data as ItineraryPlan);
      setInsuranceModalData({ trip, quotes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(null);
    }
  };


  const tripsToCompare = savedTrips.filter(trip => selectedTripIds.includes(trip.id));

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {modalData && (
          <ChecklistModal
            trip={modalData.trip}
            checklist={modalData.checklist}
            onClose={() => setModalData(null)}
          />
        )}
        {insuranceModalData && (
          <InsuranceModal
            trip={insuranceModalData.trip}
            quotes={insuranceModalData.quotes}
            onClose={() => setInsuranceModalData(null)}
          />
        )}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Saved Trips</h2>
            <p className="mt-1 text-sm text-slate-600">
              Here are your saved itineraries and searches. Select two or more to compare.
            </p>
          </div>
          <button
            onClick={() => comparisonRef.current?.scrollIntoView({ behavior: 'smooth' })}
            disabled={selectedTripIds.length < 2}
            className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
          >
            Compare Selected ({selectedTripIds.length})
          </button>
        </div>
        
        {error && (
            <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Error:</strong> {error}
            </div>
        )}

        {savedTrips.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <Icon name="bookmark" className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No saved trips yet</h3>
            <p className="mt-1 text-sm text-slate-500">Save itineraries or search results to see them here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {savedTrips.map(trip => (
              <li key={trip.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center space-x-4 transition-shadow hover:shadow-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedTripIds.includes(trip.id)}
                  onChange={() => handleToggleSelect(trip.id)}
                  aria-label={`Select trip: ${trip.name}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Icon name={trip.type === 'itinerary' ? 'planner' : 'search'} className={`h-5 w-5 flex-shrink-0 ${trip.type === 'itinerary' ? 'text-indigo-600' : 'text-blue-600'}`} />
                    <p className="text-sm font-semibold text-slate-800 truncate" title={trip.name}>
                      {trip.name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Saved on {new Date(trip.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2">
                    {trip.type === 'itinerary' && (
                      <>
                        <button
                            onClick={() => handleGetInsurance(trip)}
                            disabled={!!isGenerating || isOffline}
                            className="p-2 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                            aria-label={`Get insurance quotes for ${trip.name}`}
                            title={isOffline ? "Feature unavailable offline" : "Get Insurance Quotes"}
                        >
                            {isGenerating?.type === 'insurance' && isGenerating?.tripId === trip.id ? <LoadingSpinner /> : <Icon name="shield" className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => handleGenerateChecklist(trip)}
                            disabled={!!isGenerating || isOffline}
                            className="p-2 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                            aria-label={`Generate checklist for ${trip.name}`}
                            title={isOffline ? "Feature unavailable offline" : "Generate Checklist"}
                        >
                            {isGenerating?.type === 'checklist' && isGenerating?.tripId === trip.id ? <LoadingSpinner /> : <Icon name="lightbulb" className="h-5 w-5" />}
                        </button>
                      </>
                    )}
                    <button 
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this trip?')) {
                                onDeleteTrip(trip.id);
                            }
                        }}
                        className="p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete trip: ${trip.name}`}
                    >
                        <Icon name="trash" className="h-5 w-5"/>
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {tripsToCompare.length > 0 && (
          <div className="mt-12" ref={comparisonRef}>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Comparison</h3>
            <ComparisonView tripsToCompare={tripsToCompare} />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MyTrips);