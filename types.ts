export interface SignupScreenProps {
  onSignupAttempt: (name: string, email: string, passwordPlain: string) => Promise<boolean>; 
  onNavigateToLogin: () => void;
  errorMessage?: string | null;
}

export interface LoginScreenProps {
  onLoginAttempt: (email: string, password: string) => Promise<boolean>; 
  onNavigateToSignup: () => void;
  onOpenModal: (modalType: ModalType) => void;
  successMessage?: string | null;
  errorMessage?: string | null; 
}

export interface ForgotPasswordModalContentProps {
  onClose: () => void;
  onForgotPasswordRequest: (email: string) => Promise<boolean>; 
}

export interface ChangePasswordModalContentProps {
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  onClose: () => void;
}

export enum AppView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  MAIN = 'MAIN',
  SETTINGS = 'SETTINGS',
  CART = 'CART',
  CHAT_DETAIL = 'CHAT_DETAIL',
  POST_DETAIL = 'POST_DETAIL', 
  PAYMENT_DETAILS = 'PAYMENT_DETAILS',
  UPI_PAYMENT = 'UPI_PAYMENT',
}

export enum MainAppTab {
  HOME = 'HOME',
  STORE = 'STORE', 
  COMMUNITY = 'COMMUNITY', 
  PROFILE = 'PROFILE',
}

export enum ModalType {
  CREATE_POST = 'CREATE_POST', 
  TESTIMONIALS = 'TESTIMONIALS',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  HELP_SUPPORT = 'HELP_SUPPORT',
  OFFLINE_DOWNLOADS_LIST = 'OFFLINE_DOWNLOADS_LIST',
  FREE_MATERIAL_LIST = 'FREE_MATERIAL_LIST',
  ANNOUNCEMENT_DETAIL = 'ANNOUNCEMENT_DETAIL',
  EVENT_DETAIL = 'EVENT_DETAIL',
  NOTIFICATION_SETTINGS = 'NOTIFICATION_SETTINGS',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD', 
  TERMS_AND_CONDITIONS = 'TERMS_AND_CONDITIONS',
  ACKNOWLEDGEMENTS = 'ACKNOWLEDGEMENTS',
  ORDER_SUCCESS_MODAL = 'ORDER_SUCCESS_MODAL',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD', 
  VIEW_FREE_MATERIAL_CONTENT = 'VIEW_FREE_MATERIAL_CONTENT',
  ADD_PRODUCT = 'ADD_PRODUCT',
}

export interface Address {
  fullName: string;
  mobileNumber: string;
  pincode: string;
  streetAddress: string; 
  city: string;
  state: string;
  country?: string;
  addressType?: 'Home' | 'Work'; 
}

export interface Order {
  id: string;
  userId: string; 
  items: CartItem[];
  totalAmount: number;
  orderDate: Date;
  deliveryAddress: Address;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  transactionId: string; 
  paymentDetails?: {
    upiTransactionId?: string;
    paymentApp?: string;
  };
}

export interface OrderSuccessModalContentProps {
  order?: Order;
  onViewOrders: () => void; 
  onContinueShopping: () => void; 
  onClose: () => void;
}

export interface UserProfile {
  id: string,
  name: string;
  email: string;
  mobileNumber: string;
  organizationCode: string;
  about?: string;
  rollNumber?: string;
  avatarUrl?: string;
  
  dateOfJoining?: string; 
  dateOfBirth?: string;
  gender?: string; 

  address?: Address;

  orders?: Order[]; 
  notificationPreferences?: NotificationPreferences;

  downloadedItemIds?: string[];
  likedPostIds?: string[]; 
  likedCommentIds?: string[]; 
}



export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string; 
}

export interface Announcement {
  id: string;
  title: string;
  content: string; 
  fullContent?: string; 
  date: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string; 
  fullDescription?: string; 
}

export interface DownloadableItem {
  id: string;
  name: string;
  type: string; 
  size: string; 
  url: string; 
}

export interface FreeMaterialItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video_link' | 'document';
  url?: string; 
  content?: string; 
}

export interface Testimonial {
    id:string;
    studentName: string;
    course: string;
    testimonialText: string;
    avatarUrl?: string;
}

export interface TestimonialScreenProps {
  testimonials: Testimonial[];
}

export interface ChatsScreenProps {
  conversations: ChatConversation[];
  onNavigate: (view: AppView, data?: any) => void; 
}

export interface ChatMessage {
    id: string;
    senderId: string; 
    text?: string;
    imageUrl?: string;
    timestamp: string;
}

export interface ChatConversation {
    id: string; 
    participants: Array<{id: string, name: string, avatarUrl?: string}>; 
    messages: ChatMessage[];
    unreadCount?: number;
    lastMessagePreview?: string;
    lastMessageTimestamp?: Date;
}

export interface ChatDetailScreenProps {
  conversationId: string;
  onBack: () => void;
  initialConversation?: ChatConversation; 
  onSendMessage: (chatId: string, message: Partial<ChatMessage>) => void;
}

export interface PopupMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface NotificationPreferences {
  newAnnouncements: boolean;
  chatMentions: boolean;
  eventReminders: boolean;
  promotionalUpdates: boolean;
}

export interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

export interface NotificationSettingsModalContentProps {
  preferences: NotificationPreferences;
  onUpdatePreferences: (updatedPrefs: Partial<NotificationPreferences>) => void;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  title: string;
  content: string;
  imageUrl?: string; 
  timestamp: Date;
  upvotes: number;
  commentsCount: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  text: string;
  timestamp: Date;
  parentId?: string; 
  replies: Comment[]; 
  upvotes: number; 
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: 'stationary' | 'book';
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartScreenProps {
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onNavigate: (view: AppView, data?: any) => void; 
  onBack: () => void;
}

export interface CommunityScreenProps {
  posts: Post[];
  currentUser: UserProfile | null;
  onNavigateToPostDetail: (postId: string) => void;
  likedPostIds: Set<string>;
  onToggleLike: (postId: string) => void;
}

export interface CreatePostModalContentProps {
  onSubmit: (title: string, content: string, imageUrl?: string) => Promise<void>;
  onClose: () => void;
  currentUserId?: string | null;
}

export interface FreeMaterialScreenProps {
  materials: FreeMaterialItem[];
  onOpenModal: (modalType: ModalType, data?: any) => void;
}

export interface FAQItemProps {
  question: string;
  answer: string;
}

export interface HelpSupportScreenProps {
  onStartSupportChat: () => void;
}

export interface HomeScreenProps {
  onOpenModal: (modalType: ModalType, data?: any) => void;
  announcements: Announcement[];
  events: Event[];
}

export interface OfflineDownloadsScreenProps {
  items: DownloadableItem[];
  user: UserProfile | null;
  onDownload: (item: DownloadableItem) => void; 
  onViewDownloaded: () => void;
}

export interface PaymentDetailsScreenProps {
  currentUser: UserProfile | null;
  cartItems: CartItem[];
  onNavigate: (view: AppView, data?: any) => void;
  onBack: () => void;
  onUpdateUserProfile: (updatedAddress: Partial<Address>) => void; 
}

export interface PostDetailScreenProps {
  post?: Post;
  currentUser: UserProfile | null;
  onBack: () => void;
  onAddComment: (postId: string, text: string, parentId?: string) => void;
  onToggleLikeComment: (commentId: string) => void;
  likedCommentIds: Set<string>;
}

export interface ProfileScreenProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateProfile: (updatedData: Partial<UserProfile>) => void;
}

export interface AccordionSectionProps {
  title: string;
  badgeNumber?: number; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  isEditing?: boolean;
  onEditToggle?: () => void; 
}

export interface Theme {
  mode: 'light' | 'dark',
  primaryColor?: string,
}

export interface SettingsScreenProps {
  version: string;
  onLogout: () => void;
  onOpenModal: (modalType: ModalType, data?: any) => void;
  currentTheme: Theme;
  onSetTheme: (theme: Theme) => void;
  onBack: () => void;
  addPopupMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

export interface StoreScreenProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export interface UPIPaymentScreenProps {
  deliveryAddress: Address;
  paymentMethod: string; 
  totalAmount: number;
  onConfirmPayment: (deliveryAddress: Address, paymentMethod: string) => void; 
  onBack: () => void; 
}

export interface ViewFreeMaterialContentModalProps {
  title: string;
  content: string;
}

export interface WriteExperienceScreenProps {
  onSubmit: (experienceText: string, rating: number) => void;
  onClose: () => void;
}

export interface BottomNavProps {
  activeTab: MainAppTab;
  onTabChange: (tab: MainAppTab) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface PopupProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigateToSettings: () => void;
  onOpenModal: (modalType: ModalType, data?: any) => void;
  onSwitchToProfileTab?: () => void;
}

export interface TopBarProps {
  title: string;
  userName?: string | null;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  notifications?: Notification[];
  onNotificationClick?: (notificationId: string) => void;
  onMarkAllNotificationsRead?: () => void;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export interface InputFieldProps {
  label: string;
  name: keyof Address;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}