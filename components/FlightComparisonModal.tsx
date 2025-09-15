
import React, { useMemo } from 'react';
import { Flight } from '@/types';
import { Icon } from '@/components/common/Icon';

interface FlightComparisonModalProps {
  flights: Flight[];
  onClose: () => void;
  onBookFlight?: (flight: Flight) => void;
}

const FlightComparisonModal: React.FC<FlightComparisonModalProps> = ({ flights, onClose, onBookFlight }) => {
    
    const comparisonData = useMemo(() => {
        if (flights.length === 0) return null;
        const minPrice = Math.min(...flights.map(f => f.price));
        const minStops = Math.min(...flights.map(f => f.stops));

        const getMinutes = (duration: string): number => {
            const parts = duration.match(/(\d+)h\s*(\d*)m?/);
            if (!parts) return Infinity;
            const hours = parseInt(parts[1] || '0', 10);
            const minutes = parseInt(parts[2] || '0', 10);
            return hours * 60 + minutes;
        };
        const minDuration = Math.min(...flights.map(f => getMinutes(f.duration)));
        
        return { minPrice, minStops, minDuration, getMinutes };
    }, [flights]);

    const features = [
        { key: 'airline', label: 'Airline' },
        { key: 'price', label: 'Price' },
        { key: 'duration', label: 'Duration' },
        { key: 'stops', label: 'Stops' },
        { key: 'departureTime', label: 'Departure' },
        { key: 'arrivalTime', label: 'Arrival' },
        { key: 'provider', label: 'Provider' }
    ];

    const getCellContent = (flight: Flight, featureKey: string) => {
        switch (featureKey) {
            case 'price':
                return `$${flight.price.toLocaleString()}`;
            case 'stops':
                return flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`;
            default:
                return flight[featureKey as keyof Flight] as string;
        }
    };
    
    const getCellClass = (flight: Flight, featureKey: string) => {
        if (!comparisonData) return '';
        let isBest = false;
        switch (featureKey) {
            case 'price':
                isBest = flight.price === comparisonData.minPrice;
                break;
            case 'stops':
                isBest = flight.stops === comparisonData.minStops;
                break;
            case 'duration':
                isBest = comparisonData.getMinutes(flight.duration) === comparisonData.minDuration;
                break;
        }
        return isBest ? 'bg-green-100 text-green-800 font-bold' : '';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Compare Flights</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100"><Icon name="x-mark" className="h-6 w-6" /></button>
                </header>
                <main className="flex-grow overflow-auto p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 text-left text-sm font-semibold text-slate-600 bg-slate-50 sticky left-0 z-10 w-32">Feature</th>
                                    {flights.map((flight, index) => (
                                        <th key={index} className="p-3 text-left text-sm font-semibold text-slate-800 border-l border-slate-200">
                                            {flight.airline}
                                            <div className="text-xs font-normal text-slate-500">{flight.flightNumber}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {features.map(feature => (
                                    <tr key={feature.key}>
                                        <td className="p-3 text-sm font-medium text-slate-800 bg-slate-50 sticky left-0 z-10 w-32">{feature.label}</td>
                                        {flights.map((flight, index) => (
                                            <td key={index} className={`p-3 text-sm text-slate-700 border-l border-slate-200 transition-colors ${getCellClass(flight, feature.key)}`}>
                                                {getCellContent(flight, feature.key)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td className="p-3 text-sm font-medium text-slate-800 bg-slate-50 sticky left-0 z-10 w-32"></td>
                                    {flights.map((flight, index) => (
                                        <td key={index} className="p-3 text-sm text-slate-700 border-l border-slate-200">
                                            {onBookFlight ? (
                                                <button onClick={() => onBookFlight(flight)} className="w-full px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                                    Book Now
                                                </button>
                                            ) : (
                                                <a href={flight.affiliateLink} target="_blank" rel="noopener noreferrer" className="block text-center w-full px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                                    View Deal
                                                </a>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FlightComparisonModal;
