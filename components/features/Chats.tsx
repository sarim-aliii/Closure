import React, { useState, useEffect } from 'react';
import Search from '../icons/Search';
import UserCircle from '../icons/UserCircle';
import { ChatsProps, AppView, ChatConversation } from '../../types';
import { db } from '../../firebase'; 
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useUser } from '../../contexts/UserContext';

const Chats: React.FC<ChatsProps> = ({ onNavigate }) => {
  const { firebaseUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const q = query(
      collection(db, "chats"),
      where("participantIds", "array-contains", firebaseUser.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats = snapshot.docs.map(doc => {
        const data = doc.data();
        const otherParticipantId = data.participantIds.find((id: string) => id !== firebaseUser.uid);
        
        // 1. Get timestamps safely
        // Note: Firestore Timestamps need .toDate() to be comparable in JS
        const lastMsgDate = data.lastMessageTimestamp?.toDate();
        const myLastReadDate = data.lastReadTimestamps?.[firebaseUser.uid]?.toDate();

        // 2. Calculate Unread Status
        // If we have never read it (myLastReadDate is undefined), 
        // OR the last message is newer than our last read time.
        let isUnread = false;
        if (lastMsgDate) {
            if (!myLastReadDate) {
                isUnread = true;
            } else {
                isUnread = lastMsgDate > myLastReadDate;
            }
        }

        return {
          id: doc.id,
          participants: [{
             id: otherParticipantId,
             name: data.participantNames?.[otherParticipantId] || "User",
             avatarUrl: data.participantAvatars?.[otherParticipantId] || null
          }],
          lastMessagePreview: data.lastMessage || "No messages yet",
          lastMessageTimestamp: lastMsgDate,
          // 3. Set Count (Simple boolean logic: 1 if unread, 0 if read)
          unreadCount: isUnread ? 1 : 0, 
          // Store the map in case we need it later, though not strictly necessary for the list view
          lastReadTimestamps: data.lastReadTimestamps || {}
        };
      }) as ChatConversation[];

      setConversations(fetchedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const filteredConversations = conversations.filter(convo => 
    convo.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    convo.lastMessagePreview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-full flex flex-col h-full transition-colors duration-200">
      {/* Search Bar */}
      <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400 dark:text-gray-500 w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by name or message"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 pl-10 pr-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-grow p-3 space-y-3 overflow-y-auto custom-scrollbar">
        <div className="px-2 py-1">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Messages</h3>
        </div>
        
        {loading ? (
             <div className="flex justify-center pt-10">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             </div>
        ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-10 text-gray-500 dark:text-gray-400">
                <p>No chats found.</p>
            </div>
        ) : (
            filteredConversations.map(convo => (
                <div 
                    key={convo.id} 
                    onClick={() => onNavigate(AppView.CHAT_DETAIL, { conversationId: convo.id, initialConversation: convo })}
                    className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700"
                >
                    {convo.participants[0]?.avatarUrl ? (
                         <img src={convo.participants[0].avatarUrl} alt={convo.participants[0].name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover border border-gray-200 dark:border-gray-600" />
                    ) : (
                        <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <UserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                    )}
                    <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 truncate text-sm">
                                {convo.participants.map(p => p.name).join(', ') || 'Unknown Chat'}
                            </h4>
                            {convo.lastMessageTimestamp && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                    {new Date(convo.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-start">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2 w-full">
                                {convo.lastMessagePreview || "No messages yet."}
                            </p>
                            {/* Display Unread Badge if count > 0 */}
                            {convo.unreadCount !== undefined && convo.unreadCount > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                                {convo.unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Chats;