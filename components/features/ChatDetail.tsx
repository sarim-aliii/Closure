import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatDetailProps } from '../../types';
import ArrowLeft from '../icons/ArrowLeft';
import { auth, db, storage } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import Image from '../icons/Image'
import Send from '../icons/Send'



interface ExtendedChatDetail extends ChatDetailProps {
  currentUserId?: string;
}

const ChatDetail: React.FC<ExtendedChatDetail> = ({ 
  conversationId, 
  onBack, 
  initialConversation, 
  currentUserId 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otherParticipant = initialConversation?.participants.find(p => p.id !== currentUserId);
  const conversationName = otherParticipant?.name || "Chat";
  const conversationAvatar = otherParticipant?.avatarUrl;

  useEffect(() => {
    if (!conversationId) return;
    const q = query(
        collection(db, "chats", conversationId, "messages"),
        orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
        })) as ChatMessage[];
        
        setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText(''); 

    try {
        await addDoc(collection(db, "chats", conversationId, "messages"), {
            text: textToSend,
            senderId: auth.currentUser?.uid,
            timestamp: serverTimestamp(),
            type: 'text'
        });

        const chatRef = doc(db, "chats", conversationId);
        await updateDoc(chatRef, {
            lastMessage: textToSend,
            lastMessageTimestamp: serverTimestamp(),
            lastSenderId: auth.currentUser?.uid
        });

    } catch (error) {
        console.error("Error sending message:", error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && auth.currentUser) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
            const imageName = `${Date.now()}_chat_image`;
            const imageRef = ref(storage, `chat_images/${conversationId}/${imageName}`);
            await uploadString(imageRef, base64String, 'data_url');
            const downloadUrl = await getDownloadURL(imageRef);

            await addDoc(collection(db, "chats", conversationId, "messages"), {
                imageUrl: downloadUrl,
                senderId: auth.currentUser?.uid,
                timestamp: serverTimestamp(),
                type: 'image'
            });

            const chatRef = doc(db, "chats", conversationId);
            await updateDoc(chatRef, {
                lastMessage: "📷 Image",
                lastMessageTimestamp: serverTimestamp(),
                lastSenderId: auth.currentUser?.uid
            });

        } catch (error) {
            console.error("Error uploading image:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center shadow-sm z-10">
        <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
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
          <Image className="w-6 h-6" />
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
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatDetail;