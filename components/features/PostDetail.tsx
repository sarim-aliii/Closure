import React from 'react';
import { PostDetailScreenProps } from '../../types';
import TopBar from '../layout/TopBar';


const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ post, currentUser, onBack, onAddComment, onToggleLikeComment, likedCommentIds }) => {
  if (!post) {
    return (
      <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        <TopBar title="Post Not Found" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Sorry, the post could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <TopBar title="Post Details" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 mb-6">
            <div className="flex items-center mb-3">
                {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full mr-3 object-cover"/>
                ) : (
                <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-semibold">
                    {post.authorName.substring(0,1)}
                </div>
                )}
                <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{post.authorName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.timestamp).toLocaleString()}</p>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3">{post.title}</h1>
            
            {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="rounded-md max-w-full h-auto my-4 max-h-[50vh] object-contain bg-gray-200 dark:bg-gray-700" />
            )}

            <p className="text-gray-700 dark:text-gray-300 text-md whitespace-pre-wrap">{post.content}</p>
            
             <div className="flex items-center space-x-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.upvotes} Likes</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.commentsCount} Comments</span>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Comments</h2>
          <p className="text-gray-500 dark:text-gray-400">Comments functionality will be implemented here.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Users will be able to view, add, and reply to comments in threads.</p>
        </div>
      </div>
    </div>
  );
};

export default PostDetailScreen;
