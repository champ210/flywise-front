
import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenVipModal: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoutClick: () => void;
  isOffline: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenVipModal, isLoggedIn, onLoginClick, onSignUpClick, onLogoutClick, isOffline }) => {
  return (
    <header className="bg-white shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="logo" className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            FlyWise.AI
          </h1>
          {isOffline && (
            <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-slate-700 text-white text-xs font-semibold animate-fade-in">
              <Icon name="wifi-slash" className="h-4 w-4 text-slate-300" />
              <span>Offline Mode</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">Welcome!</span>
              <button 
                onClick={onLogoutClick}
                className="px-3 sm:px-4 py-2 border border-slate-300 text-xs sm:text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md px-2 py-1 whitespace-nowrap"
              >
                Login
              </button>
              <button 
                onClick={onSignUpClick}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-slate-300 text-xs sm:text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
              >
                Create Account
              </button>
            </>
          )}
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <button 
                onClick={onOpenVipModal}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 whitespace-nowrap"
            >
              <Icon name="sparkles" className="mr-2 h-5 w-5 text-amber-500" />
              <span className="hidden sm:inline">VIP Lounge</span>
              <span className="sm:hidden">VIP</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);