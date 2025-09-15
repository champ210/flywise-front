

import React, { useState, useRef } from 'react';
import { SavedTrip, Checklist, ItineraryPlan, TravelInsuranceQuote } from '@/types';
import { Icon } from '@/components/common/Icon';
import ComparisonView from '@/components/ComparisonView';
import ChecklistModal from '@/components/ChecklistModal';
import InsuranceModal from '@/components/InsuranceModal';
import { getTravelChecklist, getInsuranceQuotes } from '@/services/geminiService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LiveTripDashboard from '@/components/LiveTripDashboard';

interface MyTripsProps {
  savedTrips: SavedTrip[];
  onDeleteTrip: (tripId: string) => void;
  isOffline: boolean;
  onOpenScanner: () => void;
  onGetNearbySuggestions: () => void;
}

const MyTrips: React.FC<MyTripsProps> = ({ savedTrips, onDeleteTrip, isOffline, onOpenScanner, onGetNearbySuggestions }) => {
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<{ type: 'checklist' | 'insurance', tripId: string } | null>(null);
  const [modalData, setModalData] = useState<{ trip: SavedTrip, checklist: Checklist } | null>(null);
  const [insuranceModalData, setInsuranceModalData] = useState<{ trip: SavedTrip; quotes: TravelInsuranceQuote[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeTrip = savedTrips.find(trip => {
    if (trip.type !== 'itinerary' || !trip.startDate || !trip.endDate) return false;
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return now >= start && now <= end;
  });

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

  if (activeTrip && activeTrip.type === 'itinerary') {
    return (
      <LiveTripDashboard
        trip={activeTrip as SavedTrip & { data: ItineraryPlan }}
        onOpenScanner={onOpenScanner}
        onGetNearbySuggestions={onGetNearbySuggestions}
      />
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
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
          <div className="space-y-3">
            {savedTrips.map(trip => (
              <div key={trip.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center">
                 <input
                    type="checkbox"
                    checked={selectedTripIds.includes(trip.id)}
                    onChange={() => handleToggleSelect(trip.id)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
                    aria-label={`Select trip: ${trip.name}`}
                  />
                <div className="flex-1">
                  <div className="flex items-center">
                    <Icon name={trip.type === 'itinerary' ? 'planner' : 'search'} className={`h-5 w-5 mr-2 ${trip.type === 'itinerary' ? 'text-indigo-600' : 'text-blue-600'}`} />
                    <p className="font-semibold text-sm text-slate-800">{trip.name}</p>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">
                    Saved on {new Date(trip.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                    {trip.type === 'itinerary' && (
                      <>
                        <button onClick={() => handleGetInsurance(trip)} disabled={!!isGenerating || isOffline} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-50" aria-label="Get insurance quotes">
                          {isGenerating?.type === 'insurance' && isGenerating?.tripId === trip.id ? <LoadingSpinner /> : <Icon name="shield" className="h-5 w-5 text-slate-500" />}
                        </button>
                        <button onClick={() => handleGenerateChecklist(trip)} disabled={!!isGenerating || isOffline} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-50" aria-label="Generate checklist">
                          {isGenerating?.type === 'checklist' && isGenerating?.tripId === trip.id ? <LoadingSpinner /> : <Icon name="lightbulb" className="h-5 w-5 text-slate-500" />}
                        </button>
                      </>
                    )}
                    <button onClick={() => onDeleteTrip(trip.id)} className="p-2 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600" aria-label="Delete trip">
                        <Icon name="trash" className="h-5 w-5"/>
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {tripsToCompare.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800">Comparison</h2>
            <div className="mt-4">
              <ComparisonView tripsToCompare={tripsToCompare} />
            </div>
          </div>
        )}
    </div>
  );
};

export default React.memo(MyTrips);