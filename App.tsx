
import React, { useState, useCallback, useEffect } from 'react';
// Removed unused HashRouter, Routes, Route
import { 
    AppView, MainAppTab, UserProfile, ModalType,
    Product, CartItem, Notification, Announcement, Event,
    DownloadableItem, FreeMaterialItem, Testimonial,
    ChatConversation, ChatMessage, PopupMessage, NotificationPreferences,
    Post, Comment, Address, Order 
} from './types';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import StoreScreen from './screens/StoreScreen'; 
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import CartScreen from './screens/CartScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import PostDetailScreen from './screens/PostDetailScreen'; 
import PaymentDetailsScreen from './screens/PaymentDetailsScreen'; 
import UPIPaymentScreen from './screens/UPIPaymentScreen'; 


import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import Popup from './components/Popup';

import CreatePostModalContent from './components/modals/CreatePostModalContent';
// import AddProductModalContent from './components/modals/AddProductModalContent'; // New
import TestimonialScreen from './screens/TestimonialScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import OfflineDownloadsScreen from './screens/OfflineDownloadsScreen';
import FreeMaterialScreen from './screens/FreeMaterialScreen';
import NotificationSettingsModalContent from './components/modals/NotificationSettingsModalContent';
import ChangePasswordModalContent from './components/modals/ChangePasswordModalContent';
import TermsAndConditionsModalContent from './components/modals/TermsAndConditionsModalContent';
import AcknowledgementsModalContent from './components/modals/AcknowledgementsModalContent';
import OrderSuccessModalContent from './components/modals/OrderSuccessModalContent'; 
import ForgotPasswordModalContent from './components/modals/ForgotPasswordModalContent';
import ViewFreeMaterialContentModal from './components/modals/ViewFreeMaterialContentModal';

// Firebase imports
import { auth, db, storage } from './firebase'; // Added storage
import { User as FirebaseUser, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"; 
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, writeBatch, serverTimestamp, increment, arrayUnion, arrayRemove, Timestamp, orderBy, deleteDoc } from "firebase/firestore"; 


