import { SavedTrip, UserProfile as UserProfileType, Flight, Stay, Car, PassengerDetails, BookingConfirmation, StayBookingConfirmation, CarBookingConfirmation, WandergramPost, WandergramStory, WandergramConversation, WandergramComment, WandergramChatMessage, Community, MeetupEvent, GroupTrip, Transaction, GamificationProfile, PaymentMethod, Experience } from '../types';

const TOKEN_KEY = 'flywise_auth_token';

// --- Token Management ---

export const getToken = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
        console.error("Could not access localStorage", e);
        return null;
    }
};

const setToken = (token: string) => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
        console.error("Could not access localStorage", e);
    }
};

export const removeToken = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
        console.error("Could not access localStorage", e);
    }
};

// --- API Request Wrapper ---

const apiRequest = async <T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> => {
    const isAuthEndpoint = endpoint.startsWith('/auth/');
    const baseUrl = isAuthEndpoint ? process.env.XANO_AUTH_URL : process.env.XANO_BASE_URL;
    const urlName = isAuthEndpoint ? 'XANO_AUTH_URL' : 'XANO_BASE_URL';

    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!baseUrl || baseUrl.includes("YOUR_XANO")) {
        // Mock API responses for development without a live backend
        console.warn(`${urlName} is not configured in env.ts. Falling back to mock API for endpoint: ${method} ${endpoint}`);
        return mockApi(endpoint, method, body) as Promise<T>;
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json() as Promise<T>;
    }
    // For DELETE requests that might return no content
    return Promise.resolve(undefined as T);
};

// --- Authentication ---

export const login = async (email: string, password: string): Promise<{ authToken: string }> => {
    const data = await apiRequest<{ authToken: string }>('/auth/login', 'POST', { email, password });
    if (data.authToken) {
        setToken(data.authToken);
    }
    return data;
};

export const signup = async (name: string, email: string, password: string): Promise<{ authToken: string }> => {
    const data = await apiRequest<{ authToken: string }>('/auth/signup', 'POST', { name, email, password });
    if (data.authToken) {
        setToken(data.authToken);
    }
    return data;
};

export const logout = () => {
    removeToken();
};

// --- Saved Trips (CRUD) ---

export const getTrips = (): Promise<SavedTrip[]> => {
    return apiRequest<SavedTrip[]>('/trips', 'GET');
};

export const addTrip = (tripData: Omit<SavedTrip, 'id' | 'createdAt'>): Promise<SavedTrip> => {
    return apiRequest<SavedTrip>('/trips', 'POST', tripData);
};

export const deleteTrip = (tripId: string): Promise<void> => {
    return apiRequest<void>(`/trips/${tripId}`, 'DELETE');
};

// --- User Profile ---

export const getProfile = (): Promise<UserProfileType> => {
    return apiRequest<UserProfileType>('/auth/me', 'GET');
};

export const updateProfile = (profile: UserProfileType): Promise<UserProfileType> => {
    return apiRequest<UserProfileType>('/profile', 'POST', profile);
};

// --- Search ---

const buildQueryString = (params: object): string => {
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {} as {[key: string]: any});
    
    return new URLSearchParams(filteredParams).toString();
};

export const searchFlights = (params: any): Promise<Flight[]> => {
    const queryString = buildQueryString(params);
    return apiRequest<Flight[]>(`/flights/search?${queryString}`, 'GET');
};

export const searchStays = (params: any): Promise<Stay[]> => {
    const queryString = buildQueryString(params);
    return apiRequest<Stay[]>(`/stays/search?${queryString}`, 'GET');
};

export const searchCars = (params: any): Promise<Car[]> => {
    const queryString = buildQueryString(params);
    return apiRequest<Car[]>(`/cars/search?${queryString}`, 'GET');
};

// --- Bookings ---

export const bookFlight = (bookingDetails: { flight: Flight, passenger: PassengerDetails }): Promise<BookingConfirmation> => {
    return apiRequest<BookingConfirmation>('/bookings/flight', 'POST', bookingDetails);
};

export const bookStay = (bookingDetails: { stay: Stay, guest: PassengerDetails }): Promise<StayBookingConfirmation> => {
    return apiRequest<StayBookingConfirmation>('/bookings/stay', 'POST', bookingDetails);
};

