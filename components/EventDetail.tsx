

import React, { useState } from 'react';
import { MeetupEvent, RsvpStatus, MapMarker } from '@/types';
import { Icon } from '@/components/common/Icon';
import MapView from '@/components/MapView';

interface EventDetailProps {
  event: MeetupEvent;
  onBack: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack }) => {
  const [rsvp, setRsvp] = useState<RsvpStatus | null>(null);
  const eventDate = new Date(event.date);

  const eventMarker: MapMarker[] = [
    {
      name: event.location.name,
      lat: event.location.lat,
      lng: event.location.lng,
      activity: event.title,
      day: 1, // Dummy data to satisfy the type
      timeOfDay: 'Morning' // Dummy data to satisfy the type
    }
  ];

  const RsvpButton: React.FC<{ status: RsvpStatus, text: string }> = ({ status, text }) => (
    <button
      onClick={() => setRsvp(status)}
      className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors border-2 ${
        rsvp === status 
          ? 'bg-blue-600 text-white border-blue-600' 
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <button 
        onClick={onBack}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <Icon name="chevron-left" className="h-5 w-5 mr-1" />
        Back to Events
      </button>

      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
        <div className="h-56 relative">
          <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white p-2">
            <p className="font-semibold">{eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div>
                <h3 className="font-semibold text-slate-800">About this Event</h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{event.description}</p>
            </div>
            <div>
                <h3 className="font-semibold text-slate-800">Location</h3>
                <div className="mt-2 text-sm text-slate-600 flex items-center">
                    <Icon name="map" className="h-4 w-4 mr-2 text-slate-500" />
                    <span>{event.location.name}</span>
                </div>
                <div className="mt-2 h-64 w-full rounded-md border border-slate-300 overflow-hidden">
                    <MapView markers={eventMarker} />
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-slate-800">Event Chat</h3>
                <div className="mt-2 p-3 bg-slate-100 rounded-md border border-slate-200">
                    <p className="text-sm text-slate-500">Event chat is available for attendees. RSVP to join the conversation!</p>
                </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-slate-800 mb-3">Are you going?</h3>
              <div className="flex gap-2">
                <RsvpButton status="going" text="Going" />
                <RsvpButton status="maybe" text="Maybe" />
                <RsvpButton status="not_going" text="Can't go" />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-slate-800 mb-3">Organizer</h3>
              <div className="flex items-center gap-3">
                <img src={event.organizer.avatarUrl} alt={event.organizer.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{event.organizer.name}</p>
                  <p className="text-xs text-slate-500">Organizer</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-slate-800 mb-3">
                  Attendees ({event.attendees.filter(a => a.rsvp === 'going').length} going)
                </h3>
                <div className="flex flex-wrap -space-x-2">
                    {event.attendees.slice(0, 7).map(attendee => (
                       <img 
                         key={attendee.id}
                         src={attendee.avatarUrl}
                         alt={attendee.name}
                         title={`${attendee.name} (${attendee.rsvp})`}
                         className={`w-9 h-9 rounded-full object-cover border-2 border-white ${attendee.rsvp !== 'going' ? 'opacity-50' : ''}`}
                       />
                    ))}
                    {event.attendees.length > 7 && (
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 border-2 border-white">
                            +{event.attendees.length - 7}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;