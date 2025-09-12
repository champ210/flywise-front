import React from 'react';

const GroupTripCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row">
    <div className="sm:w-1/3 h-48 sm:h-auto animate-shimmer bg-slate-200 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"></div>
    <div className="p-4 flex flex-col justify-between flex-1">
      <div>
        <div className="h-6 w-3/4 rounded animate-shimmer bg-slate-200"></div>
        <div className="mt-2 h-4 w-1/2 rounded animate-shimmer bg-slate-200"></div>
        <div className="mt-1 h-4 w-1/2 rounded animate-shimmer bg-slate-200"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 h-9 w-full rounded animate-shimmer bg-slate-200"></div>
    </div>
  </div>
);

export default GroupTripCardSkeleton;
