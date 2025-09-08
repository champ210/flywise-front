
import React from 'react';
import { MeetupEvent } from '../types';
import { Icon } from './Icon';

interface EventCardProps {
  event: MeetupEvent;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200 cursor-pointer group flex flex-col"
    >
      <div className="h-40 overflow-hidden relative">
        <img 
          src={event.coverImageUrl} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md text-center shadow">
          <p className="text-xs font-bold text-blue-600">{month}</p>
          <p className="text-xl font-bold text-slate-800">{day}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{event.category}</span>
            <h3 className="mt-2 text-base font-bold text-blue-600 transition-colors line-clamp-2">{event.title}</h3>
            <div className="flex items-center text-xs text-slate-500 mt-2">
                <Icon name="map" className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{event.location.name}</span>
            </div>
        </div>
        <div className="flex items-center text-sm text-slate-600 mt-4 pt-3 border-t border-slate-200">
            <Icon name="users" className="h-4 w-4 mr-2" />
            <span>{event.attendees.filter(a => a.rsvp === 'going').length} going</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
