import { create } from 'zustand';
import { UserProfile, GamificationProfile, Transaction, PaymentMethod } from '@/types';
import * as xanoService from '@/services/xanoService';

export type Language = 'en' | 'fr' | 'ar';

const DEFAULT_GAMIFICATION_PROFILE: GamificationProfile = {
  flyWisePoints: 0,
  earnedBadgeIds: [],
  collectedStamps: [],
};

const DEFAULT_USER_PROFILE: UserProfile = {
  preferredAirlines: '',
  minHotelStars: 0,
  preferredCarTypes: [],
  favoriteDestinations: [],
  interests: [],
  budget: { flightMaxPrice: 0, hotelMaxPrice: 0, carMaxPrice: 0 },
  gamificationProfile: DEFAULT_GAMIFICATION_PROFILE,
  paymentMethods: [],
};

interface AuthState {
  isLoggedIn: boolean;
  userProfile: UserProfile;
  gamificationProfile: GamificationProfile;
  walletTransactions: Transaction[];
  language: Language;
  isOffline: boolean;
  
  setLoggedIn: (status: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;

  fetchProfile: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  earnPoints: (points: number, badgeId?: string) => Promise<void>;

  setLanguage: (lang: Language) => void;
  
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  deletePaymentMethod: (methodId: string) => Promise<void>;
  setPrimaryPaymentMethod: (methodId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  userProfile: DEFAULT_USER_PROFILE,
  gamificationProfile: DEFAULT_GAMIFICATION_PROFILE,
  walletTransactions: [],
  language: 'en',
  isOffline: !navigator.onLine,
  
  setLoggedIn: (status) => set({ isLoggedIn: status }),

  login: async (email, password) => {
    await xanoService.login(email, password);
    set({ isLoggedIn: true });
    await get().fetchProfile();
  },

  logout: () => {
    xanoService.logout();
    set({
      isLoggedIn: false,
      userProfile: DEFAULT_USER_PROFILE,
      gamificationProfile: DEFAULT_GAMIFICATION_PROFILE,
      walletTransactions: []
    });
  },

  signup: async (name, email, password) => {
    await xanoService.signup(name, email, password);
    set({ isLoggedIn: true });
    await get().fetchProfile();
  },

  fetchProfile: async () => {
    if (get().isLoggedIn) {
      const profile = await xanoService.getProfile();
      set({ 
        userProfile: profile, 
        gamificationProfile: profile.gamificationProfile || DEFAULT_GAMIFICATION_PROFILE 
      });
    }
  },

  saveProfile: async (profile) => {
    const updatedProfile = await xanoService.updateProfile(profile);
    set({ userProfile: updatedProfile });
  },

  earnPoints: async (points, badgeId) => {
    const updatedGamificationProfile = await xanoService.earnPoints(points, badgeId);
    set({ gamificationProfile: updatedGamificationProfile });
  },

  setLanguage: (lang) => set({ language: lang }),
  
  addPaymentMethod: async (method) => {
    await xanoService.addPaymentMethod(method);
    await get().fetchProfile();
  },

  deletePaymentMethod: async (methodId) => {
    await xanoService.deletePaymentMethod(methodId);
    await get().fetchProfile();
  },
  
  setPrimaryPaymentMethod: async (methodId) => {
    await xanoService.setPrimaryPaymentMethod(methodId);
    await get().fetchProfile();
  },
}));

// Listen to online/offline status
window.addEventListener('online', () => useAuthStore.setState({ isOffline: false }));
window.addEventListener('offline', () => useAuthStore.setState({ isOffline: true }));
