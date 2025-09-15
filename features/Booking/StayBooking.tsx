import React, { useState, useEffect } from 'react';
import { Stay, PassengerDetails, StayBookingConfirmation } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as xanoService from '@/services/xanoService';

interface StayBookingProps {
  stay: Stay;
  onClose: () => void;
  onBookingComplete: (confirmation: StayBookingConfirmation) => void;
}

const StayBooking: React.FC<StayBookingProps> = ({ stay, onClose, onBookingComplete }) => {
  const [step, setStep] = useState(1);
  const [guest, setGuest] = useState<PassengerDetails>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<StayBookingConfirmation | null>(null);
  
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuest(prev => ({...prev, [name]: value}));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmitBooking = async () => {
    setIsProcessing(true);
    try {
      const confirmationResult = await xanoService.bookStay({ stay, guest });
      setBookingConfirmation(confirmationResult);
      setStep(4);
    } catch (error) {
      console.error("Booking failed:", error);
      alert(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    if (bookingConfirmation) {
      onBookingComplete(bookingConfirmation);
    } else {
      onClose();
    }
  };

  const STEPS = ['Review Stay', 'Guest Details', 'Payment', 'Confirmation'];
  const basePrice = stay.pricePerNight * (stay.numberOfNights || 1);
  const taxes = basePrice * 0.15; // Mock 15% taxes/fees
  const totalPrice = basePrice + taxes;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Review Your Stay</h3>
            <div className="flex gap-4">
              <img src={stay.imageUrl} alt={stay.name} className="w-24 h-24 rounded-lg object-cover" />
              <div>
                <p className="font-bold text-slate-800">{stay.name}</p>
                <p className="text-sm text-slate-500">{stay.location}</p>
                <p className="text-sm text-slate-500 mt-1">{stay.numberOfNights || 1} night(s)</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-slate-700">Price Summary</h4>
                <ul className="text-sm text-slate-600 space-y-1 mt-2">
                    <li className="flex justify-between"><span>Base Price ({stay.numberOfNights || 1} nights)</span> <span>${basePrice.toLocaleString()}</span></li>
                    <li className="flex justify-between"><span>Taxes & Fees</span> <span>${taxes.toFixed(2)}</span></li>
                    <li className="flex justify-between font-bold text-slate-800 text-base border-t pt-2 mt-2"><span>Total</span> <span>${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></li>
                </ul>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Lead Guest Details</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="First Name" value={guest.firstName} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm" required />
                <input type="text" name="lastName" placeholder="Last Name" value={guest.lastName} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm" required />
              </div>
              <input type="email" name="email" placeholder="Email Address" value={guest.email} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm" required />
              <input type="tel" name="phone" placeholder="Phone Number" value={guest.phone} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm" />
            </form>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Secure Payment</h3>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700 mb-4">
                <p>This is a simulated payment form. Do not enter real credit card details.</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <input type="text" name="cardholderName" placeholder="Cardholder Name" className="w-full rounded-md border-slate-300 shadow-sm" required />
              <input type="text" name="cardNumber" placeholder="Card Number (e.g., 4242 4242...)" className="w-full rounded-md border-slate-300 shadow-sm" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="expiryDate" placeholder="Expiry Date (MM/YY)" className="w-full rounded-md border-slate-300 shadow-sm" required />
                <input type="text" name="cvv" placeholder="CVV" className="w-full rounded-md border-slate-300 shadow-sm" required />
              </div>
            </form>
          </div>
        );
      case 4:
        if (!bookingConfirmation) {
          return (
            <div className="text-center">
              <LoadingSpinner />
              <p>Finalizing booking...</p>
            </div>
          );
        }
        return (
          <div className="text-center">
            <Icon name="check-circle" className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="mt-4 text-2xl font-bold text-slate-800">Booking Confirmed!</h3>
            <p className="mt-2 text-slate-600">Your stay at {stay.name} is booked. A confirmation has been sent to your email.</p>
            <div className="mt-6 text-left bg-slate-100 p-4 rounded-lg text-sm">
                <p><strong>Booking Reference:</strong> <span className="font-mono bg-slate-200 px-2 py-1 rounded">{bookingConfirmation.bookingReference}</span></p>
                <p className="mt-2"><strong>Guest:</strong> {bookingConfirmation.guest.firstName} {bookingConfirmation.guest.lastName}</p>
                <p><strong>Total Paid:</strong> ${bookingConfirmation.totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-labelledby="booking-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 id="booking-title" className="text-xl font-bold text-slate-800">Complete Your Booking</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close booking"><Icon name="x-mark" className="h-6 w-6" /></button>
          </div>
          {step <= 3 && (
            <div className="mt-4 flex items-center justify-between">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {step > i ? <Icon name="check-circle" className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`ml-2 text-xs hidden sm:inline ${step >= i + 1 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>}
                </React.Fragment>
              ))}
            </div>
          )}
        </header>
        <main className="overflow-y-auto p-6 flex-grow">
          {renderStepContent()}
        </main>
        <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
          <div>
            {step > 1 && step < 4 && <button onClick={handleBack} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-200">Back</button>}
          </div>
          <div>
            {step < 3 && <button onClick={handleNext} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Next</button>}
            {step === 3 && (
              <button
                onClick={handleSubmitBooking}
                disabled={isProcessing}
                className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center"
              >
                {isProcessing && <LoadingSpinner />}<span className={isProcessing ? 'ml-2' : ''}>Confirm and Pay ${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </button>
            )}
            {step === 4 && <button onClick={handleFinish} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Done</button>}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StayBooking;