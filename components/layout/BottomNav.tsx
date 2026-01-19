import React from 'react';
import { MainAppTab, BottomNavProps } from '../../types';
import Home from '../icons/Home';
import Store from '../icons/Store'; 
import Users from '../icons/Users'; 
import Profile from '../icons/Profile';


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: MainAppTab.HOME, label: 'Home', icon: Home },
    { id: MainAppTab.STORE, label: 'Store', icon: Store },
    { id: MainAppTab.COMMUNITY, label: 'Community', icon: Users },
    { id: MainAppTab.PROFILE, label: 'Profile', icon: Profile },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center shadow-top h-16 z-10">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 w-1/4 text-xs ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
            } hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
            aria-label={item.label}
          >
            <IconComponent className="w-6 h-6 mb-0.5" isActive={isActive} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;