
import React, { useState, useEffect } from 'react';
import { Restaurant, FoodOrderConfirmation } from '@/types';
import { Icon } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface FoodOrderModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onOrderComplete: (confirmation: FoodOrderConfirmation) => void;
}

const FoodOrderModal: React.FC<FoodOrderModalProps> = ({ restaurant, onClose, onOrderComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const total = restaurant.menu.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0) + restaurant.deliveryFee;
  const coinsEarned = Math.floor(total);

  const handleConfirmOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
    }, 2000);
  };

  const handleFinish = () => {
    const confirmation: FoodOrderConfirmation = {
      orderId: `FWO-${Date.now()}`,
      restaurant,
      totalPaid: total,
      estimatedDelivery: restaurant.deliveryTime,
      coinsEarned,
    };
    onOrderComplete(confirmation);
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {isConfirmed ? 'Order Confirmed' : 'Confirm Your Order'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
            <Icon name="x-mark" className="h-6 w-6" />
          </button>
        </header>
        
        {isConfirmed ? (
            <div className="p-6 text-center">
                <Icon name="check-circle" className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="mt-4 text-2xl font-bold text-slate-800">Thank You!</h3>
                <p className="mt-2 text-slate-600">Your order from {restaurant.name} is on its way.</p>
                <div className="mt-6 text-left bg-slate-100 p-4 rounded-lg text-sm space-y-2">
                    <p><strong>Order ID:</strong> <span className="font-mono bg-slate-200 px-2 py-1 rounded">FWO-{Date.now().toString().slice(-6)}</span></p>
                    <p><strong>Estimated Delivery:</strong> {restaurant.deliveryTime}</p>
                    <p><strong>Total Paid:</strong> ${total.toFixed(2)}</p>
                    <p className="font-semibold text-green-600"><strong>FlyWise Coins Earned:</strong> {coinsEarned}</p>
                </div>
                 <button onClick={handleFinish} className="mt-6 w-full px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Done</button>
            </div>
        ) : (
            <>
                <main className="overflow-y-auto p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                            <h3 className="font-bold text-slate-800">{restaurant.name}</h3>
                            <p className="text-sm text-slate-500">via {restaurant.provider}</p>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-slate-700">Order Summary</h4>
                        <ul className="text-sm text-slate-600 space-y-1 mt-2 max-h-32 overflow-y-auto">
                            {restaurant.menu.map(item => (
                                <li key={item.name} className="flex justify-between"><span>{item.name}</span> <span>{item.price}</span></li>
                            ))}
                            <li className="flex justify-between"><span>Delivery Fee</span> <span>${restaurant.deliveryFee.toFixed(2)}</span></li>
                        </ul>
                         <div className="flex justify-between font-bold text-slate-800 text-base border-t pt-2 mt-2">
                             <span>Total</span> <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                     <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-xs text-blue-700">
                        <p>Your payment will be processed securely using your saved payment method in FlyWise Wallet.</p>
                    </div>
                </main>
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                    <button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                        className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        {isProcessing ? <LoadingSpinner /> : 'Confirm and Pay'}
                    </button>
                </footer>
            </>
        )}
      </div>
    </div>
  );
};

export default FoodOrderModal;
