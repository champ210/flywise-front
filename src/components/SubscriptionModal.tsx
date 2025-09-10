
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface SubscriptionModalProps {
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    // Mock API call to a backend
    setTimeout(() => {
        setStatus('success');
        setTimeout(onClose, 2000); // Close modal after 2 seconds on success
    }, 1500);
  };

  const features = [
    "Access to 1,300+ airport lounges worldwide",
    "Instant digital virtual card in your wallet",
    "Complimentary pre-flight bites and drinks",
    "Quiet, connected spaces to work or relax"
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-labelledby="vip-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center bg-amber-50 border-b border-amber-200">
          <div className="mx-auto bg-amber-100 rounded-full h-16 w-16 flex items-center justify-center">
            <Icon name="sparkles" className="h-9 w-9 text-amber-500" />
          </div>
          <h2 id="vip-modal-title" className="mt-4 text-2xl font-bold text-slate-800">
            Get Your FlyWise.AI VIP Virtual Card
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Upgrade your airport experience. Subscribe now for instant access to VIP lounges globally.
          </p>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {status === 'success' ? (
            <div className="text-center py-12">
              <Icon name="check-circle" className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold text-slate-800">Welcome to the Club!</h3>
              <p className="mt-2 text-slate-600">Your VIP Virtual Card is being generated and will be sent to your email shortly.</p>
            </div>
          ) : (
            <>
              <ul className="space-y-3 mb-6">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Icon name="check-circle" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                    required
                    disabled={status === 'loading'}
                  />
                </div>
                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    'Get My Card for $9.99/month'
                  )}
                </button>
              </form>
              <p className="mt-4 text-xs text-center text-slate-500">
                By subscribing, you agree to our Terms of Service. Cancel anytime.
              </p>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <Icon name="x-mark" className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;
