import React, { useState } from 'react';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
  onSwitchToSignUp: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in both fields.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    // Simulate API call
    setTimeout(() => {
      onLoginSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <Icon name="logo" className="h-10 w-10 text-blue-600 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">Login to access your trips and preferences.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div>
            <label htmlFor="email-login" className="sr-only">Email Address</label>
            <input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full rounded-md border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div>
            <label htmlFor="password-login" className="sr-only">Password</label>
            <input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
          <button type="submit" disabled={status === 'loading'} className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">
            {status === 'loading' ? <LoadingSpinner /> : 'Login'}
          </button>
        </form>
        <div className="p-6 pt-2 text-center bg-slate-50 rounded-b-xl">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignUp} className="font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;