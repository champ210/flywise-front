
import React from 'react';
import { AlternativeSuggestion } from '../../types';
import { Icon } from './Icon';

interface AlternativeSuggestionsDisplayProps {
  suggestions: AlternativeSuggestion[];
  onSelect: (suggestion: AlternativeSuggestion) => void;
}

const AlternativeSuggestionsDisplay: React.FC<AlternativeSuggestionsDisplayProps> = ({ suggestions, onSelect }) => {
  return (
    <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 w-full animate-fade-in-up">
      <h4 className="text-base font-semibold text-slate-800 flex items-center">
        <Icon name="lightbulb" className="h-5 w-5 mr-2 text-indigo-500" />
        Smart Suggestions
      </h4>
      <p className="text-sm text-slate-600 mt-1">Consider these nearby alternatives that could save you time or money.</p>
      <div className="mt-3 space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white p-3 rounded-md border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-grow">
              <p className="font-semibold text-sm text-slate-800">{suggestion.alternativeLocationName}</p>
              <p className="text-xs text-slate-600 mt-1">{suggestion.reason}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                {suggestion.estimatedCostSaving && (
                  <span className="flex items-center font-medium text-green-700">
                    <Icon name="money" className="h-4 w-4 mr-1.5" />
                    {suggestion.estimatedCostSaving}
                  </span>
                )}
                {suggestion.estimatedTimeDifference && (
                  <span className="flex items-center font-medium text-amber-700">
                    <Icon name="clock" className="h-4 w-4 mr-1.5" />
                    {suggestion.estimatedTimeDifference}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelect(suggestion)}
              className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search This Instead
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(AlternativeSuggestionsDisplay);
