import React, { useState } from 'react';
import User from '../icons/User';
import AtSymbol from '../icons/AtSymbol';
import LockClosed from '../icons/LockClosed';
import Eye from '../icons/Eye';
import EyeSlash from '../icons/EyeSlash';
import { SignupProps } from '../../types';


const extractDomain = (email: string) => {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
};


const checkDomainIsValid = async (domain: string): Promise<boolean> => {
  const API_URL = 'https://api.closure-app.com/validate-domain';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    });

    if (!response.ok) {
      console.warn(`API Error: ${response.status}`);
      throw new Error('API_FAILURE');
    }

    const data = await response.json();
    return data.isValid;

  } catch (error) {
    console.warn("Domain verification API unreachable. Using local fallback list.", error);
    
    const FALLBACK_DOMAINS = [
      'harvard.edu', 
      'mit.edu', 
      'stanford.edu',
      'iitb.ac.in',
      'college.edu',
      'bmsce.ac.in',
    ];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return FALLBACK_DOMAINS.includes(domain);
  }
};

const Signup: React.FC<SignupProps> = ({ onSignupAttempt, onNavigateToLogin, errorMessage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLocalValidationError(null);
    setIsLoading(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const domain = extractDomain(trimmedEmail);

    // 1. Basic Empty Check
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setLocalValidationError("All fields are required.");
      setIsLoading(false);
      return;
    }

    // 2. Email Format Check
    if (!trimmedEmail.includes('@')) {
      setLocalValidationError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    // 3. Password Length Check
    if (trimmedPassword.length < 6) {
      setLocalValidationError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    // 4. Password Match Check
    if (trimmedPassword !== trimmedConfirmPassword) {
      setLocalValidationError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // 5. COLLEGE DOMAIN VERIFICATION (API CALL)
    try {
      const isValidDomain = await checkDomainIsValid(domain);
      
      if (!isValidDomain) {
        setLocalValidationError(`The domain "@${domain}" is not recognized. Please use your official College Email ID.`);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Domain verification failed:", error);
      setLocalValidationError("Unable to verify college domain. Please try again.");
      setIsLoading(false);
      return;
    }

    // 6. Proceed to Firebase Creation
    await onSignupAttempt(trimmedName, trimmedEmail, trimmedPassword);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
      
      {/* Top Section */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-purple-800 p-4 rounded-lg shadow-xl mb-6">
           <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-lg opacity-90 mb-8">Join Closure today!</p>
      </div>

      {/* Bottom Section: Form */}
      <div className="bg-white p-6 sm:p-8 rounded-t-3xl shadow-top-xl">
        {(errorMessage && !localValidationError) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}
        {localValidationError && (
           <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm text-center">
            {localValidationError}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
        </div>
        
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
            College Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AtSymbol className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@college.edu"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
              autoCapitalize="none"
              autoComplete="email"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Must be a valid .edu or recognized college domain.
          </p>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (min. 6 characters)"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Sign Up Button */}
        <button 
          onClick={handleSignup}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg flex items-center justify-center font-semibold hover:bg-purple-700 transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {isLoading ? (
             <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Verifying...
             </span>
          ) : 'Sign Up'}
        </button>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={onNavigateToLogin} 
            disabled={isLoading}
            className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline disabled:opacity-50"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;