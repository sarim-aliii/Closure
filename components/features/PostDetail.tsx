import React, { useState, useEffect } from 'react';
import { PostDetail, Comment, FireStoreComment } from '../../types';
import TopBar from '../layout/TopBar';
import { auth, db } from '../../firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import UserCircle from '../icons/UserCircle';
import Send from '../icons/Send';




const PostDetail: React.FC<PostDetail> = ({ post, currentUser, onBack }) => {
  const [comments, setComments] = useState<FireStoreComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!post?.id) return;

    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FireStoreComment[];
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [post?.id]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUser || !post?.id) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        text: newComment.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatarUrl: currentUser.avatarUrl || null,
        timestamp: serverTimestamp()
      });

      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <TopBar title="Discussion" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow overflow-y-auto pb-20">
        {/* POST CONTENT */}
        <div className="bg-white dark:bg-gray-800 p-5 mb-2 shadow-sm">
            <div className="flex items-center mb-3">
                {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full mr-3 object-cover"/>
                ) : (
                <UserCircle className="w-10 h-10 text-gray-400 mr-3" />
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{post.authorName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}
                  </p>
                </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">{post.title}</h1>
            
            {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="rounded-md max-w-full h-auto my-4 max-h-[50vh] object-contain bg-gray-200 dark:bg-gray-700" />
            )}

            <p className="text-gray-700 dark:text-gray-300 text-md whitespace-pre-wrap leading-relaxed">{post.content}</p>
            
             <div className="flex items-center space-x-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{post.upvotes} Likes</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{comments.length} Comments</span>
            </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Comments
          </h2>
          
          {comments.length === 0 ? (
             <div className="text-center py-8 text-gray-400">
                <p>No comments yet. Be the first to reply!</p>
             </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                   {/* Avatar */}
                   <div className="flex-shrink-0">
                      {comment.authorAvatarUrl ? (
                         <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                         <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            {comment.authorName.charAt(0)}
                         </div>
                      )}
                   </div>
                   
                   {/* Bubble */}
                   <div className="flex-grow">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm">
                          <div className="flex justify-between items-baseline mb-1">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.authorName}</span>
                              <span className="text-xs text-gray-400">
                                {comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                              </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COMMENT INPUT (Sticky Bottom) */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 fixed bottom-0 w-full flex items-center z-10">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none mr-2"
          onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
          disabled={isSubmitting}
        />
        <button
          onClick={handleSendComment}
          disabled={!newComment.trim() || isSubmitting}
          className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
             newComment.trim() && !isSubmitting
             ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
             : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
           <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostDetail;