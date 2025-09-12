import React, { useState, useEffect } from 'react';
import { GroupTrip } from '../types';
import GroupTripCard from './GroupTripCard';
import GroupTripDetail from './GroupTripDetail';
import { Icon } from './Icon';
import CreateGroupTripModal from './CreateGroupTripModal';
import * as xanoService from '../services/xanoService';
import GroupTripCardSkeleton from './skeletons/GroupTripCardSkeleton';

const GroupPlanning: React.FC = () => {
  const [trips, setTrips] = useState<GroupTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<GroupTrip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchTrips = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedTrips = await xanoService.getGroupTrips();
            setTrips(fetchedTrips);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load group trips.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchTrips();
  }, []);

  const handleCreateTrip = async (newTripData: Omit<GroupTrip, 'id' | 'members' | 'itinerary' | 'tasks' | 'polls' | 'expenses'>) => {
    try {
        const newTrip = await xanoService.createGroupTrip(newTripData);
        setTrips([newTrip, ...trips]);
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create trip.");
    }
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
        {isLoading ? (
            <div className="space-y-6">
                <GroupTripCardSkeleton />
                <GroupTripCardSkeleton />
            </div>
        ) : error ? (
            <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        ) : (
            <div className="space-y-6">
                {trips.map(trip => (
                    <GroupTripCard key={trip.id} trip={trip} onClick={() => setSelectedTrip(trip)} />
                ))}
            </div>
        )}
      </div>
    </>
  );
};

export default GroupPlanning;
