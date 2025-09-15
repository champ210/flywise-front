
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UserProfile, SavedTrip, SuperServiceData, Restaurant, RideOption, ServiceApp } from '@/types';
import { getSuperServiceData } from '@/services/geminiService';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ServiceProviderDashboard from '@/components/ServiceProviderDashboard';

interface SuperServicesHubProps {
  userProfile: UserProfile;
  savedTrips: SavedTrip[];
  onOrderFood: (restaurant: Restaurant) => void;
  onBookRide: (ride: RideOption, destination: string) => void;
}

const RestaurantCard: React.FC<{ restaurant: Restaurant, onOrder: () => void }> = ({ restaurant, onOrder }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-slate-200">
        <div className="h-40 bg-slate-100">
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800">{restaurant.name}</h4>
                <div className="flex items-center text-sm">
                    <Icon name="star" className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                </div>
            </div>
            <p className="text-xs text-slate-500">{restaurant.cuisine.join(', ')} &bull; {restaurant.priceRange}</p>
            <div className="mt-3 flex justify-between items-center text-xs text-slate-600">
                <span>{restaurant.deliveryTime}</span>
                <span>${restaurant.deliveryFee.toFixed(2)} Fee</span>
            </div>
            <button onClick={onOrder} className="mt-4 w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                View Menu & Order
            </button>
        </div>
    </div>
);

const RideOptionCard: React.FC<{ ride: RideOption, onBook: () => void }> = ({ ride, onBook }) => (
    <div className="bg-white p-3 rounded-md border border-slate-200 flex items-center justify-between gap-3 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                <Icon name="car" className="h-6 w-6 text-white"/>
            </div>
            <div>
                <p className="font-semibold text-sm text-slate-800">{ride.serviceName} {ride.vehicleType}</p>
                <p className="text-xs text-slate-500">{ride.passengerCapacity} seats &bull; <span className="font-semibold text-green-600">{ride.eta} away</span></p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-lg text-slate-900">${ride.estimatedPrice.toFixed(2)}</p>
            <button onClick={onBook} className="text-xs font-semibold text-blue-600 hover:underline">Book Ride</button>
        </div>
    </div>
);

const ServiceAppCard: React.FC<{ app: ServiceApp }> = ({ app }) => (
    <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
        <p className="font-bold text-sm text-slate-800">{app.name}</p>
        <p className="text-xs text-slate-600 mt-1">{app.description}</p>
    </div>
);


