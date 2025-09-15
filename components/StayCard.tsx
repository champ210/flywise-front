import React, { useState } from 'react';
import { Stay } from '@/types';
import { Icon } from '@/components/common/Icon';
import StayDetailsModal from '@/components/StayDetailsModal';

interface StayCardProps {
  stay: Stay;
  onBookStay: (stay: Stay) => void;
}

const StayCard: React.FC<StayCardProps> = ({ stay, onBookStay }) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <>
    {isDetailsModalOpen && <StayDetailsModal stay={stay} onClose={() => setIsDetailsModalOpen(false)} />}
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 flex flex-col sm:flex-row transition-shadow hover:shadow-md">
      <div className="sm:w-1/3 h-48 sm:h-auto">
        <img src={stay.imageUrl} alt={stay.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase">{stay.stayType}</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{stay.name}</h3>
          <p className="text-sm text-slate-500">{stay.location}</p>
          <div className="flex items-center space-x-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Icon key={i} name="star" className={`h-5 w-5 ${i < Math.round(stay.rating) ? 'text-yellow-400' : 'text-slate-300'}`} />
            ))}
            <span className="text-sm font-semibold text-slate-700">{stay.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-end">
          <div className="sm:w-1/2">
            <p className="text-2xl font-bold text-slate-800">${stay.pricePerNight.toLocaleString()}</p>
            <p className="text-sm text-slate-500">per night</p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
             <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
            >
              Details
            </button>
            <button
              onClick={() => onBookStay(stay)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default React.memo(StayCard);