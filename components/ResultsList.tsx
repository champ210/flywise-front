import React from 'react';
import { SearchResult, Flight, Stay, Car } from '../types';
import FlightCard from './FlightCard';
import StayCard from './StayCard';
import CarCard from './CarCard';
import { Icon } from './Icon';
import FlightCardSkeleton from './skeletons/FlightCardSkeleton';
import StayCardSkeleton from './skeletons/StayCardSkeleton';
import CarCardSkeleton from './skeletons/CarCardSkeleton';

interface ResultsListProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  onBookFlight: (flight: Flight) => void;
  onBookStay: (stay: Stay) => void;
  onBookCar: (car: Car) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, isLoading, error, onBookFlight, onBookStay, onBookCar }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <FlightCardSkeleton />
        <StayCardSkeleton />
        <CarCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
        <Icon name="error" className="h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-red-800">Oops! Something went wrong.</h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
        <Icon name="search" className="h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-800">No results found</h3>
        <p className="mt-2 text-sm text-slate-500">Try adjusting your search criteria in the chat window.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {results.map((result, index) => {
        const key = `${result.type}-${index}`;
        if (result.type === 'flight') {
          return <FlightCard key={key} flight={result} onBookFlight={onBookFlight} />;
        }
        if (result.type === 'stay') {
          return <StayCard key={key} stay={result} onBookStay={onBookStay} />;
        }
        if (result.type === 'car') {
            return <CarCard key={key} car={result} onBookCar={onBookCar} />;
        }
        return null;
      })}
    </div>
  );
};

export default React.memo(ResultsList);
