import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatDetailScreenProps } from '../../types';
import ArrowLeftIcon from '../icons/ArrowLeft'; // Ensure you have this or replace with SVG

// Extend props locally to include currentUserId since it's needed for UI logic (Left vs Right bubble)
interface ExtendedChatDetailProps extends ChatDetailScreenProps {
  currentUserId?: string;
}

const ImageIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.158 0a.225.225 0 01.225-.225h.008a.225.225 0 01.225.225v.008a.225.225 0 01-.225.225h-.008a.225.225 0 01-.225-.225V8.25z" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const ChatDetailScreen: React.FC<ExtendedChatDetailProps> = ({ 
  conversationId, 
  onBack, 
  initialConversation, 
  onSendMessage,
  currentUserId 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialConversation?.messages || []);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identify the other participant for the header title
  const otherParticipant = initialConversation?.participants.find(p => p.id !== currentUserId);
  const conversationName = otherParticipant?.name || "Chat";
  const conversationAvatar = otherParticipant?.avatarUrl;

  // Load Mock data if no conversation exists (Dev only)
  useEffect(() => {
    if (!initialConversation && messages.length === 0) {
      const mockMessages: ChatMessage[] = [
        { 
            id: '1', 
            senderId: 'other_user', 
            text: `Hello! This is chat ${conversationId}.`, 
            timestamp: new Date(Date.now() - 100000).toISOString() 
        },
        { 
            id: '2', 
            senderId: currentUserId || 'me', 
            text: 'Hi there!', 
            timestamp: new Date(Date.now() - 50000).toISOString() 
        },
      ];
      setMessages(mockMessages);
    } else if (initialConversation) {
        setMessages(initialConversation.messages);
    }
  }, [conversationId, initialConversation, currentUserId, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const timestamp = new Date().toISOString();
      
      // We don't update state directly here usually, assuming the parent updates props
      // But for optimistic UI updates:
      const optimisticMsg: ChatMessage = {
          id: String(Date.now()),
          senderId: currentUserId || 'temp_user',
          text: inputText.trim(),
          timestamp: timestamp
      };
      setMessages(prev => [...prev, optimisticMsg]);

      onSendMessage(conversationId, { 
          text: inputText.trim(), 
          senderId: currentUserId || 'temp_user',
          timestamp: timestamp
      });
      
      setInputText('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const timestamp = new Date().toISOString();
        
        onSendMessage(conversationId, { 
            imageUrl: result, 
            senderId: currentUserId || 'temp_user',
            timestamp: timestamp
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center shadow-sm z-10">
        <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center">
            {conversationAvatar ? (
                <img src={conversationAvatar} alt={conversationName} className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200 dark:border-gray-600" />
            ) : (
                <div className="w-10 h-10 rounded-full mr-3 bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {conversationName.charAt(0)}
                </div>
            )}
            <div>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">{conversationName}</h1>
                <span className="text-xs text-green-500 font-medium">Online</span>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {/* Message Bubble */}
                    <div className={`max-w-[75%] lg:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl shadow-sm break-words ${
                            isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                        }`}>
                            {msg.text && <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>}
                            {msg.imageUrl && (
                                <img src={msg.imageUrl} alt="Attachment" className="rounded-lg mt-1 max-h-60 w-full object-cover" />
                            )}
                        </div>
                        
                        {/* Timestamp */}
                        <span className={`text-[10px] mt-1 px-1 ${
                            isMe ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex items-end space-x-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Attach image"
        >
          <ImageIcon className="w-6 h-6" />
        </button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        
        <div className="flex-grow relative">
            <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
            placeholder="Type a message..."
            rows={1}
            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none overflow-hidden"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            />
        </div>

        <button 
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
              inputText.trim() 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatDetailScreen;