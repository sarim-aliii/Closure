import React from 'react';
import UserCircle from '../icons/UserCircle'; 
import { SidebarProps, ModalType } from '../../types';
import Download from '../icons/Download';
import Folder from '../icons/Folder';
import Testimonial from '../icons/Testimonial';
import EditProfile from '../icons/EditProfile';
import Settings from '../icons/Settings';
import Help from '../icons/Help';
import Privacy from '../icons/Privacy';
import Share from '../icons/Share';
import { useUser } from '../../contexts/UserContext';


const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNavigateToSettings, 
  onOpenModal, 
  onSwitchToProfileTab 
}) => {
  const { user } = useUser(); 

  const menuItems = [
    { label: 'Offline Downloads', icon: Download, badge: false, action: () => { onOpenModal(ModalType.OFFLINE_DOWNLOADS_LIST); onClose(); } },
    { label: 'Free Material', icon: Folder, badge: false, action: () => { onOpenModal(ModalType.FREE_MATERIAL_LIST); onClose(); } },
    { label: 'Students Testimonial', icon: Testimonial, badge: true, action: () => { onOpenModal(ModalType.TESTIMONIALS); onClose(); } },
    { label: 'Edit Profile', icon: EditProfile, badge: false, action: () => { if(onSwitchToProfileTab) onSwitchToProfileTab(); onClose(); } }, 
    { label: 'Settings', icon: Settings, badge: false, action: () => { onNavigateToSettings(); onClose(); } },
    { label: 'Help & Support', icon: Help, badge: true, action: () => { onOpenModal(ModalType.HELP_SUPPORT); onClose(); } },
    { label: 'Privacy Policy', icon: Privacy, badge: false, action: () => { onOpenModal(ModalType.PRIVACY_POLICY); onClose(); } },
  ];

  const handleShare = async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Closure App',
                text: 'Join me on Closure, the best app for college students!',
                url: window.location.origin
            });
        } else {
            alert("Sharing not supported on this browser.");
        }
    } catch (error) {
        console.log("Error sharing", error);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-72 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col items-center">
             {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500 dark:ring-indigo-400 mb-3" />
             ) : (
                <UserCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-3" />
             )}
             <p className="text-center font-bold text-gray-900 dark:text-gray-100 truncate w-full text-lg">{user.name}</p>
             <p className="text-center text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-1">
                {user.organizationCode}
             </p>
          </div>
        </div>

        <nav className="flex-grow overflow-y-auto py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center px-6 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <item.icon className="w-5 h-5 mr-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={handleShare}
            className="w-full flex items-center justify-center bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm text-sm font-semibold"
          >
            <Share className="w-4 h-4 mr-2" />
            Share App
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;