import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Order, ProfileScreenProps, AccordionSectionProps } from '../../types'; 
import { storage } from '../../firebase';
import { ref, uploadString, getDownloadURL } from "firebase/storage"; // Modular Import

// --- Icons (defined outside to keep main component clean) ---
const UserCircleIcon: React.FC<{ className?: string }> = ({ className="w-16 h-16" }) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const PencilIcon: React.FC<{ className?: string }> = ({ className="w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const PersonFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MobileFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const EmailFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const InfoFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const HashFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M5 9h14M5 15h14" /></svg>;
const LogoutIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;
const CalendarFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const GenderFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.293 4.293a1 1 0 011.414 0L12 10.586l6.293-6.293a1 1 0 111.414 1.414L13.414 12l6.293 6.293a1 1 0 01-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 01-1.414-1.414L10.586 12 4.293 5.707a1 1 0 010-1.414zM14 18v2m-4-2v2m4-15a3 3 0 013 3v2a3 3 0 01-3 3h-4a3 3 0 01-3-3V6a3 3 0 013-3h4z" /></svg>;
const AddressFieldIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const OrdersIcon: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;


// --- Sub-components ---

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, badgeNumber, children, defaultOpen = false, isEditing, onEditToggle }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
      >
        <div className="flex items-center">
          {badgeNumber !== undefined && (
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
              {badgeNumber}
            </span>
          )}
          <span className="font-semibold text-gray-700 dark:text-gray-100">{title}</span>
        </div>
        <div className="flex items-center">
          {onEditToggle && ( 
            <button 
              onClick={(e) => { e.stopPropagation(); onEditToggle(); if(!isOpen && !isEditing) setIsOpen(true); }} 
              className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold mr-2 hover:underline px-2 py-1"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          )}
          {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        </div>
      </button>
      {isOpen && <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${isEditing ? 'pt-2' : ''}`}>{children}</div>}
    </div>
  );
};


const ProfileField: React.FC<{icon: React.ElementType, label: string, value?: string | null}> = ({icon: Icon, label, value}) => (
    <div className="flex items-start py-2.5">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-4 mt-1 flex-shrink-0" />
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm text-gray-800 dark:text-gray-100 font-medium break-all">{value || 'N/A'}</p>
        </div>
    </div>
);

const EditableProfileField: React.FC<{label: string, value: string, name: keyof UserProfile, onChange: (name: keyof UserProfile, value: string) => void, type?: string, placeholder?:string, as?: 'input' | 'textarea'}> = 
    ({label, value, name, onChange, type = "text", placeholder, as = 'input'}) => (
    <div className="mb-3">
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">{label}</label>
        {as === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder || label}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
        ) : (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder || label}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
        )}
    </div>
);


// --- Main Component ---

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('INFO');
  const tabs = ['INFO', 'ORDERS', 'COURSES', 'PERFORMANCE']; 

  const [isBasicInfoEditing, setIsBasicInfoEditing] = useState(false);
  const [isPersonalInfoEditing, setIsPersonalInfoEditing] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => { 
    setEditedUser({}); 
    setIsBasicInfoEditing(false);
    setIsPersonalInfoEditing(false);
    setIsAddressEditing(false);
  }, [user]);

  const handleEditToggle = (section: 'basic' | 'personal' | 'address') => {
    const currentlyEditing = section === 'basic' ? isBasicInfoEditing : section === 'personal' ? isPersonalInfoEditing : isAddressEditing;
    
    if (currentlyEditing) { 
      setEditedUser({});
    } else { 
      const initialEditData: Partial<UserProfile> = {
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        organizationCode: user.organizationCode || '',
        about: user.about || '',
        rollNumber: user.rollNumber || '',
        dateOfJoining: user.dateOfJoining || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        // Handle potentially missing address fields
        streetAddress: user.address?.streetAddress || user.streetAddress || '',
        city: user.address?.city || user.city || '',
        postalCode: user.address?.pincode || user.postalCode || '',
        country: user.address?.country || user.country || '',
        state: user.address?.state || user.state || '',
        avatarUrl: user.avatarUrl || '',
      };
      setEditedUser(initialEditData); 
    }

    if (section === 'basic') setIsBasicInfoEditing(!isBasicInfoEditing);
    if (section === 'personal') setIsPersonalInfoEditing(!isPersonalInfoEditing);
    if (section === 'address') setIsAddressEditing(!isAddressEditing);
  };
  
  const handleInputChange = (name: keyof UserProfile, value: string) => {
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (section: 'basic' | 'personal' | 'address') => {
    onUpdateProfile(editedUser);
    if (section === 'basic') setIsBasicInfoEditing(false);
    if (section === 'personal') setIsPersonalInfoEditing(false);
    if (section === 'address') setIsAddressEditing(false);
    setEditedUser({});
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.email) { 
      if (file.size > 1 * 1024 * 1024) { 
        alert("Image size should not exceed 1MB.");
        return;
      }
      setIsUploadingAvatar(true);
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64DataUrl = reader.result as string;
        try {
          const userIdForPath = user.email.replace(/[^a-zA-Z0-9]/g, '_'); 
          // FIXED: Firebase v9 Modular Syntax
          const avatarStorageRef = ref(storage, `user_avatars/${userIdForPath}/${file.name}`);
          
          await uploadString(avatarStorageRef, base64DataUrl, 'data_url'); 
          const downloadURL = await getDownloadURL(avatarStorageRef);
          
          onUpdateProfile({ avatarUrl: downloadURL }); 
        } catch (error) {
          console.error("Error uploading avatar: ", error);
          alert("Failed to upload profile picture.");
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const renderOrderStatus = (status: Order['status']) => {
    const statusClasses = {
        Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300",
        Processing: "bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300",
        Shipped: "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300",
        Delivered: "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300",
        Cancelled: "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300",
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  }

  // Helper to safely render dates from various potential Firestore formats
  const formatDate = (dateVal: any) => {
    try {
        if (!dateVal) return '';
        if (dateVal instanceof Date) return dateVal.toLocaleDateString();
        // Handle Firestore Timestamp (has toDate method)
        if (typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString();
        // Handle ISO String
        if (typeof dateVal === 'string') return new Date(dateVal).toLocaleDateString();
        return '';
    } catch (e) {
        return '';
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-full flex flex-col pb-16">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex items-center">
          <div className="relative group flex-shrink-0">
             {isUploadingAvatar ? (
                <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
             ) : user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-300 dark:ring-indigo-600" />
            ) : (
                <UserCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            )}
            <button
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                aria-label="Change profile picture"
            >
                <PencilIcon className="w-3 h-3" />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif"
                onChange={handleProfilePictureChange}
                disabled={isUploadingAvatar}
            />
          </div>
          <div className="ml-4 min-w-0">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex sticky top-0 z-10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors focus:outline-none min-w-[80px]
              ${activeTab === tab 
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-grow p-4 overflow-y-auto">
        {activeTab === 'INFO' && (
          <div>
            <AccordionSection title="Basic Information" badgeNumber={1} defaultOpen={true} isEditing={isBasicInfoEditing} onEditToggle={() => handleEditToggle('basic')}>
              {isBasicInfoEditing ? (
                <>
                  <EditableProfileField label="Full Name" name="name" value={editedUser.name || user.name || ''} onChange={handleInputChange} />
                  <EditableProfileField label="Mobile Number" name="mobileNumber" value={editedUser.mobileNumber || user.mobileNumber || ''} onChange={handleInputChange} />
                  <EditableProfileField label="Email" name="email" value={editedUser.email || user.email || ''} onChange={handleInputChange} type="email" />
                  <EditableProfileField label="About" name="about" value={editedUser.about || user.about || ''} onChange={handleInputChange} as="textarea" />
                  <EditableProfileField label="Roll Number" name="rollNumber" value={editedUser.rollNumber || user.rollNumber ||''} onChange={handleInputChange} />
                  <EditableProfileField label="Date of Joining" name="dateOfJoining" value={editedUser.dateOfJoining || user.dateOfJoining || ''} onChange={handleInputChange} type="date" />
                  <button onClick={() => handleSave('basic')} className="mt-2 w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 text-sm font-semibold">Save Changes</button>
                </>
              ) : (
                <>
                  <ProfileField icon={PersonFieldIcon} label="Name" value={user.name} />
                  <ProfileField icon={MobileFieldIcon} label="Mobile Number" value={user.mobileNumber} />
                  <ProfileField icon={EmailFieldIcon} label="Email" value={user.email} />
                  <ProfileField icon={InfoFieldIcon} label="About" value={user.about || "Learner, Explorer, Dreamer"} />
                  <ProfileField icon={HashFieldIcon} label="Roll Number" value={user.rollNumber || "CS-1024"} />
                  <ProfileField icon={CalendarFieldIcon} label="Date of Joining" value={user.dateOfJoining ? formatDate(user.dateOfJoining) : "N/A"} />
                </>
              )}
            </AccordionSection>
            
            <AccordionSection title="Personal Details" badgeNumber={2} isEditing={isPersonalInfoEditing} onEditToggle={() => handleEditToggle('personal')}>
              {isPersonalInfoEditing ? (
                 <>
                  <EditableProfileField label="Date of Birth" name="dateOfBirth" value={editedUser.dateOfBirth || user.dateOfBirth || ''} onChange={handleInputChange} type="date"/>
                  <EditableProfileField label="Gender" name="gender" value={editedUser.gender || user.gender || ''} onChange={handleInputChange} placeholder="e.g., Male, Female, Other"/>
                  <button onClick={() => handleSave('personal')} className="mt-2 w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 text-sm font-semibold">Save Changes</button>
                </>
              ) : (
                <>
                  <ProfileField icon={CalendarFieldIcon} label="Date of Birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : null} />
                  <ProfileField icon={GenderFieldIcon} label="Gender" value={user.gender} />
                  {!user.dateOfBirth && !user.gender && <p className="text-gray-500 dark:text-gray-400 text-sm p-2">No personal details provided.</p>}
                </>
              )}
            </AccordionSection>

             <AccordionSection title="Address" badgeNumber={3} isEditing={isAddressEditing} onEditToggle={() => handleEditToggle('address')}>
                {isAddressEditing ? (
                  <>
                    <EditableProfileField label="Street Address" name="streetAddress" value={editedUser.streetAddress || user.streetAddress || user.address?.streetAddress || ''} onChange={handleInputChange} placeholder="e.g., 123 Main St" />
                    <EditableProfileField label="City" name="city" value={editedUser.city || user.city || user.address?.city || ''} onChange={handleInputChange} />
                    <EditableProfileField label="State" name="state" value={editedUser.state || user.state || user.address?.state || ''} onChange={handleInputChange} />
                    <EditableProfileField label="Postal Code" name="postalCode" value={editedUser.postalCode || user.postalCode || user.address?.pincode || ''} onChange={handleInputChange} />
                    <EditableProfileField label="Country" name="country" value={editedUser.country || user.country || user.address?.country || ''} onChange={handleInputChange} />
                    <button onClick={() => handleSave('address')} className="mt-2 w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 text-sm font-semibold">Save Changes</button>
                  </>
                ) : (
                  <>
                    <ProfileField icon={AddressFieldIcon} label="Street Address" value={user.streetAddress || user.address?.streetAddress} />
                    <ProfileField icon={AddressFieldIcon} label="City" value={user.city || user.address?.city} />
                    <ProfileField icon={AddressFieldIcon} label="State" value={user.state || user.address?.state} />
                    <ProfileField icon={HashFieldIcon} label="Postal Code" value={user.postalCode || user.address?.pincode} />
                    <ProfileField icon={AddressFieldIcon} label="Country" value={user.country || user.address?.country} />
                    {!user.streetAddress && !user.address && <p className="text-gray-500 dark:text-gray-400 text-sm p-2">No address details provided.</p>}
                  </>
                )}
            </AccordionSection>

             <div className="mt-8">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 py-3 px-4 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800/70 transition-colors text-sm shadow-sm border border-red-200 dark:border-red-700/50"
                >
                    <LogoutIcon className="w-5 h-5 mr-2"/>
                    Sign Out
                </button>
            </div>
          </div>
        )}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">My Orders</h3>
            {(user.orders && user.orders.length > 0) ? (
              user.orders.slice().reverse().map(order => ( 
                <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Order ID: <span className="font-medium text-gray-700 dark:text-gray-300">{order.id}</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID: <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px] inline-block align-bottom">{order.transactionId}</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date: {formatDate(order.orderDate)}</p>
                    </div>
                    {renderOrderStatus(order.status)}
                  </div>
                  <div className="mb-2">
                    {order.items.slice(0,2).map(item => ( 
                          <div key={item.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300 py-0.5">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-6 h-6 rounded object-cover mr-2 bg-gray-200"/>}
                            <span className="truncate flex-1">{item.name} (x{item.quantity})</span>
                         </div>
                    ))}
                    {order.items.length > 2 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+ {order.items.length - 2} more items</p>}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Method: <span className="font-medium">{order.paymentMethod}</span></p>
                      <p className="text-md font-semibold text-indigo-600 dark:text-indigo-400">Total: ₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <OrdersIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">No orders yet.</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start shopping to see your orders here!</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'COURSES' && <div className="text-center p-10 text-gray-500">Coming Soon</div>}
        {activeTab === 'PERFORMANCE' && <div className="text-center p-10 text-gray-500">Coming Soon</div>}
      </div>
    </div>
  );
};

export default ProfileScreen;