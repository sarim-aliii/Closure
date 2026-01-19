import React, { useState, useEffect } from 'react';
import { UPIPaymentProps } from '../../types'; 
import TopBar from '../layout/TopBar';


const UPIPayment: React.FC<UPIPaymentProps> = ({ 
  deliveryAddress, 
  paymentMethod, 
  totalAmount, 
  onConfirmPayment, 
  onBack 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [upiDeepLink, setUpiDeepLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const merchantVpa = 'merchant@okbank'; 
    const merchantName = 'Closure Store';
    const transactionRef = `TID${Date.now()}`;
    
    const link = `upi://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount.toFixed(2)}&cu=INR&tr=${transactionRef}`;
    
    setUpiDeepLink(link);

    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`);
  }, [totalAmount]);

  const handleOpenApp = () => {
      window.open(upiDeepLink, '_system');
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onConfirmPayment(deliveryAddress, paymentMethod);
    setIsLoading(false); 
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <TopBar title="UPI Payment" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Pay via UPI</h2>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">₹{totalAmount.toFixed(2)}</p>
            
            {/* QR Code Section */}
            {qrCodeUrl ? (
                <div className="mb-6 relative group">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto border-2 border-gray-100 dark:border-gray-700 rounded-lg p-2 bg-white shadow-inner" />
                    <p className="text-xs text-gray-500 mt-2">Scan with any UPI App</p>
                </div>
            ) : (
                <div className="w-48 h-48 mx-auto border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    <div className="animate-pulse text-sm text-gray-500 dark:text-gray-400">Loading QR...</div>
                </div>
            )}

            {/* Mobile Deep Link Button (Better UX for Mobile) */}
            <button 
                onClick={handleOpenApp}
                className="mb-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 py-2 px-4 rounded-full transition-colors flex items-center justify-center w-full border border-indigo-200 dark:border-indigo-800"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Tap to Pay on Phone
            </button>

            <div className="text-left bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    <strong>Step 1:</strong> Scan QR or tap the button above to pay.<br/>
                    <strong>Step 2:</strong> Come back here and click "I have Paid".
                </p>
            </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full max-w-xs bg-green-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition-all text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
             <>
               <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Verifying...
             </>
          ) : 'I have Paid'}
        </button>
        
        <button onClick={onBack} disabled={isLoading} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline">
            Cancel Payment
        </button>
      </div>
    </div>
  );
};

export default UPIPayment;