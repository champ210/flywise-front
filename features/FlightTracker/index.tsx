import React, { useState, useEffect } from 'react';
import { FlightStatus } from '@/types';
import { getFlightStatus } from '@/services/geminiService';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FlightStatusCard from './FlightStatusCard';

interface FlightTrackerProps {
    initialFlightNumber?: string;
}

const FlightTracker: React.FC<FlightTrackerProps> = ({ initialFlightNumber }) => {
    const [flightNumber, setFlightNumber] = useState(initialFlightNumber || '');
    const [status, setStatus] = useState<FlightStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!flightNumber.trim()) {
            setError("Please enter a flight number.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setStatus(null);
        try {
            const result = await getFlightStatus(flightNumber.trim().toUpperCase());
            setStatus(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialFlightNumber) {
            setFlightNumber(initialFlightNumber);
            handleSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialFlightNumber]);
    
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
                        className="flex-1 block w-full rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-lg p-3 uppercase placeholder:normal-case"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !flightNumber.trim()}
                        className="inline-flex items-center justify-center h-12 w-32 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Track Flight'}
                    </button>
                </div>
            </form>
            
            <div className="mt-8">
                {error && (
                    <div className="text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
                        <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
                        <h3 className="mt-4 text-lg font-semibold text-red-800">Could Not Track Flight</h3>
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    </div>
                )}

                {status && (
                    <FlightStatusCard status={status} />
                )}
            </div>
        </div>
    );
};

export default FlightTracker;