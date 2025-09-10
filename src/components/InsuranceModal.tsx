import React, { useEffect, useState } from 'react';
import { SavedTrip, TravelInsuranceQuote } from '../../types';
import { Icon } from './Icon';

interface InsuranceModalProps {
  trip: SavedTrip;
  quotes: TravelInsuranceQuote[];
  onClose: () => void;
}

const InsuranceQuoteCard: React.FC<{ quote: TravelInsuranceQuote }> = ({ quote }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 p-4 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-slate-800">{quote.provider}</h4>
                    <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full whitespace-nowrap">{quote.bestFor}</span>
                </div>
                <div className="my-4 text-center">
                    <p className="text-4xl font-bold text-slate-900">${quote.price.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Total Price</p>
                </div>
                <div className="space-y-3 text-sm">
                    <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-600">Medical Coverage:</span>
                            <span className="font-bold text-slate-800">${quote.coverage.medical.limit.toLocaleString()}</span>
                        </div>
                        {isExpanded && <p className="text-xs text-slate-600 mt-1 animate-fade-in-up">{quote.coverage.medical.description}</p>}
                    </div>
                     <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-600">Cancellation Coverage:</span>
                            <span className="font-bold text-slate-800">${quote.coverage.cancellation.limit.toLocaleString()}</span>
                        </div>
                        {isExpanded && <p className="text-xs text-slate-600 mt-1 animate-fade-in-up">{quote.coverage.cancellation.description}</p>}
                    </div>
                     <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-600">Baggage Coverage:</span>
                            <span className="font-bold text-slate-800">${quote.coverage.baggage.limit.toLocaleString()}</span>
                        </div>
                        {isExpanded && <p className="text-xs text-slate-600 mt-1 animate-fade-in-up">{quote.coverage.baggage.description}</p>}
                    </div>
                </div>
            </div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                {isExpanded ? 'Hide Details' : 'View Details'}
            </button>
        </div>
    );
};


const InsuranceModal: React.FC<InsuranceModalProps> = ({ trip, quotes, onClose }) => {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        aria-labelledby="insurance-title"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
    >
      <div 
        className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-slate-50 rounded-t-xl">
          <div className="flex items-center">
             <Icon name="shield" className="h-7 w-7 mr-3 text-blue-500" />
            <h2 id="insurance-title" className="text-xl font-bold text-slate-800">
              Insurance Quotes for {trip.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            aria-label="Close insurance quotes"
          >
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </header>
        
        <main className="overflow-y-auto p-6">
            {quotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quotes.map((quote, index) => (
                        <InsuranceQuoteCard key={index} quote={quote} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10">
                    <Icon name="search" className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No insurance quotes found</h3>
                    <p className="mt-1 text-sm text-slate-500">We couldn't generate any insurance quotes for this trip. Please try again later.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default InsuranceModal;