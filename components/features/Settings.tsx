import React, { useState } from 'react';
import ChevronRightIcon from '../icons/ChevronRight';
import { ModalType, SettingsScreenProps } from '../../types';
import TopBar from '../layout/TopBar';


const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>;
const RateUsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.82-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
const MoonIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.25-5.998z" /></svg>;
const SunIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
const BellSettingIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>;
const PipIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.374a15.126 15.126 0 01-3.084.038c-2.047.121-3.482-.998-3.482-2.5V5.062c0-1.502 1.435-2.621 3.482-2.5V16.5a.75.75 0 001.5 0V2.562c0-1.502-1.435-2.621-3.482-2.5A15.126 15.126 0 006.958.1C4.614.266 3 2.05 3 4.5v15c0 2.45 1.614 4.233 3.958 4.398a15.256 15.256 0 003.084.038c2.047-.121 3.482.998 3.482 2.5v-1.438c0-1.502-1.435-2.621-3.482-2.5zM19.5 16.5a.75.75 0 00-1.5 0v2.938a.75.75 0 001.5 0V16.5zm0-4.5a.75.75 0 00-1.5 0v2.938a.75.75 0 001.5 0V12zm0-4.5a.75.75 0 00-1.5 0v2.938a.75.75 0 001.5 0V7.5z" /></svg>;
const KeyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.462 3.032 1.214M5.17 5.79L5 5.79m-.17-1.343a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;


const SettingsScreen: React.FC<SettingsScreenProps> = ({ version, onLogout, onOpenModal, currentTheme, onSetTheme, onBack, addPopupMessage }) => {
  const [isPipEnabled, setIsPipEnabled] = useState(true);

  const toggleTheme = () => {
    onSetTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Closure App',
      text: 'Check out Closure, a great app for students!',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addPopupMessage('App shared successfully!', 'success');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        addPopupMessage('App link copied to clipboard!', 'success');
      } else {
        alert("Sharing is not supported on this browser. Here's the link: " + shareData.url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      addPopupMessage('Could not share app.', 'error');
    }
  };

  const handleRateUs = () => {
    window.open('https://play.google.com/store/apps/details?id=com.example.app', '_blank');
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
        <ChevronRightIcon className="text-gray-400 dark:text-gray-300 w-5 h-5" />
    </button>
  );


  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
      <TopBar title="Settings" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow p-3 space-y-2.5 overflow-y-auto pb-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-2">General</h3>
        <SettingRowToggle
            icon={currentTheme === 'light' ? <SunIcon className="w-5 h-5 text-yellow-500" /> : <MoonIcon className="w-5 h-5 text-indigo-400" />}
            label="Dark Mode"
            isChecked={currentTheme === 'dark'}
            onChange={toggleTheme}
            id="theme-toggle"
        />
        <SettingRowButton
            icon={<BellSettingIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Notification Settings"
            onClick={() => onOpenModal(ModalType.NOTIFICATION_SETTINGS)}
        />
        <SettingRowToggle
            icon={<PipIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Enable Picture-in-Picture"
            isChecked={isPipEnabled}
            onChange={() => setIsPipEnabled(!isPipEnabled)}
            id="pip-toggle"
        />

        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">Account</h3>
        <SettingRowButton
            icon={<KeyIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Change Password"
            onClick={() => onOpenModal(ModalType.CHANGE_PASSWORD)}
        />

        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">Data & Storage</h3>
         <SettingRowButton
            icon={<TrashIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Clear Cache"
            onClick={() => addPopupMessage("Cache cleared successfully (Demo).", 'success')}
        />
        
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">Support & Feedback</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button 
            onClick={handleShareApp}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
            aria-label="Share this app"
            >
            <ShareIcon className="text-indigo-600 dark:text-indigo-400 mb-1 w-5 h-5" /> 
            <span className="text-xs text-gray-700 dark:text-gray-200">Share App</span>
          </button>
          <button 
            onClick={handleRateUs}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Rate this app"
            >
            <RateUsIcon className="text-indigo-600 dark:text-indigo-400 mb-1 w-5 h-5" />
            <span className="text-xs text-gray-700 dark:text-gray-200">Rate Us</span>
          </button>
        </div>


        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-1 pt-3">About</h3>
        <SettingRowButton
            icon={<DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Terms & Conditions"
            onClick={() => onOpenModal(ModalType.TERMS_AND_CONDITIONS)}
        />
        <SettingRowButton
            icon={<DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Privacy Policy"
            onClick={() => onOpenModal(ModalType.PRIVACY_POLICY)}
        />
        <SettingRowButton
            icon={<DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            label="Acknowledgements"
            onClick={() => onOpenModal(ModalType.ACKNOWLEDGEMENTS)}
        />
         <div className="bg-white dark:bg-gray-800 p-3.5 rounded-lg shadow-sm">
            <div className="flex items-center">
                 <DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
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

export default SettingsScreen;