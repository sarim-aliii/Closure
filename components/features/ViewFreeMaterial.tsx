import React from 'react';
import { ViewFreeMaterialContentModalProps } from '../../types'


const ViewFreeMaterialContentModal: React.FC<ViewFreeMaterialContentModalProps> = ({ title, content }) => {
  return (
    <div className="p-1 space-y-3 text-sm text-gray-700 dark:text-gray-300">
      <div 
        className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded-md leading-relaxed"
      >
        {content}
      </div>
    </div>
  );
};

export default ViewFreeMaterialContentModal;
