import React from 'react';

const HostCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
    <div className="h-48 animate-shimmer bg-slate-200 rounded-t-lg"></div>
    <div className="p-4 flex-grow flex flex-col justify-between">
      <div>
        <div className="h-6 w-3/4 rounded animate-shimmer bg-slate-200"></div>
        <div className="mt-2 h-4 w-1/2 rounded animate-shimmer bg-slate-200"></div>
        <div className="mt-3 h-8 w-full rounded animate-shimmer bg-slate-200"></div>
      </div>
      <div className="mt-4 h-8 rounded animate-shimmer bg-slate-200"></div>
    </div>
  </div>
);

export default HostCardSkeleton;
