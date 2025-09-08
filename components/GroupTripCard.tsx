
import React from 'react';
import { GroupTrip } from '../types';
import { Icon } from './Icon';

interface GroupTripCardProps {
  trip: GroupTrip;
  onClick: () => void;
}

const GroupTripCard: React.FC<GroupTripCardProps> = ({ trip, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-200 cursor-pointer group flex flex-col sm:flex-row"
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
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{trip.name}</h3>
            <div className="flex items-center text-sm text-slate-500 mt-1">
                <Icon name="map" className="h-4 w-4 mr-2" />
                <span>{trip.destination}</span>
            </div>
            <div className="flex items-center text-sm text-slate-500 mt-1">
                <Icon name="calendar" className="h-4 w-4 mr-2" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
            <div className="flex items-center -space-x-3">
                {trip.members.map(member => (
                    <img
                        key={member.id}
                        src={member.avatarUrl}
                        alt={member.name}
                        title={member.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white"
                    />
                ))}
            </div>
            <span className="text-sm font-medium text-blue-600">View Dashboard &rarr;</span>
        </div>
      </div>
    </div>
  );
};

export default GroupTripCard;