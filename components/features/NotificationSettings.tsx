import React from 'react';
import { NotificationPreferences, NotificationSettingsModalContentProps } from '../../types';



const SettingRowToggle: React.FC<{icon?: React.ReactNode, label: string, isChecked: boolean, onChange: () => void, id: string, description?: string}> = 
    ({icon, label, isChecked, onChange, id, description}) => (
    <div className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-sm mb-2.5">
      <div className="flex items-center">
        {icon && <div className="mr-3">{icon}</div>}
        <div>
            <span className="text-gray-800 dark:text-gray-100 text-sm font-medium">{label}</span>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          id={id}
          className="sr-only peer" 
          checked={isChecked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
      </label>
    </div>
);

const NotificationSettingsModalContent: React.FC<NotificationSettingsModalContentProps> = ({ preferences, onUpdatePreferences }) => {
  
  const handleToggle = (key: keyof NotificationPreferences) => {
    onUpdatePreferences({ [key]: !preferences[key] });
  };

  return (
    <div className="p-1 space-y-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Manage what notifications you receive from the app.</p>
      
      <SettingRowToggle
        id="newAnnouncements"
        label="New Announcements"
        description="Get notified about important school or course announcements."
        isChecked={preferences.newAnnouncements}
        onChange={() => handleToggle('newAnnouncements')}
      />
      <SettingRowToggle
        id="chatMentions"
        label="Chat Mentions & Messages"
        description="Receive alerts for new messages or when you're mentioned in chats."
        isChecked={preferences.chatMentions}
        onChange={() => handleToggle('chatMentions')}
      />
      <SettingRowToggle
        id="eventReminders"
        label="Event Reminders"
        description="Get reminders for upcoming events and deadlines."
        isChecked={preferences.eventReminders}
        onChange={() => handleToggle('eventReminders')}
      />
      <SettingRowToggle
        id="promotionalUpdates"
        label="Promotional Updates"
        description="Receive information about new store items or special offers."
        isChecked={preferences.promotionalUpdates}
        onChange={() => handleToggle('promotionalUpdates')}
      />
       <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">Your preferences are saved automatically.</p>
    </div>
  );
};

export default NotificationSettingsModalContent;
