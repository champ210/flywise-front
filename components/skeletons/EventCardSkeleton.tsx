import React from 'react';

const EventCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
    <div className="h-40 animate-shimmer bg-slate-200"></div>
    <div className="p-4 flex flex-col flex-grow justify-between">
      <div>
        <div className="h-4 w-1/3 rounded animate-shimmer bg-slate-200"></div>
        <div className="mt-3 h-5 w-3/4 rounded animate-shimmer bg-slate-200"></div>
        <div className="mt-2 h-4 w-1/2 rounded animate-shimmer bg-slate-200"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-200 h-5 w-1/4 rounded animate-shimmer bg-slate-200"></div>
    </div>
  </div>
);

export default EventCardSkeleton;
