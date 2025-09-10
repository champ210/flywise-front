
import React from 'react';
import { Car } from '../../types';
import { Icon } from './Icon';

interface CarCardProps {
  car: Car;
  onBookCar?: (car: Car) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onBookCar }) => {
  const getFuelIcon = (fuelType: Car['fuelType']) => {
    switch(fuelType) {
      case 'Electric': return 'bolt';
      case 'Hybrid': return 'bolt';
      default: return 'fuel';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-slate-200 flex flex-col sm:flex-row">
      <div className="sm:w-1/3 h-48 sm:h-auto bg-slate-100 flex items-center justify-center">
        <img
          className="w-full h-full object-cover"
          src={car.imageUrl || 'https://picsum.photos/400/300?car'}
          alt={`${car.make} ${car.model}`}
        />
      </div>
      <div className="flex flex-col justify-between flex-1">
        {car.rankingReason && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 flex items-center border-b border-emerald-200">
                <Icon name="sparkles" className="h-4 w-4 mr-2 text-emerald-600" />
                AI Recommendation: {car.rankingReason}
            </div>
        )}
        <div className="p-4">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 font-semibold">{car.carType} from {car.company} {car.provider && <span className="font-normal text-slate-500">via {car.provider}</span>}</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{car.make} {car.model}</h3>
              </div>
              {car.recommendation && (
                  <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full whitespace-nowrap">{car.recommendation}</span>
              )}
            </div>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, index) => (
                  <Icon
                  key={index}
                  name="star"
                  className={`h-4 w-4 ${
                      index < Math.round(car.rating) ? 'text-yellow-400' : 'text-slate-300'
                  }`}
                  />
              ))}
              <span className="ml-2 text-sm text-slate-600">{car.rating.toFixed(1)}</span>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-t border-slate-200 pt-3">
               <div className="flex items-center text-sm text-slate-600">
                  <Icon name="users" className="h-5 w-5 mr-2 text-slate-500" />
                  {car.passengers} Passengers
               </div>
               <div className="flex items-center text-sm text-slate-600">
                  <Icon name={getFuelIcon(car.fuelType)} className="h-5 w-5 mr-2 text-slate-500" />
                  {car.fuelType}
               </div>
            </div>
            {car.negotiationTip && (
              <div className="mt-4 bg-amber-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="sparkles" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">AI Negotiation Tip</p>
                    <p className="text-xs text-amber-700">{car.negotiationTip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-slate-800">${car.pricePerDay.toLocaleString()}</p>
              <p className="text-sm text-slate-500">per day</p>
            </div>
            {onBookCar ? (
              <button
                onClick={() => onBookCar(car)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Book Now
              </button>
            ) : (
              <a
                href={car.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Deal
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CarCard);