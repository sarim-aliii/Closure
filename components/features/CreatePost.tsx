import React, { useState, useRef } from 'react';
import { storage, db, auth } from '../../firebase'; 
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CreatePost } from '../../types';
import Photo from '../icons/Photo'
import XCircle from '../icons/XCircle'


const getDomainFromEmail = (email: string | null | undefined) => {
    if (!email) return 'general';
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : 'general';
};

const CreatePost: React.FC<CreatePost> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("Image size should not exceed 2MB.");
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageBase64(reader.result as string); 
      };
      reader.readAsDataURL(file);
    } else {
        removeImage();
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please provide a title and content for your post.");
      return;
    }
    
    // 2. Validate User is Logged In
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to post.");
        return;
    }

    setIsLoading(true);
    let uploadedImageUrl: string | undefined = undefined;

    try {
      // 3. Image Upload Logic
      if (imageBase64) {
        const imageName = `${Date.now()}_post_image`;
        const imageRef = ref(storage, `post_images/${user.uid}/${imageName}`);
        await uploadString(imageRef, imageBase64, 'data_url');
        uploadedImageUrl = await getDownloadURL(imageRef);
      }
      
      // 4. EXTRACT COLLEGE DOMAIN
      const collegeDomain = getDomainFromEmail(user.email);

      // 5. SAVE TO FIRESTORE
      await addDoc(collection(db, "posts"), {
          title: title.trim(),
          content: content.trim(),
          imageUrl: uploadedImageUrl || null,
          collegeDomain: collegeDomain,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous Student", 
          authorEmail: user.email,
          isAnonymous: false,
          upvotes: 0,
          commentCount: 0,
          timestamp: serverTimestamp()
      });

      // 6. Close Modal on Success
      onClose();

    } catch (error) {
      console.error("Error creating post: ", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="p-1">
      <div className="mb-4">
        <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Post Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="postTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Enter a catchy title"
          disabled={isLoading}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="postContent"
          rows={4} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Share your thoughts in detail..."
          disabled={isLoading}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="postImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
          <Photo className="w-4 h-4" /> Add Image (Optional, max 2MB)
        </label>
        <input
          type="file"
          id="postImage"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/gif"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 dark:file:bg-indigo-800 file:text-indigo-700 dark:file:text-indigo-300
            hover:file:bg-indigo-100 dark:hover:file:bg-indigo-700"
          disabled={isLoading}
        />
        {imagePreview && (
          <div className="mt-3 relative inline-block">
            <img src={imagePreview} alt="Selected preview" className="max-h-40 rounded-md border border-gray-300 dark:border-gray-600" />
            <button 
                onClick={removeImage}
                disabled={isLoading}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                aria-label="Remove image"
            >
                <XCircle className="w-5 h-5"/>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || !content.trim()}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
             <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Posting...
             </span>
          ) : 'Create Post'}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;