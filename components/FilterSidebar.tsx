

import React, { useState, useEffect } from 'react';
import { SearchResult, Flight, Stay, Car } from '@/types';
import { Icon } from '@/components/common/Icon';

interface FilterSidebarProps {
  results: SearchResult[];
  onFilterChange: (filteredResults: SearchResult[]) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ results, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [maxStops, setMaxStops] = useState(2);
  const [minRating, setMinRating] = useState(0);

  // Derive initial filter bounds from results
  useEffect(() => {
    if (results.length > 0) {
      const prices = results.map(r => {
        if (r.type === 'flight') return r.price;
        if (r.type === 'stay') return r.pricePerNight;
        if (r.type === 'car') return r.pricePerDay;
        return 0;
      });
      const maxPrice = Math.max(...prices);
      setPriceRange({ min: 0, max: maxPrice > 0 ? maxPrice : 10000 });
    } else {
      setPriceRange({ min: 0, max: 10000 });
    }
    // Reset filters on new results
    setMaxStops(2);
    setMinRating(0);
  }, [results]);

  // Apply filters whenever a filter value changes
  useEffect(() => {
    const applyFilters = () => {
      const filtered = results.filter(result => {
        // Price filter
        let price = 0;
        if (result.type === 'flight') price = result.price;
        if (result.type === 'stay') price = result.pricePerNight;
        if (result.type === 'car') price = result.pricePerDay;
        if (price > priceRange.max) return false;

        // Stops filter (for flights)
        if (result.type === 'flight') {
          if (result.stops > maxStops) return false;
        }

        // Rating filter (for stays and cars)
        if (result.type === 'stay' || result.type === 'car') {
          if (result.rating < minRating) return false;
        }
        
        return true;
      });
      onFilterChange(filtered);
    };
    applyFilters();
  }, [priceRange, maxStops, minRating, results, onFilterChange]);
  
  const hasFlights = results.some(r => r.type === 'flight');
  const hasStaysOrCars = results.some(r => r.type === 'stay' || r.type === 'car');

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Filter Results</h3>
            <div className="space-y-6">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-700">Max Price: <span className="font-bold text-blue-600">${priceRange.max.toLocaleString()}</span></label>
                    <input
                        type="range"
                        id="price"
                        min={0}
                        max={results.length > 0 ? Math.max(...results.map(r => r.type === 'flight' ? r.price : (r.type === 'stay' ? r.pricePerNight : r.pricePerDay))) : 10000}
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                {hasFlights && (
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Max Stops</label>
                         <div className="flex flex-col space-y-2 mt-2">
                            <button
                                onClick={() => setMaxStops(0)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    maxStops === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                Direct only
                            </button>
                            <button
                                onClick={() => setMaxStops(1)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    maxStops === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                Up to 1 stop
                            </button>
                            <button
                                onClick={() => setMaxStops(2)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    maxStops === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                Any
                            </button>
                        </div>
                    </div>
                )}
                 {hasStaysOrCars && (
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Minimum Rating</label>
                        <div className="flex items-center space-x-1 mt-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setMinRating(star)} className="focus:outline-none p-1">
                                    <Icon name="star" className={`h-6 w-6 cursor-pointer transition-colors ${minRating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`} />
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setMinRating(0)} className="text-xs text-slate-500 hover:text-blue-600 mt-2">Reset rating</button>
                    </div>
                 )}
            </div>
        </div>
    </aside>
  );
};

export default React.memo(FilterSidebar);