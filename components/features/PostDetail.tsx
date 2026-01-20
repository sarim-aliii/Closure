import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Post, FireStoreComment } from '../../types';
import TopBar from '../layout/TopBar';
import { db } from '../../firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, increment, getDoc, Timestamp } from 'firebase/firestore'; 
import UserCircle from '../icons/UserCircle';
import Send from '../icons/Send';
import { useUser } from '../../contexts/UserContext';

interface PostDetailProps {
  onBack: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ onBack }) => {
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const { user } = useUser();
  
  // 1. Initialize state with nav data only if it matches the current URL ID
  const [post, setPost] = useState<Post | null>(() => {
      const statePost = location.state?.post as Post | undefined;
      return statePost && statePost.id === postId ? statePost : null;
  });
  
  const [loadingPost, setLoadingPost] = useState(!post);
  const [comments, setComments] = useState<FireStoreComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 2. Fetch Post Logic (Handles deep links & ID changes)
  useEffect(() => {
    if (!postId) return;

    // Optimization: If we already have the correct post data, skip fetch
    if (post && post.id === postId) {
        setLoadingPost(false);
        return;
    }

    const fetchPost = async () => {
        setLoadingPost(true);
        try {
            const docRef = doc(db, "posts", postId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() } as Post);
            } else {
                setPost(null); // Handle 404
            }
        } catch (err) {
            console.error("Error fetching post:", err);
        } finally {
            setLoadingPost(false);
        }
    };
    fetchPost();
  }, [postId]); 

  // 3. Fetch Comments
  useEffect(() => {
    if (!postId) return;
    const q = query(collection(db, "posts", postId, "comments"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Safe timestamp conversion
          timestamp: doc.data().timestamp
      })) as FireStoreComment[];
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [postId]);

  // Auto-scroll to bottom on new comment
  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !user || !postId) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: newComment.trim(),
        authorId: user.id,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl || null,
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });
      setNewComment('');
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Helper for robust date formatting
  const formatDate = (timestamp: any) => {
      if (!timestamp) return '';
      // Handle Firestore Timestamp, Date object, or ISO string
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  if (loadingPost) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      );
  }

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
        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 p-5 mb-2 shadow-sm border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-3">
                {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200 dark:border-gray-600"/>
                ) : (
                <UserCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mr-3" />
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{post.authorName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.timestamp)}</p>
                </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3 leading-tight">{post.title}</h1>
            
            {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="rounded-lg max-w-full h-auto my-4 max-h-[50vh] object-contain bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-600" />
            )}

            <p className="text-gray-700 dark:text-gray-300 text-md whitespace-pre-wrap leading-relaxed">{post.content}</p>
            
             <div className="flex items-center space-x-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{post.upvotes || 0} Likes</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{comments.length} Comments</span>
            </div>
        </div>
        
        {/* Comments Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">Comments</h2>
          
          {comments.length === 0 ? (
             <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <p>No comments yet. Be the first to reply!</p>
             </div>
          ) : (
          <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                   <div className="flex-shrink-0">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            {comment.authorName ? comment.authorName.charAt(0) : 'U'}
                       </div>
                   </div>
                   <div className="bg-white dark:bg-gray-800 p-3 rounded-xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex-grow">
                      <div className="flex justify-between items-baseline mb-1">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.authorName}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                   </div>
                </div>
              ))}
              <div ref={bottomRef} />
          </div>
          )}
        </div>
      </div>
      
      {/* Input */}
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
            className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${!newComment.trim() || isSubmitting ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'}`}
        >
            <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostDetail;