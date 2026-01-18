import React, { useState } from 'react';
import LockClosedIcon from '../icons/LockClosed';
import EyeIcon from '../icons/Eye';
import EyeSlashIcon from '../icons/EyeSlash';
import { ChangePasswordModalContentProps } from '../../types'


const ChangePasswordModalContent: React.FC<ChangePasswordModalContentProps> = ({ onChangePassword, onClose }) => {
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
    
    if (!success && !error) { 

    }
  };
  
  const PasswordInput: React.FC<{
    id: string,
    label: string,
    value: string,
    onChange: (val: string) => void,
    show: boolean,
    onToggleShow: () => void,
    placeholder?: string
  }> = ({ id, label, value, onChange, show, onToggleShow, placeholder="••••••••" }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type={show ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label={show ? "Hide password" : "Show password"}
          disabled={isLoading}
        >
          {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );


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
      />
      <PasswordInput 
        id="newPassword"
        label="New Password"
        value={newPassword}
        onChange={setNewPassword}
        show={showNewPassword}
        onToggleShow={() => setShowNewPassword(!showNewPassword)}
        placeholder="Min. 6 characters"
      />
      <PasswordInput 
        id="confirmNewPassword"
        label="Confirm New Password"
        value={confirmNewPassword}
        onChange={setConfirmNewPassword}
        show={showConfirmNewPassword}
        onToggleShow={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
      />
      <div className="flex justify-end space-x-3 mt-2">
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
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModalContent;