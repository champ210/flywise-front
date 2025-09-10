import { FlightStatus } from '../../types';

// Define interfaces for the expected API response structure from Aviation Stack
interface AviationStackFlightResponse {
    pagination: {
        limit: number;
        offset: number;
        count: number;
        total: number;
    };
    data: AviationStackFlightData[];
}

interface AviationStackFlightData {
    flight_date: string;
    flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted';
    departure: {
        airport: string;
        iata: string;
        scheduled: string;
        actual: string | null;
        timezone: string;
        terminal: string | null;
        gate: string | null;
        delay: number | null;
    };
    arrival: {
        airport: string;
        iata: string;
        scheduled: string;
        actual: string | null;
        timezone: string;
        terminal: string | null;
        gate: string | null;
        baggage: string | null;
        delay: number | null;
    };
    airline: {
        name: string;
    };
    flight: {
        number: string;
        iata: string;
    };
    aircraft?: {
        registration: string;
        iata: string;
    };
    live?: {
        latitude: number;
        longitude: number;
        altitude: number;
        speed_horizontal: number;
        is_ground: boolean;
    };
}

/**
 * Maps Aviation Stack flight status to internal FlightStatus status.
 */
const mapAviationStackStatusToInternal = (status: AviationStackFlightData['flight_status']): FlightStatus['status'] => {
    switch (status) {
        case 'scheduled':
            return 'Scheduled';
        case 'active':
            return 'En Route';
        case 'landed':
            return 'Landed';
        case 'cancelled':
            return 'Cancelled';
        case 'incident':
        case 'diverted':
            return 'Delayed';
        default:
            return 'Scheduled';
    }
};

/**
 * Maps the response from Aviation Stack API to our internal FlightStatus type.
 */
const mapToFlightStatus = (flightData: AviationStackFlightData): FlightStatus => {
    // Placeholder for city extraction from airport name if needed
    const getCityFromAirport = (airport: string) => airport.split('(')[0].split('-')[0].trim();

    // AviationStack altitude is in meters, speed is in km/h.
    // Internal FlightStatus expects feet and knots.
    const altitudeInFeet = flightData.live ? flightData.live.altitude * 3.28084 : 0;
    const speedInKnots = flightData.live ? flightData.live.speed_horizontal * 0.539957 : 0;

    // A simple progress calculation based on time. A real implementation would be more complex.
    const scheduledDeparture = new Date(flightData.departure.scheduled).getTime();
    const scheduledArrival = new Date(flightData.arrival.scheduled).getTime();
    const now = new Date().getTime();
    const progress = flightData.flight_status === 'landed' ? 100
        : flightData.flight_status === 'active' && scheduledArrival > scheduledDeparture
        ? Math.min(100, Math.max(0, ((now - scheduledDeparture) / (scheduledArrival - scheduledDeparture)) * 100))
        : 0;

    return {
        flightNumber: flightData.flight.iata,
        status: mapAviationStackStatusToInternal(flightData.flight_status),
        airline: flightData.airline.name,
        departure: {
            airport: flightData.departure.airport,
            iata: flightData.departure.iata,
            city: getCityFromAirport(flightData.departure.airport),
            scheduledTime: flightData.departure.scheduled,
            actualTime: flightData.departure.actual,
            terminal: flightData.departure.terminal,
            gate: flightData.departure.gate,
            latitude: 0, // Placeholder: AviationStack free tier doesn't provide airport geo data
            longitude: 0, // Placeholder: AviationStack free tier doesn't provide airport geo data
        },
        arrival: {
            airport: flightData.arrival.airport,
            iata: flightData.arrival.iata,
            city: getCityFromAirport(flightData.arrival.airport),
            scheduledTime: flightData.arrival.scheduled,
            actualTime: flightData.arrival.actual,
            terminal: flightData.arrival.terminal,
            gate: flightData.arrival.gate,
            baggageClaim: flightData.arrival.baggage,
            latitude: 0, // Placeholder
            longitude: 0, // Placeholder
        },
        aircraft: {
            type: flightData.aircraft?.iata ?? 'Unknown',
            registration: flightData.aircraft?.registration ?? null,
        },
        live: flightData.live && !flightData.live.is_ground ? {
            latitude: flightData.live.latitude,
            longitude: flightData.live.longitude,
            altitude: altitudeInFeet,
            speed: speedInKnots,
        } : null,
        progressPercent: progress,
        aiSummary: "Real-time AI summary is not available from this data source. Please use the AI-powered tracker for a summary.",
        waypoints: [], // AviationStack free tier doesn't provide waypoints
    };
};

