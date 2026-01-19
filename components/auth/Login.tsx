import React, { useState } from 'react';
import AtSymbol from '../icons/AtSymbol';
import LockClosed from '../icons/LockClosed';
import Eye from '../icons/Eye';
import EyeSlash from '../icons/EyeSlash';
import { ModalType, LoginProps } from '../../types';


const Login: React.FC<LoginProps> = ({ 
  onLoginAttempt, 
  onNavigateToSignup, 
  onOpenModal, 
  successMessage, 
  errorMessage 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalValidationError(null);
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setLocalValidationError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setLocalValidationError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    await onLoginAttempt(trimmedEmail, trimmedPassword); 
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    onOpenModal(ModalType.FORGOT_PASSWORD);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-600">
      
      {/* Top Section: Branding */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-white text-center">
         <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl shadow-xl mb-6">
           <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-lg opacity-90 mb-8">Login to access Closure.</p>
      </div>

      {/* Bottom Section: Form */}
      <div className="bg-white p-6 sm:p-8 rounded-t-3xl shadow-top-xl">
        
        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}
        {errorMessage && !localValidationError && ( 
           <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}
        {localValidationError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm text-center">
            {localValidationError}
          </div>
        )}
        
        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AtSymbol className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
              autoCapitalize="none"
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-2">
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
              autoComplete="current-password"
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

        {/* Forgot Password */}
        <div className="text-right mb-6">
          <button 
            onClick={handleForgotPassword}
            disabled={isLoading}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline disabled:opacity-50"
          >
            Forgot password?
          </button>
        </div>
        
        {/* Login Button */}
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg flex items-center justify-center font-semibold hover:bg-indigo-700 transition-colors text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
             <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Logging in...
             </span>
          ) : 'Login'}
        </button>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={onNavigateToSignup} 
            disabled={isLoading}
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline disabled:opacity-50"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;