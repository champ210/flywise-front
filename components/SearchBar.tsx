
import React, { useState } from 'react';
import { Flight, Stay, Car, UserProfile } from '../types';
import { Icon } from './Icon';

interface SearchBarProps {
  onSearch: (results: (Flight | Stay | Car)[]) => void;
  onLoading: (isLoading: boolean) => void;
  onError: (error: string) => void;
  userProfile: UserProfile;
}

enum SearchType {
  Flights = 'Flights',
  Stays = 'Stays',
  Cars = 'Cars',
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLoading, onError, userProfile }) => {
  const [searchType, setSearchType] = useState<SearchType>(SearchType.Flights);
  const [occupancy, setOccupancy] = useState({ guests: 2, passengers: 2 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would gather form data and call an API.
    // This is a placeholder as the main interaction is via the chat AI.
    onLoading(true);
    onError("Please use the Chat Assistant to perform searches. The standard search bar is for demonstration purposes.");
    onSearch([]);
    onLoading(false);
  };

  const handleOccupancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOccupancy(prev => ({ ...prev, [name]: parseInt(value, 10) || 1 }));
  };

  const renderFlightForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <div className="relative">
        <label htmlFor="from" className="block text-sm font-medium text-slate-700">From</label>
        <Icon name="takeoff" className="absolute left-3 top-9 h-5 w-5 text-slate-400" />
        <input type="text" id="from" placeholder="Casablanca" className="mt-1 pl-10 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
      <div className="relative">
        <label htmlFor="to" className="block text-sm font-medium text-slate-700">To</label>
         <Icon name="landing" className="absolute left-3 top-9 h-5 w-5 text-slate-400" />
        <input type="text" id="to" placeholder="Dubai" className="mt-1 pl-10 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="depart" className="block text-sm font-medium text-slate-700">Depart</label>
          <input type="date" id="depart" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="return" className="block text-sm font-medium text-slate-700">Return</label>
          <input type="date" id="return" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
      </div>
      <div>
        <button type="submit" className="w-full justify-center inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
           <Icon name="search" className="mr-2 -ml-1 h-5 w-5" />
          Search
        </button>
      </div>
    </div>
  );

  const renderStayForm = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      <div className="lg:col-span-2">
        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
        <input type="text" id="location" placeholder="e.g., Paris, France" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="checkin" className="block text-sm font-medium text-slate-700">Check-in</label>
        <input type="date" id="checkin" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="checkout" className="block text-sm font-medium text-slate-700">Check-out</label>
        <input type="date" id="checkout" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
       <div>
        <label htmlFor="guests" className="block text-sm font-medium text-slate-700">Guests</label>
        <input 
            type="number" 
            id="guests" 
            name="guests" 
            value={occupancy.guests} 
            onChange={handleOccupancyChange} 
            min="1" 
            className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
        />
      </div>
       <div className="lg:col-span-5">
        <button type="submit" className="w-full justify-center inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
           <Icon name="search" className="mr-2 -ml-1 h-5 w-5" />
          Search Stays
        </button>
      </div>
    </div>
  );

  const renderCarForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="lg:col-span-2">
            <label htmlFor="car-location" className="block text-sm font-medium text-slate-700">Pick-up Location</label>
            <input type="text" id="car-location" placeholder="e.g., Paris, France" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div>
            <label htmlFor="pickup-date" className="block text-sm font-medium text-slate-700">Pick-up</label>
            <input type="date" id="pickup-date" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div>
            <label htmlFor="dropoff-date" className="block text-sm font-medium text-slate-700">Drop-off</label>
            <input type="date" id="dropoff-date" className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-slate-700">Passengers</label>
            <input 
                type="number" 
                id="passengers" 
                name="passengers"
                value={occupancy.passengers}
                onChange={handleOccupancyChange}
                min="1" 
                className="mt-1 block w-full rounded-md bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
            />
        </div>
        <div className="lg:col-span-5">
            <button type="submit" className="w-full justify-center inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Icon name="search" className="mr-2 -ml-1 h-5 w-5" />
            Search Cars
            </button>
        </div>
    </div>
  );


  return (
    <div>
      <div className="flex space-x-1 rounded-t-lg bg-slate-200 p-1 w-min">
        <button onClick={() => setSearchType(SearchType.Flights)} className={`px-4 py-2 text-sm font-medium rounded-md ${searchType === SearchType.Flights ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>
          <Icon name="flight" className="inline mr-2 h-5 w-5" /> Flights
        </button>
        <button onClick={() => setSearchType(SearchType.Stays)} className={`px-4 py-2 text-sm font-medium rounded-md ${searchType === SearchType.Stays ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>
          <Icon name="hotel" className="inline mr-2 h-5 w-5" /> Stays
        </button>
         <button onClick={() => setSearchType(SearchType.Cars)} className={`px-4 py-2 text-sm font-medium rounded-md ${searchType === SearchType.Cars ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600'}`}>
          <Icon name="car" className="inline mr-2 h-5 w-5" /> Cars
        </button>
      </div>
      <form onSubmit={handleSearch} className="p-4 bg-white border border-t-0 border-slate-200 rounded-b-lg rounded-tr-lg">
        {(() => {
          switch (searchType) {
            case SearchType.Flights:
              return renderFlightForm();
            case SearchType.Stays:
              return renderStayForm();
            case SearchType.Cars:
              return renderCarForm();
            default:
              return null;
          }
        })()}
      </form>
    </div>
  );
};

export default React.memo(SearchBar);