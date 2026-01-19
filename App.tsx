import React, { useState, useCallback, useEffect } from 'react';

import { 
  AppView, MainAppTab, UserProfile, ModalType,
  Product, CartItem, Notification, Announcement, Event,
  DownloadableItem, FreeMaterialItem, Testimonial,
  ChatConversation, ChatMessage, PopupMessage, NotificationPreferences,
  Post, Address, Order 
} from './types';

// 1. Context Hook (Assumed path based on setup)
import { useUser } from './contexts/UserContext';

// 2. Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ChangePassword from './components/auth/ChangePassword';
import ForgotPassword from './components/auth/ForgotPassword';

// 3. Feature Components
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

// 4. Layout Components
import TopBar from './components/layout/TopBar';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import Modal from './components/layout/Modal';
import Popup from './components/layout/Popup';
import TermsAndConditions from './components/layout/TermsAndConditions';

// 5. Firebase Imports
import { auth, db, storage } from './firebase';
import { 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updatePassword, 
  sendPasswordResetEmail, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth"; 
import { 
  doc, setDoc, updateDoc, collection, addDoc, 
  query, orderBy, getDocs, writeBatch, serverTimestamp, 
  increment, arrayUnion, arrayRemove, Timestamp 
} from "firebase/firestore"; 
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // --- Context Hooks ---
  const { user, firebaseUser, loading, refreshProfile } = useUser();

  // --- State Management ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN); 
  const [activeTab, setActiveTab] = useState<MainAppTab>(MainAppTab.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const appVersion = "1.5.5.1"; 

  const [products, setProducts] = useState<Product[]>([]); 
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [downloadableContent, setDownloadableContent] = useState<DownloadableItem[]>([]);
  const [freeMaterials, setFreeMaterials] = useState<FreeMaterialItem[]>([]);
  const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>([]);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Local state for optimistic UI, but synced with Context
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set()); 
  
  const [currentModal, setCurrentModal] = useState<ModalType | null>(null);
  const [activeModalData, setActiveModalData] = useState<any>(null);
  const [popupMessages, setPopupMessages] = useState<PopupMessage[]>([]);

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Helper to safely get preferences
  const notificationPreferences = user?.notificationPreferences || {
    newAnnouncements: true,
    chatMentions: true,
    eventReminders: true,
    promotionalUpdates: false,
  };

  // --- Helper: Popup Messages ---
  const addPopupMessage = useCallback((message: string, type: PopupMessage['type']) => {
    const id = String(Date.now());
    setPopupMessages(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        setPopupMessages(prev => prev.filter(p => p.id !== id));
    }, 3000);
  }, []);

  // --- Effect: Sync User Data from Context ---
  useEffect(() => {
    if (user) {
      // 1. Sync Liked Posts/Comments for local UI
      setLikedPostIds(new Set(user.likedPostIds || []));
      setLikedCommentIds(new Set(user.likedCommentIds || []));

      // 2. Fetch Notifications (Subcollection - must be fetched manually as it's not in User Object)
      const fetchNotifications = async () => {
        try {
          const notificationsQuery = query(collection(db, "users", user.id, "notifications"), orderBy("timestamp", "desc")); 
          const notificationsSnapshot = await getDocs(notificationsQuery);
          setNotifications(notificationsSnapshot.docs.map(d => ({
              id: d.id, 
              ...d.data(), 
              timestamp: (d.data().timestamp as Timestamp).toDate() 
          } as Notification)));
        } catch (e) {
          console.error("Error fetching notifications", e);
        }
      };
      fetchNotifications();

      // 3. Navigation Logic (Only redirect to main if we are currently in Login/Signup)
      if (currentView === AppView.LOGIN || currentView === AppView.SIGNUP) {
        setCurrentView(AppView.MAIN);
      }
    } else if (!loading && !user) {
       // If not loading and no user, force login
       setCurrentView(AppView.LOGIN);
    }
  }, [user, loading, currentView]); // Removed dependencies that cause loops


  // --- Effect: Fetch Content Data ---
  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const productsCol = collection(db, 'products');
            const productSnapshot = await getDocs(productsCol);
            const productList = productSnapshot.docs.map(doc => {
                const data = doc.data();
                let price = parseFloat(data.price);
                if (isNaN(price)) {
                    price = 0;
                }
                return { id: doc.id, ...data, price } as Product;
            });
            setProducts(productList);
        } catch (e) {
            console.error("Error fetching products: ", e);
            addPopupMessage("Could not load products.", "error");
        }
    };

    const fetchPosts = async () => {
        try {
            const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(postsQuery);
            const fetchedPosts: Post[] = [];
            querySnapshot.forEach((docSnap) => { 
                const data = docSnap.data();
                let dateStr = new Date().toISOString();
                if (data.timestamp && (data.timestamp as Timestamp).toDate) {
                    dateStr = (data.timestamp as Timestamp).toDate().toISOString();
                } else if (data.timestamp instanceof Date) {
                    dateStr = data.timestamp.toISOString();
                }

                fetchedPosts.push({ 
                    id: docSnap.id, 
                    ...data, 
                    // @ts-ignore
                    timestamp: dateStr, 
                    comments: data.comments || [] 
                } as Post);
            });
            setPosts(fetchedPosts);
        } catch (e) {
            console.error("Error fetching posts: ", e);
            addPopupMessage("Could not load posts.", "error");
        }
    };

    fetchProducts();
    fetchPosts();
    
    // Mock Data
    setAnnouncements([
      { id: 'anno1', title: 'Mid-term Exams Schedule Released', content: 'The schedule for the upcoming mid-term examinations has been released.', fullContent: 'Detailed content here...', date: 'Oct 26, 2023' },
    ]);
    setEvents([
      { id: 'event1', title: 'Annual Sports Day', date: 'Nov 10, 2023', time: '09:00 AM', location: 'University Ground', description: 'Sports day!', fullDescription: 'Full description...'},
    ]);
    setDownloadableContent([ { id: 'dl1', name: 'Introduction to Programming (PDF)', type: 'PDF', size: '2.5 MB', url: '#' }, ]);
    setFreeMaterials([ 
        { 
          id: 'fm1', 
          title: 'Understanding React Hooks', 
          description: 'A comprehensive guide.', 
          type: 'article', 
          content: 'React Hooks content...' 
        },
    ]);
    setTestimonialsData([ {id: 't1', studentName: 'Alice Wonderland', course: 'Computer Science', testimonialText: 'Great platform!', avatarUrl: 'https://picsum.photos/seed/alice/100/100'}, ]);
    setChatConversations([
        { id: 'chat1', participants: [{id: 'closure_admin', name: 'Closure Admin', avatarUrl: 'https://picsum.photos/seed/closure_avatar/40/40'}], messages: [{id: 'msg1', senderId: 'closure_admin', text: 'Welcome to Closure! How can we help?', timestamp: new Date(Date.now() - 200000).toISOString()}], unreadCount: 1, lastMessagePreview: 'Welcome to Closure!', lastMessageTimestamp: new Date(Date.now() - 200000) },
    ]);
  }, [addPopupMessage]);


  // --- Auth Handlers ---
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      // State clearing is handled by the Context + useEffect, but we reset UI specific things here
      setActiveTab(MainAppTab.HOME);
      setIsSidebarOpen(false);
      setCartItems([]); 
      setCurrentView(AppView.LOGIN);
      addPopupMessage("Logged out successfully.", "info");
    } catch (error) {
      console.error("Logout Error:", error);
      addPopupMessage("Failed to logout.", "error");
    }
  }, [addPopupMessage]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const navigateToSignup = useCallback(() => { setError(null); setSignupSuccessMessage(null); setCurrentView(AppView.SIGNUP); }, []);
  const navigateToLogin = useCallback(() => { setError(null); setCurrentView(AppView.LOGIN); }, []);
  
  const handleSignupAttempt = useCallback(async (name: string, email: string, passwordPlain: string): Promise<boolean> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, passwordPlain);
      const fUser = userCredential.user;
      
      const newUserProfile: UserProfile = {
        id: fUser.uid,
        name,
        email: fUser.email || email, 
        mobileNumber: "", 
        organizationCode: "STUDENT", 
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        orders: [],
        downloadedItemIds: [],
        likedPostIds: [], 
        likedCommentIds: [], 
        notificationPreferences: { newAnnouncements: true, chatMentions: true, eventReminders: true, promotionalUpdates: false },
      };
      
      await setDoc(doc(db, "users", fUser.uid), newUserProfile);
      // Context will pick up the Auth change automatically
      setSignupSuccessMessage("Signup successful! Please login.");
      setCurrentView(AppView.LOGIN); 
      return true;
    } catch (error: any) {
      console.error("Firebase Signup Error:", error);
      if (error.code === 'auth/email-already-in-use') setError('This email address is already in use.');
      else if (error.code === 'auth/weak-password') setError('Password should be at least 6 characters.');
      else setError(error.message || 'Failed to sign up.');
      return false;
    }
  }, []);

  const handleLoginAttempt = useCallback(async (emailToLogin: string, passwordToLogin: string): Promise<boolean> => {
    setError(null); setSignupSuccessMessage(null);
    try {
      await signInWithEmailAndPassword(auth, emailToLogin, passwordToLogin);
      // Context handles the rest
      return true;
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(error.message || 'Failed to login.');
      }
      return false;
    }
  }, []);


  // --- Navigation & Modal Handlers ---
  const handleOpenModal = useCallback((modalType: ModalType, data?: any) => {
    setCurrentModal(modalType);
    setActiveModalData(data);
  }, []);

  const handleCloseModal = useCallback(() => {
    setCurrentModal(null);
    setActiveModalData(null);
  }, []);

  const handleNavigateToSettings = useCallback(() => setCurrentView(AppView.SETTINGS), []);
  const handleNavigateToCart = useCallback(() => setCurrentView(AppView.CART), []);
  const handleNavigateToChatDetail = useCallback((conversationId: string) => {
    setCurrentView(AppView.CHAT_DETAIL);
    setActiveModalData({ conversationId }); 
  }, []);
   const handleNavigateToPostDetail = useCallback((postId: string) => {
    setCurrentView(AppView.POST_DETAIL);
    setActiveModalData({ postId }); 
  }, []);
  const handleBackToMain = useCallback(() => setCurrentView(AppView.MAIN), []);

  const onNavigate = (view: AppView, data?: any) => {
    setCurrentView(view);
    if (data !== undefined) setActiveModalData(data);
    else setActiveModalData(null); 
  };

  // --- Feature Logic ---

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    addPopupMessage(`${product.name} added to cart!`, 'success');
  }, [addPopupMessage]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    addPopupMessage("Item removed from cart.", "info");
  }, [addPopupMessage]);

  const handleUpdateCartQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0) 
    );
  }, []);

   const handleCreatePost = useCallback(async (title: string, content: string, imageUrl?: string) => {
    if (!firebaseUser || !user) {
      addPopupMessage("You must be logged in to create a post.", "error");
      return;
    }
    try {
      const newPostData: Omit<Post, 'id' | 'timestamp' | 'comments'> = {
        authorId: firebaseUser.uid,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
        title,
        content,
        upvotes: 0,
        commentsCount: 0,
      };
      if (imageUrl) {
        (newPostData as Post).imageUrl = imageUrl;
      }

      const postWithTimestamp = {
        ...newPostData,
        timestamp: serverTimestamp(),
        comments: [], 
      };

      const docRef = await addDoc(collection(db, "posts"), postWithTimestamp);
      const newPostForState: Post = {
        ...newPostData,
        id: docRef.id,
        // @ts-ignore
        timestamp: new Date().toISOString(), 
        comments: [],
      } as Post;

      setPosts(prevPosts => [newPostForState, ...prevPosts]);
      addPopupMessage("Post created successfully!", "success");
      handleCloseModal();
    } catch (e) {
      console.error("Error creating post: ", e);
      addPopupMessage("Failed to create post.", "error");
    }
  }, [firebaseUser, user, addPopupMessage, handleCloseModal]);


  const handleAddNewProduct = useCallback(async (productData: Omit<Product, 'id' | 'imageUrl'>, imageBase64?: string) => {
    if (!firebaseUser) { 
        addPopupMessage("Unauthorized.", "error");
        return;
    }
    let uploadedImageUrl: string | undefined = undefined;
    try {
        if (imageBase64) {
            const imageName = `${Date.now()}_product_image`;
            const imageRef = ref(storage, `product_images/${imageName}`);
            await uploadString(imageRef, imageBase64, 'data_url');
            uploadedImageUrl = await getDownloadURL(imageRef);
        }

        if (!uploadedImageUrl) {
            addPopupMessage("Product image required.", "error");
            return;
        }

        const newProduct: Omit<Product, 'id'> = {
            ...productData,
            imageUrl: uploadedImageUrl,
        };

        const docRef = await addDoc(collection(db, "products"), newProduct);
        setProducts(prevProducts => [{ ...newProduct, id: docRef.id }, ...prevProducts]);
        addPopupMessage("Product added!", "success");
        handleCloseModal();
    } catch (error) {
        console.error("Error adding product: ", error);
        addPopupMessage("Failed to add product.", "error");
    }
  }, [firebaseUser, addPopupMessage, handleCloseModal]);


  const handleUpdateProfile = useCallback(async (updatedData: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, updatedData);
      
      // Update global context
      refreshProfile();
      addPopupMessage("Profile updated!", "success");
    } catch (error) {
      addPopupMessage("Failed to update profile.", "error");
    }
  }, [firebaseUser, refreshProfile, addPopupMessage]);

  const handleUpdateNotificationPreferences = useCallback(async (updatedPrefs: Partial<NotificationPreferences>) => {
    if (!firebaseUser) return;
    try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await updateDoc(userDocRef, { notificationPreferences: updatedPrefs });
        refreshProfile(); 
    } catch (error) {
        addPopupMessage("Failed to save settings.", "error");
    }
  }, [firebaseUser, refreshProfile, addPopupMessage]);

 const handleChangePasswordAttempt = useCallback(async (oldPasswordPlain: string, newPasswordPlain: string): Promise<boolean> => {
    if (!firebaseUser || !firebaseUser.email) return false;
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, oldPasswordPlain);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPasswordPlain);
      addPopupMessage("Password updated!", "success");
      handleCloseModal();
      return true;
    } catch (error: any) {
      console.error("Change Password Error:", error);
      addPopupMessage("Failed to change password. Check credentials.", "error");
      return false;
    }
  }, [firebaseUser, addPopupMessage, handleCloseModal]);

  const handleForgotPasswordRequest = useCallback(async (emailForReset: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, emailForReset);
      addPopupMessage(`Reset email sent to ${emailForReset}.`, 'success');
      return true;
    } catch (error) {
      addPopupMessage('Failed to send reset email.', 'error');
      return false;
    }
  }, [addPopupMessage]);


  const handleMarkNotificationRead = useCallback(async (notificationId: string) => {
    if (!firebaseUser) return;
    try {
        const notifRef = doc(db, "users", firebaseUser.uid, "notifications", notificationId);
        await updateDoc(notifRef, { read: true });
        setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, read: true} : n));
    } catch (error) {
        console.error("Error marking read:", error);
    }
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
    } catch (error) {
        addPopupMessage("Failed to mark all as read.", "error");
    }
  }, [firebaseUser, notifications, addPopupMessage]);

  const handleToggleLikePost = useCallback(async (postId: string) => {
    if (!firebaseUser) {
        addPopupMessage("Please login to like posts.", "error");
        return;
    }
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const postDocRef = doc(db, "posts", postId);
    const hasLiked = likedPostIds.has(postId);

    try {
        await updateDoc(userDocRef, {
            likedPostIds: hasLiked ? arrayRemove(postId) : arrayUnion(postId)
        });
        await updateDoc(postDocRef, {
            upvotes: increment(hasLiked ? -1 : 1)
        });

        // Optimistic Update for UI speed
        setLikedPostIds(prev => {
            const newSet = new Set(prev);
            if (hasLiked) newSet.delete(postId);
            else newSet.add(postId);
            return newSet;
        });

        // Sync Global State
        refreshProfile();

        setPosts(prevPosts => prevPosts.map(p => 
            p.id === postId ? { ...p, upvotes: p.upvotes + (hasLiked ? -1 : 1) } : p
        ));
    } catch (error) {
        addPopupMessage("Failed to update like status.", "error");
    }
  }, [firebaseUser, likedPostIds, addPopupMessage, refreshProfile]);


  const handleConfirmOrderPayment = useCallback(async (deliveryAddress: Address, method: string) => {
    if (!firebaseUser || !user || cartItems.length === 0) {
        addPopupMessage("Error processing order.", "error");
        return;
    }
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Omit<Order, 'id'> = {
        userId: firebaseUser.uid,
        items: cartItems,
        totalAmount: totalAmount,
        orderDate: new Date(),
        deliveryAddress,
        paymentMethod: method,
        status: 'Processing', 
        transactionId: `TXN_${Date.now()}`, 
        paymentDetails: method === 'UPI' ? { upiTransactionId: `UPI_${Date.now()}`, paymentApp: 'Simulated UPI App' } : undefined,
    };

    try {
        const orderDocRef = await addDoc(collection(db, "orders"), newOrder); 
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await updateDoc(userDocRef, {
            orders: arrayUnion({ ...newOrder, id: orderDocRef.id }) 
        });
        
        // Refresh global user state to get new order list
        refreshProfile();

        const confirmedOrder = { ...newOrder, id: orderDocRef.id };
        setCartItems([]); 
        handleOpenModal(ModalType.ORDER_SUCCESS_MODAL, { order: confirmedOrder });
        setCurrentView(AppView.MAIN); 
        setActiveTab(MainAppTab.STORE); 
    } catch (e) {
        console.error("Error placing order: ", e);
        addPopupMessage("Failed to place order.", "error");
    }
  }, [firebaseUser, user, cartItems, addPopupMessage, handleOpenModal, refreshProfile]);


  const renderModalContent = () => {
    switch (currentModal) {
      case ModalType.CREATE_POST:
        return <CreatePost onSubmit={handleCreatePost} onClose={handleCloseModal} currentUserId={firebaseUser?.uid} />;
      case ModalType.ADD_PRODUCT:
         return <AddProduct onSubmit={handleAddNewProduct} onClose={handleCloseModal} />;
      case ModalType.TESTIMONIALS:
        return <TestimonialComponent testimonials={testimonialsData} />;
      case ModalType.PRIVACY_POLICY:
        return <PrivacyPolicy onClose={handleCloseModal} />;
      case ModalType.HELP_SUPPORT:
        return <HelpSupport onStartSupportChat={() => {
            handleCloseModal();
            const supportChat = chatConversations.find(c => c.participants.some(p => p.id === 'closure_admin'));
            if (supportChat) {
                handleNavigateToChatDetail(supportChat.id);
            } else {
                const newSupportChatId = `support_${Date.now()}`;
                const newConv: ChatConversation = {
                    id: newSupportChatId,
                    participants: [{id: 'closure_admin', name: 'Closure Admin', avatarUrl: 'https://picsum.photos/seed/closure_avatar/40/40'}],
                    messages: [],
                    lastMessageTimestamp: new Date(),
                    lastMessagePreview: "New support chat started."
                };
                setChatConversations(prev => [newConv, ...prev]);
                handleNavigateToChatDetail(newSupportChatId);
            }
        }} />;
      case ModalType.OFFLINE_DOWNLOADS_LIST:
        return <OfflineDownloads items={downloadableContent} user={user} onDownload={(item) => {
            if (!firebaseUser) { addPopupMessage("Login to download.", "error"); return; }
            const userDocRef = doc(db, "users", firebaseUser.uid);
            updateDoc(userDocRef, { downloadedItemIds: arrayUnion(item.id) })
              .then(() => {
                refreshProfile();
                addPopupMessage(`${item.name} downloaded!`, 'success');
              })
              .catch(e => { console.error(e); addPopupMessage("Download failed.", "error"); });
          }} 
          onViewDownloaded={() => {}} 
        />;
      case ModalType.FREE_MATERIAL_LIST:
        return <FreeMaterial materials={freeMaterials} onOpenModal={handleOpenModal} />;
      case ModalType.VIEW_FREE_MATERIAL_CONTENT:
        return <ViewFreeMaterialContent title={activeModalData?.title} content={activeModalData?.content} />;
      case ModalType.ANNOUNCEMENT_DETAIL:
        return <div className="p-1"><h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">{activeModalData?.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{activeModalData?.date}</p><p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{activeModalData?.fullContent || activeModalData?.content}</p></div>;
      case ModalType.EVENT_DETAIL:
        return <div className="p-1"><h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">{activeModalData?.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date: {activeModalData?.date} at {activeModalData?.time}</p><p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Location: {activeModalData?.location}</p><p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{activeModalData?.fullDescription || activeModalData?.description}</p></div>;
      case ModalType.NOTIFICATION_SETTINGS:
        return <NotificationSettings preferences={notificationPreferences} onUpdatePreferences={handleUpdateNotificationPreferences} />;
      case ModalType.CHANGE_PASSWORD:
        return <ChangePassword onChangePassword={handleChangePasswordAttempt} onClose={handleCloseModal} />;
      case ModalType.TERMS_AND_CONDITIONS:
        return <TermsAndConditions onClose={handleCloseModal}/>;
      case ModalType.ACKNOWLEDGEMENTS:
        return <Acknowledgements onClose={handleCloseModal}/>;
      case ModalType.FORGOT_PASSWORD:
        return <ForgotPassword onClose={handleCloseModal} onForgotPasswordRequest={handleForgotPasswordRequest} />;
      case ModalType.ORDER_SUCCESS_MODAL:
        return <OrderSuccess 
                    order={activeModalData?.order} 
                    onViewOrders={() => { setActiveTab(MainAppTab.PROFILE); setCurrentView(AppView.MAIN);}} 
                    onContinueShopping={() => { setActiveTab(MainAppTab.STORE); setCurrentView(AppView.MAIN);}}
                    onClose={handleCloseModal}
                />;
      default:
        return null;
    }
  };

  const modalTitle = () => {
    switch (currentModal) {
      case ModalType.CREATE_POST: return "Create New Post";
      case ModalType.ADD_PRODUCT: return "Add New Product";
      case ModalType.TESTIMONIALS: return "Student Testimonials";
      case ModalType.PRIVACY_POLICY: return "Privacy Policy";
      case ModalType.HELP_SUPPORT: return "Help & Support";
      case ModalType.OFFLINE_DOWNLOADS_LIST: return "Offline Downloads";
      case ModalType.FREE_MATERIAL_LIST: return "Free Material";
      case ModalType.VIEW_FREE_MATERIAL_CONTENT: return activeModalData?.title || "Free Material";
      case ModalType.ANNOUNCEMENT_DETAIL: return "Announcement";
      case ModalType.EVENT_DETAIL: return "Event Details";
      case ModalType.NOTIFICATION_SETTINGS: return "Notification Settings";
      case ModalType.CHANGE_PASSWORD: return "Change Password";
      case ModalType.TERMS_AND_CONDITIONS: return "Terms & Conditions";
      case ModalType.ACKNOWLEDGEMENTS: return "Acknowledgements";
      case ModalType.ORDER_SUCCESS_MODAL: return "Order Status";
      case ModalType.FORGOT_PASSWORD: return "Forgot Password";
      default: return "";
    }
  };
  
  const modalSize = () => {
    switch (currentModal) {
      case ModalType.ORDER_SUCCESS_MODAL: return 'sm';
      default: return 'md';
    }
  };


  const renderContent = () => {
    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900"><svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
    }
    switch (currentView) {
      case AppView.LOGIN:
        return <Login onLoginAttempt={handleLoginAttempt} onNavigateToSignup={navigateToSignup} onOpenModal={handleOpenModal} successMessage={signupSuccessMessage} errorMessage={error} />;
      case AppView.SIGNUP:
        return <Signup onSignupAttempt={handleSignupAttempt} onNavigateToLogin={navigateToLogin} errorMessage={error} />;
      case AppView.SETTINGS:
        return <Settings version={appVersion} onLogout={handleLogout} onOpenModal={handleOpenModal} currentTheme={{ mode: theme }} onSetTheme={setTheme} onBack={handleBackToMain} addPopupMessage={addPopupMessage} />;
      case AppView.CART:
        return <Cart cartItems={cartItems} onRemoveItem={handleRemoveFromCart} onUpdateQuantity={handleUpdateCartQuantity} onNavigate={onNavigate} onBack={handleBackToMain} />;
      case AppView.CHAT_DETAIL:
        const selectedConversation = chatConversations.find(c => c.id === activeModalData?.conversationId);
        return <ChatDetail
                    conversationId={activeModalData?.conversationId} 
                    initialConversation={selectedConversation} 
                    currentUser={user!}
                    onBack={handleBackToMain} 
                    onSendMessage={(chatId, message) => {
                        setChatConversations(prev => prev.map(conv => {
                            if (conv.id === chatId) {
                                return {
                                    ...conv,
                                    messages: [...conv.messages, { 
                                        ...message, 
                                        id: String(Date.now()), 
                                        senderId: firebaseUser?.uid || 'user',
                                        // @ts-ignore
                                        timestamp: new Date().toISOString() 
                                    } as ChatMessage],
                                    lastMessagePreview: message.text || (message.imageUrl ? 'Image' : 'New message'),
                                    lastMessageTimestamp: new Date(),
                                };
                            }
                            return conv;
                        }));
                    }}
                />;
       case AppView.POST_DETAIL:
        const selectedPost = posts.find(p => p.id === activeModalData?.postId);
        return <PostDetail
                    post={selectedPost} 
                    currentUser={user} 
                    onBack={handleBackToMain} 
                    onAddComment={() => {}} 
                    onToggleLikeComment={() => {}} 
                    likedCommentIds={likedCommentIds} 
                />;
      case AppView.PAYMENT_DETAILS:
        return <PaymentDetails currentUser={user} cartItems={cartItems} onNavigate={onNavigate} onBack={() => setCurrentView(AppView.CART)} onUpdateUserProfile={handleUpdateProfile}/>;
      case AppView.UPI_PAYMENT:
        if (!activeModalData || typeof activeModalData.totalAmount !== 'number' || isNaN(activeModalData.totalAmount)) {
          console.error("Invalid data for UPI Payment screen:", activeModalData);
          addPopupMessage("Error: Payment details incomplete.", "error");
          setCurrentView(AppView.CART); 
          return null; 
        }
        return <UPIPayment
                deliveryAddress={activeModalData.deliveryAddress} 
                paymentMethod={activeModalData.paymentMethod} 
                totalAmount={activeModalData.totalAmount}
                onConfirmPayment={handleConfirmOrderPayment}
                onBack={() => setCurrentView(AppView.PAYMENT_DETAILS)}
               />;
      case AppView.MAIN:
      default:
        if (!user) return <Login onLoginAttempt={handleLoginAttempt} onNavigateToSignup={navigateToSignup} onOpenModal={handleOpenModal} errorMessage={error} />;
        return (
          <div className="h-screen w-screen flex flex-col">
            <TopBar 
              title="Closure" 
              userName={user.name} 
              showMenuButton={true}
              onMenuClick={() => setIsSidebarOpen(true)}
              notifications={notifications}
              onNotificationClick={handleMarkNotificationRead}
              onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
              cartItemCount={cartItems.length}
              onCartClick={handleNavigateToCart}
            />
            <Sidebar 
              isOpen={isSidebarOpen} 
              onClose={() => setIsSidebarOpen(false)} 
              user={user} 
              onNavigateToSettings={handleNavigateToSettings}
              onOpenModal={handleOpenModal}
              onSwitchToProfileTab={() => setActiveTab(MainAppTab.PROFILE)}
            />
            <main className="flex-grow overflow-y-auto">
              {activeTab === MainAppTab.HOME && <Home onOpenModal={handleOpenModal} announcements={announcements} events={events} userName={user.name} />}
              {activeTab === MainAppTab.STORE && <Store products={products} onAddToCart={handleAddToCart} onOpenModal={handleOpenModal} />}
              {activeTab === MainAppTab.COMMUNITY && <Community posts={posts} currentUser={user} onNavigateToPostDetail={handleNavigateToPostDetail} likedPostIds={likedPostIds} onToggleLike={handleToggleLikePost} onOpenModal={handleOpenModal} />}
              {activeTab === MainAppTab.CHATS && <Chats conversations={chatConversations} onNavigate={onNavigate} />}
              {activeTab === MainAppTab.PROFILE && <Profile user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile}/>}
            </main>
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
      <Modal 
        isOpen={currentModal !== null} 
        onClose={handleCloseModal} 
        title={modalTitle()}
        size={modalSize()}
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