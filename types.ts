
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
  // ORDER_SUCCESS will be a modal
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
  FORGOT_PASSWORD = 'FORGOT_PASSWORD', // New
  VIEW_FREE_MATERIAL_CONTENT = 'VIEW_FREE_MATERIAL_CONTENT', // New
}

export interface Address {
  fullName: string;
  mobileNumber: string;
  pincode: string;
  streetAddress: string; // e.g., House No, Building, Street, Area
  city: string;
  state: string;
  country?: string; // Optional, default could be set
  addressType?: 'Home' | 'Work'; // Optional
}

export interface Order {
  id: string;
  userId: string; // Added to link order to a user
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
    // other relevant details can be added here
  };
}


export interface UserProfile {
  name: string;
  email: string;
  mobileNumber: string;
  organizationCode: string;
  about?: string;
  rollNumber?: string;
  dateOfJoining?: string;
  downloadedItemIds?: string[]; 

  dateOfBirth?: string;
  gender?: string; 

  streetAddress?: string; // Default street address
  city?: string;          // Default city
  postalCode?: string;    // Default postal code
  country?: string;       // Default country
  state?: string;         // Default state for address
  avatarUrl?: string; 
  orders?: Order[]; // Added orders
  notificationPreferences?: NotificationPreferences; // Added
  likedPostIds?: string[]; // Added
  likedCommentIds?: string[]; // Added
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

export interface ChatMessage {
    id: string;
    sender: 'user' | 'other' | string; 
    text?: string;
    imageUrl?: string;
    timestamp: Date;
}

export interface ChatConversation {
    id: string; 
    participants: Array<{id: string, name: string, avatarUrl?: string}>; 
    messages: ChatMessage[];
    unreadCount?: number;
    lastMessagePreview?: string;
    lastMessageTimestamp?: Date;
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

// Updated Post interface
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
  comments: Comment[]; // Store comments directly
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
  upvotes: number; // Renamed from upvotes
}