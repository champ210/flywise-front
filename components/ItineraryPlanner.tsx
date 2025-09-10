
import React, { useState } from 'react';
import { ItineraryPlan, SavedTrip, BudgetOptimizationSuggestion } from '../types';
import { getItinerary, getBudgetOptimizations } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingOverlay from './LoadingOverlay';
import ItineraryDisplay from './ItineraryDisplay';
import LoadingSpinner from './LoadingSpinner';

interface ItineraryPlannerProps {
  onSaveTrip: (tripData: Omit<SavedTrip, 'id' | 'createdAt'>) => void;
  isOffline: boolean;
}

const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ onSaveTrip, isOffline }) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState<number>(3);
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizations, setOptimizations] = useState<BudgetOptimizationSuggestion[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !duration) {
      setError("Please provide a destination and trip duration.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPlan(null);
    setOptimizations([]);
    setOptimizationError(null);

    try {
      const generatedPlan = await getItinerary(destination, duration, interests, budget ? Number(budget) : undefined);
      setPlan(generatedPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeBudget = async () => {
    if (!plan) return;
    setIsOptimizing(true);
    setOptimizationError(null);
    setOptimizations([]);
    try {
        const results = await getBudgetOptimizations(plan);
        setOptimizations(results);
    } catch (err) {
        setOptimizationError(err instanceof Error ? err.message : "Failed to get optimizations.");
    } finally {
        setIsOptimizing(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay message="Crafting your custom itinerary..." />}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800">AI Travel Planner</h2>
          <p className="mt-2 text-sm text-slate-600">
            Let our AI craft the perfect trip for you. Just tell us where you want to go, for how long, and what you're interested in.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-slate-700">Destination</label>
                <input
                  type="text"
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Rome, Italy"
                  className="mt-1 block w-full rounded-md border-transparent bg-slate-100 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
                  required
                />
              </div>
               <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700">Duration (in days)</label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  min="1"
                  max="14"
                  className="mt-1 block w-full rounded-md border-transparent bg-slate-100 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
                  required
                />
              </div>
            </div>
             <div>
              <label htmlFor="budget" className="block text-sm font-medium text-slate-700">Budget (USD, optional)</label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="e.g., 1500"
                min="0"
                className="mt-1 block w-full rounded-md border-transparent bg-slate-100 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-slate-700">Interests & Preferences</label>
              <textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., historical monuments, museums, best Italian restaurants, family-friendly activities..."
                rows={3}
                className="mt-1 block w-full rounded-md border-transparent bg-slate-100 placeholder:text-slate-500 shadow-sm focus:ring-2 focus:ring-blue-500 sm:text-sm px-4 py-2"
              />
            </div>
            {isOffline && (
                <div className="p-3 text-center text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
                    You are currently offline. Please reconnect to generate a new itinerary.
                </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading || isOffline}
                className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
              >
                <Icon name="planner" className="mr-2 h-5 w-5" />
                {isOffline ? 'Offline - Cannot Generate' : 'Generate Plan'}
              </button>
            </div>
          </form>

          <div className="mt-8">
              {error && (
                   <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
                      <Icon name="error" className="h-12 w-12 text-red-500" />
                      <h3 className="mt-4 text-lg font-semibold text-red-800">Failed to Create Itinerary</h3>
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                  </div>
              )}
              {plan && !isLoading && (
                <>
                  <ItineraryDisplay plan={plan} onSaveTrip={onSaveTrip} isOffline={isOffline} />

                  {plan.totalBudget && (
                    <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                            <Icon name="receipt-percent" className="h-6 w-6 mr-3 text-amber-600" />
                            AI Budget Optimizer
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">Your plan has a budget. Let our AI analyze it for potential savings without compromising your experience.</p>
                        <button
                            onClick={handleOptimizeBudget}
                            disabled={isOptimizing}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                        >
                            {isOptimizing ? <LoadingSpinner /> : <Icon name="sparkles" className="h-5 w-5 mr-2" />}
                            {isOptimizing ? 'Optimizing...' : 'Optimize Budget'}
                        </button>
                        
                        {optimizationError && <p className="text-xs text-red-600 mt-2">{optimizationError}</p>}

                        {optimizations.length > 0 && (
                            <div className="mt-4 space-y-3 animate-fade-in-up">
                                {optimizations.map((opt, i) => (
                                    <div key={i} className="bg-white p-3 rounded-md border border-slate-200">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-sm text-slate-800">{opt.type} Suggestion</p>
                                            <p className="font-bold text-sm text-green-600">~${opt.estimatedSavings} Saved</p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Instead of <span className="font-semibold">{opt.originalItem}</span>, consider <span className="font-semibold">{opt.suggestedAlternative}</span>.</p>
                                        <p className="text-xs text-slate-600 italic mt-1">"{opt.reason}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(ItineraryPlanner);
