import React, { useState } from 'react';
import { ModalType, SettingsProps } from '../../types';
import TopBar from '../layout/TopBar';
import ChevronRight from '../icons/ChevronRight';
import Share from '../icons/Share';
import RateUs from '../icons/RateUs';
import Moon from '../icons/Moon';
import Sun from '../icons/Sun';
import DocumentText from '../icons/DocumentText';
import Pip from '../icons/Pip';
import Key from '../icons/Key';
import Bell from '../icons/Bell';
import Trash from '../icons/Trash';
import QuestionMarkCircle from '../icons/QuestionMarkCircle';



const Settings: React.FC<SettingsProps> = ({ version, onLogout, onOpenModal, currentTheme, onSetTheme, onBack, addPopupMessage }) => {
  const [isPipEnabled, setIsPipEnabled] = useState(true);

  const toggleTheme = () => {
    onSetTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Closure App',
      text: 'Check out Closure, the best community app for college students!',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addPopupMessage('App shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        addPopupMessage('Link copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      addPopupMessage('Could not share app.', 'error');
    }
  };

  const handleRateUs = () => {
    window.open('https://play.google.com/store/apps/details?id=com.closure.app', '_blank');
  };

  const SettingRowToggle: React.FC<{icon: React.ReactNode, label: string, isChecked: boolean, onChange: () => void, id: string}> = 
    ({icon, label, isChecked, onChange, id}) => (
    <div className="w-full flex justify-between items-center bg-white dark:bg-gray-800 p-3.5 rounded-lg shadow-sm">
      <div className="flex items-center">
        {icon}
        <span className="text-gray-700 dark:text-gray-200 ml-3 text-sm">{label}</span>
      </div>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          id={id}
          className="sr-only peer" 
          checked={isChecked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );

  const SettingRowButton: React.FC<{icon: React.ReactNode, label: string, onClick: () => void, subText?: string}> =
    ({icon, label, onClick, subText}) => (
    <button 
        onClick={onClick}
        className="w-full flex justify-between items-center bg-white dark:bg-gray-800 p-3.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={label}
    >
        <div className="flex items-center">
            {icon}
            <div className="ml-3 text-left">
                <span className="text-gray-700 dark:text-gray-200 text-sm">{label}</span>
                {subText && <p className="text-xs text-gray-500 dark:text-gray-400">{subText}</p>}
            </div>
        </div>
        <ChevronRight className="text-gray-400 dark:text-gray-300 w-5 h-5" />
    </button>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
      <TopBar title="Settings" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow p-3 space-y-2.5 overflow-y-auto pb-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-2">General</h3>
        <SettingRowToggle
            icon={currentTheme === 'light' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            label="Dark Mode"
            isChecked={currentTheme === 'dark'}
            onChange={toggleTheme}
            id="theme-toggle"
        />
        <SettingRowButton
            icon={<Bell className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Notification Settings"
            onClick={() => onOpenModal(ModalType.NOTIFICATION_SETTINGS)}
        />
        <SettingRowToggle
            icon={<Pip className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Enable Picture-in-Picture"
            isChecked={isPipEnabled}
            onChange={() => setIsPipEnabled(!isPipEnabled)}
            id="pip-toggle"
        />

        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">Account</h3>
        <SettingRowButton
            icon={<Key className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Change Password"
            onClick={() => onOpenModal(ModalType.CHANGE_PASSWORD)}
        />

        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">Data & Storage</h3>
         <SettingRowButton
            icon={<Trash className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Clear Cache"
            onClick={() => addPopupMessage("Cache cleared successfully.", 'success')}
        />
        
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">Support & Feedback</h3>
        <SettingRowButton
            icon={<QuestionMarkCircle className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Help & Support"
            onClick={() => onOpenModal(ModalType.HELP_SUPPORT)}
        />
        <div className="grid grid-cols-2 gap-2.5 mt-1">
          <button 
            onClick={handleShareApp}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
            aria-label="Share this app"
            >
            <Share className="text-indigo-600 dark:text-indigo-400 mb-1 w-5 h-5" /> 
            <span className="text-xs text-gray-700 dark:text-gray-200">Share App</span>
          </button>
          <button 
            onClick={handleRateUs}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Rate this app"
            >
            <RateUs className="text-indigo-600 dark:text-indigo-400 mb-1 w-5 h-5" />
            <span className="text-xs text-gray-700 dark:text-gray-200">Rate Us</span>
          </button>
        </div>

        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">About</h3>
        <SettingRowButton
            icon={<DocumentText className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Terms & Conditions"
            onClick={() => onOpenModal(ModalType.TERMS_AND_CONDITIONS)}
        />
        <SettingRowButton
            icon={<DocumentText className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Privacy Policy"
            onClick={() => onOpenModal(ModalType.PRIVACY_POLICY)}
        />
        <SettingRowButton
            icon={<DocumentText className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Acknowledgements"
            onClick={() => onOpenModal(ModalType.ACKNOWLEDGEMENTS)}
        />
         <div className="bg-white dark:bg-gray-800 p-3.5 rounded-lg shadow-sm">
            <div className="flex items-center">
                 <DocumentText className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                 <div className="ml-3 text-left">
                    <span className="text-gray-700 dark:text-gray-200 text-sm">App Version</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{version}</p>
                 </div>
            </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4">
            <button 
            onClick={onLogout}
            className="w-full bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/70 text-red-600 dark:text-red-400 font-semibold py-3 px-4 rounded-lg transition-colors border border-red-200 dark:border-red-700/50"
            >
            Sign Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;