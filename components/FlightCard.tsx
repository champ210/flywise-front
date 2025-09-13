import React from 'react';
import { Flight } from '../types';
import { Icon } from './Icon';

interface FlightCardProps {
  flight: Flight;
  onBookFlight: (flight: Flight) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onBookFlight }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex-grow w-full">
          <div className="flex items-center space-x-4">
            <Icon name="logo" className="w-12 h-12 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-lg text-slate-800">{flight.airline}</p>
              <p className="text-sm text-slate-500">Flight {flight.flightNumber}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="text-center">
              <p className="font-bold text-lg">{flight.departureTime}</p>
              <p className="text-sm text-slate-600">{flight.departureAirport}</p>
            </div>
            <div className="flex-1 text-center text-sm text-slate-500">
              <p>{flight.duration}</p>
              <div className="relative">
                <hr className="border-slate-300 border-dashed" />
                <Icon name="flight" className="h-5 w-5 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1" />
              </div>
              <p>{flight.stops > 0 ? `${flight.stops} stop(s)` : 'Direct'}</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{flight.arrivalTime}</p>
              <p className="text-sm text-slate-600">{flight.arrivalAirport}</p>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-40 mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex flex-col items-center sm:items-end">
          <p className="text-3xl font-bold text-slate-800">${flight.price.toLocaleString()}</p>
          <p className="text-sm text-slate-500">per person</p>
          <button onClick={() => onBookFlight(flight)} className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FlightCard);
