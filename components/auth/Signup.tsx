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
    
    // Fallback list for offline/dev testing
    const FALLBACK_DOMAINS = [
      // Global / Generic
      'harvard.edu',
      'mit.edu',
      'stanford.edu',
      'ox.ac.uk',
      'cam.ac.uk',
      'college.edu',

      // IITs
      'iitb.ac.in',
      'iitd.ac.in',
      'iitm.ac.in',
      'iitk.ac.in',
      'iitkgp.ac.in',
      'iitg.ac.in',
      'iitr.ac.in',
      'iitbhu.ac.in',
      'iiti.ac.in',
      'iith.ac.in',

      // NITs
      'nitt.edu',
      'nitc.ac.in',
      'nitw.ac.in',
      'nitrkl.ac.in',
      'nitk.ac.in',
      'nitdgp.ac.in',
      'nitp.ac.in',
      'nith.ac.in',

      // IIITs
      'iiit.ac.in',
      'iiitd.ac.in',
      'iiita.ac.in',
      'iiitb.ac.in',
      'iiitdmj.ac.in',

      // IISERs
      'iiserpune.ac.in',
      'iiserkol.ac.in',
      'iiserb.ac.in',
      'iisermohali.ac.in',
      'iisertvm.ac.in',

      // Central Universities
      'du.ac.in',
      'jnu.ac.in',
      'jmi.ac.in',
      'amu.ac.in',
      'uohyd.ac.in',

      // State & Deemed Universities
      'annauniv.edu',
      'unipune.ac.in',
      'mu.ac.in',
      'caluniv.ac.in',
      'jadavpuruniversity.in',

      // Private Universities / Colleges
      'bits-pilani.ac.in',
      'vit.ac.in',
      'srmuniv.ac.in',
      'manipal.edu',
      'amity.edu',
      'lpu.in',
      'sastra.edu',

      // Popular Engineering Colleges
      'bmsce.ac.in',
      'rvce.edu.in',
      'pes.edu',
      'msrit.edu',
      'vtu.ac.in'
    ];

    
    // Simulate network delay
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
  
  // NEW: State to track if verification email has been sent
  const [verificationSent, setVerificationSent] = useState(false);

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
    // The App.tsx handler will return true if signup + email send was successful
    const success = await onSignupAttempt(trimmedName, trimmedEmail, trimmedPassword);
    if (success) {
        setVerificationSent(true);
    }
    setIsLoading(false);
  };

  // NEW: Success View - "Check your email"
  if (verificationSent) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 items-center justify-center p-6 text-white text-center">
         <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/30">
            <div className="bg-green-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Verify your Email</h2>
            <p className="text-lg mb-6 opacity-90">
                We've sent a verification link to <br/>
                <span className="font-semibold text-yellow-300">{email}</span>
            </p>
            <p className="text-sm mb-8 opacity-75">
                Please check your inbox (and spam folder) and click the link to activate your account. You cannot log in until you verify.
            </p>
            <button 
                onClick={onNavigateToLogin}
                className="w-full bg-white text-purple-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
                Go to Login
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      
      {/* Top Section */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-purple-800/80 backdrop-blur-sm p-4 rounded-lg shadow-xl mb-6 border border-white/10">
           <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-wide">Create Account</h1>
        <p className="text-lg opacity-90 mb-8 font-light">Join Closure today!</p>
      </div>

      {/* Bottom Section: Form */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-t-3xl shadow-top-xl transition-colors duration-200">
        {(errorMessage && !localValidationError) && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}
        {localValidationError && (
           <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-lg text-sm text-center">
            {localValidationError}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
        </div>
        
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            College Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AtSymbol className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@college.edu"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required
              disabled={isLoading}
              autoCapitalize="none"
              autoComplete="email"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Must be a valid .edu or recognized college domain.
          </p>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosed className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (min. 6 characters)"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosed className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
          className="w-full bg-purple-600 dark:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
             <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Verifying...
             </span>
          ) : 'Sign Up'}
        </button>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button 
            onClick={onNavigateToLogin} 
            disabled={isLoading}
            className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 focus:outline-none focus:underline disabled:opacity-50"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;