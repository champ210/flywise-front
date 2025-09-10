
import React, { useState, useEffect, useCallback } from 'react';
import { LocalProfile, HangoutSuggestion, UserProfile } from '../../types';
import { generateHangoutRequestMessage } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface HangoutRequestModalProps {
  local: LocalProfile;
  suggestion: HangoutSuggestion;
  onClose: () => void;
  onHangoutComplete: () => void;
}

const HangoutRequestModal: React.FC<HangoutRequestModalProps> = ({ local, suggestion, onClose, onHangoutComplete }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    
    const fetchIcebreaker = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // A real app would get the current user's profile. We'll use a mock one for the service call.
            const mockUserProfile: UserProfile = {
                preferredAirlines: '', minHotelStars: 0, preferredCarTypes: [], 
                favoriteDestinations: ['Japan', 'Italy'], budget: { flightMaxPrice: 1000, hotelMaxPrice: 200, carMaxPrice: 50}
            };
            const result = await generateHangoutRequestMessage(mockUserProfile, local, suggestion);
            setMessage(result as string);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate message.");
            setMessage(`Hey ${local.name}! I saw you're open to hanging out. I'd be interested in the suggestion: "${suggestion.title}". Let me know if you're free!`);
        } finally {
            setIsLoading(false);
        }
    };

    fetchIcebreaker();
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [local, suggestion]);

  const handleSendRequest = () => {
    // Simulate sending the request
    onHangoutComplete();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Request Hangout with {local.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6 space-y-4">
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-xs font-semibold text-slate-500">SELECTED HANGOUT</p>
                <h3 className="font-bold text-slate-800">{suggestion.title}</h3>
                <p className="text-sm text-slate-600">{suggestion.description}</p>
            </div>
            
            <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Message (AI-assisted)
                </label>
                {isLoading ? (
                    <div className="w-full h-32 bg-slate-100 rounded-md flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-600">Writing an icebreaker...</span>
                    </div>
                ) : (
                    <textarea 
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full p-3 rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                )}
                 {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        </main>

        <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
             <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
            >
                Send Request
            </button>
        </footer>
      </div>
    </div>
  );
};

export default HangoutRequestModal;
