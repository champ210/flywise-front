import React from 'react';
import { Community } from '../../types';
import { Icon } from './Icon';

interface CommunityCardProps {
  community: Community;
  onClick: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200 cursor-pointer group"
    >
      <div className="h-40 overflow-hidden">
        <img 
          src={community.coverImageUrl} 
          alt={community.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-blue-600 transition-colors">{community.name}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                community.type === 'public' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
                {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
            </span>
        </div>
        <div className="flex items-center text-sm text-slate-500 mt-2">
            <Icon name="users" className="h-4 w-4 mr-2" />
            <span>{community.memberCount.toLocaleString()} members</span>
        </div>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-2">{community.description}</p>
      </div>
    </div>
  );
};

export default CommunityCard;