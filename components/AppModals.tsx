import React from 'react';
import { useUIStore } from '../stores/useUIStore';

// Lazy load modals since they are not always visible
const SubscriptionModal = React.lazy(() => import('../features/Subscription/SubscriptionModal'));
const OnboardingModal = React.lazy(() => import('../features/Onboarding/OnboardingModal'));
const LoginModal = React.lazy(() => import('../features/Auth/LoginModal'));
const SignUpModal = React.lazy(() => import('../features/Auth/SignUpModal'));
const CreateWandergramPostModal = React.lazy(() => import('../features/Wandergram/CreateWandergramPostModal'));
const AskAiAboutPhotoModal = React.lazy(() => import('../features/Wandergram/AskAiAboutPhotoModal'));
const DocumentScannerModal = React.lazy(() => import('../features/InTrip/DocumentScannerModal'));
const TranslatorModal = React.lazy(() => import('../features/InTrip/TranslatorModal'));
const ExperienceBooking = React.lazy(() => import('../features/Experiences/ExperienceBooking'));
const FoodOrderModal = React.lazy(() => import('../features/SuperServices/components/FoodOrderModal'));
const RideBookingModal = React.lazy(() => import('../features/SuperServices/components/RideBookingModal'));
const HangoutRequestModal = React.lazy(() => import('../features/LocalConnections/components/HangoutRequestModal'));


const AppModals: React.FC = () => {
    const {
        isVipModalOpen,
        isOnboardingOpen,
        isLoginModalOpen,
        isSignUpModalOpen,
        isCreateWandergramPostModalOpen,
        postForAskAi,
        isScannerModalOpen,
        isTranslatorModalOpen,
        experienceToBook,
        foodToOrder,
        rideToBook,
        hangoutRequest
    } = useUIStore();
    
    // We only render one modal at a time, but this structure makes it easy to add more.
    // The store logic ensures only one is open at once.
    return (
        <React.Suspense fallback={null}>
            {isVipModalOpen && <SubscriptionModal />}
            {isOnboardingOpen && <OnboardingModal />}
            {isLoginModalOpen && <LoginModal />}
            {isSignUpModalOpen && <SignUpModal />}
            {isCreateWandergramPostModalOpen && <CreateWandergramPostModal />}
            {postForAskAi && <AskAiAboutPhotoModal />}
            {isScannerModalOpen && <DocumentScannerModal />}
            {isTranslatorModalOpen && <TranslatorModal />}
            {experienceToBook && <ExperienceBooking />}
            {foodToOrder && <FoodOrderModal />}
            {rideToBook && <RideBookingModal />}
            {hangoutRequest && <HangoutRequestModal />}
        </React.Suspense>
    );
};

export default AppModals;
