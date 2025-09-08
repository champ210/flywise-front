import React, { useState } from 'react';
import { UserProfile as UserProfileType, Car } from '../types';
import { Icon } from './Icon';

interface UserProfileProps {
  profile: UserProfileType;
  onSave: (profile: UserProfileType) => void;
}

const carTypes: Car['carType'][] = ['Sedan', 'SUV', 'Luxury', 'Van', 'Electric'];

const UserProfile: React.FC<UserProfileProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfileType>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [destinationInput, setDestinationInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Handle nested budget object
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          // @ts-ignore
          ...prev[parent],
          [child]: value === '' ? '' : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleStarRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      minHotelStars: prev.minHotelStars === rating ? 0 : rating 
    }));
  };

  const handleCarTypeChange = (carType: Car['carType']) => {
    setFormData(prev => {
      const newCarTypes = prev.preferredCarTypes.includes(carType)
        ? prev.preferredCarTypes.filter(t => t !== carType)
        : [...prev.preferredCarTypes, carType];
      return { ...prev, preferredCarTypes: newCarTypes };
    });
  };

   const handleAddDestination = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && destinationInput.trim() !== '') {
      e.preventDefault();
      const newDestinations = [...new Set([...formData.favoriteDestinations, destinationInput.trim()])];
      setFormData(prev => ({ ...prev, favoriteDestinations: newDestinations }));
      setDestinationInput('');
    }
  };

  const handleRemoveDestination = (destinationToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteDestinations: prev.favoriteDestinations.filter(d => d !== destinationToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">My Travel Preferences</h2>
        <p className="mt-2 text-sm text-slate-600">
          Help our AI find the perfect deals by setting your preferences. These will be used to filter and prioritize your search results.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm space-y-8">
          
          {/* Flight, Hotel & Car Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <Icon name="flight" className="h-5 w-5 mr-3 text-blue-600" />
                      Flights
                  </h3>
                  <div>
                      <label htmlFor="preferredAirlines" className="block text-sm font-medium text-slate-700">Preferred Airlines</label>
                      <input
                          type="text"
                          id="preferredAirlines"
                          name="preferredAirlines"
                          value={formData.preferredAirlines}
                          onChange={handleChange}
                          placeholder="e.g., Emirates, Delta"
                          className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-slate-500">Separated by commas.</p>
                  </div>
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <Icon name="hotel" className="h-5 w-5 mr-3 text-blue-600" />
                      Hotels
                  </h3>
                  <div>
                      <label className="block text-sm font-medium text-slate-700">Minimum Star Rating</label>
                      <div className="flex items-center space-x-1 mt-2">
                          {[1, 2, 3, 4, 5].map(star => (
                              <button type="button" key={star} onClick={() => handleStarRatingChange(star)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 rounded-full p-1">
                                  <Icon name="star" className={`h-6 w-6 cursor-pointer transition-colors ${formData.minHotelStars >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`} />
                              </button>
                          ))}
                      </div>
                      <span className="text-sm text-slate-600 pl-1 mt-1 inline-block">{formData.minHotelStars > 0 ? `${formData.minHotelStars} Star${formData.minHotelStars > 1 ? 's' : ''} & Up` : 'Any'}</span>
                  </div>
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <Icon name="car" className="h-5 w-5 mr-3 text-blue-600" />
                      Cars
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Preferred Car Types</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {carTypes.map(type => (
                            <button
                                type="button"
                                key={type}
                                onClick={() => handleCarTypeChange(type)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border-2 ${
                                    formData.preferredCarTypes.includes(type)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                  </div>
              </div>
          </div>
          
          <hr className="border-slate-200" />

          {/* Favorite Destinations Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Icon name="map" className="h-5 w-5 mr-3 text-blue-600" /> 
              Favorite Destinations
            </h3>
            <div>
              <label htmlFor="favoriteDestinations" className="block text-sm font-medium text-slate-700">Add a destination</label>
              <input
                type="text"
                id="favoriteDestinations"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onKeyDown={handleAddDestination}
                placeholder="Type a city or country and press Enter..."
                className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            {formData.favoriteDestinations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
                {formData.favoriteDestinations.map(dest => (
                  <span key={dest} className="inline-flex items-center pl-3 pr-1 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full animate-fade-in-up">
                    {dest}
                    <button
                      type="button"
                      onClick={() => handleRemoveDestination(dest)}
                      className="ml-2 flex-shrink-0 h-5 w-5 rounded-full inline-flex items-center justify-center text-indigo-500 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none"
                      aria-label={`Remove ${dest}`}
                    >
                      <Icon name="x-mark" className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <hr className="border-slate-200" />

          {/* Budget Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Icon name="money" className="h-5 w-5 mr-3 text-blue-600" /> 
              Budget Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="budget.flightMaxPrice" className="block text-sm font-medium text-slate-700">Max Flight Price</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="budget.flightMaxPrice"
                    name="budget.flightMaxPrice"
                    value={formData.budget.flightMaxPrice}
                    onChange={handleChange}
                    placeholder="1200"
                    min="0"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="budget.hotelMaxPrice" className="block text-sm font-medium text-slate-700">Max Price / Night (Hotel)</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="budget.hotelMaxPrice"
                    name="budget.hotelMaxPrice"
                    value={formData.budget.hotelMaxPrice}
                    onChange={handleChange}
                    placeholder="250"
                    min="0"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="budget.carMaxPrice" className="block text-sm font-medium text-slate-700">Max Price / Day (Car)</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="budget.carMaxPrice"
                    name="budget.carMaxPrice"
                    value={formData.budget.carMaxPrice}
                    onChange={handleChange}
                    placeholder="80"
                    min="0"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaved}
          className={`w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors duration-300 ${
            isSaved
              ? 'bg-green-600'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSaved ? (
              <>
                  <Icon name="check-circle" className="mr-2 h-5 w-5" />
                  Preferences Saved!
              </>
          ) : (
              'Save Preferences'
          )}
        </button>
      </form>
    </div>
  );
};

export default React.memo(UserProfile);
