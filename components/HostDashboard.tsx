import React, { useState } from 'react';
import { Icon } from './Icon';
import CreateHostProfile from './CreateHostProfile';
import CreateExperienceListing from './CreateExperienceListing';

interface HostDashboardProps {
  onSwitchToFinding: () => void;
}

const StatCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
    <Icon name={icon} className="h-8 w-8 text-blue-500 mx-auto" />
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

const HostDashboard: React.FC<HostDashboardProps> = ({ onSwitchToFinding }) => {
  const [view, setView] = useState<'dashboard' | 'createProfile' | 'createExperience'>('dashboard');

  if (view === 'createProfile') {
    return <CreateHostProfile onCancel={() => setView('dashboard')} />;
  }

  if (view === 'createExperience') {
    return <CreateExperienceListing onCancel={() => setView('dashboard')} />;
  }


  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="text-center">
        <Icon name="home" className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Your Host Dashboard</h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
          Welcome guests from around the world. Share your space, your culture, and create unforgettable travel memories.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon="eye" label="Profile Views (30d)" value="0" />
        <StatCard icon="chat-bubble" label="New Messages" value="0" />
        <StatCard icon="calendar" label="Upcoming Stays" value="0" />
      </div>

      <div className="mt-8 text-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800">Manage Your Listings</h3>
        <p className="mt-2 text-sm text-slate-600">
          Create and manage your profiles for hosting travelers or offering local experiences.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button
            onClick={() => setView('createProfile')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Icon name="plus" className="h-5 w-5 mr-2" />
            Manage Host Profile
            </button>
             <button
            onClick={() => setView('createExperience')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            <Icon name="plus" className="h-5 w-5 mr-2" />
            Create an Experience
            </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button onClick={onSwitchToFinding} className="text-sm font-medium text-blue-600 hover:underline">
          Switch back to finding connections
        </button>
      </div>
    </div>
  );
};

export default HostDashboard;
