import { create } from 'zustand';
import { SavedTrip, DocumentScanResult } from '@/types';
import * as dbService from '@/services/dbService';

interface TripState {
  savedTrips: SavedTrip[];
  activeTrip: SavedTrip | undefined;

  fetchTrips: () => Promise<void>;
  saveTrip: (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  addDocumentToTrip: (tripId: string, document: DocumentScanResult) => Promise<void>;
  updateActiveTrip: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  savedTrips: [],
  activeTrip: undefined,

  fetchTrips: async () => {
    const trips = await dbService.getAllTrips();
    set({ savedTrips: trips });
    get().updateActiveTrip();
  },

  saveTrip: async (tripData) => {
    const newTrip: SavedTrip = {
      ...tripData,
      id: `trip_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await dbService.saveTrip(newTrip);
    await get().fetchTrips();
  },

  deleteTrip: async (tripId) => {
    await dbService.deleteTrip(tripId);
    await get().fetchTrips();
  },
  
  addDocumentToTrip: async (tripId, document) => {
    const trips = get().savedTrips;
    const tripToUpdate = trips.find(t => t.id === tripId);
    if (tripToUpdate) {
      const updatedTrip = {
        ...tripToUpdate,
        documents: [...(tripToUpdate.documents || []), document],
      };
      await dbService.saveTrip(updatedTrip);
      await get().fetchTrips();
    }
  },

  updateActiveTrip: () => {
    const { savedTrips } = get();
    const now = new Date();
    const currentActiveTrip = savedTrips.find(trip => {
      if (trip.type !== 'itinerary' || !trip.startDate || !trip.endDate) return false;
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      return now >= start && now <= end;
    });
    set({ activeTrip: currentActiveTrip });
  },
}));

// Periodically check for active trip status
setInterval(() => {
    useTripStore.getState().updateActiveTrip();
}, 60000); // Check every minute
