import { create } from 'zustand';
import { SearchResult, Flight, Stay, Car, CoworkingSpace, Restaurant, RideOption, LocalProfile, HangoutSuggestion, WandergramPost, TripIdea, Experience } from '@/types';
import { Tab } from '@/navigation/constants';

interface UIState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  results: SearchResult[];
  setResults: (results: SearchResult[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  isMoreMenuOpen: boolean;
  toggleMoreMenu: () => void;
  closeMoreMenu: () => void;

  // Modals
  isVipModalOpen: boolean;
  openVipModal: () => void;
  closeVipModal: () => void;
  
  isOnboardingOpen: boolean;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;

  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  isSignUpModalOpen: boolean;
  openSignUpModal: () => void;
  closeSignUpModal: () => void;

  isCreateWandergramPostModalOpen: boolean;
  openCreateWandergramPostModal: () => void;
  closeCreateWandergramPostModal: () => void;

  isScannerModalOpen: boolean;
  openScannerModal: () => void;
  closeScannerModal: () => void;

  isTranslatorModalOpen: boolean;
  openTranslatorModal: () => void;
  closeTranslatorModal: () => void;

  // Booking / Flow states
  flightToBook: Flight | null;
  setFlightToBook: (flight: Flight | null) => void;

  stayToBook: Stay | null;
  setStayToBook: (stay: Stay | null) => void;
  
  carToBook: Car | null;
  setCarToBook: (car: Car | null) => void;
  
  spaceToBook: CoworkingSpace | null;
  setSpaceToBook: (space: CoworkingSpace | null) => void;

  foodToOrder: Restaurant | null;
  setFoodToOrder: (restaurant: Restaurant | null) => void;

  rideToBook: { ride: RideOption, destination: string } | null;
  setRideToBook: (rideDetails: { ride: RideOption, destination: string } | null) => void;
  
  hangoutRequest: { local: LocalProfile, suggestion: HangoutSuggestion } | null;
  setHangoutRequest: (request: { local: LocalProfile, suggestion: HangoutSuggestion } | null) => void;

  postForAskAi: WandergramPost | null;
  setPostForAskAi: (post: WandergramPost | null) => void;

  selectedExperience: Experience | null;
  setSelectedExperience: (experience: Experience | null) => void;

  experienceToBook: Experience | null;
  setExperienceToBook: (experience: Experience | null) => void;

  // Data passing between components
  chatQuery: string;
  setChatQuery: (query: string) => void;

  plannerData: TripIdea | null;
  setPlannerData: (data: TripIdea | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: Tab.Home,
  setActiveTab: (tab) => set({ activeTab: tab, isMoreMenuOpen: false }),

  results: [],
  setResults: (results) => set({ results, error: null }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error, results: [] }),

  isMoreMenuOpen: false,
  toggleMoreMenu: () => set((state) => ({ isMoreMenuOpen: !state.isMoreMenuOpen })),
  closeMoreMenu: () => set({ isMoreMenuOpen: false }),

  // Modals
  isVipModalOpen: false,
  openVipModal: () => set({ isVipModalOpen: true }),
  closeVipModal: () => set({ isVipModalOpen: false }),

  isOnboardingOpen: false, // Set to true to show onboarding on first load
  openOnboardingModal: () => set({ isOnboardingOpen: true }),
  closeOnboardingModal: () => set({ isOnboardingOpen: false }),

  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true, isSignUpModalOpen: false }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  
  isSignUpModalOpen: false,
  openSignUpModal: () => set({ isSignUpModalOpen: true, isLoginModalOpen: false }),
  closeSignUpModal: () => set({ isSignUpModalOpen: false }),
  
  isCreateWandergramPostModalOpen: false,
  openCreateWandergramPostModal: () => set({ isCreateWandergramPostModalOpen: true }),
  closeCreateWandergramPostModal: () => set({ isCreateWandergramPostModalOpen: false }),

  isScannerModalOpen: false,
  openScannerModal: () => set({ isScannerModalOpen: true }),
  closeScannerModal: () => set({ isScannerModalOpen: false }),

  isTranslatorModalOpen: false,
  openTranslatorModal: () => set({ isTranslatorModalOpen: true }),
  closeTranslatorModal: () => set({ isTranslatorModalOpen: false }),

  // Booking / Flow states
  flightToBook: null,
  setFlightToBook: (flight) => set({ flightToBook: flight }),
  
  stayToBook: null,
  setStayToBook: (stay) => set({ stayToBook: stay }),

  carToBook: null,
  setCarToBook: (car) => set({ carToBook: car }),

  spaceToBook: null,
  setSpaceToBook: (space) => set({ spaceToBook: space }),

  foodToOrder: null,
  setFoodToOrder: (restaurant) => set({ foodToOrder: restaurant }),
  
  rideToBook: null,
  setRideToBook: (rideDetails) => set({ rideToBook: rideDetails }),

  hangoutRequest: null,
  setHangoutRequest: (request) => set({ hangoutRequest: request }),

  postForAskAi: null,
  setPostForAskAi: (post) => set({ postForAskAi: post }),

  selectedExperience: null,
  setSelectedExperience: (experience) => set({ selectedExperience: experience }),

  experienceToBook: null,
  setExperienceToBook: (experience) => set({ experienceToBook: experience }),

  // Data passing
  chatQuery: '',
  setChatQuery: (query) => set({ chatQuery: query, activeTab: Tab.Chat }),

  plannerData: null,
  setPlannerData: (data) => set({ plannerData: data, activeTab: Tab.Planner }),
}));