const SuperServicesHub: React.FC<SuperServicesHubProps> = ({ userProfile, savedTrips, onOrderFood, onBookRide }) => {
    const [mode, setMode] = useState<'finding' | 'providing'>('finding');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SuperServiceData | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = useCallback(async () => {
        if (!location.trim()) {
            setError("Please enter a city or location to find services.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const result = await getSuperServiceData(location, userProfile, savedTrips);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [location, userProfile, savedTrips]);
    
    if (mode === 'providing') {
        return <ServiceProviderDashboard onSwitchToFinding={() => setMode('finding')} />;
    }

    const foodApps = data?.availableApps.filter(app => app.category === 'Food Delivery') || [];
    const rideApps = data?.availableApps.filter(app => app.category === 'Ride-Hailing') || [];

    return (
        <div className="max-w-6xl mx-auto p-2 sm:p-4">
             <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-4">
                <div className="text-center sm:text-left">
                    <Icon name="apps" className="h-12 w-12 text-blue-600 mx-auto sm:mx-0" />
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Super Services Hub</h2>
                    <p className="mt-2 text-md text-slate-600 max-w-2xl">
                        Your all-in-one hub for food and transport.
                    </p>
                </div>
                <div ref={dropdownRef} className="relative flex-shrink-0 w-full sm:w-auto">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
                    >
                        {mode === 'finding' ? 'Finding Services' : 'Provider Dashboard'}
                        <Icon name="chevron-down" className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
                            <div className="py-1">
                                <a href="#" onClick={(e) => { e.preventDefault(); setMode('finding'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Find Services</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); setMode('providing'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Become a Provider</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 max-w-lg mx-auto p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter your current city (e.g., Tokyo)"
                        className="flex-1 block w-full rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-lg p-3"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !location.trim()}
                        className="inline-flex items-center justify-center h-12 w-28 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Search'}
                    </button>
                </div>
            </div>

            {isLoading && (
                 <div className="text-center p-10">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-600">Finding services in {location}...</p>
                </div>
            )}

            {error && (
                <div className="mt-8 text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
                    <Icon name="error" className="h-12 w-12 text-red-500 mx-auto" />
                    <h3 className="mt-4 text-lg font-semibold text-red-800">Could Not Find Services</h3>
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                </div>
            )}
            
            {data && (
                <div className="mt-8 animate-fade-in-up space-y-8">
                     {data.smartCombo && (
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Icon name="sparkles" className="h-5 w-5 text-indigo-500" /> Smart Combo Suggestion</h3>
                            <p className="text-sm text-slate-600 mt-1">{data.smartCombo.description}</p>
                            <div className="mt-3 bg-white p-3 rounded-md flex flex-col md:flex-row gap-4">
                                <div className="flex-1"><RestaurantCard restaurant={data.smartCombo.restaurant} onOrder={() => onOrderFood(data.smartCombo.restaurant)} /></div>
                                <div className="flex items-center justify-center"><Icon name="plus" className="h-6 w-6 text-slate-400" /></div>
                                <div className="flex-1"><RideOptionCard ride={data.smartCombo.ride} onBook={() => onBookRide(data.smartCombo.ride, data.smartCombo.restaurant.name)} /></div>
                            </div>
                        </div>
                    )}
                    {data.foodSuggestions.length > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-bold text-green-800 flex items-center gap-2"><Icon name="lightbulb" className="h-5 w-5 text-green-600" /> AI Recommendations for You</h3>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.foodSuggestions.map(sugg => (
                                    <div key={sugg.restaurant.id} className="bg-white p-3 rounded-md border border-slate-200">
                                        <p className="text-xs text-slate-500 italic mb-2">"{sugg.reason}"</p>
                                        <RestaurantCard restaurant={sugg.restaurant} onOrder={() => onOrderFood(sugg.restaurant)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     {data.rideSuggestion && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-bold text-green-800 flex items-center gap-2"><Icon name="lightbulb" className="h-5 w-5 text-green-600" /> AI Ride Suggestion</h3>
                            <p className="text-sm text-slate-600 mt-1">{data.rideSuggestion.reason}</p>
                            <div className="mt-3 bg-white p-3 rounded-md space-y-2">
                                {data.rideSuggestion.options.map(opt => <RideOptionCard key={opt.id} ride={opt} onBook={() => onBookRide(opt, data.rideSuggestion!.destination)} />)}
                            </div>
                        </div>
                    )}

                    {(foodApps.length > 0 || rideApps.length > 0) && (
                        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Available Services in {location}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {foodApps.length > 0 && (
                                <div>
                                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Icon name="food" className="h-5 w-5"/> Food Delivery Apps</h4>
                                <div className="space-y-3">
                                    {foodApps.map(app => <ServiceAppCard key={app.name} app={app} />)}
                                </div>
                                </div>
                            )}
                            {rideApps.length > 0 && (
                                <div>
                                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Icon name="car" className="h-5 w-5"/> Ride-Hailing Apps</h4>
                                <div className="space-y-3">
                                    {rideApps.map(app => <ServiceAppCard key={app.name} app={app} />)}
                                </div>
                                </div>
                            )}
                            </div>
                        </div>
                    )}

                    {data.restaurants.length > 0 && (
                         <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">All Restaurants in {location}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {data.restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} onOrder={() => onOrderFood(r)} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SuperServicesHub;
