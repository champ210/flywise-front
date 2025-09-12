// This file contains all the type definitions for the application.
// It remains largely the same as the logic is unchanged,
// but IconProps will be updated for react-native-svg compatibility.

export interface IconProps {
  name?: string;
  style?: any; // In React Native, style can be an object or an array of objects
  className?: string; // FIX: Add className for web compatibility
  color?: string; // For react-native-svg fill/stroke
  width?: number | string;
  height?: number | string;
}

// All other interfaces from the original file are included below...
export interface PricePrediction {
  recommendation: 'Wait' | 'Buy Now';
  reason: string;
}

export interface Flight {
  type: 'flight';
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  layovers?: string[];
  pricePrediction?: PricePrediction;
  negotiationTip?: string;
  affiliateLink: string;
  provider?: string;
  rankingScore?: number;
  rankingReason?: string;
  fareRules?: string;
  simplifiedFareRules?: string;
}

export interface UserReview {
  user: string;
  rating: number;
  comment: string;
}

export interface Stay {
  type: 'stay';
  name: string;
  stayType: 'Hotel' | 'Apartment' | 'Guesthouse' | 'Villa';
  location: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  imageUrl: string;
  numberOfNights?: number;
  negotiationTip?: string;
  reviews?: UserReview[];
  affiliateLink: string;
  provider?: string;
  rankingScore?: number;
  rankingReason?: string;
}

export interface Car {
  type: 'car';
  make: string;
  model: string;
  carType: 'Sedan' | 'SUV' | 'Luxury' | 'Van' | 'Electric';
  company: string;
  location: string;
  pricePerDay: number;
  rating: number;
  passengers: number;
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  imageUrl: string;
  recommendation?: string;
  negotiationTip?: string;
  numberOfDays?: number;
  affiliateLink: string;
  provider?: string;
  rankingScore?: number;
  rankingReason?: string;
}

export type SearchResult = Flight | Stay | Car;

// For AI-powered alternative suggestions
export interface AlternativeSuggestion {
  type: 'flight' | 'stay';
  originalLocation: string;
  alternativeLocationName: string;
  reason: string; // Why this is a good alternative
  estimatedCostSaving?: string;
  estimatedTimeDifference?: string;
}

// For multi-part chat queries
export interface ItinerarySuggestion {
    name: string;
    description: string;
}

export interface ItinerarySnippet {
    destination: string;
    suggestions: ItinerarySuggestion[];
}

// For Real-Time Adaptive Concierge
export interface RealTimeSuggestion {
  name: string;
  address: string;
  reason: string; // Why this is a good alternative
  openingHours?: string; // e.g., "Open until 9 PM"
  travelTime?: string; // e.g., "10 min walk"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imageData?: {
    mimeType: string;
    base64: string;
  };
  results?: SearchResult[];
  analyzedQuery?: string;
  itinerarySnippet?: ItinerarySnippet;
  alternativeSuggestions?: AlternativeSuggestion[];
  realTimeSuggestions?: RealTimeSuggestion[];
}

// Types for structured API parameters parsed by the AI
export interface FlightSearchParams {
  originLocationCode?: string;
  destinationLocationCode?: string;
  departureDate?: string;
  adults?: number;
}

export interface HotelSearchParams {
  destination?: string;
  checkin_date?: string;
  checkout_date?: string;
  adults_number?: number;
  stars?: number;
  max_price_per_night?: number;
}

export interface CarSearchParams {
  location?: string;
  pickup_date?: string;
  dropoff_date?: string;
  car_type?: 'Sedan' | 'SUV' | 'Luxury' | 'Van' | 'Electric';
  max_price_per_day?: number;
}

export interface ItineraryRequestParams {
  destination?: string;
  duration?: number;
  interests?: string;
}

export interface ApiParams {
    analyzedQuery: string;
    flight_search_params?: FlightSearchParams;
    hotel_search_params?: HotelSearchParams;
    car_search_params?: CarSearchParams;
    itinerary_request?: ItineraryRequestParams;
}

// Types for the Itinerary Planner
export interface ActivityDetail {
  locationName: string;
  address: string;
  description: string;
}

export interface DailyPlan {
  day: number;
  morning: ActivityDetail;
  afternoon: ActivityDetail;
  evening: ActivityDetail;
}

export interface BudgetBreakdown {
  lodging?: { estimate: number; details: string; };
  food?: { estimate: number; details: string; };
  activities?: { estimate: number; details: string; };
  transport?: { estimate: number; details: string; };
}

export interface ItineraryPlan {
  destination: string;
  itinerary: DailyPlan[];
  culturalTips?: string[];
  totalBudget?: number;
  budgetBreakdown?: BudgetBreakdown;
  interests?: string;
}


// Type for Saved Trips
export interface SavedTrip {
  id: string;
  name: string;
  type: 'itinerary' | 'search';
  data: ItineraryPlan | SearchResult[];
  createdAt: string;
  startDate?: string; // ISO string for itinerary start
  endDate?: string; // ISO string for itinerary end
  flightNumber?: string;
  documents?: DocumentScanResult[];
}

// Types for the Travel Checklist feature
export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ChecklistItem {
    item: string;
    checked: boolean;
}

export interface ChecklistDocuments {
    items: ChecklistItem[];
    sources?: GroundingSource[];
}

export interface Checklist {
    packingList: ChecklistItem[];
    documents: ChecklistDocuments;
    localEssentials: ChecklistItem[];
}

// Types for Map View feature
export interface MapMarker {
  name: string;
  lat: number;
  lng: number;
  day: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  activity: string;
}

// Types for Travel Insurance feature
export interface CoverageDetail {
  limit: number;
  description: string;
}

export interface TravelInsuranceQuote {
  provider: string;
  price: number;
  coverage: {
    medical: CoverageDetail;
    cancellation: CoverageDetail;
    baggage: CoverageDetail;
  };
  bestFor: string; // e.g., "Budget Travelers", "Adventure Sports", "Comprehensive Coverage"
}

// For Stay Details Modal
export interface NearbyAttraction {
  name: string;
  description: string;
}

export interface LocalVibe {
  description: string;
  sources?: GroundingSource[];
}

// Types for Currency Converter
export type ExchangeRates = {
    [currencyCode: string]: number;
};

// For Wallet
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string; // For card
  expiry?: string; // For card, e.g., "08/25"
  brand?: 'visa' | 'mastercard' | 'other'; // For card
  email?: string; // For PayPal
  isPrimary?: boolean;
}

// For User Profile
export interface UserProfile {
  preferredAirlines: string; // Comma-separated string
  minHotelStars: number; // 0 for any
  preferredCarTypes: ('Sedan' | 'SUV' | 'Luxury' | 'Van' | 'Electric')[];
  favoriteDestinations: string[];
  interests: string[];
  budget: {
    flightMaxPrice: number | '';
    hotelMaxPrice: number | '';
    carMaxPrice: number | '';
  };
  gamificationProfile?: GamificationProfile;
  paymentMethods: PaymentMethod[];
}

// Types for Weather Forecast
export type WeatherIcon = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'partly-cloudy';

export interface DailyForecast {
  day: string; // e.g., "Monday", "Tue"
  highTemp: number; // in Celsius
  lowTemp: number; // in Celsius
  description: string;
  icon: WeatherIcon;
}

export type WeatherForecast = DailyForecast[];

// Types for Travel Buddy feature
export type TravelStyle = 'Relaxed' | 'Adventurous' | 'Cultural Explorer';
export type BudgetLevel = 'Budget-conscious' | 'Mid-range' | 'Luxury';

export interface TravelBuddyPreferences {
  travelStyle: TravelStyle;
  budget: BudgetLevel;
  interests: string;
  gender: 'Male' | 'Female' | 'Any';
  age: string; // User input like "25-35" or "40s"
}

export interface TravelBuddyProfile {
  name: string;
  bio: string;
  keyTraits: string[];
  travelStyle: TravelStyle;
  budget: BudgetLevel;
  gender: 'Male' | 'Female' | 'Non-binary';
  age: number; // A specific age generated by the AI
  compatibilityScore: number; // A score from 0-100%
  compatibilityReason: string; // A short justification for the score
  profilePicture?: string; // base64 encoded string
}

// For Comments
export interface Comment {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  createdAt: string; // ISO string
}

// For Travel Stories
export interface TravelStory {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  title: string;
  content: string;
  images: string[];
  locationTags: string[];
  likes: number;
  createdAt: string; // ISO string
  comments?: Comment[];
  aiSummary?: string;
  estimatedCost?: number;
  tags?: string[];
}

// For Travel Communities
export interface CommunityMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'admin' | 'member';
}

export interface CommunityPost {
  id: string;
  author: CommunityMember;
  content: string;
  createdAt: string; // ISO string
  isPinned?: boolean;
}

export interface CommunityAnswer {
    id: string;
    author: CommunityMember;
    content: string;
    createdAt: string; // ISO string
}

export interface CommunityQuestion {
    id: string;
    author: CommunityMember;
    question: string;
    createdAt: string; // ISO string
    answers: CommunityAnswer[];
    aiSummary?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  memberCount: number;
  type: 'public' | 'private';
  category: 'destination' | 'interest';
  posts: CommunityPost[];
  questions?: CommunityQuestion[];
}

// For Meetup Events
export type RsvpStatus = 'going' | 'maybe' | 'not_going';

export interface EventAttendee extends CommunityMember {
  rsvp: RsvpStatus;
}

export interface MeetupEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  organizer: CommunityMember;
  attendees: EventAttendee[];
  coverImageUrl: string;
  category: string; // e.g., 'Food Tour', 'Hiking', 'Museum Visit'
}

// For Booking Flows
export interface PassengerDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface BookingConfirmation {
  bookingReference: string;
  flight: Flight;
  passenger: PassengerDetails;
  totalPaid: number;
}

export interface StayBookingConfirmation {
  bookingReference: string;
  stay: Stay;
  guest: PassengerDetails;
  totalPaid: number;
}

export interface CarBookingConfirmation {
  bookingReference: string;
  car: Car;
  driver: PassengerDetails;
  totalPaid: number;
}


// For Group Planning
export interface GroupTripMember extends CommunityMember {}

export interface GroupTripTask {
  id: string;
  task: string;
  isCompleted: boolean;
  assignedTo?: GroupTripMember[];
}

export interface VotingOption {
  id: string;
  text: string;
  votes: string[]; // Array of member IDs
}

export interface GroupTripPoll {
  id:string;
  question: string;
  options: VotingOption[];
  isClosed?: boolean;
}

export interface GroupTripItineraryItem {
  id: string;
  time: string;
  activity: string;
  location?: string;
  notes?: string;
}

export interface GroupTripExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // member ID
  sharedWith: string[]; // array of member IDs
}

export interface DebtCalculation {
  from: GroupTripMember;
  to: GroupTripMember;
  amount: number;
}

export interface GroupTrip {
  id: string;
  name: string;
  destination: string;
  coverImageUrl: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  members: GroupTripMember[];
  itinerary: {
    date: string; // YYYY-MM-DD
    items: GroupTripItineraryItem[];
  }[];
  tasks: GroupTripTask[];
  polls: GroupTripPoll[];
  expenses: GroupTripExpense[];
  description?: string;
}

// For Gamification
export interface Badge {
  id: string; // e.g., 'first-booking', 'story-writer', 'memory-maker', 'foodie-explorer', 'local-rider', 'explorer-buddy', 'cultural-connector', 'local-hero', 'digital-nomad', 'global-connector'
  name: string;
  description: string;
  icon: string; // Icon name from Icon.tsx
}

export interface VoyageurLevel {
  level: number;
  name: string;
  pointsRequired: number;
}

export interface PassportStamp {
    country: string;
    city: string;
    date: string; // ISO string
    crestUrl: string; // A URL to a crest/stamp image
}

export interface AIVoyageMission {
    title: string;
    description: string;
    destination: string;
    badgeToUnlock: string; // ID of the badge
    pointsToEarn: number;
}

export interface GamificationProfile {
  flyWisePoints: number;
  earnedBadgeIds: string[];
  collectedStamps: PassportStamp[];
}

// For Wallet
export interface Transaction {
  id: string;
  description: string;
  date: string; // ISO string
  amount: number;
  type: 'credit' | 'debit';
}

// For AI Dream Weaver (Inspire Me)
export interface DestinationSuggestion {
  name: string;
  reason: string;
}

export interface VibeSearchResult {
  images: string[]; // Array of base64 encoded image strings
  destinations: DestinationSuggestion[];
}

// For Local Connections Feature
export interface LocalReview {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO string
}

export interface LocalExperience {
  id: string;
  title: string;
  description: string;
  price: number; // 0 for free
  category: 'Tour' | 'Meal' | 'Workshop' | 'Other';
}

