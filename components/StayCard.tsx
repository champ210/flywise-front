
import React, { useState } from 'react';
import { Stay } from '../types';
import { Icon } from './Icon';
import StayDetailsModal from './StayDetailsModal';

interface StayCardProps {
  stay: Stay;
  onBookStay?: (stay: Stay) => void;
}

const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'h-4 w-4' }) => {
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

const StayCard: React.FC<StayCardProps> = ({ stay, onBookStay }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-slate-200 flex flex-col sm:flex-row">
        <div className="sm:w-1/3 h-48 sm:h-auto">
          <img
            className="w-full h-full object-cover"
            src={stay.imageUrl || 'https://picsum.photos/400/300'}
            alt={stay.name}
          />
        </div>
        <div className="flex flex-col justify-between flex-1">
          {stay.rankingReason && (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 flex items-center border-b border-emerald-200">
                  <Icon name="sparkles" className="h-4 w-4 mr-2 text-emerald-600" />
                  AI Recommendation: {stay.rankingReason}
              </div>
          )}
          <div className="p-4">
            <div>
              <p className="text-sm text-blue-600 font-semibold">{stay.stayType} in {stay.location} {stay.provider && <span className="font-normal text-slate-500">on {stay.provider}</span>}</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{stay.name}</h3>
              <div className="flex items-center mt-2">
                <StarRating rating={stay.rating} />
                <span className="ml-2 text-sm text-slate-600">
                  {stay.rating.toFixed(1)}
                  {stay.reviews && stay.reviews.length > 0 && ` (${stay.reviews.length} reviews)`}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {stay.amenities.slice(0, 3).map(amenity => (
                  <span key={amenity} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{amenity}</span>
                ))}
              </div>
              {stay.reviews && stay.reviews.length > 0 ? (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-sm text-slate-600 italic">"{stay.reviews[0].comment}"</p>
                  <div className="flex justify-end items-center mt-1">
                    <p className="text-xs text-slate-500 font-medium mr-2">- {stay.reviews[0].user}</p>
                    <StarRating rating={stay.reviews[0].rating} className="h-3 w-3" />
                  </div>
                </div>
              ) : (
                <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-sm text-slate-500 italic">No user reviews available yet.</p>
                </div>
              )}
              {stay.negotiationTip && (
                  <div className="mt-4 bg-amber-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                          <Icon name="sparkles" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                          <p className="text-xs font-semibold text-amber-800">AI Negotiation Tip</p>
                          <p className="text-xs text-amber-700">{stay.negotiationTip}</p>
                          </div>
                      </div>
                  </div>
              )}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div className="text-center sm:text-left">
                <p className="text-2xl font-bold text-slate-800">${stay.pricePerNight.toLocaleString()}</p>
                <p className="text-sm text-slate-500">per night</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
                >
                  Details
                </button>
                {onBookStay ? (
                  <button
                    onClick={() => onBookStay(stay)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Book Now
                  </button>
                ) : (
                  <a
                    href={stay.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Deal
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <StayDetailsModal stay={stay} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default React.memo(StayCard);