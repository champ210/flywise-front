import React, { useState } from 'react';
import { Icon } from './Icon';
import CreateCoworkingListing from './CreateCoworkingListing';

interface ProviderDashboardProps {
  onSwitchToFinding: () => void;
}

const StatCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
    <Icon name={icon} className="h-8 w-8 text-blue-500 mx-auto" />
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onSwitchToFinding }) => {
  const [view, setView] = useState<'dashboard' | 'createListing'>('dashboard');

  if (view === 'createListing') {
    return <CreateCoworkingListing onCancel={() => setView('dashboard')} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="text-center">
        <Icon name="building" className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Your Provider Dashboard</h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
          Manage your listings, connect with digital nomads, and grow your business.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon="eye" label="Listing Views (30d)" value="0" />
        <StatCard icon="bookmark" label="Total Bookings" value="0" />
        <StatCard icon="money" label="Monthly Earnings" value="$0" />
      </div>

      <div className="mt-8 text-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800">List Your Workspace</h3>
        <p className="mt-2 text-sm text-slate-600">
          You haven't listed any spaces yet. Create your first listing to start getting bookings from our global community of travelers.
        </p>
        <button
          onClick={() => setView('createListing')}
          className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <Icon name="plus" className="h-5 w-5 mr-2" />
          Create Your First Listing
        </button>
      </div>

      <div className="mt-6 text-center">
        <button onClick={onSwitchToFinding} className="text-sm font-medium text-blue-600 hover:underline">
          Switch back to finding spaces
        </button>
      </div>
    </div>
  );
};

export default ProviderDashboard;