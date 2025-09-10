


import React from 'react';
import { Flight } from '../../types';
import { Icon } from './Icon';

interface FlightCardProps {
  flight: Flight;
  onBookFlight?: (flight: Flight) => void;
  isSelected: boolean;
  onSelectFlight: (flight: Flight) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onBookFlight, isSelected, onSelectFlight }) => {
  console.log({ flight });
  return (
    <div 
      onClick={() => onSelectFlight(flight)}
      className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 cursor-pointer relative ${isSelected ? 'border-blue-500 shadow-lg' : 'border-white hover:border-slate-300'}`}
    >
       {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center z-10 shadow-md">
            <Icon name="check" className="h-4 w-4" />
        </div>
      )}
      {flight.rankingReason && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 flex items-center border-b border-emerald-200">
            <Icon name="sparkles" className="h-4 w-4 mr-2 text-emerald-600" />
            AI Recommendation: {flight.rankingReason}
        </div>
      )}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex-grow">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
               <Icon name="flight" className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{flight.airline}</p>
              <p className="text-sm text-slate-500">Flight {flight.flightNumber} {flight.provider && <span className="font-semibold">via {flight.provider}</span>}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 sm:space-x-2 text-sm text-slate-600">
              <div className="flex flex-col items-center">
                  <p className="font-bold text-base sm:text-lg">{flight.departure.scheduledTime}</p>
                  <p className="text-xs">{flight.departureTime}</p>
              </div>
              <div className="flex-1 flex flex-col items-center text-slate-400 px-1">
                  <p className="text-xs mb-1 whitespace-nowrap">{flight.duration}</p>
                  <div className="w-full h-px bg-slate-300 relative">
                     <Icon name="takeoff" className="h-4 w-4 absolute -left-1 -top-[7px] bg-white"/>
                     <Icon name="landing" className="h-4 w-4 absolute -right-1 -top-[7px] bg-white"/>
                  </div>
                  <p className="text-xs mt-1 text-orange-500 font-medium">{flight.stops > 0 ? `${flight.stops} stop(s)` : 'Direct'}</p>
              </div>
              <div className="flex flex-col items-center">
                  <p className="font-bold text-base sm:text-lg">{flight.arrival.scheduledTime}</p>
                  <p className="text-xs">{flight.arrivalTime}</p>
              </div>
          </div>
           {flight.negotiationTip && (
            <div className="mt-4 bg-amber-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="sparkles" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">AI Negotiation Tip</p>
                  <p className="text-xs text-amber-700">{flight.negotiationTip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 text-center sm:text-right">
          <p className="text-2xl font-bold text-slate-800">${flight.price.toLocaleString()}</p>
          <p className="text-sm text-slate-500">per person</p>
          {flight.pricePrediction && (
            <div className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              flight.pricePrediction.recommendation === 'Buy Now' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              <Icon 
                name={flight.pricePrediction.recommendation === 'Buy Now' ? 'arrow-up-right' : 'arrow-down-right'} 
                className="mr-1 h-3 w-3" 
              />
              {flight.pricePrediction.recommendation}: {flight.pricePrediction.reason}
            </div>
          )}
          {onBookFlight ? (
             <button
              onClick={(e) => {
                  e.stopPropagation();
                  if (onBookFlight) onBookFlight(flight);
              }}
              className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Book Now
            </button>
          ) : (
             <a
              href={flight.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Deal
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FlightCard);