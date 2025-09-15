

import React from 'react';
import { FlightStatus, MapMarker } from '../types';
import { Icon } from './Icon';
import MapView from './MapView';

interface FlightStatusCardProps {
  status: FlightStatus;
}

const formatTime = (isoString: string | null) => {
    if (!isoString) return '---';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const FlightStatusCard: React.FC<FlightStatusCardProps> = ({ status }) => {
    
    const getStatusInfo = () => {
        switch (status.status) {
            case 'En Route': return { color: 'bg-blue-100 text-blue-800', icon: 'flight' as const };
            case 'Landed': return { color: 'bg-green-100 text-green-800', icon: 'check-circle' as const };
            case 'Delayed': return { color: 'bg-amber-100 text-amber-800', icon: 'clock' as const };
            case 'Cancelled': return { color: 'bg-red-100 text-red-800', icon: 'x-mark' as const };
            case 'Scheduled':
            default: return { color: 'bg-slate-100 text-slate-800', icon: 'clock' as const };
        }
    };

    const { color, icon } = getStatusInfo();

    // FIX: Explicitly type `potentialMarkers` as `MapMarker[]` to help TypeScript's inference.
    const potentialMarkers: MapMarker[] = [
        { name: status.departure.airport, lat: status.departure.latitude, lng: status.departure.longitude, activity: 'Departure', day: 1, timeOfDay: 'Morning' },
        { name: status.arrival.airport, lat: status.arrival.latitude, lng: status.arrival.longitude, activity: 'Arrival', day: 1, timeOfDay: 'Afternoon' }
    ];

    if (status.livePosition) {
        potentialMarkers.push({
            name: status.flightNumber,
            lat: status.livePosition.latitude,
            lng: status.livePosition.longitude,
            activity: `Current Position: ${status.livePosition.altitude} ft, ${status.livePosition.speed} knots`,
            day: 1,
            timeOfDay: 'Morning' // Dummies
        });
    }

    const mapMarkers: MapMarker[] = potentialMarkers.filter(
        (m) => typeof m.lat === 'number' && typeof m.lng === 'number'
    );


    return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 animate-fade-in-up">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-slate-600 text-sm">{status.airline}</p>
                        <p className="font-bold text-2xl text-slate-800">{status.flightNumber}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${color}`}>
                        <Icon name={icon} className="h-5 w-5" />
                        {status.status}
                    </div>
                </div>
                <div className="mt-2 text-center">
                    <p className="font-bold text-lg text-slate-700">{status.departure.city} to {status.arrival.city}</p>
                </div>
            </div>

            {/* Timeline & Progress */}
            <div className="p-6">
                <div className="flex items-center justify-between text-center">
                    <div className="w-1/3">
                        <p className="font-bold text-xl text-slate-800">{status.departure.iata}</p>
                        <p className="text-sm text-slate-500">{status.departure.city}</p>
                    </div>
                    <div className="w-1/3 flex justify-center">
                        <Icon name="flight" className="h-8 w-8 text-slate-400" />
                    </div>
                     <div className="w-1/3">
                        <p className="font-bold text-xl text-slate-800">{status.arrival.iata}</p>
                        <p className="text-sm text-slate-500">{status.arrival.city}</p>
                    </div>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2 relative">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${status.progressPercent}%` }}></div>
                    {status.status === 'En Route' && status.livePosition && (
                        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${status.progressPercent}%` }}>
                            <Icon name="flight" className="h-5 w-5 text-blue-800 -translate-x-1/2" />
                        </div>
                    )}
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Departure Info */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-slate-700">Departure</h3>
                        <p className="text-sm"><strong>Airport:</strong> {status.departure.airport}</p>
                        <p className="text-sm"><strong>Scheduled:</strong> {formatTime(status.departure.scheduledTime)}</p>
                        <p className="text-sm"><strong>Actual:</strong> {formatTime(status.departure.actualTime)}</p>
                        <p className="text-sm"><strong>Terminal/Gate:</strong> {status.departure.terminal || 'N/A'} / {status.departure.gate || 'N/A'}</p>
                    </div>
                    {/* Arrival Info */}
                    <div className="space-y-2">
                         <h3 className="font-semibold text-slate-700">Arrival</h3>
                        <p className="text-sm"><strong>Airport:</strong> {status.arrival.airport}</p>
                        <p className="text-sm"><strong>Scheduled:</strong> {formatTime(status.arrival.scheduledTime)}</p>
                        <p className="text-sm"><strong>Actual:</strong> {formatTime(status.arrival.actualTime)}</p>
                        <p className="text-sm"><strong>Terminal/Gate:</strong> {status.arrival.terminal || 'N/A'} / {status.arrival.gate || 'N/A'}</p>
                        <p className="text-sm"><strong>Baggage Claim:</strong> {status.arrival.baggageClaim || 'N/A'}</p>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                    <p className="text-sm text-blue-800 flex items-start gap-3">
                        <Icon name="lightbulb" className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
                        <span><strong>AI Summary:</strong> {status.aiSummary}</span>
                    </p>
                </div>

                 <div className="mt-6">
                    <h3 className="font-semibold text-slate-700 mb-2">Flight Map</h3>
                    <div className="h-64 w-full bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                       <MapView markers={mapMarkers} waypoints={status.waypoints} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightStatusCard;
