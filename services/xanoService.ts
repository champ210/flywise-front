import { SavedTrip, UserProfile as UserProfileType, Flight, Stay, Car, PassengerDetails, BookingConfirmation, StayBookingConfirmation, CarBookingConfirmation } from '../types';

const XANO_BASE_URL = process.env.XANO_BASE_URL;

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
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!XANO_BASE_URL) {
        throw new Error("Xano API URL is not configured. Please set XANO_BASE_URL in your environment.");
    }
    
    const response = await fetch(`${XANO_BASE_URL}${endpoint}`, {
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