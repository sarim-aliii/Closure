import React, { useState, useEffect, useRef } from 'react';
import { PostDetailProps, FireStoreComment } from '../../types';
import TopBar from '../layout/TopBar';
import { db } from '../../firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import UserCircle from '../icons/UserCircle';
import Send from '../icons/Send';
import { useUser } from '../../contexts/UserContext'; // Integrated Context

// Removed currentUser from props since it's now in context
const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  const { user } = useUser(); // Access global user state
  const [comments, setComments] = useState<FireStoreComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom when comments change
  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !user || !post?.id) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        text: newComment.trim(),
        authorId: user.id,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl || null,
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
      <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <TopBar title="Post Not Found" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Sorry, the post could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <TopBar title="Discussion" onBackClick={onBack} showBackButton={true} showMenuButton={false} />
      
      <div className="flex-grow overflow-y-auto pb-24 custom-scrollbar">
        {/* POST CONTENT */}
        <div className="bg-white dark:bg-gray-800 p-5 mb-2 shadow-sm border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-3">
                {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200 dark:border-gray-600"/>
                ) : (
                <UserCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mr-3" />
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{post.authorName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}
                  </p>
                </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3 leading-tight">{post.title}</h1>
            
            {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="rounded-lg max-w-full h-auto my-4 max-h-[50vh] object-contain bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-600" />
            )}

            <p className="text-gray-700 dark:text-gray-300 text-md whitespace-pre-wrap leading-relaxed">{post.content}</p>
            
             <div className="flex items-center space-x-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{post.upvotes} Likes</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{comments.length} Comments</span>
            </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
            Comments
          </h2>
          
          {comments.length === 0 ? (
             <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <p>No comments yet. Be the first to reply!</p>
             </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                   {/* Avatar */}
                   <div className="flex-shrink-0">
                      {comment.authorAvatarUrl ? (
                         <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                      ) : (
                         <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            {comment.authorName ? comment.authorName.charAt(0) : 'U'}
                         </div>
                      )}
                   </div>
                   
                   {/* Bubble */}
                   <div className="flex-grow">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-baseline mb-1">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.authorName}</span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {/* Safe date handling for Firestore Timestamp */}
                                {comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                              </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug whitespace-pre-wrap">{comment.text}</p>
                      </div>
                   </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* COMMENT INPUT (Sticky Bottom) */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 fixed bottom-0 w-full flex items-center z-20 safe-area-bottom">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none mr-2 placeholder-gray-500 dark:placeholder-gray-400"
          onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
          disabled={isSubmitting}
        />
        <button
          onClick={handleSendComment}
          disabled={!newComment.trim() || isSubmitting}
          className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
             newComment.trim() && !isSubmitting
             ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
             : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
           <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostDetail;