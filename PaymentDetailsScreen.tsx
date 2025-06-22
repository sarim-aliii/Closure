
import React, { useState, useEffect } from 'react';
import { AppView, CartItem, UserProfile, Address } from '../types';
import TopBar from '../components/TopBar';

interface PaymentDetailsScreenProps {
  currentUser: UserProfile | null;
  cartItems: CartItem[];
  onNavigate: (view: AppView, data?: any) => void;
  onBack: () => void;
  onUpdateUserProfile: (updatedAddress: Partial<Address>) => void; 
}

const PaymentDetailsScreen: React.FC<PaymentDetailsScreenProps> = ({ 
  currentUser, 
  cartItems, 
  onNavigate, 
  onBack,
  onUpdateUserProfile
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    fullName: currentUser?.name || '',
    mobileNumber: currentUser?.mobileNumber || '',
    pincode: currentUser?.postalCode || '',
    streetAddress: currentUser?.streetAddress || '',
    city: currentUser?.city || '',
    state: '', 
    country: currentUser?.country || 'India', 
  });
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [saveAddress, setSaveAddress] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setDeliveryAddress(prev => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        mobileNumber: currentUser.mobileNumber || prev.mobileNumber,
        pincode: currentUser.postalCode || prev.pincode,
        streetAddress: currentUser.streetAddress || prev.streetAddress,
        city: currentUser.city || prev.city,
        country: currentUser.country || prev.country || 'India',
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({ ...prev, [name]: value }));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = () => {
    if (!deliveryAddress.fullName || !deliveryAddress.mobileNumber || !deliveryAddress.pincode || !deliveryAddress.streetAddress || !deliveryAddress.city || !deliveryAddress.state) {
      alert('Please fill in all delivery address fields.');
      return;
    }
    if (saveAddress && currentUser) {
      onUpdateUserProfile({ 
        streetAddress: deliveryAddress.streetAddress,
        city: deliveryAddress.city,
        pincode: deliveryAddress.pincode, 
        country: deliveryAddress.country,
        fullName: deliveryAddress.fullName, 
        mobileNumber: deliveryAddress.mobileNumber,
        state: deliveryAddress.state,
        addressType: deliveryAddress.addressType
      });
    }
    onNavigate(AppView.UPI_PAYMENT, { deliveryAddress, paymentMethod, totalAmount });
  };
  
  const InputField: React.FC<{label: string, name: keyof Address, value: string, onChange: any, placeholder?: string, required?: boolean, type?: string}> = 
    ({label, name, value, onChange, placeholder, required=true, type="text"}) => (
    <div className="mb-3">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && '*'}</label>
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


  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <TopBar title="Checkout Details" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Delivery Address</h2>
          <InputField label="Full Name" name="fullName" value={deliveryAddress.fullName} onChange={handleInputChange} placeholder="Your full name"/>
          <InputField label="Mobile Number" name="mobileNumber" value={deliveryAddress.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" type="tel"/>
          <InputField label="Pincode" name="pincode" value={deliveryAddress.pincode} onChange={handleInputChange} placeholder="6-digit pincode"/>
          <InputField label="Address (House No, Building, Street, Area)" name="streetAddress" value={deliveryAddress.streetAddress} onChange={handleInputChange} placeholder="e.g., Apt 123, Main Street"/>
          <InputField label="City/District/Town" name="city" value={deliveryAddress.city} onChange={handleInputChange} placeholder="Your city"/>
          <InputField label="State" name="state" value={deliveryAddress.state} onChange={handleInputChange} placeholder="Your state"/>
          <div className="mt-3">
            <label htmlFor="saveAddress" className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" id="saveAddress" checked={saveAddress} onChange={() => setSaveAddress(!saveAddress)} className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
              Save this address for future orders
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Order Summary</h2>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name} (x{item.quantity})</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-md font-semibold text-gray-800 dark:text-gray-100">Total</span>
            <span className="text-md font-bold text-indigo-600 dark:text-indigo-400">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Payment Method</h2>
          <div className="space-y-2">
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
              <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">UPI (Pay via QR Code)</span>
            </label>
             <label className={`flex items-center p-3 border rounded-lg cursor-not-allowed opacity-50 ${paymentMethod === 'CARD' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 dark:border-gray-600'}`}>
              <input type="radio" name="paymentMethod" value="CARD" disabled className="form-radio h-4 w-4 text-indigo-600"/>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">Credit/Debit Card (Coming Soon)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700 shadow-top-xl sticky bottom-0">
        <button 
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Proceed to Pay ₹{totalAmount.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default PaymentDetailsScreen;
