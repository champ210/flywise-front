import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, AppState, ActivityIndicator, Modal } from 'react-native';

import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import ItineraryPlanner from './components/ItineraryPlanner';
import MyTrips from './components/MyTrips';
import ResultsList from './components/ResultsList';
import { Icon } from './components/Icon';
import { SearchResult, SavedTrip, UserProfile as UserProfileType, Flight, Stay, Car, BookingConfirmation, StayBookingConfirmation, CarBookingConfirmation, GamificationProfile, Restaurant, RideOption, FoodOrderConfirmation, RideBookingConfirmation, LocalProfile, HangoutSuggestion, CoworkingSpace, CoworkingBookingConfirmation, Community, ItineraryPlan, WandergramPost, WandergramStory, WandergramComment, WandergramConversation, WandergramChatMessage, PaymentMethod, Transaction, TripIdea, DocumentScanResult, Experience } from './types';
import SubscriptionModal from './components/SubscriptionModal';
import CurrencyConverter from './components/CurrencyConverter';
import OnboardingModal from './components/OnboardingModal';
import UserProfile from './components/UserProfile';
import TravelBuddy from './components/TravelBuddy';
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
import Wandergram from './components/Wandergram';
import CreateWandergramPostModal from './components/CreateWandergramPostModal';
import AskAiAboutPhotoModal from './components/AskAiAboutPhotoModal';
import TravelTrendRadar from './components/TravelTrendRadar';
import DocumentScannerModal from './components/DocumentScannerModal';
import TranslatorModal from './components/TranslatorModal';
import { getTranslator } from './localization';
import ExperienceDetail from './components/ExperienceDetail';
import ExperienceBooking from './components/ExperienceBooking';
import { styles } from './components/styles';
import SearchBar from './components/SearchBar';

export enum Tab {
  Home = 'Home',
  FlightTracker = 'Flight Tracker',
  Discovery = 'Discovery',
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

const DEFAULT_GAMIFICATION_PROFILE: GamificationProfile = {
  flyWisePoints: 0,
  earnedBadgeIds: [],
  collectedStamps: [],
};

const DEFAULT_USER_PROFILE: UserProfileType = {
  preferredAirlines: '',
  minHotelStars: 0,
  preferredCarTypes: [],
  favoriteDestinations: [],
  interests: [],
  budget: {
    flightMaxPrice: 0,
    hotelMaxPrice: 0,
    carMaxPrice: 0,
  },
  gamificationProfile: DEFAULT_GAMIFICATION_PROFILE,
  paymentMethods: [],
};

const PRIMARY_TABS = [
  { name: Tab.Home, icon: 'home' },
  { name: Tab.FlightTracker, icon: 'send' },
  { name: Tab.Discovery, icon: 'compass' },
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

export type Language = 'en' | 'fr' | 'ar';

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
  const [wandergramPosts, setWandergramPosts] = useState<WandergramPost[]>([]);
  const [wandergramStories, setWandergramStories] = useState<WandergramStory[]>([]);
  const [isCreateWandergramPostModalOpen, setIsCreateWandergramPostModalOpen] = useState(false);
  const [postForAskAi, setPostForAskAi] = useState<WandergramPost | null>(null);
  const [foodToOrder, setFoodToOrder] = useState<Restaurant | null>(null);
  const [rideToBook, setRideToBook] = useState<{ride: RideOption, destination: string} | null>(null);
  const [hangoutRequest, setHangoutRequest] = useState<{local: LocalProfile, suggestion: HangoutSuggestion} | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileType>(DEFAULT_USER_PROFILE);
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>([]);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isTranslatorModalOpen, setIsTranslatorModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [experienceToBook, setExperienceToBook] = useState<Experience | null>(null);
  
  const [chatQuery, setChatQuery] = useState('');
  const [plannerData, setPlannerData] = useState<TripIdea | null>(null);

  const [wandergramConversations, setWandergramConversations] = useState<WandergramConversation[]>([]);
  const [activeWandergramView, setActiveWandergramView] = useState<'feed' | 'chatList' | 'chat'>('feed');
  const [activeWandergramConversationId, setActiveWandergramConversationId] = useState<string | null>(null);
  
  const t = getTranslator(language);
  
  // All handlers...
  const fetchDataAfterAuth = useCallback(async () => { /* Omitted for brevity */ }, []);
  useEffect(() => { /* Omitted for brevity */ }, [fetchDataAfterAuth]);
  const handleCloseOnboarding = useCallback(() => { /* Omitted for brevity */ }, []);
  const handleSearchResults = useCallback((data: SearchResult[]) => { setResults(data); setError(null); }, []);
  const handleLoading = useCallback((loadingState: boolean) => { setIsLoading(loadingState); }, []);
  const handleError = useCallback((errorMessage: string) => { setError(errorMessage); setResults([]); }, []);
  const handleSaveTrip = useCallback(async (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => { /* Omitted */ }, [isLoggedIn, isOffline]);
  const handleDeleteTrip = useCallback(async (tripId: string) => { /* Omitted */ }, []);
  const handleSaveProfile = useCallback((profile: UserProfileType) => { /* Omitted */ }, []);
  const onOpenVipModal = useCallback(() => setIsVipModalOpen(true), []);
  const handleBookFlight = useCallback((flight: Flight) => setFlightToBook(flight), []);
  const handleBookStay = useCallback((stay: Stay) => setStayToBook(stay), []);
  const handleBookCar = useCallback((car: Car) => setCarToBook(car), []);
  const handleBookSpace = useCallback((space: CoworkingSpace) => setSpaceToBook(space), []);
  const handleOrderFood = useCallback((restaurant: Restaurant) => setFoodToOrder(restaurant), []);
  const handleBookRide = useCallback((ride: RideOption, destination: string) => setRideToBook({ ride, destination }), []);
  const handleEarnPoints = useCallback(async (points: number, badgeId?: string) => { /* Omitted */ }, []);
  const handleOrderComplete = useCallback((confirmation: any) => { /* Omitted */ }, []);
  const handleBookingComplete = useCallback((confirmation: any) => { /* Omitted */ }, []);
  const handleCoworkingBookingComplete = useCallback((confirmation: any) => { /* Omitted */ }, []);
  const handleLoginSuccess = useCallback(() => { /* Omitted */ }, []);
  const handleSignUpSuccess = useCallback(() => { /* Omitted */ }, []);
  const handleLogout = useCallback(() => { /* Omitted */ }, []);
  const openLoginModal = useCallback(() => { setIsSignUpModalOpen(false); setIsLoginModalOpen(true); }, []);
  const openSignUpModal = useCallback(() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }, []);
  const handleCreateWandergramPost = useCallback(async (postData: any) => { /* Omitted */ }, []);
  const handleWandergramComment = useCallback(async (postId: string, commentText: string) => { /* Omitted */ }, []);
  const handleHangoutRequestComplete = useCallback(() => { /* Omitted */ }, []);
  const handleNavigateWandergram = useCallback((view: 'feed' | 'chatList') => { /* Omitted */ }, []);
  const handleSelectWandergramConversation = useCallback((conversationId: string) => { /* Omitted */ }, []);
  const handleSendWandergramMessage = useCallback(async (conversationId: string, text: string) => { /* Omitted */ }, []);
  const handleAddPaymentMethod = useCallback(async (method: any) => { /* Omitted */ }, []);
  const handleDeletePaymentMethod = useCallback(async (methodId: string) => { /* Omitted */ }, []);
  const handleSetPrimaryPaymentMethod = useCallback(async (methodId: string) => { /* Omitted */ }, []);
  const handleFindFlightsForItinerary = useCallback((plan: ItineraryPlan) => { /* Omitted */ }, []);
  const handlePlanTripFromPost = useCallback(async (post: WandergramPost) => { /* Omitted */ }, []);
  const handleAddDocumentToTrip = useCallback(async (tripId: string, document: DocumentScanResult) => { /* Omitted */ }, []);
  const handleGetNearbySuggestions = useCallback(() => { /* Omitted */ }, []);
  const handleConfirmExperienceBooking = async () => { /* Omitted */ };

  const activeTrip = savedTrips.find(trip => {
    if (trip.type !== 'itinerary' || !trip.startDate || !trip.endDate) return false;
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return now >= start && now <= end;
  });

  const renderActiveTab = () => {
    // This logic remains complex, but each component is now a RNW component
    if (flightToBook) return <FlightBooking flight={flightToBook} onClose={() => setFlightToBook(null)} onBookingComplete={handleBookingComplete} />;
    if (stayToBook) return <StayBooking stay={stayToBook} onClose={() => setStayToBook(null)} onBookingComplete={handleBookingComplete} />;
    if (carToBook) return <CarBooking car={carToBook} onClose={() => setCarToBook(null)} onBookingComplete={handleBookingComplete} />;
    if (spaceToBook) return <CoworkingBooking space={spaceToBook} onClose={() => setSpaceToBook(null)} onBookingComplete={handleCoworkingBookingComplete} />;
    if (foodToOrder) return <FoodOrderModal restaurant={foodToOrder} onClose={() => setFoodToOrder(null)} onOrderComplete={handleOrderComplete} />;
    if (rideToBook) return <RideBookingModal ride={rideToBook.ride} destination={rideToBook.destination} onClose={() => setRideToBook(null)} onBookingComplete={handleOrderComplete} />;
    if (hangoutRequest) return <HangoutRequestModal local={hangoutRequest.local} suggestion={hangoutRequest.suggestion} onClose={() => setHangoutRequest(null)} onHangoutComplete={handleHangoutRequestComplete} />;
    if (selectedExperience) return <ExperienceDetail experience={selectedExperience} onBack={() => setSelectedExperience(null)} onBook={setExperienceToBook} t={t} />;

    return (
      <View style={activeTab !== 'Chat' && styles.tabContentContainer}>
        {(() => {
          switch (activeTab) {
            case Tab.Home: return <HomeDashboard userProfile={userProfile} savedTrips={savedTrips} posts={wandergramPosts} setActiveTab={setActiveTab} onOpenScanner={() => setIsScannerModalOpen(true)} onOpenTranslator={() => setIsTranslatorModalOpen(true)} />;
            case Tab.Search: return (<>
              <SearchBar onSearch={handleSearchResults} onLoading={handleLoading} onError={handleError} userProfile={userProfile} />
              <View style={{ marginTop: 16 }}>
                <ResultsList results={results} isLoading={isLoading} error={error} onBookFlight={handleBookFlight} onBookStay={handleBookStay} onBookCar={handleBookCar} />
              </View>
            </>);
            case Tab.Chat: return <ChatInterface onSaveTrip={handleSaveTrip} userProfile={userProfile} savedTrips={savedTrips} onBookFlight={handleBookFlight} onBookStay={handleBookStay} onBookCar={handleBookCar} initialQuery={chatQuery} onQueryHandled={() => setChatQuery('')} />;
            case Tab.Planner: return <ItineraryPlanner onSaveTrip={handleSaveTrip} isOffline={isOffline} onFindFlights={handleFindFlightsForItinerary} initialData={plannerData} onPlannerDataHandled={() => setPlannerData(null)} />;
            case Tab.MyTrips: return <MyTrips savedTrips={savedTrips} onDeleteTrip={handleDeleteTrip} isOffline={isOffline} onOpenScanner={() => setIsScannerModalOpen(true)} onGetNearbySuggestions={handleGetNearbySuggestions} />;
            case Tab.Converter: return <CurrencyConverter />;
            case Tab.Profile: return <UserProfile profile={userProfile} onSave={handleSaveProfile} />;
            case Tab.TravelBuddy: return <TravelBuddy userProfile={userProfile} onSaveTrip={handleSaveTrip} savedTrips={savedTrips} isOffline={isOffline} onFindFlights={handleFindFlightsForItinerary} />;
            case Tab.Events: return <MeetupEvents />;
            case Tab.GroupPlanning: return <GroupPlanning />;
            case Tab.Checklist: return <PackingChecklist />;
            case Tab.Passport: return <SocialPassport profile={gamificationProfile} />;
            case Tab.Wallet: return <Wallet isLoggedIn={isLoggedIn} onLoginClick={openLoginModal} userProfile={userProfile} transactions={walletTransactions} onAddPaymentMethod={handleAddPaymentMethod} onDeletePaymentMethod={handleDeletePaymentMethod} onSetPrimaryPaymentMethod={handleSetPrimaryPaymentMethod} />;
            case Tab.LocalConnections: return <HomeShare userProfile={userProfile} onOpenVipModal={onOpenVipModal} onHangoutRequest={(details) => setHangoutRequest(details)} onSelectExperience={setSelectedExperience} t={t} />;
            case Tab.SuperServices: return <SuperServicesHub userProfile={userProfile} savedTrips={savedTrips} onOrderFood={handleOrderFood} onBookRide={handleBookRide} />;
            case Tab.Coworking: return <CoworkingHub userProfile={userProfile} onBookSpace={handleBookSpace} />;
            case Tab.FlightTracker: return <FlightTracker />;
            case Tab.Discovery: return <TravelTrendRadar userProfile={userProfile} />;
            case Tab.Wandergram: return <Wandergram stories={wandergramStories} posts={wandergramPosts} userProfile={userProfile} onOpenCreateModal={() => setIsCreateWandergramPostModalOpen(true)} onAskAi={setPostForAskAi} onAddComment={handleWandergramComment} onEarnPoints={handleEarnPoints} conversations={wandergramConversations} activeView={activeWandergramView} activeConversationId={activeWandergramConversationId} onNavigate={handleNavigateWandergram} onSelectConversation={handleSelectWandergramConversation} onSendMessage={handleSendWandergramMessage} onPlanTrip={handlePlanTripFromPost} />;
            default: return null;
          }
        })()}
      </View>
    );
  };
  
  return (
    <View style={styles.appContainer}>
      <Header 
        onOpenVipModal={onOpenVipModal} 
        isLoggedIn={isLoggedIn}
        onLoginClick={openLoginModal}
        onSignUpClick={openSignUpModal}
        onLogoutClick={handleLogout}
        isOffline={isOffline}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />
      
      <Modal visible={isVipModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsVipModalOpen(false)}><SubscriptionModal onClose={() => setIsVipModalOpen(false)} /></Modal>
      <Modal visible={isOnboardingOpen} transparent={true} animationType="fade" onRequestClose={handleCloseOnboarding}><OnboardingModal onClose={handleCloseOnboarding} /></Modal>
      <Modal visible={isLoginModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsLoginModalOpen(false)}><LoginModal onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={openSignUpModal} /></Modal>
      <Modal visible={isSignUpModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsSignUpModalOpen(false)}><SignUpModal onClose={() => setIsSignUpModalOpen(false)} onSignUpSuccess={handleSignUpSuccess} onSwitchToLogin={openLoginModal} /></Modal>
      <Modal visible={isCreateWandergramPostModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsCreateWandergramPostModalOpen(false)}><CreateWandergramPostModal onClose={() => setIsCreateWandergramPostModalOpen(false)} onCreatePost={handleCreateWandergramPost} /></Modal>
      <Modal visible={!!postForAskAi} transparent={true} animationType="fade" onRequestClose={() => setPostForAskAi(null)}>{postForAskAi && <AskAiAboutPhotoModal post={postForAskAi} onClose={() => setPostForAskAi(null)} />}</Modal>
      <Modal visible={isScannerModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsScannerModalOpen(false)}><DocumentScannerModal onClose={() => setIsScannerModalOpen(false)} onSaveDocument={(doc) => activeTrip && handleAddDocumentToTrip(activeTrip.id, doc)} /></Modal>
      <Modal visible={isTranslatorModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsTranslatorModalOpen(false)}><TranslatorModal onClose={() => setIsTranslatorModalOpen(false)} /></Modal>
      <Modal visible={!!experienceToBook} transparent={true} animationType="fade" onRequestClose={() => setExperienceToBook(null)}>{experienceToBook && <ExperienceBooking experience={experienceToBook} onClose={() => setExperienceToBook(null)} onConfirm={handleConfirmExperienceBooking} t={t} />}</Modal>
      
      <View style={styles.navContainer}>
          <View style={styles.navTabs}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                  {PRIMARY_TABS.map(({ name, icon }) => (
                      <TouchableOpacity 
                        key={name}
                        onPress={() => setActiveTab(name)}
                        style={[styles.navButton, activeTab === name && styles.navButtonActive]}
                      >
                           <Icon name={icon} style={styles.navIcon} color={activeTab === name ? '#2563eb' : '#64748b'} />
                           <Text style={[styles.navText, activeTab === name && styles.navTextActive]}>{name}</Text>
                      </TouchableOpacity>
                  ))}
              </ScrollView>
          </View>
          <View>
              <TouchableOpacity 
                onPress={() => setIsMoreMenuOpen(prev => !prev)}
                style={[styles.navButton, MORE_TABS.some(t => t.name === activeTab) && styles.navButtonActive]}
              >
                  <Text style={[styles.navText, MORE_TABS.some(t => t.name === activeTab) && styles.navTextActive]}>More</Text>
                  <Icon name="chevron-down" style={styles.navIcon} color={MORE_TABS.some(t => t.name === activeTab) ? '#2563eb' : '#64748b'} />
              </TouchableOpacity>
               {isMoreMenuOpen && (
                  <View style={styles.moreMenu}>
                      <View>
                        {MORE_TABS.map(({name, icon}) => (
                            <TouchableOpacity
                                key={name}
                                onPress={() => { setActiveTab(name); setIsMoreMenuOpen(false); }}
                                style={[styles.moreMenuItem, activeTab === name && styles.moreMenuItemActive]}
                            >
                                <Icon name={icon} style={styles.moreMenuIcon} color={activeTab === name ? '#2563eb' : '#64748b'} />
                                <Text style={[styles.moreMenuText, activeTab === name && styles.moreMenuTextActive]}>{name}</Text>
                            </TouchableOpacity>
                        ))}
                      </View>
                  </View>
              )}
          </View>
      </View>

      <ScrollView style={styles.mainContent} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {renderActiveTab()}
      </ScrollView>
    </View>
  );
}