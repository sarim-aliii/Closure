import React, { useState } from 'react';
import Menu from '../icons/Menu';
import Bell from '../icons/Bell';
import ArrowLeft from '../icons/ArrowLeft';
import Cart from '../icons/Cart';
import { Notification, TopBarProps } from '../../types';
import NotificationDropdown from '../features/NotificationDropdown';
import { useUser } from '../../contexts/UserContext';


const TopBar: React.FC<TopBarProps> = ({
  title,
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
  const { user } = useUser();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleNotificationItemClick = (notification: Notification) => {
    onNotificationClick(notification.id);
    setShowNotificationsDropdown(false);
  };
  
  const handleMarkAllRead = () => {
    onMarkAllNotificationsRead();
  }

  return (
    <div className="bg-indigo-700 dark:bg-indigo-800 text-white pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 px-4 flex items-center justify-between shadow-md sticky top-0 z-30 transition-colors duration-200">
      
      {/* LEFT SECTION: Navigation & Title */}
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <button onClick={onBackClick} className="p-1 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        ) : (
          showMenuButton && (
            <button onClick={onMenuClick} className="p-1 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors" aria-label="Open menu">
              <Menu className="w-6 h-6 text-white" />
            </button>
          )
        )}
        
        <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white">{title}</h1>
            {user && title === "Closure" && ( 
                 <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs opacity-90 leading-tight text-indigo-100 dark:text-indigo-200 font-medium">
                        Hi, {user.name.split(' ')[0]}!
                    </p>
                 </div>
            )}
        </div>
      </div>

      {/* RIGHT SECTION: Actions */}
      <div className="flex items-center space-x-2">
        
        {/* Cart Icon (Only if handler is provided) */}
        {onCartClick && (
            <button 
                onClick={onCartClick} 
                className="relative p-2 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors" 
                aria-label={`Cart with ${cartItemCount} items`}
            >
                <Cart className="w-6 h-6 text-white" />
                {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-pink-500 text-white ring-2 ring-indigo-700 dark:ring-indigo-800">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
                )}
            </button>
        )}

        {/* Notifications Icon */}
        <div className="relative">
            <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)} 
                className="relative p-2 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors" 
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                aria-expanded={showNotificationsDropdown}
            >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-indigo-700 dark:ring-indigo-800 animate-pulse"></span>
                )}
            </button>
            
            {/* Dropdown Menu */}
            {showNotificationsDropdown && (
                <>
                    {/* Backdrop to close when clicking outside */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 z-50">
                        <NotificationDropdown
                            notifications={notifications}
                            onClose={() => setShowNotificationsDropdown(false)}
                            onNotificationClick={handleNotificationItemClick}
                            onMarkAllRead={handleMarkAllRead}
                        />
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;