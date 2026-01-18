import React, { useState, useEffect } from 'react';
import { AppView, PaymentDetails, Address } from '../../types';
import ArrowLeft from '../icons/ArrowLeft';


const PaymentDetails: React.FC<PaymentDetails> = ({ 
  currentUser, 
  cartItems, 
  onNavigate, 
  onBack,
  onUpdateUserProfile 
}) => {
  const [formData, setFormData] = useState<Address>({
    fullName: currentUser?.name || '',
    mobileNumber: currentUser?.mobileNumber || '',
    pincode: '',
    streetAddress: '',
    city: '',
    state: '',
    country: 'India', 
    addressType: 'Home'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  useEffect(() => {
    if (currentUser?.address) {
      setFormData(prev => ({ ...prev, ...currentUser.address }));
    }
  }, [currentUser]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Address]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // 3. Validation Logic
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Address, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) newErrors.mobileNumber = "Valid 10-digit mobile number is required";
    if (!formData.pincode.trim() || formData.pincode.length < 6) newErrors.pincode = "Valid 6-digit Pincode is required";
    if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (validate()) {
      onUpdateUserProfile(formData);
      onNavigate(AppView.UPI_PAYMENT);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-indigo-700 dark:bg-indigo-800 text-white p-4 flex items-center shadow-md sticky top-0 z-20">
        <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Back">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Delivery Details</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 pb-24">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm space-y-4">
            
            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName} 
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Enter your name"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Mobile Number */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                <input 
                    type="tel" 
                    name="mobileNumber"
                    value={formData.mobileNumber} 
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="10-digit mobile number"
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
            </div>

            <div className="flex gap-4">
                {/* Pincode */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                    <input 
                        type="number" 
                        name="pincode"
                        value={formData.pincode} 
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${errors.pincode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="e.g. 400001"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
                 {/* City */}
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input 
                        type="text" 
                        name="city"
                        value={formData.city} 
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="e.g. Mumbai"
                    />
                     {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
            </div>

            {/* Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address / Hostel Info</label>
                <textarea 
                    name="streetAddress"
                    rows={3}
                    value={formData.streetAddress} 
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${errors.streetAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="e.g. Room 304, Hostel H10, IIT Campus"
                />
                {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
            </div>

             {/* State */}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input 
                    type="text" 
                    name="state"
                    value={formData.state} 
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="e.g. Maharashtra"
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>

            {/* Address Type */}
            <div className="flex gap-4 pt-2">
                <label className="flex items-center">
                    <input 
                        type="radio" 
                        name="addressType" 
                        value="Home" 
                        checked={formData.addressType === 'Home'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Home/Hostel</span>
                </label>
                <label className="flex items-center">
                    <input 
                        type="radio" 
                        name="addressType" 
                        value="Work" 
                        checked={formData.addressType === 'Work'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Work/College Dept</span>
                </label>
            </div>

        </div>

        {/* Order Summary Mini-View */}
        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
             <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Order Summary</h3>
             <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}):</span>
                <span>₹{totalAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>Delivery:</span>
                <span className="text-green-600">Free</span>
             </div>
             <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-gray-100 mt-2 border-t pt-2 dark:border-gray-700">
                <span>Total to Pay:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
             </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 shadow-top-xl sticky bottom-0 z-10">
        <button 
          onClick={handleProceed}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center"
        >
          Proceed to Pay
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PaymentDetails;