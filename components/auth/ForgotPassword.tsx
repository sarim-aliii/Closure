import React, { useState } from 'react';
import { ForgotPassword } from '../../types';
import AtSymbol from '../icons/AtSymbol'
import CheckCircle from '../icons/CheckCircle'


const ForgotPassword: React.FC<ForgotPassword> = ({ onClose, onForgotPasswordRequest }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        setError("Please enter a valid email address.");
        return;
    }

    setIsLoading(true);
    
    const success = await onForgotPasswordRequest(trimmedEmail);
    
    setIsLoading(false);
    
    if (success) {
      setIsSubmitted(true);
    } else {
        setError("Failed to send reset email. Please try again later.");
    }
  };

  return (
    <div className="p-1">
      {isSubmitted ? (
        <div className="text-center py-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Check your mail</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
            We have sent password reset instructions to <br/>
            <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>
          </p>
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Reset Password</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your registered college email and we'll send you a link to reset your password.
             </p>
          </div>

          {error && ( 
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbol className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@college.edu"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
                disabled={isLoading}
                autoCapitalize="none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !email.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Sending...
                 </>
              ) : 'Send Reset Link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;