export interface LocalProfile {
  id: string;
  profileType: 'stay' | 'hangout';
  name: string;
  age: number;
  location: string; // e.g., "Shibuya, Tokyo"
  avatarUrl: string;
  bio: string;
  interests: string[];
  languages: string[];
  isVerified: boolean;
  compatibilityScore: number;
  compatibilityReason: string;
  // Stay-specific fields
  hostingPolicy?: 'Free' | 'Small Fee';
  maxGuests?: number;
  housePhotos?: string[];
  reviews?: LocalReview[];
  offeredExperiences?: LocalExperience[];
}

export interface HangoutSuggestion {
    title: string;
    description: string;
    location: string;
    estimatedCost: string; // e.g., "Free", "$10-20", etc.
}

// For Super Services Hub
export interface ServiceApp {
  name: string;
  category: 'Food Delivery' | 'Ride-Hailing';
  description: string;
}

export interface MenuItem {
    name: string;
    price: string; // e.g., "$12.99"
    description: string;
}

export interface Restaurant {
    id: string;
    name: string;
    cuisine: string[];
    rating: number;
    priceRange: '$' | '$$' | '$$$' | '$$$$';
    deliveryTime: string;
    deliveryFee: number;
    imageUrl: string;
    menu: MenuItem[];
    provider: string; // e.g., "Uber Eats"
}

export interface RideOption {
    id: string;
    serviceName: string;
    serviceLogoUrl: string;
    vehicleType: string; // e.g., "Standard", "XL", "Luxury"
    eta: string; // e.g., "5 min"
    estimatedPrice: number;
    passengerCapacity: number;
}

export interface FoodSuggestion {
    restaurant: Restaurant;
    reason: string; // e.g., "Perfect for a quick, healthy lunch near you."
}

export interface RideSuggestion {
    destination: string; // e.g., "Eiffel Tower"
    reason: string; // e.g., "Best way to get to your next itinerary item."
    options: RideOption[];
}

export interface SuperServiceData {
    availableApps: ServiceApp[];
    restaurants: Restaurant[];
    foodSuggestions: FoodSuggestion[];
    rideSuggestion: RideSuggestion | null;
    smartCombo: {
        title: string;
        description: string;
        restaurant: Restaurant;
        ride: RideOption;
    } | null;
}

export interface FoodOrderConfirmation {
    orderId: string;
    restaurant: Restaurant;
    totalPaid: number;
    estimatedDelivery: string;
    coinsEarned: number;
}

export interface RideBookingConfirmation {
    bookingId: string;
    ride: RideOption;
    destination: string;
    totalPaid: number;
    coinsEarned: number;
}

// For Storytelling & Memories
export interface TripMemory {
  tripId: string; // links to SavedTrip id
  title: string;
  narrativeSummary: string;
  keyStats: {
    distanceTraveled: number; // in km
    destinationsVisited: number;
    photosTaken: number; // simulated
  };
  videoHighlightImageUrls: string[]; // array of image URLs to simulate video frames
  musicTheme: 'Uplifting' | 'Chill' | 'Epic' | 'Sentimental';
  mapRoute: { lat: number; lng: number }[];
}

// For Social Sharing
export interface SocialPostSuggestion {
    caption: string;
    hashtags: string; // A single string of space-separated hashtags, e.g., "#travel #kyoto #japan"
}

// For AI Social Reel Generator
export interface SocialReelScene {
  imageUrl: string; // The base64 data URL of the user's uploaded image
  overlayText: string; // AI-generated text for this scene
}

export interface SocialReel {
  tripId: string;
  title: string;
  musicSuggestion: string; // e.g., "Upbeat indie pop like 'Good Days' by SZA"
  scenes: SocialReelScene[];
  socialPost: SocialPostSuggestion; // Reuse existing type
}


// For Coworking Spaces
export interface CoworkingReview extends UserReview {}

export interface CoworkingSpace {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  imageUrl: string;
  price: {
    perHour: number;
    perDay: number;
    perMonth: number;
  };
  rating: number;
  amenities: string[];
  availability: {
    hotDesks: number;
    privateOffices: number;
  };
  aiInsight: string;
  reviews: CoworkingReview[];
  networkingOpportunity: string;
}

