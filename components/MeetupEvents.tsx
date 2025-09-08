
import React, { useState } from 'react';
import { MeetupEvent } from '../types';
import EventCard from './EventCard';
import EventDetail from './EventDetail';
import { Icon } from './Icon';
import CreateEventModal from './CreateEventModal';

const mockMembers = {
  user1: { id: 'u1', name: 'Liam Gallagher', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop', role: 'admin' as const },
  user2: { id: 'u2', name: 'Sophia Chen', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', role: 'member' as const },
  user3: { id: 'u3', name: 'Ben Carter', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', role: 'member' as const },
  user4: { id: 'u4', name: 'Aisha Khan', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', role: 'member' as const },
};

const initialEvents: MeetupEvent[] = [
  {
    id: 'e1',
    title: 'Kyoto Photography Walk',
    description: 'Join us for a scenic walk through the historic Gion district, capturing the beauty of traditional Japanese architecture and maybe even a geisha! All skill levels are welcome. We will end at a local tea house to share our best shots.',
    date: '2024-08-15T10:00:00.000Z',
    location: { name: 'Gion Corner, Kyoto', lat: 35.0000, lng: 135.7786 },
    organizer: mockMembers.user1,
    attendees: [
      {...mockMembers.user2, rsvp: 'going' },
      {...mockMembers.user3, rsvp: 'maybe' },
      {...mockMembers.user4, rsvp: 'going' },
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1526481280643-33c94628b6fa?q=80&w=800&auto=format&fit=crop',
    category: 'Photography',
  },
  {
    id: 'e2',
    title: 'Roman Street Food Tour',
    description: 'Taste your way through Rome! We\'ll explore the vibrant Trastevere neighborhood, sampling local delicacies like supplì, pizza al taglio, and artisanal gelato. Come hungry and ready to explore!',
    date: '2024-09-05T18:30:00.000Z',
    location: { name: 'Piazza Trilussa, Rome', lat: 41.8902, lng: 12.4699 },
    organizer: mockMembers.user3,
    attendees: [
      {...mockMembers.user1, rsvp: 'going' },
      {...mockMembers.user2, rsvp: 'going' },
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1551786134-f23555230c7c?q=80&w=800&auto=format&fit=crop',
    category: 'Food Tour',
  },
   {
    id: 'e3',
    title: 'Central Park Sketching Session',
    description: 'Let\'s meet up for a relaxing afternoon of sketching in Central Park. We\'ll gather near the Bethesda Terrace to capture its beautiful architecture and the surrounding nature. No experience necessary, just bring your sketchbook and enjoy the creative vibe.',
    date: '2024-08-20T14:00:00.000Z',
    location: { name: 'Bethesda Terrace, Central Park, NYC', lat: 40.7794, lng: -73.9691 },
    organizer: mockMembers.user4,
    attendees: [
      {...mockMembers.user2, rsvp: 'going' },
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1569238388313-2a441113670a?q=80&w=800&auto=format&fit=crop',
    category: 'Art',
  },
];

const MeetupEvents: React.FC = () => {
  const [events, setEvents] = useState<MeetupEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<MeetupEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateEvent = (newEvent: MeetupEvent) => {
    setEvents([newEvent, ...events]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MeetupEvents;
