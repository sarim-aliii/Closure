
import React, { useState, useRef } from 'react';
import { storage } from '../../firebase'; // Assuming firebase.ts is at this path and exports compat storage
// serverTimestamp import is not directly used here, but it's used in App.tsx which this component calls.

// Placeholder Icon for image upload
const PhotoIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.158 0a.225.225 0 01.225-.225h.008a.225.225 0 01.225.225v.008a.225.225 0 01-.225-.225h-.008a.225.225 0 01-.225-.225V8.25z" />
    </svg>
);

const XCircleIcon: React.FC<{className?: string}> = ({className = "w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface CreatePostModalContentProps {
  onSubmit: (title: string, content: string, imageUrl?: string) => Promise<void>;
  onClose: () => void;
  currentUserId?: string | null;
}

const CreatePostModalContent: React.FC<CreatePostModalContentProps> = ({ onSubmit, onClose, currentUserId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image size should not exceed 2MB."); // Consider replacing alert with a less disruptive notification
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
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
    setIsLoading(true);
    let uploadedImageUrl: string | undefined = undefined;

    try {
      if (imageBase64) {
        if (!currentUserId) {
          console.error("User ID is not available for image upload.");
          // Throwing an error here ensures it's caught by the catch block,
          // and the finally block will reset isLoading.
          throw new Error("User not authenticated for image upload.");
        }
        const imageName = `${Date.now()}_post_image`;
        const imageStorageRef = storage.ref(`post_images/${currentUserId}/${imageName}`);
        
        await imageStorageRef.putString(imageBase64, 'data_url');
        uploadedImageUrl = await imageStorageRef.getDownloadURL();
      }
      
      await onSubmit(title, content, uploadedImageUrl); 

    } catch (error) {
      console.error("Error in CreatePostModalContent handleSubmit: ", error);
      // User-facing error messages for post creation (including image upload failures that lead here)
      // should ideally be handled by App.tsx's onSubmit, which has addPopupMessage.
      // If image upload fails and this catch block is hit, onSubmit might not have been called,
      // so a generic error popup in App.tsx might be needed if this component cannot show one.
      // For now, the console log is important, and the 'finally' block is crucial.
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="p-1">
      <div className="mb-4">
        <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Post Title
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
          Your Content
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
        <label htmlFor="postImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Add Image (Optional, max 2MB)
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
          <div className="mt-3 relative">
            <img src={imagePreview} alt="Selected preview" className="max-h-40 rounded-md border border-gray-300 dark:border-gray-600" />
            <button 
                onClick={removeImage}
                disabled={isLoading}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75 disabled:opacity-50"
                aria-label="Remove image"
            >
                <XCircleIcon className="w-5 h-5"/>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || !content.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Posting...' : 'Create Post'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostModalContent;