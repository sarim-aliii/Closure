import React, { useState, useMemo, useEffect } from 'react';
import { CommunityProps, Post, ModalType } from '../../types';
import UserCircle from '../icons/UserCircle';
import Search from '../icons/Search';
import Plus from '../icons/Plus';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import ThumbsUp from '../icons/ThumbsUp';
import ChatBubble from '../icons/ChatBubble';
import { useUser } from '../../contexts/UserContext';
import { Virtuoso } from 'react-virtuoso';


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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userDomain = useMemo(() => {
    return user?.email ? user.email.split('@')[1].toLowerCase() : null;
  }, [user]);

  const likedPostIds = useMemo(() => {
    return new Set(user?.likedPostIds || []);
  }, [user]);

  useEffect(() => {
    if (userDomain) {
        const q = query(
            collection(db, "posts"),
            where("collegeDomain", "==", userDomain),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date() 
            })) as Post[];
            
            setPosts(fetchedPosts);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching community posts:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [userDomain]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return posts.filter(post => 
      post.authorName?.toLowerCase().includes(lowerSearchTerm) ||
      post.title?.toLowerCase().includes(lowerSearchTerm) ||
      post.content?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [posts, searchTerm]);

  // Helper to render individual post items
  const renderPost = (index: number, post: Post) => {
    const hasLiked = likedPostIds.has(post.id);
    return (
      <div className="pb-4 px-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center mb-3">
              {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200 dark:border-gray-600"/>
              ) : (
                <UserCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mr-3"/>
              )}
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{post.authorName || "Anonymous"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}
                </p>
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2 leading-tight">{post.title}</h2>
            {post.imageUrl && (
              <img src={post.imageUrl} alt={post.title} className="rounded-lg max-w-full h-auto my-3 max-h-96 object-contain bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700" />
            )}
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 mb-4 whitespace-pre-wrap">{post.content}</p>
            
            <div className="flex items-center space-x-6 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button 
                    onClick={() => onToggleLike(post.id)}
                    className={`flex items-center text-sm transition-colors ${hasLiked ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                    <ThumbsUp className={`mr-1.5 w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} /> {post.upvotes || 0}
                </button>
                <button 
                    onClick={() => onNavigateToPostDetail(post)} 
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

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-20 relative transition-colors duration-200 flex flex-col">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-1 flex-shrink-0">
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
      
      {/* Content Area - Virtualized */}
      {loading ? (
        <div className="flex justify-center pt-10">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : filteredPosts.length === 0 ? (
         <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchTerm ? "No posts match your search." : "No posts yet."}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try a different search term." : "Be the first to share something with your college!"}
            </p>
        </div>
      ) : (
        <Virtuoso
          useWindowScroll
          data={filteredPosts}
          itemContent={renderPost}
          className="space-y-4"
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => onOpenModal(ModalType.CREATE_POST)}
        className="fixed bottom-20 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 z-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Community;