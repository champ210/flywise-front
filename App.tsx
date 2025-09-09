


import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ChatInterface from './components/ChatInterface';
import ItineraryPlanner from './components/ItineraryPlanner';
import MyTrips from './components/MyTrips';
import ResultsList from './components/ResultsList';
import { Icon } from './components/Icon';
import { SearchResult, SavedTrip, UserProfile as UserProfileType, Flight, Stay, Car, BookingConfirmation, StayBookingConfirmation, CarBookingConfirmation, GamificationProfile, TravelStory as TravelStoryType, Restaurant, RideOption, FoodOrderConfirmation, RideBookingConfirmation, TripMemory, LocalProfile, HangoutSuggestion, CoworkingSpace, CoworkingBookingConfirmation, Community, ItineraryPlan, SocialReel } from './types';
import SubscriptionModal from './components/SubscriptionModal';
import CurrencyConverter from './components/CurrencyConverter';
import OnboardingModal from './components/OnboardingModal';
import UserProfile from './components/UserProfile';
import TravelBuddy from './components/TravelBuddy';
import MemoriesHub from './components/MemoriesHub';
import TravelCommunities from './components/TravelCommunities';
import MeetupEvents from './components/MeetupEvents';
import FlightBooking from './components/FlightBooking';
import StayBooking from './components/StayBooking';
import CarBooking from './components/CarBooking';
import GroupPlanning from './components/GroupPlanning';
import PackingChecklist from './components/PackingChecklist';
import SocialPassport from './components/SocialPassport';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import Wallet from './components/Wallet';
import CreateStoryModal from './components/CreateStoryModal';
import SocialFeed from './components/SocialFeed';
import HomeShare from './components/HomeShare';
import SuperServicesHub from './components/SuperServicesHub';
import FoodOrderModal from './components/FoodOrderModal';
import RideBookingModal from './components/RideBookingModal';
import HangoutRequestModal from './components/HangoutRequestModal';
import CoworkingHub from './components/CoworkingHub';
import CoworkingBooking from './components/CoworkingBooking';
import HomeDashboard from './components/HomeDashboard';
import * as dbService from './services/dbService';
import * as xanoService from './services/xanoService';
import FlightTracker from './components/FlightTracker';
import SocialReelGeneratorModal from './components/SocialReelGeneratorModal';
import { ALL_BADGES } from './data/gamification';

export enum Tab {
  Home = 'Home',
  FlightTracker = 'Flight Tracker',
  Search = 'Search',
  Chat = 'Chat',
  Planner = 'Planner',
  Checklist = 'Checklist',
  MyTrips = 'My Trips',
  Wallet = 'Wallet',
  Converter = 'Converter',
  Profile = 'My Profile',
  TravelBuddy = 'Travel Buddy',
  Stories = 'Trip Journals',
  Communities = 'Communities',
  Events = 'Meetup Events',
  GroupPlanning = 'Group Planning',
  Passport = 'Passport',
  Inspire = 'Inspire',
  LocalConnections = 'Local Connections',
  SuperServices = 'Super Services',
  Coworking = 'Coworking',
}

const DEFAULT_USER_PROFILE: UserProfileType = {
  preferredAirlines: '',
  minHotelStars: 0,
  preferredCarTypes: [],
  favoriteDestinations: [],
  budget: {
    flightMaxPrice: '',
    hotelMaxPrice: '',
    carMaxPrice: '',
  },
};

const DEFAULT_GAMIFICATION_PROFILE: GamificationProfile = {
  flyWisePoints: 1250,
  earnedBadgeIds: ['first-booking', 'story-writer'],
  collectedStamps: [
    { country: 'Japan', city: 'Kyoto', date: '2024-05-10', crestUrl: 'https://cdn.jsdelivr.net/gh/gist/corrinachow/997463283362a22591e55e0d4942c751/raw/japan-stamp.svg' },
    { country: 'Peru', city: 'Machu Picchu', date: '2024-04-22', crestUrl: 'https://cdn.jsdelivr.net/gh/gist/corrinachow/997463283362a22591e55e0d4942c751/raw/peru-stamp.svg' },
    { country: 'Greece', city: 'Santorini', date: '2024-06-01', crestUrl: 'https://cdn.jsdelivr.net/gh/gist/corrinachow/997463283362a22591e55e0d4942c751/raw/greece-stamp.svg' },
  ],
};

