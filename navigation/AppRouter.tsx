import React from 'react';
import { useUIStore } from '../stores/useUIStore';
import { Tab } from './constants';

// Lazy load components for better performance
const HomeDashboard = React.lazy(() => import('../features/Home/HomeDashboard'));
const FlightTracker = React.lazy(() => import('../features/FlightTracker/FlightTracker'));
const TravelTrendRadar = React.lazy(() => import('../features/Discovery/TravelTrendRadar'));
const ChatInterface = React.lazy(() => import('../features/Chat/ChatInterface'));
const ItineraryPlanner = React.lazy(() => import('../features/Planner/ItineraryPlanner'));
const SuperServicesHub = React.lazy(() => import('../features/SuperServices/SuperServicesHub'));
const CoworkingHub = React.lazy(() => import('../features/Coworking/CoworkingHub'));
const HomeShare = React.lazy(() => import('../features/LocalConnections/HomeShare'));
const MyTrips = React.lazy(() => import('../features/Trips/MyTrips'));
const PackingChecklist = React.lazy(() => import('../features/Checklist/PackingChecklist'));
const GroupPlanning = React.lazy(() => import('../features/GroupPlanning/GroupPlanning'));
const Wandergram = React.lazy(() => import('../features/Wandergram/Wandergram'));
const TravelBuddy = React.lazy(() => import('../features/TravelBuddy/TravelBuddy'));
const MeetupEvents = React.lazy(() => import('../features/Events/MeetupEvents'));
const Wallet = React.lazy(() => import('../features/Wallet/Wallet'));
const CurrencyConverter = React.lazy(() => import('../features/Tools/CurrencyConverter'));
const SocialPassport = React.lazy(() => import('../features/Gamification/SocialPassport'));
const UserProfile = React.lazy(() => import('../features/Profile/UserProfile'));
const SearchPage = React.lazy(() => import('../features/Search/SearchPage'));

// Booking Modals (rendered as pages)
const FlightBooking = React.lazy(() => import('../features/Booking/FlightBooking'));
const StayBooking = React.lazy(() => import('../features/Booking/StayBooking'));
const CarBooking = React.lazy(() => import('../features/Booking/CarBooking'));
const CoworkingBooking = React.lazy(() => import('../features/Coworking/CoworkingBooking'));
const ExperienceDetail = React.lazy(() => import('../features/Experiences/ExperienceDetail'));

const AppRouter: React.FC = () => {
    const { activeTab, flightToBook, stayToBook, carToBook, spaceToBook, selectedExperience } = useUIStore();
    
    // Render booking flows if active
    if (flightToBook) return <FlightBooking />;
    if (stayToBook) return <StayBooking />;
    if (carToBook) return <CarBooking />;
    if (spaceToBook) return <CoworkingBooking />;
    if (selectedExperience) return <ExperienceDetail />;

    const renderActiveTab = () => {
        switch (activeTab) {
            case Tab.Home: return <HomeDashboard />;
            case Tab.FlightTracker: return <FlightTracker />;
            case Tab.Discovery: return <TravelTrendRadar />;
            case Tab.Chat: return <ChatInterface />;
            case Tab.Planner: return <ItineraryPlanner />;
            case Tab.SuperServices: return <SuperServicesHub />;
            case Tab.Coworking: return <CoworkingHub />;
            case Tab.LocalConnections: return <HomeShare />;
            case Tab.MyTrips: return <MyTrips />;
            case Tab.Checklist: return <PackingChecklist />;
            case Tab.GroupPlanning: return <GroupPlanning />;
            case Tab.Wandergram: return <Wandergram />;
            case Tab.TravelBuddy: return <TravelBuddy />;
            case Tab.Events: return <MeetupEvents />;
            case Tab.Wallet: return <Wallet />;
            case Tab.Converter: return <CurrencyConverter />;
            case Tab.Passport: return <SocialPassport />;
            case Tab.Search: return <SearchPage />;
            case Tab.Profile: return <UserProfile />;
            default: return <HomeDashboard />;
        }
    };

    return (
        <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <div className={activeTab !== Tab.Chat ? "p-4" : ""}>
                {renderActiveTab()}
            </div>
        </React.Suspense>
    );
};

export default AppRouter;
