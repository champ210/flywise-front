
import React from 'react';
import { SavedTrip, SearchResult, ItineraryPlan, Flight, Stay, Car } from '../types';

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


  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
      <table className="w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Feature</th>
            {tripsToCompare.map(trip => (
              <th key={trip.id} className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-l border-slate-200 w-1/4">
                {trip.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {features.map((feature, index) => (
            <tr key={feature} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              <td className="p-3 text-sm font-medium text-slate-800">{feature}</td>
              {tripsToCompare.map(trip => {
                const tripData = trip.data;
                let cellContent = <span className="text-slate-500">—</span>;

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
                            <span className="font-semibold text-slate-900">${plan.totalBudget.toLocaleString()}</span>
                            <p className="text-xs text-slate-500">AI Estimated</p>
                          </div>
                        );
                      }
                      break;
                    case "Flights":
                    case "Stays":
                    case "Cars":
                        cellContent = <span className="text-xs italic text-slate-500">N/A</span>;
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
                      // Prioritize flight destination, then stay, then car
                      if (flights.length > 0) destination = flights[0].arrivalAirport;
                      else if (stays.length > 0) destination = stays[0].location;
                      else if (cars.length > 0) destination = cars[0].location;
                      cellContent = <span>{destination}</span>;
                      break;
                    }
                    case "Duration": {
                      let durationText = 'N/A';
                      // Prioritize stay duration, then car
                      const firstStay = stays.find(s => s.numberOfNights);
                      if (firstStay) {
                          durationText = `${firstStay.numberOfNights} night(s)`;
                      } else {
                          const firstCar = cars.find(c => c.numberOfDays);
                          if (firstCar) durationText = `${firstCar.numberOfDays} day(s)`;
                      }
                      cellContent = <span>{durationText}</span>;
                      break;
                    }
                    case "Flights":
                      cellContent = flights.length > 0 ? (
                          <div>
                              <span>{flights.length} found</span>
                              <br />
                              <span className="text-xs">{getPriceRange(flights)}</span>
                              {isPackage && <span className="text-xs block font-semibold text-blue-600">Package Deal</span>}
                          </div>
                      ) : <span>0 found</span>;
                      break;
                    case "Stays":
                      cellContent = stays.length > 0 ? (
                          <div>
                              <span>{stays.length} found</span>
                              <br />
                              <span className="text-xs">{getPriceRange(stays)}/night</span>
                              {isPackage && <span className="text-xs block font-semibold text-blue-600">Package Deal</span>}
                          </div>
                      ) : <span>0 found</span>;
                      break;
                    case "Cars":
                      cellContent = cars.length > 0 ? (
                          <div>
                              <span>{cars.length} found</span>
                              <br />
                              <span className="text-xs">{getPriceRange(cars)}/day</span>
                          </div>
                      ) : <span>0 found</span>;
                      break;
                    case "Total Estimated Cost": {
                      let total = 0;
                      let description = '';

                      if (isPackage) {
                          const cheapestFlight = flights.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
                          const cheapestStay = stays.reduce((prev, curr) => prev.pricePerNight < curr.pricePerNight ? prev : curr);
                          total = cheapestFlight.price + (cheapestStay.pricePerNight * (cheapestStay.numberOfNights || 1));
                          description = "Cheapest flight + stay";
                      } else if (flights.length > 0) {
                          const cheapestFlight = flights.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
                          total = cheapestFlight.price;
                          description = "Cheapest flight";
                      } else if (stays.length > 0) {
                          const cheapestStay = stays.reduce((prev, curr) => prev.pricePerNight < curr.pricePerNight ? prev : curr);
                          total = cheapestStay.pricePerNight * (cheapestStay.numberOfNights || 1);
                          description = "Cheapest stay";
                      } else if (cars.length > 0) {
                          const cheapestCar = cars.reduce((prev, curr) => prev.pricePerDay < curr.pricePerDay ? prev : curr);
                          total = cheapestCar.pricePerDay * (cheapestCar.numberOfDays || 1);
                          description = "Cheapest car rental";
                      }

                      if (total > 0) {
                          cellContent = (
                              <div>
                                  <span className="font-semibold text-slate-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  <p className="text-xs text-slate-500">{description}</p>
                              </div>
                          );
                      }
                      break;
                    }
                    case "Activities":
                    case "Cultural Tips":
                         cellContent = <span className="text-xs italic text-slate-500">N/A</span>;
                        break;
                  }
                }
                return (
                  <td key={trip.id} className="p-3 text-sm text-slate-700 border-l border-slate-200 align-top">
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(ComparisonView);
