import React, { useState } from 'react';
import LockClosed from '../icons/LockClosed';
import Eye from '../icons/Eye';
import EyeSlash from '../icons/EyeSlash';
import { ChangePasswordProps, ModalType } from '../../types';


interface ExtendedChangePasswordProps extends ChangePasswordProps {
  onOpenModal?: (modalType: ModalType) => void;
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder?: string;
  disabled?: boolean;
}


const PasswordInput: React.FC<PasswordInputProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  show, 
  onToggleShow, 
  placeholder = "••••••••", 
  disabled = false 
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <LockClosed className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        type={show ? "text" : "password"}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        required
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label={show ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {show ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  </div>
);

const ChangePassword: React.FC<ExtendedChangePasswordProps> = ({ onChangePassword, onClose, onOpenModal }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsLoading(true);

    const success = await onChangePassword(currentPassword, newPassword);
    setIsLoading(false);
    
    if (success) {
        onClose(); 
    } else {
        if(!error) setError("Failed to change password. Check your current password.");
    }
  };

  return (
    <div className="p-1">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
      
      <PasswordInput 
        id="currentPassword"
        label="Current Password"
        value={currentPassword}
        onChange={setCurrentPassword}
        show={showCurrentPassword}
        onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
        disabled={isLoading}
      />
      
      {/* Forgot Password Link */}
      <div className="flex justify-end mb-4 -mt-2">
        <button
            type="button"
            onClick={() => onOpenModal && onOpenModal(ModalType.FORGOT_PASSWORD)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
            disabled={isLoading}
        >
            Forgot current password?
        </button>
      </div>

      <PasswordInput 
        id="newPassword"
        label="New Password"
        value={newPassword}
        onChange={setNewPassword}
        show={showNewPassword}
        onToggleShow={() => setShowNewPassword(!showNewPassword)}
        placeholder="Min. 6 characters"
        disabled={isLoading}
      />
      <PasswordInput 
        id="confirmNewPassword"
        label="Confirm New Password"
        value={confirmNewPassword}
        onChange={setConfirmNewPassword}
        show={showConfirmNewPassword}
        onToggleShow={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
        disabled={isLoading}
      />
      
      <div className="flex justify-end space-x-3 mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !currentPassword || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 6}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
        >
          {isLoading && (
             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          )}
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;