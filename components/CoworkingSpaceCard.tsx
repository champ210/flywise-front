
import React from 'react';
import { CoworkingSpace } from '@/types';
import { Icon } from '@/components/common/Icon';

interface CoworkingSpaceCardProps {
  space: CoworkingSpace;
  onBook: () => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Icon key={i} name="star" className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'}`} />
        ))}
    </div>
);

const CoworkingSpaceCard: React.FC<CoworkingSpaceCardProps> = ({ space, onBook }) => {
  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering any parent onClick handlers if they exist
    alert(`Connecting you with the organizer of "${space.networkingOpportunity}"...\n(This is a simulation)`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 group flex flex-col">
      <div className="h-48 overflow-hidden relative rounded-t-lg">
        <img
          src={space.imageUrl}
          alt={space.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm font-bold backdrop-blur-sm">
          ${space.price.perDay}<span className="font-normal">/day</span>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600">{space.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{space.location}</p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={space.rating} />
              <span className="text-xs font-semibold text-slate-600">{space.rating.toFixed(1)} ({space.reviews.length} reviews)</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200">
             <p className="text-sm font-semibold text-indigo-800 flex items-center">
                 <Icon name="sparkles" className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0" />
                 AI Insight
             </p>
             <p className="text-xs text-slate-700 mt-1 italic">{space.aiInsight}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-md border border-green-200">
             <p className="text-sm font-semibold text-green-800 flex items-center">
                 <Icon name="users" className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                 Networking Opportunity
             </p>
             <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-700 flex-1">{space.networkingOpportunity}</p>
                <button 
                    onClick={handleConnectClick}
                    className="flex-shrink-0 text-xs font-semibold text-green-700 bg-white border border-green-300 rounded-md py-1 px-3 hover:bg-green-100 transition-colors"
                >
                    Connect
                </button>
             </div>
          </div>
        </div>
        <button onClick={onBook} className="mt-4 w-full bg-blue-600 text-white font-bold py-2.5 rounded-md hover:bg-blue-700 transition-colors">
            View Details & Book
        </button>
      </div>
    </div>
  );
};

export default CoworkingSpaceCard;
