import React from 'react';
import { SavedTrip, SearchResult, ItineraryPlan, Flight, Stay, Car } from '@/types';

interface ComparisonViewProps {
  tripsToCompare: SavedTrip[];
}

const getPriceRange = (items: (Flight | Stay | Car)[]) => {
  if (items.length === 0) return 'N/A';
  const prices = items.map(item => {
    if (item.type === 'flight') return item.price;
    if (item.type === 'stay') return item.pricePerNight;
    if (item.type === 'car') return item.pricePerDay;
    return 0;
  });
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};


const ComparisonView: React.FC<ComparisonViewProps> = ({ tripsToCompare }) => {
  const allItineraries = tripsToCompare.length > 0 && tripsToCompare.every(trip => trip.type === 'itinerary');
  const allSearches = tripsToCompare.length > 0 && tripsToCompare.every(trip => trip.type === 'search');

  const baseFeatures = [
    "Destination", "Duration", "Activities", "Cultural Tips", "Flights", "Stays", "Cars", "Total Estimated Cost"
  ];

  let features = baseFeatures;

  if (allItineraries) {
    features = baseFeatures.filter(f => !["Flights", "Stays", "Cars"].includes(f));
  } else if (allSearches) {
    features = baseFeatures.filter(f => !["Activities", "Cultural Tips"].includes(f));
  }

  const getCellContent = (trip: SavedTrip, feature: string) => {
    const tripData = trip.data;
    let cellContent = <span className="text-slate-400">—</span>;

    if (trip.type === 'itinerary') {
        const plan = tripData as ItineraryPlan;
        switch (feature) {
            case "Destination": cellContent = <span>{plan.destination}</span>; break;
            case "Duration": cellContent = <span>{plan.itinerary.length} days</span>; break;
            case "Activities": cellContent = <span>{plan.itinerary.length * 3} activities planned</span>; break;
            case "Cultural Tips": cellContent = <span>{plan.culturalTips?.length || 0} tips</span>; break;
            case "Total Estimated Cost":
            if (plan.totalBudget) {
                cellContent = (
                <div>
                    <span className="font-bold">${plan.totalBudget.toLocaleString()}</span>
                    <p className="text-xs text-slate-500">AI Estimated</p>
                </div>
                );
            }
            break;
        }
    } else { // 'search'
        const results = tripData as SearchResult[];
        const flights = results.filter(r => r.type === 'flight') as Flight[];
        const stays = results.filter(r => r.type === 'stay') as Stay[];
        const cars = results.filter(r => r.type === 'car') as Car[];
        const isPackage = flights.length > 0 && stays.length > 0;

        switch (feature) {
            case "Destination": {
                let destination = 'N/A';
                if (flights.length > 0) destination = flights[0].arrivalAirport;
                else if (stays.length > 0) destination = stays[0].location;
                else if (cars.length > 0) destination = cars[0].location;
                cellContent = <span>{destination}</span>;
                break;
            }
            case "Flights":
                cellContent = flights.length > 0 ? (
                    <div>
                        <span>{flights.length} found</span>
                        <p className="text-xs text-slate-500">{getPriceRange(flights)}</p>
                        {isPackage && <p className="text-xs font-semibold text-blue-600">Package Deal</p>}
                    </div>
                ) : <span>0 found</span>;
                break;
             case "Stays":
                cellContent = stays.length > 0 ? (
                    <div>
                        <span>{stays.length} found</span>
                        <p className="text-xs text-slate-500">{getPriceRange(stays)}/night</p>
                        {isPackage && <p className="text-xs font-semibold text-blue-600">Package Deal</p>}
                    </div>
                ) : <span>0 found</span>;
                break;
            // ... more cases
        }
    }
    return cellContent;
  };

  return (
    <div className="overflow-x-auto">
        <div className="border border-slate-200 rounded-lg bg-white min-w-[600px]">
            {/* Header Row */}
            <div className="flex bg-slate-50">
                <div className="p-3 w-40 text-xs font-semibold text-slate-500 uppercase">Feature</div>
                {tripsToCompare.map(trip => (
                    <div key={trip.id} className="p-3 flex-1 border-l border-slate-200 text-sm font-semibold text-slate-800">
                        {trip.name}
                    </div>
                ))}
            </div>
            {/* Data Rows */}
            {features.map((feature, index) => (
                <div key={feature} className={`flex border-t border-slate-200 ${index % 2 !== 0 ? 'bg-slate-50/50' : ''}`}>
                    <div className="p-3 w-40 text-sm font-medium text-slate-700">{feature}</div>
                    {tripsToCompare.map(trip => (
                        <div key={trip.id} className="p-3 flex-1 border-l border-slate-200 text-sm text-slate-600">
                            {getCellContent(trip, feature)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
  );
};

export default React.memo(ComparisonView);