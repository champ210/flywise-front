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

    // The type predicate `m is MapMarker` was causing an error because the inferred type of `potentialMarkers` was more specific than MapMarker.
    // By explicitly typing `potentialMarkers` as `MapMarker[]` above, the type of `m` within the filter is now `MapMarker`, making the predicate valid.
    const mapMarkers: MapMarker[] = potentialMarkers.filter(
        // FIX: Removed redundant type predicate which was causing a TypeScript error.
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
                        <Icon name={icon} style={{ height: 20, width: 20 }} />
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
                        <Icon name="flight" style={{ height: 32, width: 32, color: '#94a3b8' }} />
                    </div>
                     <div className="w-1/3">
                        <p className="font-bold text-xl text-slate-800">{status.arrival.iata}</p>
                        <p className="text-sm text-slate-500">{status.arrival.city}</p>
                    </div>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2 relative">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${status.progressPercent}%` }}></div>
                    {/* FIX: Replaced className with style for React Native compatibility */}
                    {status.status === 'En Route' && status.progressPercent > 5 && status.progressPercent < 95 && (
                        <Icon name="send" style={{ position: 'absolute', top: -7, transform: [{translateX: -10}], color: '#1d4ed8', height: 20, width: 20, left: `${status.progressPercent}%` }} />
                    )}
                </div>
            </div>

            {/* Departure & Arrival Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200">
                <div className="bg-white p-4">
                    <h4 className="font-semibold text-slate-800">Departure</h4>
                    <ul className="mt-2 text-sm space-y-1">
                        <li><strong>Airport:</strong> {status.departure.airport}</li>
                        <li><strong>Terminal/Gate:</strong> {status.departure.terminal || 'TBD'} / {status.departure.gate || 'TBD'}</li>
                        <li><strong>Scheduled:</strong> {formatTime(status.departure.scheduledTime)}</li>
                        <li className={status.status === 'Delayed' ? 'font-bold text-amber-600' : 'font-bold text-blue-600'}>
                            <strong>Actual:</strong> {formatTime(status.departure.actualTime)}
                        </li>
                    </ul>
                </div>
                <div className="bg-white p-4">
                    <h4 className="font-semibold text-slate-800">Arrival</h4>
                     <ul className="mt-2 text-sm space-y-1">
                        <li><strong>Airport:</strong> {status.arrival.airport}</li>
                        <li><strong>Terminal/Gate:</strong> {status.arrival.terminal || 'TBD'} / {status.arrival.gate || 'TBD'}</li>
                        <li><strong>Scheduled:</strong> {formatTime(status.arrival.scheduledTime)}</li>
                        <li className={status.status === 'Landed' ? 'font-bold text-green-600' : ''}>
                            <strong>Est. / Actual:</strong> {formatTime(status.arrival.actualTime)}
                        </li>
                     </ul>
                </div>
            </div>

            {/* Map & AI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-200">
                <div className="bg-white p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Live Map</h4>
                    <div className="h-64 w-full rounded-md border border-slate-300 overflow-hidden">
                        <MapView markers={mapMarkers} waypoints={status.waypoints} />
                    </div>
                </div>
                <div className="bg-white p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Details & Summary</h4>
                    <div className="text-sm space-y-2">
                        <p><strong>Aircraft:</strong> {status.aircraft.type} ({status.aircraft.registration || 'N/A'})</p>
                        {status.livePosition && (
                            <>
                                <p><strong>Altitude:</strong> {status.livePosition.altitude.toLocaleString()} ft</p>
                                <p><strong>Speed:</strong> {status.livePosition.speed} knots</p>
                            </>
                        )}
                        <div className="mt-4 p-3 bg-indigo-50 rounded-md border border-indigo-200">
                            <p className="text-sm font-semibold text-indigo-800 flex items-center">
                                <Icon name="sparkles" style={{ height: 16, width: 16, marginRight: 8, color: '#4338ca' }} />
                                AI Summary
                            </p>
                            <p className="text-sm text-slate-700 mt-2">{status.aiSummary}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightStatusCard;