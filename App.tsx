import React, { useEffect } from 'react';

import Header from '@/components/layout/Header';
import AppRouter from '@/features/TravelBuddy/AppRouter';
import AppModals from '@/components/AppModals';
import NavigationBar from '@/navigation/NavigationBar';

import { useAuthStore } from '@/stores/useAuthStore';
import { useTripStore } from '@/stores/useTripStore';
import { useWandergramStore } from '@/stores/useWandergramStore';

export default function App() {

  // On initial app load, fetch all necessary user data and populate the stores.
  useEffect(() => {
    const initializeAppData = async () => {
      // Simulate fetching data for an already logged-in user
      const { fetchProfile, setLoggedIn } = useAuthStore.getState();
      const { fetchTrips } = useTripStore.getState();
      const { fetchPosts, fetchStories, fetchConversations } = useWandergramStore.getState();

      if (useAuthStore.getState().isLoggedIn) {
        await Promise.all([
          fetchProfile(),
          fetchTrips(),
          fetchPosts(),
          fetchStories(),
          fetchConversations(),
        ]);
      }
    };

    initializeAppData();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white/80 border border-slate-200/80 rounded-2xl shadow-2xl flex flex-col h-full max-h-[95vh]">
      <Header />
      <NavigationBar />
      
      <main className="flex-1 bg-slate-50 overflow-y-auto custom-scrollbar">
        <AppRouter />
      </main>
      
      <AppModals />
    </div>
  );
}
