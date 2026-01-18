import React from 'react';
import UserCircleIcon from '../icons/UserCircle'; 
import { SidebarProps, ModalType } from '../../types';


const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const FolderIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const TestimonialIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const EditProfileIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const HelpIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.755 4 3.92C16 12.805 14.5 14 12.5 14.5M12 6V4M12 18v2" /><circle cx="12" cy="12" r="10" /></svg>;
const PrivacyIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m13 2h-2.5A3.5 3.5 0 0 0 12 8.5V11H9.5v3H12v7h3v-7h2.021l.459-3H15v-2a.5.5 0 0 1 .5-.5H18V5Z" /></svg>;


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, onNavigateToSettings, onOpenModal, onSwitchToProfileTab }) => {
  const menuItems = [
    { label: 'Offline Downloads', icon: DownloadIcon, badge: false, action: () => { onOpenModal(ModalType.OFFLINE_DOWNLOADS_LIST); onClose(); } },
    { label: 'Free Material', icon: FolderIcon, badge: false, action: () => { onOpenModal(ModalType.FREE_MATERIAL_LIST); onClose(); } },
    { label: 'Students Testimonial', icon: TestimonialIcon, badge: true, action: () => { onOpenModal(ModalType.TESTIMONIALS); onClose(); } },
    { label: 'Edit Profile', icon: EditProfileIcon, badge: false, action: () => { if(onSwitchToProfileTab) onSwitchToProfileTab(); onClose(); } }, 
    { label: 'Settings', icon: SettingsIcon, badge: false, action: () => { onNavigateToSettings(); onClose(); } },
    { label: 'Help & Support', icon: HelpIcon, badge: true, action: () => { onOpenModal(ModalType.HELP_SUPPORT); onClose(); } },
    { label: 'Privacy Policy', icon: PrivacyIcon, badge: false, action: () => { onOpenModal(ModalType.PRIVACY_POLICY); onClose(); } },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 transition-opacity duration-300 ease-in-out" onClick={onClose}></div>}
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-72 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <UserCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-center font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">Organization Code {user.organizationCode}</p>
        </div>

        <nav className="flex-grow overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">NEW</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center justify-center bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            <FacebookIcon className="w-5 h-5 mr-2" />
            Share on facebook
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;