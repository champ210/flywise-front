import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/Icon';
// FIX: The Language type is exported from the auth store, not the main App component.
import { Language } from '@/stores/useAuthStore';

interface HeaderProps {
  onOpenVipModal: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoutClick: () => void;
  isOffline: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ onOpenVipModal, isLoggedIn, onLoginClick, onSignUpClick, onLogoutClick, isOffline, language, setLanguage, t }) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  ];

  return (
    <header className="p-4 flex items-center justify-between border-b border-slate-200/80">
      <div className="flex items-center">
        <Icon name="logo" className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800 ml-3">FlyWise.AI</h1>
        {isOffline && (
          <div className="ml-4 flex items-center px-3 py-1.5 rounded-full bg-slate-700">
            <Icon name="wifi-slash" className="h-4 w-4 text-slate-300" />
            <span className="text-white text-xs font-semibold ml-2">Offline Mode</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            <p className="text-sm font-medium text-slate-700">Welcome!</p>
            <button onClick={onLogoutClick} className="px-3 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={onLoginClick} className="px-3 py-2 text-sm font-semibold rounded-md text-slate-700 hover:bg-slate-100">
              Login
            </button>
            <button onClick={onSignUpClick} className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Create Account
            </button>
          </>
        )}
        
        <div className="h-6 w-px bg-slate-200/80"></div>

        <button onClick={onOpenVipModal} className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200">
          <Icon name="sparkles" className="h-5 w-5 mr-2 text-orange-700" />
          VIP Lounge
        </button>
      </div>
    </header>
  );
};

export default React.memo(Header);