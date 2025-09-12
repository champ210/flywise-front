import React, { useState } from 'react';
import { Transaction, UserProfile as UserProfileType, PaymentMethod } from '../types';
import { Icon } from './Icon';
import FlyWiseCard from './FlyWiseCard';
import LoadingSpinner from './LoadingSpinner';
import AddPaymentMethodModal from './AddPaymentMethodModal';

interface WalletProps {
    isLoggedIn: boolean;
    onLoginClick: () => void;
    userProfile: UserProfileType;
    transactions: Transaction[];
    onAddPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
    onDeletePaymentMethod: (methodId: string) => Promise<void>;
    onSetPrimaryPaymentMethod: (methodId: string) => Promise<void>;
}

const Wallet: React.FC<WalletProps> = ({ isLoggedIn, onLoginClick, userProfile, transactions, onAddPaymentMethod, onDeletePaymentMethod, onSetPrimaryPaymentMethod }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleDelete = async (methodId: string) => {
        if (!window.confirm('Are you sure you want to remove this payment method?')) return;
        setIsLoading(true);
        try {
            await onDeletePaymentMethod(methodId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete method.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSetPrimary = async (methodId: string) => {
        setIsLoading(true);
        try {
            await onSetPrimaryPaymentMethod(methodId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to set primary method.");
        } finally {
            setIsLoading(false);
        }
    };

    const getCardIcon = (brand: PaymentMethod['brand']) => {
        switch (brand) {
            case 'visa': return 'visa';
            case 'mastercard': return 'mastercard';
            default: return 'credit-card';
        }
    };

    const PaymentMethodCard: React.FC<{ method: PaymentMethod }> = ({ method }) => {
        const isPrimary = method.isPrimary;
        return (
            <div className={`group relative bg-white p-4 rounded-lg border-2 transition-all ${isPrimary ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                {isPrimary && <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PRIMARY</div>}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Icon name={method.type === 'card' ? getCardIcon(method.brand) : 'paypal'} className={`h-8 w-8 ${isPrimary ? 'text-blue-600' : 'text-slate-500'}`} />
                        <div>
                            <p className="font-semibold text-sm text-slate-800">
                                {method.type === 'card' ? `${method.brand?.toUpperCase()} •••• ${method.last4}` : 'PayPal'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {method.type === 'card' ? `Expires ${method.expiry}` : method.email}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => handleDelete(method.id)} disabled={isLoading} className="p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500">
                        <Icon name="trash" className="h-4 w-4"/>
                    </button>
                </div>
                {!isPrimary && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                        <button onClick={() => handleSetPrimary(method.id)} disabled={isLoading} className="text-xs font-semibold text-blue-600 hover:underline">
                            Set as primary
                        </button>
                    </div>
                )}
            </div>
        );
    };

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
        <>
            {isAddModalOpen && <AddPaymentMethodModal onClose={() => setIsAddModalOpen(false)} onAddPaymentMethod={onAddPaymentMethod} />}
            <div className="max-w-2xl mx-auto p-2 sm:p-4 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">My Wallet</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Your FlyWise.AI VIP Virtual Card and saved payment methods.
                    </p>
                </div>

                <FlyWiseCard />

                {/* Payment Methods */}
                <div className="mt-10">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Methods</h3>
                    {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                    <div className="space-y-3">
                        {userProfile.paymentMethods?.map(method => (
                           <PaymentMethodCard key={method.id} method={method} />
                        ))}
                         <button onClick={() => setIsAddModalOpen(true)} className="w-full p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-slate-50 transition-colors text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2">
                            <Icon name="plus" className="h-5 w-5" />
                            <span className="font-semibold text-sm">Add a new payment method</span>
                        </button>
                    </div>
                </div>


                {/* Recent Transactions */}
                <div className="mt-10">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 divide-y divide-slate-200">
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-sm text-slate-800">{tx.description}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-800'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-slate-500 py-4">No transactions yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Wallet;