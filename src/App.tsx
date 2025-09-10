import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import Header from '@/src/components/Header';
import ChatInterface from '@/src/components/ChatInterface';
import ItineraryPlanner from '@/src/components/ItineraryPlanner';
import MyTrips from '@/src/components/MyTrips';
import { Icon } from '@/src/components/Icon';
import { SearchResult, SavedTrip, UserProfile as UserProfileType, Flight, Stay, Car, BookingConfirmation, StayBookingConfirmation, CarBookingConfirmation, GamificationProfile, Restaurant, RideOption, FoodOrderConfirmation, RideBookingConfirmation, LocalProfile, HangoutSuggestion, CoworkingSpace, CoworkingBookingConfirmation, Community, ItineraryPlan, WandergramPost, WandergramStory, WandergramComment, WandergramConversation, WandergramChatMessage } from '../types';
import SubscriptionModal from '@/src/components/SubscriptionModal';
import CurrencyConverter from '@/src/components/CurrencyConverter';
import OnboardingModal from '@/src/components/OnboardingModal';
import UserProfile from '@/src/components/UserProfile';
import TravelBuddy from '@/src/components/TravelBuddy';
import SearchType from '@/src/tabs/SearchType';
import MeetupEvents from '@/src/components/MeetupEvents';
import FlightBooking from '@/src/components/FlightBooking';
import StayBooking from '@/src/components/StayBooking';
import CarBooking from '@/src/components/CarBooking';
import GroupPlanning from '@/src/components/GroupPlanning';
import PackingChecklist from '@/src/components/PackingChecklist';
import SocialPassport from '@/src/components/SocialPassport';
import LoginModal from '@/src/components/LoginModal';
import SignUpModal from '@/src/components/SignUpModal';
import Wallet from '@/src/components/Wallet';
import HomeShare from '@/src/components/HomeShare';
import SuperServicesHub from '@/src/components/SuperServicesHub';
import FoodOrderModal from '@/src/components/FoodOrderModal';
import RideBookingModal from '@/src/components/RideBookingModal';
import HangoutRequestModal from '@/src/components/HangoutRequestModal';
import CoworkingHub from '@/src/components/CoworkingHub';
import CoworkingBooking from '@/src/components/CoworkingBooking';
import HomeDashboard from '@/src/tabs/HomeDashboard';
import * as dbService from './services/dbService';
import * as xanoService from './services/xanoService';
import FlightTracker from '@/src/components/FlightTracker';
import { ALL_BADGES } from './data/gamification';
import Wandergram from '@/src/components/Wandergram';
import CreateWandergramPostModal from '@/src/components/CreateWandergramPostModal';
import AskAiAboutPhotoModal from '@/src/components/AskAiAboutPhotoModal';
import DreamWeaver from '@/src/components/DreamWeaver';
import { setResults } from '@/src/slices/resultsSlice';

export enum Tab {
  Home = 'Home',
  FlightTracker = 'Flight Tracker',
  Inspire = 'Inspire',
  Chat = 'Chat',
  Planner = 'Planner',
  SuperServices = 'Super Services',
  Coworking = 'Coworking',
  LocalConnections = 'Local Connections',
  // More menu tabs
  MyTrips = 'My Trips',
  Checklist = 'Checklist',
  GroupPlanning = 'Group Planning',
  Wandergram = 'Wandergram',
  TravelBuddy = 'Travel Buddy',
  Events = 'Meetup Events',
  Wallet = 'Wallet',
  Converter = 'Converter',
  Passport = 'Passport',
  Search = 'Search',
  Profile = 'My Profile',
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

const initialWandergramPosts: WandergramPost[] = [
    {
        id: 'wg1',
        user: { name: 'Elena Petrova', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760c0337?q=80&w=800&auto=format&fit=crop',
        caption: 'Paris is always a good idea. 🥐☕️',
        location: 'Paris, France',
        likes: 1204,
        comments: [
            {
                id: 'wgc1',
                user: { name: 'Marcus Holloway', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
                text: 'Love this shot!',
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            }
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
        id: 'wg2',
        user: { name: 'Marcus Holloway', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
        imageUrl: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop',
        caption: 'Tokyo nights hit different. 🌃',
        location: 'Shibuya City, Tokyo',
        likes: 2543,
        comments: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
        id: 'wg3',
        user: { name: 'Aisha Khan', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
        imageUrl: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?q=80&w=800&auto=format&fit=crop',
        caption: 'Lost in the colorful streets of Chefchaouen.',
        location: 'Chefchaouen, Morocco',
        likes: 897,
        comments: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
];

const initialWandergramStories: WandergramStory[] = [
    { id: 's1', user: { name: 'Elena Petrova', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }, imageUrl: '', viewed: false },
    { id: 's2', user: { name: 'Marcus Holloway', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }, imageUrl: '', viewed: false },
    { id: 's3', user: { name: 'Aisha Khan', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }, imageUrl: '', viewed: true },
    { id: 's4', user: { name: 'Ben Carter', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }, imageUrl: '', viewed: true },
];

const initialWandergramConversations: WandergramConversation[] = [
    {
        id: 'convo1',
        user: { id: 'user_elena', name: 'Elena Petrova', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
        messages: [
            { id: 'msg1', senderId: 'user_elena', text: 'Hey! Loved your shot from Paris. What camera do you use?', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
            { id: 'msg2', senderId: 'currentUser', text: 'Thanks so much! I use a Sony A7III.', createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
        ],
    },
    {
        id: 'convo2',
        user: { id: 'user_marcus', name: 'Marcus Holloway', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
        messages: [
            { id: 'msg3', senderId: 'user_marcus', text: 'That Tokyo photo is insane!', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        ],
    },
];


const PRIMARY_TABS = [
  { name: Tab.Home, icon: 'home' },
  { name: Tab.FlightTracker, icon: 'send' },
  { name: Tab.Inspire, icon: 'lightbulb' },
  { name: Tab.Chat, icon: 'chat' },
  { name: Tab.Planner, icon: 'planner' },
  { name: Tab.SuperServices, icon: 'grid' },
  { name: Tab.Coworking, icon: 'briefcase' },
  { name: Tab.LocalConnections, icon: 'users' },
];

const MORE_TABS = [
  { name: Tab.MyTrips, icon: 'bookmark' },
  { name: Tab.Checklist, icon: 'checklist' },
  { name: Tab.GroupPlanning, icon: 'clipboard-list' },
  { name: Tab.Wandergram, icon: 'instagram' },
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
  const [wandergramPosts, setWandergramPosts] = useState<WandergramPost[]>(initialWandergramPosts);
  const [isCreateWandergramPostModalOpen, setIsCreateWandergramPostModalOpen] = useState(false);
  const [postForAskAi, setPostForAskAi] = useState<WandergramPost | null>(null);
  const [foodToOrder, setFoodToOrder] = useState<Restaurant | undefined>(undefined);
  const [rideToBook, setRideToBook] = useState<{ride?: RideOption, destination?: string} | null>(null);
  const [hangoutRequest, setHangoutRequest] = useState<{local: LocalProfile, suggestion: HangoutSuggestion} | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [userProfile, setUserProfile] = useState<UserProfileType>(DEFAULT_USER_PROFILE);
  
  // Wandergram Chat State
  const [wandergramConversations, setWandergramConversations] = useState<WandergramConversation[]>(initialWandergramConversations);
  const [activeWandergramView, setActiveWandergramView] = useState<'feed' | 'chatList' | 'chat'>('feed');
  const [activeWandergramConversationId, setActiveWandergramConversationId] = useState<string | null>(null);
  
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

  const handleOrderFood = useCallback((restaurant?: Restaurant) => setFoodToOrder(restaurant), []);
  const handleBookRide = useCallback((ride?: RideOption, destination?: string) => setRideToBook({ ride, destination }), []);

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

      setFoodToOrder(undefined);
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

  const handleCreateWandergramPost = useCallback((postData: Omit<WandergramPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'user'>) => {
    const newPost: WandergramPost = {
        id: `wg${Date.now()}`,
        user: { name: 'Valued Member', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop'},
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        ...postData
    };
    setWandergramPosts(prev => [newPost, ...prev]);
    setIsCreateWandergramPostModalOpen(false);
    handleEarnPoints(50, 'photographer'); // Example for a new badge
  }, [handleEarnPoints]);
  
  const handleWandergramComment = useCallback((postId: string, commentText: string) => {
    const newComment: WandergramComment = {
        id: `wgc${Date.now()}`,
        user: { name: 'Valued Member', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
        text: commentText,
        createdAt: new Date().toISOString(),
    };
    
    setWandergramPosts(prevPosts => 
        prevPosts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, newComment],
                };
            }
            return post;
        })
    );
    handleEarnPoints(15, 'conversation-starter');
  }, [handleEarnPoints]);

  const handleHangoutRequestComplete = useCallback(() => {
    alert("Hangout request sent! You earned 100 FlyWise Coins and unlocked the 'Explorer Buddy' badge!");
    handleEarnPoints(100, 'explorer-buddy');
    setHangoutRequest(null);
  }, [handleEarnPoints]);

  // Wandergram Chat Handlers
  const handleNavigateWandergram = useCallback((view: 'feed' | 'chatList') => {
    setActiveWandergramView(view);
    setActiveWandergramConversationId(null);
  }, []);

  const handleSelectWandergramConversation = useCallback((conversationId: string) => {
    setActiveWandergramConversationId(conversationId);
    setActiveWandergramView('chat');
  }, []);

  const handleSendWandergramMessage = useCallback((conversationId: string, text: string) => {
    const newMessage: WandergramChatMessage = {
      id: `msg${Date.now()}`,
      senderId: 'currentUser',
      text,
      createdAt: new Date().toISOString(),
    };
    
    setWandergramConversations(prev => 
      prev.map(convo => 
        convo.id === conversationId 
          ? { ...convo, messages: [...convo.messages, newMessage] }
          : convo
      )
    );
  }, []);


  const renderActiveTab = () => {
    if (flightToBook) return <FlightBooking flight={flightToBook} onClose={() => setFlightToBook(null)} onBookingComplete={handleBookingComplete} />;
    if (stayToBook) return <StayBooking stay={stayToBook} onClose={() => setStayToBook(null)} onBookingComplete={handleBookingComplete} />;
    if (carToBook) return <CarBooking car={carToBook} onClose={() => setCarToBook(null)} onBookingComplete={handleBookingComplete} />;
    if (spaceToBook) return <CoworkingBooking space={spaceToBook} onClose={() => setSpaceToBook(null)} onBookingComplete={handleCoworkingBookingComplete} />;
    if (foodToOrder) return <FoodOrderModal restaurant={foodToOrder} onClose={() => setFoodToOrder(undefined)} onOrderComplete={handleOrderComplete} />;
    if (rideToBook) return <RideBookingModal ride={rideToBook.ride} destination={rideToBook.destination} onClose={() => setRideToBook(null)} onBookingComplete={handleOrderComplete} />;
    if (hangoutRequest) return <HangoutRequestModal local={hangoutRequest.local} suggestion={hangoutRequest.suggestion} onClose={() => setHangoutRequest(null)} onHangoutComplete={handleHangoutRequestComplete} />;

    switch (activeTab) {
      case Tab.Home: return <HomeDashboard userProfile={userProfile} savedTrips={savedTrips} stories={[]} setActiveTab={setActiveTab} />;
      case Tab.Search: return <SearchType />;
      case Tab.Chat:
        return <ChatInterface onSaveTrip={handleSaveTrip} userProfile={userProfile} savedTrips={savedTrips} onBookFlight={handleBookFlight} onBookStay={handleBookStay} onBookCar={handleBookCar} />;
      case Tab.Planner: return <ItineraryPlanner onSaveTrip={handleSaveTrip} isOffline={isOffline} />;
      case Tab.MyTrips: return <MyTrips savedTrips={savedTrips} onDeleteTrip={handleDeleteTrip} isOffline={isOffline} />;
      case Tab.Converter: return <CurrencyConverter />;
      case Tab.Profile: return <UserProfile profile={userProfile} onSave={handleSaveProfile} />;
      case Tab.TravelBuddy: return <TravelBuddy userProfile={userProfile} onSaveTrip={handleSaveTrip} savedTrips={savedTrips} isOffline={isOffline} />;
      case Tab.Events: return <MeetupEvents />;
      case Tab.GroupPlanning: return <GroupPlanning />;
      case Tab.Checklist: return <PackingChecklist />;
      case Tab.Passport: return <SocialPassport profile={gamificationProfile} />;
      case Tab.Wallet: return <Wallet isLoggedIn={isLoggedIn} onLoginClick={openLoginModal} />;
      case Tab.LocalConnections: return <HomeShare userProfile={userProfile} onOpenVipModal={onOpenVipModal} onHangoutRequest={(details) => setHangoutRequest(details)} />;
      case Tab.SuperServices: return <SuperServicesHub userProfile={userProfile} savedTrips={savedTrips} onOrderFood={handleOrderFood} onBookRide={handleBookRide} />;
      case Tab.Coworking: return <CoworkingHub userProfile={userProfile} onBookSpace={handleBookSpace} />;
      case Tab.FlightTracker: return <FlightTracker />;
      case Tab.Inspire: return <DreamWeaver />;
      case Tab.Wandergram: return <Wandergram 
        stories={initialWandergramStories} 
        posts={wandergramPosts}
        userProfile={userProfile}
        onOpenCreateModal={() => setIsCreateWandergramPostModalOpen(true)} 
        onAskAi={setPostForAskAi} 
        onAddComment={handleWandergramComment}
        onEarnPoints={handleEarnPoints}
        conversations={wandergramConversations}
        activeView={activeWandergramView}
        activeConversationId={activeWandergramConversationId}
        onNavigate={handleNavigateWandergram}
        onSelectConversation={handleSelectWandergramConversation}
        onSendMessage={handleSendWandergramMessage}
        />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl flex flex-col h-full max-h-[95vh]">
      <Header 
        onOpenVipModal={onOpenVipModal} 
        isLoggedIn={isLoggedIn}
        onLoginClick={openLoginModal}
        onSignUpClick={openSignUpModal}
        onLogoutClick={handleLogout}
        isOffline={isOffline}
      />
      
      {isVipModalOpen && <SubscriptionModal onClose={() => setIsVipModalOpen(false)} />}
      {isOnboardingOpen && <OnboardingModal onClose={handleCloseOnboarding} />}
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={openSignUpModal} />}
      {isSignUpModalOpen && <SignUpModal onClose={() => setIsSignUpModalOpen(false)} onSignUpSuccess={handleSignUpSuccess} onSwitchToLogin={openLoginModal} />}
      {isCreateWandergramPostModalOpen && <CreateWandergramPostModal onClose={() => setIsCreateWandergramPostModalOpen(false)} onCreatePost={handleCreateWandergramPost} />}
      {postForAskAi && <AskAiAboutPhotoModal post={postForAskAi} onClose={() => setPostForAskAi(null)} />}

      <nav className="flex-shrink-0 border-b border-slate-200/80 px-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar -mb-px">
                  {PRIMARY_TABS.map(({ name, icon }) => (
                      <button 
                        key={name}
                        onClick={() => setActiveTab(name)}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 whitespace-nowrap ${activeTab === name ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                      >
                           <Icon name={icon} className="h-5 w-5" />
                           <span>{name}</span>
                      </button>
                  ))}
              </div>
              <div className="relative" ref={moreMenuRef}>
                  <button 
                    onClick={() => setIsMoreMenuOpen(prev => !prev)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${MORE_TABS.some(t => t.name === activeTab) ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                  >
                      <span>More</span>
                      <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                   {isMoreMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200/80 p-2 z-30 animate-fade-in-up">
                          <div className="space-y-1">
                            {MORE_TABS.map(({name, icon}) => (
                                <button
                                    key={name}
                                    onClick={() => { setActiveTab(name); setIsMoreMenuOpen(false); }}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                                        activeTab === name
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon name={icon} className={`h-5 w-5 flex-shrink-0 ${activeTab === name ? 'text-blue-600' : 'text-slate-500'}`} />
                                    <span>{name}</span>
                                </button>
                            ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
        {renderActiveTab()}
      </main>
    </div>
  );
}