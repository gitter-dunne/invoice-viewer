import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { formatCurrency } from '../utils/invoiceUtils';

interface PaymentButtonProps {
  amount: number;
  label: string;
  variant: 'deposit' | 'full' | 'tip';
  invoiceId: string;
  icon?: React.ReactNode;
  showTipSection?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  label,
  variant,
  invoiceId,
  icon,
  showTipSection = false
}) => {
  const [loading, setLoading] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(25); // Default to $25
  const [showTipInfo, setShowTipInfo] = useState(false);

  const getButtonStyles = () => {
    const baseStyles = "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case 'deposit':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
      case 'full':
        return `${baseStyles} bg-red-500 text-white hover:bg-red-600 focus:ring-red-500`;
      case 'tip':
        return `${baseStyles} bg-green-500 text-white hover:bg-green-600 focus:ring-green-500`;
      default:
        return `${baseStyles} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`;
    }
  };

  const handleTipChange = (value: number) => {
    setTipAmount(Math.max(0, value)); // Ensure non-negative
  };

  const incrementTip = () => {
    setTipAmount(prev => prev + 5);
  };

  const decrementTip = () => {
    setTipAmount(prev => Math.max(0, prev - 5));
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      let paymentAmount = amount;
      
      // Add tip to payment amount if tip section is shown and tip is added
      if (showTipInfo && tipAmount > 0) {
        paymentAmount = amount + tipAmount;
      }

      // STRIPE INTEGRATION EXAMPLE:
      // This is where you would integrate with your Stripe backend
      // 
      // const response = await fetch('/api/create-payment-intent', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     amount: Math.round(paymentAmount * 100), // Stripe uses cents
      //     currency: 'usd',
      //     invoiceId: invoiceId,
      //     paymentType: variant,
      //     tipAmount: showTipInfo ? tipAmount : 0
      //   }),
      // });
      // 
      // const { clientSecret } = await response.json();
      // 
      // const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);
      // 
      // const result = await stripe!.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: elements.getElement(CardElement)!,
      //     billing_details: {
      //       name: 'Customer Name',
      //     },
      //   }
      // });

      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const tipMessage = showTipInfo && tipAmount > 0 ? ` (including ${formatCurrency(tipAmount)} tip)` : '';
      alert(`Payment of ${formatCurrency(paymentAmount)}${tipMessage} processed successfully!`);
      
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total with tip for display
  const totalWithTip = amount + (showTipInfo ? tipAmount : 0);

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`${getButtonStyles()} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            {icon}
            {showTipInfo && tipAmount > 0 ? 
              `${label.split('(')[0]}(${formatCurrency(totalWithTip)})` : 
              label
            }
          </>
        )}
      </button>

      {/* Tipping Section - Only show for FULL payment when showTipSection is true */}
      {showTipSection && variant === 'full' && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => setShowTipInfo(!showTipInfo)}
            className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
          >
            Questions about tipping?
          </button>
          
          {showTipInfo && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700 mb-4">
                Your enjoyment of the show is all I ask for, and tips are NEVER expected. 
                But if you'd like to leave a token of appreciation, you may enter an amount 
                here to be added to your final payment.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="tipAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Optional Tip Amount
                  </label>
                  
                  {/* Tip Amount Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={decrementTip}
                      disabled={tipAmount <= 0}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center font-bold text-gray-700 transition-colors"
                    >
                      −
                    </button>
                    
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        id="tipAmount"
                        value={tipAmount}
                        onChange={(e) => handleTipChange(parseFloat(e.target.value) || 0)}
                        step="5"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-semibold text-lg"
                      />
                    </div>
                    
                    <button
                      onClick={incrementTip}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Quick Tip Buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[15, 20, 25, 30, 40, 50, 75, 100].map((quickTip) => (
                      <button
                        key={quickTip}
                        onClick={() => setTipAmount(quickTip)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          tipAmount === quickTip
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ${quickTip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Total Update */}
                {tipAmount > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Payment Amount:</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tip Amount:</span>
                      <span className="font-medium text-green-600">+ {formatCurrency(tipAmount)}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-lg text-green-600">{formatCurrency(totalWithTip)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;