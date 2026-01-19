import React from 'react';
import { Notification, NotificationDropdownProps } from '../../types';
import Bell from '../icons/Bell';

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClose, onNotificationClick, onMarkAllRead }) => {
  return (
    <div 
        className="absolute top-12 right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden transform origin-top-right transition-all"
        onClick={(e) => e.stopPropagation()} 
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-700 dark:text-gray-100 text-sm">Notifications</h3>
        {notifications.some((n: Notification) => !n.read) && (
           <button 
             onClick={onMarkAllRead} 
             className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
           >
             Mark all read
           </button>
        )}
      </div>
      
      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No new notifications.</p>
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 custom-scrollbar">
          {notifications.map((notification: Notification) => (
            <li 
              key={notification.id} 
              onClick={() => onNotificationClick(notification)}
              className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors relative ${
                  notification.read ? 'opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-900/10'
              }`}
            >
              {!notification.read && (
                  <span className="absolute top-4 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100 font-medium'} pr-4`}>
                  {notification.message}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  {new Date(notification.timestamp).toLocaleTimeString([], { day: 'numeric', month:'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </li>
          ))}
        </ul>
      )}
      
      {/* Footer */}
      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-700">
        <button 
            onClick={onClose} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
            Close
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;