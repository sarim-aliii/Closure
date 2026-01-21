import React, { useState } from 'react';
import { Navbar, NavbarBackLink, Link } from 'konsta/react';
import Menu from '../icons/Menu';
import Bell from '../icons/Bell';
import Cart from '../icons/Cart';
import { Notification, TopBarProps } from '../../types';
import NotificationDropdown from '../features/NotificationDropdown';
import { useUser } from '../../contexts/UserContext';


const SafeLink = Link as any;

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
  };

  return (
    <Navbar
      title={title}
      subtitle={
        user && title === "Closure" 
          ? `Hi, ${user.name.split(' ')[0]}!` 
          : undefined
      }
      className="top-0 sticky z-30"
      
      // --- LEFT ACTION (Back or Menu) ---
      left={
        showBackButton ? (
          <NavbarBackLink onClick={onBackClick} />
        ) : showMenuButton ? (
          <SafeLink navbar iconOnly onClick={onMenuClick}>
            <Menu className="w-6 h-6" />
          </SafeLink>
        ) : null
      }

      // --- RIGHT ACTIONS (Cart & Notifications) ---
      right={
        <div className="flex gap-1 items-center mr-2">
          
          {/* Cart Icon */}
          {onCartClick && (
            <SafeLink navbar iconOnly onClick={onCartClick} className="relative group">
              <Cart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-0 block h-4 w-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-pink-500 text-white ring-2 ring-indigo-700 dark:ring-indigo-800 pointer-events-none">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </SafeLink>
          )}

          {/* Notification Icon & Dropdown Wrapper */}
          <div className="relative">
            <SafeLink 
              navbar 
              iconOnly
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)} 
              className="relative"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-indigo-700 dark:ring-indigo-800 animate-pulse pointer-events-none"></span>
              )}
            </SafeLink>

            {/* Dropdown Menu */}
            {showNotificationsDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotificationsDropdown(false)}
                ></div>
                
                <div className="absolute right-0 mt-2 z-50 w-72 sm:w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
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
      }
    />
  );
};

export default TopBar;