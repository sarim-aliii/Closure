
import React, { useState } from 'react';
import AtSymbolIcon from '../icons/AtSymbolIcon';
// Removed PopupMessage import as it's handled by App.tsx

interface ForgotPasswordModalContentProps {
  onClose: () => void;
  onForgotPasswordRequest: (email: string) => Promise<boolean>; 
}

const ForgotPasswordModalContent: React.FC<ForgotPasswordModalContentProps> = ({ onClose, onForgotPasswordRequest }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // To show success message within modal
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    // Removed Gmail specific validation for more general use
    // if (!email.trim().endsWith('@gmail.com')) {
    //   setError('Please use a Gmail address (e.g., user@gmail.com).');
    //   return;
    // }

    setIsLoading(true);
    const success = await onForgotPasswordRequest(email);
    setIsLoading(false);
    
    if (success) {
      setIsSubmitted(true); // Show success message within the modal
      // The App.tsx's onForgotPasswordRequest will show a popup message
    } else {
      // Error message will be set by App.tsx's onForgotPasswordRequest if it provides one,
      // or we can set a generic one if needed. For now, assuming App.tsx handles it.
      // If `success` is false and no popup from App.tsx, you might want a local error.
      // setError("Failed to send reset link. Please try again.");
    }
  };

  return (
    <div className="p-1">
      {isSubmitted ? (
        <div className="text-center py-4">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-md font-medium text-gray-700 dark:text-gray-200">
            Password reset instructions sent!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            If an account with <span className="font-semibold">{email}</span> exists, please check your email for a link to reset your password.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          {error && ( // Local validation error
            <div className="mb-3 p-2 bg-red-100 text-red-700 border border-red-300 rounded-md text-xs text-center">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbolIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !email.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordModalContent;
