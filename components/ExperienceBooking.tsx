import React, { useState, useEffect } from 'react';
import { Experience } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ExperienceBookingProps {
  experience: Experience;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}

const ExperienceBooking: React.FC<ExperienceBookingProps> = ({ experience, onClose, onConfirm, t }) => {
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, []);

    const serviceFee = experience.price * 0.15; // 15% commission
    const totalPrice = experience.price + serviceFee;
    
    const handleConfirm = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onConfirm();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Confirm and Pay</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close"><Icon name="x-mark" className="h-6 w-6" /></button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <img src={experience.images[0]} alt={experience.title} className="w-24 h-24 rounded-lg object-cover" />
                        <div>
                            <p className="text-xs text-slate-500">{experience.category}</p>
                            <h3 className="font-bold text-slate-800">{experience.title}</h3>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-slate-700">Price Details</h4>
                        <ul className="text-sm text-slate-600 space-y-1 mt-2">
                            <li className="flex justify-between"><span>${experience.price.toFixed(2)} x 1 guest</span> <span>${experience.price.toFixed(2)}</span></li>
                            <li className="flex justify-between"><span>Flywise.ai service fee</span> <span>${serviceFee.toFixed(2)}</span></li>
                            <li className="flex justify-between font-bold text-slate-800 text-base border-t pt-2 mt-2"><span>Total (USD)</span> <span>${totalPrice.toFixed(2)}</span></li>
                        </ul>
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-slate-700">Pay with</h4>
                        <div className="mt-2 p-3 bg-slate-50 border rounded-md flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Icon name="visa" className="h-8 w-12" />
                                <span>Visa **** 4242</span>
                            </div>
                            <button className="text-xs font-semibold text-blue-600">Change</button>
                        </div>
                        <div className="mt-2 flex justify-center gap-4 opacity-50">
                             <Icon name="paypal" className="h-6"/>
                             <Icon name="mastercard" className="h-6"/>
                             {/* CMI logo placeholder */}
                             <span className="font-bold text-lg">CMI</span>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t bg-slate-50 rounded-b-xl">
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        {isProcessing ? <LoadingSpinner /> : `Confirm Booking ($${totalPrice.toFixed(2)})`}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ExperienceBooking;
