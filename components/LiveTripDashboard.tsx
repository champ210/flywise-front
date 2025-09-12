import React, { useState } from 'react';
import { SavedTrip, ItineraryPlan, DocumentScanResult } from '../types';
import { Icon } from './Icon';
import FlightTracker from './FlightTracker';

interface LiveTripDashboardProps {
  trip: SavedTrip & { data: ItineraryPlan };
  onOpenScanner: () => void;
  onGetNearbySuggestions: () => void;
}

const LiveTripDashboard: React.FC<LiveTripDashboardProps> = ({ trip, onOpenScanner, onGetNearbySuggestions }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'docs' | 'flight'>('today');

  const getTodaysItinerary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripStartDate = new Date(trip.startDate || '');
    tripStartDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - tripStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Day number in itinerary is 1-based
    const currentDayNumber = diffDays + 1;

    return trip.data.itinerary.find(day => day.day === currentDayNumber);
  };

  const todaysPlan = getTodaysItinerary();

  const renderContent = () => {
    switch (activeTab) {
      case 'flight':
        return trip.flightNumber ? (
            <div className="p-4">
                <FlightTracker initialFlightNumber={trip.flightNumber} />
            </div>
        ) : (
            <div className="p-10 text-center text-slate-500">
                No flight number is associated with this trip.
            </div>
        );

      case 'docs':
        return (
            <div className="p-4 space-y-4">
                {(trip.documents && trip.documents.length > 0) ? trip.documents.map((doc, index) => (
                    <div key={index} className="bg-white p-3 rounded-md border border-slate-200">
                        <h4 className="font-semibold text-blue-600">{doc.documentType}</h4>
                        <p className="text-sm">Conf #: {doc.confirmationNumber || 'N/A'}</p>
                    </div>
                )) : (
                    <p className="text-center text-slate-500">No documents scanned for this trip yet.</p>
                )}
                 <button onClick={onOpenScanner} className="w-full mt-4 p-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-slate-50 transition-colors text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2">
                    <Icon name="plus" className="h-5 w-5" />
                    <span className="font-semibold text-sm">Scan a New Document</span>
                </button>
            </div>
        );

      case 'today':
      default:
        return todaysPlan ? (
            <div className="p-4 space-y-4">
                <div className="p-4 flex items-start space-x-4 bg-white rounded-lg border">
                    <div className="flex-shrink-0 flex flex-col items-center text-slate-500 pt-1">
                        <Icon name="sun" className="h-6 w-6 text-orange-400" /> 
                        <span className="text-xs font-medium mt-1">Morning</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{todaysPlan.morning.locationName}</h4>
                        <p className="text-sm text-slate-700 mt-1">{todaysPlan.morning.description}</p>
                    </div>
                </div>
                <div className="p-4 flex items-start space-x-4 bg-white rounded-lg border">
                    <div className="flex-shrink-0 flex flex-col items-center text-slate-500 pt-1">
                        <Icon name="sun" className="h-6 w-6 text-yellow-500" />
                        <span className="text-xs font-medium mt-1">Afternoon</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{todaysPlan.afternoon.locationName}</h4>
                        <p className="text-sm text-slate-700 mt-1">{todaysPlan.afternoon.description}</p>
                    </div>
                </div>
                 <div className="p-4 flex items-start space-x-4 bg-white rounded-lg border">
                    <div className="flex-shrink-0 flex flex-col items-center text-slate-500 pt-1">
                        <Icon name="moon" className="h-6 w-6 text-indigo-500" />
                        <span className="text-xs font-medium mt-1">Evening</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{todaysPlan.evening.locationName}</h4>
                        <p className="text-sm text-slate-700 mt-1">{todaysPlan.evening.description}</p>
                    </div>
                </div>
            </div>
        ) : (
            <div className="p-10 text-center text-slate-500">
                No itinerary planned for today. Time for spontaneous adventures!
            </div>
        );
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Live Trip Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          You're currently on your trip to <span className="font-semibold">{trip.data.destination}</span>. Here's your in-trip assistant.
        </p>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-bold text-green-800 flex items-center gap-2">
          <Icon name="compass" className="h-6 w-6 text-green-600" /> Spontaneous Discovery
        </h3>
        <p className="text-sm text-slate-600 mt-1">Feeling adventurous? Find out what's interesting around you right now.</p>
        <button onClick={onGetNearbySuggestions} className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
          <Icon name="sparkles" className="h-5 w-5 mr-2" /> What's Nearby?
        </button>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
            <button onClick={() => setActiveTab('today')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'today' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>Today's Plan</button>
            <button onClick={() => setActiveTab('docs')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'docs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>My Documents</button>
            {trip.flightNumber && <button onClick={() => setActiveTab('flight')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'flight' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>Flight Status</button>}
          </nav>
        </div>
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LiveTripDashboard;