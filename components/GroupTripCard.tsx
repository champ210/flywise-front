import React from 'react';
import { GroupTrip } from '@/types';
import { Icon } from '@/components/Icon';

interface GroupTripCardProps {
  trip: GroupTrip;
  onClick: () => void;
}

const GroupTripCard: React.FC<GroupTripCardProps> = ({ trip, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View dashboard for trip: ${trip.name}`}
      className="w-full text-left bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-200 cursor-pointer group flex flex-col sm:flex-row"
    >
      <div className="sm:w-1/3 h-48 sm:h-auto overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
        <img
          src={trip.coverImageUrl}
          alt={trip.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
            {/* FIX: Incomplete h tag. Changed to h3. */}
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{trip.name}</h3>
            <p className="text-sm font-semibold text-slate-600">{trip.destination}</p>
            <p className="text-xs text-slate-500 mt-1">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                    {trip.members.slice(0, 4).map(member => (
                        <img key={member.id} src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    ))}
                    {trip.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 border-2 border-white">
                            +{trip.members.length - 4}
                        </div>
                    )}
                </div>
                <div className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    View Dashboard
                </div>
            </div>
        </div>
      </div>
    </button>
  );
};

export default React.memo(GroupTripCard);
