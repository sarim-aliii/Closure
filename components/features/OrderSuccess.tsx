import React from 'react';
import { OrderSuccessModalContentProps } from '../../types';



const CheckCircleIcon: React.FC<{className?: string}> = ({className = "w-16 h-16"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const OrderSuccessModalContent: React.FC<OrderSuccessModalContentProps> = ({ order, onViewOrders, onContinueShopping, onClose }) => {
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

  return (
    <div className="p-2 sm:p-4 text-center">
      <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Order Placed Successfully!</h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">Thank you for your purchase with Closure.</p>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
        Order ID: <span className="font-medium text-indigo-600 dark:text-indigo-400">{orderId}</span>
      </p>

      {/* Mock Transaction Details Section */}
      <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-left text-xs sm:text-sm mb-5">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm sm:text-base text-center">Transaction Details</h4>
        <div className="space-y-1.5">
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
            <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{transactionId}</span>
          </div>
          {paymentMethod === 'UPI' && paymentDetails?.upiTransactionId && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">UPI Transaction ID:</span>
              <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{paymentDetails.upiTransactionId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Paid to:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">Closure Store</span>
          </div>
          {paymentMethod === 'UPI' && paymentDetails?.paymentApp && (
             <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Using:</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{paymentDetails.paymentApp}</span>
            </div>
          )}
           <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Date & Time:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">{new Date(orderDate).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mt-4">
        <button
          onClick={() => { onViewOrders(); onClose(); }}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-sm"
        >
          View My Orders
        </button>
        <button
          onClick={() => { onContinueShopping(); onClose(); }}
          className="w-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm border border-gray-300 dark:border-gray-500"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessModalContent;
