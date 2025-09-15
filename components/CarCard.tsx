import React from 'react';
import { Car } from '@/types';
import { Icon } from '@/components/Icon';

interface CarCardProps {
  car: Car;
  onBookCar: (car: Car) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onBookCar }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 flex flex-col sm:flex-row transition-shadow hover:shadow-md">
      <div className="sm:w-1/3 h-48 sm:h-auto flex items-center justify-center bg-slate-100 p-4">
        <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="w-full h-full object-contain" />
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase">{car.carType}</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{car.make} {car.model}</h3>
          <p className="text-sm text-slate-500">{car.company} - {car.location}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
            <span className="flex items-center"><Icon name="users" className="h-4 w-4 mr-1.5" /> {car.passengers}</span>
            <span className="flex items-center"><Icon name="fuel" className="h-4 w-4 mr-1.5" /> {car.fuelType}</span>
            <span className="flex items-center"><Icon name="star" className="h-4 w-4 mr-1.5 text-yellow-400" /> {car.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-end">
          <div>
            <p className="text-2xl font-bold text-slate-800">${car.pricePerDay.toLocaleString()}</p>
            <p className="text-sm text-slate-500">per day</p>
          </div>
          <button
            onClick={() => onBookCar(car)}
            className="w-full sm:w-auto mt-2 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CarCard);