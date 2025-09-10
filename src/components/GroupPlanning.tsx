



import React, { useState } from 'react';
import { GroupTrip } from '../../types';
import GroupTripCard from './GroupTripCard';
import GroupTripDetail from './GroupTripDetail';
import { Icon } from './Icon';
import CreateGroupTripModal from './CreateGroupTripModal';

const mockMembers = {
  user1: { id: 'u1', name: 'You', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', role: 'admin' as const },
  user2: { id: 'u2', name: 'Sophia Chen', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', role: 'member' as const },
  user3: { id: 'u3', name: 'Ben Carter', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', role: 'member' as const },
  user4: { id: 'u4', name: 'Aisha Khan', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', role: 'member' as const },
};

const mockTrips: GroupTrip[] = [
  {
    id: 'trip1',
    name: 'Summer in the Alps',
    destination: 'Interlaken, Switzerland',
    coverImageUrl: 'https://images.unsplash.com/photo-1537237890034-72d80d2da027?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-08-10T00:00:00.000Z',
    endDate: '2024-08-17T00:00:00.000Z',
    members: [mockMembers.user1, mockMembers.user2, mockMembers.user3],
    itinerary: [
      {
        date: '2024-08-11',
        items: [
          { id: 'i1', time: 'Morning', activity: 'Hike to Harder Kulm', location: 'Harder Kulm Viewpoint' },
          { id: 'i2', time: 'Afternoon', activity: 'Paragliding over the lakes', location: 'Interlaken' },
          { id: 'i3', time: 'Evening', activity: 'Dinner at Restaurant Laterne', location: 'Höheweg 73' },
        ],
      },
    ],
    tasks: [
      { id: 't1', task: 'Book flight tickets', isCompleted: true, assignedTo: [mockMembers.user1] },
      { id: 't2', task: 'Reserve Airbnb', isCompleted: true, assignedTo: [mockMembers.user2] },
      { id: 't3', task: 'Book train from Zurich to Interlaken', isCompleted: false, assignedTo: [mockMembers.user3] },
      { id: 't4', task: 'Pack hiking gear', isCompleted: false },
    ],
    polls: [
      {
        id: 'p1',
        question: 'Which day trip should we take?',
        isClosed: false,
        options: [
          { id: 'o1', text: 'Jungfraujoch - Top of Europe', votes: ['u1', 'u3'] },
          { id: 'o2', text: 'Grindelwald-First Adventure', votes: ['u2'] },
          { id: 'o3', text: 'Schilthorn - Piz Gloria (007)', votes: [] },
        ],
      },
      {
        id: 'p2',
        question: 'Dinner cuisine on the last night?',
        isClosed: true,
        options: [
            { id: 'p2o1', text: 'Italian', votes: ['u2'] },
            { id: 'p2o2', text: 'Swiss Fondue', votes: ['u1', 'u3'] },
            { id: 'p2o3', text: 'Thai', votes: [] },
        ]
      }
    ],
    expenses: [
      { id: 'e1', description: 'Dinner at Restaurant Laterne', amount: 136.50, paidBy: 'u2', sharedWith: ['u1', 'u2', 'u3'] },
      { id: 'e2', description: 'Paragliding Tickets', amount: 350, paidBy: 'u1', sharedWith: ['u1', 'u2'] },
      { id: 'e3', description: 'Groceries for Airbnb', amount: 78, paidBy: 'u3', sharedWith: ['u1', 'u2', 'u3'] },
    ],
  },
  // Add another mock trip if needed
];

const GroupPlanning: React.FC = () => {
  const [trips, setTrips] = useState<GroupTrip[]>(mockTrips);
  const [selectedTrip, setSelectedTrip] = useState<GroupTrip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTrip = (newTrip: GroupTrip) => {
    setTrips([newTrip, ...trips]);
  };

  if (selectedTrip) {
    return <GroupTripDetail trip={selectedTrip} onBack={() => setSelectedTrip(null)} />;
  }

  return (
    <>
      {isModalOpen && <CreateGroupTripModal onClose={() => setIsModalOpen(false)} onCreateTrip={handleCreateTrip} />}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Group Trip Planner</h2>
            <p className="mt-2 text-sm text-slate-600">
              Organize your travels with friends. Share plans, assign tasks, and vote on activities.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 flex-shrink-0 w-full sm:w-auto">
              <Icon name="plus" className="h-5 w-5 mr-2 -ml-1" />
              Start a New Trip
          </button>
        </div>
        <div className="space-y-6">
          {trips.map(trip => (
            <GroupTripCard key={trip.id} trip={trip} onClick={() => setSelectedTrip(trip)} />
          ))}
        </div>
      </div>
    </>
  );
};

export default GroupPlanning;