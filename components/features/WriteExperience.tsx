import React, { useState } from 'react';
import { WriteExperienceProps } from '../../types';
import { db } from '../../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Star from '../icons/Star';
import { useUser } from '../../contexts/UserContext'; // Integrated Context

const WriteExperience: React.FC<WriteExperienceProps> = ({ onSubmit, onClose }) => {
  const { user } = useUser(); // Access global user state
  const [experienceText, setExperienceText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // For better star interaction
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!experienceText.trim() || rating === 0) {
      alert("Please write your experience and select a rating.");
      return;
    }

    if (!user) {
        alert("You must be logged in to submit.");
        return;
    }

    setIsLoading(true);

    try {
      const emailDomain = user.email ? user.email.split('@')[1].toLowerCase() : 'general';

      await addDoc(collection(db, "testimonials"), {
          studentName: user.name || "Anonymous Student",
          avatarUrl: user.avatarUrl || null,
          course: emailDomain, 
          testimonialText: experienceText.trim(),
          rating: rating,
          collegeDomain: emailDomain,
          timestamp: serverTimestamp()
      });

      if (onSubmit) {
          onSubmit(experienceText, rating);
      }

      onClose();

    } catch (error) {
      console.error("Error submitting testimonial:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-1">
      <div className="mb-4">
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Experience</label>
        <textarea
          id="experience"
          rows={4}
          value={experienceText}
          onChange={(e) => setExperienceText(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          placeholder="Share your thoughts about your college life or this app..."
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate your experience</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                onClick={() => !isLoading && setRating(star)}
                onMouseEnter={() => !isLoading && setHoverRating(star)}
                onMouseLeave={() => !isLoading && setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                disabled={isLoading}
            >
                <Star 
                    filled={star <= (hoverRating || rating)} 
                    className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !experienceText.trim() || rating === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
        >
          {isLoading ? (
             <>
               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Submitting...
             </>
          ) : 'Submit Experience'}
        </button>
      </div>
    </div>
  );
};

export default WriteExperience;