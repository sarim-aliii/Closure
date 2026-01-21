import React from 'react';
import { SwipeableList, Type as ListType } from 'react-swipeable-list';
import SwipeableCartItem from './SwipeableCartItem';
import { AppView, CartProps } from '../../types'; 
import ArrowLeft from '../icons/ArrowLeft'; 
import Trash from '../icons/Trash'; 

const Cart: React.FC<CartProps> = ({ cartItems, onRemoveItem, onUpdateQuantity, onNavigate, onBack }) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
       {/* Header */}
       <div className="bg-indigo-700 dark:bg-indigo-800 text-white p-4 flex items-center shadow-md sticky top-0 z-20">
        <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors" aria-label="Back to previous page">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-semibold">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-xl mb-2">Your cart is empty.</p>
          <button onClick={onBack} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Continue Shopping</button>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <SwipeableList type={ListType.IOS}>
            {cartItems.map(item => (
              <SwipeableCartItem 
                key={item.id} 
                item={item} 
                onDelete={onRemoveItem}
              >
                {/* Internal Card UI passed as children */}
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex items-center border border-gray-100 dark:border-gray-700 w-full">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md mr-3 sm:mr-4 bg-gray-100 dark:bg-gray-700"/>
                  
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base line-clamp-1">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">₹{item.price.toFixed(2)}</p>
                    
                    {/* Mobile Quantity Controls */}
                    <div className="flex items-center mt-2 sm:hidden"> 
                        <button 
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded-l text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >-</button>
                        <span className="px-2.5 py-0.5 border-t border-b border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded-r text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label={`Increase quantity of ${item.name}`}
                        >+</button>
                    </div>
                  </div>

                  {/* Desktop/Tablet Quantity Controls */}
                  <div className="hidden sm:flex items-center mr-2 sm:mr-4"> 
                    <button 
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >-</button>
                    <span className="px-3 py-1 border-t border-b border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-r text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={`Increase quantity of ${item.name}`}
                    >+</button>
                  </div>

                  <p className="font-semibold w-16 sm:w-20 text-right mr-2 sm:mr-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">₹{(item.price * item.quantity).toFixed(2)}</p>
                  
                  <button 
                    onClick={() => onRemoveItem(item.id)} 
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" 
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </SwipeableCartItem>
            ))}
          </SwipeableList>
        </div>
      )}

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-top-xl sticky bottom-0 z-10 safe-area-bottom">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Total:</span>
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">₹{totalAmount.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => onNavigate(AppView.PAYMENT_DETAILS)}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;