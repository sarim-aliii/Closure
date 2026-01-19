import React from 'react';
import { NotificationPreferences } from '../../types';
import { useUser } from '../../contexts/UserContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Bell from '../icons/Bell';
import Chat from '../icons/Chat';
import Calendar from '../icons/Calendar';
import Tag from '../icons/Tag';

// Interface updated: We no longer need preferences/onUpdate passed from parent
interface ExtendedNotificationSettingsProps {
  onClose?: () => void;
}

const SettingRowToggle: React.FC<{
  icon?: React.ReactNode, 
  label: string, 
  isChecked: boolean, 
  onChange: () => void, 
  id: string, 
  description?: string,
  disabled?: boolean
}> = ({ icon, label, isChecked, onChange, id, description, disabled }) => (
    <div className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg shadow-sm mb-2.5 border border-gray-100 dark:border-gray-600">
      <div className="flex items-center pr-4">
        {icon && <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>}
        <div>
            <span className="text-gray-800 dark:text-gray-100 text-sm font-medium block">{label}</span>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <label htmlFor={id} className={`relative inline-flex items-center cursor-pointer flex-shrink-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input 
          type="checkbox" 
          id={id}
          className="sr-only peer" 
          checked={isChecked}
          onChange={onChange}
          disabled={disabled}
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

const NotificationSettings: React.FC<ExtendedNotificationSettingsProps> = ({ onClose }) => {
  const { user, firebaseUser, refreshProfile } = useUser();

  // Default preferences if user data isn't loaded yet
  const preferences = user?.notificationPreferences || {
    newAnnouncements: true,
    chatMentions: true,
    eventReminders: true,
    promotionalUpdates: false,
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!firebaseUser) return;

    const updatedPrefs = { 
        ...preferences,
        [key]: !preferences[key] 
    };

    try {
        // Optimistic update logic could go here (local state), 
        // but since we rely on Context, we update Firestore directly.
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await updateDoc(userDocRef, { notificationPreferences: updatedPrefs });
        
        // Refresh context to reflect changes in UI
        refreshProfile();
    } catch (error) {
        console.error("Failed to update notification settings", error);
        // Ideally show a toast here via a global message handler if available
    }
  };

  return (
    <div className="p-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Manage what notifications you receive from Closure.
      </p>
      
      <div className="space-y-1">
        <SettingRowToggle
            id="newAnnouncements"
            icon={<Bell className="w-5 h-5" />}
            label="New Announcements"
            description="Get notified about important college announcements."
            isChecked={preferences.newAnnouncements}
            onChange={() => handleToggle('newAnnouncements')}
            disabled={!firebaseUser}
        />
        <SettingRowToggle
            id="chatMentions"
            icon={<Chat className="w-5 h-5" />}
            label="Chat Mentions & Messages"
            description="Receive alerts for new DMs or group mentions."
            isChecked={preferences.chatMentions}
            onChange={() => handleToggle('chatMentions')}
            disabled={!firebaseUser}
        />
        <SettingRowToggle
            id="eventReminders"
            icon={<Calendar className="w-5 h-5" />}
            label="Event Reminders"
            description="Get reminders for upcoming campus events."
            isChecked={preferences.eventReminders}
            onChange={() => handleToggle('eventReminders')}
            disabled={!firebaseUser}
        />
        <SettingRowToggle
            id="promotionalUpdates"
            icon={<Tag className="w-5 h-5" />}
            label="Store Updates"
            description="Notifications about new products or offers."
            isChecked={preferences.promotionalUpdates}
            onChange={() => handleToggle('promotionalUpdates')}
            disabled={!firebaseUser}
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