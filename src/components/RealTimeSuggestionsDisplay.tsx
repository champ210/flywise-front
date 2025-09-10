import React from 'react';
import { RealTimeSuggestion } from '../../types';
import { Icon } from './Icon';

interface RealTimeSuggestionsDisplayProps {
  suggestions: RealTimeSuggestion[];
  onSelect: (suggestion: RealTimeSuggestion) => void;
}

const RealTimeSuggestionsDisplay: React.FC<RealTimeSuggestionsDisplayProps> = ({ suggestions, onSelect }) => {
  return (
    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 w-full animate-fade-in-up">
      <h4 className="text-base font-semibold text-slate-800 flex items-center">
        <Icon name="compass" className="h-5 w-5 mr-2 text-green-600" />
        Here are some ideas for what you can do right now:
      </h4>
      <div className="mt-3 space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white p-3 rounded-md border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-shadow hover:shadow-md">
            <div className="flex-grow">
              <p className="font-semibold text-sm text-slate-800">{suggestion.name}</p>
              <p className="text-xs text-slate-600 mt-1">{suggestion.reason}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs border-t border-slate-100 pt-2">
                {suggestion.travelTime && (
                  <span className="flex items-center font-medium text-slate-600">
                    <Icon name="clock" className="h-4 w-4 mr-1.5" />
                    {suggestion.travelTime}
                  </span>
                )}
                {suggestion.openingHours && (
                  <span className="flex items-center font-medium text-slate-600">
                    <Icon name="check-circle" className="h-4 w-4 mr-1.5 text-green-500" />
                    {suggestion.openingHours}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelect(suggestion)}
              className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Let's go!
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RealTimeSuggestionsDisplay);