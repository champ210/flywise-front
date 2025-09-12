import React, { useState } from 'react';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';
import { PaymentMethod } from '../types';

interface AddPaymentMethodModalProps {
  onClose: () => void;
  onAddPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onClose, onAddPaymentMethod }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'paypal'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardData, setCardData] = useState({
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: ''
  });
  const [paypalEmail, setPaypalEmail] = useState('');

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };
  
  const formatExpiryDate = (value: string) => {
      let cleanValue = value.replace(/[^0-9]/g, '');
      if (cleanValue.length >= 3) {
        return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
      }
      return cleanValue;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let { name, value } = e.target;
      if (name === 'cardNumber') value = formatCardNumber(value);
      if (name === 'expiryDate') value = formatExpiryDate(value);
      setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let newMethod: Omit<PaymentMethod, 'id'>;

    if (activeTab === 'card') {
      newMethod = {
        type: 'card',
        last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
        expiry: cardData.expiryDate,
        brand: 'visa', // Simplified for this example
      };
    } else {
      newMethod = {
        type: 'paypal',
        email: paypalEmail,
      };
    }

    try {
      await onAddPaymentMethod(newMethod);
      onClose();
    } catch (error) {
      alert('Failed to add payment method.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-backdrop-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-payment-title">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 id="add-payment-title" className="text-xl font-bold text-slate-800">Add Payment Method</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex border-b border-slate-200 mb-6">
              <button type="button" onClick={() => setActiveTab('card')} aria-label="Add Credit or Debit Card" className={`flex-1 py-2 text-sm font-semibold border-b-2 flex items-center justify-center gap-2 ${activeTab === 'card' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-600'}`}>
                <Icon name="credit-card" className="h-5 w-5"/> Credit/Debit Card
              </button>
              <button type="button" onClick={() => setActiveTab('paypal')} aria-label="Connect PayPal Account" className={`flex-1 py-2 text-sm font-semibold border-b-2 flex items-center justify-center gap-2 ${activeTab === 'paypal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-600'}`}>
                 <Icon name="paypal" className="h-5 w-5"/> PayPal
              </button>
            </div>
            {activeTab === 'card' ? (
              <div className="space-y-4 animate-fade-in">
                <div className="w-full h-40 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-4 flex flex-col justify-between text-white shadow-lg">
                    <div className="flex justify-between items-center">
                        <Icon name="wifi" className="h-6 w-6 transform rotate-90"/>
                        <Icon name="visa" className="h-8 w-12"/>
                    </div>
                    <div>
                        <p className="text-xl font-mono tracking-widest h-7">{cardData.cardNumber || '•••• •••• •••• ••••'}</p>
                        <div className="flex justify-between text-xs mt-2">
                            <p className="h-4">{cardData.cardholderName.toUpperCase() || 'CARDHOLDER NAME'}</p>
                            <p>{cardData.expiryDate || 'MM/YY'}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="cardholderName" className="sr-only">Cardholder Name</label>
                    <input id="cardholderName" name="cardholderName" value={cardData.cardholderName} onChange={handleCardChange} placeholder="Cardholder Name" className="w-full rounded-md border-slate-300 shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="cardNumber" className="sr-only">Card Number</label>
                    <input id="cardNumber" name="cardNumber" value={cardData.cardNumber} onChange={handleCardChange} placeholder="Card Number" maxLength={19} className="w-full rounded-md border-slate-300 shadow-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="sr-only">Expiry Date (MM/YY)</label>
                    <input id="expiryDate" name="expiryDate" value={cardData.expiryDate} onChange={handleCardChange} placeholder="Expiry Date (MM/YY)" maxLength={5} className="w-full rounded-md border-slate-300 shadow-sm" required />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="sr-only">CVV</label>
                    <input id="cvv" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="CVV" maxLength={4} className="w-full rounded-md border-slate-300 shadow-sm" required />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-slate-600">You will be redirected to PayPal to securely connect your account.</p>
                <div>
                    <label htmlFor="paypalEmail" className="sr-only">PayPal Email</label>
                    <input id="paypalEmail" name="email" type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="PayPal Email" className="w-full rounded-md border-slate-300 shadow-sm" required />
                </div>
              </div>
            )}
          </div>
          <footer className="p-4 bg-slate-50 rounded-b-xl flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center min-w-[120px]">
              {isSubmitting ? <LoadingSpinner /> : (activeTab === 'card' ? 'Add Card' : 'Connect PayPal')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentMethodModal;
