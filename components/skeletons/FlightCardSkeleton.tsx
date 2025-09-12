import React from 'react';

const FlightCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 p-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div className="flex-grow w-full">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full animate-shimmer bg-slate-200"></div>
          <div className="flex-1">
            <div className="h-4 w-2/4 rounded animate-shimmer bg-slate-200"></div>
            <div className="h-3 w-1/3 rounded mt-2 animate-shimmer bg-slate-200"></div>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <div className="h-5 w-1/4 rounded animate-shimmer bg-slate-200"></div>
          <div className="flex-1 h-2 rounded bg-slate-200"></div>
          <div className="h-5 w-1/4 rounded animate-shimmer bg-slate-200"></div>
        </div>
      </div>
      <div className="w-full sm:w-28 mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex flex-col items-end">
        <div className="h-8 w-3/4 rounded animate-shimmer bg-slate-200"></div>
        <div className="h-4 w-1/2 rounded mt-2 animate-shimmer bg-slate-200"></div>
        <div className="h-8 w-full rounded mt-3 animate-shimmer bg-slate-200"></div>
      </div>
    </div>
  </div>
);

export default FlightCardSkeleton;