export const bookCar = (bookingDetails: { car: Car, driver: PassengerDetails }): Promise<CarBookingConfirmation> => {
    return apiRequest<CarBookingConfirmation>('/bookings/car', 'POST', bookingDetails);
};

// --- Wandergram ---
export const getWandergramFeed = (): Promise<WandergramPost[]> => apiRequest('/wandergram/feed', 'GET');
export const getWandergramStories = (): Promise<WandergramStory[]> => apiRequest('/wandergram/stories', 'GET');
export const getWandergramConversations = (): Promise<WandergramConversation[]> => apiRequest('/wandergram/conversations', 'GET');
export const createWandergramPost = (postData: { imageUrl: string, caption: string, location?: string }): Promise<WandergramPost> => apiRequest('/wandergram/posts', 'POST', postData);
export const addWandergramComment = (postId: string, text: string): Promise<WandergramComment> => apiRequest(`/wandergram/posts/${postId}/comments`, 'POST', { text });
export const sendWandergramMessage = (conversationId: string, text: string): Promise<WandergramChatMessage> => apiRequest(`/wandergram/conversations/${conversationId}/messages`, 'POST', { text });
export const likeWandergramPost = (postId: string): Promise<{ likes: number }> => apiRequest(`/wandergram/posts/${postId}/like`, 'POST');
export const saveWandergramPost = (postId: string): Promise<void> => apiRequest(`/wandergram/posts/${postId}/save`, 'POST');

// --- Social Features ---
export const getCommunities = (): Promise<Community[]> => apiRequest('/communities', 'GET');
export const createCommunity = (communityData: Omit<Community, 'id' | 'memberCount' | 'posts' | 'questions'>): Promise<Community> => apiRequest('/communities', 'POST', communityData);
export const getEvents = (): Promise<MeetupEvent[]> => apiRequest('/events', 'GET');
export const createEvent = (eventData: Omit<MeetupEvent, 'id' | 'organizer' | 'attendees'>): Promise<MeetupEvent> => apiRequest('/events', 'POST', eventData);
export const getGroupTrips = (): Promise<GroupTrip[]> => apiRequest('/group_trips', 'GET');
export const createGroupTrip = (tripData: Omit<GroupTrip, 'id' | 'members' | 'itinerary' | 'tasks' | 'polls' | 'expenses'>): Promise<GroupTrip> => apiRequest('/group_trips', 'POST', tripData);

// --- Wallet & Gamification ---
export const getWalletTransactions = (): Promise<Transaction[]> => apiRequest('/wallet/transactions', 'GET');
export const earnPoints = (points: number, badgeId?: string): Promise<GamificationProfile> => apiRequest('/gamification/earn', 'POST', { points, badgeId });
export const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => apiRequest('/wallet/payment_methods', 'POST', method);
export const deletePaymentMethod = (methodId: string): Promise<void> => apiRequest(`/wallet/payment_methods/${methodId}`, 'DELETE');
export const setPrimaryPaymentMethod = (methodId: string): Promise<void> => apiRequest(`/wallet/payment_methods/${methodId}/set_primary`, 'POST');

// --- Local Experiences ---
export const getExperiences = (): Promise<Experience[]> => apiRequest('/experiences', 'GET');
export const bookExperience = (bookingDetails: { experienceId: string, date: string, guests: number }): Promise<{ bookingId: string }> => apiRequest('/experiences/book', 'POST', bookingDetails);


// --- Mock API for Development ---
let mockPaymentMethods: PaymentMethod[] = [
    { id: 'pm_1', type: 'card', last4: '4242', expiry: '12/25', brand: 'visa', isPrimary: true },
    { id: 'pm_2', type: 'paypal', email: 'traveler@example.com', isPrimary: false },
];

