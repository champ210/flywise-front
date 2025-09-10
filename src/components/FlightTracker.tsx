import React, { useState, useEffect } from 'react';
import { FlightStatus } from '../../types';
import { getFlightStatus as getAviationStackStatus, getExampleFlightNumbers } from '../services/aviationStackService';
import { getFlightStatus as getAmadeusStatus } from '../services/amadeusService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import FlightStatusCard from './FlightStatusCard';

const FlightTracker: React.FC = () => {
    const [flightNumber, setFlightNumber] = useState('');
    const [exampleFlights, setExampleFlights] = useState<string[]>([]);
    const [status, setStatus] = useState<FlightStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aviationStatus, setAviationStatus] = useState<FlightStatus | null>(null);
    const [isAviationLoading, setIsAviationLoading] = useState(false);
    const [aviationError, setAviationError] = useState<string | null>(null);
    const [amadeusStatus, setAmadeusStatus] = useState<FlightStatus | null>(null);
    const [isAmadeusLoading, setIsAmadeusLoading] = useState(false);
    const [amadeusError, setAmadeusError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExamples = async () => {
            try {
                const flights = await getExampleFlightNumbers();
                setExampleFlights(flights);
            } catch (err) {
                console.error("Could not fetch example flight numbers:", err);
                // Optionally set an error state for the user
            }
        };
        fetchExamples();
    }, []);

    const handleExampleClick = (exampleFlight: string) => {
        setFlightNumber(exampleFlight);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!flightNumber.trim()) {
            setError("Please enter a flight number.");
            setAviationError("Please enter a flight number.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setStatus(null);
        try {
            const result = await getAviationStackStatus(flightNumber.trim().toUpperCase());
            setStatus(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
        // Reset states
        setIsAviationLoading(true);
        setIsAmadeusLoading(true);
        setAviationError(null);
        setAmadeusError(null);
        setAviationStatus(null);
        setAmadeusStatus(null);

        const upperCaseFlightNumber = flightNumber.trim().toUpperCase();

        const [amadeusResult, aviationStackResult] = await Promise.allSettled([
            getAmadeusStatus(upperCaseFlightNumber),
            getAviationStackStatus(upperCaseFlightNumber)
        ]);

        if (amadeusResult.status === 'fulfilled') {
            setAmadeusStatus(amadeusResult.value);
        } else {
            setAmadeusError(amadeusResult.reason instanceof Error ? amadeusResult.reason.message : "An unknown error occurred from Amadeus.");
        }
        setIsAmadeusLoading(false);

        if (aviationStackResult.status === 'fulfilled') {
            setAviationStatus(aviationStackResult.value);
        } else {
            setAviationError(aviationStackResult.reason instanceof Error ? aviationStackResult.reason.message : "An unknown error occurred from AviationStack.");
        }
        setIsAviationLoading(false);
    };
    
    return (
        <div className="max-w-4xl mx-auto p-2 sm:p-4">
            <div className="text-center">
                <Icon name="send" className="h-12 w-12 text-blue-600 mx-auto" />
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Real-Time Flight Tracker</h2>
                <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
                    Enter a flight number to get live status, gate information, and a map view of its journey.
                </p>
            </div>

            <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        placeholder="e.g., EK203, UA1234"
                        className="flex-1 block w-full rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-lg p-3 uppercase placeholder:normal-case disabled:bg-slate-50"
                        disabled={isAviationLoading || isAmadeusLoading}
                    />
                    <button
                        type="submit"
                        disabled={isAviationLoading || isAmadeusLoading || !flightNumber.trim()}
                        className="inline-flex items-center justify-center h-12 w-32 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Track Flight'}
                        {(isAviationLoading || isAmadeusLoading) ? <LoadingSpinner /> : 'Track Flight'}
                    </button>
                </div>
            </form>

            {exampleFlights.length > 0 && (
                <div className="max-w-lg mx-auto mt-4 text-center">
                    <p className="text-sm text-slate-500">Or try one of these scheduled flights:</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {exampleFlights.map(flight => (
                            <button
                                key={flight}
                                type="button"
                                onClick={() => handleExampleClick(flight)}
                                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            >
                                {flight}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-8">
                {(isAmadeusLoading || isAviationLoading) && !amadeusStatus && !aviationStatus && (
                    <div className="flex justify-center items-center p-10">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-600">Fetching flight data from multiple sources...</span>
                    </div>
                )}

                {amadeusError && (
                    <div className="text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
                        <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
                        <h3 className="mt-4 text-lg font-semibold text-red-800">Amadeus API Error</h3>
                        <p className="mt-2 text-sm text-red-600">{amadeusError}</p>
                    </div>
                )}

                {amadeusStatus && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Amadeus Flight Status</h3>
                        <FlightStatusCard status={amadeusStatus} />
                    </div>
                )}

                {aviationError && (
                    <div className="text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
                        <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
                        <h3 className="mt-4 text-lg font-semibold text-red-800">Could Not Track Flight</h3>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <h3 className="mt-4 text-lg font-semibold text-red-800">AviationStack API Error</h3>
                        <p className="mt-2 text-sm text-red-600">{aviationError}</p>
                    </div>
                )}

                {aviationStatus && (
                    <FlightStatusCard status={aviationStatus} />
                )}
            </div>
        </div>
    );
};

export default FlightTracker;
