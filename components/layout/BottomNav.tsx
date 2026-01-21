import React from 'react';
import { Tabbar, TabbarLink } from 'konsta/react';
import { MainAppTab, BottomNavProps } from '../../types';
import Home from '../icons/Home';
import Store from '../icons/Store'; 
import Users from '../icons/Users'; 
import Profile from '../icons/Profile';
import Chat from '../icons/Chat';


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: MainAppTab.HOME, label: 'Home', icon: Home },
    { id: MainAppTab.STORE, label: 'Store', icon: Store },
    { id: MainAppTab.COMMUNITY, label: 'Community', icon: Users },
    { id: MainAppTab.CHATS, label: 'Chats', icon: Chat },
    { id: MainAppTab.PROFILE, label: 'Profile', icon: Profile },
  ];

  return (
    <Tabbar 
      labels 
      className="fixed bottom-0 left-0 z-20 pb-[env(safe-area-inset-bottom)]"
    >
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <TabbarLink
            key={item.id}
            active={isActive}
            label={item.label}
            onClick={() => onTabChange(item.id)}
            icon={
              <IconComponent 
                className="w-7 h-7 mb-1" 
                isActive={isActive} 
              />
            }
          />
        );
      })}
    </Tabbar>
  );
};

export default BottomNav;