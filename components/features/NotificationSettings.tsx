import React from 'react';
import { NotificationPreferences, NotificationSettings } from '../../types';


interface ExtendedNotificationSettings extends NotificationSettings {
  onClose?: () => void;
}

const SettingRowToggle: React.FC<{
  icon?: React.ReactNode, 
  label: string, 
  isChecked: boolean, 
  onChange: () => void, 
  id: string, 
  description?: string
}> = ({ icon, label, isChecked, onChange, id, description }) => (
    <div className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg shadow-sm mb-2.5 border border-gray-100 dark:border-gray-600">
      <div className="flex items-center pr-4">
        {icon && <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>}
        <div>
            <span className="text-gray-800 dark:text-gray-100 text-sm font-medium block">{label}</span>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input 
          type="checkbox" 
          id={id}
          className="sr-only peer" 
          checked={isChecked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer 
          peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 
          peer-checked:after:translate-x-full peer-checked:after:border-white 
          after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
          after:bg-white after:border-gray-300 dark:after:border-gray-500 
          after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
          peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500">
        </div>
      </label>
    </div>
);

const NotificationSettings: React.FC<ExtendedNotificationSettings> = ({ preferences, onUpdatePreferences, onClose }) => {
  
  const handleToggle = (key: keyof NotificationPreferences) => {
    onUpdatePreferences({ [key]: !preferences[key] });
  };

  return (
    <div className="p-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Manage what notifications you receive from Closure.
      </p>
      
      <div className="space-y-1">
        <SettingRowToggle
            id="newAnnouncements"
            label="New Announcements"
            description="Get notified about important college announcements."
            isChecked={preferences.newAnnouncements}
            onChange={() => handleToggle('newAnnouncements')}
        />
        <SettingRowToggle
            id="chatMentions"
            label="Chat Mentions & Messages"
            description="Receive alerts for new DMs or group mentions."
            isChecked={preferences.chatMentions}
            onChange={() => handleToggle('chatMentions')}
        />
        <SettingRowToggle
            id="eventReminders"
            label="Event Reminders"
            description="Get reminders for upcoming campus events."
            isChecked={preferences.eventReminders}
            onChange={() => handleToggle('eventReminders')}
        />
        <SettingRowToggle
            id="promotionalUpdates"
            label="Store Updates"
            description="Notifications about new products or offers."
            isChecked={preferences.promotionalUpdates}
            onChange={() => handleToggle('promotionalUpdates')}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center">
         <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            Changes are saved automatically to your profile.
         </p>
         {/* Close Button for better Mobile UX */}
         <button 
            onClick={onClose}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
         >
            Done
         </button>
      </div>
    </div>
  );
};

export default NotificationSettings;