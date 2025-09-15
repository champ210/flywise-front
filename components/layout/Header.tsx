import React from 'react';
import { Icon } from '../common/Icon';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { getTranslator } from '../../localization';

const Header: React.FC = () => {
  const { isLoggedIn, logout, language, setLanguage, isOffline } = useAuthStore();
  const { openVipModal, openLoginModal, openSignUpModal } = useUIStore();
  
  const t = getTranslator(language);

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
            <button onClick={logout} className="px-3 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={openLoginModal} className="px-3 py-2 text-sm font-semibold rounded-md text-slate-700 hover:bg-slate-100">
              Login
            </button>
            <button onClick={openSignUpModal} className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Create Account
            </button>
          </>
        )}
        
        <div className="h-6 w-px bg-slate-200/80"></div>

        <button onClick={openVipModal} className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200">
          <Icon name="sparkles" className="h-5 w-5 mr-2 text-orange-700" />
          VIP Lounge
        </button>
      </div>
    </header>
  );
};

export default React.memo(Header);
