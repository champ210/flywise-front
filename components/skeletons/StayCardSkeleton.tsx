import React from 'react';

const StayCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 flex flex-col sm:flex-row">
    <div className="sm:w-1/3 h-48 sm:h-auto animate-shimmer bg-slate-200"></div>
    <div className="p-4 flex flex-col justify-between flex-1">
      <div>
        <div className="h-4 w-1/2 rounded animate-shimmer bg-slate-200"></div>
        <div className="h-6 w-3/4 rounded mt-2 animate-shimmer bg-slate-200"></div>
        <div className="h-5 w-1/3 rounded mt-3 animate-shimmer bg-slate-200"></div>
      </div>
      <div className="mt-4 flex justify-between items-end">
        <div className="w-1/3">
          <div className="h-8 w-3/4 rounded animate-shimmer bg-slate-200"></div>
          <div className="h-4 w-1/2 rounded mt-2 animate-shimmer bg-slate-200"></div>
        </div>
        <div className="h-10 w-24 rounded animate-shimmer bg-slate-200"></div>
      </div>
    </div>
  </div>
);

export default StayCardSkeleton;
