import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { MainAppTab, UserProfile, Notification, ModalType } from '../../types';
import AnimatedOutlet from './AnimatedOutlet';


interface MainLayoutProps {
  user: UserProfile;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  notifications: Notification[];
  cartItemCount: number;
  onNavigateToCart: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onLogout: () => void;
  onOpenModal: (type: ModalType, data?: any) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  user,
  isSidebarOpen,
  setIsSidebarOpen,
  notifications,
  cartItemCount,
  onNavigateToCart,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onLogout,
  onOpenModal
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on current path
  const getActiveTab = (path: string): MainAppTab => {
    if (path.startsWith('/store')) return MainAppTab.STORE;
    if (path.startsWith('/community')) return MainAppTab.COMMUNITY;
    if (path.startsWith('/chats')) return MainAppTab.CHATS;
    if (path.startsWith('/profile')) return MainAppTab.PROFILE;
    return MainAppTab.HOME;
  };

  const activeTab = getActiveTab(location.pathname);

  const handleTabChange = (tab: MainAppTab) => {
    switch (tab) {
      case MainAppTab.HOME: navigate('/'); break;
      case MainAppTab.STORE: navigate('/store'); break;
      case MainAppTab.COMMUNITY: navigate('/community'); break;
      case MainAppTab.CHATS: navigate('/chats'); break;
      case MainAppTab.PROFILE: navigate('/profile'); break;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <TopBar 
        title="Closure" 
        userName={user.name} 
        showMenuButton={true}
        onMenuClick={() => setIsSidebarOpen(true)}
        notifications={notifications}
        onNotificationClick={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        cartItemCount={cartItemCount}
        onCartClick={onNavigateToCart}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        onNavigateToSettings={() => navigate('/settings')}
        onOpenModal={onOpenModal}
        onSwitchToProfileTab={() => navigate('/profile')}
      />

      <main className="flex-grow overflow-y-auto overflow-x-hidden relative">
        <AnimatedOutlet />
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default MainLayout;