
import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import CreateServiceListing from './CreateServiceListing';

interface ServiceProviderDashboardProps {
  onSwitchToFinding: () => void;
}

const StatCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
    <Icon name={icon} className="h-8 w-8 text-blue-500 mx-auto" />
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

const ServiceProviderDashboard: React.FC<ServiceProviderDashboardProps> = ({ onSwitchToFinding }) => {
  const [view, setView] = useState<'dashboard' | 'createListing'>('dashboard');
  const [serviceType, setServiceType] = useState<'food' | 'ride' | null>(null);

  const handleStartListing = (type: 'food' | 'ride') => {
    setServiceType(type);
    setView('createListing');
  };

  if (view === 'createListing' && serviceType) {
    return <CreateServiceListing serviceType={serviceType} onCancel={() => setView('dashboard')} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="text-center">
        <Icon name="briefcase" className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Your Services Dashboard</h2>
        <p className="mt-2 text-md text-slate-600 max-w-2xl mx-auto">
          Manage your service listings, view analytics, and connect with a global audience of travelers.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon="eye" label="Listing Views (30d)" value="0" />
        <StatCard icon="bookmark" label="Total Orders/Rides" value="0" />
        <StatCard icon="money" label="Monthly Earnings" value="$0" />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Food Provider Section */}
        <div className="p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-center">
            <Icon name="food" className="h-10 w-10 text-amber-500 mx-auto" />
            <h3 className="text-xl font-semibold text-slate-800 mt-3">List Your Restaurant</h3>
            <p className="mt-2 text-sm text-slate-600">
                Reach hungry travelers by listing your restaurant or food delivery service on FlyWise.
            </p>
            <button
            onClick={() => handleStartListing('food')}
            className="mt-4 inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Icon name="plus" className="h-5 w-5 mr-2" />
            List Your Restaurant
            </button>
        </div>

        {/* Ride Provider Section */}
        <div className="p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-center">
            <Icon name="car" className="h-10 w-10 text-indigo-500 mx-auto" />
            <h3 className="text-xl font-semibold text-slate-800 mt-3">List Your Ride Service</h3>
            <p className="mt-2 text-sm text-slate-600">
                Offer your taxi or ride-hailing services to travelers in need of convenient transport.
            </p>
            <button
            onClick={() => handleStartListing('ride')}
            className="mt-4 inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Icon name="plus" className="h-5 w-5 mr-2" />
            List Your Ride Service
            </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button onClick={onSwitchToFinding} className="text-sm font-medium text-blue-600 hover:underline">
          Switch back to finding services
        </button>
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
