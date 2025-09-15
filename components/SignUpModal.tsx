import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as xanoService from '@/services/xanoService';

interface SignUpModalProps {
  onClose: () => void;
  onSignUpSuccess: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSignUpSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMessage('Please fill in all fields.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      await xanoService.signup(name, email, password);
      onSignUpSuccess();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <Icon name="logo" className="h-10 w-10 text-blue-600 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-slate-800">Create Your Account</h2>
          <p className="mt-2 text-sm text-slate-600">Join FlyWise.AI to start planning your travels.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div>
              <label htmlFor="name-signup" className="sr-only">Full Name</label>
              <input id="name-signup" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full rounded-md border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div>
              <label htmlFor="email-signup" className="sr-only">Email Address</label>
              <input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full rounded-md border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div>
              <label htmlFor="password-signup" className="sr-only">Password</label>
              <input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
          <button type="submit" disabled={status === 'loading'} className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
            {status === 'loading' ? <LoadingSpinner /> : 'Create Account'}
          </button>
        </form>
        <div className="p-6 pt-2 text-center bg-slate-50 rounded-b-xl">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
