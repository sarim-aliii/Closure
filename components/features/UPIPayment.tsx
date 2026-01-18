import React, { useState, useEffect } from 'react';
import { UPIPaymentScreenProps } from '../../types'; 
import TopBar from '../layout/TopBar';


const UPIPaymentScreen: React.FC<UPIPaymentScreenProps> = ({ 
  deliveryAddress, 
  paymentMethod, 
  totalAmount, 
  onConfirmPayment, 
  onBack 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const upiData = `upi://pay?pa=fakeuser@okbank&pn=Closure%20Store&am=${totalAmount.toFixed(2)}&cu=INR&tid=${Date.now()}${Math.floor(Math.random()*1000)}`;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData)}`);
  }, [totalAmount]);

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      onConfirmPayment(deliveryAddress, paymentMethod);
      setIsLoading(false); 
    }, 1500);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <TopBar title="UPI Payment" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Scan QR to Pay</h2>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Amount: ₹{totalAmount.toFixed(2)}</p>
            
            {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 md:w-56 md:h-56 mx-auto border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white" />
            ) : (
                <div className="w-48 h-48 md:w-56 md:h-56 mx-auto border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generating QR Code...</p>
                </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                Scan the QR code using any UPI app to complete your payment.
            </p>
        </div>

        <button 
          onClick={handleConfirm}
          disabled={isLoading || !qrCodeUrl}
          className="w-full max-w-xs bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900 disabled:opacity-60"
        >
          {isLoading ? 'Processing...' : 'Confirm Payment'}
        </button>
         <p className="text-xs text-gray-500 dark:text-gray-400">This is a simulated payment process.</p>
      </div>
    </div>
  );
};

export default UPIPaymentScreen;
