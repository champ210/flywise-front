import React from 'react';
import { useUIStore } from '../stores/useUIStore';

// Lazy load modals since they are not always visible
const SubscriptionModal = React.lazy(() => import('@/components/SubscriptionModal'));
const OnboardingModal = React.lazy(() => import('@/components/OnboardingModal'));
const LoginModal = React.lazy(() => import('@/components/LoginModal'));
const SignUpModal = React.lazy(() => import('@/components/SignUpModal'));
const CreateWandergramPostModal = React.lazy(() => import('@/components/CreateWandergramPostModal'));
const AskAiAboutPhotoModal = React.lazy(() => import('@/components/AskAiAboutPhotoModal'));
const DocumentScannerModal = React.lazy(() => import('@/components/DocumentScannerModal'));
const TranslatorModal = React.lazy(() => import('@/components/TranslatorModal'));
const ExperienceBooking = React.lazy(() => import('@/components/ExperienceBooking'));
const FoodOrderModal = React.lazy(() => import('@/components/FoodOrderModal'));
const RideBookingModal = React.lazy(() => import('@/components/RideBookingModal'));
const HangoutRequestModal = React.lazy(() => import('@/components/HangoutRequestModal'));


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
