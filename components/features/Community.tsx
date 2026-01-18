import React, { useState, useMemo } from 'react';
import { CommunityScreenProps } from '../../types';
import UserCircleIcon from '../icons/UserCircle';
import SearchIcon from '../icons/Search';


const ThumbsUpIcon: React.FC<{ className?: string, filled?: boolean }> = ({ className = "w-4 h-4", filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {filled ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.425 2.031-1.085A9.06 9.06 0 018.537 9h.031c.892 0 1.783-.153 2.575-.448A9.037 9.037 0 0112 8.05c.892 0 1.783.153 2.575.448A9.037 9.037 0 0115.463 9h.031c.892 0 1.783-.153 2.575-.448A9.037 9.037 0 0119.5 8.05c.448 0 .878.047 1.293.139.53.114 1.023.296 1.458.539a.75.75 0 01.458.975 10.497 10.497 0 01-2.03 4.041 9.037 9.037 0 01-1.964 2.025 9.037 9.037 0 01-2.025 1.235c-.86.495-1.815.75-2.828.75s-1.968-.255-2.828-.75a9.037 9.037 0 01-2.025-1.235 9.037 9.037 0 01-1.964-2.025A10.497 10.497 0 013.75 9.713a.75.75 0 01.458-.975c.435-.243.928-.425 1.458-.539A12.028 12.028 0 016.633 10.5zM14.25 15.75a3 3 0 11-6 0 3 3 0 016 0z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.425 2.031-1.085A9.06 9.06 0 018.537 9h.031c.892 0 1.783-.153 2.575-.448A9.037 9.037 0 0112 8.05c.892 0 1.783.153 2.575.448A9.037 9.037 0 0115.463 9h.031c.892 0 1.783-.153 2.575-.448A9.037 9.037 0 0119.5 8.05c.448 0 .878.047 1.293.139.53.114 1.023.296 1.458.539a.75.75 0 01.458.975 10.497 10.497 0 01-2.03 4.041 9.037 9.037 0 01-1.964 2.025 9.037 9.037 0 01-2.025 1.235c-.86.495-1.815.75-2.828.75s-1.968-.255-2.828-.75a9.037 9.037 0 01-2.025-1.235 9.037 9.037 0 01-1.964-2.025A10.497 10.497 0 013.75 9.713a.75.75 0 01.458-.975c.435-.243.928-.425 1.458-.539A12.028 12.028 0 016.633 10.5zM14.25 15.75a3 3 0 11-6 0 3 3 0 016 0z" />
    )}
  </svg>
);

const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443h2.284M19.5 12.76c0-1.6-1.123-2.994-2.707-3.227A48.344 48.344 0 0013.5 9.185V6L9.424 9.924a1.526 1.526 0 00-1.037.443H6.113M15 9.75a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);


const CommunityScreen: React.FC<CommunityScreenProps> = ({ posts, currentUser, onNavigateToPostDetail, likedPostIds, onToggleLike }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts.slice().reverse();
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return posts.filter(post => 
      post.authorName.toLowerCase().includes(lowerSearchTerm) ||
      post.title.toLowerCase().includes(lowerSearchTerm) ||
      post.content.toLowerCase().includes(lowerSearchTerm)
    ).slice().reverse();
  }, [posts, searchTerm]);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-1">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-0">Community Feed</h1>
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400 dark:text-gray-500 w-5 h-5" />
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
      
      {filteredPosts.length === 0 ? (
         <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">
              {searchTerm ? "No posts match your search." : "No posts yet."}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? "Try a different search term or clear the search." : "Be the first to share something with the community!"}
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
                    <UserCircleIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 mr-3"/>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{post.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.timestamp).toLocaleString()}</p>
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
                        <ThumbsUpIcon className="mr-1.5 w-5 h-5" filled={hasLiked} /> {post.upvotes}
                    </button>
                    <button 
                        onClick={() => onNavigateToPostDetail(post.id)}
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        aria-label={`View comments, ${post.commentsCount} comments`}
                    >
                        <ChatBubbleIcon className="mr-1.5 w-5 h-5" /> {post.commentsCount} Comments
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

export default CommunityScreen;