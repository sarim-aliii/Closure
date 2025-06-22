
import React, { useState } from 'react';
import MenuIcon from './icons/MenuIcon';
import BellIcon from './icons/BellIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import CartIcon from './icons/CartIcon';
import { Notification } from '../types';
import NotificationDropdown from './NotificationDropdown';

interface TopBarProps {
  title: string;
  userName?: string | null;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  notifications?: Notification[];
  onNotificationClick?: (notificationId: string) => void; // Pass ID for marking read
  onMarkAllNotificationsRead?: () => void;
  cartItemCount?: number;
  onCartClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  userName,
  showMenuButton = true,
  onMenuClick,
  showBackButton = false,
  onBackClick,
  notifications = [],
  onNotificationClick = () => {},
  onMarkAllNotificationsRead = () => {},
  cartItemCount = 0,
  onCartClick,
}) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleNotificationItemClick = (notification: Notification) => {
    // Explicitly define the type of idValue to help TypeScript inference,
    // even though notification.id should already be a string.
    const idValue: string = notification.id;
    onNotificationClick(idValue);
    // Potentially navigate if notification has a link
    // setShowNotificationsDropdown(false); // Optionally close dropdown on item click
  };
  
  const handleMarkAllRead = () => {
    onMarkAllNotificationsRead();
  }

  return (
    <div className="bg-indigo-700 dark:bg-indigo-800 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-30">
      <div className="flex items-center">
        {showBackButton && (
          <button onClick={onBackClick} className="mr-2 p-1" aria-label="Go back">
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
        )}
        {showMenuButton && !showBackButton && (
          <button onClick={onMenuClick} className="mr-2 p-1" aria-label="Open menu">
            <MenuIcon className="w-6 h-6 text-white" />
          </button>
        )}
        <div>
            <h1 className="text-xl font-semibold leading-tight text-white">{title}</h1>
            {userName && title === "Closure" && ( // Show welcome only on main "Closure" title
                 <p className="text-xs opacity-80 leading-tight text-indigo-200 dark:text-indigo-300">Welcome, {userName}!</p>
            )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {onCartClick && title === "Closure" && ( // Show cart only on main app view for now
            <button onClick={onCartClick} className="relative p-1" aria-label={`Cart with ${cartItemCount} items`}>
                <CartIcon className="w-6 h-6 text-white" />
                {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 block h-4 w-4 text-xs flex items-center justify-center rounded-full bg-pink-500 text-white ring-2 ring-indigo-700 dark:ring-indigo-800">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
                )}
            </button>
        )}
        <div className="relative">
            <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)} 
                className="relative p-1" 
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                aria-expanded={showNotificationsDropdown}
            >
                <BellIcon className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-indigo-700 dark:ring-indigo-800"></span>
                )}
            </button>
            {showNotificationsDropdown && (
                <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setShowNotificationsDropdown(false)}
                    onNotificationClick={handleNotificationItemClick}
                    onMarkAllRead={handleMarkAllRead}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
