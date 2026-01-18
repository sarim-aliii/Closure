import React, { useState, useMemo, useEffect } from 'react';
import { Community, Post } from '../../types';
import UserCircle from '../icons/UserCircle';
import Search from '../icons/Search';
import { auth, db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import ThumbsUp from '../icons/ThumbsUp'
import ChatBubble from '../icons/ChatBubble'



const getUserDomain = () => {
    const user = auth.currentUser;
    if (!user || !user.email) return null;
    return user.email.split('@')[1].toLowerCase();
};

const Community: React.FC<Community> = ({ currentUser, onNavigateToPostDetail, likedPostIds, onToggleLike }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDomain, setUserDomain] = useState<string | null>(null);

  useEffect(() => {
    const domain = getUserDomain();
    setUserDomain(domain);

    if (domain) {
        const q = query(
            collection(db, "posts"),
            where("collegeDomain", "==", domain),
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
  }, []);

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

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-1">
        <div className="mb-3 sm:mb-0">
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
      
      {loading ? (
        <div className="flex justify-center pt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
         <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">
              {searchTerm ? "No posts match your search." : "No posts yet."}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try a different search term or clear the search." : "Be the first to share something with your college!"}
            </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const hasLiked = likedPostIds.has(post.id);
            return (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-3">
                  {post.authorAvatarUrl ? (
                    <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full mr-3 object-cover"/>
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">{post.title}</h2>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="rounded-md max-w-full h-auto my-3 max-h-96 object-contain bg-gray-200 dark:bg-gray-700" />
                )}
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 mb-4">{post.content}</p>
                
                <div className="flex items-center space-x-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => onToggleLike(post.id)}
                        className={`flex items-center text-sm ${hasLiked ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                        aria-pressed={hasLiked}
                        aria-label={hasLiked ? `Unlike post, ${post.upvotes} likes` : `Like post, ${post.upvotes} likes`}
                    >
                        <ThumbsUp className="mr-1.5 w-5 h-5" filled={hasLiked} /> {post.upvotes || 0}
                    </button>
                    <button 
                        onClick={() => onNavigateToPostDetail(post.id)}
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        aria-label={`View comments, ${post.commentsCount} comments`}
                    >
                        <ChatBubble className="mr-1.5 w-5 h-5" /> {post.commentsCount || 0} Comments
                    </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default Community;