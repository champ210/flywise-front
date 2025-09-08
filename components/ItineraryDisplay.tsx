import React, { useState, useEffect } from 'react';
import { ItineraryPlan, SavedTrip, MapMarker, WeatherForecast } from '../types';
import { Icon } from './Icon';
import MapView from './MapView';
import LoadingSpinner from './LoadingSpinner';
import { getCoordinatesForActivities, getWeatherForecast } from '../services/geminiService';
import DestinationImageDisplay from './DestinationImageDisplay';
import WeatherDisplay from './WeatherDisplay';

declare const jspdf: any;

interface ItineraryDisplayProps {
  plan: ItineraryPlan;
  onSaveTrip: (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ plan, onSaveTrip }) => {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Reset state for new plan
    setView('list');
    setMarkers([]);
    setWeather(null);
    setIsWeatherLoading(true);
    setWeatherError(null);
    
    const fetchWeather = async () => {
      try {
        const forecast = await getWeatherForecast(plan.destination, plan.itinerary.length);
        setWeather(forecast);
      } catch (err) {
        setWeatherError(err instanceof Error ? err.message : "Failed to load weather data.");
      } finally {
        setIsWeatherLoading(false);
      }
    };
    
    fetchWeather();
  }, [plan]);

  const handleShowMap = async () => {
    setView('map');
    if (markers.length > 0 || isMapLoading) {
      // Data already fetched or is being fetched, just switch the view
      return;
    }

    setIsMapLoading(true);
    try {
      const fetchedMarkers = await getCoordinatesForActivities(plan.itinerary);
      setMarkers(fetchedMarkers);
    } catch (error) {
      console.error("Failed to load map data:", error);
      // Optional: set an error state to display a message to the user
    } finally {
      setIsMapLoading(false);
    }
  };
  
  const handleSave = () => {
    onSaveTrip({
      name: `Trip to ${plan.destination}`,
      type: 'itinerary',
      data: plan
    });
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      const doc = new jspdf.jsPDF();
      let y = 15;
      const pageMargin = 10;
      const pageWidth = doc.internal.pageSize.getWidth() - pageMargin * 2;

      const addText = (text: string, x: number, size: number, style: 'normal' | 'bold' = 'normal', isCentered = false) => {
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const splitText = doc.splitTextToSize(text, pageWidth - (isCentered ? 0 : x - pageMargin));
        const textX = isCentered ? doc.internal.pageSize.getWidth() / 2 : x;
        doc.text(splitText, textX, y, { align: isCentered ? 'center' : 'left' });
        y += (splitText.length * (size / 2.8));
      };

      // Title
      addText(`Your Itinerary for ${plan.destination}`, 0, 22, 'bold', true);
      y += 8;

      // Budget
      if (plan.totalBudget && plan.budgetBreakdown) {
        addText('Smart Budget Advisor', pageMargin, 16, 'bold');
        y += 2;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(pageMargin, y, pageWidth + pageMargin, y);
        y += 6;
        addText(`Total Estimated Budget: $${plan.totalBudget.toLocaleString()}`, pageMargin, 14, 'bold');
        y += 6;
        const breakdown = plan.budgetBreakdown;
        if(breakdown.lodging) addText(`- Lodging: $${breakdown.lodging.estimate.toLocaleString()} (${breakdown.lodging.details})`, pageMargin + 5, 11);
        if(breakdown.food) addText(`- Food: $${breakdown.food.estimate.toLocaleString()} (${breakdown.food.details})`, pageMargin + 5, 11);
        if(breakdown.activities) addText(`- Activities: $${breakdown.activities.estimate.toLocaleString()} (${breakdown.activities.details})`, pageMargin + 5, 11);
        if(breakdown.transport) addText(`- Transport: $${breakdown.transport.estimate.toLocaleString()} (${breakdown.transport.details})`, pageMargin + 5, 11);
        y += 10;
      }
      
      // Itinerary Days
      plan.itinerary.forEach(day => {
        addText(`Day ${day.day}`, pageMargin, 16, 'bold');
        y += 2;
        doc.setDrawColor(226, 232, 240);
        doc.line(pageMargin, y, pageWidth + pageMargin, y);
        y += 6;

        // Morning
        addText('Morning:', pageMargin, 12, 'bold');
        addText(`${day.morning.locationName}`, pageMargin + 5, 11);
        addText(day.morning.address, pageMargin + 5, 9);
        addText(day.morning.description, pageMargin + 5, 11);
        y += 4;
        
        // Afternoon
        addText('Afternoon:', pageMargin, 12, 'bold');
        addText(`${day.afternoon.locationName}`, pageMargin + 5, 11);
        addText(day.afternoon.address, pageMargin + 5, 9);
        addText(day.afternoon.description, pageMargin + 5, 11);
        y += 4;
        
        // Evening
        addText('Evening:', pageMargin, 12, 'bold');
        addText(`${day.evening.locationName}`, pageMargin + 5, 11);
        addText(day.evening.address, pageMargin + 5, 9);
        addText(day.evening.description, pageMargin + 5, 11);
        y += 10;
      });

      // Cultural Tips
      if (plan.culturalTips && plan.culturalTips.length > 0) {
         addText('Cultural Tips & Food Guide', pageMargin, 16, 'bold');
         y += 2;
         doc.setDrawColor(226, 232, 240);
         doc.line(pageMargin, y, pageWidth + pageMargin, y);
         y += 6;
         plan.culturalTips.forEach(tip => {
            addText(`- ${tip}`, pageMargin + 5, 11);
            y += 2;
         });
      }

      doc.save(`FlyWise_Itinerary_${plan.destination}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
      // Optionally set an error state to show the user
    } finally {
      setIsDownloading(false);
    }
  };

  const renderBudgetCategory = (icon: string, title: string, data: { estimate: number; details: string; }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 flex space-x-4 items-start">
        <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
            <Icon name={icon} className="h-6 w-6 text-indigo-700" />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-600">{title}</p>
            <p className="text-xl font-bold text-slate-800">${data.estimate.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{data.details}</p>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-center">
        Your Custom Itinerary for <span className="text-blue-600">{plan.destination}</span>
      </h2>

      <DestinationImageDisplay plan={plan} />

      <div className="animate-fade-in-up">
        {isWeatherLoading ? (
          <div className="h-40 bg-slate-100 rounded-lg flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-3 text-slate-600">Fetching weather forecast...</span>
          </div>
        ) : weatherError ? (
           <div className="h-40 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center p-4">
             <Icon name="error" className="h-8 w-8 text-red-500 mb-2" />
             <p className="text-sm font-semibold text-red-700">Could not load weather</p>
             <p className="text-xs text-red-600 text-center">{weatherError}</p>
           </div>
        ) : weather ? (
          <WeatherDisplay forecast={weather} />
        ) : null}
      </div>


      {/* View Toggle */}
      <div className="flex justify-center space-x-2 bg-slate-100 p-1 rounded-full w-min mx-auto print:hidden">
        <button 
          onClick={() => setView('list')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 flex items-center ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          <Icon name="planner" className="h-5 w-5 mr-2" />
          List View
        </button>
        <button 
          onClick={handleShowMap}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 flex items-center ${view === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          <Icon name="map" className="h-5 w-5 mr-2" />
          Map View
        </button>
      </div>

      {view === 'list' ? (
        <>
          {plan.budgetBreakdown && (
            <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-5">
              <h3 className="text-xl font-semibold text-indigo-900 flex items-center">
                <Icon name="money" className="h-6 w-6 mr-3 text-indigo-600" />
                Smart Budget Advisor
              </h3>
              {plan.totalBudget && (
                <p className="mt-2 text-3xl font-bold text-slate-800 text-center">
                  <span className="text-indigo-600">${plan.totalBudget.toLocaleString()}</span>
                  <span className="text-lg font-normal text-slate-500"> Total Est. Budget</span>
                </p>
              )}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.budgetBreakdown.lodging && renderBudgetCategory('hotel', 'Lodging', plan.budgetBreakdown.lodging)}
                {plan.budgetBreakdown.food && renderBudgetCategory('food', 'Food', plan.budgetBreakdown.food)}
                {plan.budgetBreakdown.activities && renderBudgetCategory('ticket', 'Activities', plan.budgetBreakdown.activities)}
                {plan.budgetBreakdown.transport && renderBudgetCategory('car', 'Transport', plan.budgetBreakdown.transport)}
              </div>
            </div>
          )}

          {plan.itinerary.map((day, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-blue-100 border-b border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800">Day {day.day}</h3>
              </div>
              <div className="divide-y divide-slate-200">
                 <div className="p-4 flex items-start space-x-4">
                    <div className="flex-shrink-0 flex flex-col items-center text-slate-500 pt-1">
                        <Icon name="sun" className="h-6 w-6 text-orange-400" /> 
                        <span className="text-xs font-medium mt-1">Morning</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{day.morning.locationName}</h4>
                        <p className="text-xs text-slate-500">{day.morning.address}</p>
                        <p className="text-sm text-slate-700 mt-1">{day.morning.description}</p>
                    </div>
                 </div>
                 <div className="p-4 flex items-start space-x-4">
                     <div className="flex-shrink-0 flex flex-col items-center text-slate-500 pt-1">
                        <Icon name="sun" className="h-6 w-6 text-yellow-500" />
                         <span className="text-xs font-medium mt-1">Afternoon</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{day.afternoon.locationName}</h4>
                        <p className="text-xs text-slate-500">{day.afternoon.address}</p>
                        <p className="text-sm text-slate-700 mt-1">{day.afternoon.description}</p>
                    </div>
                 </div>
                 <div className="p-4 flex items-start space-x-4">
                     <div className="flex-shrink-0 flex flex-col items-center text-slate-500 pt-1">
                        <Icon name="moon" className="h-6 w-6 text-indigo-500" />
                         <span className="text-xs font-medium mt-1">Evening</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{day.evening.locationName}</h4>
                        <p className="text-xs text-slate-500">{day.evening.address}</p>
                        <p className="text-sm text-slate-700 mt-1">{day.evening.description}</p>
                    </div>
                 </div>
              </div>
            </div>
          ))}

          {plan.culturalTips && plan.culturalTips.length > 0 && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="text-xl font-semibold text-green-900 flex items-center">
                <Icon name="info" className="h-6 w-6 mr-3 text-green-600" />
                Cultural Tips & Food Guide
              </h3>
              <ul className="mt-3 list-disc list-outside space-y-2 text-sm text-green-800 pl-8">
                {plan.culturalTips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          {isMapLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-10 h-96 border-2 border-dashed border-slate-200 rounded-lg">
              <LoadingSpinner />
              <p className="mt-4 text-slate-600">Plotting your trip on the map...</p>
            </div>
          ) : (
            <MapView markers={markers} />
          )}
        </div>
      )}

      <div className="mt-8 text-center print:hidden flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Icon name="bookmark" className="h-5 w-5 mr-2" />
          Save to My Trips
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="inline-flex items-center px-6 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-200"
        >
          {isDownloading ? <LoadingSpinner /> : <Icon name="download" className="h-5 w-5 mr-2" />}
          Download Itinerary
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-6 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          <Icon name="print" className="h-5 w-5 mr-2" />
          Print Itinerary
        </button>
      </div>

    </div>
  );
};

export default React.memo(ItineraryDisplay);