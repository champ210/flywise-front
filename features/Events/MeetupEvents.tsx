import React, { useState, useEffect } from 'react';
import { MeetupEvent } from '@/types';
import EventCard from '@/components/EventCard';
import EventDetail from '@/components/EventDetail';
import { Icon } from '@/components/common/Icon';
import CreateEventModal from '@/components/CreateEventModal';
import * as xanoService from '@/services/xanoService';
import EventCardSkeleton from '@/components/skeletons/EventCardSkeleton';

const MeetupEvents: React.FC = () => {
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MeetupEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedEvents = await xanoService.getEvents();
            setEvents(fetchedEvents);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load events.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchEvents();
  }, []);

  const handleCreateEvent = async (newEventData: Omit<MeetupEvent, 'id' | 'organizer' | 'attendees'>) => {
    try {
        const newEvent = await xanoService.createEvent(newEventData);
        setEvents([newEvent, ...events]);
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create event.");
    }
  };

  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  return (
    <>
      {isModalOpen && <CreateEventModal onClose={() => setIsModalOpen(false)} onCreateEvent={handleCreateEvent} />}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Meetup Events</h2>
            <p className="mt-2 text-sm text-slate-600">
              Discover local gatherings, tours, and workshops organized by fellow travelers.
            </p>
          </div>
           <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 flex-shrink-0 w-full sm:w-auto">
              <Icon name="plus" className="h-5 w-5 mr-2 -ml-1" />
              Create Event
          </button>
        </div>
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
        ) : error ? (
            <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
              ))}
            </div>
        )}
      </div>
    </>
  );
};

export default MeetupEvents;