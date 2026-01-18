import React, { useState } from 'react';
import { WriteExperienceScreenProps } from '../../types'



const StarIcon: React.FC<{ filled: boolean; onClick: () => void; className?: string }> = ({ filled, onClick, className="w-6 h-6" }) => (
  <svg onClick={onClick} className={`${className} cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const WriteExperienceScreen: React.FC<WriteExperienceScreenProps> = ({ onSubmit, onClose }) => {
  const [experienceText, setExperienceText] = useState('');
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!experienceText.trim() || rating === 0) {
      alert("Please write your experience and select a rating.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onSubmit(experienceText, rating);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="p-1">
      <div className="mb-4">
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Your Experience</label>
        <textarea
          id="experience"
          rows={4}
          value={experienceText}
          onChange={(e) => setExperienceText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Share your thoughts..."
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate your experience</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= rating} onClick={() => setRating(star)} />
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !experienceText.trim() || rating === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Experience'}
        </button>
      </div>
    </div>
  );
};

export default WriteExperienceScreen;