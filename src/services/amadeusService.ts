import { Flight, FlightStatus } from '../../types';
import { getCityForIataCode } from '../helpers/flights';

// This is a placeholder for the Amadeus OAuth token
let amadeusToken: { access_token: string; expires_in: number; expiry_date: number } | null = null;

/**
 * NOTE: Amadeus API requires OAuth 2.0 authentication.
 * This function is a placeholder for fetching and caching the access token.
 * You would need to implement the actual POST request to 'https://test.api.amadeus.com/v1/security/oauth2/token'
 * using your API Key and API Secret.
 */
export const getAmadeusToken = async (): Promise<string> => {
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret) {
        console.warn("Amadeus API Key/Secret is missing. Mock data will be used.");
        return 'mock-token-for-development';
    }

    // Return cached token if it's still valid
    if (amadeusToken && amadeusToken.expiry_date > Date.now()) {
        return amadeusToken.access_token;
    }

    // In a real implementation, you would fetch the token here:
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`
    });
    const data = await response.json();
    amadeusToken = { ...data, expiry_date: Date.now() + (data.expires_in * 1000) };
    return amadeusToken.access_token || 'mock-token-for-development';
};


/**
 * Creates mock flight status data for Amadeus.
 * This function is used for development when API keys are not available.
 */
const createMockAmadeusFlightStatus = (flightNumber: string): FlightStatus => ({
    flightNumber: flightNumber,
    status: 'En Route',
    airline: 'Amadeus Airlines (Mock)',
    departure: {
        airport: 'Paris Charles de Gaulle Airport',
        iata: 'CDG',
        city: 'Paris',
        scheduledTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        actualTime: new Date(Date.now() - 1.9 * 3600 * 1000).toISOString(),
        terminal: '2E',
        gate: 'K41',
        latitude: 49.0097,
        longitude: 2.5479,
    },
    arrival: {
        airport: 'John F. Kennedy International Airport',
        iata: 'JFK',
        city: 'New York',
        scheduledTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        actualTime: null,
        terminal: '4',
        gate: 'B25',
        baggageClaim: '7',
        latitude: 40.6413,
        longitude: -73.7781,
    },
    aircraft: {
        type: 'Airbus A380',
        registration: 'A-MOCK',
    },
    live: {
        latitude: 48.8566,
        longitude: -35.6751,
        altitude: 38000,
        speed: 500,
    },
    progressPercent: 45,
    aiSummary: "This is a mock summary from the Amadeus service. The flight appears to be on time and is currently over the Atlantic Ocean.",
    waypoints: [],
});

/**
 * Fetches flight status from the Amadeus API.
 * This is a placeholder and currently returns mock data.
 */
export const getFlightStatus = async (flightNumber: string): Promise<FlightStatus> => {
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret) {
        if (process.env.NODE_ENV === 'development') {
            console.warn("Amadeus API Key/Secret is missing. Returning mock data for development.");
            return createMockAmadeusFlightStatus(flightNumber);
        }
        throw new Error("Application is not configured correctly. Missing Amadeus API credentials.");
    }

    // --- Real API call logic would go here ---
    // 1. Parse flightNumber into carrierCode and flightNum
    // 2. Get today's date in YYYY-MM-DD format
    // 3. const token = await getAmadeusToken();
    // 4. const response = await fetch(`https://test.api.amadeus.com/v2/travel/flight-status?carrierCode=...&flightNumber=...&scheduledDepartureDate=...`, {
    //      headers: { 'Authorization': `Bearer ${token}` }
    //    });
    // 5. const data = await response.json();
    // 6. Map the 'data' object to the 'FlightStatus' type.
    // -----------------------------------------

    // For now, return mock data.
    console.log("Amadeus service called, returning mock data.");
    return createMockAmadeusFlightStatus(flightNumber);
};

export const searchFlightsAmadeus = async ({
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults = 1,
    children = 0,
    travelClass = 'ECONOMY',
}: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    travelClass?: string;
}): Promise<Flight[]> => {
    const token = await getAmadeusToken();

    const params = new URLSearchParams({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults: adults.toString(),
        travelClass,
    });

    if (returnDate) params.append('returnDate', returnDate);
    if (children) params.append('children', children.toString());

    const response = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.errors?.[0]?.detail || 'Amadeus flight search failed');
    }

    const data = await response.json();

    // Map Amadeus response to your Flight[] type
    return (data.data || []).map((offer: any) => ({
        id: offer.id,
        flightNumber: offer.itineraries[0]?.segments[0]?.number || '',
        airline: offer.itineraries[0]?.segments[0]?.carrierCode || '',
        departure: {
            airport: offer.itineraries[0]?.segments[0]?.departure?.iataCode || '',
            city: getCityForIataCode(offer.itineraries[1].segments[0].departure.iataCode), // Amadeus does not provide city directly
            scheduledTime: offer.itineraries[0]?.segments[0]?.departure?.at || '',
        },
        arrival: {
            airport: offer.itineraries[0]?.segments[0]?.arrival?.iataCode || '',
            city: getCityForIataCode(offer.itineraries[1].segments[0].arrival.iataCode), // Amadeus does not provide city directly
            scheduledTime: offer.itineraries[0]?.segments[0]?.arrival?.at || '',
        },
        price: offer.price?.total || '',
        travelClass: travelClass,
        type: 'flight'
        // Add other fields as needed
    }));
};
