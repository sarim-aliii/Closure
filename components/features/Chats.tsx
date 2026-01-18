import React, {useState} from 'react';
import SearchIcon from '../icons/Search';
import UserCircleIcon from '../icons/UserCircle';
import { ChatsScreenProps, AppView } from '../../types';


const ChatsScreen: React.FC<ChatsScreenProps> = ({ conversations, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(convo => 
    convo.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    convo.lastMessagePreview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-full flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or message"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full bg-gray-50 border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-grow p-3 space-y-3 overflow-y-auto">
        <div className="px-2 py-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Messages</h3>
        </div>
        
        {filteredConversations.length === 0 ? (
            <p className="text-center text-gray-500 pt-10">No chats found.</p>
        ) : (
            filteredConversations.map(convo => (
                 <div 
                    key={convo.id} 
                    onClick={() => onNavigate(AppView.CHAT_DETAIL, { conversationId: convo.id })}
                    className="bg-white p-3 rounded-lg shadow-sm flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    {convo.participants[0]?.avatarUrl ? (
                         <img src={convo.participants[0].avatarUrl} alt={convo.participants[0].name} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                    ) : (
                        <UserCircleIcon className="w-10 h-10 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800 truncate text-sm">
                            {convo.participants.map(p => p.name).join(', ') || 'Unknown Chat'}
                        </h4>
                        {convo.lastMessageTimestamp && (
                            <span className="text-xs text-gray-500">
                                {new Date(convo.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        </div>
                        <div className="flex justify-between items-start mt-0.5">
                        <p className="text-xs text-gray-600 truncate pr-2">
                            {convo.lastMessagePreview || "No messages yet."}
                        </p>
                        {convo.unreadCount && convo.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0">
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

export default ChatsScreen;