
import React, { useState, useEffect } from 'react';
import { CoworkingSpace, CoworkingBookingConfirmation } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CoworkingBookingProps {
  space: CoworkingSpace;
  onClose: () => void;
  onBookingComplete: (confirmation: CoworkingBookingConfirmation) => void;
}

const QRCode: React.FC<{ value: string }> = ({ value }) => (
  <img
    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(value)}&bgcolor=f8fafc`}
    alt="QR Code for entry"
    className="mx-auto"
  />
);

const CoworkingBooking: React.FC<CoworkingBookingProps> = ({ space, onClose, onBookingComplete }) => {
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<'hotDesk' | 'privateOffice'>('hotDesk');
  const [duration, setDuration] = useState<'day' | 'month'>('day');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4); // Go to confirmation
    }, 2000);
  };

  const price = duration === 'day' ? space.price.perDay : space.price.perMonth;
  const taxes = price * 0.1; // 10% mock tax
  const totalPaid = price + taxes;
  const coinsEarned = Math.floor(totalPaid);

  const handleFinish = () => {
    const confirmation: CoworkingBookingConfirmation = {
      bookingReference: `FW-CW-${Date.now().toString().slice(-6)}`,
      space,
      user: { firstName: 'Valued', lastName: 'Member', email: '', dateOfBirth: '', phone: '' }, // Mock user
      bookingType,
      duration: `1 ${duration}`,
      totalPaid,
      coinsEarned,
    };
    onBookingComplete(confirmation);
  };
  
  const renderStepContent = () => {
    switch(step) {
      case 1: // Selection
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Review Your Booking</h3>
            <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <img src={space.imageUrl} alt={space.name} className="w-24 h-24 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold text-slate-800">{space.name}</h4>
                <p className="text-sm text-slate-500">{space.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Icon name="star" className="h-4 w-4 text-yellow-400"/>
                  <span className="text-xs font-semibold">{space.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Booking Type</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button onClick={() => setBookingType('hotDesk')} className={`p-3 text-sm rounded-md border-2 text-left ${bookingType === 'hotDesk' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                  <p className="font-semibold">Hot Desk</p>
                  <p className="text-xs">{space.availability.hotDesks} available</p>
                </button>
                 <button onClick={() => setBookingType('privateOffice')} className={`p-3 text-sm rounded-md border-2 text-left ${bookingType === 'privateOffice' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                  <p className="font-semibold">Private Office</p>
                  <p className="text-xs">{space.availability.privateOffices} available</p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Duration</label>
               <div className="mt-1 grid grid-cols-2 gap-2">
                <button onClick={() => setDuration('day')} className={`p-3 text-sm rounded-md border-2 text-left ${duration === 'day' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                  <p className="font-semibold">Daily Access</p>
                  <p className="text-xs">${space.price.perDay}/day</p>
                </button>
                 <button onClick={() => setDuration('month')} className={`p-3 text-sm rounded-md border-2 text-left ${duration === 'month' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                  <p className="font-semibold">Monthly</p>
                  <p className="text-xs">${space.price.perMonth}/month</p>
                </button>
              </div>
            </div>
          </div>
        );
      case 2: // Pre-booking Summary
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Booking Summary</h3>
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-semibold">WORKSPACE</p>
                <p className="font-bold text-slate-800">{space.name}</p>
                <p className="text-sm text-slate-600">{space.location}</p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500 font-semibold">DETAILS</p>
                <p className="text-sm text-slate-800 capitalize">{bookingType === 'hotDesk' ? 'Hot Desk' : 'Private Office'} for 1 {duration}</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-slate-700">Price Summary</h4>
                <ul className="text-sm text-slate-600 space-y-1 mt-2">
                    <li className="flex justify-between"><span>Base Price</span> <span>${price.toLocaleString()}</span></li>
                    <li className="flex justify-between"><span>Taxes & Fees (est.)</span> <span>${taxes.toFixed(2)}</span></li>
                    <li className="flex justify-between font-bold text-slate-800 text-base border-t pt-2 mt-2"><span>Total</span> <span>${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></li>
                </ul>
            </div>
          </div>
        );
      case 3: // Payment
        return (
           <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Confirm Payment</h3>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700 mb-4">
                <p>Your booking will be securely charged to your FlyWise.AI VIP Card.</p>
            </div>
            <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-700">Price Summary</h4>
                <ul className="text-sm text-slate-600 space-y-1 mt-2">
                    <li className="flex justify-between"><span>{bookingType === 'hotDesk' ? 'Hot Desk' : 'Private Office'} (1 {duration})</span> <span>${price.toLocaleString()}</span></li>
                    <li className="flex justify-between"><span>Taxes & Fees</span> <span>${taxes.toFixed(2)}</span></li>
                    <li className="flex justify-between font-bold text-slate-800 text-base border-t pt-2 mt-2"><span>Total</span> <span>${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></li>
                </ul>
            </div>
          </div>
        );
      case 4: // Confirmation
        return (
           <div className="text-center">
            <Icon name="check-circle" className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="mt-4 text-2xl font-bold text-slate-800">Workspace Confirmed!</h3>
            <p className="mt-2 text-slate-600">Your booking at {space.name} is confirmed. Use the QR code below for instant access.</p>
            <div className="mt-6 bg-slate-50 p-4 rounded-lg">
                <QRCode value={`flywise-access:${space.id}:${Date.now()}`} />
            </div>
            <div className="mt-4 text-left text-sm">
                <p><strong>Booking Ref:</strong> {`FW-CW-${Date.now().toString().slice(-6)}`}</p>
                <p className="font-semibold text-green-600"><strong>FlyWise Coins Earned:</strong> {coinsEarned}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Book Workspace</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100"><Icon name="x-mark" className="h-6 w-6" /></button>
          </div>
        </header>
        <main className="overflow-y-auto p-6 flex-grow">{renderStepContent()}</main>
        <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
            <div>
                {step < 4 && (
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">
                        Cancel
                    </button>
                )}
            </div>
            <div className="flex items-center gap-2">
                {step > 1 && step < 4 && (
                    <button onClick={handleBack} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-200">
                        Back
                    </button>
                )}
                {step === 1 && (
                    <button onClick={handleNext} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Review Summary
                    </button>
                )}
                {step === 2 && (
                    <button onClick={handleNext} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Proceed to Payment
                    </button>
                )}
                {step === 3 && (
                <button
                    onClick={handleSubmitBooking}
                    disabled={isProcessing}
                    className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center"
                >
                    {isProcessing && <LoadingSpinner />}
                    <span className={isProcessing ? 'ml-2' : ''}>Confirm & Pay ${totalPaid.toFixed(2)}</span>
                </button>
                )}
                {step === 4 && (
                    <button onClick={handleFinish} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Done
                    </button>
                )}
            </div>
        </footer>
      </div>
    </div>
  );
};

export default CoworkingBooking;
