import React from 'react';
import { ViewFreeMaterialContentProps } from '../../types';

interface ExtendedViewFreeMaterial extends ViewFreeMaterialContentProps {
  onClose?: () => void;
}

const ViewFreeMaterialContent: React.FC<ExtendedViewFreeMaterial> = ({ title, content, onClose }) => {
  return (
    <div className="p-1 space-y-4 text-sm text-gray-700 dark:text-gray-300">
      {/* Scrollable Content Area */}
      <div 
        className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar"
      >
        {content}
      </div>

      {/* Close Action */}
      <div className="pt-2">
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