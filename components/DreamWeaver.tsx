
import React, { useState, useCallback } from 'react';
import { VibeSearchResult } from '../types';
import { generateVibeSearchIdeas } from '../services/geminiService';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

const DreamWeaver: React.FC = () => {
  const [vibe, setVibe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VibeSearchResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleInspireMe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibe.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const messages = [
        "Dreaming up your next adventure...",
        "Painting your destination...",
        "Finding matching locations...",
        "Crafting your inspiration...",
    ];

    let messageIndex = 0;
    setLoadingMessage(messages[messageIndex]);
    const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
    }, 2500);

    try {
        const searchResult = await generateVibeSearchIdeas(vibe);
        setResult(searchResult);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
        clearInterval(interval);
    }
  }, [vibe]);
  
  const handleSuggestionClick = (suggestion: string) => {
    setVibe(suggestion);
  };

  const vibeSuggestions = [
    "Ancient ruins, misty mountains, quiet solitude",
    "Vibrant street markets, neon lights, cyberpunk city",
    "Cozy cabin, snowy forest, warm fireplace",
    "Azure waters, white sand beaches, luxury relaxation",
  ];

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <div className="text-center">
        <Icon name="lightbulb" className="h-12 w-12 text-amber-400 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Inspire Me</h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
          Don't know where to go? Describe a feeling, a mood, or a scene, and let our AI dream up your next destination.
        </p>
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        <form onSubmit={handleInspireMe}>
          <textarea
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="e.g., 'A charming old city with cobblestone streets, cozy cafes, and a rich history...'"
            rows={3}
            className="w-full p-4 text-center rounded-lg border-2 border-slate-300 bg-white text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 shadow-sm"
            disabled={isLoading}
          />
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500">Or try one of these:</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
                {vibeSuggestions.map(s => (
                    <button type="button" key={s} onClick={() => handleSuggestionClick(s)} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200">
                        {s}
                    </button>
                ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !vibe.trim()}
            className="mt-4 w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span className="ml-3">{loadingMessage}</span>
              </>
            ) : (
              <>
                <Icon name="sparkles" className="mr-2 h-5 w-5" />
                Inspire Me
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-12">
        {error && (
            <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg">
                <Icon name="error" className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold text-red-800">Failed to Generate Ideas</h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
        )}

        {result && (
          <div className="animate-fade-in-up space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 text-center">Your Vibe, Visualized</h3>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.images.map((imgBase64, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img
                      src={`data:image/jpeg;base64,${imgBase64}`}
                      alt={`AI-generated mood board image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-800 text-center">Destinations That Match Your Vibe</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.destinations.map((dest, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-slate-200 shadow-md text-center">
                    <Icon name="map" className="h-8 w-8 text-blue-500 mx-auto" />
                    <h4 className="mt-3 text-lg font-semibold text-slate-900">{dest.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">{dest.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamWeaver;
