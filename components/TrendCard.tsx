
import React from 'react';
import { TravelTrend, SocialProof } from '../types';
import { Icon } from './Icon';

interface TrendCardProps {
  trend: TravelTrend;
}

const getSocialIcon = (platform: SocialProof['platform']) => {
    switch(platform) {
        case 'TikTok': return 'compass'; // Re-using an icon
        case 'Instagram': return 'image';
        case 'Booking': return 'hotel';
        case 'FlyWise':
        default: return 'logo';
    }
}

const TrendCard: React.FC<TrendCardProps> = ({ trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 group flex flex-col">
      <div className="h-48 overflow-hidden relative rounded-t-lg">
        <img
          src={trend.image}
          alt={`Image of ${trend.destination}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          {trend.category}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600">{trend.destination}</h3>
          
          <div className="my-3 space-y-2">
             <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Trend Score</span>
                <span className="text-blue-600">{trend.trendScore}/100</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${trend.trendScore}%` }}></div>
             </div>
             <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Monthly Growth</span>
                <span className="text-green-600">+{trend.monthlyGrowth}%</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(trend.monthlyGrowth, 100)}%` }}></div>
             </div>
          </div>

          <div className="my-4 flex justify-around gap-2 text-center border-t border-b border-slate-200 py-3">
              {trend.socialProof.map((proof, i) => (
                  <div key={i}>
                      <Icon name={getSocialIcon(proof.platform)} className="h-5 w-5 mx-auto text-slate-500"/>
                      <p className="text-xs font-bold text-slate-800 mt-1">{proof.value}</p>
                  </div>
              ))}
          </div>
          
          <div className="mt-3 p-3 bg-indigo-50 rounded-md border border-indigo-200">
             <p className="text-sm font-semibold text-indigo-800 flex items-center">
                 <Icon name="sparkles" className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0" />
                 Why it's for you:
             </p>
             <p className="text-xs text-slate-700 mt-1 italic">{trend.personalizationReason}</p>
          </div>

        </div>
        <button className="mt-4 w-full bg-blue-600 text-white font-bold py-2.5 rounded-md hover:bg-blue-700 transition-colors">
            Explore Deals
        </button>
      </div>
    </div>
  );
};

export default TrendCard;
