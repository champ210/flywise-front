import React from 'react';
import { Icon } from '../components/common/Icon';
import { useUIStore } from '../stores/useUIStore';
import { PRIMARY_TABS, MORE_TABS } from './constants';

const NavigationBar: React.FC = () => {
    const { activeTab, setActiveTab, isMoreMenuOpen, toggleMoreMenu, closeMoreMenu } = useUIStore();
    const isMoreTabActive = MORE_TABS.some(t => t.name === activeTab);

    return (
        <div className="border-b border-slate-200/80 px-4 flex items-center justify-between">
            <div className="flex items-center">
                <div className="flex space-x-2 overflow-x-auto custom-scrollbar">
                    {PRIMARY_TABS.map(({ name, icon }) => (
                        <button 
                            key={name}
                            onClick={() => setActiveTab(name)}
                            className={`flex items-center px-4 py-3 border-b-2 ${activeTab === name ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                            aria-current={activeTab === name ? 'page' : undefined}
                        >
                            <Icon name={icon} className="h-5 w-5" />
                            <span className="ml-2 text-sm font-semibold">{name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="relative">
                <button 
                    onClick={toggleMoreMenu}
                    className={`flex items-center px-4 py-3 border-b-2 ${isMoreTabActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                    aria-haspopup="true"
                    aria-expanded={isMoreMenuOpen}
                >
                    <span className={`text-sm font-semibold ${isMoreTabActive ? 'text-blue-600' : 'text-slate-600'}`}>More</span>
                    <Icon name="chevron-down" className={`h-5 w-5 ml-1 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMoreMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-50 animate-fade-in-up">
                        <div>
                            {MORE_TABS.map(({name, icon}) => (
                                <button
                                    key={name}
                                    onClick={() => { setActiveTab(name); closeMoreMenu(); }}
                                    className={`w-full flex items-center px-3 py-2 rounded-md text-left ${activeTab === name ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100'}`}
                                    aria-current={activeTab === name ? 'page' : undefined}
                                >
                                    <Icon name={icon} className={`h-5 w-5 mr-3 ${activeTab === name ? 'text-blue-600' : 'text-slate-500'}`} />
                                    <span className={`text-sm font-medium ${activeTab === name ? 'text-blue-600' : 'text-slate-700'}`}>{name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NavigationBar;
