import React from 'react';
import { ViewFreeMaterialContentProps } from '../../types';


interface ExtendedViewFreeMaterialProps extends ViewFreeMaterialContentProps {
  onClose?: () => void;
}

const ViewFreeMaterialContent: React.FC<ExtendedViewFreeMaterialProps> = ({ title, content, onClose }) => {
  return (
    <div className="p-1 flex flex-col h-full max-h-[80vh]">
      {/* Article Header */}
      <div className="mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {title}
        </h3>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-4">
        <div 
            className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
        >
            {content}
        </div>
      </div>

      {/* Close Action */}
      <div className="pt-2 mt-auto border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewFreeMaterialContent;