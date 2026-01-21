import React, { useState, useRef } from 'react';
import { storage, db } from '../../firebase'; 
import { ref, uploadString, getDownloadURL, UploadMetadata } from "firebase/storage";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { CreatePostProps } from '../../types';
import Photo from '../icons/Photo';
import XCircle from '../icons/XCircle';
import { useUser } from '../../contexts/UserContext'; 

// Helper to resize image client-side
const generateThumbnail = (base64String: string, maxWidth = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      // Calculate new dimensions
      const scaleFactor = maxWidth / img.width;
      const newWidth = maxWidth;
      const newHeight = img.height * scaleFactor;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Export as JPEG with 0.7 quality
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = (error) => reject(error);
  });
};

const CreatePost: React.FC<CreatePostProps> = ({ onSubmit, onClose }) => {
  const { user, firebaseUser } = useUser(); 
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Increased to 5MB since we resize client-side
        alert("Image size should not exceed 5MB.");
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
    
    if (!user || !firebaseUser) {
        alert("You must be logged in to post.");
        return;
    }

    setIsLoading(true);
    let uploadedImageUrl: string | null = null;
    let uploadedThumbnailUrl: string | null = null;

    try {
      const newPostRef = doc(collection(db, "posts"));
      const postId = newPostRef.id;

      // --- CLIENT-SIDE RESIZING & UPLOAD ---
      if (imageBase64) {
        const timestamp = Date.now();
        const originalName = `${timestamp}_original`;
        const thumbName = `${timestamp}_thumb`;

        // 1. Upload Original
        const imageRef = ref(storage, `posts/${postId}/${originalName}`);
        await uploadString(imageRef, imageBase64, 'data_url');
        uploadedImageUrl = await getDownloadURL(imageRef);

        // 2. Generate & Upload Thumbnail
        try {
            const thumbBase64 = await generateThumbnail(imageBase64, 300); // Resize to 300px width
            const thumbRef = ref(storage, `posts/${postId}/${thumbName}`);
            await uploadString(thumbRef, thumbBase64, 'data_url');
            uploadedThumbnailUrl = await getDownloadURL(thumbRef);
        } catch (resizeError) {
            console.warn("Thumbnail generation failed, using original as fallback", resizeError);
            uploadedThumbnailUrl = uploadedImageUrl; // Fallback
        }
      }
      
      const collegeDomain = user.email ? user.email.split('@')[1].toLowerCase() : 'general';

      // 3. Save to Firestore (Both URLs immediately available!)
      await setDoc(newPostRef, {
          title: title.trim(),
          content: content.trim(),
          imageUrl: uploadedImageUrl,
          thumbnailUrl: uploadedThumbnailUrl, 
          collegeDomain: collegeDomain,
          authorId: firebaseUser.uid,
          authorName: user.name || "Anonymous Student", 
          authorEmail: user.email,
          authorAvatarUrl: user.avatarUrl || null,
          isAnonymous: false,
          upvotes: 0,
          commentCount: 0,
          timestamp: serverTimestamp()
      });

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
          className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
          className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Share your thoughts in detail..."
          disabled={isLoading}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="postImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Photo className="w-4 h-4" /> Add Image (Optional, max 5MB)
        </label>
        
        <input
          type="file"
          id="postImage"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/gif"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2.5 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300
            hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800
            cursor-pointer"
          disabled={isLoading}
        />
        
        {imagePreview && (
          <div className="mt-4 relative inline-block">
            <img src={imagePreview} alt="Selected preview" className="max-h-40 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm" />
            <button 
                onClick={removeImage}
                disabled={isLoading}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                aria-label="Remove image"
            >
                <XCircle className="w-4 h-4"/>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || !content.trim()}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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