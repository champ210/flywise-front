import React from 'react';
import { Transaction } from '../../types';
import { Icon } from './Icon';
import FlyWiseCard from './FlyWiseCard';

interface WalletProps {
    isLoggedIn: boolean;
    onLoginClick: () => void;
}

const mockTransactions: Transaction[] = [
    { id: '1', description: 'Lounge Access - JFK Terminal 4', date: '2024-07-18T14:30:00Z', amount: 35.00, type: 'debit' },
    { id: '2', description: 'Flight Perk - Emirates Seat Upgrade', date: '2024-07-15T09:15:00Z', amount: 50.00, type: 'debit' },
    { id: '3', description: 'Monthly Subscription Fee', date: '2024-07-01T00:00:00Z', amount: 9.99, type: 'debit' },
    { id: '4', description: 'Welcome Bonus', date: '2024-06-25T10:00:00Z', amount: 10.00, type: 'credit' },
];

const Wallet: React.FC<WalletProps> = ({ isLoggedIn, onLoginClick }) => {
    if (!isLoggedIn) {
        return (
            <div className="text-center py-12">
                <Icon name="wallet" className="mx-auto h-16 w-16 text-slate-400" />
                <h3 className="mt-4 text-xl font-semibold text-slate-800">Your Wallet is Waiting</h3>
                <p className="mt-2 text-sm text-slate-500">Log in or create an account to access your VIP Virtual Card and exclusive benefits.</p>
                <button
                    onClick={onLoginClick}
                    className="mt-6 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Login to View Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-2 sm:p-4 animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">My Wallet</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Your FlyWise.AI VIP Virtual Card for seamless travel experiences.
                </p>
            </div>

            {/* Virtual Card */}
            <div className="flex justify-center mb-8">
                <FlyWiseCard />
            </div>

            {/* Recent Transactions */}
            <div className="mt-10">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
                <div className="bg-white p-4 rounded-lg border border-slate-200 divide-y divide-slate-200">
                    {mockTransactions.map(tx => (
                        <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-slate-800">{tx.description}</p>
                                <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                            <p className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-800'}`}>
                                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