// Mock flight data for development mode
const createMockFlightData = (flightIata: string): AviationStackFlightData => ({
    flight_date: new Date().toISOString().split('T')[0],
    flight_status: 'scheduled',
    departure: {
        airport: 'Mock Departure Airport',
        iata: 'MDP',
        scheduled: new Date(Date.now() + 3600000).toISOString(),
        actual: null,
        timezone: 'UTC',
        terminal: '1',
        gate: 'A1',
        delay: null,
    },
    arrival: {
        airport: 'Mock Arrival Airport',
        iata: 'MAA',
        scheduled: new Date(Date.now() + 7200000).toISOString(),
        actual: null,
        timezone: 'UTC',
        terminal: '2',
        gate: 'B2',
        baggage: null,
        delay: null,
    },
    airline: {
        name: 'Mock Airline',
    },
    flight: {
        number: '1234',
        iata: flightIata,
    },
    aircraft: {
        registration: 'MOCK123',
        iata: 'A320',
    },
    live: undefined,
});

export const getFlightStatus = async (flightIata: string): Promise<FlightStatus> => {
    const accessKey = process.env.AVIATION_STACK_API_KEY;

    if (!accessKey) {
        // For a better developer experience, return mock data in dev mode if the key is missing.
        if (process.env.NODE_ENV === 'development') {
            console.warn("Aviation Stack API key is missing. Returning mock data for development. Create a .env file with AVIATION_STACK_API_KEY to use the real API.");
            return { ...mapToFlightStatus(createMockFlightData(flightIata)), flightNumber: flightIata };
        }
        throw new Error("Application is not configured correctly. Missing API key.");
    }
    // console.log({ env: import.meta.env });
    const response = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${accessKey}&flight_iata=${flightIata}`);

    if (!response.ok) {
        throw new Error('Failed to fetch flight status from Aviation Stack.');
    }

    const data: AviationStackFlightResponse = await response.json();

    if (data.data.length === 0) {
        throw new Error(`No flight information found for flight number ${flightIata}. It may be inactive or the number is incorrect.`);
    }

    // The API can return multiple flights (e.g., for different days). We'll take the first one.
    return mapToFlightStatus(data.data[0]);
};

export const getExampleFlightNumbers = async (): Promise<string[]> => {
    const accessKey = process.env.AVIATION_STACK_API_KEY;
    const mockFlights = ['UAL123', 'AAL456', 'DAL789', 'SWA101', 'JBU112', 'ASA131', 'FFT415', 'NKS161', 'VOI181', 'WJA192'];

    if (!accessKey) {
        if (process.env.NODE_ENV === 'development') {
            console.warn("Aviation Stack API key is missing. Returning mock flight numbers for development.");
            return mockFlights;
        }
        throw new Error("Application is not configured correctly. Missing API key for flight data.");
    }

    try {
        const response = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${accessKey}&limit=10&flight_status=scheduled`);

        if (!response.ok) {
            console.error('Failed to fetch recent flights from Aviation Stack, returning mock data as fallback.');
            return mockFlights;
        }

        const data: AviationStackFlightResponse = await response.json();

        if (!data.data || data.data.length === 0) {
            console.warn('Aviation Stack returned no flights, returning mock data as fallback.');
            return mockFlights;
        }

        return data.data.map(flight => flight.flight.iata).filter((iata): iata is string => !!iata);
    } catch (error) {
        console.error('Error fetching example flight numbers:', error);
        return mockFlights; // Fallback on any error
    }
};
