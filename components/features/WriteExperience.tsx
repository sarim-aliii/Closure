import React, { useState } from 'react';
import { WriteExperience } from '../../types';
import { auth, db } from '../../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Star from '../icons/Star'



const WriteExperience: React.FC<WriteExperience> = ({ onSubmit, onClose }) => {
  const [experienceText, setExperienceText] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!experienceText.trim() || rating === 0) {
      alert("Please write your experience and select a rating.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to submit.");
        return;
    }

    setIsLoading(true);

    try {
      const emailDomain = user.email ? user.email.split('@')[1].toLowerCase() : 'general';

      await addDoc(collection(db, "testimonials"), {
          studentName: user.displayName || "Anonymous Student",
          avatarUrl: user.photoURL || null,
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
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Share your thoughts about your college life or this app..."
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate your experience</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} filled={star <= rating} onClick={() => !isLoading && setRating(star)} />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !experienceText.trim() || rating === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
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