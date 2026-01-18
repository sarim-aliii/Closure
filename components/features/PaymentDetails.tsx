import React, { useState, useEffect } from 'react';
import { AppView, Address, PaymentDetailsScreenProps, InputFieldProps } from '../../types';
import TopBar from '../layout/TopBar';


const InputField: React.FC<InputFieldProps> = ({
  label, name, value, onChange, placeholder, required = true, type = "text"
}) => (
  <div className="mb-3">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    />
  </div>
);

// --- Main Component ---
const PaymentDetailsScreen: React.FC<PaymentDetailsScreenProps> = ({ 
  currentUser, 
  cartItems, 
  onNavigate, 
  onBack,
  onUpdateUserProfile
}) => {
  
  // Initialize address state
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    fullName: currentUser?.address?.fullName || currentUser?.name || '',
    mobileNumber: currentUser?.address?.mobileNumber || currentUser?.mobileNumber || '',
    pincode: currentUser?.address?.pincode || '',
    streetAddress: currentUser?.address?.streetAddress || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || '',
    country: currentUser?.address?.country || 'India',
    addressType: currentUser?.address?.addressType || 'Home'
  });

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [saveAddress, setSaveAddress] = useState(true);

  // Sync with currentUser changes (e.g., if profile loads late)
  useEffect(() => {
    if (currentUser) {
      setDeliveryAddress(prev => {
        // Only update if the previous state was empty/default to avoid overwriting user typing
        const isPrevEmpty = !prev.streetAddress; 
        if (currentUser.address && isPrevEmpty) {
            return { ...prev, ...currentUser.address };
        }
        return prev;
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({ ...prev, [name]: value }));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = () => {
    // Validation
    if (!deliveryAddress.fullName || !deliveryAddress.mobileNumber || !deliveryAddress.pincode || !deliveryAddress.streetAddress || !deliveryAddress.city || !deliveryAddress.state) {
      // In a real app, use the addPopupMessage prop or a toast here
      alert('Please fill in all delivery address fields.');
      return;
    }

    // Save address to profile if requested
    if (saveAddress && currentUser) {
      onUpdateUserProfile({ 
        address: deliveryAddress 
      });
    }

    // Navigate to Payment
    onNavigate(AppView.UPI_PAYMENT, { deliveryAddress, paymentMethod, totalAmount });
  };
  
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <TopBar title="Checkout Details" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        
        {/* Address Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Delivery Address
          </h2>
          <InputField label="Full Name" name="fullName" value={deliveryAddress.fullName || ''} onChange={handleInputChange} placeholder="Receiver's Name"/>
          <InputField label="Mobile Number" name="mobileNumber" value={deliveryAddress.mobileNumber || ''} onChange={handleInputChange} placeholder="10-digit mobile number" type="tel"/>
          
          <div className="flex gap-4">
            <div className="flex-1">
                <InputField label="Pincode" name="pincode" value={deliveryAddress.pincode} onChange={handleInputChange} placeholder="e.g. 560001" type="number"/>
            </div>
            <div className="flex-1">
                 <InputField label="City" name="city" value={deliveryAddress.city} onChange={handleInputChange} placeholder="City"/>
            </div>
          </div>

          <InputField label="Address (House No, Building, Area)" name="streetAddress" value={deliveryAddress.streetAddress} onChange={handleInputChange} placeholder="e.g., Flat 101, Galaxy Apts"/>
          
          <div className="flex gap-4">
             <div className="flex-1">
                <InputField label="State" name="state" value={deliveryAddress.state} onChange={handleInputChange} placeholder="State"/>
             </div>
             <div className="flex-1">
                 {/* Country is usually fixed to domestic for simple apps, but kept editable if needed */}
                 <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                    <input disabled value="India" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed" />
                 </div>
             </div>
          </div>

          <div className="mt-2">
            <label htmlFor="saveAddress" className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input 
                type="checkbox" 
                id="saveAddress" 
                checked={saveAddress} 
                onChange={() => setSaveAddress(!saveAddress)} 
                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              Save this address for future orders
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Order Summary
          </h2>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex flex-col">
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-1">
            <span className="text-base font-bold text-gray-800 dark:text-gray-100">Total Amount</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
             <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
             Payment Method
          </h2>
          <div className="space-y-3">
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
              <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
              <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">UPI (GPay, PhonePe, Paytm)</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Scan QR code to pay</span>
              </div>
            </label>
            
             <label className={`flex items-center p-3 border rounded-lg cursor-not-allowed opacity-60 ${paymentMethod === 'CARD' ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
              <input type="radio" name="paymentMethod" value="CARD" disabled className="h-4 w-4 text-indigo-600"/>
              <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Credit / Debit Card</span>
                  <span className="block text-xs text-gray-400 dark:text-gray-500">Temporarily Unavailable</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg sticky bottom-0 z-10">
        <button 
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all transform active:scale-[0.98] shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Proceed to Pay ₹{totalAmount.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default PaymentDetailsScreen;