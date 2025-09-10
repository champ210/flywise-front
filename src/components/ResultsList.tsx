


import React, { useState, useEffect } from 'react';
import { SearchResult, Flight, Stay, Car } from '../../types';
import FlightCard from './FlightCard';
import StayCard from './StayCard';
import CarCard from './CarCard';
import LoadingSpinner from './LoadingSpinner';
import { Icon } from './Icon';
import FlightComparisonModal from './FlightComparisonModal';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ResultsListProps {
  isLoading: boolean;
  onBookFlight?: (flight: Flight) => void;
  onBookStay?: (stay: Stay) => void;
  onBookCar?: (car: Car) => void;
}

const INITIAL_LOAD_COUNT = 5;

const ResultsList: React.FC<ResultsListProps> = ({ isLoading, onBookFlight, onBookStay, onBookCar }) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
  const [selectedFlights, setSelectedFlights] = useState<Flight[]>([]);
  const [isComparisonVisible, setIsComparisonVisible] = useState(false);
  
  const results: SearchResult[] = useSelector((state: RootState) => state.results.results);
  const hasFlights = results.some(r => r.type === 'flight');

  useEffect(() => {
    console.log("list", {results});
    // Reset the count and selection when a new set of results comes in
    setVisibleCount(INITIAL_LOAD_COUNT);
    setSelectedFlights([]);
    setIsComparisonVisible(false);
  }, [results]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlights(prev => {
        const isAlreadySelected = prev.some(f => f.flightNumber === flight.flightNumber && f.departureTime === flight.departureTime && f.price === flight.price);
        if (isAlreadySelected) {
            return prev.filter(f => !(f.flightNumber === flight.flightNumber && f.departureTime === flight.departureTime && f.price === flight.price));
        }
        return [...prev, flight];
    });
  };

  const handleClearSelection = () => {
    setSelectedFlights([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10">
        <LoadingSpinner />
        <p className="mt-4 text-lg font-semibold text-slate-700">Finding the best deals for you...</p>
        <p className="text-slate-500">This may take a moment.</p>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
  //       <Icon name="error" className="h-12 w-12 text-red-500" />
  //       <h3 className="mt-4 text-lg font-semibold text-red-800">Oops! Something went wrong.</h3>
  //       <p className="mt-2 text-sm text-red-600">{error}</p>
  //     </div>
  //   );
  // }

  if (results.length === 0) {
    return (
      <div className="text-center p-10">
        <Icon name="search" className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">No results found</h3>
        <p className="mt-1 text-sm text-slate-500">Try adjusting your search or using the chat assistant.</p>
      </div>
    );
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + INITIAL_LOAD_COUNT);
  };

  const visibleResults = results.slice(0, visibleCount);
  const canLoadMore = visibleCount < results.length;

  console.log({ results, visibleResults });

  return (
    <div className="space-y-4">
      {hasFlights && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <Icon name="info" className="inline h-4 w-4 mr-2" />
          Click on flight cards to select them for a side-by-side comparison.
        </div>
      )}
      {visibleResults.map((result, index) => {
        if (result.type === 'flight') {
          const isSelected = selectedFlights.some(f => f.flightNumber === result.flightNumber && f.departureTime === result.departureTime && f.price === result.price);
          return (
            <FlightCard
              key={`${result.flightNumber}-${index}`}
              flight={result}
              onBookFlight={onBookFlight}
              isSelected={isSelected}
              onSelectFlight={handleSelectFlight}
            />
          );
        }
        if (result.type === 'stay') {
          return <StayCard key={`${result.name}-${index}`} stay={result} onBookStay={onBookStay} />;
        }
        if (result.type === 'car') {
          return <CarCard key={`${result.make}-${result.model}-${index}`} car={result} onBookCar={onBookCar} />;
        }
        return null;
      })}
      {canLoadMore && (
        <div className="text-center pt-4">
            <button 
                onClick={handleLoadMore}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Load More Results
            </button>
        </div>
      )}
      
      {selectedFlights.length > 0 && (
          <div className="sticky bottom-4 inset-x-0 flex justify-center z-10 animate-fade-in-up">
              <div className="bg-white p-3 rounded-full shadow-lg flex items-center gap-4 border border-slate-200">
                  <span className="font-semibold text-sm text-slate-700">{selectedFlights.length} flight{selectedFlights.length > 1 ? 's' : ''} selected</span>
                  <button 
                    onClick={() => setIsComparisonVisible(true)}
                    disabled={selectedFlights.length < 2}
                    className="px-4 py-2 text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    Compare
                  </button>
                  <button onClick={handleClearSelection} className="text-sm text-slate-500 hover:text-slate-700">Clear</button>
              </div>
          </div>
      )}

      {isComparisonVisible && (
          <FlightComparisonModal
            flights={selectedFlights}
            onClose={() => setIsComparisonVisible(false)}
            onBookFlight={onBookFlight}
          />
      )}
    </div>
  );
};

export default React.memo(ResultsList);