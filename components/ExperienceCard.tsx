import React from 'react';
import { Experience } from '../types';
import { Icon } from './Icon';

interface ExperienceCardProps {
  experience: Experience;
  onClick: () => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200 cursor-pointer group flex flex-col"
      aria-label={`View details for experience: ${experience.title}`}
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={experience.images[0]} 
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          {experience.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">{experience.title}</h3>
          <p className="text-xs text-slate-500 mt-1">{experience.location}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600 mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center">
            <Icon name="star" className="h-4 w-4 text-yellow-400 mr-1"/>
            <span className="font-semibold">{experience.rating.toFixed(1)}</span>
            <span className="text-xs ml-1">({experience.reviews.length})</span>
          </div>
          <p className="font-bold text-slate-800">
            From ${experience.price} <span className="font-normal text-xs">/ person</span>
          </p>
        </div>
      </div>
    </button>
  );
};

export default ExperienceCard;
