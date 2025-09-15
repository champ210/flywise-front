import React, { useState, useEffect } from 'react';
import { ItineraryPlan, SavedTrip, DailyPlan, WeatherForecast } from '@/types';
import { Icon } from '@/components/common/Icon';
import MapView from '@/components/MapView';
import { getCoordinatesForActivities, getWeatherForecast } from '@/services/geminiService';
import DestinationImageDisplay from '@/components/DestinationImageDisplay';
import WeatherDisplay from '@/components/WeatherDisplay';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ItineraryDisplayProps {
  plan: ItineraryPlan;
  onSaveTrip: (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => void;
  isOffline: boolean;
  onFindFlights: (plan: ItineraryPlan) => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ plan, onSaveTrip, isOffline, onFindFlights }) => {
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [isSaved, setIsSaved] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isLoadingExtras, setIsLoadingExtras] = useState(true);

  useEffect(() => {
    const fetchExtras = async () => {
        setIsLoadingExtras(true);
        try {
            const [coords, weatherForecast] = await Promise.all([
                getCoordinatesForActivities(plan.itinerary),
                getWeatherForecast(plan.destination, plan.itinerary.length)
            ]);
            setMapMarkers(coords);
            setWeather(weatherForecast);
        } catch (error) {
            console.error("Failed to fetch itinerary extras:", error);
        } finally {
            setIsLoadingExtras(false);
        }
    }
    fetchExtras();
  }, [plan]);

  const handleSave = () => {
    const tripData = {
      name: `Trip to ${plan.destination}`,
      type: 'itinerary' as const,
      data: plan,
      startDate: new Date().toISOString(), // This should be set properly from user input
      endDate: new Date(new Date().setDate(new Date().getDate() + plan.itinerary.length)).toISOString(),
    };
    onSaveTrip(tripData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };
  
  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="animate-fade-in-up">
        <DestinationImageDisplay plan={plan} />
        
        <div className="flex justify-between items-center mt-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Your Itinerary for {plan.destination}</h2>
                <p className="text-sm text-slate-500">{plan.itinerary.length}-day trip</p>
            </div>
             <div className="flex items-center space-x-2 print:hidden">
                <button onClick={handlePrint} className="p-2 rounded-full text-slate-500 hover:bg-slate-200"><Icon name="printer" className="h-5 w-5" /></button>
                <button
                    onClick={handleSave}
                    disabled={isSaved || isOffline}
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-colors duration-300 ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:bg-slate-400`}
                >
                    <Icon name={isSaved ? "check-circle" : "bookmark"} className="mr-2 h-5 w-5" />
                    {isSaved ? 'Saved!' : (isOffline ? 'Offline' : 'Save Trip')}
                </button>
            </div>
        </div>

        {weather && weather.length > 0 && (
            <div className="mt-4">
                <WeatherDisplay forecast={weather} />
            </div>
        )}

        <div className="mt-6 flex justify-center items-center border-b border-slate-200 print:hidden">
            <button onClick={() => setActiveView('list')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeView === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon name="list" className="h-5 w-5"/> Itinerary List
            </button>
            <button onClick={() => setActiveView('map')} className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 ${activeView === 'map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon name="map" className="h-5 w-5"/> Map View
            </button>
        </div>

        <div className="mt-6">
            {activeView === 'list' ? (
                 <div className="space-y-6">
                    {plan.itinerary.map((day: DailyPlan) => (
                        <div key={day.day} className="p-4 bg-white rounded-lg border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Day {day.day}</h3>
                            <div className="mt-4 space-y-4">
                               <p><strong>Morning:</strong> {day.morning.description} at <em>{day.morning.locationName}</em></p>
                               <p><strong>Afternoon:</strong> {day.afternoon.description} at <em>{day.afternoon.locationName}</em></p>
                               <p><strong>Evening:</strong> {day.evening.description} at <em>{day.evening.locationName}</em></p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-[500px] w-full bg-slate-200 rounded-lg overflow-hidden">
                    {isLoadingExtras ? <LoadingSpinner /> : <MapView markers={mapMarkers} />}
                </div>
            )}
        </div>
        
        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="text-xl font-semibold text-slate-800">Cultural & Travel Tips</h3>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-700 space-y-1">
                {plan.culturalTips?.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
        </div>
        
        {plan.totalBudget && plan.budgetBreakdown && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-slate-800">Estimated Budget: ${plan.totalBudget.toLocaleString()}</h3>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(plan.budgetBreakdown).map(([key, value]) => value && (
                        <div key={key}>
                            <p className="text-sm font-semibold capitalize">{key}</p>
                            <p className="text-lg font-bold">${value.estimate.toLocaleString()}</p>
                            <p className="text-xs text-slate-600">{value.details}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="mt-8 print:hidden">
            <button
                onClick={() => onFindFlights(plan)}
                className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
                <Icon name="flight" className="mr-2 h-5 w-5" />
                Find Flights & Stays for this Trip
            </button>
        </div>
    </div>
  );
};

export default React.memo(ItineraryDisplay);