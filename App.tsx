import React, { useState, useCallback, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core'; 
import { PushNotifications } from '@capacitor/push-notifications'; 

import { 
  AppView, ModalType,
  Product, CartItem, Notification as AppNotification, Announcement, Event,
  DownloadableItem, FreeMaterialItem, Testimonial,
  ChatConversation, PopupMessage, NotificationPreferences,
  Post, Address, Order 
} from './types';

import { useUser } from './contexts/UserContext';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ChangePassword from './components/auth/ChangePassword';
import ForgotPassword from './components/auth/ForgotPassword';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import Modal from './components/layout/Modal';
import Popup from './components/layout/Popup';
import TermsAndConditions from './components/layout/TermsAndConditions';

// Feature Components
import Home from './components/features/Home';
import Store from './components/features/Store'; 
import Community from './components/features/Community';
import Profile from './components/features/Profile';
import Settings from './components/features/Settings';
import Cart from './components/features/Cart';
import Chats from './components/features/Chats';
import ChatDetail from './components/features/ChatDetail';
import PostDetail from './components/features/PostDetail'; 
import PaymentDetails from './components/features/PaymentDetails'; 
import UPIPayment from './components/features/UPIPayment'; 
import CreatePost from './components/features/CreatePost';
import TestimonialComponent from './components/features/Testimonial';
import PrivacyPolicy from './components/features/PrivacyPolicy';
import HelpSupport from './components/features/HelpSupport';
import OfflineDownloads from './components/features/OfflineDownloads';
import FreeMaterial from './components/features/FreeMaterial';
import NotificationSettings from './components/features/NotificationSettings';
import Acknowledgements from './components/features/Acknowledgements';
import OrderSuccess from './components/features/OrderSuccess'; 
import ViewFreeMaterialContent from './components/features/ViewFreeMaterial';
import AddProduct from './components/features/AddProduct'; 
import AdminDashboard from './components/features/AdminDashboard';


import { auth, db, storage, messaging } from './firebase'; 
import { getToken, onMessage } from "firebase/messaging"; 

import { 
  signOut, signInWithEmailAndPassword, updatePassword, 
  sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider 
} from "firebase/auth"; 
import { 
  doc, updateDoc, collection, addDoc, query, orderBy, getDocs, 
  writeBatch, serverTimestamp, increment, arrayUnion, arrayRemove, Timestamp, getDoc 
} from "firebase/firestore"; 
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export type Theme = 'light' | 'dark';


// --- Protected Route Wrapper ---
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
     return (
       <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
       </div>
     );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App: React.FC = () => {
  const { user, firebaseUser, loading, refreshProfile } = useUser();
  const navigate = useNavigate();
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModal, setCurrentModal] = useState<ModalType | null>(null);
  const [activeModalData, setActiveModalData] = useState<any>(null);
  const [popupMessages, setPopupMessages] = useState<PopupMessage[]>([]);

  const appVersion = "1.5.5.1"; 
  
  // Application Data State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Mock/Initial Data State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [downloadableContent, setDownloadableContent] = useState<DownloadableItem[]>([]);
  const [freeMaterials, setFreeMaterials] = useState<FreeMaterialItem[]>([]);
  const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>([]);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const notificationPreferences = user?.notificationPreferences || {
    newAnnouncements: true, chatMentions: true, eventReminders: true, promotionalUpdates: false,
  };

  const addPopupMessage = useCallback((message: string, type: PopupMessage['type']) => {
    const id = String(Date.now());
    setPopupMessages(prev => [...prev, { id, message, type }]);
    setTimeout(() => setPopupMessages(prev => prev.filter(p => p.id !== id)), 3000);
  }, []);

  // --- NOTIFICATION SETUP (Native + Web) ---
  useEffect(() => {
    if (!firebaseUser) return;

    const setupNotifications = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          // 1. Native Mobile (Android/iOS) Logic
          const permStatus = await PushNotifications.requestPermissions();
          
          if (permStatus.receive === 'granted') {
            await PushNotifications.register();
            
            PushNotifications.addListener('registration', async (token) => {
              console.log('Push Registration Token:', token.value);
              await updateDoc(doc(db, "users", firebaseUser.uid), {
                fcmToken: token.value
              });
            });

            PushNotifications.addListener('registrationError', (error) => {
               console.error('Push Registration Error:', error);
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
               addPopupMessage(notification.title || "New Notification", 'info');
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
               const data = notification.notification.data;
               if (data.chatId) {
                  navigate(`/chats/${data.chatId}`);
               }
            });
          }
        } else {
          // 2. Web / PWA Logic
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging, { 
              vapidKey: import.meta.env.VITE_VAPID_API_KEY 
            });
            
            if (token) {
              await updateDoc(doc(db, "users", firebaseUser.uid), {
                fcmToken: token
              });
            }

            onMessage(messaging, (payload) => {
              addPopupMessage(payload.notification?.title || "New Message", 'info');
            });
          }
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, [firebaseUser, addPopupMessage, navigate]);


  // Capacitor Back Button Logic
  useEffect(() => {
    const setupBackButtonListener = async () => {
      const handleBackButton = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
           window.history.back();
        } else {
           CapacitorApp.exitApp();
        }
      });
      return () => handleBackButton.remove();
    };
    setupBackButtonListener();
  }, []);

  // Fetch Notifications
  useEffect(() => {
    if (user && firebaseUser?.emailVerified) {
      const fetchNotifications = async () => {
        try {
          const notificationsQuery = query(collection(db, "users", user.id, "notifications"), orderBy("timestamp", "desc")); 
          const snap = await getDocs(notificationsQuery);
          setNotifications(snap.docs.map(d => ({ 
              id: d.id, ...d.data(), timestamp: (d.data().timestamp as Timestamp).toDate() 
          } as AppNotification)));
        } catch (e) { console.error("Error fetching notifications", e); }
      };
      fetchNotifications();
    }
  }, [user, firebaseUser]);

  // Initialize Mock Data
  useEffect(() => {
    setAnnouncements([{ id: 'anno1', title: 'Mid-term Exams Schedule Released', content: 'The schedule for the upcoming mid-term examinations has been released.', fullContent: 'Detailed content here...', date: 'Oct 26, 2023' }]);
    setEvents([{ id: 'event1', title: 'Annual Sports Day', date: 'Nov 10, 2023', time: '09:00 AM', location: 'University Ground', description: 'Sports day!', fullDescription: 'Full description...'}]);
    setDownloadableContent([ { id: 'dl1', name: 'Introduction to Programming (PDF)', type: 'PDF', size: '2.5 MB', url: '#' }, ]);
    setFreeMaterials([ { id: 'fm1', title: 'Understanding React Hooks', description: 'A comprehensive guide.', type: 'article', content: 'React Hooks content...' }]);
    setTestimonialsData([ {id: 't1', studentName: 'Alice Wonderland', course: 'Computer Science', testimonialText: 'Great platform!', avatarUrl: 'https://picsum.photos/seed/alice/100/100'} ]);
    setChatConversations([
        { id: 'chat1', participants: [{id: 'closure_admin', name: 'Closure Admin', avatarUrl: 'https://picsum.photos/seed/closure_avatar/40/40'}], messages: [{id: 'msg1', senderId: 'closure_admin', text: 'Welcome to Closure! How can we help?', timestamp: new Date(Date.now() - 200000).toISOString()}], unreadCount: 1, lastMessagePreview: 'Welcome to Closure!', lastMessageTimestamp: new Date(Date.now() - 200000) },
    ]);
  }, []);

  // Theme Handling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Handlers ---
  
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setCartItems([]);
      setIsSidebarOpen(false);
      navigate('/login');
      addPopupMessage("Logged out successfully.", "info");
    } catch (error) {
      addPopupMessage("Failed to logout.", "error");
    }
  }, [addPopupMessage, navigate]);

  const handleLoginAttempt = useCallback(async (emailToLogin: string, passwordToLogin: string): Promise<boolean> => {
    setError(null); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, passwordToLogin);
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setError("Please verify your email address.");
        return false;
      }
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        await signOut(auth);
        setError("Profile missing.");
        return false;
      }
      navigate('/'); // Redirect to Home
      return true;
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else setError(error.message || 'Failed to login.');
      return false;
    }
  }, [navigate]);

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    addPopupMessage(`${product.name} added to cart!`, 'success');
  }, [addPopupMessage]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
    addPopupMessage("Item removed.", "info");
  }, [addPopupMessage]);

  const handleUpdateCartQuantity = useCallback((itemId: string, qty: number) => {
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, qty) } : i).filter(i => i.quantity > 0));
  }, []);

  const handleMarkNotificationRead = useCallback(async (notificationId: string) => {
    if (!firebaseUser) return;
    try {
        const notifRef = doc(db, "users", firebaseUser.uid, "notifications", notificationId);
        await updateDoc(notifRef, { read: true });
        setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, read: true} : n));
    } catch (error) { console.error("Error marking read:", error); }
  }, [firebaseUser]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    if (!firebaseUser || notifications.every(n => n.read)) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
        if (!n.read) {
            const notifRef = doc(db, "users", firebaseUser.uid, "notifications", n.id);
            batch.update(notifRef, { read: true });
        }
    });
    try {
        await batch.commit();
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    } catch (error) { addPopupMessage("Failed to mark all as read.", "error"); }
  }, [firebaseUser, notifications, addPopupMessage]);

  // --- Modals ---
  const handleOpenModal = useCallback((modalType: ModalType, data?: any) => {
    setCurrentModal(modalType);
    setActiveModalData(data);
  }, []);
  const handleCloseModal = useCallback(() => {
    setCurrentModal(null);
    setActiveModalData(null);
  }, []);

  const renderModalContent = () => {
    switch (currentModal) {
      case ModalType.CREATE_POST:
        return <CreatePost onSubmit={async (title, content, img) => { handleCloseModal(); addPopupMessage("Post created", "success"); }} onClose={handleCloseModal} currentUserId={firebaseUser?.uid} />;
      case ModalType.ADD_PRODUCT:
         return <AddProduct onSubmit={async () => { handleCloseModal(); addPopupMessage("Product added", "success"); }} onClose={handleCloseModal} />;
      case ModalType.TESTIMONIALS: return <TestimonialComponent testimonials={testimonialsData} />;
      case ModalType.PRIVACY_POLICY: return <PrivacyPolicy onClose={handleCloseModal} />;
      case ModalType.HELP_SUPPORT: return <HelpSupport onStartSupportChat={() => { handleCloseModal(); navigate('/chats/support'); }} />;
      case ModalType.OFFLINE_DOWNLOADS_LIST: return <OfflineDownloads items={downloadableContent} user={user} onDownload={() => {}} onViewDownloaded={() => {}} />;
      case ModalType.FREE_MATERIAL_LIST: return <FreeMaterial materials={freeMaterials} onOpenModal={handleOpenModal} />;
      case ModalType.VIEW_FREE_MATERIAL_CONTENT: return <ViewFreeMaterialContent title={activeModalData?.title} content={activeModalData?.content} />;
      case ModalType.ANNOUNCEMENT_DETAIL: return <div className="p-4">{activeModalData?.fullContent}</div>;
      case ModalType.EVENT_DETAIL: return <div className="p-4">{activeModalData?.fullDescription}</div>;
      case ModalType.NOTIFICATION_SETTINGS: return <NotificationSettings onClose={handleCloseModal} />;
      case ModalType.CHANGE_PASSWORD: return <ChangePassword onChangePassword={async () => true} onClose={handleCloseModal} />;
      case ModalType.TERMS_AND_CONDITIONS: return <TermsAndConditions onClose={handleCloseModal}/>;
      case ModalType.ACKNOWLEDGEMENTS: return <Acknowledgements onClose={handleCloseModal}/>;
      case ModalType.FORGOT_PASSWORD: return <ForgotPassword onClose={handleCloseModal} onForgotPasswordRequest={async () => true} />;
      case ModalType.ORDER_SUCCESS_MODAL:
        return <OrderSuccess order={activeModalData?.order} onViewOrders={() => { handleCloseModal(); navigate('/profile'); }} onContinueShopping={() => { handleCloseModal(); navigate('/store'); }} onClose={handleCloseModal} />;
      default: return null;
    }
  };

  const modalTitle = () => {
      if (currentModal === ModalType.CREATE_POST) return "Create New Post";
      if (currentModal === ModalType.ADD_PRODUCT) return "Add New Product";
      return currentModal || "";
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={
          <Login 
            onLoginAttempt={handleLoginAttempt} 
            onOpenModal={handleOpenModal} 
            errorMessage={error} 
          />
        } />
        
        <Route path="/signup" element={
            <Signup 
                onSignupAttempt={async () => true} 
                onNavigateToLogin={() => navigate('/login')} 
                errorMessage={error} 
            />
        } />
        
        <Route element={
          <RequireAuth>
            <MainLayout 
              user={user!} 
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              notifications={notifications}
              cartItemCount={cartItems.length}
              onNavigateToCart={() => navigate('/cart')}
              onMarkNotificationRead={handleMarkNotificationRead}
              onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
              onLogout={handleLogout}
              onOpenModal={handleOpenModal}
            />
          </RequireAuth>
        }>
          <Route path="/" element={<Home onOpenModal={handleOpenModal} announcements={announcements} events={events} userName={user?.name || ''} />} />
          <Route path="/store" element={<Store onAddToCart={handleAddToCart} onOpenModal={handleOpenModal} />} />
          <Route path="/community" element={<Community onNavigateToPostDetail={(post) => navigate(`/posts/${post.id}`, { state: { post } })} onToggleLike={async () => {}} onOpenModal={handleOpenModal} />} />
          <Route path="/chats" element={<Chats conversations={chatConversations} onNavigate={(view, data) => navigate(`/chats/${data?.conversationId}`)} />} />
          <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} onRemoveItem={handleRemoveFromCart} onUpdateQuantity={handleUpdateCartQuantity} onNavigate={(view) => { if (view === 'PAYMENT_DETAILS') navigate('/payment'); }} onBack={() => navigate(-1)} />} />
          <Route path="/settings" element={<Settings version={appVersion} onLogout={handleLogout} onOpenModal={handleOpenModal} currentTheme={{ mode: theme }} onSetTheme={setTheme} onBack={() => navigate('/')} addPopupMessage={addPopupMessage} userEmail={user?.email} onNavigateToAdmin={() => navigate('/admin')} />} />
          <Route path="/payment" element={<PaymentDetails currentUser={user} cartItems={cartItems} onNavigate={(view, data) => { if(view === 'UPI_PAYMENT') navigate('/upi-payment', { state: data }); }} onBack={() => navigate('/cart')} onUpdateUserProfile={async () => {}} />} />
          <Route path="/upi-payment" element={<UPIPayment deliveryAddress={{} as Address} paymentMethod="" totalAmount={0} onConfirmPayment={async () => {}} onBack={() => navigate('/payment')} />} />
          <Route path="/admin" element={<AdminDashboard onClose={() => navigate('/settings')} />} />
          
          <Route path="/posts/:postId" element={<PostDetail onBack={() => navigate(-1)} />} />
          <Route path="/chats/:conversationId" element={<ChatDetail onBack={() => navigate('/chats')} />} />
        </Route>
      </Routes>

      <Modal 
        isOpen={currentModal !== null} 
        onClose={handleCloseModal} 
        title={modalTitle()}
        size={currentModal === ModalType.ORDER_SUCCESS_MODAL ? 'sm' : 'md'}
      >
        {renderModalContent()}
      </Modal>

      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {popupMessages.map(p => (
          <Popup key={p.id} message={p.message} type={p.type} onClose={() => setPopupMessages(prev => prev.filter(msg => msg.id !== p.id))} />
        ))}
      </div>
    </>
  );
};

export default App;