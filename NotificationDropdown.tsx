
import React from 'react';
import { Notification } from '../types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClose, onNotificationClick, onMarkAllRead }) => {
  return (
    <div 
        className="absolute top-12 right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden dark:bg-gray-800 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
    >
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 dark:text-gray-100 text-sm">Notifications</h3>
        {notifications.some((n: Notification) => !n.read) && (
           <button onClick={onMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Mark all as read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">No new notifications.</p>
      ) : (
        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
          {notifications.map((notification: Notification) => (
            <li 
              key={notification.id} 
              onClick={() => onNotificationClick(notification)}
              className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notification.read ? 'opacity-70' : ''}`}
            >
              <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100 font-medium'}`}>{notification.message}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleTimeString([], { day: 'numeric', month:'short', hour: '2-digit', minute: '2-digit' })}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="p-2 bg-gray-50 dark:bg-gray-750 text-center border-t border-gray-100 dark:border-gray-700">
        <button onClick={onClose} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Close</button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