export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN); 
  const [activeTab, setActiveTab] = useState<MainAppTab>(MainAppTab.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); 
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
  
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

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    newAnnouncements: true,
    chatMentions: true,
    eventReminders: true,
    promotionalUpdates: false,
  });

  const addPopupMessage = useCallback((message: string, type: PopupMessage['type']) => {
    const id = String(Date.now());
    setPopupMessages(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        setPopupMessages(prev => prev.filter(p => p.id !== id));
    }, 3000);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const productsCol = collection(db, 'products');
            const productSnapshot = await getDocs(productsCol);
            const productList = productSnapshot.docs.map(doc => {
                const data = doc.data();
                let price = parseFloat(data.price);
                if (isNaN(price)) {
                    console.warn(`Product with ID ${doc.id} has invalid price: ${data.price}. Defaulting to 0.`);
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
    fetchProducts();

     const fetchPosts = async () => {
        try {
            const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(postsQuery);
            const fetchedPosts: Post[] = [];
            querySnapshot.forEach((docSnap) => { 
                const data = docSnap.data();
                fetchedPosts.push({ 
                    id: docSnap.id, 
                    ...data, 
                    timestamp: (data.timestamp as Timestamp)?.toDate ? (data.timestamp as Timestamp).toDate() : new Date(data.timestamp) , 
                    comments: data.comments || [] 
                } as Post);
            });
            setPosts(fetchedPosts);
        } catch (e) {
            console.error("Error fetching posts: ", e);
            addPopupMessage("Could not load posts.", "error");
        }
    };
    fetchPosts();
    
    setAnnouncements([
      { id: 'anno1', title: 'Mid-term Exams Schedule Released', content: 'The schedule for the upcoming mid-term examinations has been released. Please check the student portal for details.', fullContent: 'The detailed schedule for the upcoming mid-term examinations, covering all departments and subjects, has been officially released. Students are advised to log in to the student portal to view their specific exam dates, times, and assigned locations. Any clashes or concerns should be reported to the academic office by [Date].', date: 'Oct 26, 2023' },
    ]);
    setEvents([
      { id: 'event1', title: 'Annual Sports Day', date: 'Nov 10, 2023', time: '09:00 AM', location: 'University Ground', description: 'Get ready for a day full of exciting sports and team spirit!', fullDescription: 'The Annual Sports Day is a highlight of our academic calendar, featuring a wide range of track and field events, team sports, and fun activities. All students and faculty are encouraged to participate or cheer for their respective houses. Refreshments will be available.'},
    ]);
    setDownloadableContent([ { id: 'dl1', name: 'Introduction to Programming (PDF)', type: 'PDF', size: '2.5 MB', url: '#' }, ]);
    setFreeMaterials([ 
        { 
          id: 'fm1', 
          title: 'Understanding React Hooks', 
          description: 'A comprehensive guide to React Hooks.', 
          type: 'article', 
          content: 'React Hooks are functions that let you “hook into” React state and lifecycle features from function components. They were introduced in React 16.8.\n\nKey Hooks:\n- useState: For adding state to functional components.\n- useEffect: For handling side effects (like data fetching or subscriptions).\n- useContext: To consume context directly in functional components.\n\nRules of Hooks:\n1. Only Call Hooks at the Top Level: Don’t call Hooks inside loops, conditions, or nested functions.\n2. Only Call Hooks from React Functions: Call them from React function components or custom Hooks.' 
        },
    ]);
    setTestimonialsData([ {id: 't1', studentName: 'Alice Wonderland', course: 'Computer Science', testimonialText: 'This platform has been incredibly helpful for my studies. The community is great!', avatarUrl: 'https://picsum.photos/seed/alice/100/100'}, ]);
    setChatConversations([
        { id: 'chat1', participants: [{id: 'closure_admin', name: 'Closure Admin', avatarUrl: 'https://picsum.photos/seed/closure_avatar/40/40'}], messages: [{id: 'msg1', sender: 'closure_admin', text: 'Welcome to Closure! How can we help you today?', timestamp: new Date(Date.now() - 200000)}], unreadCount: 1, lastMessagePreview: 'Welcome to Closure! How can we help you today?', lastMessageTimestamp: new Date(Date.now() - 200000) },
    ]);
  }, [addPopupMessage]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      setActiveTab(MainAppTab.HOME);
      setIsSidebarOpen(false);
      setCartItems([]); 
      setLikedPostIds(new Set()); 
      setLikedCommentIds(new Set());
      setCurrentView(AppView.LOGIN);
      addPopupMessage("Logged out successfully.", "info");
    } catch (error) {
      console.error("Logout Error:", error);
      addPopupMessage("Failed to logout.", "error");
    }
  }, [addPopupMessage]); // Removed setters as they don't change identity


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as UserProfile;
              setCurrentUser({
                ...userData,
                orders: userData.orders || [], 
              });
              setNotificationPreferences(userData.notificationPreferences || { 
                newAnnouncements: true, chatMentions: true, eventReminders: true, promotionalUpdates: false
              });
              const notificationsQuery = query(collection(db, "users", user.uid, "notifications"), orderBy("timestamp", "desc")); 
              const notificationsSnapshot = await getDocs(notificationsQuery);
              setNotifications(notificationsSnapshot.docs.map(d => ({id: d.id, ...d.data(), timestamp: (d.data().timestamp as Timestamp).toDate() } as Notification)));

              setLikedPostIds(new Set(userData.likedPostIds || [])); 
              setLikedCommentIds(new Set(userData.likedCommentIds || []));

            } else {
              console.error("User profile not found in Firestore for UID:", user.uid);
              handleLogout();
            }
        } catch (e) {
            console.error("Error fetching user profile:", e);
            addPopupMessage("Error loading user profile.", "error");
            setCurrentUser(null); 
        }
        setCurrentView(AppView.MAIN);
      } else {
        setCurrentUser(null);
        setCurrentView(AppView.LOGIN);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [addPopupMessage, handleLogout]); 


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
      
      setSignupSuccessMessage("Signup successful! Please login.");
      setCurrentView(AppView.LOGIN); 
      return true;
    } catch (error: any) {
      console.error("Firebase Signup Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (error.code === 'auth/weak-password') {
        setError('The password is too weak. Please use at least 6 characters.');
      } else {
        setError(error.message || 'Failed to sign up. Please try again.');
      }
      return false;
    }
  }, []); // Removed setters

  const handleLoginAttempt = useCallback(async (emailToLogin: string, passwordToLogin: string): Promise<boolean> => {
    setError(null); setSignupSuccessMessage(null);
    try {
      await signInWithEmailAndPassword(auth, emailToLogin, passwordToLogin);
      return true;
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(error.message || 'Failed to login. Please try again.');
      }
      return false;
    }
  }, []); // Removed setters


  const handleOpenModal = useCallback((modalType: ModalType, data?: any) => {
    setCurrentModal(modalType);
    setActiveModalData(data);
  }, []);

  const handleCloseModal = useCallback(() => {
    setCurrentModal(null);
    setActiveModalData(null);
  }, []);

  const handleNavigateToSettings = useCallback(() => {
    setCurrentView(AppView.SETTINGS);
  }, []);

  const handleNavigateToCart = useCallback(() => {
    setCurrentView(AppView.CART);
  }, []);

  const handleNavigateToChatDetail = useCallback((conversationId: string) => {
    setCurrentView(AppView.CHAT_DETAIL);
    setActiveModalData({ conversationId }); 
  }, []);

   const handleNavigateToPostDetail = useCallback((postId: string) => {
    setCurrentView(AppView.POST_DETAIL);
    setActiveModalData({ postId }); 
  }, []);

  const handleBackToMain = useCallback(() => {
    setCurrentView(AppView.MAIN);
  }, []);

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
    if (!firebaseUser || !currentUser) {
      addPopupMessage("You must be logged in to create a post.", "error");
      return;
    }
    try {
      const newPostData: Omit<Post, 'id' | 'timestamp' | 'comments'> = {
        authorId: firebaseUser.uid,
        authorName: currentUser.name,
        authorAvatarUrl: currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`,
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
        timestamp: new Date(), 
        comments: [],
      } as Post;

      setPosts(prevPosts => [newPostForState, ...prevPosts]);
      addPopupMessage("Post created successfully!", "success");
      handleCloseModal();
    } catch (e) {
      console.error("Error creating post: ", e);
      addPopupMessage("Failed to create post.", "error");
    }
  }, [firebaseUser, currentUser, addPopupMessage, handleCloseModal]);

  const handleAddNewProduct = useCallback(async (productData: Omit<Product, 'id' | 'imageUrl'>, imageBase64?: string) => {
    if (!firebaseUser) { 
        addPopupMessage("You are not authorized to add products.", "error");
        return;
    }
    let uploadedImageUrl: string | undefined = undefined;
    try {
        if (imageBase64) {
            const imageName = `${Date.now()}_product_image`;
            const imageStorageRef = storage.ref(`product_images/${imageName}`);
            await imageStorageRef.putString(imageBase64, 'data_url');
            uploadedImageUrl = await imageStorageRef.getDownloadURL();
        }

        if (!uploadedImageUrl) {
            addPopupMessage("Product image is required and failed to upload.", "error");
            return;
        }

        const newProduct: Omit<Product, 'id'> = {
            ...productData,
            imageUrl: uploadedImageUrl,
        };

        const docRef = await addDoc(collection(db, "products"), newProduct);
        setProducts(prevProducts => [{ ...newProduct, id: docRef.id }, ...prevProducts]);
        addPopupMessage("Product added successfully!", "success");
        handleCloseModal();
    } catch (error) {
        console.error("Error adding product: ", error);
        addPopupMessage("Failed to add product.", "error");
    }
  }, [firebaseUser, addPopupMessage, handleCloseModal]);


  const handleUpdateProfile = useCallback(async (updatedData: Partial<UserProfile>) => {
    if (!firebaseUser) {
      addPopupMessage("Not logged in.", "error");
      return;
    }
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, updatedData);
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
      addPopupMessage("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile: ", error);
      addPopupMessage("Failed to update profile.", "error");
    }
  }, [firebaseUser, addPopupMessage]);

  const handleUpdateNotificationPreferences = useCallback(async (updatedPrefs: Partial<NotificationPreferences>) => {
    if (!firebaseUser) return;
    try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await updateDoc(userDocRef, { notificationPreferences: updatedPrefs });
        setNotificationPreferences(prev => ({ ...prev, ...updatedPrefs }));
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        addPopupMessage("Failed to save notification settings.", "error");
    }
  }, [firebaseUser, addPopupMessage]);

 const handleChangePasswordAttempt = useCallback(async (oldPasswordPlain: string, newPasswordPlain: string): Promise<boolean> => {
    if (!firebaseUser || !firebaseUser.email) {
      addPopupMessage("User not found or email missing.", "error");
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, oldPasswordPlain);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPasswordPlain);
      addPopupMessage("Password updated successfully!", "success");
      handleCloseModal();
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        addPopupMessage("Incorrect current password.", "error");
      } else if (error.code === 'auth/too-many-requests') {
        addPopupMessage("Too many attempts. Please try again later.", "error");
      } else {
        addPopupMessage("Failed to change password. Please try again.", "error");
      }
      return false;
    }
  }, [firebaseUser, addPopupMessage, handleCloseModal]);

  const handleForgotPasswordRequest = useCallback(async (emailForReset: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, emailForReset);
      addPopupMessage(`Password reset email sent to ${emailForReset}.`, 'success');
      return true;
    } catch (error: any) {
      console.error("Forgot password error:", error);
      if (error.code === 'auth/user-not-found') {
        addPopupMessage('No user found with this email address.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        addPopupMessage('Please enter a valid email address.', 'error');
      } else {
        addPopupMessage('Failed to send password reset email.', 'error');
      }
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
        console.error("Error marking notification read:", error);
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
        console.error("Error marking all notifications read:", error);
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

        setLikedPostIds(prev => {
            const newSet = new Set(prev);
            if (hasLiked) newSet.delete(postId);
            else newSet.add(postId);
            return newSet;
        });
        setPosts(prevPosts => prevPosts.map(p => 
            p.id === postId ? { ...p, upvotes: p.upvotes + (hasLiked ? -1 : 1) } : p
        ));
    } catch (error) {
        console.error("Error toggling like:", error);
        addPopupMessage("Failed to update like status.", "error");
    }
  }, [firebaseUser, likedPostIds, addPopupMessage]);


  const handleConfirmOrderPayment = useCallback(async (deliveryAddress: Address, method: string) => {
    if (!firebaseUser || !currentUser || cartItems.length === 0) {
        addPopupMessage("Error processing order. User or cart invalid.", "error");
        setCurrentView(AppView.MAIN); 
        setActiveTab(MainAppTab.STORE);
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
        
        const confirmedOrder = { ...newOrder, id: orderDocRef.id };
        setCurrentUser(prev => prev ? {...prev, orders: [...(prev.orders || []), confirmedOrder]} : null);

        setCartItems([]); 
        handleOpenModal(ModalType.ORDER_SUCCESS_MODAL, { order: confirmedOrder });
        setCurrentView(AppView.MAIN); 
        setActiveTab(MainAppTab.STORE); 
    } catch (e) {
        console.error("Error placing order: ", e);
        addPopupMessage("Failed to place order. Please try again.", "error");
        setCurrentView(AppView.MAIN);
        setActiveTab(MainAppTab.STORE);
    }
  }, [firebaseUser, currentUser, cartItems, addPopupMessage, handleOpenModal]); // Removed setters

  const onNavigate = (view: AppView, data?: any) => {
    setCurrentView(view);
    if (data !== undefined) { 
      setActiveModalData(data);
    } else {
      setActiveModalData(null); 
    }
  };


  const renderModalContent = () => {
    switch (currentModal) {
      case ModalType.CREATE_POST:
        return <CreatePostModalContent onSubmit={handleCreatePost} onClose={handleCloseModal} currentUserId={firebaseUser?.uid} />;
      case ModalType.ADD_PRODUCT:
        return <AddProductModalContent onSubmit={handleAddNewProduct} onClose={handleCloseModal} />;
      case ModalType.TESTIMONIALS:
        return <TestimonialScreen testimonials={testimonialsData} />;
      case ModalType.PRIVACY_POLICY:
        return <PrivacyPolicyScreen />;
      case ModalType.HELP_SUPPORT:
        return <HelpSupportScreen onStartSupportChat={() => {
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
        return <OfflineDownloadsScreen items={downloadableContent} user={currentUser} onDownload={(item) => {
            if (!firebaseUser) { addPopupMessage("Login to download.", "error"); return; }
            const userDocRef = doc(db, "users", firebaseUser.uid);
            updateDoc(userDocRef, { downloadedItemIds: arrayUnion(item.id) })
              .then(() => {
                setCurrentUser(prev => prev ? {...prev, downloadedItemIds: [...(prev.downloadedItemIds || []), item.id]} : null);
                addPopupMessage(`${item.name} downloaded! (Simulated)`, 'success');
              })
              .catch(e => { console.error(e); addPopupMessage("Download failed.", "error"); });
          }} 
          onViewDownloaded={() => {}} 
        />;
      case ModalType.FREE_MATERIAL_LIST:
        return <FreeMaterialScreen materials={freeMaterials} onOpenModal={handleOpenModal} />;
      case ModalType.VIEW_FREE_MATERIAL_CONTENT:
        return <ViewFreeMaterialContentModal title={activeModalData?.title} content={activeModalData?.content} />;
      case ModalType.ANNOUNCEMENT_DETAIL:
        return <div className="p-1"><h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">{activeModalData?.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{activeModalData?.date}</p><p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{activeModalData?.fullContent || activeModalData?.content}</p></div>;
      case ModalType.EVENT_DETAIL:
        return <div className="p-1"><h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">{activeModalData?.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date: {activeModalData?.date} at {activeModalData?.time}</p><p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Location: {activeModalData?.location}</p><p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{activeModalData?.fullDescription || activeModalData?.description}</p></div>;
      case ModalType.NOTIFICATION_SETTINGS:
        return <NotificationSettingsModalContent preferences={notificationPreferences} onUpdatePreferences={handleUpdateNotificationPreferences} />;
      case ModalType.CHANGE_PASSWORD:
        return <ChangePasswordModalContent onChangePassword={handleChangePasswordAttempt} onClose={handleCloseModal} />;
      case ModalType.TERMS_AND_CONDITIONS:
        return <TermsAndConditionsModalContent />;
      case ModalType.ACKNOWLEDGEMENTS:
        return <AcknowledgementsModalContent />;
      case ModalType.FORGOT_PASSWORD:
        return <ForgotPasswordModalContent onClose={handleCloseModal} onForgotPasswordRequest={handleForgotPasswordRequest} />;
      case ModalType.ORDER_SUCCESS_MODAL:
        return <OrderSuccessModalContent 
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
    if (isLoadingAuth) {
        return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900"><svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
    }
    switch (currentView) {
      case AppView.LOGIN:
        return <LoginScreen onLoginAttempt={handleLoginAttempt} onNavigateToSignup={navigateToSignup} onOpenModal={handleOpenModal} successMessage={signupSuccessMessage} errorMessage={error} />;
      case AppView.SIGNUP:
        return <SignupScreen onSignupAttempt={handleSignupAttempt} onNavigateToLogin={navigateToLogin} errorMessage={error} />;
      case AppView.SETTINGS:
        return <SettingsScreen version={appVersion} onLogout={handleLogout} onOpenModal={handleOpenModal} currentTheme={theme} onSetTheme={setTheme} onBack={handleBackToMain} addPopupMessage={addPopupMessage} />;
      case AppView.CART:
        return <CartScreen cartItems={cartItems} onRemoveItem={handleRemoveFromCart} onUpdateQuantity={handleUpdateCartQuantity} onNavigate={onNavigate} onBack={handleBackToMain} />;
      case AppView.CHAT_DETAIL:
        const selectedConversation = chatConversations.find(c => c.id === activeModalData?.conversationId);
        return <ChatDetailScreen 
                    conversationId={activeModalData?.conversationId} 
                    initialConversation={selectedConversation} 
                    onBack={handleBackToMain} 
                    onSendMessage={(chatId, message) => {
                        setChatConversations(prev => prev.map(conv => {
                            if (conv.id === chatId) {
                                return {
                                    ...conv,
                                    messages: [...conv.messages, { ...message, id: String(Date.now()), timestamp: new Date() } as ChatMessage],
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
        return <PostDetailScreen 
                    post={selectedPost} 
                    currentUser={currentUser} 
                    onBack={handleBackToMain} 
                    onAddComment={() => {}} 
                    onToggleLikeComment={() => {}} 
                    likedCommentIds={likedCommentIds} 
                />;
      case AppView.PAYMENT_DETAILS:
        return <PaymentDetailsScreen currentUser={currentUser} cartItems={cartItems} onNavigate={onNavigate} onBack={() => setCurrentView(AppView.CART)} onUpdateUserProfile={handleUpdateProfile}/>;
      case AppView.UPI_PAYMENT:
        if (!activeModalData || typeof activeModalData.totalAmount !== 'number' || isNaN(activeModalData.totalAmount)) {
          console.error("Invalid data for UPI Payment screen:", activeModalData);
          addPopupMessage("Error: Payment details are incomplete. Please try again.", "error");
          setCurrentView(AppView.CART); // Navigate back to cart or payment details
          return null; 
        }
        return <UPIPaymentScreen 
                deliveryAddress={activeModalData.deliveryAddress} 
                paymentMethod={activeModalData.paymentMethod} 
                totalAmount={activeModalData.totalAmount}
                onConfirmPayment={handleConfirmOrderPayment}
                onBack={() => setCurrentView(AppView.PAYMENT_DETAILS)}
               />;
      case AppView.MAIN:
      default:
        if (!currentUser) return <LoginScreen onLoginAttempt={handleLoginAttempt} onNavigateToSignup={navigateToSignup} onOpenModal={handleOpenModal} errorMessage={error} />;
        return (
          <div className="h-screen w-screen flex flex-col">
            <TopBar 
              title="Closure" 
              userName={currentUser.name} 
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
              user={currentUser} 
              onNavigateToSettings={handleNavigateToSettings}
              onOpenModal={handleOpenModal}
              onSwitchToProfileTab={() => setActiveTab(MainAppTab.PROFILE)}
            />
            <main className="flex-grow overflow-y-auto">
              {activeTab === MainAppTab.HOME && <HomeScreen onOpenModal={handleOpenModal} announcements={announcements} events={events} />}
              {activeTab === MainAppTab.STORE && <StoreScreen products={products} onAddToCart={handleAddToCart} onOpenModal={handleOpenModal} />}
              {activeTab === MainAppTab.COMMUNITY && <CommunityScreen posts={posts} currentUser={currentUser} onNavigateToPostDetail={handleNavigateToPostDetail} likedPostIds={likedPostIds} onToggleLike={handleToggleLikePost} />}
              {activeTab === MainAppTab.PROFILE && <ProfileScreen user={currentUser} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile}/>}
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
