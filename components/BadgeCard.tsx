
import React from 'react';
import { Badge } from '../types';
import { Icon } from './Icon';

interface BadgeCardProps {
  badge: Badge;
  isEarned: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isEarned }) => {
  return (
    <div
      className={`bg-white rounded-lg p-4 text-center border-2 transition-all duration-300 relative ${
        isEarned ? 'border-amber-400 shadow-lg' : 'border-slate-200'
      }`}
    >
      <div
        className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 transition-all duration-300 ${
          isEarned ? 'bg-amber-100' : 'bg-slate-100'
        }`}
      >
        <Icon
          name={badge.icon}
          className={`h-9 w-9 transition-colors duration-300 ${
            isEarned ? 'text-amber-500' : 'text-slate-400'
          }`}
        />
      </div>
      <h4
        className={`font-bold text-base transition-colors duration-300 ${
          isEarned ? 'text-slate-800' : 'text-slate-500'
        }`}
      >
        {badge.name}
      </h4>
      <p
        className={`text-xs mt-1 transition-colors duration-300 ${
          isEarned ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        {badge.description}
      </p>
      {!isEarned && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">LOCKED</span>
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
