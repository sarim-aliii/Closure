import React, { useState, useEffect, useMemo } from 'react';
import { ModalType, HomeProps, Post, AppView } from '../../types';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import Calendar from '../icons/Calendar';
import Location from '../icons/Location';
import ChatBubble from '../icons/ChatBubble';
import ArrowUp from '../icons/ArrowUp';
import ArrowDown from '../icons/ArrowDown';
import { useUser } from '../../contexts/UserContext';

interface ExtendedHomeProps extends HomeProps {
  onNavigate?: (view: AppView, data?: any) => void;
}

const Home: React.FC<ExtendedHomeProps> = ({ onOpenModal, announcements, events, onNavigate }) => {
  const { user } = useUser(); // Access global user state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive domain from user context
  const userDomain = useMemo(() => {
    return user?.email ? user.email.split('@')[1].toLowerCase() : null;
  }, [user]);

  useEffect(() => {
    if (userDomain) {
      const q = query(
        collection(db, "posts"),
        where("collegeDomain", "==", userDomain), // Filter by college
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setPosts(fetchedPosts);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [userDomain]);

  const handleVote = async (postId: string, amount: number) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        upvotes: increment(amount)
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16 transition-colors duration-200">

      {/* 1. Create Post Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 overflow-hidden border-l-4 border-indigo-500 transition-colors duration-200">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0 md:mr-4 w-full">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Campus Discussion</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Viewing feeds for: <span className="font-bold text-indigo-600 dark:text-indigo-400">@{userDomain || 'Guest'}</span>
            </p>
            <button
              onClick={() => onOpenModal(ModalType.CREATE_POST)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              What's on your mind?
            </button>
          </div>
        </div>
      </div>

      {/* 2. Announcements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 px-1">Announcements</h3>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map(announcement => (
              <div key={announcement.id} onClick={() => onOpenModal(ModalType.ANNOUNCEMENT_DETAIL, announcement)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-orange-400 dark:border-orange-500">
                <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-1">{announcement.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{announcement.date}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{announcement.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">No new announcements.</p>
        )}
      </div>

      {/* 3. Upcoming Events */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 px-1">Upcoming Events</h3>
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} onClick={() => onOpenModal(ModalType.EVENT_DETAIL, event)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-green-500">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">{event.title}</h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 space-x-3">
                  <span className="flex items-center"><Calendar className="mr-1 w-4 h-4 text-gray-400 dark:text-gray-500" /> {event.date} at {event.time}</span>
                  <span className="flex items-center"><Location className="mr-1 w-4 h-4 text-gray-400 dark:text-gray-500" /> {event.location}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">No upcoming events scheduled.</p>
        )}
      </div>

      {/* 4. DYNAMIC POSTS FEED */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 px-1">Recent Discussions</h3>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading campus feed...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
                onClick={() => onNavigate && onNavigate(AppView.POST_DETAIL, { postId: post.id })}
              >
                <h4 className="text-md font-bold text-gray-900 dark:text-white mb-2 leading-tight">{post.title}</h4>

                {(post.thumbnailUrl || post.imageUrl) && (
                  <div className="mb-3">
                    <img
                      src={post.thumbnailUrl || post.imageUrl}
                      alt="Post attachment"
                      className="w-full h-48 object-cover rounded-md bg-gray-100 dark:bg-gray-700"
                      loading="lazy"
                    />
                  </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                
                {/* Post Header */}
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3 shadow-sm">
                    {post.isAnonymous ? '?' : (post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {post.isAnonymous ? "Anonymous Student" : post.authorName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Posted recently
                    </p>
                  </div>
                </div>

                {/* Content */}
                <h4 className="text-md font-bold text-gray-900 dark:text-white mb-2 leading-tight">{post.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.content}</p>

                {/* Action Bar */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700/50 rounded-full px-1 py-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleVote(post.id, 1)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full hover:text-orange-500 text-gray-400 transition-colors"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-6 text-center">{post.upvotes || 0}</span>
                    <button
                      onClick={() => handleVote(post.id, -1)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full hover:text-indigo-500 text-gray-400 transition-colors"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>

                  <button className="flex items-center space-x-1.5 text-gray-500 hover:text-indigo-600 transition-colors py-1 px-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                    <ChatBubble className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.commentsCount || 0} Comments</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">No discussions here yet!</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Be the first to start a thread for {userDomain}.</p>
            <button onClick={() => onOpenModal(ModalType.CREATE_POST)} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline focus:outline-none">Create a Post</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;