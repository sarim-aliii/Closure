
import React, { useState, useRef, useEffect } from 'react';
import { ChatConversation, ChatMessage } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface ChatDetailScreenProps {
  conversationId: string; // To fetch or identify the conversation
  onBack: () => void;
  // For now, mock conversation data will be handled internally or passed
  initialConversation?: ChatConversation; 
  onSendMessage: (chatId: string, message: Partial<ChatMessage>) => void;
}

// Placeholder Image Icon
const ImageIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.158 0a.225.225 0 01.225-.225h.008a.225.225 0 01.225.225v.008a.225.225 0 01-.225.225h-.008a.225.225 0 01-.225-.225V8.25z" />
  </svg>
);


const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ conversationId, onBack, initialConversation, onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialConversation?.messages || []);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversationName = initialConversation?.participants.map(p => p.name).join(', ') || "Chat";

  useEffect(() => {
    // Simulate fetching messages if not provided initially
    if (!initialConversation) {
      // Mock fetching logic
      const mockMessages: ChatMessage[] = [
        { id: '1', sender: 'other', text: `Hello! This is chat ${conversationId}.`, timestamp: new Date(Date.now() - 100000) },
        { id: '2', sender: 'user', text: 'Hi there!', timestamp: new Date(Date.now() - 50000) },
      ];
      setMessages(mockMessages);
    }
  }, [conversationId, initialConversation]);

 useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: String(Date.now()),
        sender: 'user',
        text: inputText.trim(),
        timestamp: new Date(),
      };
      onSendMessage(conversationId, { text: inputText.trim(), sender: 'user' }); // App.tsx updates the actual store
      setInputText('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSendMessage(conversationId, { imageUrl: reader.result as string, sender: 'user'});
      };
      reader.readAsDataURL(file);
    }
  };
  
  // This effect will update local messages when the global store changes (via onSendMessage prop)
  useEffect(() => {
    if (initialConversation) {
        setMessages(initialConversation.messages);
    }
  }, [initialConversation]);


  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="bg-indigo-700 dark:bg-indigo-800 text-white p-4 flex items-center shadow-md">
        <button onClick={onBack} className="mr-3 p-1">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold truncate">{conversationName}</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'}`}>
              {msg.text && <p>{msg.text}</p>}
              {msg.imageUrl && <img src={msg.imageUrl} alt="Chat image" className="rounded-md max-w-full h-auto mt-1 max-h-60 object-contain" />}
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'} text-right`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-3 flex items-center space-x-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          aria-label="Attach image"
        >
          <ImageIcon className="w-6 h-6" />
        </button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-grow p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button 
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
