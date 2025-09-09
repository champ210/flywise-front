
import React from 'react';
import { LocalProfile } from '../types';
import { Icon } from './Icon';

interface HostCardProps {
  local: LocalProfile;
  onSelect: () => void;
}

const HostCard: React.FC<HostCardProps> = ({ local, onSelect }) => {
  const compatibilityColor =
    local.compatibilityScore > 85
      ? 'bg-green-100 text-green-800'
      : local.compatibilityScore > 65
      ? 'bg-amber-100 text-amber-800'
      : 'bg-slate-100 text-slate-800';

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer group flex flex-col"
    >
      <div className="h-48 overflow-hidden relative rounded-t-lg">
        <img
          src={local.profileType === 'stay' && local.housePhotos ? local.housePhotos[0] : local.avatarUrl}
          alt={`Photo for ${local.name}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {local.isVerified && (
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-full flex items-center text-xs font-semibold text-blue-600">
            <Icon name="shield" className="h-4 w-4 mr-1" />
            Verified
          </div>
        )}
         {local.profileType === 'stay' && (
            <div className="absolute bottom-2 left-2">
                <img src={local.avatarUrl} alt={local.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"/>
            </div>
         )}
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600">{local.name}, {local.age}</h3>
            <p className="text-sm text-slate-500 font-medium">{local.location}</p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">{local.bio}</p>
        </div>
        <div className={`mt-4 p-2 rounded-md text-center text-xs font-semibold ${compatibilityColor}`}>
            {local.compatibilityReason} ({local.compatibilityScore}%)
        </div>
      </div>
    </div>
  );
};

export default HostCard;
