import React from 'react';

const SkeletonPost: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 animate-pulse">
      {/* Header: Avatar + Name/Date */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
      
      {/* Title */}
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      
      {/* Content Lines */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Footer: Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
};

export default SkeletonPost;