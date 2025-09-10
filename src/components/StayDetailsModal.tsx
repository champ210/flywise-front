

import React, { useState, useEffect } from 'react';
import { Stay, NearbyAttraction, LocalVibe } from '../../types';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import { getNearbyAttractions, getLocalVibe } from '../services/geminiService';

interface StayDetailsModalProps {
  stay: Stay;
  onClose: () => void;
}

const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'h-5 w-5' }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name="star"
            className={`${className} ${
              index < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

const StayDetailsModal: React.FC<StayDetailsModalProps> = ({ stay, onClose }) => {
  const [attractions, setAttractions] = useState<NearbyAttraction[]>([]);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(true);
  const [vibeResult, setVibeResult] = useState<LocalVibe | null>(null);
  const [isVibeLoading, setIsVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState<string | null>(null);


  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    const fetchAttractions = async () => {
        setIsLoadingAttractions(true);
        try {
            const fetchedAttractions = await getNearbyAttractions(stay.name, stay.location);
            setAttractions(fetchedAttractions);
        } catch (error) {
            console.error("Failed to fetch attractions:", error);
        } finally {
            setIsLoadingAttractions(false);
        }
    };

    fetchAttractions();

    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleEsc);
    };
  }, [stay, onClose]);

  const handleFetchVibe = async () => {
    setIsVibeLoading(true);
    setVibeError(null);
    setVibeResult(null);
    try {
        const vibe = await getLocalVibe(stay.name, stay.location);
        setVibeResult(vibe);
    } catch (err) {
        setVibeError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsVibeLoading(false);
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-labelledby="stay-details-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative h-64">
             <img
                className="w-full h-full object-cover rounded-t-xl"
                src={stay.imageUrl || 'https://picsum.photos/800/400'}
                alt={stay.name}
            />
             <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                aria-label="Close details"
            >
                <Icon name="x-mark" className="h-6 w-6" />
            </button>
        </header>
        
        <main className="overflow-y-auto p-6 space-y-6">
            <div>
                <p className="text-sm text-blue-600 font-semibold">{stay.stayType}</p>
                <h2 id="stay-details-title" className="text-3xl font-bold text-slate-800">
                    {stay.name}
                </h2>
                <p className="mt-1 text-slate-600">{stay.location}</p>
                <div className="mt-2 flex items-center space-x-2">
                    <StarRating rating={stay.rating} />
                    <span className="font-bold text-slate-700">
                      {stay.rating.toFixed(1)}
                      {stay.reviews && stay.reviews.length > 0 && ` (${stay.reviews.length} reviews)`}
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Amenities</h3>
                    <ul className="flex flex-wrap gap-2">
                        {stay.amenities.map(amenity => (
                            <li key={amenity} className="flex items-center text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
                                <Icon name="check-circle" className="h-4 w-4 mr-2 text-green-600" />
                                {amenity}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">User Reviews</h3>
                    {stay.reviews && stay.reviews.length > 0 ? (
                      <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                        {stay.reviews.map((review, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between">
                                  <p className="font-semibold text-sm text-slate-800">{review.user}</p>
                                  <StarRating rating={review.rating} className="h-4 w-4" />
                              </div>
                              <p className="text-sm text-slate-600 mt-2 italic">"{review.comment}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No reviews available for this stay yet.</p>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">AI-Powered Insights</h3>
                    <div className="space-y-4">
                        {stay.negotiationTip && (
                            <div className="bg-amber-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <Icon name="lightbulb" className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-amber-800">AI Negotiation Tip</h4>
                                        <p className="text-sm text-slate-700 mt-1">{stay.negotiationTip}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="bg-amber-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Icon name="sparkles" className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-amber-800">Nearby Attractions</h4>
                                    {isLoadingAttractions ? (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <LoadingSpinner />
                                            <span className="text-sm text-slate-600">Finding points of interest...</span>
                                        </div>
                                    ) : (
                                        attractions.length > 0 ? (
                                            <ul className="mt-2 space-y-2">
                                                {attractions.map((attraction, i) => (
                                                    <li key={i}>
                                                        <p className="font-semibold text-sm text-slate-800">{attraction.name}</p>
                                                        <p className="text-xs text-slate-600">{attraction.description}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-slate-500 mt-2">Could not find specific attractions nearby.</p>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Icon name="moon" className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-amber-800">Local Vibe Analysis</h4>
                                    {!vibeResult && !isVibeLoading && !vibeError && (
                                        <>
                                            <p className="text-sm text-slate-700 mt-1">Curious about the neighborhood's atmosphere after dark? Let our AI analyze it for you.</p>
                                            <button onClick={handleFetchVibe} className="mt-3 inline-flex items-center px-3 py-1.5 border border-amber-300 text-xs font-medium rounded-md shadow-sm text-amber-800 bg-white hover:bg-amber-100">
                                                Analyze Vibe at Night
                                            </button>
                                        </>
                                    )}
                                    {isVibeLoading && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <LoadingSpinner />
                                            <span className="text-sm text-slate-600">Analyzing neighborhood vibe...</span>
                                        </div>
                                    )}
                                    {vibeError && <p className="text-sm text-red-600 mt-2">{vibeError}</p>}
                                    {vibeResult && (
                                        <div className="mt-2 animate-fade-in-up">
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{vibeResult.description}</p>
                                            {vibeResult.sources && vibeResult.sources.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-amber-200">
                                                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sources</h5>
                                                    <ul className="mt-1 space-y-1">
                                                        {vibeResult.sources.slice(0, 3).map((source, i) => (
                                                            <li key={i}>
                                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                                                                    {source.title || source.uri}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer className="p-4 sm:p-6 border-t border-slate-200 bg-white rounded-b-xl flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4">
            <div className="text-center sm:text-right sm:mr-6">
                <p className="text-2xl sm:text-3xl font-bold text-slate-800">${stay.pricePerNight.toLocaleString()}</p>
                <p className="text-sm text-slate-500">per night</p>
            </div>
            <a
              href={stay.affiliateLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Book Now
            </a>
        </footer>
      </div>
    </div>
  );
};

export default StayDetailsModal;
