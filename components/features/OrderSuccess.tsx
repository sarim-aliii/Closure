import React from 'react';
import { OrderSuccessProps } from '../../types';
import CheckCircle from '../icons/CheckCircle';
import Share from '../icons/Share';

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order, onViewOrders, onContinueShopping, onClose }) => {
  if (!order) {
    return (
        <div className="p-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">Order details not available.</p>
            <button
                onClick={onClose}
                className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm border border-gray-300 dark:border-gray-600"
            >
                Close
            </button>
        </div>
    );
  }
  
  const { id: orderId, totalAmount, paymentMethod, transactionId, paymentDetails, orderDate } = order;

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Closure Order Receipt',
                text: `Order Confirmed! \nOrder ID: ${orderId}\nAmount: ₹${totalAmount}\nItem: Closure Store Purchase`,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    } else {
        alert("Sharing is not supported on this browser.");
    }
  };

  // Helper to format date safely
  const formattedDate = orderDate instanceof Date 
    ? orderDate.toLocaleString() 
    // @ts-ignore - Handle firestore timestamp if it leaks through
    : orderDate?.toDate ? orderDate.toDate().toLocaleString() 
    : new Date().toLocaleString();

  return (
    <div className="p-2 sm:p-4 text-center">
      <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Order Placed Successfully!</h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">Thank you for your purchase with Closure.</p>
      
      {/* Share Button */}
      <div className="flex justify-center mb-4">
          <button 
            onClick={handleShare}
            className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:underline focus:outline-none"
          >
            <Share className="w-4 h-4 mr-1" />
            Share Receipt
          </button>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
        Order ID: <span className="font-medium text-indigo-600 dark:text-indigo-400">{orderId}</span>
      </p>

      {/* Transaction Details Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-left text-xs sm:text-sm mb-5">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 text-sm sm:text-base text-center border-b border-gray-200 dark:border-gray-600 pb-2">Transaction Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            <span className="font-medium text-green-600 dark:text-green-400">Payment Successful</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Amount Paid:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[150px] text-right">{transactionId}</span>
          </div>
          {paymentMethod === 'UPI' && paymentDetails?.upiTransactionId && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">UPI Ref:</span>
              <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[150px] text-right">{paymentDetails.upiTransactionId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Paid to:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">Closure Store</span>
          </div>
           <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Date:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100 text-right">
                {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <button
          onClick={() => { onViewOrders(); onClose(); }}
          className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-sm shadow-sm"
        >
          View My Orders
        </button>
        <button
          onClick={() => { onContinueShopping(); onClose(); }}
          className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm border border-gray-300 dark:border-gray-600"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;