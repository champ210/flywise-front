import React from 'react';

const TrendCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
    <div className="h-48 animate-shimmer bg-slate-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-6 w-3/4 rounded animate-shimmer bg-slate-200"></div>
      <div className="mt-4 space-y-3">
        <div className="h-2 w-full rounded animate-shimmer bg-slate-200"></div>
        <div className="h-2 w-full rounded animate-shimmer bg-slate-200"></div>
      </div>
      <div className="mt-4 h-12 rounded animate-shimmer bg-slate-200"></div>
      <div className="mt-4 h-16 rounded animate-shimmer bg-slate-200"></div>
      <div className="mt-4 h-10 rounded animate-shimmer bg-slate-200"></div>
    </div>
  </div>
);

export default TrendCardSkeleton;