const initialStories: TravelStoryType[] = [
  {
    id: '1',
    authorName: 'Elena Petrova',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    title: 'A Week of Wonders in Kyoto',
    content: 'Kyoto was a dream. From the serene bamboo groves of Arashiyama to the vibrant Fushimi Inari Shrine, every day was a new discovery. The food, the culture, the people... absolutely unforgettable.',
    images: [
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop',
    ],
    locationTags: ['Kyoto', 'Japan', 'Culture'],
    likes: 125,
    createdAt: '2024-05-10T14:48:00.000Z',
    aiSummary: "An unforgettable week-long cultural immersion in Kyoto, Japan 🏯🍣",
    estimatedCost: 1500,
    tags: ['cultural-immersion', 'solo-travel', 'foodie'],
    comments: [
      {
        id: 'c1',
        authorName: 'Marcus Holloway',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        content: 'Looks incredible! Kyoto is on my bucket list.',
        createdAt: '2024-05-10T15:00:00.000Z',
      },
      {
        id: 'c2',
        authorName: 'Aisha Khan',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        content: 'Your photos are stunning! Especially the one from Arashiyama.',
        createdAt: '2024-05-11T09:30:00.000Z',
      }
    ]
  },
  {
    id: '2',
    authorName: 'Marcus Holloway',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    title: 'Hiking the Inca Trail to Machu Picchu',
    content: "The 4-day trek was challenging but immensely rewarding. Waking up to the sunrise over Machu Picchu is a moment I'll cherish forever. The views are just as incredible as everyone says.",
    images: [
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530912585210-791648937612?q=80&w=800&auto=format&fit=crop',
    ],
    locationTags: ['Peru', 'Machu Picchu', 'Adventure'],
    likes: 342,
    createdAt: '2024-04-22T09:15:00.000Z',
    comments: [
        {
            id: 'c3',
            authorName: 'Elena Petrova',
            authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            content: 'Wow, what an achievement! That sunrise view is breathtaking.',
            createdAt: '2024-04-22T12:00:00.000Z',
        }
    ]
  },
  {
    id: '3',
    authorName: 'Aisha Khan',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    title: 'Santorini Sunsets and Seaside Charm',
    content: 'The iconic blue domes and white-washed villages of Santorini are even more stunning in person. Finding hidden spots to watch the sunset over the caldera was the highlight of our trip.',
    images: [
      'https://images.unsplash.com/photo-1533105079780-52b9be4ac215?q=80&w=800&auto=format&fit=crop',
    ],
    locationTags: ['Santorini', 'Greece', 'Relaxation'],
    likes: 218,
    createdAt: '2024-06-01T18:30:00.000Z',
    comments: [
       {
            id: 'c4',
            authorName: 'Marcus Holloway',
            authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            content: 'Santorini is magical. Did you visit Oia?',
            createdAt: '2024-06-02T10:00:00.000Z',
        }
    ]
  },
];

const PRIMARY_TABS = [
    { name: Tab.Home, icon: 'home' },
    { name: Tab.FlightTracker, icon: 'send' },
    { name: Tab.Inspire, icon: 'lightbulb' },
    { name: Tab.Chat, icon: 'chat' },
    { name: Tab.Planner, icon: 'planner' },
    { name: Tab.SuperServices, icon: 'apps' },
    { name: Tab.Coworking, icon: 'briefcase' },
    { name: Tab.LocalConnections, icon: 'users' },
    { name: Tab.Communities, icon: 'globe' },
];