export interface CoworkingBookingConfirmation {
  bookingReference: string;
  space: CoworkingSpace;
  user: PassengerDetails;
  bookingType: 'hotDesk' | 'privateOffice' | 'meetingRoom';
  duration: string;
  totalPaid: number;
  coinsEarned: number;
}

// For Home Dashboard
export interface AIHomeSuggestion {
  title: string;
  description: string;
  actionText: string;
  actionTarget: {
    tab: string; // The tab to switch to
    query?: string; // An optional query to pre-fill
  };
}

// For Budget Optimizer
export interface BudgetOptimizationSuggestion {
    type: 'Stay' | 'Activity' | 'Transport' | 'Food';
    originalItem: string;
    suggestedAlternative: string;
    reason: string;
    estimatedSavings: number;
}

// For Flight Tracker
export interface Waypoint {
  lat: number;
  lng: number;
  eta: string; // ISO string
  progressPercent: number;
}

export interface FlightStatus {
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    iata: string;
    city: string;
    scheduledTime: string;
    actualTime: string | null;
    terminal: string | null;
    gate: string | null;
    latitude: number;
    longitude: number;
  };
  arrival: {
    airport: string;
    iata: string;
    city: string;
    scheduledTime: string;
    actualTime: string | null;
    terminal: string | null;
    gate: string | null;
    baggageClaim: string | null;
    latitude: number;
    longitude: number;
  };
  status: 'Scheduled' | 'En Route' | 'Landed' | 'Delayed' | 'Cancelled';
  aircraft: {
    type: string;
    registration: string | null;
  };
  livePosition: {
    latitude: number;
    longitude: number;
    altitude: number; // in feet
    speed: number; // in knots
  } | null;
  progressPercent: number;
  aiSummary: string;
  waypoints?: Waypoint[];
}

// For Wandergram Feature
export interface WandergramComment {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  text: string;
  createdAt: string; // ISO string
}

export interface WandergramPost {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  imageUrl: string;
  caption: string;
  location?: string;
  likes: number;
  comments: WandergramComment[];
  createdAt: string; // ISO string
}

export interface WandergramStory {
    id: string;
    user: {
        name: string;
        avatarUrl: string;
    };
    imageUrl: string; // The content of the story
    viewed: boolean;
}

// For AI Discovery Layer
export interface AIDiscoveryData {
  trendingDestinations: {
    destination: string;
    image: string; // URL from a related story
    reason: string;
  }[];
  hiddenGems: WandergramPost['id'][]; // Array of WandergramPost IDs
  recommendations: WandergramPost['id'][]; // Array of WandergramPost IDs
}

// For Travel Trend Radar
export interface SocialProof {
  platform: 'TikTok' | 'Instagram' | 'Booking' | 'FlyWise';
  value: string;
}

export interface TravelTrend {
  id: string;
  destination: string;
  image: string; // URL
  category: 'Adventure' | 'City Break' | 'Relaxation' | 'Cultural' | 'Hidden Gem';
  trendScore: number; // 0-100
  monthlyGrowth: number; // Percentage
  socialProof: SocialProof[];
  personalizationReason: string;
}

// For Wandergram Chat
export interface WandergramChatMessage {
  id: string;
  senderId: string; // 'currentUser' or the other user's ID
  text: string;
  createdAt: string; // ISO string
}

export interface WandergramConversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  messages: WandergramChatMessage[];
}

// For In-Trip Companion
export interface DocumentScanResult {
  documentType: 'Flight Itinerary' | 'Hotel Confirmation' | 'Rental Car' | 'Other';
  confirmationNumber?: string;
  passengerName?: string;
  details: {
    [key: string]: string;
  };
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
}

export interface TripIdea {
  destination: string;
  interests: string;
}

// For Local Experiences
export type ExperienceCategory = 'Food' | 'Adventure' | 'Culture' | 'Wellness';

export interface ExperienceReview {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO string
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  category: ExperienceCategory;
  location: string;
  images: string[]; // URLs
  price: number; // Per person in USD
  duration: string; // e.g., "4 hours", "Full day"
  groupSize: {
    min: number;
    max: number;
  };
  languages: string[];
  host: {
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
  };
  availability: {
    [date: string]: number; // "YYYY-MM-DD": spots left
  };
  reviews: ExperienceReview[];
  rating: number; // Calculated average
}