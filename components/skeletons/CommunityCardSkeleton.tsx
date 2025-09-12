import React from 'react';

const CommunityCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <div className="h-40 animate-shimmer bg-slate-200"></div>
    <div className="p-4">
      <div className="h-5 w-3/4 rounded animate-shimmer bg-slate-200"></div>
      <div className="mt-3 h-4 w-1/3 rounded animate-shimmer bg-slate-200"></div>
      <div className="mt-3 h-8 w-full rounded animate-shimmer bg-slate-200"></div>
    </div>
  </div>
);

export default CommunityCardSkeleton;