let mockCommunities: Community[] = [
    { id: 'c1', name: 'Solo Travelers in Southeast Asia', description: 'A community for solo travelers to share tips, find buddies, and ask questions about traveling through Southeast Asia.', coverImageUrl: 'https://images.unsplash.com/photo-1532924847321-124b5b4825ce?q=80&w=800&auto=format&fit=crop', memberCount: 12500, type: 'public', category: 'destination', posts: [], questions: [] },
    { id: 'c2', name: 'Digital Nomads Hub', description: 'Connect with fellow digital nomads. Share the best coworking spots, visa tips, and productivity hacks.', coverImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c7da?q=80&w=800&auto=format&fit=crop', memberCount: 8200, type: 'public', category: 'interest', posts: [], questions: [] },
];

let mockEvents: MeetupEvent[] = [
    { id: 'e1', title: 'Food Tour in Rome', description: 'Join us for a delicious tour of Rome\'s best street food spots!', date: new Date(Date.now() + 7 * 86400000).toISOString(), location: { name: 'Campo de\' Fiori, Rome', lat: 41.8954, lng: 12.4723 }, organizer: { id: 'u2', name: 'Maria Rossi', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', role: 'admin' }, attendees: [], coverImageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=800&auto=format&fit=crop', category: 'Food Tour' },
];

let mockGroupTrips: GroupTrip[] = [
    { id: 'gt1', name: 'Hiking in the Swiss Alps', destination: 'Interlaken, Switzerland', coverImageUrl: 'https://images.unsplash.com/photo-1534334358797-5b6d616d5069?q=80&w=800&auto=format&fit=crop', startDate: '2024-08-10', endDate: '2024-08-17', members: [{ id: 'u1', name: 'You', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', role: 'admin' }], itinerary: [], tasks: [], polls: [], expenses: [] },
];
const mockCurrentUser = { id: 'u1', name: 'You', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', role: 'admin' as const };

const mockExperiences: Experience[] = [
    {
      id: 'exp1',
      title: 'Traditional Tagine Cooking Class in Marrakech',
      description: 'Learn the secrets of authentic Moroccan tagine from a local family in their traditional riad. You will visit a local market to buy fresh ingredients, learn to prepare a classic chicken and lemon tagine, and enjoy your delicious creation for dinner.',
      category: 'Food',
      location: 'Marrakech, Morocco',
      images: ['https://images.unsplash.com/photo-1554118875-72d62c502b40?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1541592106381-b586a6a2d20d?q=80&w=800&auto=format&fit=crop'],
      price: 45,
      duration: '4 hours',
      groupSize: { min: 2, max: 8 },
      languages: ['Arabic', 'French', 'English'],
      host: { id: 'h1', name: 'Fatima', avatarUrl: 'https://images.unsplash.com/photo-1567108149818-a62d04a806d2?q=80&w=200&auto=format&fit=crop', bio: 'I am a passionate cook who loves to share the flavors of my culture with travelers from all over the world.' },
      availability: { '2024-08-10': 8, '2024-08-11': 6 },
      reviews: [{ id: 'r1', user: { name: 'Jane Doe', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' }, rating: 5, comment: 'The best experience I had in Morocco! Fatima is a wonderful teacher.', createdAt: new Date().toISOString() }],
      rating: 5,
    },
    {
      id: 'exp2',
      title: 'Sahara Desert Overnight Trip from Merzouga',
      description: 'Experience the magic of the Sahara with a camel trek into the dunes of Erg Chebbi. Watch the sunset over the desert, enjoy a traditional Berber dinner under the stars, and spend the night in a comfortable desert camp.',
      category: 'Adventure',
      location: 'Merzouga, Morocco',
      images: ['https://images.unsplash.com/photo-1523928138246-b634591f893d?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1558294689-3224a523a635?q=80&w=800&auto=format&fit=crop'],
      price: 120,
      duration: 'Overnight',
      groupSize: { min: 1, max: 12 },
      languages: ['English', 'Spanish', 'French'],
      host: { id: 'h2', name: 'Hassan', avatarUrl: 'https://images.unsplash.com/photo-1601633543954-2a62863777c5?q=80&w=200&auto=format&fit=crop', bio: 'I was born in the desert and have been guiding travelers for over 15 years. Let me show you the real Sahara.' },
      availability: { '2024-08-12': 10, '2024-08-13': 12 },
      reviews: [{ id: 'r2', user: { name: 'John Smith', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }, rating: 4.8, comment: 'An unforgettable adventure. The night sky was breathtaking.', createdAt: new Date().toISOString() }],
      rating: 4.8,
    },
];

const mockApi = (endpoint: string, method: string, body: any): Promise<any> => {
    console.log(`Mocking API call to ${endpoint}`);
    // Authentication
    if (endpoint.startsWith('/auth/login')) return Promise.resolve({ authToken: 'mock_token' });
    if (endpoint.startsWith('/auth/signup')) return Promise.resolve({ authToken: 'mock_token' });
    if (endpoint.startsWith('/auth/me')) return Promise.resolve({
        preferredAirlines: 'Emirates, Qatar',
        minHotelStars: 4,
        preferredCarTypes: ['SUV'],
        favoriteDestinations: ['Kyoto, Japan', 'Bali, Indonesia'],
        interests: ['Hiking', 'Local Food', 'Photography'],
        budget: { flightMaxPrice: 1500, hotelMaxPrice: 300, carMaxPrice: 75 },
        paymentMethods: mockPaymentMethods,
        gamificationProfile: {
            flyWisePoints: 1250,
            earnedBadgeIds: ['first-booking', 'story-writer'],
            collectedStamps: [{ country: 'Japan', city: 'Kyoto', date: '2024-05-10', crestUrl: 'https://cdn.jsdelivr.net/gh/gist/corrinachow/997463283362a22591e55e0d4942c751/raw/japan-stamp.svg' }],
        }
    });

    // Search
    if (endpoint.startsWith('/flights/search')) {
        const params = new URLSearchParams(endpoint.split('?')[1]);
        const flights: Flight[] = [
            {
                type: 'flight',
                airline: 'Emirates',
                flightNumber: 'EK204',
                departureAirport: params.get('originLocationCode') || 'JFK',
                arrivalAirport: params.get('destinationLocationCode') || 'DXB',
                departureTime: '08:30 AM',
                arrivalTime: '05:00 PM',
                duration: '13h 30m',
                price: 1250,
                stops: 1,
                layovers: ['LHR'],
                provider: 'XanoAir',
                affiliateLink: '#',
                rankingReason: "Best balance of price and duration.",
                fareRules: "TICKET IS NON-REFUNDABLE. CHANGES PERMITTED WITH A FEE OF USD 250 PLUS FARE DIFFERENCE. CANCELLATION RESULTS IN FORFEITURE OF TICKET VALUE."
            },
            {
                type: 'flight',
                airline: 'Qatar Airways',
                flightNumber: 'QR702',
                departureAirport: params.get('originLocationCode') || 'JFK',
                arrivalAirport: params.get('destinationLocationCode') || 'DXB',
                departureTime: '10:00 AM',
                arrivalTime: '07:15 PM',
                duration: '14h 15m',
                price: 1180,
                stops: 1,
                layovers: ['DOH'],
                provider: 'XanoAir',
                affiliateLink: '#',
                pricePrediction: { recommendation: 'Buy Now', reason: 'Prices likely to increase.' },
                fareRules: "ECONOMY LITE: TICKET IS NON-REFUNDABLE. NO CHANGES PERMITTED. CARRY-ON ONLY."
            },
            {
                type: 'flight',
                airline: 'Lufthansa',
                flightNumber: 'LH401',
                departureAirport: params.get('originLocationCode') || 'JFK',
                arrivalAirport: params.get('destinationLocationCode') || 'DXB',
                departureTime: '04:00 PM',
                arrivalTime: '01:30 PM +1',
                duration: '16h 30m',
                price: 1450,
                stops: 1,
                layovers: ['FRA'],
                provider: 'XanoAir',
                affiliateLink: '#',
                negotiationTip: "Ask for a complimentary upgrade if the flight isn't full.",
                fareRules: "FLEX TICKET: FULLY REFUNDABLE UP TO 24 HOURS BEFORE DEPARTURE. CHANGES PERMITTED FREE OF CHARGE, FARE DIFFERENCE MAY APPLY."
            }
        ];
        return Promise.resolve(flights);
    }

    // Wandergram
    if (endpoint.startsWith('/wandergram/feed')) return Promise.resolve([
        { id: 'wg1', user: { name: 'Elena Petrova', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760c0337?q=80&w=800&auto=format&fit=crop', caption: 'Paris is always a good idea. 🥐☕️', location: 'Paris, France', likes: 1204, comments: [], createdAt: new Date().toISOString() },
        { id: 'wg2', user: { name: 'Marcus Holloway', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }, imageUrl: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop', caption: 'Tokyo nights hit different. 🌃', location: 'Shibuya City, Tokyo', likes: 2543, comments: [], createdAt: new Date(Date.now() - 86400000).toISOString() },
    ]);
    if (endpoint.startsWith('/wandergram/stories')) return Promise.resolve([
        { id: 's1', user: { name: 'Elena Petrova', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }, imageUrl: '', viewed: false },
        { id: 's2', user: { name: 'Marcus Holloway', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }, imageUrl: '', viewed: true },
    ]);
    if (endpoint.startsWith('/wandergram/posts') && method === 'POST') {
        return Promise.resolve({
            id: `wg${Date.now()}`,
            user: { name: 'Valued Member', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop'},
            likes: 0,
            comments: [],
            createdAt: new Date().toISOString(),
            ...body
        });
    }
     if (endpoint.includes('/comments') && method === 'POST') {
        return Promise.resolve({
            id: `wgc${Date.now()}`,
            user: { name: 'Valued Member', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
            text: body.text,
            createdAt: new Date().toISOString(),
        });
    }
    
    // Social
    if (endpoint.startsWith('/communities') && method === 'GET') return Promise.resolve(mockCommunities);
    if (endpoint.startsWith('/communities') && method === 'POST') {
        const newCommunity = { ...body, id: `c${Date.now()}`, memberCount: 1, posts: [], questions: [] };
        mockCommunities.unshift(newCommunity);
        return Promise.resolve(newCommunity);
    }
    if (endpoint.startsWith('/events') && method === 'GET') return Promise.resolve(mockEvents);
    if (endpoint.startsWith('/events') && method === 'POST') {
        const newEvent = { ...body, id: `e${Date.now()}`, organizer: mockCurrentUser, attendees: [] };
        mockEvents.unshift(newEvent);
        return Promise.resolve(newEvent);
    }
    if (endpoint.startsWith('/group_trips') && method === 'GET') return Promise.resolve(mockGroupTrips);
    if (endpoint.startsWith('/group_trips') && method === 'POST') {
        const newTrip = { ...body, id: `gt${Date.now()}`, members: [mockCurrentUser], itinerary: [], tasks: [], polls: [], expenses: [] };
        mockGroupTrips.unshift(newTrip);
        return Promise.resolve(newTrip);
    }
    
    // Wallet
    if (endpoint.startsWith('/wallet/transactions')) return Promise.resolve([
        { id: 'tx1', description: 'Flight Booking EK203', date: '2024-07-15T10:00:00Z', amount: 1250.75, type: 'debit' },
        { id: 'tx2', description: 'Points Earned: First Booking', date: '2024-07-15T10:01:00Z', amount: 100, type: 'credit' },
        { id: 'tx3', description: 'Hotel Stay: The Grand Plaza', date: '2024-07-10T14:30:00Z', amount: 450.00, type: 'debit' },
    ]);
    
    if (endpoint.startsWith('/wallet/payment_methods') && method === 'POST') {
        const newMethod: PaymentMethod = {
            id: `pm_${Date.now()}`,
            ...body,
        };
        mockPaymentMethods.push(newMethod);
        return Promise.resolve(newMethod);
    }

    if (endpoint.startsWith('/wallet/payment_methods/') && endpoint.endsWith('/set_primary')) {
        const id = endpoint.split('/')[3];
        mockPaymentMethods = mockPaymentMethods.map(pm => ({
            ...pm,
            isPrimary: pm.id === id,
        }));
        return Promise.resolve();
    }

    if (endpoint.startsWith('/wallet/payment_methods/') && method === 'DELETE') {
        const id = endpoint.split('/').pop();
        mockPaymentMethods = mockPaymentMethods.filter(pm => pm.id !== id);
        return Promise.resolve();
    }

    // Experiences
    if (endpoint.startsWith('/experiences') && method === 'GET') {
        return Promise.resolve(mockExperiences);
    }

    if (endpoint.startsWith('/experiences/book') && method === 'POST') {
        return Promise.resolve({ bookingId: `exp_bk_${Date.now()}` });
    }


    // Default mock response
    return Promise.resolve([]);
};