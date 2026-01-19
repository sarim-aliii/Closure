import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Order, ProfileProps, AccordionSectionProps, Post } from '../../types'; 
import { storage, db } from '../../firebase';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Pencil from '../icons/Pencil'
import UserCircle from '../icons/UserCircle'
import ChevronDown from '../icons/ChevronDown'
import ChevronUp from '../icons/ChevronUp'
import PersonField from '../icons/PersonField'
import MobileField from '../icons/MobileField'
import EmailField from '../icons/EmailField'
import InfoField from '../icons/InfoField'
import HashField from '../icons/HashField'
import Logout from '../icons/Logout'
import Calendar from '../icons/Calendar'
import Gender from '../icons/Gender'
import Address from '../icons/Address'
import Orders from '../icons/Orders'
import Star from '../icons/Star'



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
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
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


const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('INFO');
  const tabs = ['INFO', 'POSTS', 'ORDERS', 'COURSES']; 

  const [isBasicInfoEditing, setIsBasicInfoEditing] = useState(false);
  const [isPersonalInfoEditing, setIsPersonalInfoEditing] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => { 
    setEditedUser({}); 
    setIsBasicInfoEditing(false);
    setIsPersonalInfoEditing(false);
    setIsAddressEditing(false);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'POSTS' && user?.id) {
        const fetchUserPosts = async () => {
            setLoadingPosts(true);
            try {
                const q = query(
                    collection(db, "posts"),
                    where("authorId", "==", user.id),
                    orderBy("timestamp", "desc")
                );
                const snapshot = await getDocs(q);
                const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
                setUserPosts(posts);
            } catch (error) {
                console.error("Error fetching user posts:", error);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchUserPosts();
    }
  }, [activeTab, user?.id]);

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

  const handleLogoutClick = () => {
      if(window.confirm("Are you sure you want to log out?")) {
          onLogout();
      }
  }

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

  const formatDate = (dateVal: any) => {
    try {
        if (!dateVal) return '';
        if (dateVal instanceof Date) return dateVal.toLocaleDateString();
        if (typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString();
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
                <UserCircle className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            )}
            <button
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                aria-label="Change profile picture"
            >
                <Pencil className="w-3 h-3" />
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
          <div className="ml-4 min-w-0 flex-grow">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            
            <div className="flex items-center mt-2 space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    {user.organizationCode === 'STUDENT' ? '🎓 Student' : '🏫 Faculty'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                    <Star className="w-3 h-3 mr-1"/>
                    {(user as any).karma || 0} Karma
                </span>
            </div>
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
                  <ProfileField icon={PersonField} label="Name" value={user.name} />
                  <ProfileField icon={MobileField} label="Mobile Number" value={user.mobileNumber} />
                  <ProfileField icon={EmailField} label="Email" value={user.email} />
                  <ProfileField icon={InfoField} label="About" value={user.about || "Learner, Explorer, Dreamer"} />
                  <ProfileField icon={HashField} label="Roll Number" value={user.rollNumber || "CS-1024"} />
                  <ProfileField icon={Calendar} label="Date of Joining" value={user.dateOfJoining ? formatDate(user.dateOfJoining) : "N/A"} />
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
                  <ProfileField icon={Calendar} label="Date of Birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : null} />
                  <ProfileField icon={Gender} label="Gender" value={user.gender} />
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
                    <ProfileField icon={Address} label="Street Address" value={user.streetAddress || user.address?.streetAddress} />
                    <ProfileField icon={Address} label="City" value={user.city || user.address?.city} />
                    <ProfileField icon={Address} label="State" value={user.state || user.address?.state} />
                    <ProfileField icon={HashField} label="Postal Code" value={user.postalCode || user.address?.pincode} />
                    <ProfileField icon={Address} label="Country" value={user.country || user.address?.country} />
                    {!user.streetAddress && !user.address && <p className="text-gray-500 dark:text-gray-400 text-sm p-2">No address details provided.</p>}
                  </>
                )}
            </AccordionSection>

             <div className="mt-8">
                <button 
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 py-3 px-4 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800/70 transition-colors text-sm shadow-sm border border-red-200 dark:border-red-700/50"
                >
                    <Logout className="w-5 h-5 mr-2"/>
                    Sign Out
                </button>
            </div>
          </div>
        )}

        {/* --- MY POSTS TAB (New) --- */}
        {activeTab === 'POSTS' && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">My Activity</h3>
                {loadingPosts ? (
                    <p className="text-center text-gray-500">Loading your posts...</p>
                ) : userPosts.length > 0 ? (
                    userPosts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">{post.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{post.content}</p>
                            <div className="flex text-xs text-gray-500 justify-between mt-2">
                                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                                <span className="font-medium text-indigo-600">{post.upvotes} Likes • {post.commentsCount} Comments</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">You haven't posted anything yet.</p>
                    </div>
                )}
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
                <Orders className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">No orders yet.</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start shopping to see your orders here!</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'COURSES' && <div className="text-center p-10 text-gray-500">Coming Soon</div>}
      </div>
    </div>
  );
};

export default Profile;