const MORE_TABS = [
    { name: Tab.MyTrips, icon: 'bookmark' },
    { name: Tab.Checklist, icon: 'checklist' },
    { name: Tab.GroupPlanning, icon: 'clipboard-list' },
    { name: Tab.Stories, icon: 'stories' },
    { name: Tab.TravelBuddy, icon: 'users' },
    { name: Tab.Events, icon: 'calendar' },
    { name: Tab.Wallet, icon: 'wallet' },
    { name: Tab.Converter, icon: 'exchange' },
    { name: Tab.Passport, icon: 'passport' },
    { name: Tab.Search, icon: 'search' },
    { name: Tab.Profile, icon: 'user' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [flightToBook, setFlightToBook] = useState<Flight | null>(null);
  const [stayToBook, setStayToBook] = useState<Stay | null>(null);
  const [carToBook, setCarToBook] = useState<Car | null>(null);
  const [spaceToBook, setSpaceToBook] = useState<CoworkingSpace | null>(null);
  const [gamificationProfile, setGamificationProfile] = useState<GamificationProfile>(DEFAULT_GAMIFICATION_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [stories, setStories] = useState<TravelStoryType[]>(initialStories);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [foodToOrder, setFoodToOrder] = useState<Restaurant | null>(null);
  const [rideToBook, setRideToBook] = useState<{ride: RideOption, destination: string} | null>(null);
  const [generatedMemories, setGeneratedMemories] = useState<TripMemory[]>([]);
  const [hangoutRequest, setHangoutRequest] = useState<{local: LocalProfile, suggestion: HangoutSuggestion} | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isReelGeneratorOpen, setIsReelGeneratorOpen] = useState(false);
  const [tripForReel, setTripForReel] = useState<(SavedTrip & { data: ItineraryPlan }) | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileType>(DEFAULT_USER_PROFILE);
  
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedFlyWiseAI');
    if (!hasVisited) {
      setIsOnboardingOpen(true);
    }
    
    const initializeApp = async () => {
      if (xanoService.getToken()) {
        setIsLoggedIn(true);
        try {
          const [profile, trips] = await Promise.all([
            xanoService.getProfile(),
            xanoService.getTrips()
          ]);
          const fullProfile = { ...DEFAULT_USER_PROFILE, ...profile };
          setUserProfile(fullProfile);
          setSavedTrips(trips);
          // Cache data for offline access
          localStorage.setItem('flyWiseUserProfile', JSON.stringify(fullProfile));
          const localTrips = await dbService.getAllTrips();
          await Promise.all(localTrips.map(t => dbService.deleteTrip(t.id)));
          await Promise.all(trips.map(t => dbService.saveTrip(t)));
        } catch (error) {
          console.error("Failed to fetch data from server, loading from cache:", error);
          setError("Could not connect to server. Displaying cached data.");
          const trips = await dbService.getAllTrips();
          setSavedTrips(trips);
          const cachedProfile = localStorage.getItem('flyWiseUserProfile');
          if (cachedProfile) {
            setUserProfile(JSON.parse(cachedProfile));
          }
        }
      } else {
        // Not logged in, load from local DB if any trips exist
         const trips = await dbService.getAllTrips();
         setSavedTrips(trips);
      }
    };
    initializeApp();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCloseOnboarding = useCallback(() => {
    localStorage.setItem('hasVisitedFlyWiseAI', 'true');
    setIsOnboardingOpen(false);
  }, []);

  const handleSearchResults = useCallback((data: SearchResult[]) => {
    setResults(data);
    setError(null);
  }, []);

  const handleLoading = useCallback((loadingState: boolean) => {
    setIsLoading(loadingState);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setResults([]);
  }, []);

  const handleSaveTrip = useCallback(async (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => {
    if (!isLoggedIn || isOffline) {
        setError("You must be online and logged in to save trips.");
        // Fallback to local save for offline/logged out users
        console.log("Saving trip locally as fallback.");
        const newTrip: SavedTrip = { ...tripData, id: `${Date.now()}`, createdAt: new Date().toISOString() };
        await dbService.saveTrip(newTrip);
        setSavedTrips(prev => [newTrip, ...prev]);
        setActiveTab(Tab.MyTrips);
        return;
    }
    try {
        const newTrip = await xanoService.addTrip(tripData);
        setSavedTrips(prev => [newTrip, ...prev]);
        await dbService.saveTrip(newTrip); // Cache it
        setActiveTab(Tab.MyTrips);
    } catch (e) {
        console.error("Failed to save trip to server", e);
        setError("Could not save your trip. The server might be unavailable.");
    }
}, [isLoggedIn, isOffline]);


  const handleDeleteTrip = useCallback(async (tripId: string) => {
    if (!isLoggedIn || isOffline) {
        setError("You must be online and logged in to delete trips.");
        // Fallback to local delete
        await dbService.deleteTrip(tripId);
        setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
        return;
    }
    try {
        await xanoService.deleteTrip(tripId);
        setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
        await dbService.deleteTrip(tripId); // remove from cache
    } catch (e) {
        console.error("Failed to delete trip from server", e);
        setError("Could not delete your trip. The server might be unavailable.");
    }
  }, [isLoggedIn, isOffline]);
  
  const handleSaveProfile = useCallback((profile: UserProfileType) => {
    if (isOffline) {
        alert("Cannot save profile while offline. Please reconnect.");
        return;
    }
    xanoService.updateProfile(profile)
      .then(updatedProfile => {
        const fullProfile = { ...DEFAULT_USER_PROFILE, ...updatedProfile };
        setUserProfile(fullProfile);
        localStorage.setItem('flyWiseUserProfile', JSON.stringify(fullProfile));
        alert("Profile saved successfully!");
      })
      .catch(err => {
        console.error("Failed to save profile:", err);
        alert("Could not save your profile. The server might be unavailable.");
      });
  }, [isOffline]);

  const onOpenVipModal = useCallback(() => setIsVipModalOpen(true), []);

  const handleBookFlight = useCallback((flight: Flight) => setFlightToBook(flight), []);
  const handleBookStay = useCallback((stay: Stay) => setStayToBook(stay), []);
  const handleBookCar = useCallback((car: Car) => setCarToBook(car), []);
  const handleBookSpace = useCallback((space: CoworkingSpace) => setSpaceToBook(space), []);

  const handleOrderFood = useCallback((restaurant: Restaurant) => setFoodToOrder(restaurant), []);
  const handleBookRide = useCallback((ride: RideOption, destination: string) => setRideToBook({ ride, destination }), []);

  const handleOrderComplete = useCallback((confirmation: FoodOrderConfirmation | RideBookingConfirmation) => {
      let earnedBadge: { id: string, name: string } | null = null;
      
      if ('orderId' in confirmation) {
          if (!gamificationProfile.earnedBadgeIds.includes('foodie-explorer')) {
              earnedBadge = { id: 'foodie-explorer', name: 'Foodie Explorer' };
          }
      } else if ('bookingId' in confirmation) {
          if (!gamificationProfile.earnedBadgeIds.includes('local-rider')) {
              earnedBadge = { id: 'local-rider', name: 'Local Rider' };
          }
      }

      setGamificationProfile(prev => {
        const newBadgeIds = earnedBadge ? [...prev.earnedBadgeIds, earnedBadge.id] : prev.earnedBadgeIds;
        return {
          ...prev,
          flyWisePoints: prev.flyWisePoints + confirmation.coinsEarned,
          earnedBadgeIds: newBadgeIds,
        };
      });

      let alertMessage = `Order confirmed! You earned ${confirmation.coinsEarned} FlyWise Coins.`;
      if (earnedBadge) {
          alertMessage += `\n\nNew Badge Unlocked: ${earnedBadge.name}!`;
      }
      alert(alertMessage);

      setFoodToOrder(null);
      setRideToBook(null);
  }, [gamificationProfile.earnedBadgeIds]);

  const handleBookingComplete = useCallback((confirmation: BookingConfirmation | StayBookingConfirmation | CarBookingConfirmation) => {
    console.log("Booking complete!", confirmation);
    alert(`Booking confirmed! Your reference is ${confirmation.bookingReference}.`);
    setFlightToBook(null);
    setStayToBook(null);
    setCarToBook(null);
  }, []);

  const handleCoworkingBookingComplete = useCallback((confirmation: CoworkingBookingConfirmation) => {
    let earnedBadge: { id: string; name: string } | null = null;
    if (!gamificationProfile.earnedBadgeIds.includes('digital-nomad')) {
      earnedBadge = { id: 'digital-nomad', name: 'Digital Nomad' };
    }

    setGamificationProfile(prev => {
      const newBadgeIds = earnedBadge ? [...prev.earnedBadgeIds, earnedBadge.id] : prev.earnedBadgeIds;
      return {
        ...prev,
        flyWisePoints: prev.flyWisePoints + confirmation.coinsEarned,
        earnedBadgeIds: newBadgeIds,
      };
    });

    let alertMessage = `Booking confirmed! You earned ${confirmation.coinsEarned} FlyWise Coins.`;
    if (earnedBadge) {
      alertMessage += `\n\nNew Badge Unlocked: ${earnedBadge.name}!`;
    }
    alert(alertMessage);

    setSpaceToBook(null);
  }, [gamificationProfile.earnedBadgeIds]);

  const fetchDataAfterAuth = useCallback(async () => {
    try {
        const [profile, trips] = await Promise.all([
            xanoService.getProfile(),
            xanoService.getTrips()
        ]);
        const fullProfile = { ...DEFAULT_USER_PROFILE, ...profile };
        setUserProfile(fullProfile);
        setSavedTrips(trips);
        localStorage.setItem('flyWiseUserProfile', JSON.stringify(fullProfile));
        trips.forEach(trip => dbService.saveTrip(trip));
    } catch (error) {
        console.error("Failed to fetch user data after login:", error);
        setError("Could not retrieve your profile and trips. Please try again later.");
    }
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    fetchDataAfterAuth();
  }, [fetchDataAfterAuth]);

  const handleSignUpSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setIsSignUpModalOpen(false);
    fetchDataAfterAuth();
  }, [fetchDataAfterAuth]);
  
  const handleLogout = useCallback(() => {
    xanoService.logout();
    setIsLoggedIn(false);
    setSavedTrips([]);
    setUserProfile(DEFAULT_USER_PROFILE);
    localStorage.removeItem('flyWiseUserProfile');
  }, []);

  const openLoginModal = useCallback(() => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  }, []);

  const openSignUpModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  }, []);

  const handleEarnPoints = useCallback((points: number, badgeId?: string) => {
    setGamificationProfile(prev => {
        const newBadgeIds = [...prev.earnedBadgeIds];
        let newBadgeUnlocked = false;
        if (badgeId && !prev.earnedBadgeIds.includes(badgeId)) {
            newBadgeIds.push(badgeId);
            newBadgeUnlocked = true;
        }

        const newProfile = {
            ...prev,
            flyWisePoints: prev.flyWisePoints + points,
            earnedBadgeIds: newBadgeIds,
        };
        
        let alertMessage = `+${points} FlyWise Points!`;

        if (newBadgeUnlocked) {
            const badge = ALL_BADGES.find(b => b.id === badgeId);
            alertMessage = `New Badge Unlocked: ${badge?.name || 'New Badge'}!\n\n${alertMessage}`;
        }
        
        alert(alertMessage);

        return newProfile;
    });
  }, []);

  const handleCreateStory = useCallback((newStory: TravelStoryType) => {
    setStories(prev => [newStory, ...prev]);
    setIsCreateStoryModalOpen(false);
    handleEarnPoints(100, 'storyteller');
  }, [handleEarnPoints]);
  
  const handleMemoryGenerated = useCallback((memory: TripMemory) => {
    if (!generatedMemories.some(m => m.tripId === memory.tripId)) {
        setGeneratedMemories(prev => [...prev, memory]);
        if (!gamificationProfile.earnedBadgeIds.includes('memory-maker')) {
            setGamificationProfile(prev => ({
                ...prev,
                flyWisePoints: prev.flyWisePoints + 200,
                earnedBadgeIds: [...prev.earnedBadgeIds, 'memory-maker']
            }));
            alert("New Badge Unlocked: Memory Maker! (+200 FlyWise Coins)");
        }
    }
  }, [generatedMemories, gamificationProfile.earnedBadgeIds]);

  const handleHangoutComplete = useCallback(() => {
    setHangoutRequest(null); // Close the modal
    let earnedBadge: { id: string, name: string } | null = null;
    const coinsEarned = 150;

    if (!gamificationProfile.earnedBadgeIds.includes('explorer-buddy')) {
        earnedBadge = { id: 'explorer-buddy', name: 'Explorer Buddy' };
    }

    setGamificationProfile(prev => {
        const newBadgeIds = earnedBadge ? [...prev.earnedBadgeIds, earnedBadge.id] : prev.earnedBadgeIds;
        return {
          ...prev,
          flyWisePoints: prev.flyWisePoints + coinsEarned,
          earnedBadgeIds: newBadgeIds,
        };
    });

    let alertMessage = `Hangout request sent! You earned ${coinsEarned} FlyWise Coins for connecting with a local.`;
    if (earnedBadge) {
        alertMessage += `\n\nNew Badge Unlocked: ${earnedBadge.name}!`;
    }
    alert(alertMessage);

  }, [gamificationProfile.earnedBadgeIds]);

  const handleOpenReelModal = useCallback((trip: SavedTrip & { data: ItineraryPlan }) => {
    setTripForReel(trip);
    setIsReelGeneratorOpen(true);
  }, []);

  const handleReelGenerated = useCallback((reel: SocialReel) => {
    console.log('Generated Reel:', reel); // In a real app, you might save this
    alert(`Reel "${reel.title}" created successfully!`);
    setIsReelGeneratorOpen(false);
  }, []);

  const handleUpdateStory = useCallback((updatedStory: TravelStoryType) => {
    setStories(prevStories => 
      prevStories.map(story => story.id === updatedStory.id ? updatedStory : story)
    );
  }, []);

  const isMoreTabActive = useMemo(() => MORE_TABS.some(tab => tab.name === activeTab), [activeTab]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header 
        onOpenVipModal={onOpenVipModal}
        isLoggedIn={isLoggedIn}
        onLoginClick={openLoginModal}
        onSignUpClick={openSignUpModal}
        onLogoutClick={handleLogout}
        isOffline={isOffline}
      />
      <main className="max-w-7xl mx-auto px-2 py-4 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="border-b border-slate-200 mb-6 print:hidden">
            <nav className="-mb-px flex items-center justify-between" aria-label="Tabs">
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto custom-scrollbar">
                {PRIMARY_TABS.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`${
                      activeTab === tab.name
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    } group inline-flex items-center py-3 px-3 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap rounded-t-md`}
                    aria-current={activeTab === tab.name ? 'page' : undefined}
                  >
                    <Icon name={tab.icon} className="mr-0 sm:mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="relative flex-shrink-0 ml-2" ref={moreMenuRef}>
                <button
                  onClick={() => setIsMoreMenuOpen(prev => !prev)}
                  className={`${
                    isMoreTabActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  } group inline-flex items-center py-3 px-3 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap rounded-t-md`}
                  aria-haspopup="true"
                  aria-expanded={isMoreMenuOpen}
                >
                  <Icon name="dots-horizontal" className="mr-0 sm:mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">More</span>
                  <Icon name="chevron-down" className={`ml-1 h-4 w-4 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-fade-in">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {MORE_TABS.map((tab) => (
                        <a
                          href="#"
                          key={tab.name}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(tab.name);
                            setIsMoreMenuOpen(false);
                          }}
                          className={`${
                            activeTab === tab.name ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                          } group flex items-center px-4 py-2 text-sm hover:bg-slate-100 hover:text-slate-900`}
                          role="menuitem"
                        >
                          <Icon name={tab.icon} className={`mr-3 h-5 w-5 ${activeTab === tab.name ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                          <span>{tab.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          <div key={activeTab} className="animate-fade-in-up">
            {activeTab === Tab.Home && (
              <HomeDashboard 
                userProfile={userProfile} 
                savedTrips={savedTrips} 
                stories={stories} 
                setActiveTab={setActiveTab} 
              />
            )}
            
            {activeTab === Tab.FlightTracker && (
              <FlightTracker />
            )}

            {activeTab === Tab.Inspire && (
              <SocialFeed stories={stories} userProfile={userProfile} onUpdateStory={handleUpdateStory} onEarnPoints={handleEarnPoints} />
            )}

            {activeTab === Tab.Coworking && (
              <CoworkingHub userProfile={userProfile} onBookSpace={handleBookSpace} />
            )}

            {activeTab === Tab.LocalConnections && (
              <HomeShare userProfile={userProfile} onOpenVipModal={onOpenVipModal} onHangoutRequest={setHangoutRequest}/>
            )}

            {activeTab === Tab.Chat && (
              <ChatInterface 
                onSaveTrip={handleSaveTrip} 
                userProfile={userProfile} 
                savedTrips={savedTrips} 
                onBookFlight={handleBookFlight}
                onBookStay={handleBookStay}
                onBookCar={handleBookCar} 
              />
            )}

            {activeTab === Tab.Planner && (
              <ItineraryPlanner onSaveTrip={handleSaveTrip} isOffline={isOffline} />
            )}
            
            {activeTab === Tab.SuperServices && (
              <SuperServicesHub userProfile={userProfile} savedTrips={savedTrips} onOrderFood={handleOrderFood} onBookRide={handleBookRide} />
            )}

            {activeTab === Tab.Checklist && (
              <PackingChecklist />
            )}

            {activeTab === Tab.TravelBuddy && (
              <TravelBuddy userProfile={userProfile} onSaveTrip={handleSaveTrip} savedTrips={savedTrips} isOffline={isOffline} />
            )}

            {activeTab === Tab.Stories && (
              <MemoriesHub
                stories={stories}
                onOpenCreateModal={() => setIsCreateStoryModalOpen(true)}
                savedTrips={savedTrips}
                generatedMemories={generatedMemories}
                onMemoryGenerated={handleMemoryGenerated}
                onOpenReelModal={handleOpenReelModal}
                onUpdateStory={handleUpdateStory}
                onEarnPoints={handleEarnPoints}
              />
            )}

            {activeTab === Tab.Communities && (
              <TravelCommunities />
            )}

            {activeTab === Tab.Events && (
              <MeetupEvents />
            )}

            {activeTab === Tab.GroupPlanning && (
              <GroupPlanning />
            )}

            {activeTab === Tab.Passport && (
              <SocialPassport profile={gamificationProfile} />
            )}
            
            {activeTab === Tab.MyTrips && (
              <MyTrips savedTrips={savedTrips} onDeleteTrip={handleDeleteTrip} isOffline={isOffline} />
            )}

            {activeTab === Tab.Wallet && (
              <Wallet isLoggedIn={isLoggedIn} onLoginClick={openLoginModal} />
            )}

            {activeTab === Tab.Converter && (
              <CurrencyConverter />
            )}

            {activeTab === Tab.Profile && (
              <UserProfile profile={userProfile} onSave={handleSaveProfile} />
            )}

            {activeTab === Tab.Search && (
              <div>
                <SearchBar 
                  onSearch={handleSearchResults}
                  onLoading={handleLoading}
                  onError={handleError}
                  userProfile={userProfile}
                />
                <div className="mt-8">
                  <ResultsList 
                    results={results} 
                    isLoading={isLoading} 
                    error={error} 
                    onBookFlight={handleBookFlight} 
                    onBookStay={handleBookStay}
                    onBookCar={handleBookCar} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm print:hidden">
        <p>Powered by AI. Your ultimate travel planning companion.</p>
      </footer>
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={openSignUpModal} />}
      {isSignUpModalOpen && <SignUpModal onClose={() => setIsSignUpModalOpen(false)} onSignUpSuccess={handleSignUpSuccess} onSwitchToLogin={openLoginModal} />}
      
      {flightToBook && <FlightBooking flight={flightToBook} onClose={() => setFlightToBook(null)} onBookingComplete={handleBookingComplete} />}
      {stayToBook && <StayBooking stay={stayToBook} onClose={() => setStayToBook(null)} onBookingComplete={handleBookingComplete} />}
      {carToBook && <CarBooking car={carToBook} onClose={() => setCarToBook(null)} onBookingComplete={handleBookingComplete} />}
      {spaceToBook && <CoworkingBooking space={spaceToBook} onClose={() => setSpaceToBook(null)} onBookingComplete={handleCoworkingBookingComplete} />}

      {foodToOrder && <FoodOrderModal restaurant={foodToOrder} onClose={() => setFoodToOrder(null)} onOrderComplete={handleOrderComplete} />}
      {rideToBook && <RideBookingModal ride={rideToBook.ride} destination={rideToBook.destination} onClose={() => setRideToBook(null)} onBookingComplete={handleOrderComplete} />}
      
      {hangoutRequest && <HangoutRequestModal local={hangoutRequest.local} suggestion={hangoutRequest.suggestion} onClose={() => setHangoutRequest(null)} onHangoutComplete={handleHangoutComplete} />}

      {isVipModalOpen && <SubscriptionModal onClose={() => setIsVipModalOpen(false)} />}
      {isOnboardingOpen && <OnboardingModal onClose={handleCloseOnboarding} />}
      {isCreateStoryModalOpen && <CreateStoryModal onClose={() => setIsCreateStoryModalOpen(false)} onCreateStory={handleCreateStory} onEarnPoints={handleEarnPoints} />}
      {isReelGeneratorOpen && tripForReel && (
        <SocialReelGeneratorModal
            trip={tripForReel}
            onClose={() => setIsReelGeneratorOpen(false)}
            onReelGenerated={handleReelGenerated}
        />
      )}
    </div>
  );
}