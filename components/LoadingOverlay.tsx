import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Icon } from '@/components/Icon';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 flex flex-col justify-center items-center backdrop-blur-sm animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white rounded-lg p-8 shadow-xl text-center flex flex-col items-center">
        <Icon name="logo" className="h-12 w-12 text-blue-600 animate-pulse" />
        <p className="mt-4 text-lg font-semibold text-slate-800">{message}</p>
        <p className="mt-2 text-sm text-slate-500">This may take a few moments, please don't close the window.</p>
        <div className="mt-6">
            <LoadingSpinner />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;