import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Post, ModalType } from '../../types';
import UserCircle from '../icons/UserCircle';
import Search from '../icons/Search';
import Plus from '../icons/Plus';
import { db } from '../../firebase';
import { 
  collection, query, where, orderBy, 
  getDocs, limit, startAfter, 
  QueryDocumentSnapshot, DocumentData 
} from 'firebase/firestore';
import ThumbsUp from '../icons/ThumbsUp';
import ChatBubble from '../icons/ChatBubble';
import { useUser } from '../../contexts/UserContext';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import LazyImage from '../ui/LazyImage';

let savedScrollState: StateSnapshot | undefined;

interface ExtendedCommunityProps {
  onNavigateToPostDetail: (post: Post) => void; 
  onToggleLike: (postId: string) => void;
  onOpenModal: (modalType: ModalType) => void;
  currentUser?: any;
}

const Community: React.FC<ExtendedCommunityProps> = ({ 
  onNavigateToPostDetail, 
  onToggleLike,
  onOpenModal 
}) => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const userDomain = useMemo(() => {
    return user?.email ? user.email.split('@')[1].toLowerCase() : null;
  }, [user]);

  const likedPostIds = useMemo(() => {
    return new Set(user?.likedPostIds || []);
  }, [user]);

  const handleLike = async (postId: string) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    onToggleLike(postId);
  };

  const handlePostClick = async (post: Post) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    onNavigateToPostDetail(post);
  };

  const handleCreatePost = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    onOpenModal(ModalType.CREATE_POST);
  };

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchInitialPosts = async () => {
      if (!userDomain) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setPosts([]); 
      setLastVisible(null);
      setHasMore(true);

      try {
        const q = query(
            collection(db, "posts"),
            where("collegeDomain", "==", userDomain),
            orderBy("timestamp", "desc"),
            limit(20)
        );

        const snapshot = await getDocs(q);
        
        const fetchedPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date() 
        })) as Post[];
        
        setPosts(fetchedPosts);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 20);
      } catch (err) {
        console.error("Error fetching community posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, [userDomain]);

  // --- Pagination ---
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || isFetchingMore || !userDomain || !lastVisible) return;

    setIsFetchingMore(true);
    try {
      const q = query(
        collection(db, "posts"),
        where("collegeDomain", "==", userDomain),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(20)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const newPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date() 
        })) as Post[];

        setPosts(prev => [...prev, ...newPosts]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching more posts:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, userDomain, lastVisible]);

  // Save scroll state
  useEffect(() => {
    return () => {
      if (virtuosoRef.current) {
        virtuosoRef.current.getState((state) => {
          savedScrollState = state;
        });
      }
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return posts.filter(post => 
      post.authorName?.toLowerCase().includes(lowerSearchTerm) ||
      post.title?.toLowerCase().includes(lowerSearchTerm) ||
      post.content?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [posts, searchTerm]);

  const renderPost = (index: number, post: Post) => {
    const hasLiked = likedPostIds.has(post.id);
    const displayImage = post.thumbnailUrl || post.imageUrl;
    
    return (
      <div className="pb-4 px-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center mb-3">
              {post.authorAvatarUrl ? (
                <LazyImage 
                  src={post.authorAvatarUrl} 
                  alt={post.authorName || "User"} 
                  containerClassName="w-10 h-10 rounded-full mr-3 shrink-0"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mr-3 shrink-0"/>
              )}
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{post.authorName || "Anonymous"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}
                </p>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2 leading-tight">{post.title}</h2>
            
            {displayImage && (
              <LazyImage 
                src={displayImage} 
                alt={post.title} 
                containerClassName="rounded-lg w-full my-3 bg-gray-50 dark:bg-gray-900 min-h-[200px] border border-gray-100 dark:border-gray-700" 
                className="w-full h-auto max-h-96 object-contain"
              />
            )}
            
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 mb-4 whitespace-pre-wrap">{post.content}</p>
            
            <div className="flex items-center space-x-6 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button 
                    onClick={() => handleLike(post.id)} 
                    className={`flex items-center text-sm transition-colors ${hasLiked ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                    <ThumbsUp className={`mr-1.5 w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} /> {post.upvotes || 0}
                </button>
                <button 
                    onClick={() => handlePostClick(post)} 
                    className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <ChatBubble className="mr-1.5 w-5 h-5" /> {post.commentsCount || 0} Comments
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (isFetchingMore) {
       return (
         <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
         </div>
       );
    }
    return null;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 h-full flex flex-col relative transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-5 pt-4 flex-shrink-0">
        <div className="mb-3 sm:mb-0 w-full sm:w-auto">
             <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Community Feed</h1>
             <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {userDomain ? `@${userDomain}` : 'Global View'}
             </p>
        </div>
        
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400 dark:text-gray-500 w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* List */}
      <div className="flex-grow px-4 overflow-hidden">
        {loading ? (
            <div className="flex justify-center pt-10">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
        ) : filteredPosts.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {searchTerm ? "No posts match your search." : "No posts yet."}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try a different search term." : "Be the first to share something with your college!"}
                </p>
            </div>
        ) : (
            <Virtuoso
                ref={virtuosoRef}
                style={{ height: '100%' }} 
                data={filteredPosts}
                itemContent={renderPost}
                restoreStateFrom={savedScrollState}
                endReached={loadMorePosts} 
                components={{ Footer: renderFooter }}
                className="space-y-4 pb-20"
            />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-20 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 z-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Community;