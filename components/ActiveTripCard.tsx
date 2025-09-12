import React from 'react';
import { SavedTrip } from '../types';
import { Icon } from './Icon';

interface ActiveTripCardProps {
  trip: SavedTrip;
  onOpenScanner: () => void;
  onOpenTranslator: () => void;
  onAskAi: () => void;
}

const ActiveTripCard: React.FC<ActiveTripCardProps> = ({ trip, onOpenScanner, onOpenTranslator, onAskAi }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg text-white animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">Active Trip</p>
          <h2 className="text-2xl font-bold">{trip.name}</h2>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            LIVE
        </div>
      </div>
      <p className="mt-2 text-blue-100">Your in-trip companion is ready to assist you.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={onAskAi} className="p-4 bg-white/10 rounded-lg text-center hover:bg-white/20 transition-colors">
            <Icon name="chat" className="h-8 w-8 mx-auto text-blue-200"/>
            <p className="mt-2 text-sm font-semibold">Ask AI Assistant</p>
        </button>
         <button onClick={onOpenScanner} className="p-4 bg-white/10 rounded-lg text-center hover:bg-white/20 transition-colors">
            <Icon name="document" className="h-8 w-8 mx-auto text-blue-200"/>
            <p className="mt-2 text-sm font-semibold">Scan Document</p>
        </button>
         <button onClick={onOpenTranslator} className="p-4 bg-white/10 rounded-lg text-center hover:bg-white/20 transition-colors">
            <Icon name="globe" className="h-8 w-8 mx-auto text-blue-200"/>
            <p className="mt-2 text-sm font-semibold">Translate Photo</p>
        </button>
      </div>
    </div>
  );
};

export default ActiveTripCard;